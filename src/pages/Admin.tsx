import React, { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import Papa from 'papaparse';
import { 
  Settings, Users, Heart, Save, UploadCloud, Trash2, Plus, Edit2, X, Check, Shield, Search, Loader2,
  MessageSquare, Download, Store, Filter, BarChart3, Eye, FileSpreadsheet, Send, Bell, ExternalLink
} from 'lucide-react';
import { 
  batchSaveUsers, 
  deleteAllUsers, 
  getAllUsers, 
  getSystemSettings, 
  saveSystemSettings,
  getAllVotes,
  getAllComments,
  resetAllVotes,
  saveUser,
  deleteUser,
  getBoothDetails,
  deleteComment,
  getNews,
  saveNewsItem,
  deleteNewsItem,
  seedDefaultNewsItems
} from '../lib/db';
import { User, SystemSettings, Authority, BoothComment, BoothDetail, NewsItem, NewsCategory } from '../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Admin() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'news' ? 'news' : 'accounts';
  const [activeTab, setActiveTab] = useState<'accounts'|'settings'|'likes'|'news'>(initialTab);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAuthority, setFilterAuthority] = useState('ALL');
  const [settings, setSettings] = useState<SystemSettings>({
    mainTitle: '',
    mainVisualUrl: '',
    comment: '',
    isVotingEnabled: true
  });
  const [isSaving, setIsSaving] = useState(false);

  // News management state
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsSearchQuery, setNewsSearchQuery] = useState('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<'ALL' | NewsCategory>('ALL');
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newsFormData, setNewsFormData] = useState<{
    id?: string;
    title: string;
    date: string;
    category: NewsCategory;
    content: string;
    isNew: boolean;
    author: string;
    externalUrl: string;
  }>({
    title: '',
    date: '',
    category: 'general',
    content: '',
    isNew: true,
    author: '制作展実行委員会',
    externalUrl: ''
  });
  
  // Custom Confirmation Dialog State (avoids iframe window.confirm blocking)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  const [votes, setVotes] = useState<any[]>([]);
  const [comments, setComments] = useState<BoothComment[]>([]);
  const [booths, setBooths] = useState<BoothDetail[]>([]);

  // Likes & Comments management tab state
  const [likesSubTab, setLikesSubTab] = useState<'accounts' | 'booths' | 'comments'>('accounts');
  const [likesSearchQuery, setLikesSearchQuery] = useState('');
  const [selectedBoothFilter, setSelectedBoothFilter] = useState('ALL');
  const [selectedCommentTarget, setSelectedCommentTarget] = useState<{
    targetType: 'account' | 'booth';
    title: string;
    subtitle: string;
    comments: BoothComment[];
    user?: User;
    booth?: BoothDetail;
  } | null>(null);

  // Individual account form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    pass: '',
    name: '',
    authority: 'student' as Authority,
    grade: '',
    courseId: '',
    boothId: '',
    roomId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [fetchedUsers, fetchedSettings, fetchedVotes, fetchedComments, fetchedBooths, fetchedNews] = await Promise.all([
      getAllUsers(),
      getSystemSettings(),
      getAllVotes(),
      getAllComments(),
      getBoothDetails(),
      getNews()
    ]);
    setUsers(fetchedUsers);
    setSettings(fetchedSettings);
    setVotes(fetchedVotes);
    setComments(fetchedComments);
    setBooths(fetchedBooths);
    setNewsItems(fetchedNews);
  };

  // Synchronize URL search params with active tab and action
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'news') {
      setActiveTab('news');
      const action = searchParams.get('action');
      const editId = searchParams.get('edit');
      if (action === 'new') {
        handleOpenAddNewsModal();
      } else if (editId && newsItems.length > 0) {
        const item = newsItems.find(n => n.id === editId);
        if (item) {
          handleOpenEditNewsModal(item);
        }
      }
    }
  }, [searchParams, newsItems.length]);

  const handleOpenAddNewsModal = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setEditingNews(null);
    setNewsFormData({
      title: '',
      date: `${yyyy}.${mm}.${dd}`,
      category: 'general',
      content: '',
      isNew: true,
      author: '制作展実行委員会',
      externalUrl: ''
    });
    setShowNewsModal(true);
  };

  const handleOpenEditNewsModal = (item: NewsItem) => {
    setEditingNews(item);
    setNewsFormData({
      id: item.id,
      title: item.title,
      date: item.date,
      category: item.category,
      content: item.content,
      isNew: item.isNew ?? false,
      author: item.author || '制作展実行委員会',
      externalUrl: item.externalUrl || ''
    });
    setShowNewsModal(true);
  };

  const handleSaveNewsItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsFormData.title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }
    if (!newsFormData.content.trim()) {
      toast.error('本文を入力してください');
      return;
    }
    setIsSaving(true);
    try {
      await saveNewsItem({
        id: newsFormData.id,
        title: newsFormData.title.trim(),
        date: newsFormData.date.trim() || new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
        category: newsFormData.category,
        content: newsFormData.content,
        isNew: newsFormData.isNew,
        author: newsFormData.author.trim() || '制作展実行委員会',
        externalUrl: newsFormData.externalUrl.trim()
      });
      toast.success(editingNews ? 'お知らせを更新しました' : 'お知らせを公開しました');
      setShowNewsModal(false);
      setEditingNews(null);
      await loadData();
    } catch (err) {
      console.error('Error saving news item:', err);
      toast.error('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNewsIsNew = async (item: NewsItem) => {
    const nextIsNew = !item.isNew;
    try {
      await saveNewsItem({
        ...item,
        isNew: nextIsNew
      });
      setNewsItems(prev => prev.map(n => n.id === item.id ? { ...n, isNew: nextIsNew } : n));
      toast.success(nextIsNew ? '「NEW」バッジを有効にしました' : '「NEW」バッジを非表示にしました');
    } catch (err) {
      console.error(err);
      toast.error('更新に失敗しました');
    }
  };

  const handleDeleteNews = (item: NewsItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'お知らせ削除の確認',
      message: `「${item.title}」を削除しますか？この操作は取り消せません。`,
      confirmText: '削除する',
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await deleteNewsItem(item.id);
          toast.success('お知らせを削除しました');
          await loadData();
        } catch (err) {
          console.error(err);
          toast.error('削除に失敗しました');
        } finally {
          setIsSaving(false);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleReseedDefaultNews = () => {
    setConfirmModal({
      isOpen: true,
      title: '初期データ再投入の確認',
      message: 'デフォルトのお知らせ初期データを再投入しますか？既存の記事が初期状態に復元・更新されます。',
      confirmText: '投入する',
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await seedDefaultNewsItems(true);
          toast.success('初期お知らせデータを投入しました');
          await loadData();
        } catch (err) {
          console.error(err);
          toast.error('初期データの投入に失敗しました');
        } finally {
          setIsSaving(false);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        setIsSaving(true);
        try {
          let rows = results.data as any[];
          if (!rows || rows.length === 0) {
            toast.error('CSVファイルにデータが見つかりませんでした');
            setIsSaving(false);
            return;
          }

          // If header parsing failed to find keys or data has array format
          const parsedUsers = rows
            .map((row: any, idx: number) => {
              const keys = Object.keys(row || {});
              const values = Object.values(row || {});
              
              const findVal = (...candidates: string[]) => {
                // First pass: exact matches
                for (const c of candidates) {
                  const targetLower = c.toLowerCase().trim();
                  const foundKey = keys.find(k => {
                    const cleanKey = k.trim().replace(/^\uFEFF/, '').toLowerCase();
                    return cleanKey === targetLower;
                  });
                  if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
                    return String(row[foundKey]).trim();
                  }
                }
                // Second pass: substring match only if candidate is at least 3 characters
                for (const c of candidates) {
                  const targetLower = c.toLowerCase().trim();
                  if (targetLower.length < 3) continue;
                  const foundKey = keys.find(k => {
                    const cleanKey = k.trim().replace(/^\uFEFF/, '').toLowerCase();
                    return cleanKey.includes(targetLower);
                  });
                  if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
                    return String(row[foundKey]).trim();
                  }
                }
                return '';
              };

              let userId = findVal('id', 'ログインid', 'ユーザーid', 'ID', '学籍番号', '生徒id', '番号');
              if (!userId && values.length > 0 && values[0]) {
                userId = String(values[0]).trim();
              }
              if (!userId) return null;

              let pass = findVal('pass', 'パスワード', 'password', 'pass');
              if (!pass && values.length > 1 && values[1]) {
                pass = String(values[1]).trim();
              }
              pass = pass || userId || 'password123';

              let name = findVal('name', '名前', '氏名', '生徒名', '氏　名');
              if (!name && values.length > 2 && values[2]) {
                name = String(values[2]).trim();
              }
              name = name || userId;

              let authority = findVal('authority', '権限', '役割');
              if (!authority && values.length > 3 && values[3]) {
                authority = String(values[3]).trim();
              }

              let grade = findVal('grade', '学年');
              if (!grade && values.length > 4 && values[4]) {
                grade = String(values[4]).trim();
              }

              let courseId = findVal('courseId', 'course', 'コース', 'コースid');
              if (!courseId && values.length > 5 && values[5]) {
                courseId = String(values[5]).trim();
              }

              let boothId = findVal('boothId', 'booth', 'ブースid', 'ブース');
              if (!boothId && values.length > 6 && values[6]) {
                boothId = String(values[6]).trim();
              }

              let roomId = findVal('roomId', 'room', '部屋id', '部屋');
              if (!roomId && values.length > 7 && values[7]) {
                roomId = String(values[7]).trim();
              }

              return {
                id: userId,
                uid: userId,
                loginId: userId,
                pass: pass,
                name: name,
                authority: (authority || 'student') as Authority,
                grade: grade || '',
                courseId: courseId || '',
                boothId: boothId || '',
                roomId: roomId || ''
              };
            })
            .filter((u): u is NonNullable<typeof u> => u !== null);
          
          if (parsedUsers.length === 0) {
            toast.error('有効なアカウントデータが見つかりませんでした（ID列は必須です）');
            setIsSaving(false);
            return;
          }

          // Save in chunks of 400 to respect Firestore batch limit of 500
          for (let i = 0; i < parsedUsers.length; i += 400) {
            const chunk = parsedUsers.slice(i, i + 400);
            await batchSaveUsers(chunk);
          }

          toast.success(`${parsedUsers.length}件のアカウントを取り込みました`);
          await loadData();
        } catch (error) {
          console.error(error);
          toast.error('アカウントの取り込みに失敗しました');
        } finally {
          setIsSaving(false);
          e.target.value = '';
        }
      },
      error: (err) => {
        console.error(err);
        toast.error('CSVの読み込みに失敗しました');
        setIsSaving(false);
      }
    });
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'id,pass,name,authority,grade,courseId,boothId,roomId\nstudent01,password123,山田 太郎,student,1年,ITコース,booth01,room01\nstudent02,password123,佐藤 花子,student,2年,デザインコース,booth02,room02\nadmin01,admin123,管理者 一郎,admin,,,,\n';
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'account_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAllUsers = () => {
    setConfirmModal({
      isOpen: true,
      title: '全データ消去の確認',
      message: 'すべてのアカウント、いいね、コメントなどのデータを完全に消去しますか？この操作は取り消せません。',
      confirmText: 'すべて削除する',
      onConfirm: async () => {
        setIsSaving(true);
        setUsers([]);
        setVotes([]);
        setComments([]);
        try {
          await deleteAllUsers();
          await loadData();
          toast.success('すべてのデータを削除しました');
        } catch (err) {
          console.error('Delete all error:', err);
          toast.error('削除に失敗しました');
          await loadData();
        } finally {
          setIsSaving(false);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleSaveIndividualUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      toast.error('IDと名前は必須です');
      return;
    }

    setIsSaving(true);
    try {
      const userObj: User = {
        id: formData.id,
        uid: formData.id,
        loginId: formData.id,
        pass: formData.pass || 'password',
        name: formData.name,
        authority: formData.authority,
        grade: formData.grade,
        courseId: formData.courseId,
        boothId: formData.boothId,
        roomId: formData.roomId
      };

      await saveUser(userObj);
      toast.success(editingUser ? 'アカウントを更新しました' : 'アカウントを追加しました');
      setShowAddModal(false);
      setEditingUser(null);
      setFormData({ id: '', pass: '', name: '', authority: 'student', grade: '', courseId: '', boothId: '', roomId: '' });
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setFormData({
      id: u.id,
      pass: u.pass || '',
      name: u.name || '',
      authority: u.authority || 'student',
      grade: u.grade || '',
      courseId: u.courseId || '',
      boothId: u.boothId || '',
      roomId: u.roomId || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteUser = (id: string, loginId?: string, userName?: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'アカウント削除の確認',
      message: `アカウント「${userName || id}」（ID: ${loginId || id}）を削除しますか？この操作は取り消せません。`,
      confirmText: '削除する',
      onConfirm: async () => {
        setIsSaving(true);
        setUsers(prev => prev.filter(u => {
          const uId = String(u.id || '').trim();
          const uLoginId = String(u.loginId || '').trim();
          const uUid = String(u.uid || '').trim();
          const targetId = String(id || '').trim();
          const targetLoginId = String(loginId || '').trim();

          return (
            uId !== targetId &&
            uId !== targetLoginId &&
            uLoginId !== targetId &&
            uLoginId !== targetLoginId &&
            uUid !== targetId &&
            uUid !== targetLoginId
          );
        }));
        try {
          await deleteUser(id);
          if (loginId && loginId !== id) {
            await deleteUser(loginId);
          }
          await loadData();
          toast.success('アカウントを削除しました');
        } catch (err) {
          console.error('Delete user error:', err);
          toast.error('削除に失敗しました');
          await loadData();
        } finally {
          setIsSaving(false);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveSystemSettings(settings);
      toast.success('設定を保存しました');
    } catch {
      toast.error('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadCSV = (filename: string, rows: (string | number)[][]) => {
    const csvContent = rows
      .map(row => 
        row.map(cell => {
          const str = String(cell ?? '').replace(/"/g, '""');
          return `"${str}"`;
        }).join(',')
      )
      .join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. アカウント別 受信コメント詳細一覧 (CSV) - どんなコメントが届いたかを全件収集
  const handleExportAccountReceivedCommentsCSV = () => {
    const headers = [
      '受信アカウントID',
      '受信者氏名',
      '権限',
      'コース',
      '学年',
      '対象ブースID',
      'ブース名',
      'コメント投稿日時',
      'コメント投稿者ID',
      'コメント投稿者名',
      'コメント本文'
    ];
    const rows: (string | number)[][] = [headers];

    // 各ユーザー宛て（担当ブース宛て）のコメントを収集
    users.forEach(u => {
      const b = booths.find(item => (u.boothId && item.id === u.boothId) || item.userId === u.id || item.userLoginId === u.loginId || item.userId === u.loginId);
      const boothId = b ? b.id : (u.boothId || '');
      const boothTitle = b ? b.title : (u.boothId || '-');
      const received = comments.filter(c => (b && c.boothId === b.id) || (u.boothId && c.boothId === u.boothId));
      received.forEach(c => {
        const timeStr = c.createdAt ? new Date(c.createdAt).toLocaleString('ja-JP') : '';
        rows.push([
          u.loginId || u.id,
          u.name,
          u.authority,
          u.courseId || '',
          u.grade || '',
          boothId,
          boothTitle,
          timeStr,
          c.userId || '',
          c.userName || '',
          c.text || ''
        ]);
      });
    });

    // ユーザーに紐付かないブースのコメントも漏れなく出力
    const mappedBoothIds = new Set<string>();
    booths.forEach(b => {
      const isMapped = users.some(u => u.boothId === b.id || b.userId === u.id || b.userLoginId === u.loginId);
      if (isMapped) mappedBoothIds.add(b.id);
    });
    users.forEach(u => { if (u.boothId) mappedBoothIds.add(u.boothId); });
    const unmappedComments = comments.filter(c => !mappedBoothIds.has(c.boothId));
    unmappedComments.forEach(c => {
      const b = booths.find(item => item.id === c.boothId);
      const timeStr = c.createdAt ? new Date(c.createdAt).toLocaleString('ja-JP') : '';
      rows.push([
        '(未割当)',
        b?.authorName || '(出展者不明)',
        '-',
        b?.courseName || '',
        b?.grade || '',
        c.boothId,
        b?.title || c.boothId,
        timeStr,
        c.userId || '',
        c.userName || '',
        c.text || ''
      ]);
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(`account_received_comments_${dateStr}.csv`, rows);
    toast.success('アカウント別 受信コメント一覧CSVをダウンロードしました');
  };

  // 2. アカウント別 いいね・コメント集計サマリー (CSV)
  const handleExportAccountSummaryCSV = () => {
    const headers = [
      'ログインID',
      '氏名',
      '権限',
      'コース',
      '学年',
      '担当ブースID',
      'ブース名',
      '獲得いいね数',
      '投票したいいね数',
      '受信コメント数',
      '投稿したコメント数'
    ];
    const rows: (string | number)[][] = [headers];
    users.forEach(u => {
      const b = booths.find(item => (u.boothId && item.id === u.boothId) || item.userId === u.id || item.userLoginId === u.loginId || item.userId === u.loginId);
      const boothId = b ? b.id : (u.boothId || '');
      const boothTitle = b ? b.title : (u.boothId || '-');
      const recVotes = votes.filter(v => (b && v.boothId === b.id) || (u.boothId && v.boothId === u.boothId)).length;
      const givenVotes = votes.filter(v => v.userId === u.id || v.userId === u.loginId).length;
      const recComments = comments.filter(c => (b && c.boothId === b.id) || (u.boothId && c.boothId === u.boothId)).length;
      const sentComments = comments.filter(c => c.userId === u.id || c.userId === u.loginId).length;
      rows.push([
        u.loginId || u.id,
        u.name,
        u.authority,
        u.courseId || '',
        u.grade || '',
        boothId,
        boothTitle,
        recVotes,
        givenVotes,
        recComments,
        sentComments
      ]);
    });
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(`account_summary_${dateStr}.csv`, rows);
    toast.success('アカウント別 集計サマリーCSVをダウンロードしました');
  };

  // 3. ブース別 いいね・コメント集計サマリー (CSV)
  const handleExportBoothSummaryCSV = () => {
    const headers = [
      'ブースID',
      'ブース名/作品名',
      '出展者名',
      'コース',
      '教室',
      '階',
      '獲得いいね数',
      '受信コメント数'
    ];
    const rows: (string | number)[][] = [headers];
    const allBoothIds = new Set<string>();
    booths.forEach(b => allBoothIds.add(b.id));
    users.forEach(u => { if (u.boothId) allBoothIds.add(u.boothId); });

    Array.from(allBoothIds).forEach(bId => {
      const b = booths.find(item => item.id === bId);
      const user = users.find(u => u.boothId === bId);
      const recVotes = votes.filter(v => v.boothId === bId).length;
      const recComments = comments.filter(c => c.boothId === bId).length;
      rows.push([
        bId,
        b?.title || `ブース ${bId}`,
        b?.authorName || user?.name || '-',
        b?.courseName || user?.courseId || '-',
        b?.roomName || user?.roomId || '-',
        b?.floor || '-',
        recVotes,
        recComments
      ]);
    });
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(`booth_summary_${dateStr}.csv`, rows);
    toast.success('ブース別 集計サマリーCSVをダウンロードしました');
  };

  // 4. 全コメント一覧 (CSV)
  const handleExportAllCommentsCSV = () => {
    const headers = ['コメントID', '対象ブースID', 'ブース名', '受信アカウント', '投稿日時', '投稿者ID', '投稿者名', 'コメント本文'];
    const rows: (string | number)[][] = [headers];
    comments.forEach(c => {
      const b = booths.find(item => item.id === c.boothId);
      const u = users.find(user => user.boothId && user.boothId === c.boothId);
      const timeStr = c.createdAt ? new Date(c.createdAt).toLocaleString('ja-JP') : '';
      rows.push([
        c.id || '',
        c.boothId,
        b?.title || '',
        u ? `${u.name} (${u.loginId || u.id})` : '-',
        timeStr,
        c.userId || '',
        c.userName || '',
        c.text || ''
      ]);
    });
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(`all_comments_${dateStr}.csv`, rows);
    toast.success('全コメント詳細CSVをダウンロードしました');
  };

  // 5. 単一アカウント宛てのコメントCSVダウンロード
  const handleExportSingleAccountCommentsCSV = (targetUser: User, targetComments: BoothComment[]) => {
    const headers = ['受信アカウントID', '受信者氏名', 'ブースID', '投稿日時', '投稿者ID', '投稿者名', 'コメント本文'];
    const rows: (string | number)[][] = [headers];
    targetComments.forEach(c => {
      const timeStr = c.createdAt ? new Date(c.createdAt).toLocaleString('ja-JP') : '';
      rows.push([
        targetUser.loginId || targetUser.id,
        targetUser.name,
        targetUser.boothId || c.boothId,
        timeStr,
        c.userId || '',
        c.userName || '',
        c.text || ''
      ]);
    });
    downloadCSV(`comments_${targetUser.loginId || targetUser.id}.csv`, rows);
    toast.success(`${targetUser.name}さんの受信コメントCSVをダウンロードしました`);
  };

  // 6. 単一ブース宛てのコメントCSVダウンロード
  const handleExportSingleBoothCommentsCSV = (targetBooth: BoothDetail, targetComments: BoothComment[]) => {
    const headers = ['ブースID', 'ブース名', '出展者名', '投稿日時', '投稿者ID', '投稿者名', 'コメント本文'];
    const rows: (string | number)[][] = [headers];
    targetComments.forEach(c => {
      const timeStr = c.createdAt ? new Date(c.createdAt).toLocaleString('ja-JP') : '';
      rows.push([
        targetBooth.id,
        targetBooth.title || targetBooth.id,
        targetBooth.authorName || '',
        timeStr,
        c.userId || '',
        c.userName || '',
        c.text || ''
      ]);
    });
    downloadCSV(`comments_booth_${targetBooth.id}.csv`, rows);
    toast.success(`${targetBooth.title || targetBooth.id}の受信コメントCSVをダウンロードしました`);
  };

  // コメントの個別削除
  const handleDeleteComment = (commentId: string, authorName?: string) => {
    if (!commentId) return;
    setConfirmModal({
      isOpen: true,
      title: 'コメント削除の確認',
      message: `このコメント（投稿者: ${authorName || '不明'}）を削除しますか？この操作は取り消せません。`,
      confirmText: '削除する',
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await deleteComment(commentId);
          await loadData();
          toast.success('コメントを削除しました');
          if (selectedCommentTarget) {
            setSelectedCommentTarget(prev => prev ? {
              ...prev,
              comments: prev.comments.filter(c => c.id !== commentId)
            } : null);
          }
        } catch (err) {
          console.error(err);
          toast.error('コメントの削除に失敗しました');
        } finally {
          setIsSaving(false);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleResetVotes = () => {
    setConfirmModal({
      isOpen: true,
      title: 'いいねリセットの確認',
      message: 'すべての「いいね」をリセットしますか？この操作は取り消せません。',
      confirmText: 'リセットする',
      onConfirm: async () => {
        setIsSaving(true);
        setVotes([]);
        setComments([]);
        try {
          await resetAllVotes();
          await loadData();
          toast.success('リセットしました');
        } catch (err) {
          console.error('Reset votes error:', err);
          toast.error('リセットに失敗しました');
          await loadData();
        } finally {
          setIsSaving(false);
          setConfirmModal(null);
        }
      }
    });
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || 
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.loginId && u.loginId.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q)) ||
      (u.courseId && u.courseId.toLowerCase().includes(q)) ||
      (u.boothId && u.boothId.toLowerCase().includes(q));
    const matchAuth = filterAuthority === 'ALL' || u.authority === filterAuthority;
    return matchQuery && matchAuth;
  });

  const NEWS_CATEGORIES_CONFIG: { key: NewsCategory; label: string; badgeClass: string }[] = [
    { key: 'important', label: '重要', badgeClass: 'bg-rose-500 text-white' },
    { key: 'event', label: 'イベント', badgeClass: 'bg-blue-600 text-white' },
    { key: 'exhibitor', label: '出展者へ', badgeClass: 'bg-amber-500 text-white' },
    { key: 'general', label: 'お知らせ', badgeClass: 'bg-emerald-600 text-white' },
  ];

  const filteredNewsItems = newsItems.filter(item => {
    const matchesCategory = newsCategoryFilter === 'ALL' || item.category === newsCategoryFilter;
    const q = newsSearchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      item.title.toLowerCase().includes(q) ||
      (item.summary && item.summary.toLowerCase().includes(q)) ||
      item.content.toLowerCase().includes(q) ||
      (item.author && item.author.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  const getNewsBadge = (category: NewsCategory) => {
    switch (category) {
      case 'important':
        return <span className="bg-rose-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs">重要</span>;
      case 'event':
        return <span className="bg-blue-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs">イベント</span>;
      case 'exhibitor':
        return <span className="bg-amber-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs">出展者へ</span>;
      default:
        return <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs">お知らせ</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 mb-6 sm:mb-8 flex items-center gap-2.5 sm:gap-3">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-500 shrink-0" />
          <span>管理者メンテナンス</span>
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-6 sm:mb-8 bg-white p-1.5 sm:p-2 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setActiveTab('accounts')}
            className={`py-2.5 sm:py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${activeTab === 'accounts' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">アカウント</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 sm:py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="truncate">メイン設定</span>
          </button>
          <button 
            onClick={() => setActiveTab('likes')}
            className={`py-2.5 sm:py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${activeTab === 'likes' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Heart className="w-4 h-4 shrink-0" />
            <span className="truncate">いいね/コメント</span>
          </button>
          <button 
            onClick={() => setActiveTab('news')}
            className={`py-2.5 sm:py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${activeTab === 'news' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span className="truncate">お知らせ ({newsItems.length})</span>
          </button>
        </div>

        {activeTab === 'accounts' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">アカウント管理・権限設定</h2>
                <p className="text-xs text-slate-500 mt-1">個別のアカウント追加・編集、CSV一括インポートが行えます。</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setEditingUser(null);
                    setFormData({ id: '', pass: '', name: '', authority: 'student', grade: '', courseId: '', boothId: '', roomId: '' });
                    setShowAddModal(true);
                  }}
                  className="px-5 py-3 bg-cyan-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-cyan-600 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> アカウント新規追加
                </button>
                <button 
                  onClick={handleDeleteAllUsers}
                  disabled={isSaving}
                  className="px-5 py-3 bg-pink-50 text-pink-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-pink-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> 全データ消去
                </button>
              </div>
            </div>

            {/* CSV Upload Section */}
            <div className="mb-10 p-6 bg-cyan-50/50 border-2 border-dashed border-cyan-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-sm font-bold text-cyan-900 mb-1">CSV一括アップロード</div>
                <div className="text-xs text-cyan-700">列名: id (またはID), pass, name, authority, grade, courseId (またはCourse), boothId, roomId</div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownloadTemplate}
                  className="px-4 py-3 bg-white border border-cyan-300 text-cyan-700 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-cyan-50 transition-colors"
                >
                  テンプレートCSVダウンロード
                </button>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-cyan-700 transition-colors pointer-events-none">
                    <UploadCloud className="w-4 h-4" /> CSVファイルを選択
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                登録済みアカウント一覧 ({filteredUsers.length} / {users.length}件)
              </h3>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ID・名前・コースで検索..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <select
                  value={filterAuthority}
                  onChange={e => setFilterAuthority(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="ALL">すべての権限</option>
                  <option value="student">student (学生)</option>
                  <option value="admin">admin (管理者)</option>
                  <option value="event">event (イベント係)</option>
                  <option value="guest">guest (ゲスト)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <th className="p-4 font-bold rounded-tl-xl">ログインID</th>
                    <th className="p-4 font-bold">名前</th>
                    <th className="p-4 font-bold">権限</th>
                    <th className="p-4 font-bold">コース</th>
                    <th className="p-4 font-bold">学年</th>
                    <th className="p-4 font-bold">ブースID</th>
                    <th className="p-4 font-bold rounded-tr-xl text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono text-xs font-bold text-slate-900">{u.loginId || u.id}</td>
                      <td className="p-4 text-slate-700 font-bold">{u.name}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          u.authority === 'admin' ? 'bg-red-100 text-red-700' : 
                          u.authority === 'student' ? 'bg-blue-100 text-blue-700' : 
                          u.authority === 'event' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Shield className="w-3 h-3" /> {u.authority}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{u.courseId || '-'}</td>
                      <td className="p-4 text-slate-600">{u.grade || '-'}</td>
                      <td className="p-4 text-slate-600 font-mono text-xs">{u.boothId || '-'}</td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => handleEditClick(u)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> 編集
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.loginId, u.name)}
                          className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> 削除
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        {users.length === 0 ? '登録されているアカウントはありません。' : '条件に一致するアカウントが見つかりません。'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add / Edit Account Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {editingUser ? 'アカウント情報の編集' : '新規アカウント追加'}
              </h3>

              <form onSubmit={handleSaveIndividualUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ログインID (一意)</label>
                  <input 
                    type="text" 
                    required
                    disabled={!!editingUser}
                    value={formData.id}
                    onChange={e => setFormData({...formData, id: e.target.value})}
                    placeholder="例: student01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">パスワード</label>
                  <input 
                    type="text" 
                    required
                    value={formData.pass}
                    onChange={e => setFormData({...formData, pass: e.target.value})}
                    placeholder="パスワード"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">名前</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="例: 山田 太郎"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">権限 (Authority)</label>
                  <select 
                    value={formData.authority}
                    onChange={e => setFormData({...formData, authority: e.target.value as Authority})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                  >
                    <option value="student">student (学生)</option>
                    <option value="admin">admin (管理者)</option>
                    <option value="event">event (運営)</option>
                    <option value="guest">guest (ゲスト)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">コース (Course)</label>
                    <input 
                      type="text" 
                      value={formData.courseId}
                      onChange={e => setFormData({...formData, courseId: e.target.value})}
                      placeholder="例: ITエンジニア科"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">学年 (Grade)</label>
                    <input 
                      type="text" 
                      value={formData.grade}
                      onChange={e => setFormData({...formData, grade: e.target.value})}
                      placeholder="例: 1年"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ブースID (Booth ID)</label>
                    <input 
                      type="text" 
                      value={formData.boothId}
                      onChange={e => setFormData({...formData, boothId: e.target.value})}
                      placeholder="例: booth01"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ルームID (Room ID)</label>
                    <input 
                      type="text" 
                      value={formData.roomId}
                      onChange={e => setFormData({...formData, roomId: e.target.value})}
                      placeholder="例: 101"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                  >
                    キャンセル
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                  >
                    保存する
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">システム設定</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">メインタイトル</label>
                <input 
                  type="text" 
                  value={settings.mainTitle}
                  onChange={e => setSettings({...settings, mainTitle: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">表示コメント</label>
                <textarea 
                  rows={3}
                  value={settings.comment}
                  onChange={e => setSettings({...settings, comment: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">メインビジュアル画像URL</label>
                <input 
                  type="text" 
                  value={settings.mainVisualUrl}
                  onChange={e => setSettings({...settings, mainVisualUrl: e.target.value})}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div className="flex items-center gap-3 py-4">
                <input 
                  type="checkbox" 
                  id="voting"
                  checked={settings.isVotingEnabled}
                  onChange={e => setSettings({...settings, isVotingEnabled: e.target.checked})}
                  className="w-5 h-5 text-cyan-500 rounded focus:ring-cyan-500"
                />
                <label htmlFor="voting" className="text-sm font-bold text-slate-700">投票（いいね）機能を受付中にする</label>
              </div>

              <div className="pt-6 border-t">
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  <Save className="w-4 h-4" /> 設定を保存する
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'likes' && (() => {
          const filteredLikesUsers = users.filter(u => {
            const q = likesSearchQuery.toLowerCase().trim();
            if (!q) return true;
            return (
              (u.name && u.name.toLowerCase().includes(q)) ||
              (u.loginId && u.loginId.toLowerCase().includes(q)) ||
              (u.id && u.id.toLowerCase().includes(q)) ||
              (u.courseId && u.courseId.toLowerCase().includes(q)) ||
              (u.boothId && u.boothId.toLowerCase().includes(q))
            );
          });

          const allBoothIdsSet = new Set<string>();
          booths.forEach(b => allBoothIdsSet.add(b.id));
          users.forEach(u => { if (u.boothId) allBoothIdsSet.add(u.boothId); });

          const boothList = Array.from(allBoothIdsSet).map(bId => {
            const b = booths.find(item => item.id === bId);
            const u = users.find(item => item.boothId === bId);
            const likeCount = votes.filter(v => v.boothId === bId).length;
            const commentCount = comments.filter(c => c.boothId === bId).length;
            return {
              id: bId,
              title: b?.title || `ブース ${bId}`,
              authorName: b?.authorName || u?.name || '未設定',
              courseName: b?.courseName || u?.courseId || '-',
              roomName: b?.roomName || u?.roomId || '-',
              floor: b?.floor || '-',
              likeCount,
              commentCount,
              boothObj: b,
              userObj: u
            };
          }).filter(b => {
            const q = likesSearchQuery.toLowerCase().trim();
            if (!q) return true;
            return (
              b.id.toLowerCase().includes(q) ||
              b.title.toLowerCase().includes(q) ||
              b.authorName.toLowerCase().includes(q) ||
              b.courseName.toLowerCase().includes(q)
            );
          });

          const filteredComments = comments.filter(c => {
            const matchBooth = selectedBoothFilter === 'ALL' || c.boothId === selectedBoothFilter;
            const q = likesSearchQuery.toLowerCase().trim();
            const b = booths.find(item => item.id === c.boothId);
            const u = users.find(item => item.boothId === c.boothId);
            const matchQuery = !q ||
              (c.text && c.text.toLowerCase().includes(q)) ||
              (c.userName && c.userName.toLowerCase().includes(q)) ||
              (c.userId && c.userId.toLowerCase().includes(q)) ||
              (c.boothId && c.boothId.toLowerCase().includes(q)) ||
              (b?.title && b.title.toLowerCase().includes(q)) ||
              (u?.name && u.name.toLowerCase().includes(q));
            return matchBooth && matchQuery;
          });

          return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">
              {/* Top Header & Global CSV Export Actions */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 border-b border-slate-100 gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                    <h2 className="text-xl md:text-2xl font-black text-slate-900">いいね・コメント総合管理</h2>
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">
                    各アカウント・ブースごとのいいね数・コメント管理とCSVエクスポート（アカウント別の受信コメント収集・集計）が行えます。
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* ★ 主要機能: アカウント別 受信コメント全件収集 CSV */}
                  <button 
                    onClick={handleExportAccountReceivedCommentsCSV}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-md shadow-cyan-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    title="各アカウントに届いたコメントを全件リストアップしたCSVを出力します"
                  >
                    <Download className="w-4 h-4" />
                    <span>アカウント別 受信コメント収集 (CSV)</span>
                    <span className="px-1.5 py-0.5 bg-white/25 text-[10px] rounded-md tracking-wider">全件</span>
                  </button>

                  {/* アカウント別 サマリー CSV */}
                  <button 
                    onClick={handleExportAccountSummaryCSV}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                    <span>アカウント集計サマリー</span>
                  </button>

                  {/* ブース別 サマリー CSV */}
                  <button 
                    onClick={handleExportBoothSummaryCSV}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Store className="w-4 h-4 text-slate-500" />
                    <span>ブース集計サマリー</span>
                  </button>

                  {/* 全コメント一覧 CSV */}
                  <button 
                    onClick={handleExportAllCommentsCSV}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                    <span>全コメント一覧</span>
                  </button>

                  {/* いいねリセット */}
                  <button 
                    onClick={handleResetVotes}
                    disabled={isSaving}
                    className="px-3.5 py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 ml-auto lg:ml-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>全いいねリセット</span>
                  </button>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                    <span>登録アカウント数</span>
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-slate-800">{users.length} <span className="text-xs font-normal text-slate-500">人</span></div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-50/70 to-cyan-100/50 border border-cyan-100">
                  <div className="flex items-center justify-between text-cyan-800 text-xs font-bold mb-2">
                    <span>展示ブース数</span>
                    <Store className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-cyan-900">{allBoothIdsSet.size} <span className="text-xs font-normal text-cyan-700">ブース</span></div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/80 to-rose-100/60 border border-pink-100">
                  <div className="flex items-center justify-between text-pink-800 text-xs font-bold mb-2">
                    <span>総獲得いいね数</span>
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-pink-600">{votes.length} <span className="text-xs font-normal text-pink-500">回</span></div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-100/50 border border-indigo-100">
                  <div className="flex items-center justify-between text-indigo-800 text-xs font-bold mb-2">
                    <span>総コメント数</span>
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-indigo-900">{comments.length} <span className="text-xs font-normal text-indigo-600">件</span></div>
                </div>
              </div>

              {/* Subtabs Selector */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl gap-1">
                  <button
                    onClick={() => { setLikesSubTab('accounts'); setLikesSearchQuery(''); }}
                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
                      likesSubTab === 'accounts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>アカウント別 いいね・コメント ({users.length})</span>
                  </button>

                  <button
                    onClick={() => { setLikesSubTab('booths'); setLikesSearchQuery(''); }}
                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
                      likesSubTab === 'booths' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>ブース別 いいね・コメント ({allBoothIdsSet.size})</span>
                  </button>

                  <button
                    onClick={() => { setLikesSubTab('comments'); setLikesSearchQuery(''); }}
                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
                      likesSubTab === 'comments' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>全コメント一覧・削除 ({comments.length})</span>
                  </button>
                </div>

                {/* Search Bar for current subtab */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={likesSearchQuery}
                    onChange={e => setLikesSearchQuery(e.target.value)}
                    placeholder={
                      likesSubTab === 'accounts' ? '氏名・ID・ブースで検索...' :
                      likesSubTab === 'booths' ? 'ブース名・出展者で検索...' :
                      'コメント・投稿者・ブースで検索...'
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {likesSearchQuery && (
                    <button
                      onClick={() => setLikesSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Subtab 1: アカウント別 いいね・コメント */}
              {likesSubTab === 'accounts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                    <span>アカウント表示: {filteredLikesUsers.length} 件</span>
                    <span>各行の「コメント確認」から届いたメッセージの閲覧や個別CSV出力が可能です</span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-100">
                          <th className="p-4">ログインID</th>
                          <th className="p-4">氏名</th>
                          <th className="p-4">権限</th>
                          <th className="p-4">コース / 学年</th>
                          <th className="p-4">担当ブース</th>
                          <th className="p-4 text-center">獲得いいね</th>
                          <th className="p-4 text-center">投票した数</th>
                          <th className="p-4 text-center">受信コメント</th>
                          <th className="p-4 text-center">投稿コメント</th>
                          <th className="p-4 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {filteredLikesUsers.map(u => {
                          const b = booths.find(item => (u.boothId && item.id === u.boothId) || item.userId === u.id || item.userLoginId === u.loginId || item.userId === u.loginId);
                          const boothId = b ? b.id : (u.boothId || '');
                          const boothTitle = b ? b.title : (u.boothId || '-');
                          const recVotes = votes.filter(v => (b && v.boothId === b.id) || (u.boothId && v.boothId === u.boothId)).length;
                          const givenVotes = votes.filter(v => v.userId === u.id || v.userId === u.loginId).length;
                          const recComments = comments.filter(c => (b && c.boothId === b.id) || (u.boothId && c.boothId === u.boothId));
                          const sentCommentsCount = comments.filter(c => c.userId === u.id || c.userId === u.loginId).length;

                          return (
                            <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-4 font-mono text-xs font-bold text-slate-800">{u.loginId || u.id}</td>
                              <td className="p-4 font-bold text-slate-900">{u.name}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                  u.authority === 'admin' ? 'bg-red-50 text-red-700' :
                                  u.authority === 'student' ? 'bg-blue-50 text-blue-700' :
                                  u.authority === 'event' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {u.authority}
                                </span>
                              </td>
                              <td className="p-4 text-slate-600 text-xs">
                                <div>{u.courseId || '-'}</div>
                                {u.grade && <div className="text-slate-400">{u.grade}</div>}
                              </td>
                              <td className="p-4 text-slate-700 text-xs">
                                {boothId ? (
                                  <div>
                                    <span className="font-mono font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">{boothId}</span>
                                    {boothTitle && boothTitle !== '-' && <div className="text-slate-500 truncate max-w-[150px]">{boothTitle}</div>}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  recVotes > 0 ? 'bg-pink-100 text-pink-700' : 'text-slate-400 bg-slate-50'
                                }`}>
                                  <Heart className={`w-3 h-3 ${recVotes > 0 ? 'fill-pink-500 text-pink-500' : ''}`} />
                                  {recVotes}
                                </span>
                              </td>
                              <td className="p-4 text-center font-mono text-xs text-slate-600">
                                {givenVotes}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  recComments.length > 0 ? 'bg-cyan-100 text-cyan-800' : 'text-slate-400 bg-slate-50'
                                }`}>
                                  <MessageSquare className="w-3 h-3 text-cyan-600" />
                                  {recComments.length}
                                </span>
                              </td>
                              <td className="p-4 text-center font-mono text-xs text-slate-600">
                                {sentCommentsCount}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedCommentTarget({
                                        targetType: 'account',
                                        title: `${u.name} さんの受信コメント一覧`,
                                        subtitle: `ID: ${u.loginId || u.id} | 担当ブース: ${u.boothId || '未設定'} (${boothTitle})`,
                                        comments: recComments,
                                        user: u
                                      });
                                    }}
                                    className="px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                                    title="このアカウントに届いたコメントを確認します"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>確認 ({recComments.length})</span>
                                  </button>

                                  <button
                                    onClick={() => handleExportSingleAccountCommentsCSV(u, recComments)}
                                    disabled={recComments.length === 0}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none"
                                    title="このアカウントの受信コメントCSVをダウンロードします"
                                  >
                                    <Download className="w-3.5 h-3.5 text-slate-500" />
                                    <span>CSV</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredLikesUsers.length === 0 && (
                          <tr>
                            <td colSpan={10} className="text-center py-12 text-slate-400 text-sm">
                              該当するアカウントが見つかりません。
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Subtab 2: ブース別 いいね・コメント */}
              {likesSubTab === 'booths' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                    <span>ブース表示: {boothList.length} 件</span>
                    <span>ブース宛てに投稿されたいいね数およびコメントの管理が可能です</span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-100">
                          <th className="p-4">ブースID</th>
                          <th className="p-4">作品名 / ブース名</th>
                          <th className="p-4">出展者名</th>
                          <th className="p-4">コース</th>
                          <th className="p-4">教室 / 階</th>
                          <th className="p-4 text-center">獲得いいね数</th>
                          <th className="p-4 text-center">受信コメント数</th>
                          <th className="p-4 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {boothList.map(bItem => {
                          const boothComments = comments.filter(c => c.boothId === bItem.id);

                          return (
                            <tr key={bItem.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-4 font-mono text-xs font-bold text-cyan-700">
                                <span className="bg-cyan-50 px-2 py-1 rounded-md">{bItem.id}</span>
                              </td>
                              <td className="p-4 font-bold text-slate-900">{bItem.title}</td>
                              <td className="p-4 text-slate-700 font-bold text-xs">{bItem.authorName}</td>
                              <td className="p-4 text-slate-600 text-xs">{bItem.courseName}</td>
                              <td className="p-4 text-slate-600 text-xs">
                                {bItem.roomName} ({bItem.floor})
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  bItem.likeCount > 0 ? 'bg-pink-100 text-pink-700' : 'text-slate-400 bg-slate-50'
                                }`}>
                                  <Heart className={`w-3 h-3 ${bItem.likeCount > 0 ? 'fill-pink-500 text-pink-500' : ''}`} />
                                  {bItem.likeCount}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  boothComments.length > 0 ? 'bg-cyan-100 text-cyan-800' : 'text-slate-400 bg-slate-50'
                                }`}>
                                  <MessageSquare className="w-3 h-3 text-cyan-600" />
                                  {boothComments.length}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedCommentTarget({
                                        targetType: 'booth',
                                        title: `ブース「${bItem.title}」の受信コメント`,
                                        subtitle: `ブースID: ${bItem.id} | 出展者: ${bItem.authorName}`,
                                        comments: boothComments,
                                        booth: bItem.boothObj || ({ id: bItem.id, title: bItem.title, authorName: bItem.authorName } as any)
                                      });
                                    }}
                                    className="px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                                    title="このブースに届いたコメントを確認します"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>確認 ({boothComments.length})</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      const targetB = bItem.boothObj || ({ id: bItem.id, title: bItem.title, authorName: bItem.authorName } as any);
                                      handleExportSingleBoothCommentsCSV(targetB, boothComments);
                                    }}
                                    disabled={boothComments.length === 0}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none"
                                    title="このブースの受信コメントCSVをダウンロードします"
                                  >
                                    <Download className="w-3.5 h-3.5 text-slate-500" />
                                    <span>CSV</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {boothList.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                              該当するブースが見つかりません。
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Subtab 3: 全コメント一覧・削除 */}
              {likesSubTab === 'comments' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        ブース絞り込み:
                      </label>
                      <select
                        value={selectedBoothFilter}
                        onChange={e => setSelectedBoothFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="ALL">すべてのブース ({comments.length}件)</option>
                        {Array.from(allBoothIdsSet).map(bId => {
                          const count = comments.filter(c => c.boothId === bId).length;
                          const b = booths.find(item => item.id === bId);
                          return (
                            <option key={bId} value={bId}>
                              {b?.title ? `${b.title} (${bId})` : `ブース ${bId}`} - {count}件
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="text-xs text-slate-500 font-bold">
                      表示中: {filteredComments.length} / {comments.length} 件
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {filteredComments.map((c, idx) => {
                      const b = booths.find(item => item.id === c.boothId);
                      const u = users.find(item => item.boothId && item.boothId === c.boothId);
                      const timeStr = c.createdAt ? new Date(c.createdAt).toLocaleString('ja-JP') : '';

                      return (
                        <div key={c.id || idx} className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200/70 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 border-b border-slate-200/50 gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 font-mono text-xs font-bold">
                                {c.boothId}
                              </span>
                              <span className="font-bold text-xs text-slate-800">
                                {b?.title || `ブース ${c.boothId}`}
                              </span>
                              {u && (
                                <span className="text-xs text-slate-500">
                                  (出展者: <span className="font-bold text-slate-700">{u.name}</span>)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-slate-400 font-mono">{timeStr}</span>
                              <button
                                onClick={() => handleDeleteComment(c.id, c.userName || c.userId)}
                                className="p-1.5 text-pink-500 hover:text-pink-700 hover:bg-pink-100 rounded-lg transition-colors"
                                title="このコメントを削除する"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-start justify-between gap-4">
                            <p className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                              {c.text}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-bold text-slate-600">投稿者:</span>
                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-700">
                              {c.userName || 'ゲスト'} {c.userId ? `(${c.userId})` : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {filteredComments.length === 0 && (
                      <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                        条件に一致するコメントはありません。
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Target Comments Modal (for individual Account or Booth) */}
              {selectedCommentTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                  <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative max-h-[85vh] flex flex-col border border-slate-100">
                    <button 
                      onClick={() => setSelectedCommentTarget(null)}
                      className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Modal Header */}
                    <div className="pb-4 border-b border-slate-100 pr-10">
                      <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase mb-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>受信コメント詳細</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{selectedCommentTarget.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{selectedCommentTarget.subtitle}</p>
                    </div>

                    {/* Modal Comments List */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2 my-2">
                      {selectedCommentTarget.comments.map((c, i) => {
                        const timeStr = c.createdAt ? new Date(c.createdAt).toLocaleString('ja-JP') : '';
                        return (
                          <div key={c.id || i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-slate-800 px-2 py-0.5 bg-white rounded-md border border-slate-200">
                                投稿者: {c.userName || 'ゲスト'} {c.userId ? `(${c.userId})` : ''}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-mono">{timeStr}</span>
                                <button
                                  onClick={() => handleDeleteComment(c.id, c.userName || c.userId)}
                                  className="p-1 text-pink-500 hover:text-pink-700 hover:bg-pink-50 rounded-lg transition-colors"
                                  title="このコメントを削除する"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                              {c.text}
                            </p>
                          </div>
                        );
                      })}

                      {selectedCommentTarget.comments.length === 0 && (
                        <div className="text-center py-12 text-slate-400 text-sm">
                          届いたコメントはまだありません。
                        </div>
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => {
                          if (selectedCommentTarget.targetType === 'account' && selectedCommentTarget.user) {
                            handleExportSingleAccountCommentsCSV(selectedCommentTarget.user, selectedCommentTarget.comments);
                          } else if (selectedCommentTarget.targetType === 'booth' && selectedCommentTarget.booth) {
                            handleExportSingleBoothCommentsCSV(selectedCommentTarget.booth, selectedCommentTarget.comments);
                          }
                        }}
                        disabled={selectedCommentTarget.comments.length === 0}
                        className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <Download className="w-4 h-4" />
                        <span>この受信コメントをCSVダウンロード ({selectedCommentTarget.comments.length}件)</span>
                      </button>

                      <button
                        onClick={() => setSelectedCommentTarget(null)}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                      >
                        閉じる
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* =====================================================================
            TAB 4: NEWS MANAGEMENT (お知らせ管理)
           ===================================================================== */}
        {activeTab === 'news' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-slate-800">お知らせ・ニュース管理</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    全 {newsItems.length} 件
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  公式サイトのトップページおよびお知らせ一覧（/news）に掲載される記事の作成・編集・削除が行えます。
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleReseedDefaultNews}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                  title="初期データを再投入してリセット"
                >
                  初期データ再投入
                </button>
                <RouterLink
                  to="/news"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>公開ページを見る</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </RouterLink>
                <button
                  type="button"
                  onClick={handleOpenAddNewsModal}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>新規お知らせを作成</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <button
                  onClick={() => setNewsCategoryFilter('ALL')}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer",
                    newsCategoryFilter === 'ALL'
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  )}
                >
                  すべて ({newsItems.length})
                </button>
                {NEWS_CATEGORIES_CONFIG.map(cat => {
                  const count = newsItems.filter(n => n.category === cat.key).length;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setNewsCategoryFilter(cat.key)}
                      className={clsx(
                        "px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer",
                        newsCategoryFilter === cat.key
                          ? `${cat.badgeClass} shadow-xs`
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      )}
                    >
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Keyword Search */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={newsSearchQuery}
                  onChange={(e) => setNewsSearchQuery(e.target.value)}
                  placeholder="タイトルや内容で検索..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-7 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {newsSearchQuery && (
                  <button
                    onClick={() => setNewsSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* News Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-3 px-4 w-28 whitespace-nowrap">掲載日</th>
                    <th className="py-3 px-3 w-24 whitespace-nowrap">カテゴリ</th>
                    <th className="py-3 px-4 min-w-[260px]">タイトル / 概要</th>
                    <th className="py-3 px-3 w-32 hidden sm:table-cell whitespace-nowrap">発信者</th>
                    <th className="py-3 px-3 w-24 text-center whitespace-nowrap">NEW表示</th>
                    <th className="py-3 px-4 w-32 text-right whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNewsItems.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getNewsBadge(item.category)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-2 flex-wrap">
                          <span>{item.title}</span>
                          {item.externalUrl && (
                            <a
                              href={item.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 inline-flex items-center"
                              title="外部リンクを開く"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {item.summary && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                            {item.summary}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium whitespace-nowrap hidden sm:table-cell">
                        {item.author || '-'}
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleNewsIsNew(item)}
                          className={clsx(
                            "px-2.5 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer shadow-2xs",
                            item.isNew
                              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white scale-102"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          )}
                          title="クリックしてNEW表示を切り替え"
                        >
                          {item.isNew ? 'NEW ON' : 'OFF'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <RouterLink
                            to={`/news?id=${item.id}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                            title="公開ページでプレビュー確認"
                          >
                            <Eye className="w-4 h-4" />
                          </RouterLink>
                          <button
                            type="button"
                            onClick={() => handleOpenEditNewsModal(item)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="編集する"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNews(item)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="削除する"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredNewsItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                        該当するお知らせが見つかりません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================================
            NEWS EDIT / CREATE MODAL
           ===================================================================== */}
        {showNewsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col border border-slate-100">
              <button 
                onClick={() => { setShowNewsModal(false); setEditingNews(null); }}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="pb-4 border-b border-slate-100 pr-10">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase mb-1">
                  <Bell className="w-4 h-4" />
                  <span>お知らせ管理</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingNews ? 'お知らせを編集' : '新規お知らせを作成'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  タイトル・カテゴリ・本文・掲載日を入力してください。
                </p>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveNewsItem} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    タイトル <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newsFormData.title}
                    onChange={(e) => setNewsFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="例: 出展ブース一覧および作品情報の一部を公開しました"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {/* 2 Columns: Date & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      掲載日 (YYYY.MM.DD) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newsFormData.date}
                      onChange={(e) => setNewsFormData(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="2026.01.15"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      カテゴリ <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newsFormData.category}
                      onChange={(e) => setNewsFormData(prev => ({ ...prev, category: e.target.value as NewsCategory }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    >
                      <option value="general">お知らせ (一般)</option>
                      <option value="important">重要</option>
                      <option value="event">イベント</option>
                      <option value="exhibitor">出展者へ</option>
                    </select>
                  </div>
                </div>

                {/* 2 Columns: Author & External URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      発信者名
                    </label>
                    <input
                      type="text"
                      value={newsFormData.author}
                      onChange={(e) => setNewsFormData(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="例: 制作展実行委員会, 運営事務局, 教務部"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      関連リンクURL (任意)
                    </label>
                    <input
                      type="url"
                      value={newsFormData.externalUrl}
                      onChange={(e) => setNewsFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* NEW Badge Toggle */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="isNewNewsCheckbox"
                    checked={newsFormData.isNew}
                    onChange={(e) => setNewsFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                  <label htmlFor="isNewNewsCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    「NEW」バッジを表示する（トップページや一覧で目立たせます）
                  </label>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    お知らせ本文 <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={newsFormData.content}
                    onChange={(e) => setNewsFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="お知らせの本文を入力してください。改行や箇条書き（・）もそのまま反映されます。"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Preview Box */}
                {newsFormData.title && (
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="text-[10px] font-bold text-blue-600 uppercase mb-2">プレビュー表示</div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-400">{newsFormData.date || '2026.01.15'}</span>
                      {getNewsBadge(newsFormData.category)}
                      {newsFormData.isNew && (
                        <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-900 mb-2">{newsFormData.title}</div>
                    <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                      {newsFormData.content}
                    </div>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => { setShowNewsModal(false); setEditingNews(null); }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingNews ? '変更を保存する' : 'お知らせを公開する'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Custom Confirmation Dialog (Works 100% in sandboxed iframes) */}
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
              <div className="flex items-center gap-3 text-pink-600 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{confirmModal.title}</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-colors disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={confirmModal.onConfirm}
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold shadow-md shadow-pink-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {confirmModal.confirmText || '削除する'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
