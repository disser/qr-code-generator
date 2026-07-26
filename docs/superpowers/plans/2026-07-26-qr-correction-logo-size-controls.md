# QR Correction and Logo Size Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add standard QR error-correction selection, adjustable 5–30% logo sizing, and level-specific scan-test warnings.

**Architecture:** Keep correction-level and logo-size policy in pure helpers in `src/qr.ts`. Pass those options through the existing QR renderer, then add accessible controls and live warning state to `src/main.ts`. Preserve the existing square crop normalization and shared PNG/SVG rendering path.

**Tech Stack:** TypeScript, Vite, `qrcode`, Vitest, existing semantic HTML/CSS.

## Global Constraints

- Offer all standard QR error-correction levels: L, M, Q, and H.
- Default correction is H.
- Logo size is 5%–30% of QR symbol width, defaulting to 15%.
- Warning thresholds are L 7%, M 10%, Q 13%, H 15%.
- Warnings are advisory and never disable preview or downloads.
- Keep all QR and image processing in the browser.
- Preserve exact square-cropped logo placement for both PNG and SVG.

---

### Task 1: Add typed correction and logo-size policy helpers

**Files:**
- Modify: `src/types.ts`
- Modify: `src/qr.ts`
- Modify: `src/qr.test.ts`

**Interfaces:**
- `ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'`
- `RenderOptions` gains `errorCorrectionLevel: ErrorCorrectionLevel` and `logoPercent: number`.
- `calculateLogoModules(moduleCount: number, logoPercent: number): number`
- `getLogoWarning(level: ErrorCorrectionLevel, logoPercent: number): string | null`
- `getLogoThreshold(level: ErrorCorrectionLevel): number`

- [ ] **Step 1: Write failing policy tests**

Add tests asserting all thresholds, `getLogoWarning('H', 15) === null`, a warning for `getLogoWarning('M', 11)`, and logo module calculations for 5%, 15%, and 30%. Update existing calls to provide the percentage argument.

- [ ] **Step 2: Run the focused tests to verify failure**

Run `npm test -- --run src/qr.test.ts`.
Expected: FAIL because the new helpers/signatures do not exist.

- [ ] **Step 3: Implement the policy helpers**

Use:

```ts
const LOGO_THRESHOLDS = { L: 7, M: 10, Q: 13, H: 15 } as const;
```

Clamp percentages to 5–30 for module calculation, return at least one module, and generate a warning that names the selected percentage and correction level and instructs the user to test the downloaded QR with multiple scanners. Return `null` at or below threshold.

- [ ] **Step 4: Run focused tests to verify success**

Run `npm test -- --run src/qr.test.ts`.
Expected: PASS.

- [ ] **Step 5: Commit the policy layer**

Run `git add src/types.ts src/qr.ts src/qr.test.ts && git commit -m "feat: add QR correction and logo size policies"`.

---

### Task 2: Pass options through QR rendering

**Files:**
- Modify: `src/qr.ts`
- Modify: `src/qr.test.ts`

**Interfaces:**
- `renderQr(destination: string, logo: LogoImage | null, options?: Partial<RenderOptions>): Promise<QrRender>` accepts both new settings.

- [ ] **Step 1: Write a failing renderer configuration test**

Mock `QRCode.create` and assert `renderQr` passes `{ errorCorrectionLevel: 'M' }` when requested. Assert that changing `logoPercent` changes the logo footprint used by rendering. Keep the existing H/default test.

- [ ] **Step 2: Run the renderer test to verify failure**

Run `npm test -- --run src/qr.test.ts`.
Expected: FAIL because rendering is still hard-coded to H and the fixed percentage.

- [ ] **Step 3: Implement option-aware rendering**

Set defaults to `{ pixelSize: 1024, quietZoneModules: 4, errorCorrectionLevel: 'H', logoPercent: 15 }`. Pass `options.errorCorrectionLevel` to `QRCode.create` and pass `options.logoPercent` to `calculateLogoModules`. Keep square normalization and exact grid-aligned PNG/SVG placement unchanged.

- [ ] **Step 4: Run renderer tests and build**

Run `npm test -- --run src/qr.test.ts && npm run build`.
Expected: focused tests pass and TypeScript/Vite build succeeds.

- [ ] **Step 5: Commit renderer changes**

Run `git add src/qr.ts src/qr.test.ts && git commit -m "feat: render configurable QR correction and logo sizes"`.

---

### Task 3: Add accessible UI controls and live warning

**Files:**
- Modify: `src/main.ts`
- Modify: `src/style.css`
- Modify: `src/main.test.ts`

**Interfaces:**
- UI state defaults to `errorCorrectionLevel = 'H'` and `logoPercent = 15`.
- UI calls `renderQr(destination, logo, { errorCorrectionLevel, logoPercent })`.
- UI displays `getLogoWarning(errorCorrectionLevel, logoPercent)` in an `aria-live="polite"` warning region.

- [ ] **Step 1: Write failing UI tests**

Test that the correction select contains L/M/Q/H and starts at H, the size slider starts at 15 and has min 5/max 30, an over-threshold selection displays a warning, and downloads remain enabled while the warning is shown.

- [ ] **Step 2: Run UI tests to verify failure**

Run `npm test -- --run src/main.test.ts`.
Expected: FAIL because the controls and warning region are absent.

- [ ] **Step 3: Implement the controls and state**

Add labeled correction and logo-size controls below the logo input. Display correction descriptions and a live percentage output. Add an amber warning/reassurance region. On `input`/`change`, update state and call `generate()` if a valid URL has already been entered. Pass both values into `renderQr`.

- [ ] **Step 4: Style responsive controls and warnings**

Add styles for the select, range slider, live value, and warning/reassurance states. Keep controls touch-friendly and preserve the existing mobile layout and visible focus states.

- [ ] **Step 5: Run UI tests and full suite**

Run `npm test -- --run && npm run build`.
Expected: all tests pass and production build succeeds.

- [ ] **Step 6: Commit UI changes**

Run `git add src/main.ts src/main.test.ts src/style.css && git commit -m "feat: add QR settings controls and scan warning"`.

---

### Task 4: Document and verify the feature

**Files:**
- Modify: `README.md`

**Interfaces:**
- Documentation describes the four correction levels, 5–30% logo slider, default settings, threshold warnings, and the need to test output with multiple scanners when warned.

- [ ] **Step 1: Update README**

Add a Settings section with the exact defaults and thresholds. Explain that thresholds are conservative advisory heuristics and that warnings do not guarantee or prevent scanning.

- [ ] **Step 2: Run final verification**

Run:

```bash
npm test -- --run
npm run build
```

Expected: all tests pass and the production build completes successfully.

- [ ] **Step 3: Commit documentation**

Run `git add README.md && git commit -m "docs: document QR settings and warnings"`.
