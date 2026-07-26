export interface LogoImage {
  dataUrl: string;
  width: number;
  height: number;
  name: string;
}

export interface RenderOptions {
  pixelSize: number;
  quietZoneModules: number;
}

export interface QrRender {
  pngDataUrl: string;
  svg: string;
  moduleCount: number;
}
