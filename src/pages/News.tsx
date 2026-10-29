import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Bell, Calendar, Tag, ChevronRight, ArrowLeft, Search, Filter, Share2, Check, ExternalLink, Sparkles, AlertCircle, Plus } from 'lucide-react';
import { getNews, getNewsById } from '../lib/db';
import { NewsItem, NewsCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const CATEGORIES: { key: 'ALL' | NewsCategory; label: string; badgeClass: string }[] = [
  { key: 'ALL', label: 'すべて', badgeClass: 'bg-zinc-800 text-white' },
  { key: 'important', label: '重要', badgeClass: 'bg-rose-500 text-white' },
  { key: 'event', label: 'イベント', badgeClass: 'bg-blue-600 text-white' },
  { key: 'exhibitor', label: '出展者へ', badgeClass: 'bg-amber-500 text-white' },
  { key: 'general', label: 'お知らせ', badgeClass: 'bg-emerald-600 text-white' },
];

export default function News() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | NewsCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Active article being viewed (if any)
  const activeArticleId = routeId || searchParams.get('id');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    if (activeArticleId && newsList.length > 0) {
      const found = newsList.find(n => n.id === activeArticleId);
      if (found) {
        setActiveArticle(found);
      } else {
        // Try fetching directly
        getNewsById(activeArticleId).then(item => {
          setActiveArticle(item);
        });
      }
    } else if (!activeArticleId) {
      setActiveArticle(null);
    }
  }, [activeArticleId, newsList]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const items = await getNews();
      setNewsList(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArticle = (item: NewsItem) => {
    setActiveArticle(item);
    setSearchParams({ id: item.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setActiveArticle(null);
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('リンクをコピーしました');
    setTimeout(() => setCopied(false), 2500);
  };

  // Filtered news items
  const filteredList = newsList.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesQuery = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getCategoryBadge = (category: NewsCategory) => {
    switch (category) {
      case 'important':
        return <span className="bg-rose-500 text-white font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-xs">重要</span>;
      case 'event':
        return <span className="bg-blue-600 text-white font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-xs">イベント</span>;
      case 'exhibitor':
        return <span className="bg-amber-500 text-white font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-xs">出展者へ</span>;
      default:
        return <span className="bg-emerald-600 text-white font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-xs">お知らせ</span>;
    }
  };

  // Prev / Next articles navigation
  const currentIndex = activeArticle ? newsList.findIndex(n => n.id === activeArticle.id) : -1;
  const prevArticle = currentIndex > 0 ? newsList[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < newsList.length - 1 ? newsList[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-50 relative pb-28">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-100 to-transparent rounded-bl-full -z-10 opacity-70 pointer-events-none" />
      <div className="absolute top-80 left-0 w-80 h-80 bg-gradient-to-tr from-amber-100 to-transparent rounded-tr-full -z-10 opacity-60 pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14">
        
        {/* ===================================================================
            ARTICLE DETAIL VIEW (If an article is selected)
           =================================================================== */}
        {activeArticle ? (
          <div>
            {/* Back Button & Breadcrumbs */}
            <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 flex-wrap">
              <button
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors bg-white border border-slate-200 px-4 py-2 rounded-full shadow-xs hover:shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>お知らせ一覧に戻る</span>
              </button>

              <div className="flex items-center gap-2">
                {user?.authority === 'admin' && (
                  <RouterLink
                    to={`/admin?tab=news&edit=${activeArticle.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-1.5 rounded-full transition-colors shadow-2xs"
                    title="管理画面でお知らせを編集"
                  >
                    <span>管理画面で編集</span>
                  </RouterLink>
                )}
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-xs cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'コピー済み' : '共有'}</span>
                </button>
              </div>
            </div>

            {/* Article Card */}
            <article className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 md:p-12 border border-slate-200 shadow-md">
              {/* Header Badges & Date */}
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap mb-4">
                <span className="font-mono text-xs sm:text-sm font-black text-slate-500">
                  {activeArticle.date}
                </span>
                {getCategoryBadge(activeArticle.category)}
                {activeArticle.isNew && (
                  <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                    NEW
                  </span>
                )}
                {activeArticle.author && (
                  <span className="text-xs text-slate-400 font-semibold ml-auto hidden sm:inline-block">
                    発信: {activeArticle.author}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-snug mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-100">
                {activeArticle.title}
              </h1>

              {/* Content Body */}
              <div className="text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-wrap font-medium">
                {activeArticle.content}
              </div>

              {/* External URL Link (if provided) */}
              {activeArticle.externalUrl && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <a
                    href={activeArticle.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <span>関連リンクを開く</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Related Quick Links Banner */}
              <div className="mt-12 p-6 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">ASO EXHIBITION 2026</div>
                  <div className="text-sm font-bold text-slate-800">出展作品やイベント情報をチェックしよう</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <RouterLink
                    to="/booths"
                    className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-xs"
                  >
                    出展ブース一覧
                  </RouterLink>
                  <RouterLink
                    to="/schedule"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-xs"
                  >
                    イベント日程
                  </RouterLink>
                </div>
              </div>
            </article>

            {/* Previous & Next Article Navigation */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevArticle ? (
                <button
                  onClick={() => handleSelectArticle(prevArticle)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left transition-colors flex items-center gap-3 group shadow-xs"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-1 transition-transform shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">前の記事</div>
                    <div className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {prevArticle.title}
                    </div>
                  </div>
                </button>
              ) : (
                <div className="hidden sm:block" />
              )}

              {nextArticle && (
                <button
                  onClick={() => handleSelectArticle(nextArticle)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right transition-colors flex items-center justify-end gap-3 group sm:col-start-2 shadow-xs"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">次の記事</div>
                    <div className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {nextArticle.title}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              )}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleBackToList}
                className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>一覧に戻る</span>
              </button>
            </div>
          </div>
        ) : (
          /* ===================================================================
              NEWS LIST VIEW (All announcements)
             =================================================================== */
          <div>
            {/* Page Header */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-600 text-white font-black text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full">
                  NEWS &amp; TOPICS
                </span>
                <span className="text-xs font-bold text-slate-400">最新情報</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                お知らせ一覧
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed max-w-2xl">
                ASO高等部 卒業進級制作展2026に関する最新情報、スケジュール更新、出展案内などを掲載しています。
              </p>
            </div>

            {/* Admin Quick Action Banner */}
            {user?.authority === 'admin' && (
              <div className="mb-8 p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="bg-blue-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                    ADMIN
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    管理者モード：お知らせの新規投稿・編集・削除が行えます
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <RouterLink
                    to="/admin?tab=news&action=new"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新規投稿</span>
                  </RouterLink>
                  <RouterLink
                    to="/admin?tab=news"
                    className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold transition-colors"
                  >
                    管理画面を開く
                  </RouterLink>
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-sm mb-6 sm:mb-8 space-y-3.5">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {CATEGORIES.map((cat) => {
                  const count = cat.key === 'ALL'
                    ? newsList.length
                    : newsList.filter(n => n.category === cat.key).length;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={clsx(
                        "px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer min-h-[38px]",
                        selectedCategory === cat.key
                          ? `${cat.badgeClass} shadow-xs scale-102`
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Keyword Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="キーワードでお知らせを検索..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-2.5 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[44px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
                  >
                    クリア
                  </button>
                )}
              </div>
            </div>

            {/* News List Container */}
            {loading ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3" />
                <p className="text-xs font-bold text-slate-400">お知らせを読み込み中...</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-700 mb-1">条件に一致するお知らせがありません</h3>
                <p className="text-xs text-slate-400">別のカテゴリーまたはキーワードをお試しください。</p>
                <button
                  onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                  className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition-colors"
                >
                  条件をリセット
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
                {filteredList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectArticle(item)}
                    className="p-5 sm:p-6 hover:bg-blue-50/40 transition-colors cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6"
                  >
                    {/* Left: Date, Category badge, Title */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-400 shrink-0">
                          {item.date}
                        </span>
                        {getCategoryBadge(item.category)}
                        {item.isNew && (
                          <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                            NEW
                          </span>
                        )}
                      </div>

                      <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-1">
                        {item.title}
                      </h2>

                      {item.summary && (
                        <p className="text-xs text-slate-500 font-medium line-clamp-1 leading-relaxed">
                          {item.summary}
                        </p>
                      )}
                    </div>

                    {/* Right: Read detail arrow */}
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-blue-600 shrink-0 self-end sm:self-center transition-colors">
                      <span className="hidden sm:inline">詳細を見る</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Count and Footer Info */}
            <div className="mt-6 flex items-center justify-between text-xs text-slate-400 font-semibold px-2">
              <span>全 {filteredList.length} 件</span>
              <span>最終更新: 2026.01.15</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
