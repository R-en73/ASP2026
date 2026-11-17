/**
 * Firestore への PDF 保存ユーティリティ。
 *
 * Firebase Storage が未設定の環境（静的ホスティングなど）でも PDF を扱えるように、
 * PDF を base64 化して Firestore に保存し、表示時に再結合して Blob URL を生成します。
 *
 * 100人規模でも Firestore 無料枠の書き込みクォータを節約できるよう、2段階で保存します:
 * - 小さめの PDF（約640KBまで）: 1ドキュメント = 書き込み1回で保存
 * - 大きな PDF: base64 チャンクに分割し、writeBatch で一括保存（1回のリクエスト）
 *
 * - 保存先: `pdfs/{pdfId}` （メタデータ / 小PDFは data フィールドに格納）
 *           `pdfs/{pdfId}/chunks/{n}` （大PDFのチャンク）
 * - ブースドキュメントの pdfs[].url には `pdfstore:<pdfId>` 形式で参照を保存します。
 */
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { getDb } from './firebase';

export const PDF_STORE_PREFIX = 'pdfstore:';

// 1チャンクあたりの base64 文字数（約525KBバイナリ相当）→ Firestore ドキュメント上限(1MiB)を考慮
const CHUNK_CHARS = 700 * 1024;

// 単一ドキュメントで保存できる base64 文字数の上限（書き込み1回で済ませる）
const SINGLE_DOC_MAX_BASE64 = 850 * 1024;

export interface PdfChunkMeta {
  name: string;
  userId: string;
  totalChunks?: number;
  contentType: string;
  single?: boolean;
  data?: string;
  createdAt?: string;
}

/**
 * base64 データを PDF ドキュメントとして保存する。
 * 小PDFは1ドキュメント、大PDFはチャンク分割 + writeBatch で保存する。
 */
export async function storePdfChunks(
  pdfId: string,
  name: string,
  base64Data: string,
  userId: string
): Promise<void> {
  const db = await getDb();
  const createdAt = new Date().toISOString();

  // 小PDF: 単一ドキュメント = 書き込み1回（クォータ節約）
  if (base64Data.length <= SINGLE_DOC_MAX_BASE64) {
    const meta: PdfChunkMeta = {
      name,
      userId,
      contentType: 'application/pdf',
      single: true,
      data: base64Data,
      createdAt,
    };
    await setDoc(doc(db, 'pdfs', pdfId), meta);
    return;
  }

  // 大PDF: チャンク分割 + writeBatch 一括コミット（1回のリクエスト）
  const total = Math.max(1, Math.ceil(base64Data.length / CHUNK_CHARS));
  const meta: PdfChunkMeta = {
    name,
    userId,
    totalChunks: total,
    contentType: 'application/pdf',
    createdAt,
  };

  const batch = writeBatch(db);
  batch.set(doc(db, 'pdfs', pdfId), meta);

  const chunksCol = collection(db, 'pdfs', pdfId, 'chunks');
  for (let i = 0; i < total; i++) {
    batch.set(doc(chunksCol, String(i)), {
      data: base64Data.slice(i * CHUNK_CHARS, (i + 1) * CHUNK_CHARS),
    });
  }
  await batch.commit();
}

/**
 * 保存済み PDF を再結合して Blob を生成する
 */
export async function loadPdfChunksBlob(pdfId: string): Promise<{ blob: Blob; name: string }> {
  const db = await getDb();
  const metaSnap = await getDoc(doc(db, 'pdfs', pdfId));
  if (!metaSnap.exists()) {
    throw new Error('PDFが見つかりません');
  }
  const meta = metaSnap.data() as PdfChunkMeta;
  const contentType = meta.contentType || 'application/pdf';

  // 単一ドキュメント保存
  if (meta.single && meta.data) {
    return { blob: base64ToBlob(meta.data, contentType), name: meta.name || 'document.pdf' };
  }

  // チャンク保存
  const snap = await getDocs(collection(db, 'pdfs', pdfId, 'chunks'));
  const chunks = snap.docs
    .map((d) => ({ index: Number(d.id), data: d.data().data as string }))
    .sort((a, b) => a.index - b.index);

  const joined = chunks.map((c) => c.data).join('');
  return { blob: base64ToBlob(joined, contentType), name: meta.name || 'document.pdf' };
}

/**
 * base64 文字列を Blob に変換する
 */
function base64ToBlob(base64: string, contentType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: contentType });
}

/**
 * 保存済みの PDF（チャンク含む）を削除する
 */
export async function deletePdfChunks(pdfId: string): Promise<void> {
  if (!pdfId) return;
  try {
    const db = await getDb();
    const chunksCol = collection(db, 'pdfs', pdfId, 'chunks');
    const snap = await getDocs(chunksCol);
    if (!snap.empty) {
      const batch = writeBatch(db);
      for (const d of snap.docs) {
        batch.delete(doc(chunksCol, d.id));
      }
      await batch.commit();
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


