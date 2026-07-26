export interface LogoImage {
  dataUrl: string;
  width: number;
  height: number;
  name: string;
}

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface RenderOptions {
  pixelSize: number;
  quietZoneModules: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  logoPercent: number;
}

export interface QrRender {
  pngDataUrl: string;
  svg: string;
  moduleCount: number;
}
