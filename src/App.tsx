import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { getSystemSettings, getBooths, getNews } from './lib/db';
import { SystemSettings, BoothDetail, NewsItem } from './types';
import { 
  ArrowRight, MapPin, Sparkles, Calendar, Clock, 
  Gamepad2, Palette, Code2, Film, ChevronRight, CheckCircle2,
  ExternalLink, Star
} from 'lucide-react';

// Pages placeholders
import Login from './pages/Login';
import Schedule from './pages/Schedule';
import Booths from './pages/Booths';
import BoothDetailView from './pages/BoothDetail';
import PostWork from './pages/PostWork';
import Admin from './pages/Admin';
import Access from './pages/Access';
import News from './pages/News';

// ============================================================================
// 学校公式キャラクター差し替え用設定 (School Official Character Configuration)
// ※ 右側の男性イラストは後から学校の公式キャラクター画像に差し替え可能です。
// 差し替える場合は下記の画像パスを変更するか、管理画面のメインビジュアルを設定してください。
// ============================================================================
export const HERO_CHARACTER_IMAGE = '/images/hero_character.jpg';
export const HERO_CRYSTAL_CUBE_IMAGE = '/images/crystal_cube.jpg';

const HomeBoothThumbnail: React.FC<{ b: BoothDetail }> = ({ b }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [b.thumbnailUrl]);

  const isSvgData = b.thumbnailUrl?.startsWith('data:image/svg+xml');
  const svgContent = React.useMemo(() => {
    if (!isSvgData || !b.thumbnailUrl) return null;
    try {
      const commaIdx = b.thumbnailUrl.indexOf(',');
      if (commaIdx !== -1) {
        return decodeURIComponent(b.thumbnailUrl.substring(commaIdx + 1));
      }
      return null;
    } catch {
      return null;
    }
  }, [b.thumbnailUrl, isSvgData]);

  if (svgContent) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover group-hover:scale-105 transition-transform duration-300"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  if (b.thumbnailUrl && !error) {
    return (
      <img 
        src={b.thumbnailUrl} 
        alt={b.title} 
        onError={() => setError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
      />
    );
  }
  return (
    <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black flex flex-col justify-center items-center text-white p-3 text-center">
      <Sparkles className="w-6 h-6 mb-1 text-yellow-400 opacity-90" />
      <span className="text-[11px] font-bold line-clamp-1">{b.title || '作品画像'}</span>
    </div>
  );
};

const Home = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [featuredBooths, setFeaturedBooths] = useState<BoothDetail[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  
  useEffect(() => {
    getSystemSettings().then(setSettings);
    getBooths().then(data => setFeaturedBooths(data.slice(0, 4)));
    getNews().then(items => setNewsList(items.slice(0, 4)));
  }, []);

  // Character image source with priority: System Settings > Default Generated Character
  const characterImageSrc = settings?.mainVisualUrl || HERO_CHARACTER_IMAGE;

  const courses = [
    {
      id: 'game',
      code: 'GAME',
      name: 'ゲームコース',
      catchphrase: '遊びの中に、新しい体験を。',
      image: '/images/course_game.jpg',
      query: 'ゲーム'
    },
    {
      id: 'illust',
      code: 'ILLUST',
      name: 'イラストコース',
      catchphrase: '想像を、色で描く。',
      image: '/images/course_illust.jpg',
      query: 'イラスト'
    },
    {
      id: 'it',
      code: 'IT',
      name: '情報系ITコース',
      catchphrase: 'テクノロジーで未来をつくる。',
      image: '/images/course_it.jpg',
      query: 'IT'
    },
    {
      id: '3dcg',
      code: '3DCG',
      name: '3DCGコース',
      catchphrase: 'リアルと想像のあいだで。',
      image: '/images/course_3dcg.jpg',
      query: '3DCG'
    }
  ];

  const pickupWorks = [
    {
      id: 'p1',
      title: '青空と丘の景観',
      author: '学生作品',
      image: '/images/pickup_1.jpg'
    },
    {
      id: 'p2',
      title: 'CYBER GIRL 2026',
      author: '学生作品',
      image: '/images/pickup_2.jpg'
    },
    {
      id: 'p3',
      title: 'Cloud Analytics UI',
      author: '学生作品',
      image: '/images/pickup_3.jpg'
    },
    {
      id: 'p4',
      title: '幻想都市の騎士',
      author: '学生作品',
      image: '/images/pickup_4.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-[#ffea34] text-zinc-950 selection:bg-black selection:text-[#ffea34] font-sans overflow-x-hidden relative">
      
      {/* Background Subtle Geometric Pattern & Contrast Highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.05] pointer-events-none" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Vertical Rotated Left Edge Brand Label */}
      <div className="hidden xl:flex fixed left-5 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[11px] font-black tracking-[0.4em] text-black/25 pointer-events-none select-none z-10">
        ASO HIGH SCHOOL 2026
      </div>

      {/* =====================================================================
          1. HERO SECTION (Graduation & Promotion Exhibition 2026)
         ===================================================================== */}
      <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          
          {/* Left Column: Typography, Tagline, Dates, Venue */}
          <div className="lg:col-span-6 z-10 flex flex-col justify-center">
            
            {/* Catchphrase with colored dots */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-zinc-900 tracking-wider mb-6 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full w-fit border border-black/10 shadow-xs">
              <span>つくる。</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block"></span>
              <span>描く。</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
              <span>創る。</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block"></span>
              <span>未来を。</span>
            </div>

            {/* Giant Title Typography (Graduation & Promotion Exhibition 2026) */}
            <div className="mb-6 select-none">
              <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl xl:text-[5.4rem] font-black tracking-tight leading-[0.96]">
                <span className="block text-[#0f3ea9] drop-shadow-xs font-black">
                  Graduation &amp;
                </span>
                <span className="block text-[#1d4ed8] drop-shadow-xs font-black">
                  Promotion
                </span>
                <span className="block text-[#0284c7] drop-shadow-xs font-black">
                  Exhibition
                </span>
                <span className="block text-black font-black text-5xl sm:text-7xl md:text-8xl xl:text-[6.4rem] mt-1 tracking-tighter drop-shadow-xs">
                  2026
                </span>
              </h1>
            </div>

            {/* Japanese Exhibition Title & School */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-zinc-950 tracking-tight mb-1">
                ASO高等部 卒業進級制作展
              </h2>
              <p className="text-[11px] sm:text-xs font-black text-zinc-700 tracking-wider mb-3 sm:mb-4 uppercase">
                ASO High School
              </p>
              
              <p className="text-xs sm:text-base text-zinc-900 font-bold leading-relaxed max-w-md">
                ゲーム・イラスト・情報系IT・3DCG<br />
                それぞれの「好き」から生まれた作品たちが、<br />
                ここに集結。
              </p>
            </div>

            {/* Event Dates & Info Box */}
            <div className="bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-4 sm:p-6 shadow-md max-w-lg">
              <div className="text-[11px] sm:text-[12px] font-black text-zinc-500 tracking-wider mb-1">2026</div>
              
              {/* Large Dates with Badges */}
              <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap mb-3 sm:mb-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">2.21</span>
                  <span className="text-[10px] sm:text-[11px] font-black bg-cyan-500 text-white px-2 sm:px-2.5 py-0.5 rounded-md shadow-xs">SAT</span>
                </div>
                
                <span className="text-zinc-400 font-bold text-xs sm:text-sm">‣</span>
                
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">2.22</span>
                  <span className="text-[10px] sm:text-[11px] font-black bg-rose-500 text-white px-2 sm:px-2.5 py-0.5 rounded-md shadow-xs">SUN</span>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-bold text-zinc-800 mb-2">
                10:00 - 18:00 <span className="text-zinc-500 font-normal">(両日とも)</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-zinc-800">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>ASO高等部 各教室・体育館</span>
                </div>
                <Link 
                  to="/booths" 
                  className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 hover:text-blue-900 group"
                >
                  <span>出展ブース一覧を見る</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column: Character Visual with Floating Course Menu & Crystals */}
          <div className="lg:col-span-6 relative flex items-center justify-center mt-4 lg:mt-0">
            
            {/* Main Character Illustration Container */}
            <div className="relative w-full max-w-[420px] sm:max-w-[560px] aspect-[4/5] sm:aspect-[3/4] flex items-center justify-center">
              
              {/* Hero Character Image */}
              <img
                src={characterImageSrc}
                alt="ASO Exhibition Official Visual"
                className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
              />

              {/* Floating Glowing Crystal Cubes */}
              <div className="absolute top-4 left-1 sm:top-6 sm:left-6 w-16 h-16 sm:w-28 sm:h-28 rounded-2xl overflow-hidden pointer-events-none opacity-90 transform -rotate-12 drop-shadow-md border border-white/40">
                <img src={HERO_CRYSTAL_CUBE_IMAGE} alt="Crystal Cube" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-12 right-0 sm:bottom-16 w-14 h-14 sm:w-24 sm:h-24 rounded-2xl overflow-hidden pointer-events-none opacity-85 transform rotate-12 drop-shadow-md border border-white/40">
                <img src={HERO_CRYSTAL_CUBE_IMAGE} alt="Crystal Cube" className="w-full h-full object-cover" />
              </div>

              {/* Handwritten Japanese Calligraphy on Hero (好きが、未来をつくる。) */}
              <div className="absolute bottom-8 left-4 sm:bottom-12 sm:left-14 z-20 pointer-events-none select-none">
                <div 
                  className="text-white font-extrabold text-xl sm:text-3xl md:text-4xl tracking-widest drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] transform -rotate-6"
                  style={{
                    textShadow: '0 0 10px rgba(0, 194, 255, 0.9), 0 0 20px rgba(0, 194, 255, 0.6), 0 2px 6px rgba(0, 0, 0, 0.8)'
                  }}
                >
                  好きが、<br />
                  <span className="ml-4">未来をつくる。</span>
                </div>
              </div>

              {/* Top-Right Floating Course Quick Navigation Card */}
              <div className="absolute -top-2 right-1 sm:-top-4 sm:right-6 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-4 shadow-md border border-black/10 w-32 sm:w-44 z-20 space-y-2 sm:space-y-2.5">
                <Link to="/booths" className="flex items-center gap-2 sm:gap-2.5 text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors group">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase">GAME</div>
                    <div className="text-[11px] sm:text-xs font-bold leading-none">ゲーム</div>
                  </div>
                </Link>

                <Link to="/booths" className="flex items-center gap-2 sm:gap-2.5 text-xs font-bold text-slate-800 hover:text-purple-600 transition-colors group">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase">ILLUST</div>
                    <div className="text-[11px] sm:text-xs font-bold leading-none">イラスト</div>
                  </div>
                </Link>

                <Link to="/booths" className="flex items-center gap-2 sm:gap-2.5 text-xs font-bold text-slate-800 hover:text-cyan-600 transition-colors group">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase">IT</div>
                    <div className="text-[11px] sm:text-xs font-bold leading-none">情報系IT</div>
                  </div>
                </Link>

                <Link to="/booths" className="flex items-center gap-2 sm:gap-2.5 text-xs font-bold text-slate-800 hover:text-emerald-600 transition-colors group">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase">3DCG</div>
                    <div className="text-[11px] sm:text-xs font-bold leading-none">3DCG</div>
                  </div>
                </Link>
              </div>

            </div>

            {/* Scroll Indicator at bottom right */}
            <div className="hidden lg:flex absolute -bottom-10 right-8 flex-col items-center gap-1 text-[10px] font-black tracking-widest text-black/60">
              <span className="text-[9px]">SCROLL</span>
              <span className="text-xs animate-bounce">&darr;</span>
            </div>

          </div>

        </div>
      </section>


      {/* =====================================================================
          2. EXHIBITION CATEGORY (展示作品)
         ===================================================================== */}
      <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Left Category Header */}
          <div className="lg:w-1/4 shrink-0">
            <div className="mb-2">
              <span className="text-black font-black text-xs tracking-widest uppercase relative pb-1 inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-black">
                EXHIBITION CATEGORY
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight mb-4">
              展示作品
            </h2>

            <p className="text-xs sm:text-sm text-zinc-900 font-bold leading-relaxed mb-6">
              4つのコースから生まれた、<br />
              個性あふれる作品たち。<br />
              それぞれの「好き」や「想い」が<br />
              カタチになった作品をぜひご覧ください。
            </p>

            <Link
              to="/booths"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white hover:bg-zinc-800 text-xs font-bold transition-all shadow-md"
            >
              <span>すべての作品を見る</span>
              <span className="text-sm">&rsaquo;</span>
            </Link>
          </div>

          {/* 4 Course Cards Grid */}
          <div className="lg:w-3/4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 w-full">
            {courses.map((course) => (
              <Link
                key={course.id}
                to="/booths"
                className="bg-white rounded-2xl overflow-hidden border border-black/10 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
              >
                {/* Course Visual */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                  <img
                    src={course.image}
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Course Details */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-black text-blue-600 tracking-widest block uppercase mb-0.5">
                      {course.code}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-zinc-950 leading-snug mb-1">
                      {course.name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-zinc-600 font-semibold leading-relaxed line-clamp-2">
                      {course.catchphrase}
                    </p>
                  </div>

                  <div className="flex justify-end mt-2 sm:mt-4 pt-1 sm:pt-2">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-100 text-black group-hover:bg-black group-hover:text-white flex items-center justify-center text-[10px] sm:text-xs font-bold transition-colors">
                      &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>


      {/* =====================================================================
          3. ABOUT & NEWS SECTION (2 Columns)
         ===================================================================== */}
      <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Card: About (制作展について) */}
          <div className="lg:col-span-6 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-8 md:p-10 border border-black/10 shadow-md relative overflow-hidden flex flex-col justify-between">
            
            {/* Background 3D Glowing Crystal with Holographic Script */}
            <div className="absolute -right-6 bottom-4 sm:bottom-8 w-36 sm:w-56 aspect-square pointer-events-none opacity-80 select-none">
              <img src={HERO_CRYSTAL_CUBE_IMAGE} alt="Crystal Cube" className="w-full h-full object-contain filter drop-shadow-md" />
              <div 
                className="absolute bottom-6 left-2 font-cursive text-blue-700/80 font-bold text-xl sm:text-3xl transform -rotate-12 select-none"
                style={{ textShadow: '0 0 8px rgba(255,255,255,0.8)' }}
              >
                Create<br />Your Future
              </div>
            </div>

            <div className="relative z-10 max-w-md">
              <h3 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent mb-1">
                About
              </h3>
              <div className="text-xs sm:text-sm font-black text-zinc-900 mb-4 sm:mb-6">制作展について</div>

              <p className="text-xs sm:text-sm text-zinc-800 font-bold leading-relaxed mb-6 sm:mb-8">
                ASO高等部 デジタルクリエイティブコースの生徒たちが、1年間の学びの集大成として制作した作品を展示するイベントです。<br />
                ゲーム・イラスト・情報系IT・3DCGの4つのコースで、それぞれの個性とスキルが詰まった作品をぜひご覧ください。
              </p>

              <Link
                to="/schedule"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-black text-white hover:bg-zinc-800 text-xs font-bold transition-all shadow-xs min-h-[40px]"
              >
                <span>詳しく見る</span>
                <span className="text-sm">&rsaquo;</span>
              </Link>
            </div>

          </div>

          {/* Right Card: News (お知らせ) */}
          <div className="lg:col-span-6 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-8 md:p-10 border border-black/10 shadow-md flex flex-col justify-between">
            
            <div>
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-100 mb-4 sm:mb-6">
                <div className="flex items-baseline gap-2.5 sm:gap-3">
                  <h3 className="text-2xl sm:text-3xl font-black text-zinc-950">News</h3>
                  <span className="text-xs font-black text-zinc-500">お知らせ</span>
                </div>

                <Link to="/news" className="text-xs font-black text-blue-700 hover:text-blue-900 flex items-center gap-1 group py-1">
                  <span>一覧を見る</span>
                  <span className="text-sm group-hover:translate-x-0.5 transition-transform">&rsaquo;</span>
                </Link>
              </div>

              {/* News List Items - Mobile Ergonomic Layout */}
              <div className="space-y-3">
                {newsList.map((item, idx) => (
                  <div key={item.id || idx} className="py-2 border-b border-zinc-100/70 last:border-b-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-400 font-bold text-[11px] sm:text-xs shrink-0">{item.date}</span>
                        <span className="shrink-0">
                          {item.category === 'important' ? (
                            <span className="bg-rose-500 text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full">重要</span>
                          ) : item.category === 'event' ? (
                            <span className="bg-blue-600 text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full">イベント</span>
                          ) : item.category === 'exhibitor' ? (
                            <span className="bg-amber-500 text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full">出展者へ</span>
                          ) : (
                            <span className="bg-emerald-600 text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full">お知らせ</span>
                          )}
                        </span>
                      </div>
                      {item.isNew && (
                        <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                          NEW
                        </span>
                      )}
                    </div>
                    <Link 
                      to={`/news?id=${item.id}`}
                      className="font-bold text-zinc-900 hover:text-blue-600 transition-colors line-clamp-2 text-xs sm:text-sm block leading-snug"
                      title={item.title}
                    >
                      {item.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-right text-[11px] text-zinc-400 font-semibold">
              最終更新: {newsList[0]?.date || '2026.01.15'}
            </div>

          </div>

        </div>
      </section>


      {/* =====================================================================
          4. PICK UP WORKS (注目の作品)
         ===================================================================== */}
      <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-8 md:p-10 border border-black/10 shadow-md">
          
          {/* Header & Controls */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                Pick Up Works
              </h3>
              <span className="text-xs font-black text-blue-700">注目の作品</span>
            </div>

            {/* Carousel Arrow Buttons */}
            <div className="flex items-center gap-2">
              <button 
                type="button"
                className="w-8 h-8 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-100 flex items-center justify-center text-sm font-bold transition-colors"
                aria-label="Previous work"
              >
                &lsaquo;
              </button>
              <button 
                type="button"
                className="w-8 h-8 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-100 flex items-center justify-center text-sm font-bold transition-colors"
                aria-label="Next work"
              >
                &rsaquo;
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {featuredBooths.length > 0 ? (
              featuredBooths.map((booth) => (
                <Link
                  key={booth.id}
                  to={`/booths/${booth.id}`}
                  className="rounded-2xl overflow-hidden border border-zinc-200/80 bg-white shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all group block"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <HomeBoothThumbnail b={booth} />
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {booth.roomName || '展示'}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-black text-zinc-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {booth.title}
                    </div>
                    <div className="text-[11px] font-medium text-zinc-500 line-clamp-1 mt-0.5">
                      {booth.catchphrase || booth.authorName}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              pickupWorks.map((work) => (
                <Link
                  key={work.id}
                  to="/booths"
                  className="rounded-2xl overflow-hidden border border-zinc-200/80 bg-white shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all group block"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img
                      src={work.image}
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-black text-zinc-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {work.title}
                    </div>
                    <div className="text-[11px] font-medium text-zinc-500 line-clamp-1 mt-0.5">
                      {work.author}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Bottom Center Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-8">
            <span className="w-6 h-1.5 bg-black rounded-full"></span>
            <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
            <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
          </div>

        </div>
      </section>

      <div className="pb-16"></div>
    </div>
  );
};

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-100">
    <h2 className="text-4xl font-bold mb-4">404</h2>
    <p className="text-zinc-400">ページが見つかりません</p>
    <Link to="/" className="mt-8 text-pink-400 hover:text-pink-300">トップページに戻る</Link>
  </div>
);


export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="booths" element={<Booths />} />
              <Route path="booths/:id" element={<BoothDetailView />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="news" element={<News />} />
              <Route path="news/:id" element={<News />} />
              <Route path="post" element={<PostWork />} />
              <Route path="admin" element={<Admin />} />
              <Route path="access" element={<Access />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
