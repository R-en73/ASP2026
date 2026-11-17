/**
 * ブラウザから Firebase Storage へ直接ファイルをアップロードするユーティリティ。
 * サーバー（/api/upload）に依存しないため、GitHub Pages などの静的ホスティングでも動作します。
 */
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAppStorage } from './firebase';
import { storePdfChunks, PDF_STORE_PREFIX } from './pdfChunks';

export interface UploadResult {
  url: string;
  name: string;
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
 * ファイルを data URL に変換する（小さな PDF のフォールバック用）
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
 * PDF のアップロード。
 * 1. Firebase Storage にアップロードを試みる（Storage 有効化後はここが使われる）
 * 2. Storage が使えない環境では Firestore にチャンク分割で保存し `pdfstore:<pdfId>` 参照を返す
 */
export async function uploadPdf(file: File, uid: string): Promise<UploadResult> {
  try {
    return await uploadFileToStorage(file, 'pdfs', uid);
  } catch (err) {
    console.warn('Firebase Storage upload failed, falling back to Firestore chunk storage:', err);
    const pdfId = `pdf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const dataUrl = await fileToDataUrl(file);
    const base64Data = dataUrl.slice(dataUrl.indexOf(',') + 1);
    await storePdfChunks(pdfId, file.name, base64Data, uid);
    return { url: `${PDF_STORE_PREFIX}${pdfId}`, name: file.name };
  }
}
