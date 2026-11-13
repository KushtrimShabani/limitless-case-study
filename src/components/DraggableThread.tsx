import { useMemo, useState } from "react";
import { useEditThreadMetadata } from "@liveblocks/react/suspense";
import { FloatingThread, CommentPin } from "@liveblocks/react-ui";
import { ThreadData } from "@liveblocks/client";
import { useDraggable } from "@dnd-kit/core";
import { useMaxZIndex } from "../hooks/useMaxZIndex";

// A draggable thread
export function DraggableThread({ thread }: { thread: ThreadData }) {
  // Open threads that have just been created
  const defaultOpen = useMemo(() => {
    return Number(new Date()) - Number(new Date(thread.createdAt)) <= 100;
  }, [thread]);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Enable drag
  const { isDragging, attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: thread.id,
      data: { thread }, // Pass thread to DndContext drag end event
    });

  // Anchor is normalized (0–1), so position it as a percentage of the image
  // frame. While dragging, dnd-kit's pixel offset is layered on top; the new
  // anchor is only computed and saved on drop (see CommentsCanvas).
  const left = `${thread.metadata.x * 100}%`;
  const top = `${thread.metadata.y * 100}%`;
  const dragX = transform?.x ?? 0;
  const dragY = transform?.y ?? 0;

  // Used to set z-index higher than other threads when open or dragging
  const maxZIndex = useMaxZIndex();
  const currentZIndex =
    isOpen || isDragging ? maxZIndex + 1 : thread.metadata?.zIndex || 0;

  return (
    <FloatingThread
      thread={thread}
      open={isOpen}
      onOpenChange={setIsOpen}
      defaultOpen={defaultOpen}
      side="right"
      style={{ pointerEvents: isDragging ? "none" : "auto" }}
    >
      <div
        ref={setNodeRef}
        style={{
          position: "absolute",
          left,
          top,
          transform: `translate3d(${dragX}px, ${dragY}px, 0)`,
          zIndex: currentZIndex,
        }}
      >
        <CommentPin
          userId={thread.comments[0]?.userId}
          corner="top-left"
          {...listeners}
          {...attributes}
        />
      </div>
    </FloatingThread>
  );
}
