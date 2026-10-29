import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import clsx from 'clsx';
import { getBoothById, addVote, getBoothVotes, getUserVoteCount, addComment, getCommentsByBooth } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { BoothDetail, BoothComment } from '../types';
import { Heart, MessageSquare, ArrowLeft, ExternalLink, Video, FileText, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  hasVisitorLikedBooth, 
  getVisitorLikesCount, 
  recordVisitorLike, 
  MAX_VISITOR_LIKES 
} from '../lib/cookie';


const OgpLink: React.FC<{ url: string }> = ({ url }) => {
  const [ogp, setOgp] = useState<{title?: string, image?: string, description?: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ogp?url=' + encodeURIComponent(url))
      .then(res => res.json())
      .then(data => {
        if (!data.error) setOgp(data);
      })
      .finally(() => setLoading(false));
  }, [url]);

  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex flex-col h-full group border border-slate-200 rounded-2xl p-4 hover:border-cyan-500 hover:shadow-md transition-all bg-white">
      {loading ? (
        <div className="flex flex-col h-full animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-3/4 mb-3"></div>
          <div className="w-full aspect-video bg-slate-100 rounded-xl mb-3"></div>
          <div className="h-3 bg-slate-100 rounded w-full mb-1"></div>
          <div className="h-3 bg-slate-100 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <h4 className="font-bold text-slate-800 text-[15px] line-clamp-2 mb-3 group-hover:text-cyan-600 transition-colors leading-snug">
            {ogp?.title || url}
          </h4>
          
          {ogp?.image ? (
            <div className="w-full aspect-video bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-2 mb-3 overflow-hidden">
              <img src={ogp.image} alt={ogp.title || 'Link thumbnail'} className="w-full h-full object-contain rounded-lg drop-shadow-sm" />
            </div>
          ) : (
            <div className="w-full aspect-video bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 transition-colors mb-3">
              <ExternalLink className="w-8 h-8" />
            </div>
          )}

          <div className="mt-auto flex flex-col gap-1.5">
            {ogp?.description && (
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {ogp.description}
              </p>
            )}
            <span className="text-[10px] text-slate-400 truncate flex items-center gap-1.5">
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              {url}
            </span>
          </div>
        </>
      )}
    </a>
  );
};

interface BoothMediaDisplayProps {
  booth: BoothDetail;
}

const BoothMediaDisplay: React.FC<BoothMediaDisplayProps> = ({ booth }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [booth.thumbnailUrl, booth.id]);

  // If thumbnail is an SVG data URI, render directly as inline SVG to avoid data-URI img limits or parsing glitches
  const isSvgData = booth.thumbnailUrl?.startsWith('data:image/svg+xml');
  const svgContent = React.useMemo(() => {
    if (!isSvgData || !booth.thumbnailUrl) return null;
    try {
      const commaIdx = booth.thumbnailUrl.indexOf(',');
      if (commaIdx !== -1) {
        const encoded = booth.thumbnailUrl.substring(commaIdx + 1);
        return decodeURIComponent(encoded);
      }
      return null;
    } catch {
      return null;
    }
  }, [booth.thumbnailUrl, isSvgData]);

  if (svgContent) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  if (booth.thumbnailUrl && !imageError) {
    return (
      <img 
        src={booth.thumbnailUrl} 
        alt={booth.title} 
        onError={() => setImageError(true)}
        className="w-full h-full object-cover" 
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 flex flex-col justify-between p-8 sm:p-12 text-white relative overflow-hidden">
      {/* Decorative ambient elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />
      
      <div className="relative z-10 flex items-center justify-between">
        <span className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-xs">
          {booth.courseName || booth.courseId || '出展作品'}
        </span>
        <span className="text-xs font-bold tracking-wider text-purple-200/90 bg-black/40 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10">
          {booth.floor} {booth.roomName || booth.roomId}
        </span>
      </div>

      <div className="relative z-10 my-auto text-center max-w-xl mx-auto py-4">
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-4 text-purple-200 shadow-md">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white mb-3 tracking-tight drop-shadow-md line-clamp-2">
          {booth.title || '無題'}
        </h2>
        <p className="text-sm sm:text-base text-purple-200/90 font-medium line-clamp-2 drop-shadow-sm">
          {booth.catchphrase || 'ASO 卒業・進級制作展 2025 出展作品'}
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between text-xs text-purple-200/90 pt-4 border-t border-white/10">
        <span className="font-bold">制作者: {booth.authorName || '出展者'}</span>
        <span className="font-mono text-[11px] text-purple-300/70 tracking-widest">ASO EXHIBITION 2025</span>
      </div>
    </div>
  );
};

export default function BoothDetailView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booth, setBooth] = useState<BoothDetail | null>(null);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<BoothComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userVoteCount, setUserVoteCount] = useState(0);
  const [alreadyLiked, setAlreadyLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id) {
      setImageError(false);
      loadData(id);
    }
  }, [id, user]);

  const loadData = async (rawId: string) => {
    const decodedId = decodeURIComponent(rawId);
    let b = await getBoothById(decodedId);
    if (!b && rawId !== decodedId) {
      b = await getBoothById(rawId);
    }
    setBooth(b);
    
    if (b) {
      const v = await getBoothVotes(b.id);
      setLikes(v);
      
      const c = await getCommentsByBooth(b.id);
      setComments(c);
      
      if (user) {
        if (user.authority === 'guest') {
          const cookieCount = getVisitorLikesCount();
          let dbCount = 0;
          try {
            dbCount = await getUserVoteCount(user.id);
          } catch {}
          const count = Math.max(cookieCount, dbCount);
          setUserVoteCount(count);
          setAlreadyLiked(hasVisitorLikedBooth(b.id));
        } else {
          const count = await getUserVoteCount(user.id);
          setUserVoteCount(count);
        }
      }
    }
  };

  const handleVote = async () => {
    if (!user || !booth) return;
    if (user.authority === 'event') {
      toast.error('イベント係は投票できません');
      return;
    }

    // 来場者（ゲスト）のいいね制限（Cookieによる最大5回制限＆重複防止）
    if (user.authority === 'guest') {
      if (alreadyLiked || hasVisitorLikedBooth(booth.id)) {
        toast.error('この作品にはすでに「いいね」しています');
        return;
      }
      if (userVoteCount >= MAX_VISITOR_LIKES || getVisitorLikesCount() >= MAX_VISITOR_LIKES) {
        toast.error(`来場者様のいいねは最大${MAX_VISITOR_LIKES}回までです（上限に達しました）`);
        return;
      }

      setIsSubmitting(true);
      try {
        const recordResult = recordVisitorLike(booth.id);
        if (!recordResult.success) {
          toast.error(recordResult.error || 'いいねに失敗しました');
          setIsSubmitting(false);
          return;
        }

        // Firestore にも投票データを保存（Cookie端末IDと紐付け）
        try {
          await addVote(booth.id, user.id);
        } catch (dbErr) {
          console.warn('addVote Firestore sync note:', dbErr);
        }

        setLikes(l => l + 1);
        setUserVoteCount(recordResult.newCount);
        setAlreadyLiked(true);
        toast.success(`いいねしました！（残り ${recordResult.remaining} 回）`);
      } catch (err: any) {
        console.error('Vote error:', err);
        setLikes(l => l + 1);
        setAlreadyLiked(true);
        toast.success(`いいねしました！`);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 学生の投票制限（5回まで）
    if (user.authority === 'student' && userVoteCount >= 5) {
      toast.error('投票は5回までです');
      return;
    }

    setIsSubmitting(true);
    try {
      await addVote(booth.id, user.id);
      setLikes(l => l + 1);
      setUserVoteCount(c => c + 1);
      setAlreadyLiked(true);
      toast.success('いいねしました！');
    } catch {
      toast.error('投票に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !booth || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const comment: BoothComment = {
        boothId: booth.id,
        userId: user.id,
        userName: user.name || 'ゲスト',
        text: newComment.trim(),
        createdAt: new Date() // Will be stringified in db.ts
      };
      await addComment(comment);
      setComments([comment, ...comments]);
      setNewComment('');
      toast.success('コメントを送信しました（公開はされません）');
    } catch {
      toast.error('送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booth) return <div className="p-12 text-center">Loading...</div>;

  // STRICT: Only the actual owner / creator account is permitted to edit!
  // Administrators CANNOT edit other people's artwork pages!
  const isOwner = Boolean(
    user && booth && (
      user.id === booth.userId ||
      user.loginId === booth.userId ||
      user.id === booth.userLoginId ||
      user.loginId === booth.userLoginId
    )
  );

  // Comments viewable by author or administrators (for moderation)
  const canViewComments = Boolean(
    isOwner || (user && user.authority === 'admin')
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-100 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link to="/booths" className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" /> Roomページに戻る
          </Link>
          
          {/* Strictly show edit button ONLY if user is the true author of this work! */}
          {isOwner && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-950">
                  あなたの出展作品です
                </span>
              </div>
              <Link
                to="/post"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-xs"
              >
                マイページでこの作品を編集する
              </Link>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{booth.floor}</span>
            <span className="text-base sm:text-lg font-bold text-slate-700">{booth.roomName || booth.roomId}</span>
            {booth.courseName && (
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                {booth.courseName}
              </span>
            )}
            {booth.grade && (
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                {booth.grade}
              </span>
            )}
            {booth.authorName && (
              <span className="text-xs sm:text-sm font-bold text-slate-700 w-full sm:w-auto sm:ml-auto bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 block sm:inline-block">
                制作者: {booth.authorName}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-3 sm:mb-4 leading-tight">{booth.title}</h1>
          <p className="text-sm sm:text-lg text-slate-600 font-medium leading-relaxed">{booth.catchphrase}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Main Artwork Thumbnail Showcase - ALWAYS displayed with high-fidelity fallback & vector SVG support */}
        <div className="w-full aspect-[16/10] sm:aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 mb-6 sm:mb-12 bg-slate-900 relative">
          <BoothMediaDisplay booth={booth} />
        </div>
        
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100 mb-6 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4">紹介コメント</h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed sm:leading-loose whitespace-pre-wrap">{booth.description}</p>
        </div>

        {/* Media section (PDFs / YouTubes) */}
        <div className="flex flex-col gap-6 sm:gap-8 mb-6 sm:mb-12">
          
          {booth.externalLinks?.length > 0 && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-green-500" /> 外部リンク
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {booth.externalLinks.map((link, i) => (
                  <OgpLink key={i} url={link} />
                ))}
              </div>
            </div>
          )}

          {booth.youtubes?.length > 0 && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" /> 動画
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {booth.youtubes.map((yt, i) => {
                  const ytMatch = yt.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                  const ytId = ytMatch ? ytMatch[1] : null;
                  return (
                    <a key={i} href={yt} target="_blank" rel="noreferrer" className="block relative group rounded-xl overflow-hidden shadow-xs border border-slate-200">
                      {ytId ? (
                        <>
                          <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="YouTube" className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <div className="bg-white/90 p-3.5 rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
                              <Video className="w-7 h-7 sm:w-8 sm:h-8 text-red-500 fill-current" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 text-xs sm:text-sm text-blue-600 hover:underline break-all">{yt}</div>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {booth.pdfs?.length > 0 && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-blue-500" /> 資料PDF
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {booth.pdfs.map((pdfItem, i) => {
                  const pdfUrl = typeof pdfItem === 'string' ? pdfItem : pdfItem.url;
                  const pdfName = typeof pdfItem === 'string' ? `資料 ${i + 1}` : (pdfItem.name || `資料 ${i + 1}`);
                  return (
                    <a 
                      key={i} 
                      href={pdfUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center w-full bg-white border border-slate-200 hover:border-red-300 hover:shadow-md transition-all p-3.5 sm:p-4 rounded-2xl group min-h-[64px]"
                    >
                      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-500 group-hover:text-white text-red-500 transition-colors">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0 px-3.5 sm:px-5">
                        <h4 className="font-bold text-slate-800 text-sm sm:text-base break-words group-hover:text-red-600 transition-colors leading-snug">
                          {pdfName}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">PDFを開く</p>
                      </div>
                      <div className="shrink-0 w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Interaction section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 text-center relative overflow-hidden mb-6 sm:mb-12">
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-100 to-transparent rounded-bl-full -z-10 opacity-50 pointer-events-none"></div>
           
           <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-1.5 sm:mb-2">この作品を応援する！</h3>
           <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8">素晴らしいと思ったら「いいね」を押してください</p>
           
           <button 
             onClick={handleVote}
             disabled={
               isSubmitting || 
               (user?.authority === 'guest' && (userVoteCount >= MAX_VISITOR_LIKES || alreadyLiked)) ||
               (user?.authority === 'student' && userVoteCount >= 5)
             }
             className={clsx(
               "mx-auto flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full text-white shadow-xl transition-all cursor-pointer",
               alreadyLiked
                 ? "bg-gradient-to-br from-pink-500 to-rose-600 shadow-pink-500/40 ring-4 ring-pink-200"
                 : "bg-gradient-to-br from-pink-400 to-pink-500 shadow-pink-500/30 active:scale-95 hover:scale-105",
               (user?.authority === 'guest' && userVoteCount >= MAX_VISITOR_LIKES && !alreadyLiked) && "opacity-50 cursor-not-allowed hover:scale-100",
               isSubmitting && "opacity-50 cursor-wait"
             )}
             title={alreadyLiked ? 'いいね済み' : 'いいねする'}
           >
             <Heart className={clsx("w-8 h-8 sm:w-10 sm:h-10 mb-1.5 fill-current transition-transform", alreadyLiked && "scale-110")} />
             <span className="text-xl sm:text-2xl font-black">{likes}</span>
           </button>
           
           {/* 来場者向けいいね制限表示（端末Cookie連携） */}
           {user?.authority === 'guest' && (
             <div className="mt-4 sm:mt-6 flex flex-col items-center gap-2">
               {alreadyLiked ? (
                 <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-pink-50 text-pink-700 text-xs sm:text-sm font-bold border border-pink-200 shadow-2xs">
                   <Check className="w-4 h-4 text-pink-600" />
                   <span>この作品にいいねしました（残り {Math.max(0, MAX_VISITOR_LIKES - userVoteCount)} 回）</span>
                 </div>
               ) : userVoteCount >= MAX_VISITOR_LIKES ? (
                 <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs sm:text-sm font-bold border border-slate-200 shadow-2xs">
                   <span>※ いいね上限（5回）に達しました。応援ありがとうございました！</span>
                 </div>
               ) : (
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 text-pink-800 text-xs sm:text-sm font-bold border border-pink-200 shadow-2xs">
                   <span>来場者いいね可能数:</span>
                   <span className="text-pink-600 font-black text-base">{MAX_VISITOR_LIKES - userVoteCount}</span>
                   <span className="text-pink-400">/ {MAX_VISITOR_LIKES}回</span>
                 </div>
               )}
               <p className="text-[11px] text-slate-400">
                 ※ 来場者端末のCookieにより1人最大5回までに制限されています
               </p>
             </div>
           )}

           {/* 学生向け投票制限表示 */}
           {user?.authority === 'student' && (
             <div className="mt-4 sm:mt-6 flex flex-col items-center gap-1">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-800 text-xs sm:text-sm font-bold border border-purple-200">
                 <span>学生投票可能数:</span>
                 <span className="text-purple-600 font-black text-base">{Math.max(0, 5 - userVoteCount)}</span>
                 <span className="text-purple-400">/ 5回</span>
               </div>
             </div>
           )}
        </div>

        {/* Comments Form */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1.5 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-500" />
            応援コメントを送る
          </h3>
          <p className="text-xs text-slate-400 mb-4 sm:mb-6">※コメントは出展者および管理者のみに公開されます。</p>
          
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="素晴らしい作品ですね！"
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 text-base sm:text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors mb-3 sm:mb-4 resize-none"
            />
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
              >
                送信する
              </button>
            </div>
          </form>
        </div>

        {/* Received Comments for Owner / Admin */}
        {canViewComments && (
          <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              この作品に届いた応援コメント一覧（全 {comments.length} 件）
            </h3>
            <p className="text-xs text-slate-400 mb-6">※出展者ご本人および管理者のみに表示されています。</p>

            {comments.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-slate-100">
                まだ応援コメントは届いていません。
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {comments.map((c, idx) => (
                  <div key={c.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <span className="font-bold text-slate-700">{c.userName || '来場者'}</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {c.createdAt ? new Date(c.createdAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
