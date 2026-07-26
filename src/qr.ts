import QRCode from 'qrcode';
import type { ErrorCorrectionLevel, LogoImage, QrRender, RenderOptions } from './types';

const DEFAULT_OPTIONS: RenderOptions = { pixelSize: 1024, quietZoneModules: 4, errorCorrectionLevel: 'H', logoPercent: 15 };
const LOGO_THRESHOLDS: Record<ErrorCorrectionLevel, number> = { L: 7, M: 10, Q: 13, H: 15 };

export function getLogoThreshold(level: ErrorCorrectionLevel): number {
  return LOGO_THRESHOLDS[level];
}

export function getLogoWarning(level: ErrorCorrectionLevel, logoPercent: number): string | null {
  const roundedPercent = Math.round(logoPercent);
  const threshold = getLogoThreshold(level);
  return roundedPercent > threshold
    ? `This ${roundedPercent}% logo is larger than the conservative recommendation for level ${level}. Test the downloaded QR code with multiple scanners before using it.`
    : null;
}

export function calculateLogoModules(moduleCount: number, logoPercent: number): number {
  if (!Number.isFinite(moduleCount) || moduleCount < 1) return 1;
  const clampedPercent = Math.min(30, Math.max(5, logoPercent));
  return Math.max(1, Math.floor(moduleCount * clampedPercent / 100));
}

export function calculateCoverCrop(width: number, height: number): { sourceX: number; sourceY: number; sourceSize: number } {
  const sourceSize = Math.min(width, height);
  return {
    sourceX: (width - sourceSize) / 2,
    sourceY: (height - sourceSize) / 2,
    sourceSize,
  };
}

async function normalizeLogo(logo: LogoImage): Promise<string> {
  const image = await decodeImage(logo.dataUrl);
  const crop = calculateCoverCrop(image.naturalWidth || logo.width, image.naturalHeight || logo.height);
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas rendering is unavailable in this browser.');
  context.clearRect(0, 0, size, size);
  context.drawImage(image, crop.sourceX, crop.sourceY, crop.sourceSize, crop.sourceSize, 0, 0, size, size);
  return canvas.toDataURL('image/png');
}

function escapeXml(value: string): string {
  return value.replace(/[&<>'\"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&apos;', '"': '&quot;' })[character]!);
}

function imageElement(dataUrl: string, x: number, y: number, size: number): string {
  return `<image href="${escapeXml(dataUrl)}" x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="none"/>`;
}

export async function renderQr(destination: string, logo: LogoImage | null, suppliedOptions: Partial<RenderOptions> = {}): Promise<QrRender> {
  const options = { ...DEFAULT_OPTIONS, ...suppliedOptions };
  const qr = QRCode.create(destination, { errorCorrectionLevel: options.errorCorrectionLevel });
  const moduleCount = qr.modules.size;
  const logoModules = logo ? calculateLogoModules(moduleCount, options.logoPercent) : 0;
  const totalModules = moduleCount + options.quietZoneModules * 2;
  const modulePixels = options.pixelSize / totalModules;
  const canvas = document.createElement('canvas');
  canvas.width = options.pixelSize;
  canvas.height = options.pixelSize;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas rendering is unavailable in this browser.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, options.pixelSize, options.pixelSize);
  context.fillStyle = '#111827';
  for (let row = 0; row < moduleCount; row += 1) {
    for (let column = 0; column < moduleCount; column += 1) {
      if (qr.modules.data[row * moduleCount + column]) {
        context.fillRect((column + options.quietZoneModules) * modulePixels, (row + options.quietZoneModules) * modulePixels, modulePixels + 0.5, modulePixels + 0.5);
      }
    }
  }

  const svgParts = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalModules} ${totalModules}" role="img">`, `<rect width="${totalModules}" height="${totalModules}" fill="#fff"/>`];
  for (let row = 0; row < moduleCount; row += 1) {
    for (let column = 0; column < moduleCount; column += 1) {
      if (qr.modules.data[row * moduleCount + column]) svgParts.push(`<rect x="${column + options.quietZoneModules}" y="${row + options.quietZoneModules}" width="1" height="1" fill="#111827"/>`);
    }
  }

  if (logo && logoModules > 0) {
    const logoStart = options.quietZoneModules + Math.floor((moduleCount - logoModules) / 2);
    const backingStart = logoStart - 1;
    const backingSize = logoModules + 2;
    const backingPixels = backingStart * modulePixels;
    const normalizedLogo = await normalizeLogo(logo);
    context.fillStyle = '#ffffff';
    context.fillRect(backingPixels, backingPixels, backingSize * modulePixels, backingSize * modulePixels);
    svgParts.push(`<rect x="${backingStart}" y="${backingStart}" width="${backingSize}" height="${backingSize}" fill="#fff"/>`);
    svgParts.push(imageElement(normalizedLogo, logoStart, logoStart, logoModules));
    context.drawImage(await decodeImage(normalizedLogo), logoStart * modulePixels, logoStart * modulePixels, logoModules * modulePixels, logoModules * modulePixels);
  }
  svgParts.push('</svg>');
  return { pngDataUrl: canvas.toDataURL('image/png'), svg: svgParts.join(''), moduleCount };
}

function decodeImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Logo image could not be rendered.'));
    image.src = dataUrl;
  });
}
