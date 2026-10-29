import React, { useState, useEffect } from 'react';
import { Search, Map, Grid3X3, Filter, X, ChevronRight, Sparkles, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { getBooths } from '../lib/db';
import { BoothDetail } from '../types';
import { useAuth } from '../contexts/AuthContext';

const BoothThumbnailItem: React.FC<{ booth: BoothDetail }> = ({ booth }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [booth.thumbnailUrl]);

  const isSvgData = booth.thumbnailUrl?.startsWith('data:image/svg+xml');
  const svgContent = React.useMemo(() => {
    if (!isSvgData || !booth.thumbnailUrl) return null;
    try {
      const commaIdx = booth.thumbnailUrl.indexOf(',');
      if (commaIdx !== -1) {
        return decodeURIComponent(booth.thumbnailUrl.substring(commaIdx + 1));
      }
      return null;
    } catch {
      return null;
    }
  }, [booth.thumbnailUrl, isSvgData]);

  if (svgContent) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover group-hover:scale-105 transition-transform duration-500"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  if (booth.thumbnailUrl && !error) {
    return (
      <img 
        src={booth.thumbnailUrl} 
        alt={booth.title} 
        onError={() => setError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col justify-between p-4 text-white relative overflow-hidden">
      <div className="flex justify-between items-center text-[10px] font-bold text-white/80 relative z-10">
        <span className="bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full">{booth.courseName || '展示作品'}</span>
        <span>{booth.floor} {booth.roomName || booth.roomId}</span>
      </div>
      <div className="text-center my-auto px-2 relative z-10">
        <Sparkles className="w-5 h-5 mx-auto mb-1 text-purple-300 opacity-80" />
        <p className="font-bold text-xs line-clamp-1 text-white">{booth.title || '無題'}</p>
      </div>
      <div className="text-[9px] text-purple-200/70 text-right font-mono relative z-10">
        ASO 2025
      </div>
    </div>
  );
};

export default function Booths() {
  const { user } = useAuth();
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [booths, setBooths] = useState<BoothDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [myWorksOnly, setMyWorksOnly] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState('すべてのコース');
  const [selectedRoom, setSelectedRoom] = useState('すべての教室');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBooths();
  }, []);

  const loadBooths = async () => {
    try {
      const data = await getBooths();
      setBooths(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isUserBooth = (b: BoothDetail) => {
    if (!user || user.authority === 'guest') return false;
    return b.userId === user.id || 
           b.userLoginId === user.id || 
           b.userLoginId === user.loginId || 
           (b.userId === user.loginId) || 
           (user.boothId && b.id === user.boothId);
  };

  const filteredBooths = booths.filter(b => {
    if (myWorksOnly && !isUserBooth(b)) return false;
    if (selectedFloor !== 'ALL' && b.floor !== selectedFloor && b.roomName !== selectedFloor) return false;
    if (selectedCourse !== 'すべてのコース' && b.courseName !== selectedCourse) return false;
    if (selectedRoom !== 'すべての教室' && b.roomName !== selectedRoom) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!b.title?.toLowerCase().includes(q) && !b.catchphrase?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const myBoothCount = booths.filter(isUserBooth).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-100 to-transparent rounded-bl-full -z-10 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-100 to-transparent rounded-tr-full -z-10 opacity-60"></div>

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6">
          <div>
             <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight flex flex-col gap-1 sm:gap-2 relative">
               <span className="text-cyan-500 font-cursive text-2xl sm:text-3xl absolute -top-6 sm:-top-8 -left-2 sm:-left-4 transform -rotate-12">BOOTH</span>
               ブース紹介
               <span className="text-xs sm:text-sm font-bold text-slate-400 tracking-[0.3em] uppercase mt-0.5 sm:mt-1">Booth Introduction</span>
             </h1>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-md">
            各コースの個性あふれる作品を一挙にご紹介！<br/>
            気になるブースを見つけて、ぜひ会場で直接ご覧ください。
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 mb-5 sm:mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
            <span className="text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">フロアで探す</span>
            <div className="flex bg-slate-100 rounded-full p-1 overflow-x-auto w-full max-w-full no-scrollbar">
              {['ALL', '1F 体育館', '2F 1121', '2F 1222', '3F 1131', '3F 1132', '3F 1133', '3F 1134', '3F 1135'].map(floor => (
                <button 
                  key={floor}
                  onClick={() => setSelectedFloor(floor)}
                  className={clsx(
                    "px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[36px]",
                    selectedFloor === floor ? "bg-cyan-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {floor}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 w-full md:w-auto flex-grow md:max-w-md">
            <div>
              <select 
                value={selectedRoom}
                onChange={e => setSelectedRoom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-base sm:text-sm rounded-xl px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 min-h-[44px]"
              >
                <option>すべての教室</option>
                {Array.from(new Set(booths.map(b => b.roomName).filter(Boolean))).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
               <select 
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-base sm:text-sm rounded-xl px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 min-h-[44px]"
               >
                <option>すべてのコース</option>
                {Array.from(new Set(booths.map(b => b.courseName).filter(Boolean))).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full md:w-64 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="作品名・キーワードで検索..." 
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-base sm:text-sm rounded-full pl-9 pr-4 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 min-h-[44px]" 
            />
          </div>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 flex items-center justify-between shadow-2xs cursor-pointer min-h-[44px]"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-600" />
              <span>コース詳細絞り込み {selectedCourse !== 'すべてのコース' ? `(${selectedCourse})` : ''}</span>
            </span>
            <span className="text-slate-400 text-xs font-bold">
              {showMobileFilter ? '閉じる ▲' : '開く ▼'}
            </span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Sidebar Filters */}
          <aside className={clsx("w-full lg:w-64 flex-shrink-0", !showMobileFilter && "hidden lg:block")}>
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-28">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    条件で絞り込む
                  </h3>
                  <button onClick={() => setSelectedCourse('すべてのコース')} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> すべてクリア
                  </button>
                </div>

                {/* Course Filter */}
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-slate-500 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                    コース
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: '情報システムコース', color: 'bg-blue-500' },
                      { label: 'CGコース', color: 'bg-pink-500' },
                      { label: 'イラストコース', color: 'bg-orange-500' },
                      { label: 'ゲームクリエイターコース', color: 'bg-cyan-500' }
                    ].map(c => (
                      <label key={c.label} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-4 h-4 border border-slate-300 rounded group-hover:border-slate-400">
                          <input type="checkbox" className="sr-only peer" checked={selectedCourse === c.label} onChange={() => setSelectedCourse(selectedCourse === c.label ? 'すべてのコース' : c.label)} />
                          <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500 scale-0 peer-checked:scale-100 transition-transform"></div>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${c.color}`}></span>
                        <span className="text-sm text-slate-600 group-hover:text-slate-800">{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

             </div>
          </aside>

          {/* Grid Content */}
          <div className="flex-1">
            {user && user.authority !== 'guest' && (
              <div className="flex items-center gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs inline-flex">
                <button
                  type="button"
                  onClick={() => setMyWorksOnly(false)}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    !myWorksOnly ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  すべての出展作品 ({booths.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMyWorksOnly(true)}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                    myWorksOnly ? "bg-purple-600 text-white shadow-xs" : "text-purple-700 hover:bg-purple-50"
                  )}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  自分の作品 ({myBoothCount})
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div className="text-slate-600 text-xs sm:text-sm">
                全 <span className="text-xl sm:text-2xl font-bold text-cyan-500 mx-1">{filteredBooths.length}</span> 件のブースが見つかりました
              </div>
              
              <div className="flex bg-slate-100 rounded-full p-1 self-start sm:self-auto">
                <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-cyan-500 text-white shadow-sm">
                  <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 一覧表示
                </button>
                <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                  <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> マップ表示
                </button>
              </div>
            </div>

            {loading ? (
               <div className="py-20 text-center text-slate-500 font-bold">読み込み中...</div>
            ) : filteredBooths.length === 0 ? (
               myWorksOnly ? (
                 <div className="py-16 text-center bg-white rounded-3xl p-8 border border-slate-100 shadow-xs">
                   <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
                     <Sparkles className="w-8 h-8" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-800 mb-2">まだ作品が登録されていません</h3>
                   <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
                     あなたのアカウントでマイページから作品を登録すると、ここにあなたの作品が表示されます。
                   </p>
                   <Link
                     to="/post"
                     className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm"
                   >
                     マイページで作品を登録する
                   </Link>
                 </div>
               ) : (
                 <div className="py-20 text-center text-slate-500 font-bold">条件に一致するブースが見つかりませんでした</div>
               )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBooths.map(booth => {
                  const isMine = isUserBooth(booth);
                  return (
                    <Link 
                      to={`/booths/${booth.id}`} 
                      key={booth.id} 
                      className={clsx(
                        "bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border overflow-hidden flex flex-col group cursor-pointer block relative",
                        isMine ? "border-purple-300 ring-2 ring-purple-300/80 shadow-purple-100/50" : "border-slate-100"
                      )}
                    >
                      {/* Header info */}
                      <div className="p-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center">{booth.floor || '1F'}</span>
                          <span className="text-sm font-bold text-slate-700">{booth.roomName || booth.roomId}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isMine && (
                            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              <Sparkles className="w-2.5 h-2.5" />
                              あなたの作品
                            </span>
                          )}
                          <span className={clsx(
                            "text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap",
                            (booth.courseName || '').includes('Web') ? 'bg-blue-100 text-blue-700' :
                            (booth.courseName || '').includes('ゲーム') ? 'bg-cyan-100 text-cyan-700' :
                            (booth.courseName || '').includes('グラフィック') ? 'bg-pink-100 text-pink-700' :
                            (booth.courseName || '').includes('プロダクト') ? 'bg-purple-100 text-purple-700' :
                            'bg-orange-100 text-orange-700'
                          )}>
                            {booth.courseName || booth.courseId || '未設定'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Image */}
                      <div className="w-full aspect-[16/9] overflow-hidden relative bg-slate-100">
                        <BoothThumbnailItem booth={booth} />
                      </div>
                      
                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-800 text-base mb-1 line-clamp-1">{booth.title || '無題'}</h3>
                        {(booth.authorName || booth.courseName) && (
                          <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-bold text-slate-500">
                             {booth.authorName && <span>{booth.authorName}</span>}
                             {booth.authorName && booth.courseName && <span>|</span>}
                             {booth.courseName && <span>{booth.courseName}</span>}
                          </div>
                        )}
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4 flex-1">{booth.catchphrase || '説明がありません'}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Grid3X3 className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{booth.tags?.[0] || '展示'}</span>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-cyan-50 group-hover:text-cyan-500 transition-colors">
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
