export interface OgpData {
  title?: string;
  description?: string;
  image?: string;
  url: string;
}

const cache = new Map<string, OgpData>();

function isSafeUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function fetchWithTimeout(input: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

export async function fetchOgp(rawUrl: string): Promise<OgpData> {
  if (!isSafeUrl(rawUrl)) {
    return { url: rawUrl, title: rawUrl };
  }
  if (cache.has(rawUrl)) return cache.get(rawUrl)!;

  const fallback: OgpData = {
    url: rawUrl,
    title: (() => {
      try {
        return new URL(rawUrl).hostname;
      } catch {
        return rawUrl;
      }
    })(),
  };

  try {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      const localResponse = await fetchWithTimeout(`${window.location.origin}/api/ogp?url=${encodeURIComponent(rawUrl)}`, 5000);
      if (localResponse.ok) {
        const localData = await localResponse.json();
        const result = {
          url: rawUrl,
          title: localData.title || fallback.title,
          description: localData.description,
          image: localData.image,
        };
        cache.set(rawUrl, result);
        return result;
      }
    }

    const response = await fetchWithTimeout(
      `https://api.microlink.io/?url=${encodeURIComponent(rawUrl)}&meta=true&screenshot=false`,
      8000
    );
    if (!response.ok) return fallback;

    const data = await response.json();
    const meta = data?.data;
    const result: OgpData = {
      url: rawUrl,
      title: meta?.title || fallback.title,
      description: meta?.description,
      image: meta?.image?.url || meta?.logo?.url,
    };
    cache.set(rawUrl, result);
    return result;
  } catch (error) {
    return fallback;
  }
}
