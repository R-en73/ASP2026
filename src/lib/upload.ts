/**
 * ブラウザから Firebase Storage へ直接ファイルをアップロードするユーティリティ。
 * サーバー（/api/upload）に依存しないため、GitHub Pages などの静的ホスティングでも動作します。
 *
 * - Firebase Storage が利用できるかどうかを初回失敗時に判定してキャッシュし、
 *   以降のアップロードでは無駄な待ち時間なしで Firestore 分割保存へ切り替えます。
 * - Storage 試行にはタイムアウトを設け、未設定環境でも即座にフォールバックします。
 */
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAppStorage } from './firebase';
import { storePdfChunks, PDF_STORE_PREFIX } from './pdfChunks';

export interface UploadResult {
  url: string;
  name: string;
}

// Storage 試行のタイムアウト（ms）
const STORAGE_TIMEOUT_MS = 5000;

// セッション内で Storage が利用可能かどうかのキャッシュ（null = 未判定）
let storageUsable: boolean | null = null;

/**
 * Promise にタイムアウトを付与する
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Storage request timed out')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * ファイル名を Storage パス用に安全化する
 */
const sanitizeFileName = (name: string): string => {
  const extIndex = name.lastIndexOf('.');
  const ext = extIndex > 0 ? name.slice(extIndex) : '';
  const base = (extIndex > 0 ? name.slice(0, extIndex) : name)
    .replace(/[\\/:*?"<>|#[\]]/g, '_')
    .replace(/\s+/g, '_')
    .slice(-60);
  return (base || 'file') + ext.toLowerCase();
};

/**
 * Firebase Storage へファイルをアップロードし、ダウンロードURLを返す。
 * @param file アップロードするファイル
 * @param folder Storage 上のフォルダ名（例: 'pdfs', 'thumbnails'）
 * @param uid ユーザーID（パスに含める）
 */
export async function uploadFileToStorage(file: File, folder: string, uid: string): Promise<UploadResult> {
  const storage = await getAppStorage();
  const safeUid = (uid || 'guest').replace(/[\\/:*?"<>|#[\]]/g, '_').slice(0, 64);
  const fileName = sanitizeFileName(file.name);
  const storageRef = ref(storage, `${folder}/${safeUid}/${Date.now()}-${fileName}`);
  await uploadBytes(storageRef, file, { contentType: file.type || 'application/octet-stream' });
  const url = await getDownloadURL(storageRef);
  return { url, name: file.name };
}

/**
 * ファイルを base64 data URL に変換する（Firestore 分割保存のフォールバック用）
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsDataURL(file);
  });
}

/**
 * Storage が使える場合のみアップロードし、URL を返す。使えない場合は null。
 * 一度失敗（またはタイムアウト）するとセッション内は常に null を返す。
 */
export async function tryUploadToStorage(file: File, folder: string, uid: string): Promise<string | null> {
  if (storageUsable === false) return null;
  try {
    const res = await withTimeout(uploadFileToStorage(file, folder, uid), STORAGE_TIMEOUT_MS);
    storageUsable = true;
    return res.url;
  } catch (err) {
    storageUsable = false;
    console.warn('Firebase Storage unavailable, using Firestore fallback:', err);
    return null;
  }
}

/**
 * PDF を Firestore に保存し、`pdfstore:<pdfId>` 参照を返す
 * （小PDFは1ドキュメント=書き込み1回、大PDFはチャンク分割）
 */
async function storePdfInFirestore(file: File, uid: string): Promise<UploadResult> {
  const pdfId = `pdf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const dataUrl = await fileToDataUrl(file);
  const base64Data = dataUrl.slice(dataUrl.indexOf(',') + 1);
  await storePdfChunks(pdfId, file.name, base64Data, uid);
  return { url: `${PDF_STORE_PREFIX}${pdfId}`, name: file.name };
}

/**
 * PDF のアップロード。
 * 1. Firebase Storage にアップロード（Storage 有効時。100人規模でも高速・クォータ非消費）
 * 2. Storage 未設定時は Firestore に保存（小PDFは書き込み1回、大PDFはチャンク分割）
 */
export async function uploadPdf(file: File, uid: string): Promise<UploadResult> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    throw new Error('PDFファイルのみアップロードできます');
  }

  if (file.size === 0) {
    throw new Error('PDFファイルが空です');
  }

  const storageUrl = await tryUploadToStorage(file, 'pdfs', uid);
  if (storageUrl) {
    return { url: storageUrl, name: file.name };
  }
  try {
    return await storePdfInFirestore(file, uid);
  } catch (err) {
    const code = (err as any)?.code || (err as any)?.message || '';
    if (String(code).includes('resource-exhausted')) {
      throw new Error('Firebase の書き込み上限（無料枠・日次）に達しています。数時間おいて再度お試しください。');
    }
    console.error('storePdfInFirestore error:', err);
    throw new Error('PDFの保存に失敗しました。もう一度お試しください。');
  }
}

