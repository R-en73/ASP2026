import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { fetchOgp, OgpData } from '../lib/ogp';

interface OgpLinkCardProps {
  url: string;
  compact?: boolean;
}

export default function OgpLinkCard({ url, compact = false }: OgpLinkCardProps) {
  const [ogp, setOgp] = useState<OgpData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchOgp(url)
      .then((data) => {
        if (active) setOgp(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [url]);

  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-cyan-400 hover:bg-cyan-50/40"
      >
        {ogp?.image ? (
          <img src={ogp.image} alt={ogp.title || '外部リンクのプレビュー'} className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-400">
            <ExternalLink className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-bold text-slate-800">
            {loading ? 'リンク情報を取得中...' : ogp?.title || url}
          </div>
          {ogp?.description && (
            <div className="mt-1 line-clamp-1 text-[10px] text-slate-500">{ogp.description}</div>
          )}
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-cyan-500 hover:shadow-md"
    >
      {loading ? (
        <div className="flex h-full animate-pulse flex-col">
          <div className="mb-3 h-4 w-3/4 rounded bg-slate-100"></div>
          <div className="mb-3 aspect-video w-full rounded-xl bg-slate-100"></div>
          <div className="h-3 w-full rounded bg-slate-100"></div>
        </div>
      ) : (
        <>
          <h4 className="mb-3 line-clamp-2 text-[15px] font-bold leading-snug text-slate-800 group-hover:text-cyan-600">
            {ogp?.title || url}
          </h4>
          {ogp?.image ? (
            <div className="mb-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2">
              <img src={ogp.image} alt={ogp.title || '外部リンクのプレビュー'} className="h-full w-full rounded-lg object-contain" />
            </div>
          ) : (
            <div className="mb-3 flex aspect-video w-full items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-300">
              <ExternalLink className="h-8 w-8" />
            </div>
          )}
          <div className="mt-auto flex flex-col gap-1.5">
            {ogp?.description && (
              <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-500">{ogp.description}</p>
            )}
            <span className="flex truncate items-center gap-1.5 text-[10px] text-slate-400">
              <ExternalLink className="h-3 w-3 shrink-0" />
              {url}
            </span>
          </div>
        </>
      )}
    </a>
  );
}
