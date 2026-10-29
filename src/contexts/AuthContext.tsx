import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginWithCredentials } from '../lib/db';
import { getOrCreateVisitorDeviceId } from '../lib/cookie';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (id: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserSession: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('appUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.authority === 'guest') {
          // Sync with persistent visitor cookie on this device
          const deviceId = getOrCreateVisitorDeviceId();
          parsed.id = deviceId;
          parsed.uid = deviceId;
        }
        setUser(parsed);
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (id: string, pass: string) => {
    if (id === 'guest') {
      // 来場者の端末にCookieを付与し、一意の端末IDを永続化
      const visitorDeviceId = getOrCreateVisitorDeviceId();
      const guestUser: User = { 
        id: visitorDeviceId, 
        uid: visitorDeviceId, 
        loginId: 'guest', 
        name: '来場者様', 
        authority: 'guest' 
      };
      setUser(guestUser);
      localStorage.setItem('appUser', JSON.stringify(guestUser));
      return;
    }

    try {
      const foundUser = await loginWithCredentials(id, pass);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('appUser', JSON.stringify(foundUser));
      } else {
        // Fallback for initial setup if no DB exists yet
        if (id === 'admin' && pass === 'admin') {
           const adminUser: User = { id: 'admin', uid: 'admin', loginId: 'admin', name: '管理者', authority: 'admin' };
           setUser(adminUser);
           localStorage.setItem('appUser', JSON.stringify(adminUser));
           return;
        }
        if (id === 'student' && pass === 'student') {
           const studentUser: User = { id: 'student', uid: 'student', loginId: 'student', name: '学生（テスト）', authority: 'student' };
           setUser(studentUser);
           localStorage.setItem('appUser', JSON.stringify(studentUser));
           return;
        }
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('appUser');
  };

  const updateUserSession = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('appUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserSession }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
