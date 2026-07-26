import type { LogoImage } from './types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']);

export function validateDestination(value: string):
  | { ok: true; value: string }
  | { ok: false; message: string } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, message: 'Enter a URL to generate a QR code.' };
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { ok: false, message: 'Use an http:// or https:// URL.' };
    }
    return { ok: true, value: url.toString() };
  } catch {
    return { ok: false, message: 'Enter a valid URL, such as https://example.com.' };
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image.'));
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth || image.width, height: image.naturalHeight || image.height });
    image.onerror = () => reject(new Error('This image could not be decoded by your browser.'));
    image.src = dataUrl;
  });
}

export async function fileToLogoImage(file: File): Promise<LogoImage> {
  if (!SUPPORTED_TYPES.has(file.type)) throw new Error('Choose a PNG, JPEG, GIF, WebP, or SVG image.');
  if (file.size > MAX_FILE_SIZE) throw new Error('Choose an image smaller than 10 MB.');
  const dataUrl = await readAsDataUrl(file);
  const dimensions = await getImageDimensions(dataUrl);
  if (!dimensions.width || !dimensions.height) throw new Error('This image has no usable dimensions.');
  return { dataUrl, ...dimensions, name: file.name || 'logo' };
}

export async function clipboardImage(event: ClipboardEvent): Promise<LogoImage | null> {
  const item = Array.from(event.clipboardData?.items ?? []).find((entry) => entry.kind === 'file' && SUPPORTED_TYPES.has(entry.type));
  if (!item) return null;
  const file = item.getAsFile();
  return file ? fileToLogoImage(file) : null;
}
