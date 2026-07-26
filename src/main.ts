import './style.css';
import { clipboardImage, fileToLogoImage, validateDestination } from './input';
import { renderQr } from './qr';
import type { LogoImage, QrRender } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
let logo: LogoImage | null = null;
let render: QrRender | null = null;
let lastUrl = '';

app.innerHTML = `
  <header class="site-header"><div><p class="eyebrow">QR STUDIO</p><h1>Make a QR code with your mark.</h1><p class="lede">A clean, reliable QR code with a safely sized logo in the middle.</p></div><span class="privacy">↗ Runs entirely in your browser</span></header>
  <div class="layout">
    <section class="panel controls" aria-labelledby="controls-title">
      <h2 id="controls-title">Create your code</h2>
      <form id="qr-form" novalidate>
        <label for="destination">Destination URL</label>
        <input id="destination" name="destination" type="url" placeholder="https://example.com" autocomplete="url" required />
        <p class="hint">Use the complete link you want people to open.</p>
        <p id="url-error" class="error" role="alert"></p>
        <label for="logo-file">Center logo <span class="optional">optional</span></label>
        <div id="logo-drop" class="drop-zone" tabindex="0" role="button" aria-describedby="logo-help">
          <input id="logo-file" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" hidden />
          <div class="drop-icon" aria-hidden="true">＋</div><strong>Paste, drop, or choose an image</strong><span id="logo-help">Nothing is uploaded. Your image stays on this device.</span>
          <button id="choose-logo" type="button" class="text-button">Choose image</button>
        </div>
        <div id="logo-preview" class="logo-preview" hidden><img alt="Selected logo preview" /><span class="logo-name"></span><button id="remove-logo" type="button" class="text-button">Remove</button></div>
        <p id="logo-error" class="error" role="alert"></p>
        <button id="generate" type="submit" class="primary">Generate QR code</button>
      </form>
      <p class="fine-print">High error correction is always enabled. The logo is automatically limited to a conservative 15% of the QR symbol.</p>
    </section>
    <section class="panel preview-panel" aria-labelledby="preview-title">
      <div class="preview-heading"><div><p class="eyebrow">PREVIEW</p><h2 id="preview-title">Your QR code</h2></div><span id="status" class="status" role="status" aria-live="polite">Enter a URL to begin</span></div>
      <div class="qr-stage"><div id="empty-preview" class="empty-preview"><span aria-hidden="true">▦</span><p>Your finished QR code will appear here.</p></div><img id="qr-preview" alt="Generated QR code" hidden /></div>
      <div class="downloads"><button id="download-png" class="download" type="button" disabled>Download PNG <span>↓</span></button><button id="download-svg" class="download" type="button" disabled>Download SVG <span>↓</span></button></div>
    </section>
  </div>
  <footer>Designed for links. Generated locally. No data leaves your browser.</footer>
`;

const form = document.querySelector<HTMLFormElement>('#qr-form')!;
const destination = document.querySelector<HTMLInputElement>('#destination')!;
const urlError = document.querySelector<HTMLParagraphElement>('#url-error')!;
const logoError = document.querySelector<HTMLParagraphElement>('#logo-error')!;
const status = document.querySelector<HTMLSpanElement>('#status')!;
const fileInput = document.querySelector<HTMLInputElement>('#logo-file')!;
const dropZone = document.querySelector<HTMLDivElement>('#logo-drop')!;
const logoPreview = document.querySelector<HTMLDivElement>('#logo-preview')!;
const previewImage = document.querySelector<HTMLImageElement>('#qr-preview')!;
const emptyPreview = document.querySelector<HTMLDivElement>('#empty-preview')!;
const pngButton = document.querySelector<HTMLButtonElement>('#download-png')!;
const svgButton = document.querySelector<HTMLButtonElement>('#download-svg')!;

function setError(element: HTMLElement, message = '') { element.textContent = message; }
function updateLogoPreview() {
  logoPreview.hidden = !logo;
  if (logo) { logoPreview.querySelector('img')!.src = logo.dataUrl; logoPreview.querySelector('.logo-name')!.textContent = logo.name; }
}
function updateDownloads() { pngButton.disabled = !render; svgButton.disabled = !render; }

async function generate() {
  const result = validateDestination(destination.value);
  setError(urlError);
  if (!result.ok) { setError(urlError, result.message); status.textContent = 'Waiting for a valid URL'; render = null; updateDownloads(); return; }
  lastUrl = result.value;
  status.textContent = 'Generating…';
  try {
    render = await renderQr(result.value, logo);
    previewImage.src = render.pngDataUrl; previewImage.hidden = false; emptyPreview.hidden = true; updateDownloads(); status.textContent = 'Ready to download';
  } catch (error) { status.textContent = 'Could not generate'; setError(urlError, error instanceof Error ? error.message : 'Could not generate this QR code.'); }
}

async function setLogo(input: File | LogoImage | null) {
  if (!input) return;
  setError(logoError);
  try { logo = input instanceof File ? await fileToLogoImage(input) : input; updateLogoPreview(); if (lastUrl) await generate(); }
  catch (error) { setError(logoError, error instanceof Error ? error.message : 'Could not use this image.'); }
}

form.addEventListener('submit', (event) => { event.preventDefault(); void generate(); });
destination.addEventListener('change', () => { if (destination.value.trim()) void generate(); });
document.querySelector<HTMLButtonElement>('#choose-logo')!.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => void setLogo(fileInput.files?.[0] ?? null));
dropZone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fileInput.click(); } });
dropZone.addEventListener('dragover', (event) => { event.preventDefault(); dropZone.classList.add('dragging'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop', (event) => { event.preventDefault(); dropZone.classList.remove('dragging'); void setLogo(event.dataTransfer?.files[0] ?? null); });
dropZone.addEventListener('paste', (event) => { void clipboardImage(event).then((image) => image ? setLogo(image) : setError(logoError, 'Copy an image to your clipboard, then paste it here.')).catch((error) => setError(logoError, error instanceof Error ? error.message : 'Could not paste that image.')); });
document.querySelector<HTMLButtonElement>('#remove-logo')!.addEventListener('click', () => { logo = null; updateLogoPreview(); if (lastUrl) void generate(); });
function download(filename: string, content: string, type: string) { const link = document.createElement('a'); link.href = content.startsWith('data:') ? content : URL.createObjectURL(new Blob([content], { type })); link.download = filename; link.click(); if (!content.startsWith('data:')) URL.revokeObjectURL(link.href); }
pngButton.addEventListener('click', () => render && download('qr-code.png', render.pngDataUrl, 'image/png'));
svgButton.addEventListener('click', () => render && download('qr-code.svg', render.svg, 'image/svg+xml'));
updateDownloads();
