# QR Studio

A browser-only QR code generator that safely places a logo in the center of a high-error-correction QR code.

## Features

- Enter an `http://` or `https://` URL.
- Paste, drag, or select a local PNG, JPEG, GIF, WebP, or SVG logo.
- Uses QR error correction level H.
- Automatically limits the logo to a conservative 15% of the QR symbol.
- Download self-contained PNG and SVG files.
- No URL or image is uploaded or stored.

## Development

```sh
npm install
npm run dev
npm test -- --run
npm run build
```

The Vite build uses relative asset paths and can be deployed to GitHub Pages from the `dist/` directory.
