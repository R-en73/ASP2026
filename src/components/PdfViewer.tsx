import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  FileText,
  Loader2,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
  type PDFDocumentLoadingTask,
  type RenderTask,
} from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfViewerProps {
  source?: string | Blob;
  name: string;
  loading: boolean;
  error: string;
  onClose: () => void;
}

export default function PdfViewer({ source, name, loading, error, onClose }: PdfViewerProps) {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [documentError, setDocumentError] = useState('');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!source) return;

    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | undefined;

    const loadDocument = async () => {
      try {
        if (source instanceof Blob) {
          const data = new Uint8Array(await source.arrayBuffer());
          if (cancelled) return;
          loadingTask = getDocument({ data });
        } else if (source.startsWith('data:')) {
          const response = await fetch(source);
          if (!response.ok) throw new Error(`PDF request failed: ${response.status}`);
          const data = new Uint8Array(await response.arrayBuffer());
          if (cancelled) return;
          loadingTask = getDocument({ data });
        } else {
          loadingTask = getDocument({ url: source });
        }
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        setPdfDocument(pdf);
        setDocumentError('');
      } catch (reason) {
        if (!cancelled) {
          console.error('PDF viewer error:', reason);
          setDocumentError('PDFを表示できません。外部PDFは配信元の設定により表示できない場合があります。');
        }
      }
    };

    setPdfDocument(null);
    setDocumentError('');
    void loadDocument();

    return () => {
      cancelled = true;
      if (loadingTask) void loadingTask.destroy();
    };
  }, [source]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.overflow = 'hidden';
    document.body.style.userSelect = 'none';

    const preventRestrictedShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'p', 's', 'x'].includes(key)) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    const preventCopy = (event: ClipboardEvent) => event.preventDefault();

    window.addEventListener('keydown', preventRestrictedShortcuts, true);
    window.addEventListener('copy', preventCopy, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('keydown', preventRestrictedShortcuts, true);
      window.removeEventListener('copy', preventCopy, true);
    };
  }, [onClose]);

  const displayError = error || documentError;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} PDFビューア`}
      onContextMenu={(event) => event.preventDefault()}
      onCopy={(event) => event.preventDefault()}
      onCut={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <header className="flex flex-none items-center gap-3 border-b border-white/10 bg-slate-900 px-3 py-3 sm:px-5">
        <FileText className="h-5 w-5 flex-none text-red-400" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold sm:text-base">{name}</h2>
          <p className="text-[11px] text-slate-400">閲覧専用</p>
        </div>
        <button
          type="button"
          onClick={() => setScale((current) => Math.max(0.5, current - 0.25))}
          disabled={scale <= 0.5}
          className="rounded-lg p-2 text-slate-200 hover:bg-white/10 disabled:opacity-40"
          aria-label="縮小"
        >
          <Minus className="h-5 w-5" />
        </button>
        <span className="w-12 text-center text-xs tabular-nums">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          onClick={() => setScale((current) => Math.min(2, current + 0.25))}
          disabled={scale >= 2}
          className="rounded-lg p-2 text-slate-200 hover:bg-white/10 disabled:opacity-40"
          aria-label="拡大"
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="ml-1 rounded-lg p-2 text-slate-200 hover:bg-white/10"
          aria-label="PDFを閉じる"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <main className="min-h-0 flex-1 overflow-auto p-3 sm:p-6">
        {(loading || (source && !pdfDocument && !displayError)) && (
          <div className="flex h-full min-h-40 items-center justify-center gap-3 text-slate-300">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>PDFを読み込んでいます...</span>
          </div>
        )}
        {displayError && (
          <div className="mx-auto mt-10 flex max-w-xl items-start gap-3 rounded-xl bg-red-950/70 p-4 text-sm text-red-100">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
            <p>{displayError}</p>
          </div>
        )}
        {pdfDocument && Array.from({ length: pdfDocument.numPages }, (_, index) => (
          <PdfPage key={index + 1} document={pdfDocument} pageNumber={index + 1} scale={scale} />
        ))}
      </main>

      <footer className="flex flex-none justify-center border-t border-white/10 bg-slate-900 px-3 py-2 text-center text-[11px] text-slate-300">
        コピー・保存操作を抑止しています。画面撮影やPDFデータ取得を完全に防ぐことはできません。
      </footer>
    </div>
  );
}

function PdfPage({
  document,
  pageNumber,
  scale,
}: {
  document: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
}) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvas) return;

    let cancelled = false;
    let renderTask: RenderTask | undefined;
    const renderPage = async () => {
      try {
        const page = await document.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas 2D context is unavailable');

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.ceil(viewport.width)}px`;
        canvas.style.height = `${Math.ceil(viewport.height)}px`;
        renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
          transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
        });
        await renderTask.promise;
      } catch (reason) {
        if (!cancelled) console.error(`PDF page ${pageNumber} render error:`, reason);
      }
    };

    void renderPage();
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [canvas, document, pageNumber, scale]);

  return (
    <div className="mx-auto mb-4 w-fit max-w-full select-none bg-white shadow-xl">
      <canvas
        ref={setCanvas}
        role="img"
        aria-label={`PDF ${pageNumber}ページ`}
        draggable={false}
        className="pointer-events-none block h-auto max-w-full"
      />
    </div>
  );
}
