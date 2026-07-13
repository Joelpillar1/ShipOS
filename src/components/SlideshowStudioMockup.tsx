import { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CaseStyle = "Aa" | "AA" | "aa";
type Align = "left" | "center" | "right";
type VAlign = "top" | "middle" | "bottom";

const BRANDS = [
  { name: "Buffer", bg: "#0E3D3A", accent: "#7CFFB2" },
  { name: "Hootsuite", bg: "#C0392B", accent: "#fff" },
  { name: "Postiz", bg: "#6C3CE1", accent: "#fff" },
  { name: "Myshipos.com", bg: "#d75a34", accent: "#fff" },
] as const;

const SLIDE_TEXTS = [
  "Which is your favorite?",
  "Ship the product. Run social in one batch.",
  "Batch Friday. Schedule Saturday. Ship Monday.",
];

/**
 * Interactive Slideshow Studio editor mockup for the founder landing.
 */
export function SlideshowStudioMockup({ className }: { className?: string }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [headline, setHeadline] = useState(SLIDE_TEXTS[0]);
  const [caseStyle, setCaseStyle] = useState<CaseStyle>("Aa");
  const [align, setAlign] = useState<Align>("center");
  const [vAlign, setVAlign] = useState<VAlign>("middle");
  const [fontSize, setFontSize] = useState(42);
  const [slides, setSlides] = useState(SLIDE_TEXTS);

  const displayText = (() => {
    if (caseStyle === "AA") return headline.toUpperCase();
    if (caseStyle === "aa") return headline.toLowerCase();
    return headline;
  })();

  const goSlide = (i: number) => {
    const next = (i + slides.length) % slides.length;
    setSlideIndex(next);
    setHeadline(slides[next]);
  };

  const addSlide = () => {
    if (slides.length >= 6) return;
    const next = [...slides, `Slide ${slides.length + 1}`];
    setSlides(next);
    setSlideIndex(next.length - 1);
    setHeadline(next[next.length - 1]);
  };

  const removeSlide = () => {
    if (slides.length <= 1) return;
    const next = slides.filter((_, i) => i !== slideIndex);
    const idx = Math.min(slideIndex, next.length - 1);
    setSlides(next);
    setSlideIndex(idx);
    setHeadline(next[idx]);
  };

  return (
    <div
      className={cn(
        "w-full max-w-[780px] max-h-[400px] bg-card border border-border shadow-sm overflow-hidden text-left select-none flex flex-col",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted/10 shrink-0">
        <button
          type="button"
          className="h-7 px-2 text-[10px] font-bold border border-border bg-background hover:bg-muted inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          All Slideshows
        </button>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="h-7 px-2.5 text-[10px] font-bold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save Slideshow
          </button>
          <button
            type="button"
            onClick={() => {
              setHeadline(SLIDE_TEXTS[0]);
              setSlides(SLIDE_TEXTS);
              setSlideIndex(0);
              setCaseStyle("Aa");
              setAlign("center");
              setVAlign("middle");
              setFontSize(42);
            }}
            className="h-7 px-2.5 text-[10px] font-bold text-destructive border border-destructive/30 hover:bg-destructive/10"
          >
            Reset All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_200px] min-h-0 flex-1 h-[352px]">
        <div className="p-3 sm:p-4 flex flex-col items-center justify-center gap-2 bg-muted/20 border-b md:border-b-0 md:border-r border-border min-h-0 overflow-hidden">
          <div className="w-[120px] sm:w-[136px] aspect-[9/16] bg-[#111] border border-border shadow-md flex flex-col overflow-hidden relative shrink-0">
            <div
              className={cn(
                "px-2 pt-2.5 flex",
                vAlign === "top" && "items-start",
                vAlign === "middle" && "items-center flex-1",
                vAlign === "bottom" && "items-end flex-1 pb-1.5"
              )}
            >
              <p
                style={{ fontSize: Math.max(9, Math.round(fontSize * 0.17)) }}
                className={cn(
                  "w-full text-white font-light leading-tight",
                  align === "left" && "text-left",
                  align === "center" && "text-center",
                  align === "right" && "text-right"
                )}
              >
                {displayText}
              </p>
            </div>

            <div className="mt-auto p-1.5 grid grid-cols-2 gap-1">
              {BRANDS.map((brand) => (
                <div key={brand.name} className="flex flex-col gap-0.5">
                  <span className="text-[5px] font-bold text-white/70 text-center truncate">
                    {brand.name}
                  </span>
                  <div
                    className="aspect-square flex items-center justify-center"
                    style={{ backgroundColor: brand.bg }}
                  >
                    {brand.name === "Myshipos.com" ? (
                      <span className="text-[8px] font-black text-white tracking-tight">OS</span>
                    ) : brand.name === "Postiz" ? (
                      <span className="text-[11px] font-black text-white">P</span>
                    ) : brand.name === "Hootsuite" ? (
                      <span className="text-[9px]">🦉</span>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <div className="w-2.5 h-0.5 rounded-sm" style={{ backgroundColor: brand.accent }} />
                        <div className="w-2.5 h-0.5 rounded-sm opacity-80" style={{ backgroundColor: brand.accent }} />
                        <div className="w-2.5 h-0.5 rounded-sm opacity-60" style={{ backgroundColor: brand.accent }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[8px] text-muted-foreground font-medium shrink-0">
            Drag elements to reposition them.
          </p>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => goSlide(slideIndex - 1)}
              className="h-6 w-6 border border-border bg-background flex items-center justify-center hover:bg-muted"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-[9px] font-bold tabular-nums min-w-[36px] text-center">
              {slideIndex + 1} / {slides.length}
            </span>
            <button
              type="button"
              onClick={() => goSlide(slideIndex + 1)}
              className="h-6 w-6 border border-border bg-background flex items-center justify-center hover:bg-muted"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={removeSlide}
              className="h-6 w-6 border border-border bg-background flex items-center justify-center text-destructive hover:bg-destructive/10"
              title="Delete slide"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goSlide(i)}
                className={cn(
                  "w-5 h-7 border overflow-hidden bg-[#111] relative",
                  i === slideIndex
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-border opacity-70 hover:opacity-100"
                )}
              >
                <span className="absolute top-0 left-0.5 text-[5px] text-white/50 font-bold">
                  {i + 1}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={addSlide}
              className="w-5 h-7 border border-dashed border-border flex items-center justify-center hover:border-foreground/40"
              title="Add slide"
            >
              <Plus className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Right sidebar — scrollable body, sticky footer */}
        <div className="flex flex-col min-h-0 h-full overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2.5 custom-scrollbar">
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1 block">
                <span className="text-[9px] font-bold tracking-wider text-muted-foreground">Format</span>
                <select className="w-full h-7 text-[10px] font-bold border border-border bg-background px-1.5 outline-none">
                  <option>Story / Reel…</option>
                  <option>Feed Post</option>
                  <option>Portrait 4:5</option>
                </select>
              </label>
              <label className="space-y-1 block">
                <span className="text-[9px] font-bold tracking-wider text-muted-foreground">Slide Type</span>
                <select className="w-full h-7 text-[10px] font-bold border border-border bg-background px-1.5 outline-none">
                  <option>2x2 Grid</option>
                  <option>Title Only</option>
                  <option>List</option>
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold tracking-wider text-muted-foreground">
                Text Blocks (1)
              </span>
              <button type="button" className="text-[9px] font-bold text-primary">
                + Add
              </button>
            </div>

            <div className="border border-primary/40 bg-primary/5 px-2 py-1.5 text-[10px] font-bold text-foreground">
              Block 1
            </div>

            <label className="space-y-1 block">
              <span className="text-[9px] font-bold tracking-wider text-muted-foreground">
                Active Block Content
              </span>
              <textarea
                value={headline}
                onChange={(e) => {
                  setHeadline(e.target.value);
                  setSlides((prev) => prev.map((s, i) => (i === slideIndex ? e.target.value : s)));
                }}
                className="w-full min-h-[44px] text-[11px] p-2 border border-border bg-background resize-none outline-none focus:ring-1 focus:ring-primary/30"
              />
            </label>

            <label className="space-y-1 block">
              <span className="text-[9px] font-bold tracking-wider text-muted-foreground">Font</span>
              <select className="w-full h-7 text-[10px] font-bold border border-border bg-background px-1.5 outline-none">
                <option>Lato Light</option>
                <option>Inter</option>
                <option>Space Grotesk</option>
              </select>
            </label>

            <div className="space-y-1">
              <span className="text-[9px] font-bold tracking-wider text-muted-foreground">Text Case</span>
              <div className="flex border border-border">
                {(["Aa", "AA", "aa"] as CaseStyle[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCaseStyle(c)}
                    className={cn(
                      "flex-1 h-7 text-[10px] font-bold",
                      caseStyle === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <label className="space-y-1 block">
              <span className="text-[9px] font-bold tracking-wider text-muted-foreground">
                Text Size · {fontSize}
              </span>
              <input
                type="range"
                min={24}
                max={120}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </label>

            <div className="space-y-1">
              <span className="text-[9px] font-bold tracking-wider text-muted-foreground">Alignment</span>
              <div className="flex border border-border">
                {(
                  [
                    ["left", AlignLeft],
                    ["center", AlignCenter],
                    ["right", AlignRight],
                  ] as const
                ).map(([value, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAlign(value)}
                    className={cn(
                      "flex-1 h-7 flex items-center justify-center",
                      align === value
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
              <div className="flex border border-border">
                {(["top", "middle", "bottom"] as VAlign[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setVAlign(value)}
                    className={cn(
                      "flex-1 h-7 text-[9px] font-bold capitalize",
                      vAlign === value
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2 border-t border-border flex gap-1.5 shrink-0 bg-card">
            <button
              type="button"
              className="flex-1 h-8 text-[10px] font-bold border border-border bg-background hover:bg-muted inline-flex items-center justify-center gap-1"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
            <button
              type="button"
              onClick={() =>
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="flex-1 h-8 text-[10px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-1"
            >
              <Send className="w-3 h-3" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
