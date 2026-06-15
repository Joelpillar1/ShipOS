import * as React from "react";

// One slide's editable content. Rendered at the chosen format's true resolution and CSS-scaled
// down for the editor/thumbnails, so the on-screen preview and the export are identical.
export type TextBox = {
  id: string;
  text: string;
  font: string;
  fontSize: number;
  fontWeight: number;
  textColor: string;
  align: "left" | "center" | "right";
  highlight: boolean;
  highlightColor: string;
  textX: number; // 0..1 — horizontal center of the text block on the slide
  textY: number; // 0..1 — vertical center of the text block on the slide
  overriddenProps?: string[];
  casing?: "sentence" | "uppercase" | "lowercase";
};

export type Slide = {
  id: string;
  text: string;
  bgImage?: string; // dataURL
  overlay: number; // 0-100 dark overlay opacity for legibility
  font: string; // CSS font-family
  fontSize: number; // px at the format's native resolution
  fontWeight: number; // varies per font (display fonts heavy, text fonts lighter)
  textColor: string;
  align: "left" | "center" | "right";
  highlight: boolean; // solid box behind the text
  highlightColor: string;
  textX: number; // 0..1 — horizontal center of the text block on the slide
  textY: number; // 0..1 — vertical center of the text block on the slide
  hasCustomBg?: boolean;
  hasCustomFont?: boolean;
  textBoxes?: TextBox[];
  casing?: "sentence" | "uppercase" | "lowercase";
};

export function getSlideTextBoxes(slide: Slide): TextBox[] {
  if (slide.textBoxes && slide.textBoxes.length > 0) {
    return slide.textBoxes;
  }
  return [
    {
      id: "default",
      text: slide.text,
      font: slide.font,
      fontSize: slide.fontSize,
      fontWeight: slide.fontWeight,
      textColor: slide.textColor,
      align: slide.align,
      highlight: slide.highlight,
      highlightColor: slide.highlightColor,
      textX: slide.textX,
      textY: slide.textY,
      casing: slide.casing,
    },
  ];
}

// The draggable text block spans this fraction of the slide width.
export const TEXT_BOX_WIDTH = 0.84;

/**
 * Format a slide's text for rendering: a sentence ending in a full stop starts a new, separated
 * block — i.e. after ". " we insert a blank line so the next sentence is disconnected from the
 * previous one. Explicit newlines the user typed are preserved.
 */
export function formatSlideText(text: string): string {
  return text.replace(/\.\s+(?=\S)/g, ".\n\n");
}

export function toSentenceCase(text: string): string {
  if (!text) return text;
  return text
    .split("\n")
    .map((line) => {
      if (!line.trim()) return line;
      const lower = line.toLowerCase();
      let sentenceCased = lower.replace(/(^\s*|[.!?]\s+)([a-z])/g, (match, p1, p2) => {
        return p1 + p2.toUpperCase();
      });
      sentenceCased = sentenceCased.replace(/\bi\b/g, "I");
      return sentenceCased;
    })
    .join("\n");
}

export function applyCasing(text: string, casing?: "sentence" | "uppercase" | "lowercase"): string {
  if (!text) return text;
  if (casing === "uppercase") {
    return text.toUpperCase();
  }
  if (casing === "lowercase") {
    return text.toLowerCase();
  }
  if (casing === "sentence") {
    return toSentenceCase(text);
  }
  return text;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

type SlideCanvasProps = {
  slide: Slide;
  /** Native slide resolution (e.g. 1080x1920). */
  width: number;
  height: number;
  /** On-screen width in px; height follows the format ratio. */
  displayWidth: number;
  className?: string;
  /** When true the text block can be dragged to reposition it. */
  interactive?: boolean;
  activeBoxId?: string | null;
  onSelectBox?: (id: string) => void;
  onTextMove?: (boxId: string, x: number, y: number) => void;
};

/**
 * The forwarded ref points at the FULL-RESOLUTION node (rendered at `displayWidth === width`,
 * i.e. scale 1), which is what html-to-image captures for image export.
 */
export const SlideCanvas = React.forwardRef<HTMLDivElement, SlideCanvasProps>(
  ({ slide, width, height, displayWidth, className, interactive, activeBoxId, onSelectBox, onTextMove }, ref) => {
    const scale = displayWidth / width;
    const displayHeight = displayWidth * (height / width);
    const wrapRef = React.useRef<HTMLDivElement>(null);

    return (
      <div
        ref={wrapRef}
        className={className}
        style={{
          width: displayWidth,
          height: displayHeight,
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          ref={ref}
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "relative",
            background: "#0f0f0f",
            overflow: "hidden",
          }}
        >
          {/* Background: image > solid dark */}
          {slide.bgImage ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `center / cover no-repeat url(${slide.bgImage})`,
              }}
            />
          ) : null}

          {/* Dark overlay for text legibility */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#000",
              opacity: slide.overlay / 100,
            }}
          />

          {/* Draggable, positioned text blocks */}
          {getSlideTextBoxes(slide).map((box) => {
            const isActive = activeBoxId === box.id;

            const handlePointerDown = (e: React.PointerEvent) => {
              if (!interactive || !wrapRef.current) return;
              e.stopPropagation();
              if (onSelectBox) {
                onSelectBox(box.id);
              }
              if (!onTextMove) return;

              const rect = wrapRef.current.getBoundingClientRect();
              const px = (e.clientX - rect.left) / rect.width;
              const py = (e.clientY - rect.top) / rect.height;
              // Offset between grab point and center
              const dx = box.textX - px;
              const dy = box.textY - py;

              const move = (ev: PointerEvent) => {
                const nx = clamp01((ev.clientX - rect.left) / rect.width + dx);
                const ny = clamp01((ev.clientY - rect.top) / rect.height + dy);
                onTextMove(box.id, nx, ny);
              };

              const up = () => {
                window.removeEventListener("pointermove", move);
                window.removeEventListener("pointerup", up);
              };

              window.addEventListener("pointermove", move);
              window.addEventListener("pointerup", up);
            };

            return (
              <div
                key={box.id}
                onPointerDown={handlePointerDown}
                style={{
                  position: "absolute",
                  left: `${box.textX * 100}%`,
                  top: `${box.textY * 100}%`,
                  transform: "translate(-50%, -50%)",
                  width: `${TEXT_BOX_WIDTH * 100}%`,
                  textAlign: box.align,
                  cursor: interactive ? "move" : "default",
                  userSelect: "none",
                  touchAction: interactive ? "none" : undefined,
                }}
              >
                <span
                  style={{
                    fontFamily: box.font,
                    fontSize: box.fontSize,
                    fontWeight: box.fontWeight,
                    lineHeight: 1.25,
                    color: box.textColor,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    textShadow: box.highlight ? "none" : "0 2px 12px rgba(0,0,0,0.45)",
                    ...(box.highlight
                      ? {
                          backgroundColor: box.highlightColor,
                          padding: "0.08em 0.28em",
                          WebkitBoxDecorationBreak: "clone",
                          boxDecorationBreak: "clone",
                        }
                      : {}),
                  }}
                >
                  {box.text
                    ? applyCasing(formatSlideText(box.text), box.casing)
                    : (interactive ? "Double click to edit text" : " ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

SlideCanvas.displayName = "SlideCanvas";
