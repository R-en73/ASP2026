/**
 * Firestore への PDF 分割保存ユーティリティ。
 *
 * Firebase Storage が未設定の環境（静的ホスティングなど）でも PDF を扱えるように、
 * PDF を base64 チャンクに分割して Firestore に保存し、表示時に再結合して Blob URL を生成します。
 * - 保存先: `pdfs/{pdfId}` （メタデータ） / `pdfs/{pdfId}/chunks/{n}` （チャンク）
 * - ブースドキュメントの pdfs[].url には `pdfstore:<pdfId>` 形式で参照を保存します。
 */
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { getDb } from './firebase';

export const PDF_STORE_PREFIX = 'pdfstore:';

// 1チャンクあたりの base64 文字数（約300KBバイナリ相当）→ Firestore ドキュメント上限(1MiB)を考慮
const CHUNK_CHARS = 400 * 1024;

export interface PdfChunkMeta {
  name: string;
  userId: string;
  totalChunks: number;
  contentType: string;
  createdAt?: string;
}

/**
 * base64 データをチャンクに分割して Firestore に保存する
 */
export async function storePdfChunks(
  pdfId: string,
  name: string,
  base64Data: string,
  userId: string
): Promise<void> {
  const db = await getDb();
  const total = Math.max(1, Math.ceil(base64Data.length / CHUNK_CHARS));

  const meta: PdfChunkMeta = {
    name,
    userId,
    totalChunks: total,
    contentType: 'application/pdf',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'pdfs', pdfId), meta);

  const chunksCol = collection(db, 'pdfs', pdfId, 'chunks');
  for (let i = 0; i < total; i++) {
    await setDoc(doc(chunksCol, String(i)), {
      data: base64Data.slice(i * CHUNK_CHARS, (i + 1) * CHUNK_CHARS),
    });
  }
}

/**
 * 保存済みチャンクを再結合して PDF の Blob を生成する
 */
export async function loadPdfChunksBlob(pdfId: string): Promise<{ blob: Blob; name: string }> {
  const db = await getDb();
  const metaSnap = await getDoc(doc(db, 'pdfs', pdfId));
  if (!metaSnap.exists()) {
    throw new Error('PDFが見つかりません');
  }
  const meta = metaSnap.data() as PdfChunkMeta;

  const snap = await getDocs(collection(db, 'pdfs', pdfId, 'chunks'));
  const chunks = snap.docs
    .map((d) => ({ index: Number(d.id), data: d.data().data as string }))
    .sort((a, b) => a.index - b.index);

  const joined = chunks.map((c) => c.data).join('');
  const binary = atob(joined);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: meta.contentType || 'application/pdf' });
  return { blob, name: meta.name || 'document.pdf' };
}

/**
 * 保存済みのチャンクとメタデータを削除する
 */
export async function deletePdfChunks(pdfId: string): Promise<void> {
  if (!pdfId) return;
  try {
    const db = await getDb();
    const chunksCol = collection(db, 'pdfs', pdfId, 'chunks');
    const snap = await getDocs(chunksCol);
    for (const d of snap.docs) {
      await deleteDoc(doc(chunksCol, d.id));
    }
    await deleteDoc(doc(db, 'pdfs', pdfId)).catch(() => {});
  } catch (e) {
    console.error('deletePdfChunks error:', e);
  }
}

/**
 * pdfs[].url が pdfstore: 参照かを判定する
 */
export function isPdfStoreUrl(url: string): boolean {
  return typeof url === 'string' && url.startsWith(PDF_STORE_PREFIX);
}

/**
 * pdfs[].url から pdfId を取り出す
 */
export function getPdfIdFromStoreUrl(url: string): string {
  return url.startsWith(PDF_STORE_PREFIX) ? url.slice(PDF_STORE_PREFIX.length) : url;
}
