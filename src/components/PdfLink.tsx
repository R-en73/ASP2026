import React, { useEffect, useState } from 'react';
import { FileText, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { loadPdfChunksBlob, isPdfStoreUrl, getPdfIdFromStoreUrl } from '../lib/pdfChunks';

interface PdfLinkProps {
  url: string;
  name: string;
}

/**
 * 資料PDF のリンク。
 * - 通常のURL（Storage / 外部URL / data URL）はそのまま <a> で開く
 * - `pdfstore:<pdfId>`（Firestore 分割保存）はチャンクを再結合して Blob URL を生成して開く
 */
export default function PdfLink({ url, name }: PdfLinkProps) {
  const [href, setHref] = useState<string>(url);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    if (!isPdfStoreUrl(url)) {
      setHref(url);
      return;
    }

    const pdfId = getPdfIdFromStoreUrl(url);
    setLoading(true);
    setError('');

    loadPdfChunksBlob(pdfId)
      .then(({ blob }) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setHref(objectUrl);
        setLoading(false);
      })
      .catch((err) => {
        console.error('PDF load error:', err);
        if (cancelled) return;
        setError('PDFの読み込みに失敗しました');
        setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center w-full bg-white border border-slate-200 hover:border-red-300 hover:shadow-md transition-all p-3.5 sm:p-4 rounded-2xl group min-h-[64px]"
    >
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-500 group-hover:text-white text-red-500 transition-colors">
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6" />}
      </div>
      <div className="flex-1 min-w-0 px-3.5 sm:px-5">
        <h4 className="font-bold text-slate-800 text-sm sm:text-base break-words group-hover:text-red-600 transition-colors leading-snug">
          {name}
        </h4>
        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
          {error ? (
            <span className="inline-flex items-center gap-1 text-pink-500">
              <AlertTriangle className="w-3.5 h-3.5" /> {error}
            </span>
          ) : loading ? (
            '読み込み中...'
          ) : (
            'PDFを開く'
          )}
        </p>
      </div>
      <div className="shrink-0 w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
        <ExternalLink className="w-4 h-4" />
      </div>
    </a>
  );
}
