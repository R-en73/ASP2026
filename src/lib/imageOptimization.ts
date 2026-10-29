/**
 * Image optimization utility for News Eyecatch / Uploads.
 * Conforms to Non-Functional & Functional CMS Requirements:
 * - Max file size: 5MB
 * - Recommended dimensions: 1200x630px
 * - Converts to next-gen lightweight WebP format automatically
 */

export interface ProcessedImageResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  format: 'image/webp' | 'image/jpeg' | 'image/png';
}

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function processAndOptimizeImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 630,
  quality = 0.85
): Promise<ProcessedImageResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`画像サイズが大きすぎます（最大5MBまで）。現在のサイズ: ${(file.size / (1024 * 1024)).toFixed(1)}MB`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('画像の解析に失敗しました'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale down while preserving aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const widthRatio = maxWidth / width;
            const heightRatio = maxHeight / height;
            const ratio = Math.min(widthRatio, heightRatio);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context could not be created'));
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Try exporting to WebP first
          let format: 'image/webp' | 'image/jpeg' | 'image/png' = 'image/webp';
          let dataUrl = canvas.toDataURL('image/webp', quality);

          // Fallback if browser doesn't support WebP export
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            format = 'image/jpeg';
          }

          // Calculate approximate byte size from base64
          const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
          const compressedSize = Math.round((base64Length * 3) / 4);

          resolve({
            dataUrl,
            originalSize: file.size,
            compressedSize,
            width,
            height,
            format,
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
