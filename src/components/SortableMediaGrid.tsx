import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, Play, Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableMediaGridProps {
  /** Ordered preview URLs (data URLs or remote URLs). This order IS the carousel slide order. */
  previews: string[];
  /** 'image' renders a carousel of slides; 'video' renders a single video tile. */
  postType: "image" | "video";
  /** Optional finalized cover image to show in place of the video frame. */
  videoCover?: string | null;
  /** Reorder callback — move the item at oldIndex to newIndex. */
  onReorder: (oldIndex: number, newIndex: number) => void;
  /** Remove the item at the given index. */
  onRemove: (index: number) => void;
  /** Open the lightbox/zoom for a preview. */
  onZoom: (preview: string) => void;
  /** Click handler for the "Add More" tile. */
  onAddMore: () => void;
  /** Max slides allowed; the Add More tile hides once reached. */
  maxFiles?: number;
}

interface SortableTileProps {
  id: string;
  preview: string;
  index: number;
  total: number;
  postType: "image" | "video";
  videoCover?: string | null;
  onRemove: (index: number) => void;
  onZoom: (preview: string) => void;
  draggable: boolean;
}

function SortableTile({
  id,
  preview,
  index,
  total,
  postType,
  videoCover,
  onRemove,
  onZoom,
  draggable,
}: SortableTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !draggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative aspect-square border border-border group overflow-hidden bg-muted",
        isDragging && "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] opacity-80"
      )}
    >
      {postType === "image" ? (
        <img
          src={preview}
          alt={`Slide ${index + 1}`}
          className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-110"
          onClick={() => onZoom(preview)}
        />
      ) : (
        <div
          className="relative w-full h-full cursor-zoom-in group/vid"
          onClick={() => onZoom(preview)}
        >
          {videoCover ? (
            <img src={videoCover} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <video src={preview} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/vid:bg-black/40 transition-colors">
            <div className="w-8 h-8 bg-background flex items-center justify-center border border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Play className="w-3.5 h-3.5 fill-current text-foreground ml-0.5" />
            </div>
          </div>
        </div>
      )}

      {/* Slide number badge — only meaningful for a multi-slide carousel */}
      {total > 1 && (
        <div className="absolute top-1 left-1 min-w-[1.25rem] h-5 px-1 bg-foreground text-background text-[10px] font-bold flex items-center justify-center tracking-widest z-10 pointer-events-none">
          {index + 1}
        </div>
      )}

      {/* Drag handle — grabbing it reorders the slide */}
      {draggable && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag slide ${index + 1} to reorder`}
          className="absolute bottom-1 left-1 w-6 h-6 bg-foreground/80 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="absolute top-1 right-1 w-6 h-6 bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

/**
 * Drag-to-reorder grid for carousel/multi-image posts. The visual order of the
 * tiles is the exact order the media array is sent to Post For Me, so dragging a
 * tile changes which slide it becomes (slide 1, slide 2, …). Slide numbers are
 * shown whenever there is more than one image.
 */
export function SortableMediaGrid({
  previews,
  postType,
  videoCover,
  onReorder,
  onRemove,
  onZoom,
  onAddMore,
  maxFiles = 10,
}: SortableMediaGridProps) {
  // Distance constraint lets a plain click (zoom) through while still capturing drags.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Stable per-item ids. Preview URLs are unique per upload, so they make safe ids.
  const ids = previews.map((p, i) => `${i}::${p.slice(0, 32)}`);
  const draggable = postType === "image" && previews.length > 1;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(oldIndex, newIndex);
  };

  const showAddMore = postType === "image" && previews.length < maxFiles;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-border bg-card">
          {previews.map((preview, idx) => (
            <SortableTile
              key={ids[idx]}
              id={ids[idx]}
              preview={preview}
              index={idx}
              total={previews.length}
              postType={postType}
              videoCover={videoCover}
              onRemove={onRemove}
              onZoom={onZoom}
              draggable={draggable}
            />
          ))}
          {showAddMore && (
            <button
              type="button"
              onClick={onAddMore}
              className="aspect-square border border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                Add More
              </span>
            </button>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
