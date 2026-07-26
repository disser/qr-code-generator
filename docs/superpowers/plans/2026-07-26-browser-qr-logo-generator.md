# Browser QR Logo Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-only QR generator that accepts a URL and a pasted or local logo image, renders a conservative high-error-correction QR code, and downloads PNG or self-contained SVG output from a GitHub Pages-compatible static site.

**Architecture:** Use Vite and TypeScript for a static frontend. Keep pure validation, logo sizing, QR matrix rendering, and browser event handling in separate modules. Generate the QR matrix with error correction H, then render the same matrix into canvas/PNG and SVG while embedding the in-memory logo data.

**Tech Stack:** Vite, TypeScript, `qrcode`, Vitest, Testing Library DOM helpers, semantic HTML, CSS.

## Global Constraints

- All QR generation and image processing must occur entirely in the browser.
- Do not upload, persist, analyze, or fetch logo images remotely.
- Accept logos only from clipboard paste, local file selection, or local drag-and-drop.
- Use QR error correction level H for every QR code.
- Cap the visible logo at 15% of the QR symbol width, with opaque white backing and quiet-zone protection.
- Provide both PNG and self-contained SVG downloads.
- Support desktop and mobile layouts and keyboard-accessible controls.
- Build output must work under a GitHub Pages repository subpath.

---

### Task 1: Scaffold the static TypeScript application

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/style.css`
- Create: `src/types.ts`
- Create: `src/test/setup.ts`
- Create: `vitest.config.ts`
- Modify: `docs/superpowers/specs/2026-07-26-browser-qr-logo-generator-design.md` only if implementation constraints require clarification

**Interfaces:**
- Produces an executable `npm run dev`, `npm run build`, and `npm test` project.
- `src/types.ts` defines shared `LogoImage`, `QrRender`, and `RenderOptions` types used by later tasks.

- [ ] **Step 1: Write package and TypeScript configuration**

Define scripts `dev`, `build`, `preview`, `test`, and `test:watch`; add runtime dependency `qrcode` and development dependencies `vite`, `typescript`, `vitest`, `jsdom`, and `@testing-library/jest-dom`. Configure TypeScript for strict browser code and configure Vite to use a relative base (`./`) so built assets work from a GitHub Pages subpath.

- [ ] **Step 2: Create the minimal HTML shell and entry point**

Create a semantic `<main id="app">` root, load `/src/main.ts`, and leave all visible controls to the application renderer. Add a meaningful document title and viewport metadata.

- [ ] **Step 3: Add shared types and test setup**

Define:

```ts
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
```

Configure Vitest with a jsdom environment and `@testing-library/jest-dom` setup.

- [ ] **Step 4: Run the scaffold checks**

Run `npm install && npm run build && npm test -- --run`.
Expected: build succeeds and the test runner starts with zero test files rather than configuration errors.

- [ ] **Step 5: Commit the scaffold**

Run `git add package.json package-lock.json tsconfig.json vite.config.ts vitest.config.ts index.html src && git commit -m "chore: scaffold static QR generator"` when repository metadata is available.

---

### Task 2: Implement URL and local image input utilities with tests

**Files:**
- Create: `src/input.ts`
- Create: `src/input.test.ts`
- Modify: `src/types.ts` only if the input contracts need a shared type

**Interfaces:**
- `validateDestination(value: string): { ok: true; value: string } | { ok: false; message: string }`
- `fileToLogoImage(file: File): Promise<LogoImage>`
- `clipboardImage(event: ClipboardEvent): Promise<LogoImage | null>`

- [ ] **Step 1: Write failing URL validation tests**

Test that trimmed `https://example.com/path` is accepted and returned trimmed, empty input is rejected, malformed input is rejected, and non-HTTP schemes such as `javascript:` and `file:` are rejected.

- [ ] **Step 2: Run URL tests to verify failure**

Run `npm test -- --run src/input.test.ts`.
Expected: FAIL because `validateDestination` is not implemented.

- [ ] **Step 3: Implement URL validation**

Parse with `new URL`; accept only `http:` and `https:`; return a specific user-facing error for empty or invalid values.

- [ ] **Step 4: Write failing image input tests**

Test rejection of non-image MIME types and files larger than 10 MiB. Test that `clipboardImage` returns `null` when the clipboard has no image item and identifies an image item when present. Mock `FileReader` and `Image`/`createImageBitmap` so tests remain deterministic.

- [ ] **Step 5: Run image tests to verify failure**

Run `npm test -- --run src/input.test.ts`.
Expected: FAIL on the missing image utilities.

- [ ] **Step 6: Implement image decoding**

Accept `image/png`, `image/jpeg`, `image/gif`, `image/webp`, and `image/svg+xml` only when the browser can decode them. Convert accepted files to data URLs, decode dimensions, reject decode failures, and return `LogoImage`. Read only clipboard image items; never read clipboard text as a remote URL.

- [ ] **Step 7: Run input tests to verify success**

Run `npm test -- --run src/input.test.ts`.
Expected: PASS.

- [ ] **Step 8: Commit the input utilities**

Run `git add src/input.ts src/input.test.ts src/types.ts && git commit -m "feat: validate destinations and decode local logos"` when repository metadata is available.

---

### Task 3: Implement QR generation, conservative logo sizing, PNG, and SVG rendering

**Files:**
- Create: `src/qr.ts`
- Create: `src/qr.test.ts`
- Modify: `src/types.ts` if renderer data requires an additional explicit field

**Interfaces:**
- `calculateLogoModules(moduleCount: number): number`
- `renderQr(destination: string, logo: LogoImage | null, options?: Partial<RenderOptions>): Promise<QrRender>`

- [ ] **Step 1: Write failing safety and rendering tests**

Test that `calculateLogoModules` never exceeds 15% of the symbol width, returns a positive whole-module size, and becomes no larger as module count decreases. Mock the QR library and canvas APIs to assert `errorCorrectionLevel: "H"`, quiet-zone handling, and that rendering produces an SVG containing an embedded data URL and a PNG data URL.

- [ ] **Step 2: Run renderer tests to verify failure**

Run `npm test -- --run src/qr.test.ts`.
Expected: FAIL because renderer functions are absent.

- [ ] **Step 3: Implement QR matrix generation**

Use `qrcode.create(destination, { errorCorrectionLevel: "H" })` to obtain the module matrix. Keep the matrix and module count as the single source for both output formats. Use a four-module quiet zone and a fixed default output size of 1024 pixels, scaling modules without fractional gaps.

- [ ] **Step 4: Implement conservative logo geometry**

Calculate the logo’s visible square as `floor(moduleCount * 0.15)` modules, clamped to at least one module and no more than the available interior area. Center the logo and add an opaque white backing at least one module larger on every side, while keeping all backing pixels inside the symbol area.

- [ ] **Step 5: Implement canvas PNG rendering**

Draw the white background and dark modules onto an offscreen canvas, draw the white logo backing, then draw the decoded logo with `object-fit: contain`-equivalent aspect preservation inside the visible square. Return `canvas.toDataURL("image/png")`.

- [ ] **Step 6: Implement self-contained SVG rendering**

Emit an SVG with explicit `viewBox`, white background, QR module paths/rectangles, white logo backing, and an `<image href="data:...">` element. Escape XML attribute values and include no external references.

- [ ] **Step 7: Run renderer tests to verify success**

Run `npm test -- --run src/qr.test.ts`.
Expected: PASS.

- [ ] **Step 8: Commit QR rendering**

Run `git add src/qr.ts src/qr.test.ts src/types.ts && git commit -m "feat: render high-correction QR codes with embedded logos"` when repository metadata is available.

---

### Task 4: Build the responsive accessible UI and connect browser events

**Files:**
- Modify: `src/main.ts`
- Modify: `src/style.css`
- Create: `src/main.test.ts`

**Interfaces:**
- UI consumes `validateDestination`, `fileToLogoImage`, `clipboardImage`, and `renderQr`.
- UI state tracks destination, current logo, current render, and inline error text without mutating a valid render on failed updates.

- [ ] **Step 1: Write failing UI tests**

Test that the page renders a labeled URL field, paste/upload/drop logo controls, preview region, and PNG/SVG buttons. Test that an invalid URL shows an inline error and disables downloads. Test that a valid URL invokes `renderQr`, displays the preview, and enables both downloads. Test that a pasted logo replaces the current logo and that remove clears it.

- [ ] **Step 2: Run UI tests to verify failure**

Run `npm test -- --run src/main.test.ts`.
Expected: FAIL because the UI is not implemented.

- [ ] **Step 3: Implement semantic page markup and state**

Render a header, form, URL input, live status/error region, logo drop zone with hidden file input, logo preview/remove action, QR preview image, and download buttons. Add `aria-live` status output and labels associated with every control.

- [ ] **Step 4: Connect URL, file, drag/drop, and paste events**

Validate destination input, invoke rendering after valid changes, prevent default drag behavior, process only local image files, and listen for `paste` at the drop zone. Show explicit messages for clipboard permission errors and invalid files. Keep the last successful preview when a new render fails.

- [ ] **Step 5: Connect PNG and SVG downloads**

Create object URLs or data URL anchors with filenames derived from the hostname, sanitized to `[a-z0-9-]`, and revoke object URLs after use. Download PNG as `qr-code.png` fallback and SVG as `qr-code.svg` fallback.

- [ ] **Step 6: Add responsive visual styling**

Use a mobile-first layout with a single-column form and preview, expanding to a two-column desktop layout. Provide high contrast, visible focus rings, minimum 44px touch targets, drop-zone hover/focus states, responsive preview sizing, and a neutral background that does not reduce QR contrast.

- [ ] **Step 7: Run UI tests and build**

Run `npm test -- --run src/main.test.ts` and `npm run build`.
Expected: all UI tests pass and Vite emits static assets.

- [ ] **Step 8: Commit the application UI**

Run `git add src/main.ts src/main.test.ts src/style.css && git commit -m "feat: add responsive QR generator interface"` when repository metadata is available.

---

### Task 5: Add GitHub Pages deployment and final verification

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Create: `README.md`
- Modify: `package.json` only if the deployment workflow needs a final script adjustment

**Interfaces:**
- GitHub Actions builds the site with `npm ci` and publishes `dist/` using GitHub Pages artifact/deployment actions.

- [ ] **Step 1: Write deployment configuration**

Create a workflow triggered on pushes to the default branch and manual dispatch. Grant `pages: write` and `id-token: write`, run on Ubuntu, install with `npm ci`, run `npm run build`, upload `dist/`, and deploy the Pages artifact. Keep Vite’s relative base so repository and custom-domain hosting both resolve assets.

- [ ] **Step 2: Document local use and privacy behavior**

README must include `npm install`, `npm run dev`, `npm test`, `npm run build`, supported logo inputs, the 15% conservative logo limit, QR level H, PNG/SVG downloads, and the fact that no images or URLs leave the browser.

- [ ] **Step 3: Run the full verification suite**

Run:

```bash
npm test -- --run
npm run build
```

Expected: all tests pass and the production build completes without TypeScript or Vite errors. Inspect `dist/index.html` and confirm asset references are relative.

- [ ] **Step 4: Perform a manual browser smoke test**

Run `npm run dev -- --host 127.0.0.1`, open the displayed local URL, enter an HTTPS URL, upload an image, paste an image, remove and replace the logo, download both formats, and verify the SVG contains no external image URL. Repeat at a narrow mobile viewport and keyboard-only navigation.

- [ ] **Step 5: Commit deployment documentation**

Run `git add .github/workflows/deploy-pages.yml README.md && git commit -m "ci: deploy QR generator to GitHub Pages"` when repository metadata is available.
