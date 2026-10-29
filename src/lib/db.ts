import { collection, doc, getDoc, getDocs, setDoc, query, where, writeBatch, deleteDoc } from 'firebase/firestore';
import { getDb } from './firebase';
import { User, BoothDetail, Room, Course, SystemSettings, BoothComment, Vote, NewsItem } from '../types';

// Clear any old zombie user caches from previous versions
try {
  localStorage.removeItem('aso_users_cache_v4');
  localStorage.removeItem('aso_users_cache_v3');
  localStorage.removeItem('aso_users_cache_v2');
  localStorage.removeItem('aso_admin_users_cache_v2');
} catch {}

const encryptPassword = (pass: string): string => {
  if (!pass) return '';
  try {
    return btoa(encodeURIComponent(pass) + '_aso_secure_salt_2026');
  } catch {
    return pass;
  }
};

const getSafeDocId = (id: string): string => {
  if (!id) return 'user_' + Date.now();
  // Only forward slash is illegal in Firestore document paths
  return String(id).trim().replace(/\//g, '_');
};

// Users
export const getUser = async (uid: string): Promise<User | null> => {
  if (!uid) return null;
  try {
    const db = await getDb();
    const docRef = doc(db, 'users', getSafeDocId(uid));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as User;
    }

    // Fallback: search by id or loginId
    const q = query(collection(db, 'users'), where('loginId', '==', uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { ...snap.docs[0].data(), id: snap.docs[0].id } as User;
    }
  } catch (e) {
    console.error('getUser error:', e);
  }
  return null;
};

export const loginWithCredentials = async (loginId: string, pass: string): Promise<User | null> => {
  if (!loginId) return null;
  try {
    const db = await getDb();
    const encryptedPass = encryptPassword(pass);
    
    // Check with encrypted password
    const qEncrypted = query(
      collection(db, 'users'), 
      where('loginId', '==', loginId), 
      where('pass', '==', encryptedPass)
    );
    const snapEncrypted = await getDocs(qEncrypted);
    if (!snapEncrypted.empty) {
      return { id: snapEncrypted.docs[0].id, ...snapEncrypted.docs[0].data() } as User;
    }

    // Check with plain password
    const qPlain = query(
      collection(db, 'users'), 
      where('loginId', '==', loginId), 
      where('pass', '==', pass)
    );
    const snapPlain = await getDocs(qPlain);
    if (!snapPlain.empty) {
      return { id: snapPlain.docs[0].id, ...snapPlain.docs[0].data() } as User;
    }

    // Also check direct document by ID
    const directDoc = await getDoc(doc(db, 'users', getSafeDocId(loginId)));
    if (directDoc.exists()) {
      const data = directDoc.data() as User;
      if (data.pass === encryptedPass || data.pass === pass) {
        return { ...data, id: directDoc.id };
      }
    }
  } catch (e) {
    console.error('loginWithCredentials error:', e);
  }
  return null;
};

export const updateUser = async (uid: string, data: Partial<User>) => {
  if (!uid) return;
  const updateData = { ...data };
  if (updateData.pass) {
    updateData.pass = encryptPassword(updateData.pass);
  }

  const db = await getDb();
  const docRef = doc(db, 'users', getSafeDocId(uid));
  await setDoc(docRef, updateData, { merge: true });
};

export const saveUser = async (user: User) => {
  const docId = getSafeDocId(user.id);
  const secureUser: User = {
    ...user,
    id: docId,
    uid: user.uid || docId,
    loginId: user.loginId || docId,
    pass: user.pass ? encryptPassword(user.pass) : encryptPassword(docId)
  };

  const db = await getDb();
  const docRef = doc(db, 'users', docId);
  await setDoc(docRef, secureUser, { merge: true });
};

export const batchSaveUsers = async (users: any[]) => {
  const db = await getDb();
  for (let i = 0; i < users.length; i += 400) {
    const chunk = users.slice(i, i + 400);
    const batch = writeBatch(db);
    chunk.forEach(u => {
      const docId = getSafeDocId(u.id);
      const secureUser = {
        ...u,
        id: docId,
        uid: u.uid || docId,
        loginId: u.loginId || docId,
        pass: u.pass ? encryptPassword(u.pass) : encryptPassword(docId)
      };
      const docRef = doc(db, 'users', docId);
      batch.set(docRef, secureUser, { merge: true });
    });
    await batch.commit();
  }
};

export const deleteUser = async (uid: any) => {
  if (!uid) return;
  if (typeof uid === 'object') {
    uid = uid.id || uid.loginId || uid.uid;
  }
  const strUid = String(uid).trim();
  if (!strUid) return;

  const db = await getDb();
  const safeId = getSafeDocId(strUid);
  const legacyUnderscoreId = strUid.replace(/[\/\#\?\.\[\]\*]/g, '_');

  // 1. Direct document deletion
  try {
    await deleteDoc(doc(db, 'users', safeId));
  } catch {}

  if (strUid !== safeId && !strUid.includes('/')) {
    try {
      await deleteDoc(doc(db, 'users', strUid));
    } catch {}
  }

  if (legacyUnderscoreId !== strUid && legacyUnderscoreId !== safeId && !legacyUnderscoreId.includes('/')) {
    try {
      await deleteDoc(doc(db, 'users', legacyUnderscoreId));
    } catch {}
  }

  // 2. Query matching docs by loginId, id, or uid to clean up any duplicates
  try {
    const candidateIds = Array.from(new Set([strUid, safeId, legacyUnderscoreId])).filter(Boolean);
    for (const field of ['loginId', 'id', 'uid']) {
      for (const targetId of candidateIds) {
        const q = query(collection(db, 'users'), where(field, '==', targetId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.docs.forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
      }
    }

    // Clean up any boothDetails explicitly owned by this user
    for (const targetId of candidateIds) {
      for (const bField of ['userId', 'userLoginId']) {
        const qb = query(collection(db, 'boothDetails'), where(bField, '==', targetId));
        const snapB = await getDocs(qb);
        if (!snapB.empty) {
          const batch = writeBatch(db);
          snapB.docs.forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
      }
    }
  } catch (err) {
    console.error('deleteUser query cleanup error:', err);
  }
};

export const deleteAllUsers = async () => {
  const db = await getDb();
  for (const colName of ['users', 'votes', 'comments', 'boothDetails']) {
    try {
      const snap = await getDocs(collection(db, colName));
      if (!snap.empty) {
        const docs = snap.docs;
        for (let i = 0; i < docs.length; i += 400) {
          const chunk = docs.slice(i, i + 400);
          const batch = writeBatch(db);
          chunk.forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
      }
    } catch (e) {
      console.error(`deleteAllUsers error on ${colName}:`, e);
      throw e;
    }
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  const db = await getDb();
  const snap = await getDocs(collection(db, 'users'));
  const userMap = new Map<string, User>();

  snap.docs.forEach(d => {
    const data = d.data();
    const u: User = {
      ...data,
      id: d.id,
      loginId: data.loginId || data.id || d.id,
      uid: data.uid || d.id,
      name: data.name || d.id,
      authority: data.authority || 'student'
    };
    // Deduplicate by loginId or id
    const key = u.loginId || u.id;
    userMap.set(key, u);
  });

  return Array.from(userMap.values());
};

// System Settings
export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const db = await getDb();
    const docRef = doc(db, 'settings', 'system');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SystemSettings;
    }
  } catch (e) {}
  return {
    mainTitle: '学園祭 / 文化祭 特設ポータル',
    mainVisualUrl: '',
    comment: 'ご来場ありがとうございます！',
    isVotingEnabled: true
  };
};

export const saveSystemSettings = async (settings: SystemSettings) => {
  try {
    const db = await getDb();
    const docRef = doc(db, 'settings', 'system');
    await setDoc(docRef, settings, { merge: true });
  } catch (e) {}
};

// Booth Details
export const getBoothDetails = async (): Promise<BoothDetail[]> => {
  try {
    const db = await getDb();
    const snap = await getDocs(collection(db, 'boothDetails'));
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as BoothDetail));
  } catch (e) {
    return [];
  }
};

export const getBooths = getBoothDetails;

export const saveBoothDetail = async (idOrDetail: string | BoothDetail, detailData?: Partial<BoothDetail>) => {
  try {
    const db = await getDb();
    let boothId = '';
    let payload: any = {};
    if (typeof idOrDetail === 'object') {
      boothId = idOrDetail.id;
      payload = idOrDetail;
    } else {
      boothId = idOrDetail;
      payload = { id: boothId, ...detailData };
    }
    if (!boothId) return;
    const docRef = doc(db, 'boothDetails', boothId);
    await setDoc(docRef, payload, { merge: true });
  } catch (e) {}
};

export const saveBooth = saveBoothDetail;

export const getBoothById = async (id: string): Promise<BoothDetail | null> => {
  try {
    const db = await getDb();
    const docRef = doc(db, 'boothDetails', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as BoothDetail;
    }
  } catch (e) {}
  return null;
};

export const getBoothByUserId = async (userId: string): Promise<BoothDetail | null> => {
  if (!userId) return null;
  try {
    const db = await getDb();
    const q1 = query(collection(db, 'boothDetails'), where('userId', '==', userId));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) {
      return { ...snap1.docs[0].data(), id: snap1.docs[0].id } as BoothDetail;
    }

    const q2 = query(collection(db, 'boothDetails'), where('userLoginId', '==', userId));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      return { ...snap2.docs[0].data(), id: snap2.docs[0].id } as BoothDetail;
    }

    // Direct doc lookup by userId
    const docRef = doc(db, 'boothDetails', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as BoothDetail;
      if (!data.userId || data.userId === userId) {
        return { ...data, id: snap.id };
      }
    }
  } catch (e) {
    console.error('getBoothByUserId error:', e);
  }
  return null;
};

export const getUserOwnedBooth = async (user: User | null): Promise<BoothDetail | null> => {
  if (!user || !user.id || user.authority === 'guest') return null;

  try {
    // 1. Check by explicit userId
    const byUserId = await getBoothByUserId(user.id);
    if (byUserId) return byUserId;

    // 2. Check by user.loginId if different
    if (user.loginId && user.loginId !== user.id) {
      const byLoginId = await getBoothByUserId(user.loginId);
      if (byLoginId) return byLoginId;
    }

    // 3. Direct doc by id === user.id
    const directDoc = await getBoothById(user.id);
    if (directDoc && (!directDoc.userId || directDoc.userId === user.id || directDoc.userLoginId === user.loginId)) {
      return directDoc;
    }

    // 4. If user.boothId is set, verify STRICT ownership (must not be another person's booth):
    if (user.boothId) {
      const candidate = await getBoothById(user.boothId);
      if (candidate) {
        const isOwner = (candidate.userId === user.id || 
                         candidate.userId === user.loginId || 
                         candidate.userLoginId === user.id || 
                         candidate.userLoginId === user.loginId);
        if (isOwner) {
          return candidate;
        }
      }
    }
  } catch (err) {
    console.error('getUserOwnedBooth error:', err);
  }

  return null;
};

export const deleteBooth = async (id: string) => {
  if (!id) return;
  try {
    const db = await getDb();
    await deleteDoc(doc(db, 'boothDetails', id));
  } catch (e) {
    console.error('deleteBooth error:', e);
    throw e;
  }
};

// Rooms
export const getRooms = async (): Promise<Room[]> => {
  try {
    const db = await getDb();
    const snap = await getDocs(collection(db, 'rooms'));
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Room));
  } catch (e) {
    return [];
  }
};

// Courses
export const getCourses = async (): Promise<Course[]> => {
  try {
    const db = await getDb();
    const snap = await getDocs(collection(db, 'courses'));
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Course));
  } catch (e) {
    return [];
  }
};

// Votes
export const getVotes = async (): Promise<Vote[]> => {
  try {
    const db = await getDb();
    const snap = await getDocs(collection(db, 'votes'));
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as unknown as Vote));
  } catch (e) {
    return [];
  }
};

export const getAllVotes = getVotes;

export const addVote = async (boothIdOrVote: any, userId?: string) => {
  try {
    const db = await getDb();
    let boothId = '';
    let uid = '';
    if (typeof boothIdOrVote === 'object') {
      boothId = boothIdOrVote.boothId;
      uid = boothIdOrVote.userId;
    } else {
      boothId = boothIdOrVote;
      uid = userId || '';
    }
    if (!boothId || !uid) return;

    // Check if user already voted for this specific booth to prevent duplicate
    const votesCol = collection(db, 'votes');
    const q = query(votesCol, where('userId', '==', uid), where('boothId', '==', boothId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return; // Already voted for this booth
    }

    // Enforce maximum 5 votes limit per user/device
    const userVotesQuery = query(votesCol, where('userId', '==', uid));
    const userVotesSnap = await getDocs(userVotesQuery);
    if (userVotesSnap.size >= 5) {
      throw new Error('いいね・投票は最大5回までに制限されています');
    }

    const newDocRef = doc(collection(db, 'votes'));
    await setDoc(newDocRef, {
      boothId,
      userId: uid,
      timestamp: new Date()
    });
  } catch (e) {
    console.error('addVote error:', e);
  }
};

export const resetAllVotes = async () => {
  try {
    const db = await getDb();
    const snap = await getDocs(collection(db, 'votes'));
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  } catch (e) {}
};

export const getBoothVotes = async (boothId: string): Promise<number> => {
  try {
    const db = await getDb();
    const q = query(collection(db, 'votes'), where('boothId', '==', boothId));
    const snap = await getDocs(q);
    return snap.size;
  } catch (e) {
    return 0;
  }
};

export const getUserVoteCount = async (userId: string): Promise<number> => {
  try {
    const db = await getDb();
    const q = query(collection(db, 'votes'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.size;
  } catch (e) {
    return 0;
  }
};

// Comments
export const getComments = async (boothId: string): Promise<BoothComment[]> => {
  try {
    const db = await getDb();
    const q = query(collection(db, 'comments'), where('boothId', '==', boothId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as BoothComment)).sort((a, b) => {
      const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  } catch (e) {
    return [];
  }
};

export const getAllComments = async (): Promise<BoothComment[]> => {
  try {
    const db = await getDb();
    const snap = await getDocs(collection(db, 'comments'));
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as BoothComment)).sort((a, b) => {
      const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  } catch (e) {
    return [];
  }
};

export const getCommentsByBooth = getComments;

export const addComment = async (commentOrBoothId: any, userId?: string, userName?: string, text?: string) => {
  try {
    const db = await getDb();
    let boothId = '';
    let uid = '';
    let uName = '';
    let txt = '';
    if (typeof commentOrBoothId === 'object') {
      boothId = commentOrBoothId.boothId;
      uid = commentOrBoothId.userId;
      uName = commentOrBoothId.userName;
      txt = commentOrBoothId.text;
    } else {
      boothId = commentOrBoothId;
      uid = userId || '';
      uName = userName || '';
      txt = text || '';
    }
    if (!boothId || !txt) return;

    const docRef = doc(collection(db, 'comments'));
    await setDoc(docRef, {
      boothId,
      userId: uid,
      userName: uName,
      text: txt,
      createdAt: new Date()
    });
  } catch (e) {}
};

export const deleteComment = async (commentId: string) => {
  if (!commentId) return;
  try {
    const db = await getDb();
    await deleteDoc(doc(db, 'comments', commentId));
  } catch (e) {
    console.error('deleteComment error:', e);
    throw e;
  }
};

// ============================================================================
// Announcements / News (お知らせ) Database Helpers
// ============================================================================

export const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  {
    id: 'news_1',
    title: 'ASO高等部 卒業進級制作展2026 公式Webサイトを公開しました',
    date: '2026.01.15',
    category: 'important',
    categoryLabel: '重要',
    summary: '2026年2月21日(土)・22日(日)に開催される「ASO高等部 卒業進級制作展2026」の特設ポータルサイトをオープンいたしました。',
    content: `2026年2月21日(土)・22日(日)に開催される「ASO高等部 卒業進級制作展2026」の公式特設Webサイトを公開いたしました。

今年度のテーマは「つくる。描く。創る。未来を。」です。
ゲーム・イラスト・情報系IT・3DCGの4コースに所属する生徒たちの1年間の学びの集大成となる作品を展示いたします。

本サイトでは、各生徒のブース紹介・作品資料（PDF）・紹介動画（YouTube）の閲覧や、イベントスケジュールの確認が可能です。
皆さまのご来場を心よりお待ちしております。`,
    isNew: true,
    author: '制作展実行委員会'
  },
  {
    id: 'news_2',
    title: '出展ブース一覧および作品情報の一部を公開しました',
    date: '2026.01.10',
    category: 'general',
    categoryLabel: 'お知らせ',
    summary: '全100ブース以上の出展作品情報およびブース番号一覧を公開いたしました。',
    content: `全100ブース以上の出展作品情報およびブース番号一覧を公開いたしました。
「Works（展示ブース）」ページより、フロア別・コース別・キーワードでの検索や絞り込みが可能です。
出展作品の紹介資料やプロモーション動画も順次公開しておりますので、ぜひ事前にご覧ください。`,
    isNew: true,
    author: '広報担当'
  },
  {
    id: 'news_3',
    title: '一般来場者向け 来場予約の受付を開始いたしました',
    date: '2025.12.28',
    category: 'event',
    categoryLabel: 'イベント',
    summary: '卒業進級制作展2026の一般来場予約の受付を開始いたしました。混雑緩和のため事前予約にご協力をお願いいたします。',
    content: `卒業進級制作展2026の一般来場予約の受付を開始いたしました。
混雑緩和とスムーズなご案内のため、事前予約にご協力をお願いいたします。

【開催日時】
・2026年2月21日(土) 10:00 - 18:00
・2026年2月22日(日) 10:00 - 18:00

【会場】
ASO高等部 各教室・体育館

入場料は無料です。保護者の方、中学生・高校生、企業関係者の皆さまのご参加をお待ちしております。`,
    isNew: false,
    author: '運営事務局'
  },
  {
    id: 'news_4',
    title: 'イベントタイムテーブル・ゲスト講演の詳細を発表しました',
    date: '2025.12.20',
    category: 'event',
    categoryLabel: 'イベント',
    summary: '会期中2日間にわたって開催されるトークセッションやゲスト講演、ワークショップのタイムテーブルを発表しました。',
    content: `2日間の会期中に体育館および特設ステージにて開催される「トークセッション」「ゲスト講演」「ワークショップ」のタイムテーブルを公開いたしました。

クリエイティブ業界で活躍するプロによる特別講演や、生徒によるプレゼンテーション大会などを予定しております。
タイムテーブルの詳細は「Event（イベントスケジュール）」ページをご確認ください。`,
    isNew: false,
    author: 'イベント企画係'
  },
  {
    id: 'news_5',
    title: '【生徒・出展者向け】制作展提出物およびブース設営スケジュールについて',
    date: '2025.12.15',
    category: 'exhibitor',
    categoryLabel: '出展者へ',
    summary: '出展生徒の皆さんは、作品サムネイル画像、説明用PDF資料、紹介動画リンクの提出締切日をご確認ください。',
    content: `出展生徒の皆さんは、作品サムネイル画像、説明用PDF資料、紹介動画リンクの提出締切日をご確認ください。
「マイページ」よりブース情報の最終確認・編集が可能です。
当日のブース設営マニュアルおよび搬入時間についても生徒向け連絡掲示板にて案内しております。`,
    isNew: false,
    author: '教務部'
  },
  {
    id: 'news_6',
    title: 'ASO高等部 卒業進級制作展2026の開催日程が決定しました',
    date: '2025.12.01',
    category: 'general',
    categoryLabel: 'お知らせ',
    summary: '今年度の卒業進級制作展の開催日程が【2026年2月21日(土)・22日(日)】に決定いたしました。',
    content: `今年度の卒業進級制作展の開催日程が【2026年2月21日(土)・22日(日)】に決定いたしました。
生徒一人ひとりの情熱と技術が詰まった作品展示をぜひお楽しみください。`,
    isNew: false,
    author: 'ASO高等部'
  }
];

export const seedDefaultNewsItems = async (force: boolean = false): Promise<NewsItem[]> => {
  try {
    const db = await getDb();
    const snap = await getDocs(collection(db, 'news'));
    if (!snap.empty && !force) {
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as NewsItem));
    }
    const batch = writeBatch(db);
    DEFAULT_NEWS_ITEMS.forEach(item => {
      const docRef = doc(db, 'news', item.id);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
    return DEFAULT_NEWS_ITEMS;
  } catch (e) {
    console.error('seedDefaultNewsItems error:', e);
    return DEFAULT_NEWS_ITEMS;
  }
};

export const getNews = async (): Promise<NewsItem[]> => {
  try {
    const db = await getDb();
    const snap = await getDocs(collection(db, 'news'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as NewsItem));
      // Sort by date descending
      return items.sort((a, b) => b.date.localeCompare(a.date));
    }
    // Auto-seed default news items so Firestore collection has actual documents to edit/delete
    try {
      const seeded = await seedDefaultNewsItems(false);
      return [...seeded].sort((a, b) => b.date.localeCompare(a.date));
    } catch {
      return DEFAULT_NEWS_ITEMS;
    }
  } catch (e) {
    console.error('getNews error:', e);
  }
  // Return default items if Firestore is empty or on error
  return DEFAULT_NEWS_ITEMS;
};

export const getNewsById = async (id: string): Promise<NewsItem | null> => {
  if (!id) return null;
  try {
    const db = await getDb();
    const docRef = doc(db, 'news', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as NewsItem;
    }
  } catch (e) {
    console.error('getNewsById error:', e);
  }
  // Fallback to default items
  const found = DEFAULT_NEWS_ITEMS.find(n => n.id === id);
  return found || null;
};

export const saveNewsItem = async (item: Partial<NewsItem>): Promise<string> => {
  const db = await getDb();
  const id = item.id || 'news_' + Date.now();
  const docRef = doc(db, 'news', id);
  
  const payload: NewsItem = {
    id,
    title: item.title || '無題のお知らせ',
    date: item.date || new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    category: item.category || 'general',
    categoryLabel: item.categoryLabel || (
      item.category === 'important' ? '重要' :
      item.category === 'event' ? 'イベント' :
      item.category === 'exhibitor' ? '出展者へ' : 'お知らせ'
    ),
    summary: item.summary || (item.content ? item.content.slice(0, 80) + '...' : ''),
    content: item.content || '',
    isNew: item.isNew ?? true,
    author: item.author || '運営事務局',
    externalUrl: item.externalUrl || '',
    updatedAt: new Date().toISOString()
  };

  await setDoc(docRef, payload, { merge: true });
  return id;
};

export const deleteNewsItem = async (id: string): Promise<void> => {
  if (!id) return;
  const db = await getDb();
  await deleteDoc(doc(db, 'news', id));
};
