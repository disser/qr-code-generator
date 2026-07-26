# QR Correction and Logo Size Controls Design

## Goal

Allow users to select any standard QR error-correction level and adjust the logo size while warning when the selected combination exceeds a conservative recommendation.

## Controls and defaults

- Error correction select: L, M, Q, H.
- Default correction: H.
- Logo size slider: 5%–30% of the QR symbol width.
- Default logo size: 15%.
- Existing square crop/normalization remains in use for both PNG and SVG output.

Changing either control regenerates the QR code when a valid URL is present.

## Conservative warning thresholds

| Level | Warning begins above |
|---|---:|
| L | 7% |
| M | 10% |
| Q | 13% |
| H | 15% |

These values are advisory geometry heuristics, not guarantees derived from the exact QR data/codeword layout.

When the size exceeds the selected level’s threshold, show an amber warning while keeping preview and downloads enabled. The warning names the selected level and size and tells the user to test the downloaded QR code with multiple scanners. At or below the threshold, show quiet reassurance that the selection is within the conservative recommendation. Reliability also depends on URL length, contrast, image quality, and scanning conditions.

## Architecture

Extend renderer options with `errorCorrectionLevel` and `logoPercent`. Pass the selected level to `qrcode.create`, and calculate logo modules from the selected percentage. Add pure helpers for thresholds, warning/reassurance text, and percentage-to-module conversion. Keep input handling and square logo normalization unchanged.

## Testing and documentation

Test all correction levels, custom logo sizes, threshold text, default behavior, and render configuration. Test that changing controls regenerates output and that warnings do not disable downloads. Update README with the new controls and advisory warning behavior. Verify production build and full test suite.
