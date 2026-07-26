# Browser QR Logo Generator Design

## Goal

Create a privacy-preserving QR code generator that runs entirely in the browser and can be deployed as a static site to GitHub Pages. Users enter a URL, optionally add a logo by pasting or selecting a local image, preview the result, and download PNG or SVG output.

## Decisions

- Frontend: Vite + TypeScript.
- Runtime: browser-only; no backend, uploads, persistence, analytics, or image URL fetching.
- QR error correction: level H for every generated QR code.
- Logo sources: clipboard paste, local file upload, and drag-and-drop. Remote image URLs are not supported because browser CORS would make behavior unreliable.
- Output: self-contained PNG and SVG downloads.
- Logo size: automatically calculated and capped conservatively at 15% of the QR symbol width. The logo is center-aligned, backed by opaque white padding, and rounded to whole QR modules. It must not affect the quiet zone.

## Architecture and data flow

The application is a single static Vite/TypeScript frontend:

1. The URL form validates and normalizes the destination.
2. Clipboard or file input decodes an image entirely in memory as a logo image bitmap, converting to a lo-fi bitmap as needed
3. The QR engine creates a QR matrix with error correction H.
4. A canvas renderer produces the PNG representation.
5. An SVG renderer produces a self-contained SVG containing QR modules and the embedded logo data.
6. The preview and download buttons use the in-memory render result.

The build output is suitable for GitHub Pages, including deployment under a repository subpath.

## Interface

The responsive page contains:

- Header with the app name and a browser-only privacy statement.
- URL input with inline validation and live/submit-driven preview updates.
- Logo drop zone supporting paste, local file selection, and drag-and-drop, with replace/remove controls.
- Responsive QR preview on a neutral surface.
- PNG and SVG download buttons disabled until a valid render exists.

Controls will have accessible labels, keyboard support, visible focus states, and touch-friendly sizing.

## Safety and error handling

The renderer uses high error correction, a standard quiet zone, high-contrast modules, and an opaque white logo backing. The visible logo is limited to 15% of symbol width; this is intentionally conservative, though scanning also depends on content length, display/print quality, logo appearance, and scanner quality.

Inline errors handle empty or invalid URLs, unsupported or oversized files, unsupported clipboard content, clipboard permission failures, image decode failures, and URLs too long for QR encoding. Existing valid previews remain available when a subsequent input fails.

## Verification

Automated tests will cover URL validation, image input handling, logo-size calculation, QR error-correction configuration, PNG rendering, SVG rendering, and download behavior. A production build check will verify static output and GitHub Pages subpath compatibility.
