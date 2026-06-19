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
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/context/TeamContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useAutosaveDraft } from "@/hooks/useAutosaveDraft";
import { useFreePlanGate } from "@/hooks/useFreePlanGate";
import { getUserProfile, type UserProfile, getSavedSlideshows, saveSlideshow, deleteSavedSlideshow } from "@/lib/postStorage";
import { SlideCanvas, type Slide, type TextBox, getSlideTextBoxes } from "@/components/slideshow-studio/SlideCanvas";
import { FORMATS, type Format, renderImageSlideBlob } from "@/lib/slideshowExport";

export interface SavedSlideshow {
  id: string;
  title: string;
  createdAt: string;
  formatId: string;
  scriptText: string;
  caption: string;
  slides: Slide[];
  workspaceId?: string;
}

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

// Default font for new slides/text boxes. Pinned to Lato Light.
const DEFAULT_FONT = FONTS.find((f) => f.label === "Lato Light") || FONTS[0];

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

const sectionLabel = "text-xs font-bold text-muted-foreground";
const fieldLabel = "text-xs font-bold text-muted-foreground";

const SlideshowStudio = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUserRole } = useTeam();
  const isViewer = currentUserRole === "viewer";
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id || "personal";

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
  const [savedSlideshows, setSavedSlideshows] = useState<SavedSlideshow[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Full-resolution nodes rendered offscreen — html-to-image captures these for PNG export.
  const exportRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    (async () => {
      const p = await getUserProfile();
      setProfile(p);
      setProfileLoading(false);
    })();
  }, []);

  // Reload saved slideshows when active workspace shifts
  useEffect(() => {
    let active = true;
    (async () => {
      const list = await getSavedSlideshows(workspaceId);
      if (active) {
        setSavedSlideshows(list);
      }
    })();
    return () => {
      active = false;
    };
  }, [workspaceId]);

  // ── Auto-save & restore the in-progress slideshow ──────────────────────────
  // Slide background images are stored as data URLs, so the whole slideshow is JSON-serializable
  // and survives leaving/returning to the page. It self-clears once there's nothing left (no
  // slides, script, or caption); a slideshow handed off to Create Post is kept so the user can
  // return and re-send it. Large image-heavy slideshows may exceed the storage quota, in which
  // case the hook silently skips persisting (no worse than the previous always-lose behaviour).
  useAutosaveDraft({
    pageKey: "slideshow-studio",
    data: { format, scriptText, started, slides, activeId, activeBoxId, caption, savedId },
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
      if (saved.savedId) setSavedId(saved.savedId);
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
      const isOverlayImageUpdate = "overlayImage" in patch || "overlayImageWidth" in patch || "overlayImageX" in patch || "overlayImageY" in patch;
      return prev.map((s) => {
        if (s.id === activeSlide?.id) {
          const updatedSlide = { ...s, ...patch };
          if (isBgUpdate) {
            updatedSlide.hasCustomBg = true;
          }
          if (isFontUpdate) {
            updatedSlide.hasCustomFont = true;
          }
          if (isOverlayImageUpdate) {
            updatedSlide.hasCustomOverlayImage = true;
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

        if (isOverlayImageUpdate && activeIndex === 0 && !s.hasCustomOverlayImage) {
          if ("overlayImage" in patch) nextSlide.overlayImage = patch.overlayImage;
          if ("overlayImageWidth" in patch) nextSlide.overlayImageWidth = patch.overlayImageWidth;
          if ("overlayImageX" in patch) nextSlide.overlayImageX = patch.overlayImageX;
          if ("overlayImageY" in patch) nextSlide.overlayImageY = patch.overlayImageY;
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

      // Copy overlay image from slide 0 if present
      if (firstSlide.overlayImage) {
        s.overlayImage = firstSlide.overlayImage;
        s.overlayImageX = firstSlide.overlayImageX;
        s.overlayImageY = firstSlide.overlayImageY;
        s.overlayImageWidth = firstSlide.overlayImageWidth;
      }

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

  const handleOverlayImageUpload = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Unsupported file", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    const r = new FileReader();
    r.onload = () => updateActive({
      overlayImage: r.result as string,
      overlayImageX: 0.5,
      overlayImageY: 0.5,
      overlayImageWidth: 30
    });
    r.readAsDataURL(file);
  };

  const handleGridImageUpload = (slideId: string, itemIdx: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Unsupported file", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      setSlides((prev) =>
        prev.map((s) => {
          if (s.id === slideId) {
            const currentItems = s.gridItems ? [...s.gridItems] : [
              { id: "gi-1", text: "Featured Item" },
              { id: "gi-2", text: "Featured Item" },
              { id: "gi-3", text: "Featured Item" },
              { id: "gi-4", text: "Featured Item" },
            ];
            currentItems[itemIdx] = {
              ...currentItems[itemIdx],
              image: r.result as string,
            };
            return {
              ...s,
              gridItems: currentItems,
            };
          }
          return s;
        })
      );
    };
    r.readAsDataURL(file);
  };

  const handleRemoveGridImage = (slideId: string, itemIdx: number) => {
    setSlides((prev) =>
      prev.map((s) => {
        if (s.id === slideId) {
          if (!s.gridItems) return s;
          const currentItems = [...s.gridItems];
          currentItems[itemIdx] = {
            ...currentItems[itemIdx],
            image: undefined,
          };
          return {
            ...s,
            gridItems: currentItems,
          };
        }
        return s;
      })
    );
  };

  const handleGridTextMove = (slideId: string, itemIdx: number, x: number, y: number) => {
    setSlides((prev) =>
      prev.map((s) => {
        if (s.id === slideId) {
          if (!s.gridItems) return s;
          const currentItems = [...s.gridItems];
          currentItems[itemIdx] = {
            ...currentItems[itemIdx],
            textX: x,
            textY: y,
          };
          return {
            ...s,
            gridItems: currentItems,
          };
        }
        return s;
      })
    );
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

  const handleSaveSlideshow = async () => {
    if (slides.length === 0) return;

    // Generate title from the first slide's text content
    const firstText = slides[0]?.text?.trim() || "";
    const titleText = firstText
      ? firstText.split("\n")[0].substring(0, 30) + (firstText.length > 30 ? "..." : "")
      : "Untitled Slideshow";
      
    const slideshowTitle = titleText || "Untitled Slideshow";

    const idToUse = savedId || `slideshow_${Date.now()}`;
    const newSlideshow: SavedSlideshow = {
      id: idToUse,
      title: slideshowTitle,
      createdAt: new Date().toISOString(),
      formatId: format.id,
      scriptText,
      caption,
      slides,
      workspaceId
    };

    const success = await saveSlideshow(newSlideshow, workspaceId);
    
    if (success) {
      setSavedSlideshows((prev) => {
        const idx = prev.findIndex((s) => s.id === idToUse);
        let nextList = [...prev];
        if (idx >= 0) {
          nextList[idx] = newSlideshow;
        } else {
          nextList.unshift(newSlideshow);
        }
        return nextList;
      });
      setSavedId(idToUse);
      toast({ title: "Slideshow saved", description: `"${slideshowTitle}" is now saved in your drafts.` });
    } else {
      toast({ title: "Save failed", description: "Could not save slideshow to database.", variant: "destructive" });
    }
  };

  const handleLoadSlideshow = (item: SavedSlideshow) => {
    const matchedFormat = FORMATS.find((f) => f.id === item.formatId) || FORMATS[0];
    setFormat(matchedFormat);
    setScriptText(item.scriptText || "");
    setCaption(item.caption || "");
    setSlides(item.slides || []);
    if (item.slides.length > 0) {
      setActiveId(item.slides[0].id);
    }
    setSavedId(item.id);
    setStarted(true);
    toast({ title: "Slideshow loaded", description: `Loaded "${item.title}"` });
  };

  const handleDeleteSaved = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this saved slideshow?")) {
      const success = await deleteSavedSlideshow(id);
      if (success) {
        setSavedSlideshows((prev) => prev.filter((s) => s.id !== id));
        if (savedId === id) {
          setSavedId(null);
        }
        toast({ title: "Slideshow deleted" });
      } else {
        toast({ title: "Delete failed", description: "Could not delete slideshow from database.", variant: "destructive" });
      }
    }
  };

  const handleResetAll = () => {
    const s = makeSlide("");
    setSlides([s]);
    setActiveId(s.id);
    setActiveBoxId(null);
    setScriptText("");
    setCaption("");
    setSavedId(null);
    toast({ title: "Workspace reset" });
  };

  // ── Gates ──────────────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Title block skeleton — mirrors the start panel header */}
        <div className="border-b border-border pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="w-4 h-4 rounded-none" />
            <Skeleton className="h-3 w-24 rounded-none" />
          </div>
          <Skeleton className="h-9 w-64 rounded-none" />
          <Skeleton className="h-3 w-80 max-w-full rounded-none mt-2" />
        </div>

        {/* Card grid skeleton — matches the "Create Slideshow" + saved slideshow cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Create card (dashed) */}
          <div className="border-2 border-dashed border-border bg-card p-6 h-[258px] rounded-none flex flex-col items-center justify-center text-center gap-3">
            <Skeleton className="w-10 h-10 rounded-none" />
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-4 w-28 rounded-none" />
              <Skeleton className="h-3 w-40 rounded-none" />
            </div>
          </div>

          {/* Saved slideshow card placeholders */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border border-border bg-card p-4 h-[258px] rounded-none flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)]"
            >
              <div>
                <Skeleton className="h-28 w-full rounded-none mb-3" />
                <Skeleton className="h-4 w-3/4 rounded-none" />
                <Skeleton className="h-3 w-1/2 rounded-none mt-2" />
              </div>
              <div className="flex gap-2 mt-4 border-t border-border/30 pt-3">
                <Skeleton className="h-8 flex-1 rounded-none" />
                <Skeleton className="h-8 w-10 rounded-none" />
              </div>
            </div>
          ))}
        </div>
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
            className="h-11 px-8 rounded-none bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold shadow-none"
          >
            Upgrade Plan
          </Button>
        </div>
      </div>
    );
  }

  const formatSelect = (compact = false) => (
    <Select value={format.id} onValueChange={(id) => setFormat(FORMATS.find((f) => f.id === id) || FORMATS[0])} disabled={isViewer}>
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
      <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700 space-y-8 text-left">
        {/* Title block */}
        <div className="border-b border-border pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Images className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Content tools</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Slideshow Studio</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create, design, and manage slides for your social media carousels.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Create New Dashed Card */}
            {isViewer ? (
              <div
                className="border-2 border-dashed border-border bg-card/50 p-6 h-[258px] rounded-none flex flex-col items-center justify-center text-center gap-3 opacity-60"
              >
                <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-none">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 justify-center">
                    Create Slideshow
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 max-w-[200px]">
                    Create is disabled for Viewers. Select a saved slideshow below to view it.
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  const s = makeSlide("");
                  setSlides([s]);
                  setActiveId(s.id);
                  setStarted(true);
                  setSavedId(null);
                }}
                className="border-2 border-dashed border-border hover:border-foreground/30 bg-card p-6 h-[258px] rounded-none flex flex-col items-center justify-center text-center gap-3 transition-colors group cursor-pointer animate-in fade-in duration-300"
              >
                <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-none group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Create Slideshow</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 max-w-[200px]">
                    Start with a blank canvas and design slides.
                  </p>
                </div>
              </button>
            )}

            {/* Saved items list */}
            {savedSlideshows.map((item) => {
              const itemFormat = FORMATS.find((f) => f.id === item.formatId) || FORMATS[0];
              const firstSlide = item.slides[0];
              return (
                <div
                  key={item.id}
                  className="border border-border bg-card p-4 rounded-none flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)] group hover:border-foreground/30 transition-all h-[258px]"
                >
                  <div>
                    {/* Slide Thumbnail Preview */}
                    <div className="relative border border-border bg-muted/20 flex items-center justify-center overflow-hidden mb-3 h-28 rounded-none">
                      {firstSlide ? (
                        <SlideCanvas
                          slide={firstSlide}
                          width={itemFormat.w}
                          height={itemFormat.h}
                          displayWidth={96}
                          className="border border-border/40 shadow-sm"
                        />
                      ) : (
                        <Images className="w-8 h-8 text-muted-foreground/30" />
                      )}
                      <span className="absolute bottom-2 right-2 bg-background/90 text-foreground border border-border text-[9px] font-black px-1.5 py-0.5 rounded-none">
                        {itemFormat.label}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm tracking-tight text-foreground truncate" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground mt-1">
                      {item.slides.length} slides · {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4 border-t border-border/30 pt-3">
                    <Button
                      onClick={() => handleLoadSlideshow(item)}
                      className={cn("h-8 text-xs font-bold rounded-none bg-primary text-primary-foreground hover:bg-primary/90 shadow-none", isViewer ? "w-full" : "flex-1")}
                    >
                      Load
                    </Button>
                    {!isViewer && (
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteSaved(item.id)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 border border-border/50 hover:border-destructive/30 rounded-none shrink-0"
                        title="Delete saved slideshow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Editor ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen min-h-[560px] bg-background animate-in fade-in duration-300">
      {/* Body: stage + properties */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
        {/* Stage */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center bg-muted/40 p-6 overflow-auto relative min-h-0 pb-36">
          {activeSlide ? (
            <>
              {/* Floating Back to Script Editor & Save & Reset Buttons */}
              <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStarted(false)}
                  className="h-9 rounded-none border border-border bg-background text-xs font-bold hover:bg-muted shadow-none"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  All Slideshows
                </Button>
                {!isViewer && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleSaveSlideshow}
                      className="h-9 rounded-none border border-border bg-background text-xs font-bold hover:bg-muted shadow-none"
                    >
                      Save Slideshow
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setResetDialogOpen(true)}
                      className="h-9 rounded-none border border-destructive/20 hover:border-destructive text-destructive hover:bg-destructive/10 bg-background text-xs font-bold shadow-none"
                    >
                      Reset All
                    </Button>
                  </>
                )}
              </div>

              <div className="relative">
                <SlideCanvas
                  slide={activeSlide}
                  width={format.w}
                  height={format.h}
                  displayWidth={stageDisplayW}
                  interactive={!isViewer}
                  activeBoxId={activeBoxId}
                  onSelectBox={setActiveBoxId}
                  onTextMove={(boxId, x, y) => updateActiveBox(boxId, { textX: x, textY: y })}
                  onOverlayImageMove={(x, y) => updateActive({ overlayImageX: x, overlayImageY: y })}
                  onOverlayImageRemove={() => updateActive({ overlayImage: undefined })}
                  onGridImageUpload={(itemIdx, file) => handleGridImageUpload(activeSlide.id, itemIdx, file)}
                  onGridTextMove={(itemIdx, x, y) => handleGridTextMove(activeSlide.id, itemIdx, x, y)}
                  onBgImageUpload={handleBgUpload}
                  className="border border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,0.14)] bg-background"
                />
              </div>

              {!isViewer && <p className="text-xs font-medium text-muted-foreground mt-4">Drag elements to reposition them</p>}

              {/* Slide Navigation pill */}
              <div className="flex items-center gap-1.5 bg-background border border-border rounded-none px-1.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSlide(activeSlide.id, -1)}
                  disabled={activeIndex === 0 || isViewer}
                  className="h-8 w-8 p-0 rounded-none hover:bg-muted"
                  title="Move earlier"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-[10px] font-black text-muted-foreground px-2 tabular-nums">
                  {activeIndex + 1} / {slides.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSlide(activeSlide.id, 1)}
                  disabled={activeIndex === slides.length - 1 || isViewer}
                  className="h-8 w-8 p-0 rounded-none hover:bg-muted"
                  title="Move later"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
                {!isViewer && (
                  <>
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
                  </>
                )}
              </div>

              {/* Floating Slide Dock */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-fit max-w-[85%] bg-background border border-border px-4 py-3 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] z-10 flex items-center gap-3 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-3">
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
                        <span className="absolute top-0 left-0 bg-foreground text-background text-[9px] font-black px-1.5 py-0.5 rounded-none">
                          {i + 1}
                        </span>
                      </button>
                    );
                  })}
                  {slides.length < slideCap && !isViewer && (
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
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No slides yet.</p>
          )}
        </div>

        {/* Properties */}
        {activeSlide && (
          <aside className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col h-full min-h-0">
            {/* Top Fixed Area: Format and Slide Type Selection */}
            <div className="p-5 border-b border-border grid grid-cols-2 gap-3 shrink-0 bg-card">
              <div className="space-y-1.5">
                <Label className={fieldLabel}>Format</Label>
                {formatSelect(false)}
              </div>
              <div className="space-y-1.5">
                <Label className={fieldLabel}>Slide Type</Label>
                <Select
                  value={activeSlide.layoutType || "default"}
                  disabled={isViewer}
                  onValueChange={(val) => {
                    const isGrid1 = val === "grid1x1";
                    const isGrid1x2 = val === "grid1x2";
                    const isGrid2x1 = val === "grid2x1";
                    const isGrid2 = val === "grid2x2";
                    setSlides((prev) =>
                      prev.map((s) => {
                        if (s.id === activeSlide.id) {
                          const updated: Partial<Slide> = {
                            layoutType: val as "default" | "grid1x1" | "grid1x2" | "grid2x1" | "grid2x2" | "splitImageText",
                          };
                          let updatedItems = s.gridItems || [];
                          if (isGrid1 && updatedItems.length < 1) {
                            updatedItems = [{ id: "gi-1", text: "Featured Item", image: undefined }];
                          } else if (isGrid1x2 && updatedItems.length < 2) {
                            const defaults = [
                              { id: "gi-1", text: "Featured Item", image: undefined },
                              { id: "gi-2", text: "Featured Item", image: undefined },
                            ];
                            updatedItems = Array.from({ length: 2 }).map((_, i) => updatedItems[i] || defaults[i]);
                          } else if (isGrid2x1 && updatedItems.length < 2) {
                            const defaults = [
                              { id: "gi-1", text: "Featured Item", image: undefined },
                              { id: "gi-2", text: "Featured Item", image: undefined },
                            ];
                            updatedItems = Array.from({ length: 2 }).map((_, i) => updatedItems[i] || defaults[i]);
                          } else if (isGrid2 && updatedItems.length < 4) {
                            const defaults = [
                              { id: "gi-1", text: "Featured Item", image: undefined },
                              { id: "gi-2", text: "Featured Item", image: undefined },
                              { id: "gi-3", text: "Featured Item", image: undefined },
                              { id: "gi-4", text: "Featured Item", image: undefined },
                            ];
                            updatedItems = Array.from({ length: 4 }).map((_, i) => updatedItems[i] || defaults[i]);
                          }
                          updated.gridItems = updatedItems;

                          // Automatically adjust default textY for better layout spacing
                          if (val === "splitImageText") {
                            // If moving to split layout and vertical offset is at center/top, lower it to 0.75
                            if (s.textY === 0.5 || s.textY === 0.10) {
                              updated.textY = 0.75;
                            }
                            if (s.textBoxes && s.textBoxes.length > 0) {
                              updated.textBoxes = s.textBoxes.map((b, idx) =>
                                idx === 0 && (b.textY === 0.5 || b.textY === 0.10) ? { ...b, textY: 0.75 } : b
                              );
                            }
                          } else if (val !== "default") {
                            // If moving to a grid layout and vertical offset is at standard center or split bottom, lift it to 0.10
                            if (s.textY === 0.5 || s.textY === 0.75) {
                              updated.textY = 0.10;
                            }
                            if (s.textBoxes && s.textBoxes.length > 0) {
                              updated.textBoxes = s.textBoxes.map((b, idx) =>
                                idx === 0 && (b.textY === 0.5 || b.textY === 0.75) ? { ...b, textY: 0.10 } : b
                              );
                            }
                          } else {
                            // If moving back to standard layout and vertical offset is at 0.10 or 0.75, restore it to 0.5
                            if (s.textY === 0.10 || s.textY === 0.75) {
                              updated.textY = 0.5;
                            }
                            if (s.textBoxes && s.textBoxes.length > 0) {
                              updated.textBoxes = s.textBoxes.map((b, idx) =>
                                idx === 0 && (b.textY === 0.10 || b.textY === 0.75) ? { ...b, textY: 0.5 } : b
                              );
                            }
                          }

                          return { ...s, ...updated };
                        }
                        return s;
                      })
                    );
                  }}
                >
                  <SelectTrigger className="h-9 rounded-none border-border shadow-none text-xs font-bold bg-background w-full">
                    <Layout className="w-3.5 h-3.5 mr-1 text-muted-foreground shrink-0" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="default" className="text-xs font-bold">Normal Slideshow</SelectItem>
                    <SelectItem value="splitImageText" className="text-xs font-bold">Split Image/Text</SelectItem>
                    <SelectItem value="grid1x1" className="text-xs font-bold">1x1 Featured</SelectItem>
                    <SelectItem value="grid1x2" className="text-xs font-bold">1x2 Split</SelectItem>
                    <SelectItem value="grid2x1" className="text-xs font-bold">2x1 Split</SelectItem>
                    <SelectItem value="grid2x2" className="text-xs font-bold">2x2 Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Middle Scrollable Accordion Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <Accordion
              type="multiple"
              defaultValue={["text-blocks", "active-block", "grid-items", "background", "overlay-image", "caption"]}
              className="w-full"
            >
              {/* Text Blocks Section */}
              <AccordionItem value="text-blocks" className="border-b border-border/40 px-5">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Type className="w-3.5 h-3.5" /> Text Blocks ({activeSlideBoxes.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {activeSlideBoxes.map((box, idx) => (
                      <button
                        key={box.id}
                        onClick={() => setActiveBoxId(box.id)}
                        className={cn(
                          "px-2.5 py-1 text-xs font-bold border rounded-none transition-all",
                          activeBoxId === box.id
                            ? "bg-primary border-primary text-primary-foreground font-black"
                            : "bg-background border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Block {idx + 1}
                      </button>
                    ))}
                    {!isViewer && (
                      <button
                        onClick={addTextBox}
                        className="px-2.5 py-1 text-xs font-bold border border-dashed border-border text-primary hover:bg-muted flex items-center gap-1 rounded-none shadow-none"
                        title="Add new text block"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    )}
                  </div>
                  {activeBox && activeSlideBoxes.length > 1 && !isViewer && (
                    <button
                      onClick={() => deleteTextBox(activeBox.id)}
                      className="text-xs font-bold text-destructive hover:underline flex items-center gap-1 mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove active block
                    </button>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Active Text Block Settings Section */}
              {activeBox && (
                <AccordionItem value="active-block" className="border-b border-border/40 px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Palette className="w-3.5 h-3.5" /> Active Block Settings
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    {/* Content */}
                    <div className="space-y-3">
                      <Label className={fieldLabel}>Active Block Content</Label>
                      <Textarea
                        value={activeBox.text}
                        onChange={(e) => updateActiveBox(activeBox.id, { text: e.target.value })}
                        disabled={isViewer}
                        placeholder="Slide text…"
                        className="min-h-[90px] rounded-none border-border bg-background shadow-none text-sm font-medium"
                      />
                    </div>
                    {/* Font & Case */}
                    <div className="flex items-center gap-3">
                      <div className="flex-[3] min-w-0">
                        <Label className={fieldLabel}>Font</Label>
                        <Select
                          value={FONTS.find((x) => x.value === activeBox.font && x.weight === activeBox.fontWeight)?.label || FONTS.find((x) => x.value === activeBox.font)?.label || FONTS[0].label}
                          disabled={isViewer}
                          onValueChange={(label) => {
                            const f = FONTS.find((x) => x.label === label) || FONTS[0];
                            updateActiveBox(activeBox.id, { font: f.value, fontWeight: f.weight });
                          }}
                        >
                          <SelectTrigger className="mt-1.5 h-10 rounded-none border-border shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-none max-h-72">
                            {FONTS.map((f) => (
                              <SelectItem key={f.label} value={f.label} className="rounded-none font-bold" style={{ fontFamily: f.value, fontWeight: f.weight }}>
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
                              disabled={isViewer}
                              className={cn(
                                "flex-1 h-10 text-[11px] transition-colors font-semibold rounded-none",
                                (activeBox.casing === c || (c === "sentence" && !activeBox.casing))
                                  ? "bg-primary text-primary-foreground font-black"
                                  : "bg-background hover:bg-muted text-muted-foreground",
                                isViewer && "opacity-50 pointer-events-none"
                              )}
                              title={c === "sentence" ? "Sentence case" : c === "uppercase" ? "Uppercase" : "Lowercase"}
                            >
                              {c === "sentence" ? "Aa" : c === "uppercase" ? "AA" : "aa"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Size */}
                    <div>
                      <Label className={fieldLabel}>Text size — {activeBox.fontSize}</Label>
                      <Slider
                        value={[activeBox.fontSize]}
                        min={36}
                        max={160}
                        step={2}
                        disabled={isViewer}
                        onValueChange={([v]) => updateActiveBox(activeBox.id, { fontSize: v })}
                        className="mt-3"
                      />
                    </div>
                    {/* Style */}
                    <div className="space-y-3 pt-2">
                      <div className="space-y-3">
                        <div>
                          <Label className={fieldLabel}>Text color</Label>
                          <input
                            type="color"
                            value={activeBox.textColor}
                            onChange={(e) => updateActiveBox(activeBox.id, { textColor: e.target.value })}
                            disabled={isViewer}
                            className="mt-1.5 w-full h-9 rounded-none border border-border bg-background cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className={fieldLabel}>Alignment</Label>
                          <div className="flex border border-border rounded-none overflow-hidden items-center">
                            {/* Horizontal (L, C, R) */}
                            <div className="flex flex-1">
                              {(["left", "center", "right"] as const).map((a) => (
                                <button
                                  key={a}
                                  type="button"
                                  onClick={() => updateActiveBox(activeBox.id, { align: a })}
                                  disabled={isViewer}
                                  className={cn(
                                    "flex-1 h-9 text-xs font-bold transition-colors rounded-none",
                                    activeBox.align === a
                                      ? "bg-primary text-primary-foreground font-black"
                                      : "bg-background hover:bg-muted text-muted-foreground",
                                    isViewer && "opacity-50 pointer-events-none"
                                  )}
                                >
                                  {a === "left" ? "L" : a === "center" ? "C" : "R"}
                                </button>
                              ))}
                            </div>

                            {/* Vertical divider */}
                            <div className="w-px h-9 bg-border shrink-0" />

                            {/* Vertical (T, M, B) */}
                            <div className="flex flex-1">
                              {(["top", "center", "bottom"] as const).map((v) => {
                                const isSelected = v === "top"
                                  ? activeBox.textY <= 0.3
                                  : v === "center"
                                    ? (activeBox.textY > 0.3 && activeBox.textY < 0.7)
                                    : activeBox.textY >= 0.7;
                                const targetY = v === "top" ? 0.2 : v === "center" ? 0.5 : 0.8;
                                return (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => updateActiveBox(activeBox.id, { textY: targetY })}
                                    disabled={isViewer}
                                    className={cn(
                                      "flex-1 h-9 text-xs font-bold transition-colors rounded-none",
                                      isSelected
                                        ? "bg-primary text-primary-foreground font-black"
                                        : "bg-background hover:bg-muted text-muted-foreground",
                                      isViewer && "opacity-50 pointer-events-none"
                                    )}
                                  >
                                    {v === "top" ? "T" : v === "center" ? "M" : "B"}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <Label className={fieldLabel}>Highlight box</Label>
                        <button
                          onClick={() => updateActiveBox(activeBox.id, { highlight: !activeBox.highlight })}
                          disabled={isViewer}
                          className={cn(
                            "w-10 h-5 rounded-none p-0.5 transition-colors",
                            activeBox.highlight ? "bg-primary" : "bg-muted-foreground/20",
                            isViewer && "opacity-50 pointer-events-none"
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
                            disabled={isViewer}
                            className="mt-1.5 w-full h-9 rounded-none border border-border bg-background cursor-pointer"
                          />
                        </div>
                      )}
                      {!isViewer && (
                        <button
                          onClick={() => updateActiveBox(activeBox.id, { textX: 0.5, textY: 0.5 })}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Center text position
                        </button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Grid Items Configuration Section */}
              {(activeSlide.layoutType === "grid1x1" || activeSlide.layoutType === "grid1x2" || activeSlide.layoutType === "grid2x1" || activeSlide.layoutType === "grid2x2") && (
                <AccordionItem value="grid-items" className="border-b border-border/40 px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Layout className="w-3.5 h-3.5" /> Slide Items ({(activeSlide.layoutType === "grid1x2" || activeSlide.layoutType === "grid2x1") ? 2 : activeSlide.layoutType === "grid1x1" ? 1 : 4})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    {/* Item Text Size Control */}
                    <div className="space-y-2 border-b border-border/40 pb-3">
                      <Label className={fieldLabel}>Item Text Size — {activeSlide.gridFontSize || 36}</Label>
                      <Slider
                        value={[activeSlide.gridFontSize || 36]}
                        min={18}
                        max={100}
                        step={2}
                        disabled={isViewer}
                        onValueChange={([v]) => updateActive({ gridFontSize: v })}
                        className="mt-1"
                      />
                    </div>

                    {Array.from({ length: (activeSlide.layoutType === "grid1x2" || activeSlide.layoutType === "grid2x1") ? 2 : activeSlide.layoutType === "grid1x1" ? 1 : 4 }).map((_, idx) => {
                      const item = activeSlide.gridItems?.[idx] || { id: `gi-${idx + 1}`, text: "Featured Item" };
                      return (
                        <div key={idx} className="space-y-2 border border-border/60 p-3 bg-muted/20">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                              {activeSlide.layoutType === "grid1x1"
                                ? "Featured Item"
                                : activeSlide.layoutType === "grid1x2"
                                  ? `Item ${idx + 1} (Side ${idx === 0 ? "Left" : "Right"})`
                                  : activeSlide.layoutType === "grid2x1"
                                    ? `Item ${idx + 1} (${idx === 0 ? "Top" : "Bottom"})`
                                    : `Item ${idx + 1}`}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-muted-foreground">Label</Label>
                            <input
                              type="text"
                              value={item.text}
                              disabled={isViewer}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSlides((prev) =>
                                  prev.map((s) => {
                                    if (s.id === activeSlide.id) {
                                      const items = s.gridItems ? [...s.gridItems] : [];
                                      const defaults = [
                                        { id: "gi-1", text: "Featured Item" },
                                        { id: "gi-2", text: "Featured Item" },
                                        { id: "gi-3", text: "Featured Item" },
                                        { id: "gi-4", text: "Featured Item" },
                                      ];
                                      const size = (s.layoutType === "grid1x2" || s.layoutType === "grid2x1") ? 2 : s.layoutType === "grid1x1" ? 1 : 4;
                                      const newItems = Array.from({ length: size }).map((_, i) => items[i] || defaults[i]);
                                      newItems[idx] = { ...newItems[idx], text: val };
                                      return { ...s, gridItems: newItems };
                                    }
                                    return s;
                                  })
                                );
                              }}
                              className="w-full h-8 px-2 border border-border bg-background text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-muted-foreground">Image</Label>
                            <div className="flex gap-2 items-center">
                              <label className={cn("flex-1 flex items-center justify-center gap-1.5 h-8 border border-dashed border-border hover:border-foreground/30 bg-background cursor-pointer text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors", isViewer && "opacity-50 pointer-events-none")}>
                                <ImagePlus className="w-3.5 h-3.5" />
                                {item.image ? "Change image" : "Upload image"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={isViewer}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleGridImageUpload(activeSlide.id, idx, file);
                                  }}
                                />
                              </label>
                              {item.image && !isViewer && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  type="button"
                                  onClick={() => handleRemoveGridImage(activeSlide.id, idx)}
                                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 border border-border rounded-none shrink-0"
                                  title="Remove image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Background Section */}
              <AccordionItem value="background" className="border-b border-border/40 px-5">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <ImagePlus className="w-3.5 h-3.5" /> Slide Background
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <label className={cn("flex items-center justify-center gap-2 h-10 border border-dashed border-border hover:border-foreground/40 rounded-none cursor-pointer text-xs font-bold text-muted-foreground hover:text-foreground transition-colors", isViewer && "opacity-50 pointer-events-none")}>
                    <ImagePlus className="w-4 h-4" />
                    {activeSlide.bgImage ? "Replace image" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isViewer}
                      className="hidden"
                      onChange={(e) => handleBgUpload(e.target.files?.[0])}
                    />
                  </label>
                  {activeSlide.bgImage && !isViewer && (
                    <button
                      onClick={() => updateActive({ bgImage: undefined })}
                      className="text-xs font-bold text-destructive hover:underline block"
                    >
                      Remove background
                    </button>
                  )}
                  <div className="space-y-1.5">
                    <Label className={fieldLabel}>Solid Background Color</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={activeSlide.bgColor || "#0f0f0f"}
                        onChange={(e) => updateActive({ bgColor: e.target.value })}
                        disabled={isViewer}
                        className="w-12 h-9 rounded-none border border-border bg-background cursor-pointer"
                      />
                      <span className="text-xs font-mono uppercase font-semibold text-muted-foreground">
                        {activeSlide.bgColor || "#0f0f0f"}
                      </span>
                      {activeSlide.bgColor && activeSlide.bgColor !== "#0f0f0f" && !isViewer && (
                        <button
                          onClick={() => updateActive({ bgColor: undefined })}
                          className="text-xs font-bold text-destructive hover:underline ml-auto"
                        >
                          Reset to dark
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className={fieldLabel}>Dark overlay — {activeSlide.overlay}%</Label>
                    <Slider
                      value={[activeSlide.overlay]}
                      min={0}
                      max={90}
                      step={5}
                      disabled={isViewer}
                      onValueChange={([v]) => updateActive({ overlay: v })}
                      className="mt-3"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Overlay Image Section */}
              <AccordionItem value="overlay-image" className="border-b border-border/40 px-5">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Sparkles className="w-3.5 h-3.5" /> Overlay Image
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <label className={cn("flex items-center justify-center gap-2 h-10 border border-dashed border-border hover:border-foreground/40 rounded-none cursor-pointer text-xs font-bold text-muted-foreground hover:text-foreground transition-colors", isViewer && "opacity-50 pointer-events-none")}>
                    <ImagePlus className="w-4 h-4" />
                    {activeSlide.overlayImage ? "Replace image" : "Upload overlay"}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isViewer}
                      className="hidden"
                      onChange={(e) => handleOverlayImageUpload(e.target.files?.[0])}
                    />
                  </label>
                  {activeSlide.overlayImage && (
                    <>
                      {!isViewer && (
                        <button
                          onClick={() => updateActive({ overlayImage: undefined })}
                          className="text-xs font-bold text-destructive hover:underline block"
                        >
                          Remove overlay
                        </button>
                      )}
                      <div>
                        <Label className={fieldLabel}>Size — {activeSlide.overlayImageWidth ?? 30}%</Label>
                        <Slider
                          value={[activeSlide.overlayImageWidth ?? 30]}
                          min={10}
                          max={100}
                          step={5}
                          disabled={isViewer}
                          onValueChange={([v]) => updateActive({ overlayImageWidth: v })}
                          className="mt-3"
                        />
                      </div>
                      {!isViewer && (
                        <button
                          onClick={() => updateActive({ overlayImageX: 0.5, overlayImageY: 0.5 })}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors block"
                        >
                          Center image position
                        </button>
                      )}
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Caption Section */}
              <AccordionItem value="caption" className="border-b border-border/40 px-5">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Send className="w-3.5 h-3.5" /> Post Caption
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pb-4">
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    disabled={isViewer}
                    placeholder="Caption used when sending to Create Post…"
                    className="min-h-[70px] rounded-none border-border bg-background shadow-none text-sm font-medium"
                  />
                  <p className="text-xs font-medium text-muted-foreground">Applies to the whole slideshow</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Bottom Fixed Area: Download & Send actions */}
          <div className="p-5 border-t border-border bg-muted/10 grid grid-cols-2 gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={handleDownloadAll}
              disabled={busy || !slides.length}
              className="w-full h-10 rounded-none border-border text-xs font-bold shadow-none"
            >
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              <span>Download</span>
            </Button>
            <Button
              onClick={handleSendToPost}
              disabled={busy || !slides.length || isViewer}
              className="w-full h-10 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-none"
            >
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              <span>Send to Post</span>
            </Button>
          </div>
        </aside>
        )}
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

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="rounded-none border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
              Confirm Workspace Reset
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-semibold text-muted-foreground mt-2">
              Are you sure you want to reset all slides, scripts, and captions? This will reset the workspace to a blank slide. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-2">
            <AlertDialogCancel className="h-11 rounded-none border-2 border-black bg-background hover:bg-muted font-bold text-xs uppercase tracking-widest text-foreground shadow-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleResetAll();
                setResetDialogOpen(false);
              }}
              className="h-11 rounded-none border-2 border-black bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              Reset Workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SlideshowStudio;
