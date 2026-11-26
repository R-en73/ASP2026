import React, { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { AlertTriangle, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { loadPdfChunksBlob, isPdfStoreUrl, getPdfIdFromStoreUrl } from '../lib/pdfChunks';

const PdfViewer = lazy(() => import('./PdfViewer'));

interface PdfLinkProps {
  url: string;
  name: string;
}

export default function PdfLink({ url, name }: PdfLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<string | Blob>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loadRequest = useRef(0);

  const openPdf = async () => {
    const requestId = ++loadRequest.current;
    setIsOpen(true);
    setError('');

    if (!isPdfStoreUrl(url)) {
      setSource(url);
      return;
    }

    setSource(undefined);
    setLoading(true);
    try {
      const { blob } = await loadPdfChunksBlob(getPdfIdFromStoreUrl(url));
      if (requestId === loadRequest.current) setSource(blob);
    } catch (reason) {
      console.error('PDF load error:', reason);
      if (requestId === loadRequest.current) setError('PDFの読み込みに失敗しました');
    } finally {
      if (requestId === loadRequest.current) setLoading(false);
    }
  };

  const closeViewer = useCallback(() => {
    loadRequest.current += 1;
    setIsOpen(false);
    setSource(undefined);
    setLoading(false);
    setError('');
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => void openPdf()}
        disabled={loading}
        className="flex items-center w-full text-left bg-white border border-slate-200 hover:border-red-300 hover:shadow-md transition-all p-3.5 sm:p-4 rounded-2xl group min-h-[64px] disabled:cursor-wait"
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
              'PDFを閲覧する'
            )}
          </p>
        </div>
        <div className="shrink-0 w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
          <ExternalLink className="w-4 h-4" />
        </div>
      </button>
      {isOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[100] flex items-center justify-center gap-3 bg-slate-950/95 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
              PDFビューアを読み込んでいます...
            </div>
          }
        >
          <PdfViewer
            source={source}
            name={name}
            loading={loading}
            error={error}
            onClose={closeViewer}
          />
        </Suspense>
      )}
    </>
  );
}
