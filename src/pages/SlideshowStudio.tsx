import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Images,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Download,
  Send,
  ImagePlus,
  Crown,
  Loader2,
  Type,
  Palette,
  Sparkles,
  ShieldAlert,
  Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/context/TeamContext";
import { useAutosaveDraft } from "@/hooks/useAutosaveDraft";
import { useFreePlanGate } from "@/hooks/useFreePlanGate";
import { getUserProfile, type UserProfile } from "@/lib/postStorage";
import { SlideCanvas, type Slide, type TextBox, getSlideTextBoxes } from "@/components/slideshow-studio/SlideCanvas";
import { FORMATS, type Format, renderImageSlideBlob } from "@/lib/slideshowExport";

// A varied set — heavy display fonts, clean sans, elegant serifs, and scripts — each with a
// natural weight so they aren't all bold.
const FONTS = [
  // Clean, light sans — readable body/caption style text (lighter weights so they aren't bold).
  { label: "Inter", value: "'Inter', sans-serif", weight: 400 },
  { label: "Inter Light", value: "'Inter', sans-serif", weight: 300 },
  { label: "Poppins Light", value: "'Poppins', sans-serif", weight: 300 },
  { label: "Lato Light", value: "'Lato', sans-serif", weight: 300 },
  { label: "Roboto Light", value: "'Roboto', sans-serif", weight: 300 },
  { label: "Open Sans", value: "'Open Sans', sans-serif", weight: 400 },
  { label: "Work Sans", value: "'Work Sans', sans-serif", weight: 300 },
  { label: "Raleway", value: "'Raleway', sans-serif", weight: 300 },
  { label: "Nunito", value: "'Nunito', sans-serif", weight: 400 },
  { label: "Source Sans", value: "'Source Sans 3', sans-serif", weight: 400 },
  { label: "Montserrat Light", value: "'Montserrat', sans-serif", weight: 300 },
  { label: "System Sans", value: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", weight: 400 },
  // Heavy display fonts — bold, attention-grabbing headlines.
  { label: "Anton", value: "'Anton', sans-serif", weight: 400 },
  { label: "Archivo Black", value: "'Archivo Black', sans-serif", weight: 400 },
  { label: "Bebas Neue", value: "'Bebas Neue', sans-serif", weight: 400 },
  { label: "Oswald", value: "'Oswald', sans-serif", weight: 600 },
  { label: "Poppins", value: "'Poppins', sans-serif", weight: 700 },
  { label: "Montserrat", value: "'Montserrat', sans-serif", weight: 700 },
  { label: "Outfit", value: "'Outfit', sans-serif", weight: 500 },
  // Elegant serifs.
  { label: "Playfair Display", value: "'Playfair Display', serif", weight: 600 },
  { label: "Merriweather", value: "'Merriweather', serif", weight: 400 },
  // Handwritten / script.
  { label: "Caveat", value: "'Caveat', cursive", weight: 700 },
  { label: "Dancing Script", value: "'Dancing Script', cursive", weight: 600 },
  { label: "Pacifico", value: "'Pacifico', cursive", weight: 400 },
];

// Default font for new slides/text boxes. Pinned to Anton (bold display) so adding lighter
// fonts to the list above doesn't change the default headline look.
const DEFAULT_FONT = FONTS.find((f) => f.label === "Anton") || FONTS[0];

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function makeSlide(text = ""): Slide {
  return {
    id: uid(),
    text,
    overlay: 35,
    font: DEFAULT_FONT.value,
    fontSize: 84,
    fontWeight: DEFAULT_FONT.weight,
    textColor: "#ffffff",
    align: "center",
    highlight: false,
    highlightColor: "#000000",
    textX: 0.5,
    textY: 0.5,
    casing: "sentence",
  };
}

const sectionLabel = "text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground";
const fieldLabel = "text-[10px] font-bold uppercase tracking-widest text-muted-foreground";

const SlideshowStudio = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUserRole } = useTeam();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [format, setFormat] = useState<Format>(FORMATS[0]);
  const [scriptText, setScriptText] = useState("");
  const [started, setStarted] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);

  // Full-resolution nodes rendered offscreen — html-to-image captures these for PNG export.
  const exportRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    (async () => {
      const p = await getUserProfile();
      setProfile(p);
      setProfileLoading(false);
    })();
  }, []);

  // ── Auto-save & restore the in-progress slideshow ──────────────────────────
  // Slide background images are stored as data URLs, so the whole slideshow is JSON-serializable
  // and survives leaving/returning to the page. It self-clears once there's nothing left (no
  // slides, script, or caption); a slideshow handed off to Create Post is kept so the user can
  // return and re-send it. Large image-heavy slideshows may exceed the storage quota, in which
  // case the hook silently skips persisting (no worse than the previous always-lose behaviour).
  useAutosaveDraft({
    pageKey: "slideshow-studio",
    data: { format, scriptText, started, slides, activeId, activeBoxId, caption },
    isEmpty: (d) => d.slides.length === 0 && !d.scriptText.trim() && !d.caption.trim(),
    onRestore: (saved) => {
      if (saved.format) setFormat(saved.format);
      if (typeof saved.scriptText === "string") setScriptText(saved.scriptText);
      if (Array.isArray(saved.slides) && saved.slides.length > 0) {
        setSlides(saved.slides as Slide[]);
        if (typeof saved.started === "boolean") setStarted(saved.started);
        if (saved.activeId) setActiveId(saved.activeId);
        if (saved.activeBoxId) setActiveBoxId(saved.activeBoxId);
      }
      if (typeof saved.caption === "string") setCaption(saved.caption);
    },
  });

  const { isFree } = useFreePlanGate(profile);
  const slideCap = profile ? profile.maxSlideshowSlides : 0;
  const hasAccess = slideCap > 0 && !isFree;

  const activeSlide = slides.find((s) => s.id === activeId) || slides[0] || null;
  const activeIndex = activeSlide ? slides.findIndex((s) => s.id === activeSlide.id) : -1;

  const activeSlideBoxes = activeSlide ? getSlideTextBoxes(activeSlide) : [];
  const activeBox = activeSlideBoxes.find((b) => b.id === activeBoxId) || activeSlideBoxes[0] || null;

  useEffect(() => {
    if (activeSlide) {
      const boxes = getSlideTextBoxes(activeSlide);
      if (!activeBoxId || !boxes.some((b) => b.id === activeBoxId)) {
        setActiveBoxId(boxes[0]?.id || null);
      }
    } else {
      setActiveBoxId(null);
    }
  }, [activeSlide?.id, activeSlide?.textBoxes]);

  const updateActive = (patch: Partial<Slide>) => {
    setSlides((prev) => {
      const isBgUpdate = "bgImage" in patch;
      const isFontUpdate = "font" in patch || "fontWeight" in patch;
      return prev.map((s) => {
        if (s.id === activeSlide?.id) {
          const updatedSlide = { ...s, ...patch };
          if (isBgUpdate) {
            updatedSlide.hasCustomBg = true;
          }
          if (isFontUpdate) {
            updatedSlide.hasCustomFont = true;
          }
          return updatedSlide;
        }

        let nextSlide = { ...s };
        let modified = false;

        if (isBgUpdate && activeIndex === 0 && !s.hasCustomBg) {
          nextSlide.bgImage = patch.bgImage;
          modified = true;
        }

        if (isFontUpdate && activeIndex === 0 && !s.hasCustomFont) {
          if ("font" in patch && patch.font !== undefined) nextSlide.font = patch.font;
          if ("fontWeight" in patch && patch.fontWeight !== undefined) nextSlide.fontWeight = patch.fontWeight;
          modified = true;
        }

        return modified ? nextSlide : s;
      });
    });
  };

  const updateActiveBox = (boxId: string, boxPatch: Partial<TextBox>) => {
    if (!activeSlide) return;

    setSlides((prev) => {
      const activeIdx = prev.findIndex((s) => s.id === activeSlide.id);
      const isFirstSlide = activeIdx === 0;

      // Find the position (index) of the edited box in the active slide's boxes,
      // so we can match it by position across other slides.
      const activeSlideCurrBoxes = getSlideTextBoxes(prev[activeIdx]);
      const editedBoxIdx = activeSlideCurrBoxes.findIndex((b) => b.id === boxId);

      // Identify modified formatting/layout/position keys
      const modifiedKeys = Object.keys(boxPatch).filter(
        (key) => key !== "id" && key !== "text" && key !== "overriddenProps"
      ) as Array<keyof TextBox>;

      return prev.map((s, idx) => {
        const sBoxes = getSlideTextBoxes(s);

        if (idx === activeIdx) {
          // Update the edited box in the active slide
          const newBoxes = sBoxes.map((b) => {
            if (b.id === boxId) {
              const updatedBox = { ...b, ...boxPatch };
              if (!isFirstSlide && modifiedKeys.length > 0) {
                // Record overrides so updates on slide 0 won't affect these properties on this slide
                const existingOverrides = b.overriddenProps || [];
                const nextOverrides = Array.from(new Set([...existingOverrides, ...modifiedKeys]));
                updatedBox.overriddenProps = nextOverrides;
              }
              return updatedBox;
            }
            return b;
          });
          const first = newBoxes[0];
          return {
            ...s,
            textBoxes: newBoxes,
            // Always keep top-level props synced from the first box for backwards compatibility
            text: first.text,
            font: first.font,
            fontSize: first.fontSize,
            fontWeight: first.fontWeight,
            textColor: first.textColor,
            align: first.align,
            highlight: first.highlight,
            highlightColor: first.highlightColor,
            textX: first.textX,
            textY: first.textY,
            casing: first.casing,
            ...(modifiedKeys.includes("font") || modifiedKeys.includes("fontWeight")
              ? { hasCustomFont: !isFirstSlide }
              : {}),
          };
        }

        // Propagate modified formatting/style/position properties from slide 0 to other slides
        if (isFirstSlide && editedBoxIdx >= 0) {
          const newBoxes = sBoxes.map((b, i) => {
            if (i === editedBoxIdx) {
              const boxOverrides = b.overriddenProps || [];
              const patchToApply: Partial<TextBox> = {};
              
              modifiedKeys.forEach((key) => {
                if (!boxOverrides.includes(key)) {
                  (patchToApply as any)[key] = boxPatch[key];
                }
              });

              if (Object.keys(patchToApply).length > 0) {
                return { ...b, ...patchToApply };
              }
            }
            return b;
          });
          const first = newBoxes[0];
          return {
            ...s,
            textBoxes: newBoxes,
            font: first.font,
            fontWeight: first.fontWeight,
            fontSize: first.fontSize,
            textColor: first.textColor,
            align: first.align,
            highlight: first.highlight,
            highlightColor: first.highlightColor,
            textX: first.textX,
            textY: first.textY,
            casing: first.casing,
          };
        }

        return s;
      });
    });
  };

  const addTextBox = () => {
    if (!activeSlide) return;
    const activeIdx = slides.findIndex((s) => s.id === activeSlide.id);

    const currentBoxes = getSlideTextBoxes(activeSlide);
    const newBoxIdx = currentBoxes.length;

    const firstSlide = slides[0];
    const firstSlideBoxes = firstSlide ? getSlideTextBoxes(firstSlide) : [];
    const templateBox = firstSlideBoxes[newBoxIdx] || firstSlideBoxes[0] || null;

    const newBox: TextBox = {
      id: uid(),
      text: "New text block",
      font: templateBox?.font || activeSlide.font || DEFAULT_FONT.value,
      fontSize: templateBox?.fontSize || 60,
      fontWeight: templateBox?.fontWeight || activeSlide.fontWeight || DEFAULT_FONT.weight,
      textColor: templateBox?.textColor || "#ffffff",
      align: templateBox?.align || "center",
      highlight: templateBox?.highlight || false,
      highlightColor: templateBox?.highlightColor || "#000000",
      textX: templateBox?.textX || 0.5,
      textY: templateBox?.textY || Math.min(0.85, 0.4 + newBoxIdx * 0.1),
      casing: templateBox?.casing || activeSlide.casing || "sentence",
    };

    setSlides((prev) =>
      prev.map((s, idx) => {
        if (idx === activeIdx) {
          const sBoxes = getSlideTextBoxes(s);
          return {
            ...s,
            textBoxes: [...sBoxes, newBox],
          };
        }
        return s;
      })
    );

    setActiveBoxId(newBox.id);
  };

  const deleteTextBox = (boxId: string) => {
    if (!activeSlide) return;
    const activeIdx = slides.findIndex((s) => s.id === activeSlide.id);

    const currentBoxes = getSlideTextBoxes(activeSlide);
    if (currentBoxes.length <= 1) {
      toast({ title: "Cannot delete", description: "A slide must have at least one text block.", variant: "destructive" });
      return;
    }

    const deletedBoxIdx = currentBoxes.findIndex((b) => b.id === boxId);
    if (deletedBoxIdx < 0) return;

    setSlides((prev) =>
      prev.map((s, idx) => {
        if (idx === activeIdx) {
          const sBoxes = getSlideTextBoxes(s);
          const updatedBoxes = sBoxes.filter((b) => b.id !== boxId);
          const first = updatedBoxes[0];
          return {
            ...s,
            textBoxes: updatedBoxes,
            text: first.text,
            font: first.font,
            fontSize: first.fontSize,
            fontWeight: first.fontWeight,
            textColor: first.textColor,
            align: first.align,
            highlight: first.highlight,
            highlightColor: first.highlightColor,
            textX: first.textX,
            textY: first.textY,
          };
        }
        return s;
      })
    );

    const remainingBoxes = currentBoxes.filter((b) => b.id !== boxId);
    setActiveBoxId(remainingBoxes[deletedBoxIdx === 0 ? 0 : deletedBoxIdx - 1]?.id || remainingBoxes[0].id);
  };

  // Fit the native format into a display box without distortion.
  const fitWidth = (maxW: number, maxH: number) => {
    const s = Math.min(maxW / format.w, maxH / format.h);
    return Math.round(format.w * s);
  };
  const stageDisplayW = fitWidth(440, 520);
  const thumbDisplayW = fitWidth(58, 86);

  const handleGenerate = () => {
    const byBlocks = scriptText
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);
    const chunks = byBlocks.length
      ? byBlocks
      : scriptText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

    if (!chunks.length) {
      toast({ title: "Add some text first", description: "Type or paste your script to generate slides.", variant: "destructive" });
      return;
    }
    const capped = chunks.slice(0, slideCap);
    const newSlides = capped.map((t) => makeSlide(t));
    setSlides(newSlides);
    setActiveId(newSlides[0].id);
    setStarted(true);
    if (chunks.length > slideCap) {
      toast({ title: `Capped at ${slideCap} slides`, description: `Your plan allows ${slideCap} slides per slideshow; the first ${slideCap} blocks were used.` });
    }
  };

  const addSlide = () => {
    if (slides.length >= slideCap) {
      toast({ title: "Slide limit reached", description: `Your plan allows up to ${slideCap} slides per slideshow.`, variant: "destructive" });
      return;
    }
    const s = makeSlide("");
    if (slides.length > 0) {
      const firstSlide = slides[0];
      if (firstSlide.bgImage) {
        s.bgImage = firstSlide.bgImage;
      }
      s.font = firstSlide.font;
      s.fontWeight = firstSlide.fontWeight;
      s.fontSize = firstSlide.fontSize;
      s.textColor = firstSlide.textColor;
      s.align = firstSlide.align;
      s.highlight = firstSlide.highlight;
      s.highlightColor = firstSlide.highlightColor;
      s.textX = firstSlide.textX;
      s.textY = firstSlide.textY;
      s.casing = firstSlide.casing;

      // Copy text boxes from the first slide to maintain structural consistency
      const firstSlideBoxes = getSlideTextBoxes(firstSlide);
      s.textBoxes = firstSlideBoxes.map((box) => ({
        ...box,
        id: uid(), // Must get a fresh ID
        text: "",  // Blank text for a new slide text box
        overriddenProps: [], // Fresh sheet, no overrides yet
      }));
    }
    setSlides((prev) => [...prev, s]);
    setActiveId(s.id);
  };

  const deleteSlide = (id: string) => {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const next = prev.filter((s) => s.id !== id);
      if (next.length === 0) {
        setActiveId(null);
        setStarted(false);
      } else if (activeId === id) {
        setActiveId(next[Math.max(0, idx - 1)].id);
      }
      return next;
    });
  };

  const moveSlide = (id: string, dir: -1 | 1) => {
    setSlides((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const handleBgUpload = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Unsupported file", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    const r = new FileReader();
    r.onload = () => updateActive({ bgImage: r.result as string });
    r.readAsDataURL(file);
  };

  // Render one slide to a PNG blob via html-to-image.
  const exportSlide = async (slide: Slide): Promise<{ blob: Blob } | null> => {
    const node = exportRefs.current.get(slide.id);
    if (!node) return null;
    const blob = await renderImageSlideBlob(node, format.w, format.h);
    return blob ? { blob } : null;
  };

  const handleDownloadAll = async () => {
    if (!slides.length) return;
    setBusy(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        const out = await exportSlide(slides[i]);
        if (!out) continue;
        const url = URL.createObjectURL(out.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `slideshow-slide-${i + 1}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 200));
      }
      toast({ title: "Slides downloaded", description: `${slides.length} file${slides.length > 1 ? "s" : ""} saved at ${format.w}×${format.h}.` });
    } catch (e: any) {
      toast({ title: "Download failed", description: e?.message || "Could not export the slides.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleSendToPost = async () => {
    if (!slides.length) return;
    setBusy(true);
    try {
      const files: File[] = [];
      const previews: string[] = [];
      for (let i = 0; i < slides.length; i++) {
        const out = await exportSlide(slides[i]);
        if (!out) continue;
        files.push(new File([out.blob], `slideshow-slide-${i + 1}.png`, { type: "image/png" }));
        previews.push(URL.createObjectURL(out.blob));
      }
      if (!files.length) {
        toast({ title: "Nothing to send", description: "Could not render the slides.", variant: "destructive" });
        return;
      }
      // Platform-agnostic: the user picks Instagram / LinkedIn / X / Facebook etc. in Create Post.
      // A multi-slide post is an image carousel.
      navigate("/create-post", {
        state: {
          type: "image",
          media: files,
          mediaPreviews: previews,
          content: caption,
        },
      });
    } catch (e: any) {
      toast({ title: "Could not send", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  // ── Gates ──────────────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-none" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-none" />
            <Skeleton className="h-3.5 w-32 rounded-none" />
          </div>
        </div>
        
        {/* Description Skeleton */}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full rounded-none" />
          <Skeleton className="h-4 w-[92%] rounded-none" />
          <Skeleton className="h-4 w-[65%] rounded-none" />
        </div>

        {/* Script Editor Card Skeleton */}
        <div className="border border-border bg-card p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)] rounded-none">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded-none" />
            <Skeleton className="h-32 w-full rounded-none" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3.5 w-16 rounded-none" />
            <Skeleton className="h-10 w-full rounded-none" />
          </div>

          <Skeleton className="h-11 w-full rounded-none" />
        </div>
      </div>
    );
  }

  if (currentUserRole === "viewer") {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg mt-10 animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-yellow-500/10 border-2 border-yellow-500 flex items-center justify-center mx-auto mb-6 rounded-none">
          <ShieldAlert className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-black tracking-wider text-foreground mb-4">Access Restricted</h2>
        <p className="text-sm text-muted-foreground font-semibold mb-8">Viewers cannot create slideshows in this workspace.</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg mt-6 animate-in fade-in duration-500">
        <div className="border border-primary/20 bg-primary/[0.03] rounded-none p-10 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)]">
          <div className="w-14 h-14 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 rounded-none">
            <Crown className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground mb-2">Slideshow Studio is on Creator & Pro</h2>
          <p className="text-sm text-muted-foreground font-medium mb-8">
            Upgrade to <span className="font-bold">Creator</span> (up to 5 slides) or <span className="font-bold">Pro</span> (up to 10
            slides) to build slideshows for Instagram, LinkedIn, X, and Facebook.
          </p>
          <Button
            onClick={() => navigate("/settings?tab=plans")}
            className="h-11 px-8 rounded-none bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold uppercase tracking-widest shadow-none"
          >
            Upgrade Plan
          </Button>
        </div>
      </div>
    );
  }

  const formatSelect = (compact = false) => (
    <Select value={format.id} onValueChange={(id) => setFormat(FORMATS.find((f) => f.id === id) || FORMATS[0])}>
      <SelectTrigger className={cn("h-9 rounded-none border-border shadow-none text-xs font-bold bg-background", compact ? "w-[150px]" : "w-full")}>
        <Layout className="w-3.5 h-3.5 mr-1 text-muted-foreground shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-none">
        {FORMATS.map((f) => (
          <SelectItem key={f.id} value={f.id} className="text-xs font-bold">
            {f.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  // ── Start panel ──────────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-none">
            <Images className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground leading-none">Slideshow Studio</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1.5">
              Instagram · LinkedIn · X · Facebook
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-medium mb-8 mt-4">
          Paste your script — each line or paragraph becomes a slide you can style. Add image backgrounds and export,
          or send straight to Create Post.
        </p>

        <div className="border border-border bg-card rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)]">
          <div className="p-6 space-y-5">
            <div>
              <Label className={fieldLabel}>Format</Label>
              <div className="mt-2 max-w-[220px]">{formatSelect()}</div>
            </div>
            <div>
              <Label htmlFor="script" className={fieldLabel}>
                Your script
              </Label>
              <Textarea
                id="script"
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder={"Hook that stops the scroll\n\nPoint number one\n\nPoint number two\n\nCall to action"}
                className="mt-2 min-h-[200px] rounded-none border-border bg-background shadow-none font-medium text-sm"
              />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
                Blank lines split paragraphs · up to {slideCap} slides on your plan
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 px-6 py-4 border-t border-border bg-muted/20">
            <Button
              onClick={handleGenerate}
              className="h-11 px-8 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-bold uppercase tracking-widest shadow-none"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate slides
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const s = makeSlide("");
                setSlides([s]);
                setActiveId(s.id);
                setStarted(true);
              }}
              className="h-11 px-8 rounded-none border-border text-[10px] font-bold uppercase tracking-widest shadow-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start blank
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Editor (Canva-style: top bar · stage + properties · bottom filmstrip) ────────
  return (
    <div className="flex flex-col h-screen min-h-[560px] bg-background animate-in fade-in duration-300">
      {/* Top action bar */}
      <div className="shrink-0 h-14 border-b border-border bg-background flex items-center justify-between gap-3 px-3 sm:px-5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            onClick={() => setStarted(false)}
            className="h-9 px-3 rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-muted shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Script</span>
          </Button>
          <div className="hidden md:flex items-center gap-2 font-black tracking-tight text-foreground">
            <Images className="w-5 h-5 text-primary" />
            <span className="text-base">Slideshow Studio</span>
          </div>
          <div className="ml-1">{formatSelect(true)}</div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={handleDownloadAll}
            disabled={busy || !slides.length}
            className="h-9 px-3 sm:px-5 rounded-none border-border text-[10px] font-bold uppercase tracking-widest shadow-none"
          >
            {busy ? <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" /> : <Download className="w-4 h-4 sm:mr-2" />}
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button
            onClick={handleSendToPost}
            disabled={busy || !slides.length}
            className="h-9 px-3 sm:px-5 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-bold uppercase tracking-widest shadow-none"
          >
            {busy ? <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" /> : <Send className="w-4 h-4 sm:mr-2" />}
            <span className="hidden sm:inline">Send to Create Post</span>
          </Button>
        </div>
      </div>

      {/* Body: stage + properties */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Stage */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-4 bg-muted/40 p-6 overflow-auto">
          {activeSlide ? (
            <>
              <SlideCanvas
                slide={activeSlide}
                width={format.w}
                height={format.h}
                displayWidth={stageDisplayW}
                interactive
                activeBoxId={activeBoxId}
                onSelectBox={setActiveBoxId}
                onTextMove={(boxId, x, y) => updateActiveBox(boxId, { textX: x, textY: y })}
                className="border border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,0.14)] bg-background"
              />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Drag the text to reposition it</p>
              <div className="flex items-center gap-1.5 bg-background border border-border rounded-none px-1.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSlide(activeSlide.id, -1)}
                  disabled={activeIndex === 0}
                  className="h-8 w-8 p-0 rounded-none hover:bg-muted"
                  title="Move earlier"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 tabular-nums">
                  {activeIndex + 1} / {slides.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSlide(activeSlide.id, 1)}
                  disabled={activeIndex === slides.length - 1}
                  className="h-8 w-8 p-0 rounded-none hover:bg-muted"
                  title="Move later"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-0.5" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSlide(activeSlide.id)}
                  className="h-8 w-8 p-0 rounded-none text-destructive hover:bg-destructive/10"
                  title="Delete slide"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No slides yet.</p>
          )}
        </div>

        {/* Properties */}
        {activeSlide && (
          <aside className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-card overflow-y-auto">
            <div className="p-5 space-y-6">
              {/* Text Blocks List Selector */}
              <section className="space-y-3">
                <p className={cn(sectionLabel, "flex items-center justify-between")}>
                  <span className="flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" /> Text Blocks ({activeSlideBoxes.length})
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeSlideBoxes.map((box, idx) => (
                    <button
                      key={box.id}
                      onClick={() => setActiveBoxId(box.id)}
                      className={cn(
                        "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border transition-all",
                        activeBoxId === box.id
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Block {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={addTextBox}
                    className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border border-dashed border-border text-primary hover:bg-muted flex items-center gap-1"
                    title="Add new text block"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {activeBox && activeSlideBoxes.length > 1 && (
                  <button
                    onClick={() => deleteTextBox(activeBox.id)}
                    className="text-[10px] font-bold uppercase tracking-widest text-destructive hover:underline flex items-center gap-1 mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove active block
                  </button>
                )}
              </section>

              {/* Active Text Block Settings */}
              {activeBox && (
                <>
                  <section className="space-y-3 border-t border-border/60 pt-5">
                    <p className={cn(sectionLabel, "flex items-center gap-1.5")}>
                      <Type className="w-3.5 h-3.5" /> Active Block Content
                    </p>
                    <Textarea
                      value={activeBox.text}
                      onChange={(e) => updateActiveBox(activeBox.id, { text: e.target.value })}
                      placeholder="Slide text…"
                      className="min-h-[90px] rounded-none border-border bg-background shadow-none text-sm font-medium"
                    />
                    <div className="flex items-center gap-3">
                      <div className="flex-[3] min-w-0">
                        <Label className={fieldLabel}>Font</Label>
                        <Select
                          value={activeBox.font}
                          onValueChange={(v) => {
                            const f = FONTS.find((x) => x.value === v) || FONTS[0];
                            updateActiveBox(activeBox.id, { font: f.value, fontWeight: f.weight });
                          }}
                        >
                          <SelectTrigger className="mt-1.5 h-10 rounded-none border-border shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-none max-h-72">
                            {FONTS.map((f) => (
                              <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value, fontWeight: f.weight }}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-[2] shrink-0">
                        <Label className={fieldLabel}>Text Case</Label>
                        <div className="mt-1.5 flex border border-border rounded-none overflow-hidden">
                          {(["sentence", "uppercase", "lowercase"] as const).map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => updateActiveBox(activeBox.id, { casing: c })}
                              className={cn(
                                "flex-1 h-10 text-[11px] transition-colors font-semibold",
                                (activeBox.casing === c || (c === "sentence" && !activeBox.casing))
                                  ? "bg-primary text-primary-foreground font-black"
                                  : "bg-background hover:bg-muted text-muted-foreground",
                              )}
                              title={c === "sentence" ? "Sentence case" : c === "uppercase" ? "Uppercase" : "Lowercase"}
                            >
                              {c === "sentence" ? "Aa" : c === "uppercase" ? "AA" : "aa"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className={fieldLabel}>Text size — {activeBox.fontSize}</Label>
                      <Slider
                        value={[activeBox.fontSize]}
                        min={36}
                        max={160}
                        step={2}
                        onValueChange={([v]) => updateActiveBox(activeBox.id, { fontSize: v })}
                        className="mt-3"
                      />
                    </div>
                  </section>

                  {/* Style */}
                  <section className="space-y-3 border-t border-border/60 pt-5">
                    <p className={cn(sectionLabel, "flex items-center gap-1.5")}>
                      <Palette className="w-3.5 h-3.5" /> Style
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label className={fieldLabel}>Text color</Label>
                        <input
                          type="color"
                          value={activeBox.textColor}
                          onChange={(e) => updateActiveBox(activeBox.id, { textColor: e.target.value })}
                          className="mt-1.5 w-full h-9 rounded-none border border-border bg-background cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className={fieldLabel}>Alignment</Label>
                        <div className="mt-1.5 flex border border-border rounded-none overflow-hidden">
                          {(["left", "center", "right"] as const).map((a) => (
                            <button
                              key={a}
                              onClick={() => updateActiveBox(activeBox.id, { align: a })}
                              className={cn(
                                "flex-1 h-9 text-[9px] font-black uppercase tracking-widest transition-colors",
                                activeBox.align === a ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted",
                              )}
                            >
                              {a[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Label className={fieldLabel}>Highlight box</Label>
                      <button
                        onClick={() => updateActiveBox(activeBox.id, { highlight: !activeBox.highlight })}
                        className={cn(
                          "w-10 h-5 rounded-none p-0.5 transition-colors",
                          activeBox.highlight ? "bg-primary" : "bg-muted-foreground/20",
                        )}
                      >
                        <div className={cn("w-4 h-4 bg-white rounded-none transition-transform", activeBox.highlight ? "translate-x-5" : "translate-x-0")} />
                      </button>
                    </div>
                    {activeBox.highlight && (
                      <div>
                        <Label className={fieldLabel}>Highlight color</Label>
                        <input
                          type="color"
                          value={activeBox.highlightColor}
                          onChange={(e) => updateActiveBox(activeBox.id, { highlightColor: e.target.value })}
                          className="mt-1.5 w-full h-9 rounded-none border border-border bg-background cursor-pointer"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => updateActiveBox(activeBox.id, { textX: 0.5, textY: 0.5 })}
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Center text position
                    </button>
                  </section>
                </>
              )}

              {/* Background */}
              <section className="space-y-3 border-t border-border/60 pt-5">
                <p className={cn(sectionLabel, "flex items-center gap-1.5")}>
                  <ImagePlus className="w-3.5 h-3.5" /> Background
                </p>
                <label className="flex items-center justify-center gap-2 h-10 border border-dashed border-border hover:border-foreground/40 rounded-none cursor-pointer text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                  <ImagePlus className="w-4 h-4" />
                  {activeSlide.bgImage ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleBgUpload(e.target.files?.[0])}
                  />
                </label>
                {activeSlide.bgImage && (
                  <button
                    onClick={() => updateActive({ bgImage: undefined })}
                    className="text-[10px] font-bold uppercase tracking-widest text-destructive hover:underline"
                  >
                    Remove background
                  </button>
                )}
                <div>
                  <Label className={fieldLabel}>Dark overlay — {activeSlide.overlay}%</Label>
                  <Slider
                    value={[activeSlide.overlay]}
                    min={0}
                    max={90}
                    step={5}
                    onValueChange={([v]) => updateActive({ overlay: v })}
                    className="mt-3"
                  />
                </div>
              </section>

              {/* Caption (whole slideshow) */}
              <section className="space-y-2 border-t border-border/60 pt-5">
                <p className={cn(sectionLabel, "flex items-center gap-1.5")}>
                  <Send className="w-3.5 h-3.5" /> Post caption
                </p>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Caption used when sending to Create Post…"
                  className="min-h-[70px] rounded-none border-border bg-background shadow-none text-sm font-medium"
                />
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Applies to the whole slideshow</p>
              </section>
            </div>
          </aside>
        )}
      </div>

      {/* Bottom filmstrip */}
      <div className="shrink-0 border-t border-border bg-background">
        <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0">
            Slides {slides.length}/{slideCap}
          </span>
          {slides.map((s, i) => {
            const isActive = s.id === activeSlide?.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={cn(
                  "relative shrink-0 border-2 rounded-none overflow-hidden transition-all",
                  isActive ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-foreground/40",
                )}
                title={`Slide ${i + 1}`}
              >
                <SlideCanvas slide={s} width={format.w} height={format.h} displayWidth={thumbDisplayW} />
                <span className="absolute top-0 left-0 bg-foreground text-background text-[9px] font-black px-1.5 py-0.5">
                  {i + 1}
                </span>
              </button>
            );
          })}
          {slides.length < slideCap && (
            <button
              onClick={addSlide}
              className="shrink-0 border-2 border-dashed border-border hover:border-foreground/40 rounded-none flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              style={{ width: thumbDisplayW, height: thumbDisplayW * (format.h / format.w) }}
              title="Add slide"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Offscreen full-resolution slides used only for PNG export */}
      <div aria-hidden style={{ position: "fixed", left: -99999, top: 0, opacity: 0, pointerEvents: "none" }}>
        {slides.map((s) => (
          <SlideCanvas
            key={s.id}
            slide={s}
            width={format.w}
            height={format.h}
            displayWidth={format.w}
            ref={(el) => {
              if (el) exportRefs.current.set(s.id, el);
              else exportRefs.current.delete(s.id);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SlideshowStudio;
