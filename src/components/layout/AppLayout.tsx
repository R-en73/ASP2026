import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Menu, LogOut, User as UserIcon, Settings, X, Search, ChevronUp,
  Home as HomeIcon, Grid3X3, Calendar, Bell, MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 320);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Home', path: '/', labelJa: 'ホーム' },
    { name: 'Works', path: '/booths', labelJa: '作品ブース' },
    { name: 'Event', path: '/schedule', labelJa: 'イベント日程' },
    { name: 'News', path: '/news', labelJa: 'お知らせ' },
    { name: 'Access', path: '/access', labelJa: 'アクセス' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={clsx("min-h-screen font-sans flex flex-col", location.pathname === '/' ? "bg-[#ffea34] text-zinc-950" : "bg-[#f0f7fd] text-slate-900")}>
      {/* Header */}
      <header className={clsx(
        "fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors",
        location.pathname === '/' 
          ? "bg-[#ffea34] border-black/10 shadow-[0_2px_15px_rgba(0,0,0,0.04)]" 
          : "bg-white/95 backdrop-blur-md border-slate-200/80 shadow-[0_2px_20px_rgba(200,225,250,0.35)]"
      )}>
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 sm:gap-3 group active:scale-98 transition-transform">
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[11px] font-black tracking-tight text-slate-800 leading-none mb-0.5">ASO高等部</span>
                  <span className="text-xs sm:text-base font-black tracking-tight text-slate-900 leading-none whitespace-nowrap">卒業進級制作展</span>
                </div>
                <span className="h-4 sm:h-6 w-px bg-slate-300 hidden sm:inline-block"></span>
                <span className="text-xs font-semibold text-slate-500 tracking-wider hidden md:inline-block">ASO High School</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex space-x-9 items-center">
              {navItems.map((item) => {
                const isActive = item.path === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={clsx(
                      "text-sm font-bold tracking-wide transition-all py-2 relative",
                      isActive
                        ? "text-slate-900 font-extrabold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-cyan-400 after:rounded-full"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {user?.authority === 'admin' && (
                <Link to="/admin" className="hidden lg:flex p-2 text-slate-600 hover:text-cyan-600 transition-colors" title="管理画面">
                  <Settings className="w-4 h-4" />
                </Link>
              )}
              
              {user ? (
                <div className="hidden lg:flex items-center gap-2">
                  {user.authority !== 'guest' && (
                    <Link to="/post" className="bg-white/80 border border-slate-200 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-cyan-600" />
                      マイページ
                    </Link>
                  )}
                  <button onClick={logout} className="border border-slate-200 text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5" title="ログアウト">
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="hidden lg:flex text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold transition-colors">
                  ログイン
                </Link>
              )}

              {/* Reservation Pill Button (来場予約) */}
              <Link
                to="/schedule"
                className="bg-gradient-to-r from-[#29b6f6] to-[#ab47bc] hover:opacity-90 active:scale-95 text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-full shadow-[0_4px_14px_rgba(41,182,246,0.35)] hover:shadow-[0_6px_18px_rgba(41,182,246,0.45)] transition-all flex items-center justify-center whitespace-nowrap min-h-[32px] sm:min-h-[40px]"
              >
                来場予約
              </Link>
              
              {/* Hamburger Menu Button with Solid Visible Background */}
              <button 
                type="button"
                className={clsx(
                  "flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] rounded-xl transition-all duration-200 focus:outline-none cursor-pointer select-none",
                  isMobileMenuOpen 
                    ? "bg-slate-900 text-white shadow-md border border-slate-900 active:scale-95" 
                    : "bg-white text-slate-800 shadow-sm border border-slate-300 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-950 active:scale-95"
                )}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                ) : (
                  <Menu className="w-5 h-5 text-slate-800" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Backdrop & Slide Drawer */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 top-14 sm:top-20 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="bg-white border-b-2 border-slate-200 shadow-2xl py-5 px-5 sm:px-6 flex flex-col gap-2.5 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto max-w-md ml-auto mr-0 sm:mr-4 sm:mt-2 sm:rounded-2xl sm:border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* User summary card in drawer */}
              {user && (
                <div className="mb-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {user.name ? user.name[0] : 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 line-clamp-1">{user.name || 'ユーザー'}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {user.authority === 'admin' ? '管理者' : user.authority === 'student' ? '生徒（出展者）' : '来場者'}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="text-xs text-slate-600 hover:text-red-600 font-bold px-2.5 py-1.5 flex items-center gap-1 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>終了</span>
                  </button>
                </div>
              )}

              {/* Navigation links */}
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const isActive = item.path === '/' 
                    ? location.pathname === '/' 
                    : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={clsx(
                        "text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-between min-h-[48px] transition-all border",
                        isActive
                          ? "bg-blue-50 text-blue-700 font-extrabold border-blue-200 shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900">{item.name}</span>
                        <span className="text-[11px] text-slate-500 font-medium">({item.labelJa})</span>
                      </div>
                      <span className={clsx("text-xs font-bold", isActive ? "text-blue-600" : "text-slate-400")}>&rarr;</span>
                    </Link>
                  );
                })}
              </div>
              
              {/* Account Quick Actions */}
              <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
                {user ? (
                  <>
                    {user.authority !== 'guest' && (
                      <Link 
                        to="/post" 
                        className="bg-cyan-50 border border-cyan-200 text-cyan-900 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 min-h-[44px] hover:bg-cyan-100 transition-colors shadow-2xs" 
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserIcon className="w-4 h-4 text-cyan-600" />
                        マイページ（作品編集）
                      </Link>
                    )}
                    {user.authority === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 min-h-[44px] hover:bg-slate-800 transition-colors shadow-xs" 
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-cyan-400" />
                        管理画面を開く
                      </Link>
                    )}
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className="bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 min-h-[44px] hover:bg-slate-800 transition-colors shadow-xs" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-4 h-4 text-cyan-400" />
                    ログイン
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-14 sm:pt-20 pb-24 lg:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (Transparent Acrylic Glass Texture) */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 acrylic-bottom-bar lg:hidden flex justify-around items-center h-16 pb-safe px-1.5 select-none"
        aria-label="モバイルナビゲーション"
      >
        {/* Specular sheen line on the top cut edge of acrylic glass */}
        <div className="absolute top-0 inset-x-0 h-[1px] acrylic-sheen pointer-events-none" />

        {[
          { name: 'ホーム', path: '/', icon: HomeIcon },
          { name: '作品ブース', path: '/booths', icon: Grid3X3 },
          { name: '日程', path: '/schedule', icon: Calendar },
          { name: 'お知らせ', path: '/news', icon: Bell },
          { name: 'アクセス', path: '/access', icon: MapPin },
        ].map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              className={clsx(
                "flex-1 flex flex-col items-center justify-center py-1 transition-all select-none relative min-h-[48px] rounded-xl active:scale-95",
                isActive
                  ? "text-blue-600 font-extrabold"
                  : "text-slate-700 hover:text-slate-900 font-bold"
              )}
            >
              {isActive && (
                <>
                  <span className="absolute top-0.5 w-6 h-0.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]"></span>
                  <span className="absolute inset-x-1.5 inset-y-1 bg-blue-500/12 rounded-xl -z-10 border border-blue-500/20 shadow-xs"></span>
                </>
              )}
              <item.icon className={clsx("w-5 h-5 mb-0.5 transition-transform", isActive ? "scale-110 text-blue-600" : "text-slate-700")} />
              <span className={clsx("text-[10px] tracking-tight leading-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]", isActive ? "font-black text-blue-700" : "text-slate-700 font-bold")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Floating Scroll to Top Button for mobile thumbs */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="ページ最上部へ戻る"
          className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30 w-11 h-11 rounded-full bg-slate-900/90 backdrop-blur-md text-white shadow-xl flex items-center justify-center hover:bg-slate-800 active:scale-90 transition-all cursor-pointer border border-white/20"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
      
      {/* Footer */}
      <footer className={clsx(
        "w-full py-8 px-4 sm:px-6 lg:px-8 border-t transition-colors",
        location.pathname === '/'
          ? "bg-[#fed814] border-black/10 text-zinc-900"
          : "bg-[#e8f4fc]/60 border-slate-200/80 text-slate-600"
      )}>
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
            <span>ASO高等部 卒業進級制作展 2026</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400 font-normal">ASO High School</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block w-32 h-px bg-slate-300"></div>
            {/* Social Icons */}
            <div className="flex items-center gap-4 text-slate-500">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors p-1" title="X (Twitter)">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors p-1" title="Instagram">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors p-1" title="YouTube">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
