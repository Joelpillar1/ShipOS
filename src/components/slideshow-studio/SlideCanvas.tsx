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

export type GridItem = {
  id: string;
  text: string;
  image?: string; // dataURL
  textX?: number; // 0..1 relative to cell
  textY?: number; // 0..1 relative to cell
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
  overlayImage?: string; // dataURL
  overlayImageX?: number; // 0..1
  overlayImageY?: number; // 0..1
  overlayImageWidth?: number; // percentage of slide width (e.g. 10..100)
  hasCustomOverlayImage?: boolean;
  layoutType?: "default" | "grid1x1" | "grid1x2" | "grid2x1" | "grid2x2";
  gridItems?: GridItem[];
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
  onOverlayImageMove?: (x: number, y: number) => void;
  onOverlayImageRemove?: () => void;
  onGridImageUpload?: (itemIndex: number, file: File) => void;
  onGridTextMove?: (itemIndex: number, x: number, y: number) => void;
};

/**
 * The forwarded ref points at the FULL-RESOLUTION node (rendered at `displayWidth === width`,
 * i.e. scale 1), which is what html-to-image captures for image export.
 */
export const SlideCanvas = React.forwardRef<HTMLDivElement, SlideCanvasProps>(
  ({ slide, width, height, displayWidth, className, interactive, activeBoxId, onSelectBox, onTextMove, onOverlayImageMove, onOverlayImageRemove, onGridImageUpload, onGridTextMove }, ref) => {
    const scale = displayWidth / width;
    const displayHeight = displayWidth * (height / width);
    const wrapRef = React.useRef<HTMLDivElement>(null);

    const handleImagePointerDown = (e: React.PointerEvent) => {
      if (!interactive || !wrapRef.current || !onOverlayImageMove) return;
      e.stopPropagation();
      const rect = wrapRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const dx = (slide.overlayImageX ?? 0.5) - px;
      const dy = (slide.overlayImageY ?? 0.5) - py;

      const move = (ev: PointerEvent) => {
        const nx = clamp01((ev.clientX - rect.left) / rect.width + dx);
        const ny = clamp01((ev.clientY - rect.top) / rect.height + dy);
        onOverlayImageMove(nx, ny);
      };

      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };
 
    const handleLabelPointerDown = (idx: number, e: React.PointerEvent) => {
      if (!interactive) return;
      e.stopPropagation();
      
      const cellElement = e.currentTarget.parentElement;
      if (!cellElement) return;
      const rect = cellElement.getBoundingClientRect();
      
      const item = slide.gridItems?.[idx] || { textX: 0.5, textY: 0.08 };
      const startX = item.textX ?? 0.5;
      const startY = item.textY ?? 0.08;
      
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const dx = startX - px;
      const dy = startY - py;

      const move = (ev: PointerEvent) => {
        const nx = clamp01((ev.clientX - rect.left) / rect.width + dx);
        const ny = clamp01((ev.clientY - rect.top) / rect.height + dy);
        if (onGridTextMove) {
          onGridTextMove(idx, nx, ny);
        }
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

          {/* Grid Layouts (1x1, 1x2, 2x1 and 2x2) vs Standard Layout */}
          {slide.layoutType === "grid1x1" || slide.layoutType === "grid1x2" || slide.layoutType === "grid2x1" || slide.layoutType === "grid2x2" ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
                padding: `${height * 0.04}px ${width * 0.05}px`,
              }}
            >
              {/* Title at the top */}
              {(() => {
                const titleBox = getSlideTextBoxes(slide)[0];
                return (
                  <div
                    style={{
                      width: "100%",
                      textAlign: titleBox.align,
                      marginBottom: `${height * 0.015}px`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: titleBox.font,
                        fontSize: titleBox.fontSize * 0.85,
                        fontWeight: titleBox.fontWeight,
                        lineHeight: 1.25,
                        color: titleBox.textColor,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        textShadow: titleBox.highlight ? "none" : "0 2px 12px rgba(0,0,0,0.45)",
                        ...(titleBox.highlight
                          ? {
                              backgroundColor: titleBox.highlightColor,
                              padding: "0.08em 0.28em",
                              WebkitBoxDecorationBreak: "clone",
                              boxDecorationBreak: "clone",
                            }
                          : {}),
                      }}
                    >
                      {titleBox.text
                        ? applyCasing(formatSlideText(titleBox.text), titleBox.casing)
                        : (interactive ? "Double click to edit title" : " ")}
                    </span>
                  </div>
                );
              })()}

              {/* Grid content area */}
              {slide.layoutType === "grid1x1" ? (
                /* ── 1x1 Layout ── */
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  {(() => {
                    const item = slide.gridItems?.[0] || { id: "gi-1", text: "Featured Item" };
                    const isLandscape = width > height;
                    const imgAspectRatio = isLandscape ? "1.6" : "1.1";
                    return (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          position: "relative",
                          paddingTop: `${height * 0.05}px`,
                          width: "72%",
                        }}
                      >
                        {/* Label */}
                        <span
                          onPointerDown={(e) => handleLabelPointerDown(0, e)}
                          style={{
                            position: "absolute",
                            left: `${(item.textX ?? 0.5) * 100}%`,
                            top: `${(item.textY ?? 0.08) * 100}%`,
                            transform: "translate(-50%, -50%)",
                            cursor: interactive ? "move" : "default",
                            userSelect: "none",
                            touchAction: interactive ? "none" : undefined,
                            fontFamily: slide.font,
                            fontSize: `${slide.fontSize * (isLandscape ? 0.55 : 0.65)}px`,
                            fontWeight: slide.fontWeight,
                            color: slide.textColor,
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "90%",
                            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                            zIndex: 10,
                          }}
                        >
                          {item.text}
                        </span>

                        {/* Image Box */}
                        <div
                          onClick={() => {
                            if (interactive) {
                              const input = document.getElementById(`grid-input-${slide.id}-0`);
                              input?.click();
                            }
                          }}
                          style={{
                            width: "100%",
                            aspectRatio: imgAspectRatio,
                            borderRadius: `${width * 0.015}px`,
                            overflow: "hidden",
                            position: "relative",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                            border: "2px solid rgba(255,255,255,0.15)",
                            backgroundColor: "rgba(255,255,255,0.05)",
                            cursor: interactive ? "pointer" : "default",
                          }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.text}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                height: "100%",
                                color: "rgba(255,255,255,0.4)",
                                gap: "8px",
                                border: "2px dashed rgba(255,255,255,0.2)",
                                borderRadius: `${width * 0.015}px`,
                              }}
                            >
                              <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              {interactive && (
                                <span style={{ fontSize: `${width * 0.028}px`, fontWeight: "bold" }}>
                                  Upload Image
                                </span>
                              )}
                            </div>
                          )}

                          {/* Hidden file input */}
                          {interactive && (
                            <input
                              id={`grid-input-${slide.id}-0`}
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && onGridImageUpload) {
                                  onGridImageUpload(0, file);
                                }
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : slide.layoutType === "grid1x2" ? (
                /* ── 1x2 Layout ── */
                <div
                  style={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    columnGap: `${width * 0.025}px`,
                    alignItems: "center",
                  }}
                >
                  {Array.from({ length: 2 }).map((_, idx) => {
                    const item = slide.gridItems?.[idx] || { id: `gi-${idx + 1}`, text: `Item ${idx + 1}` };
                    const isLandscape = width > height;
                    const imgAspectRatio = isLandscape ? "1.6" : "0.85";
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          position: "relative",
                          paddingTop: `${height * 0.045}px`,
                          width: "100%",
                        }}
                      >
                        {/* Label */}
                        <span
                          onPointerDown={(e) => handleLabelPointerDown(idx, e)}
                          style={{
                            position: "absolute",
                            left: `${(item.textX ?? 0.5) * 100}%`,
                            top: `${(item.textY ?? 0.08) * 100}%`,
                            transform: "translate(-50%, -50%)",
                            cursor: interactive ? "move" : "default",
                            userSelect: "none",
                            touchAction: interactive ? "none" : undefined,
                            fontFamily: slide.font,
                            fontSize: `${slide.fontSize * (isLandscape ? 0.45 : 0.55)}px`,
                            fontWeight: slide.fontWeight,
                            color: slide.textColor,
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "90%",
                            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                            zIndex: 10,
                          }}
                        >
                          {item.text}
                        </span>

                        {/* Image Box */}
                        <div
                          onClick={() => {
                            if (interactive) {
                              const input = document.getElementById(`grid-input-${slide.id}-${idx}`);
                              input?.click();
                            }
                          }}
                          style={{
                            width: "100%",
                            aspectRatio: imgAspectRatio,
                            borderRadius: `${width * 0.015}px`,
                            overflow: "hidden",
                            position: "relative",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                            border: "2px solid rgba(255,255,255,0.15)",
                            backgroundColor: "rgba(255,255,255,0.05)",
                            cursor: interactive ? "pointer" : "default",
                          }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.text}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                height: "100%",
                                color: "rgba(255,255,255,0.4)",
                                gap: "8px",
                                border: "2px dashed rgba(255,255,255,0.2)",
                                borderRadius: `${width * 0.015}px`,
                              }}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              {interactive && (
                                <span style={{ fontSize: `${width * 0.025}px`, fontWeight: "bold" }}>
                                  Upload Image
                                </span>
                              )}
                            </div>
                          )}

                          {/* Hidden file input */}
                          {interactive && (
                            <input
                              id={`grid-input-${slide.id}-${idx}`}
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && onGridImageUpload) {
                                  onGridImageUpload(idx, file);
                                }
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : slide.layoutType === "grid2x1" ? (
                /* ── 2x1 Layout ── */
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: `${height * 0.015}px`,
                    width: "100%",
                  }}
                >
                  {Array.from({ length: 2 }).map((_, idx) => {
                    const item = slide.gridItems?.[idx] || { id: `gi-${idx + 1}`, text: `Item ${idx + 1}` };
                    const isLandscape = width > height;
                    const imgAspectRatio = isLandscape ? "2.2" : "1.8";
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          position: "relative",
                          paddingTop: `${height * 0.045}px`,
                          width: "55%",
                        }}
                      >
                        {/* Label */}
                        <span
                          onPointerDown={(e) => handleLabelPointerDown(idx, e)}
                          style={{
                            position: "absolute",
                            left: `${(item.textX ?? 0.5) * 100}%`,
                            top: `${(item.textY ?? 0.08) * 100}%`,
                            transform: "translate(-50%, -50%)",
                            cursor: interactive ? "move" : "default",
                            userSelect: "none",
                            touchAction: interactive ? "none" : undefined,
                            fontFamily: slide.font,
                            fontSize: `${slide.fontSize * (isLandscape ? 0.45 : 0.55)}px`,
                            fontWeight: slide.fontWeight,
                            color: slide.textColor,
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "90%",
                            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                            zIndex: 10,
                          }}
                        >
                          {item.text}
                        </span>

                        {/* Image Box */}
                        <div
                          onClick={() => {
                            if (interactive) {
                              const input = document.getElementById(`grid-input-${slide.id}-${idx}`);
                              input?.click();
                            }
                          }}
                          style={{
                            width: "100%",
                            aspectRatio: imgAspectRatio,
                            borderRadius: `${width * 0.015}px`,
                            overflow: "hidden",
                            position: "relative",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                            border: "2px solid rgba(255,255,255,0.15)",
                            backgroundColor: "rgba(255,255,255,0.05)",
                            cursor: interactive ? "pointer" : "default",
                          }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.text}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                height: "100%",
                                color: "rgba(255,255,255,0.4)",
                                gap: "8px",
                                border: "2px dashed rgba(255,255,255,0.2)",
                                borderRadius: `${width * 0.015}px`,
                              }}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              {interactive && (
                                <span style={{ fontSize: `${width * 0.025}px`, fontWeight: "bold" }}>
                                  Upload Image
                                </span>
                              )}
                            </div>
                          )}

                          {/* Hidden file input */}
                          {interactive && (
                            <input
                              id={`grid-input-${slide.id}-${idx}`}
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && onGridImageUpload) {
                                  onGridImageUpload(idx, file);
                                }
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ── 2x2 Layout ── */
                <div
                  style={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    columnGap: `${width * 0.025}px`,
                    rowGap: `${height * 0.01}px`,
                    alignItems: "center",
                  }}
                >
                  {Array.from({ length: 4 }).map((_, idx) => {
                    const item = slide.gridItems?.[idx] || { id: `gi-${idx + 1}`, text: `Item ${idx + 1}` };
                    const isLandscape = width > height;
                    const imgAspectRatio = isLandscape ? "1.6" : "1.1";
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          position: "relative",
                          paddingTop: `${height * 0.045}px`,
                          width: "100%",
                        }}
                      >
                        {/* Label */}
                        <span
                          onPointerDown={(e) => handleLabelPointerDown(idx, e)}
                          style={{
                            position: "absolute",
                            left: `${(item.textX ?? 0.5) * 100}%`,
                            top: `${(item.textY ?? 0.08) * 100}%`,
                            transform: "translate(-50%, -50%)",
                            cursor: interactive ? "move" : "default",
                            userSelect: "none",
                            touchAction: interactive ? "none" : undefined,
                            fontFamily: slide.font,
                            fontSize: `${slide.fontSize * (isLandscape ? 0.45 : 0.55)}px`,
                            fontWeight: slide.fontWeight,
                            color: slide.textColor,
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "90%",
                            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                            zIndex: 10,
                          }}
                        >
                          {item.text}
                        </span>

                        {/* Image Box */}
                        <div
                          onClick={() => {
                            if (interactive) {
                              const input = document.getElementById(`grid-input-${slide.id}-${idx}`);
                              input?.click();
                            }
                          }}
                          style={{
                            width: "100%",
                            aspectRatio: imgAspectRatio,
                            borderRadius: `${width * 0.015}px`,
                            overflow: "hidden",
                            position: "relative",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                            border: "2px solid rgba(255,255,255,0.15)",
                            backgroundColor: "rgba(255,255,255,0.05)",
                            cursor: interactive ? "pointer" : "default",
                          }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.text}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                height: "100%",
                                color: "rgba(255,255,255,0.4)",
                                gap: "8px",
                                border: "2px dashed rgba(255,255,255,0.2)",
                                borderRadius: `${width * 0.015}px`,
                              }}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              {interactive && (
                                <span style={{ fontSize: `${width * 0.025}px`, fontWeight: "bold" }}>
                                  Upload Image
                                </span>
                              )}
                            </div>
                          )}

                          {/* Hidden file input */}
                          {interactive && (
                            <input
                              id={`grid-input-${slide.id}-${idx}`}
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && onGridImageUpload) {
                                  onGridImageUpload(idx, file);
                                }
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Overlay Image */}
              {slide.overlayImage && (
                <div
                  onPointerDown={handleImagePointerDown}
                  style={{
                    position: "absolute",
                    left: `${(slide.overlayImageX ?? 0.5) * 100}%`,
                    top: `${(slide.overlayImageY ?? 0.5) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: `${slide.overlayImageWidth ?? 30}%`,
                    cursor: interactive ? "move" : "default",
                    userSelect: "none",
                    touchAction: interactive ? "none" : undefined,
                    border: interactive ? "1px dashed rgba(215, 90, 52, 0.5)" : "none",
                    padding: interactive ? "4px" : "0",
                  }}
                >
                  <img
                    src={slide.overlayImage}
                    alt="Overlay"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      pointerEvents: "none",
                    }}
                  />
                  {interactive && onOverlayImageRemove && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking the delete button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOverlayImageRemove();
                      }}
                      style={{
                        position: "absolute",
                        top: "-12px",
                        right: "-12px",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "2px solid #ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      }}
                      title="Remove overlay image"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
              )}

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
            </>
          )}
        </div>
      </div>
    );
  },
);

SlideCanvas.displayName = "SlideCanvas";
