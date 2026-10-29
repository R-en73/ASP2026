import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User as UserIcon, ArrowRight } from 'lucide-react';

export default function Login() {
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(id, pass);
      navigate('/'); // Redirects to booths inside AppLayout
    } catch (err) {
      setError('IDまたはパスワードが正しくありません。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await login('guest', 'guest');
      navigate('/');
    } catch (err) {
      setError('エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-200 to-transparent rounded-bl-full -z-10 opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-pink-200 to-transparent rounded-tr-full -z-10 opacity-30"></div>

      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 border border-slate-100">
        
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-widest mb-1">
            卒業進級制作展
          </h1>
          <p className="text-[10px] tracking-widest text-slate-400 font-bold uppercase">
            Graduation &amp; Promotion Works Exhibition
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 sm:p-4 bg-pink-50 text-pink-600 rounded-xl text-xs sm:text-sm font-bold border border-pink-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">ログインID</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="IDを入力"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-base sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors min-h-[44px]"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">パスワード</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="パスワードを入力"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-base sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors min-h-[44px]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-bold rounded-xl py-3.5 shadow-md shadow-cyan-500/20 hover:shadow-lg active:scale-98 transition-all disabled:opacity-70 disabled:hover:translate-y-0 min-h-[48px] cursor-pointer"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="relative flex items-center justify-center mb-6 sm:mb-8">
          <div className="absolute w-full h-px bg-slate-100"></div>
          <span className="bg-white px-4 text-xs font-bold text-slate-400 relative z-10">または</span>
        </div>

        <button
          onClick={handleGuestLogin}
          type="button"
          disabled={isLoading}
          className="w-full bg-white border-2 border-slate-100 text-slate-700 font-bold rounded-xl py-3.5 hover:bg-slate-50 hover:border-slate-200 active:scale-98 transition-all flex items-center justify-center gap-2 group min-h-[48px] cursor-pointer shadow-2xs"
        >
          <span>来場者として閲覧する</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-[11px] text-slate-400 text-center mt-3 font-medium">
          ※ 登録不要で作品の閲覧や応援（いいね最大5回まで）が可能です
        </p>

      </div>
    </div>
  );
}
