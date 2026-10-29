import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, CheckCircle2, ChevronRight, ChevronLeft, Link as LinkIcon, 
  FileText, Video, Image as ImageIcon, X, Trash2, ExternalLink, Sparkles, ShieldAlert, Loader2, AlertTriangle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { saveBooth, getBoothById, getBoothByUserId, getUserOwnedBooth, deleteBooth, updateUser } from '../lib/db';
import toast from 'react-hot-toast';

export default function PostWork() {
  const { user, updateUserSession } = useAuth();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBoothId, setCurrentBoothId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getInitialFormData = (currUser: any) => ({
    title: '',
    catchphrase: '',
    description: '',
    authorName: currUser?.name || '',
    courseName: currUser?.courseId || '',
    grade: currUser?.grade || '',
    youtubes: [''],
    externalLinks: [''],
    thumbnailUrl: '',
    pdfs: [{ name: '', url: '' }],
    tags: '展示'
  });

  const [formData, setFormData] = useState(() => getInitialFormData(user));

  useEffect(() => {
    let isCancelled = false;

    const loadDataForUser = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Guest check
      if (user.authority === 'guest') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      // Immediately reset to clean template for THIS user to prevent any previous user data from lingering
      setFormData(getInitialFormData(user));
      setCurrentBoothId(null);
      setStep(1);

      try {
        // STRICT: Find booth strictly owned by THIS user account only!
        const existing = await getUserOwnedBooth(user);

        if (isCancelled) return;

        if (existing) {
          setCurrentBoothId(existing.id);
          setFormData({
            title: existing.title || '',
            catchphrase: existing.catchphrase || '',
            description: existing.description || '',
            authorName: existing.authorName || user.name || '',
            courseName: existing.courseName || user.courseId || '',
            grade: existing.grade || user.grade || '',
            youtubes: existing.youtubes?.length ? existing.youtubes : [''],
            externalLinks: existing.externalLinks?.length ? existing.externalLinks : [''],
            thumbnailUrl: existing.thumbnailUrl || '',
            pdfs: existing.pdfs?.length 
              ? existing.pdfs.map(p => typeof p === 'string' ? { name: '', url: p } : { name: p.name || '', url: p.url || '' }) 
              : [{ name: '', url: '' }],
            tags: existing.tags?.[0] || '展示'
          });
        } else {
          setCurrentBoothId(null);
          setFormData(getInitialFormData(user));
        }
      } catch (err) {
        console.error('loadDataForUser error:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDataForUser();

    return () => {
      isCancelled = true;
    };
  }, [user?.id, user?.loginId]);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadingPdfIndex, setUploadingPdfIndex] = useState<number | null>(null);

  const handleArrayChange = (field: 'pdfs' | 'youtubes' | 'externalLinks', index: number, value: any) => {
    setFormData(prev => {
      const newArr = [...prev[field]];
      newArr[index] = value;
      return { ...prev, [field]: newArr };
    });
  };
  
  const handlePdfChange = (index: number, key: 'name' | 'url', value: string) => {
    setFormData(prev => {
      const newPdfs = [...prev.pdfs];
      const existing = newPdfs[index] || { name: '', url: '' };
      newPdfs[index] = { ...existing, [key]: value };
      return { ...prev, pdfs: newPdfs };
    });
  };

  const addArrayItem = (field: 'pdfs' | 'youtubes' | 'externalLinks') => {
    setFormData(prev => {
      if (prev[field].length >= 10) return prev;
      const emptyItem = field === 'pdfs' ? { name: '', url: '' } : '';
      return { ...prev, [field]: [...prev[field], emptyItem] };
    });
  };

  const removeArrayItem = (field: 'pdfs' | 'youtubes' | 'externalLinks', index: number) => {
    setFormData(prev => {
      const newArr = [...prev[field]];
      newArr.splice(index, 1);
      return { ...prev, [field]: newArr };
    });
  };
  const isUploadingPdf = uploadingPdfIndex !== null;

  const compressImageToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnailUrl' | 'pdfUrl', index?: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (field === 'thumbnailUrl') {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
         toast.error('画像ファイルを選択してください');
         return;
      }
      setIsUploadingImage(true);
      try {
        // Try uploading to server first
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            setFormData(prev => ({ ...prev, thumbnailUrl: data.url }));
            toast.success('サムネイル画像を設定しました');
            setIsUploadingImage(false);
            return;
          }
        }
        // Fallback to client-side compressed data URL
        const compressedDataUrl = await compressImageToDataUrl(file);
        setFormData(prev => ({ ...prev, thumbnailUrl: compressedDataUrl }));
        toast.success('サムネイル画像を設定しました');
      } catch (err) {
        try {
          const compressedDataUrl = await compressImageToDataUrl(file);
          setFormData(prev => ({ ...prev, thumbnailUrl: compressedDataUrl }));
          toast.success('サムネイル画像を設定しました');
        } catch {
          console.error(err);
          toast.error('画像の処理に失敗しました');
        }
      } finally {
        setIsUploadingImage(false);
      }
    } else if (field === 'pdfUrl' && index !== undefined) {
      const pdfFiles = Array.from(files as Iterable<File> | ArrayLike<File>).filter((f: File) => f.type === 'application/pdf');
      if (pdfFiles.length === 0) {
         toast.error('PDFファイルを選択してください');
         return;
      }
      
      let currentIndex = index;
      const newPdfs = [...formData.pdfs];
      
      setUploadingPdfIndex(index);
      
      try {
        let uploadedCount = 0;
        for (const file of pdfFiles) {
          if (currentIndex >= 10) break;
          
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
          if (!res.ok) throw new Error('Upload failed');
          const data = await res.json();
          
          // Use functional state update to prevent race conditions when user types while uploading
          setFormData(prev => {
            const nextPdfs = [...prev.pdfs];
            // Preserve the user's edits if they changed the name while this was uploading
            const currentName = nextPdfs[currentIndex]?.name;
            const finalName = currentName && currentName !== '' ? currentName : file.name;
            
            nextPdfs[currentIndex] = { name: finalName, url: data.url };
            
            // Add next empty slot if needed
            if (currentIndex + 1 < 10 && currentIndex + 1 >= nextPdfs.length && uploadedCount + 1 < pdfFiles.length) {
              nextPdfs.push({ name: '', url: '' });
            }
            return { ...prev, pdfs: nextPdfs };
          });
          
          currentIndex++;
          uploadedCount++;
        }
        
        toast.success(uploadedCount > 1 ? `${uploadedCount}件のPDFをアップロードしました` : 'アップロードが完了しました');
      } catch (err) {
        console.error(err);
        toast.error('一部のアップロードに失敗しました');
      } finally {
        setUploadingPdfIndex(null);
      }
    }
  };

  const generatePresetSvg = (type: 'cg' | 'it' | 'design' | 'illust') => {
    const config = {
      cg: {
        title: formData.title || 'ゲーム・CG制作',
        subtitle: 'CG・ゲームコース',
        icon: '🎮',
        grad1: '#4338ca',
        grad2: '#7c3aed',
        grad3: '#ec4899'
      },
      it: {
        title: formData.title || 'IT・システム開発',
        subtitle: '情報システムコース',
        icon: '💻',
        grad1: '#0284c7',
        grad2: '#2563eb',
        grad3: '#4f46e5'
      },
      design: {
        title: formData.title || 'Web・UI/UXデザイン',
        subtitle: 'Web・デザインコース',
        icon: '✨',
        grad1: '#059669',
        grad2: '#0d9488',
        grad3: '#0284c7'
      },
      illust: {
        title: formData.title || 'イラスト・グラフィック',
        subtitle: 'イラストレーションコース',
        icon: '🎨',
        grad1: '#db2777',
        grad2: '#e11d48',
        grad3: '#f59e0b'
      }
    }[type];

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${config.grad1}" />
          <stop offset="50%" stop-color="${config.grad2}" />
          <stop offset="100%" stop-color="${config.grad3}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#bg)" />
      <circle cx="1000" cy="150" r="300" fill="white" fill-opacity="0.1" />
      <circle cx="200" cy="550" r="250" fill="white" fill-opacity="0.08" />
      <rect x="80" y="60" width="1040" height="555" rx="32" fill="white" fill-opacity="0.12" stroke="white" stroke-width="2" stroke-opacity="0.3" />
      <g transform="translate(600, 240)">
        <circle cx="0" cy="0" r="60" fill="white" fill-opacity="0.25" />
        <text x="0" y="18" font-family="sans-serif" font-size="44" text-anchor="middle">${config.icon}</text>
      </g>
      <rect x="460" y="325" width="280" height="36" rx="18" fill="white" fill-opacity="0.25" />
      <text x="600" y="349" font-family="sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">${config.subtitle}</text>
      <text x="600" y="425" font-family="sans-serif" font-size="44" font-weight="bold" fill="white" text-anchor="middle">${config.title.substring(0, 24)}</text>
      <text x="600" y="475" font-family="sans-serif" font-size="20" font-weight="600" fill="white" fill-opacity="0.85" text-anchor="middle">ASO 卒業・進級制作展 2025</text>
    </svg>`;

    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    setFormData(prev => ({ ...prev, thumbnailUrl: dataUrl }));
    toast.success('プリセットサムネイルを適用しました');
  };

  const handleDeleteWork = async () => {
    if (!user || !currentBoothId) return;
    setIsDeleting(true);
    try {
      await deleteBooth(currentBoothId);
      await updateUser(user.id, { boothId: '' });
      updateUserSession({ boothId: '' });
      setCurrentBoothId(null);
      setFormData(getInitialFormData(user));
      setStep(1);
      setShowDeleteModal(false);
      toast.success('作品を削除しました');
    } catch (e) {
      console.error('handleDeleteWork error:', e);
      toast.error('作品の削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const steps = [
    { num: 1, label: '基本情報' },
    { num: 2, label: '詳細情報' },
    { num: 3, label: 'メディア・資料' },
    { num: 4, label: '確認' },
  ];

  const handleSave = async () => {
    if (!user) {
      toast.error('ログインしていません');
      return;
    }
    if (user.authority === 'guest') {
      toast.error('ゲストアカウントは作品の保存ができません');
      return;
    }
    
    // Determine unique booth ID for THIS user
    let targetBoothId = currentBoothId;
    if (!targetBoothId) {
      if (user.boothId) {
        const candidate = await getBoothById(user.boothId);
        // If candidate already exists and is owned by someone else, generate unique id
        if (candidate && candidate.userId && candidate.userId !== user.id && candidate.userLoginId !== user.loginId) {
          targetBoothId = `booth_${user.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
        } else if (!candidate) {
          targetBoothId = user.boothId;
        } else if (candidate.userId === user.id || candidate.userLoginId === user.loginId) {
          targetBoothId = user.boothId;
        } else {
          targetBoothId = `booth_${user.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
        }
      } else {
        targetBoothId = `booth_${user.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      }
    }
    
    setIsSaving(true);
    try {
      const roomVal = user.roomId || (user.boothId && (user.boothId.includes('F') || user.boothId.includes('館')) ? user.boothId : '未設定');
      const floorVal = user.roomId 
        ? (user.roomId.substring(0, 1) + 'F') 
        : (user.boothId?.startsWith('1F') ? '1F' : user.boothId?.startsWith('2F') ? '2F' : user.boothId?.startsWith('3F') ? '3F' : '1F');

      const boothPayload = {
        id: targetBoothId,
        userId: user.id,
        userLoginId: user.loginId || user.id,
        title: formData.title.trim() || '無題',
        catchphrase: formData.catchphrase.trim(),
        description: formData.description.trim(),
        thumbnailUrl: formData.thumbnailUrl || '',
        youtubes: formData.youtubes.filter(url => url && url.trim() !== ''),
        externalLinks: formData.externalLinks.filter(url => url && url.trim() !== ''),
        pdfs: formData.pdfs.filter(p => p && p.url && p.url.trim() !== ''),
        tags: [formData.tags || '展示'],
        authorName: formData.authorName.trim() || user.name || '',
        courseName: formData.courseName.trim() || user.courseId || '',
        grade: formData.grade.trim() || user.grade || '',
        roomName: roomVal,
        floor: floorVal,
        courseId: user.courseId || formData.courseName || '',
        roomId: user.roomId || ''
      };

      await saveBooth(targetBoothId, boothPayload);

      // Update user record with edited authorName, courseName, grade, boothId
      await updateUser(user.id, {
        name: formData.authorName,
        courseId: formData.courseName,
        grade: formData.grade,
        boothId: targetBoothId
      });
      updateUserSession({
        name: formData.authorName,
        courseId: formData.courseName,
        grade: formData.grade,
        boothId: targetBoothId
      });

      setCurrentBoothId(targetBoothId);
      toast.success('作品を保存しました！');
      setStep(4);
    } catch (e) {
      console.error('handleSave error:', e);
      toast.error('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
        <p className="font-bold text-sm">マイページを読み込み中...</p>
      </div>
    );
  }

  if (user?.authority === 'guest') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">出展者専用ページ</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            来場者（ゲスト）アカウントでは作品の投稿・編集はできません。作品を登録するには、学生または出展者アカウントでログインしてください。
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm"
          >
            ログイン画面へ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-24 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-200 to-transparent rounded-bl-full -z-10 opacity-40"></div>
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-gradient-to-tr from-pink-200 to-transparent rounded-tr-full -z-10 opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-4 relative">
             <span className="text-cyan-500 font-cursive text-3xl absolute -top-6 left-0 transform -rotate-12">MY PAGE</span>
             マイページ<span className="text-pink-500">（作品編集）</span>
          </h1>
          <p className="mt-4 text-slate-600 font-medium max-w-xl leading-relaxed">
            {currentBoothId 
              ? 'あなたのアカウントに登録されている出展作品の情報を編集・管理できます。' 
              : 'あなたのアカウント専用の作品登録ページです。制作した作品の情報を入力して、展示に参加しましょう。'}
          </p>
        </div>

        {/* Ownership Status Banner */}
        {currentBoothId ? (
          <div className="mb-8 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                出展中（公開中）
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  登録作品: <span className="text-emerald-800">{formData.title || '（無題）'}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  ログインアカウント: {user?.name}（ID: {user?.loginId || user?.id}）
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Link 
                to={`/booths/${currentBoothId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                公開ページを見る
              </Link>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                title="この作品を削除"
              >
                <Trash2 className="w-3.5 h-3.5" />
                作品を削除
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-slate-50 border border-purple-200/80 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white shadow-xs">
                新規登録
              </span>
              <div>
                <div className="text-sm font-bold text-purple-950">
                  {user?.name} 様の作品を新規登録できます
                </div>
                <div className="text-xs text-purple-900/65 mt-0.5">
                  入力して保存すると作品が公開され、あなたのアカウントでのみ編集できます。
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Form Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-8 md:p-12">
              
              {/* Mobile Step Header */}
              <div className="md:hidden flex items-center justify-between mb-4 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500">ステップ {step} / 4</span>
                <span className="text-xs font-black text-slate-900">{steps.find(s => s.num === step)?.label}</span>
              </div>

              {/* Stepper */}
              <div className="flex items-center justify-between mb-8 sm:mb-12 relative px-1">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
                {steps.map((s, idx) => (
                  <div key={s.num} className="flex items-center gap-2 sm:gap-3 bg-white px-1 sm:px-2">
                    <div className={clsx(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-colors",
                      step >= s.num ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-400"
                    )}>
                      {s.num}
                    </div>
                    <span className={clsx(
                      "text-xs sm:text-sm font-bold hidden md:block",
                      step >= s.num ? "text-slate-800" : "text-slate-400"
                    )}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Form Content */}
              <div className="space-y-10">
                {step === 1 && (
                  <>
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Author Name */}
                      <div>
                        <label className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-bold text-slate-800">制作者名・グループ名</span>
                          <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full">必須</span>
                        </label>
                        <input 
                          type="text" 
                          value={formData.authorName}
                          onChange={e => setFormData({...formData, authorName: e.target.value})}
                          placeholder="例: 山田 太郎" 
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:border-cyan-500 transition-colors"
                        />
                      </div>
                      
                      {/* Course Name */}
                      <div>
                        <label className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-bold text-slate-800">コース・学科名</span>
                        </label>
                        <input 
                          type="text" 
                          value={formData.courseName}
                          onChange={e => setFormData({...formData, courseName: e.target.value})}
                          placeholder="例: ITエンジニア科" 
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:border-cyan-500 transition-colors"
                        />
                      </div>

                      {/* Grade */}
                      <div>
                        <label className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-bold text-slate-800">学年</span>
                        </label>
                        <input 
                          type="text" 
                          value={formData.grade}
                          onChange={e => setFormData({...formData, grade: e.target.value})}
                          placeholder="例: 1年" 
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:border-cyan-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-lg font-bold text-slate-800">タイトル</span>
                        <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2.5 py-1 rounded-full">必須</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder="作品のタイトルを入力してください" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
                      />
                      <div className="text-right text-xs text-slate-400 font-medium mt-2">{formData.title.length}/100</div>
                    </div>

                    {/* Catchphrase */}
                    <div>
                       <label className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-lg font-bold text-slate-800">一言説明</span>
                        <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2.5 py-1 rounded-full">必須</span>
                      </label>
                      <p className="text-sm text-slate-500 mb-3">作品の概要を、短くわかりやすくご記入ください。</p>
                      <textarea 
                        rows={3}
                        value={formData.catchphrase}
                        onChange={e => setFormData({...formData, catchphrase: e.target.value})}
                        placeholder="この作品の魅力をひとことで表すと..." 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors resize-none"
                      ></textarea>
                      <div className="text-right text-xs text-slate-400 font-medium mt-2">{formData.catchphrase.length}/200</div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    {/* Description */}
                    <div>
                       <label className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-lg font-bold text-slate-800">紹介コメント</span>
                        <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2.5 py-1 rounded-full">必須</span>
                      </label>
                      <p className="text-sm text-slate-500 mb-3">作品の背景やこだわり、制作で工夫した点などを自由にご記入ください。</p>
                      <textarea 
                        rows={6}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="この作品を制作したきっかけ、こだわったポイント、見どころなどを教えてください。" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors resize-none"
                      ></textarea>
                      <div className="text-right text-xs text-slate-400 font-medium mt-2">{formData.description.length}/1000</div>
                    </div>

                    <div>
                      <label className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-lg font-bold text-slate-800">展示形式</span>
                      </label>
                      <select 
                        value={formData.tags}
                        onChange={e => setFormData({...formData, tags: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
                      >
                        <option value="展示">展示</option>
                        <option value="体験">体験</option>
                        <option value="映像">映像</option>
                        <option value="インスタレーション">インスタレーション</option>
                        <option value="その他">その他</option>
                      </select>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    {/* Media */}
                    <div>
                      <label className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="text-lg font-bold text-slate-800">サムネイル画像</span>
                      </label>
                      
                      {formData.thumbnailUrl ? (
                        <div className="relative mb-4 rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 max-w-md group">
                          <img 
                            src={formData.thumbnailUrl} 
                            alt="サムネイルプレビュー" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <label className="cursor-pointer bg-white text-slate-800 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
                              画像を変更
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'thumbnailUrl')}
                                className="sr-only"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                            >
                              画像を削除
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl px-5 py-8 text-center hover:border-cyan-500 hover:bg-cyan-50 transition-colors relative cursor-pointer group mb-3">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'thumbnailUrl')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          {isUploadingImage ? (
                             <div className="text-sm font-bold text-cyan-600 flex flex-col items-center justify-center gap-2">
                               <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                               画像を処理中...
                             </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <UploadCloud className="w-8 h-8 text-slate-400 mb-2 group-hover:text-cyan-500 transition-colors" />
                              <span className="text-sm font-bold text-slate-700">クリックまたはドラッグ＆ドロップで画像をアップロード</span>
                              <span className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP対応（自動最適化）</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-3.5 bg-slate-100/70 rounded-xl mb-4">
                        <div className="text-xs font-bold text-slate-600 mb-2">画像がない場合は、プリセットデザインから選べます：</div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => generatePresetSvg('cg')}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors shadow-2xs"
                          >
                            🎮 CG・ゲーム風
                          </button>
                          <button
                            type="button"
                            onClick={() => generatePresetSvg('it')}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors shadow-2xs"
                          >
                            💻 情報システム風
                          </button>
                          <button
                            type="button"
                            onClick={() => generatePresetSvg('design')}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors shadow-2xs"
                          >
                            ✨ Web・デザイン風
                          </button>
                          <button
                            type="button"
                            onClick={() => generatePresetSvg('illust')}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-pink-200 text-pink-700 hover:bg-pink-50 transition-colors shadow-2xs"
                          >
                            🎨 イラスト風
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
                         <span>または、画像URLを直接入力</span>
                      </div>
                      <input 
                        type="url"
                        value={formData.thumbnailUrl}
                        onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})}
                        placeholder="https://... (画像のURLを入力)" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-lg font-bold text-slate-800">PDF資料 (最大10個)</span>
                        </label>
                        {formData.pdfs.length < 10 && (
                          <button type="button" onClick={() => addArrayItem('pdfs')} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full">+ 追加</button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {formData.pdfs.map((pdf, index) => (
                          <div key={index} className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative">
                            {formData.pdfs.length > 1 && (
                              <button type="button" onClick={() => removeArrayItem('pdfs', index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                <X className="w-5 h-5" />
                              </button>
                            )}
                            <div className="w-full bg-white border-2 border-dashed border-slate-200 rounded-xl px-5 py-6 text-center hover:border-cyan-500 transition-colors relative cursor-pointer group mb-3 mt-2">
                              <input 
                                type="file" 
                                accept="application/pdf"
                                multiple
                                onChange={(e) => handleFileUpload(e, 'pdfUrl', index)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              {uploadingPdfIndex === index ? (
                                <div className="text-sm font-bold text-cyan-600 flex flex-col items-center justify-center gap-2">
                                  <div className="w-6 h-6 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-1"></div>
                                  アップロード中...
                                </div>
                              ) : pdf && pdf.url && (pdf.url.startsWith('data:') || pdf.url.startsWith('/uploads/')) ? (
                                <div className="text-sm font-bold text-cyan-600 flex flex-col items-center justify-center gap-2">
                                  <CheckCircle2 className="w-6 h-6 text-cyan-500 mb-1" />
                                  PDFをセットしました
                                </div>
                              ) : pdf && pdf.url ? (
                                <div className="text-sm font-bold text-slate-600 flex flex-col items-center justify-center gap-2">
                                  <CheckCircle2 className="w-6 h-6 text-cyan-500 mb-1" />
                                  PDFが設定されています（変更する場合はクリック）
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <UploadCloud className="w-6 h-6 text-slate-400 mb-1 group-hover:text-cyan-500 transition-colors" />
                                  <span className="text-sm font-bold text-slate-600">クリックまたはドラッグでアップロード</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-3">
                              <div>
                                <div className="text-sm font-bold text-slate-700 mb-1">PDF表示名</div>
                                <input 
                                  type="text"
                                  value={pdf.name || ''}
                                  onChange={e => handlePdfChange(index, 'name', e.target.value)}
                                  placeholder="例：作品の企画書" 
                                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-700 mb-1">PDFのURL (自動入力 または 直接入力)</div>
                                <input 
                                  type="url"
                                  value={pdf.url || ''}
                                  onChange={e => handlePdfChange(index, 'url', e.target.value)}
                                  placeholder="https://... (PDFのURL)" 
                                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                            <Video className="w-4 h-4" />
                          </div>
                          <span className="text-lg font-bold text-slate-800">YouTubeリンク (最大10個)</span>
                        </label>
                        {formData.youtubes.length < 10 && (
                          <button type="button" onClick={() => addArrayItem('youtubes')} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full">+ 追加</button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {formData.youtubes.map((yt, index) => (
                          <div key={index} className="relative">
                            {formData.youtubes.length > 1 && (
                              <button type="button" onClick={() => removeArrayItem('youtubes', index)} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 hover:text-red-500 z-10">
                                <X className="w-5 h-5" />
                              </button>
                            )}
                            <input 
                              type="url"
                              value={yt}
                              onChange={e => handleArrayChange('youtubes', index, e.target.value)}
                              placeholder="https://youtube.com/... (YouTube動画のURL)" 
                              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 pr-10"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                            <LinkIcon className="w-4 h-4" />
                          </div>
                          <span className="text-lg font-bold text-slate-800">外部リンク (最大10個)</span>
                        </label>
                        {formData.externalLinks.length < 10 && (
                          <button type="button" onClick={() => addArrayItem('externalLinks')} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full">+ 追加</button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {formData.externalLinks.map((link, index) => (
                          <div key={index} className="relative">
                            {formData.externalLinks.length > 1 && (
                              <button type="button" onClick={() => removeArrayItem('externalLinks', index)} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 hover:text-red-500 z-10">
                                <X className="w-5 h-5" />
                              </button>
                            )}
                            <input 
                              type="url"
                              value={link}
                              onChange={e => handleArrayChange('externalLinks', index, e.target.value)}
                              placeholder="https://... (ポートフォリオやGitHubなどのURL)" 
                              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 pr-10"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                {step === 4 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">保存が完了しました！</h2>
                    <p className="text-slate-600 mb-2">作品紹介ページに情報が反映されました。</p>
                    <p className="text-sm text-slate-500 mb-8">このマイページからいつでも内容の再編集が可能です。</p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      {currentBoothId && (
                        <Link 
                          to={`/booths/${currentBoothId}`}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-7 py-3 rounded-full text-sm font-bold shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          公開ページを確認する
                        </Link>
                      )}
                      <button 
                        onClick={() => setStep(1)}
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-7 py-3 rounded-full text-sm font-bold hover:bg-slate-800 transition-colors shadow-xs"
                      >
                        続けて編集する <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Nav */}
              {step < 4 && (
                <div className="flex items-center justify-between gap-3 mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-slate-100">
                  <button 
                    onClick={() => setStep(s => Math.max(1, s - 1))}
                    className={clsx(
                      "text-slate-600 font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:text-slate-900 transition-colors py-2.5 px-3 rounded-xl min-h-[44px]",
                      step === 1 && "invisible"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" /> 前へ戻る
                  </button>
                  
                  {step < 3 ? (
                    <button 
                      onClick={() => setStep(s => Math.min(4, s + 1))}
                      disabled={isUploadingImage || isUploadingPdf}
                      className={clsx(
                        "bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-1.5 min-h-[44px]",
                        (isUploadingImage || isUploadingPdf) && "opacity-50 cursor-not-allowed hover:translate-y-0"
                      )}
                    >
                      <span>次へ進む</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleSave}
                      disabled={isSaving || isUploadingImage || isUploadingPdf}
                      className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold shadow-md shadow-cyan-500/20 hover:shadow-lg active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 min-h-[44px]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>保存する</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Right Sidebar (Preview & Guidelines) */}
          <div className="w-full lg:w-[380px] flex-shrink-0 space-y-6">
            
            {/* Preview Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-28">
               <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center">
                   <ImageIcon className="w-4 h-4" />
                 </div>
                 投稿イメージ
               </h3>

               <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                 <div className="aspect-[16/9] bg-gradient-to-br from-cyan-100 via-purple-100 to-pink-100 relative">
                    {formData.thumbnailUrl ? (
                      <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400/50">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                 </div>
                 <div className="p-5">
                   <h4 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1">{formData.title || 'タイトルが入ります'}</h4>
                   <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                     {formData.catchphrase || 'ここに一言説明が入ります。作品の魅力を簡単に伝えるテキストです。'}
                   </p>
                   <div className="flex gap-2">
                     <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{formData.tags}</span>
                     <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{user?.courseId || 'コース名'}</span>
                   </div>
                 </div>
               </div>

               {/* Guidelines */}
               <div className="mt-8 pt-8 border-t border-slate-100">
                 <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <span className="text-yellow-500">💡</span> 投稿のポイント
                 </h4>
                 <ul className="space-y-3">
                   {[
                     'タイトルは具体的に',
                     '一言説明は短くわかりやすく',
                     '紹介コメントで作品の魅力をしっかり伝える',
                     'PDFは資料をまとめたものをアップロード',
                     'YouTubeや外部リンクでより詳しい情報を共有できます'
                   ].map((point, idx) => (
                     <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                       <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                       <span className="leading-relaxed">{point}</span>
                     </li>
                   ))}
                 </ul>
               </div>

            </div>

          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">
              作品を削除しますか？
            </h3>
            <p className="text-xs text-slate-500 text-center leading-relaxed mb-6">
              現在公開中の作品「<strong className="text-slate-800">{formData.title || '（無題）'}</strong>」を削除します。ブース一覧および公開ページから削除され、復元はできません。
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDeleteWork}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    削除中...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    削除する
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
