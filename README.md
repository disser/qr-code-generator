# QR Studio

A browser-only QR code generator that safely places a logo in the center of a high-error-correction QR code.

## Features

- Enter an `http://` or `https://` URL.
- Paste, drag, or select a local PNG, JPEG, GIF, WebP, or SVG logo.
- Choose any standard QR error correction level: L, M, Q, or H (default H).
- Adjust the logo from 5% to 30% of the QR symbol (default 15%).
- Shows conservative scan-test warnings for larger logo/level combinations.
- Download self-contained PNG and SVG files.
- No URL or image is uploaded or stored.

## Settings

The logo size slider controls the visible square logo footprint. Conservative warning thresholds are L: 7%, M: 10%, Q: 13%, and H: 15%. Warnings are advisory: the QR remains downloadable, but larger logos should be tested with multiple scanners before use. Actual reliability also depends on URL length, contrast, image quality, and scanning conditions.

## Development

```sh
npm install
npm run dev
npm test -- --run
npm run build
```

The Vite build uses relative asset paths and can be deployed to GitHub Pages from the `dist/` directory.
