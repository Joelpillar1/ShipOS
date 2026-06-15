import { toBlob } from "html-to-image";

// ── Output formats ──────────────────────────────────────────────────────────────
export type Format = { id: string; label: string; w: number; h: number };

// The most-used social formats. 1080-wide base keeps everything crisp.
export const FORMATS: Format[] = [
  { id: "9:16", label: "Story / Reel — 9:16", w: 1080, h: 1920 },
  { id: "4:5", label: "Portrait — 4:5", w: 1080, h: 1350 },
  { id: "1:1", label: "Square — 1:1", w: 1080, h: 1080 },
  { id: "16:9", label: "Landscape — 16:9", w: 1920, h: 1080 },
];

// ── Image export (html-to-image) ─────────────────────────────────────────────────
export async function renderImageSlideBlob(node: HTMLElement, w: number, h: number): Promise<Blob | null> {
  return toBlob(node, { width: w, height: h, pixelRatio: 1, cacheBust: true });
}
