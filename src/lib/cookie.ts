/**
 * Visitor Cookie and Like Limitation Utilities
 *
 * 来場者（ゲスト）の端末にcookieを付与し、作品のいいね（投票）を最大5回までに制限するユーティリティです。
 * - 端末固有の来場者ID (aso_visitor_device_id)
 * - 投票済み作品IDリスト (aso_visitor_liked_booths)
 */

export const MAX_VISITOR_LIKES = 5;
export const COOKIE_DEVICE_KEY = 'aso_visitor_device_id';
export const COOKIE_LIKES_KEY = 'aso_visitor_liked_booths';

/**
 * Cookieを設定する
 */
export function setCookie(name: string, value: string, days: number = 365): void {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax${secure}`;
  } catch (err) {
    console.error('Failed to set cookie', err);
  }
}

/**
 * Cookieを取得する
 */
export function getCookie(name: string): string | null {
  try {
    if (typeof document === 'undefined') return null;
    const nameEQ = encodeURIComponent(name) + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
  } catch (err) {
    console.error('Failed to get cookie', err);
  }
  return null;
}

/**
 * Cookieを削除する
 */
export function deleteCookie(name: string): void {
  try {
    document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
  } catch (err) {
    console.error('Failed to delete cookie', err);
  }
}

/**
 * 端末固有の来場者IDを取得または新規発行してCookieに保存
 */
export function getOrCreateVisitorDeviceId(): string {
  // 1. Cookieから取得を試みる
  let deviceId = getCookie(COOKIE_DEVICE_KEY);
  if (deviceId && deviceId.length > 5) {
    try {
      localStorage.setItem(COOKIE_DEVICE_KEY, deviceId);
    } catch {}
    return deviceId;
  }

  // 2. localStorageフォールバック
  try {
    const localId = localStorage.getItem(COOKIE_DEVICE_KEY);
    if (localId && localId.length > 5) {
      setCookie(COOKIE_DEVICE_KEY, localId, 365);
      return localId;
    }
  } catch {}

  // 3. 新規生成
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timePart = Date.now().toString(36);
  deviceId = `v_${timePart}_${randomPart}`;

  // 保存
  setCookie(COOKIE_DEVICE_KEY, deviceId, 365);
  try {
    localStorage.setItem(COOKIE_DEVICE_KEY, deviceId);
  } catch {}

  return deviceId;
}

/**
 * 来場者がいいねした作品IDの配列を取得
 */
export function getVisitorLikedBoothIds(): string[] {
  // 1. Cookieから取得
  const cookieVal = getCookie(COOKIE_LIKES_KEY);
  if (cookieVal) {
    try {
      const parsed = JSON.parse(cookieVal);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {}
  }

  // 2. localStorageフォールバック
  try {
    const localVal = localStorage.getItem(COOKIE_LIKES_KEY);
    if (localVal) {
      const parsed = JSON.parse(localVal);
      if (Array.isArray(parsed)) {
        setCookie(COOKIE_LIKES_KEY, JSON.stringify(parsed), 365);
        return parsed;
      }
    }
  } catch {}

  return [];
}

/**
 * 来場者の現在のいいね回数
 */
export function getVisitorLikesCount(): number {
  return getVisitorLikedBoothIds().length;
}

/**
 * 来場者の残りいいね回数 (最大5回)
 */
export function getVisitorRemainingLikes(): number {
  const current = getVisitorLikesCount();
  return Math.max(0, MAX_VISITOR_LIKES - current);
}

/**
 * 指定した作品にすでにいいね済みかどうか
 */
export function hasVisitorLikedBooth(boothId: string): boolean {
  if (!boothId) return false;
  const likedList = getVisitorLikedBoothIds();
  return likedList.includes(boothId);
}

/**
 * 来場者が指定作品にいいねできるかどうかを判定
 */
export function canVisitorLike(boothId: string): { canLike: boolean; reason?: string } {
  if (!boothId) {
    return { canLike: false, reason: '作品IDが不正です' };
  }

  if (hasVisitorLikedBooth(boothId)) {
    return { canLike: false, reason: 'この作品には既にいいね済みです' };
  }

  const currentCount = getVisitorLikesCount();
  if (currentCount >= MAX_VISITOR_LIKES) {
    return {
      canLike: false,
      reason: `来場者のいいね上限（最大${MAX_VISITOR_LIKES}回）に達しました。応援ありがとうございました！`,
    };
  }

  return { canLike: true };
}

/**
 * 来場者のいいねを記録 (Cookie + localStorage同期)
 */
export function recordVisitorLike(boothId: string): { success: boolean; remaining: number; newCount?: number; error?: string } {
  const check = canVisitorLike(boothId);
  if (!check.canLike) {
    return {
      success: false,
      remaining: getVisitorRemainingLikes(),
      newCount: getVisitorLikesCount(),
      error: check.reason,
    };
  }

  const current = getVisitorLikedBoothIds();
  const nextList = [...current, boothId];
  const jsonStr = JSON.stringify(nextList);

  // CookieとlocalStorageの両方に確実に保存
  setCookie(COOKIE_LIKES_KEY, jsonStr, 365);
  try {
    localStorage.setItem(COOKIE_LIKES_KEY, jsonStr);
  } catch {}

  // 端末IDも確認・更新
  getOrCreateVisitorDeviceId();

  // 他のコンポーネントがリアルタイムで検知できるようイベント発火
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aso_visitor_likes_updated', {
      detail: {
        boothId,
        likedIds: nextList,
        count: nextList.length,
        remaining: Math.max(0, MAX_VISITOR_LIKES - nextList.length),
      },
    }));
  }

  return {
    success: true,
    remaining: Math.max(0, MAX_VISITOR_LIKES - nextList.length),
    newCount: nextList.length,
  };
}

/**
 * テスト用・リセット
 */
export function resetVisitorLikes(): void {
  deleteCookie(COOKIE_LIKES_KEY);
  try {
    localStorage.removeItem(COOKIE_LIKES_KEY);
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aso_visitor_likes_updated', {
      detail: { likedIds: [], count: 0, remaining: MAX_VISITOR_LIKES },
    }));
  }
}
