import { useRef } from "react";
import { CommentPin, FloatingComposer } from "@liveblocks/react-ui";
import { useSelf } from "@liveblocks/react";
import { useCreateThread } from "@liveblocks/react/suspense";
import { useFlipSide } from "../hooks/useFlipSide";
import { useMaxZIndex } from "../hooks/useMaxZIndex";
import type { Point } from "../lib/coords";
import { useCanvas } from "./canvas/CanvasContext";
import { anchoredPinStyle, stopPointerDown } from "./canvas/anchoredPin";

type NewThreadComposerProps = {
  /** Anchor in normalized image coordinates (0–1). */
  point: Point;
  /** Called when the thread is submitted or the composer is dismissed. */
  onClose: () => void;
};

// Pin + composer for a thread that hasn't been created yet. Must be rendered
// inside the image frame so the percentage position maps onto the image.
export function NewThreadComposer({ point, onClose }: NewThreadComposerProps) {
  const creatorId = useSelf((me) => me.id);
  const createThread = useCreateThread();
  const maxZIndex = useMaxZIndex();
  const { transform, viewportRef } = useCanvas();
  const pinRef = useRef<HTMLButtonElement>(null);
  const side = useFlipSide(pinRef, viewportRef, transform);

  return (
    <FloatingComposer
      defaultOpen={true}
      side={side}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      onComposerSubmit={({ body, attachments }, event) => {
        // Skip the composer's built-in createThread; we create it ourselves.
        event.preventDefault();
        createThread({
          body,
          attachments,
          metadata: { x: point.x, y: point.y, zIndex: maxZIndex + 1 },
        });
        onClose();
      }}
    >
      <CommentPin
        ref={pinRef}
        userId={creatorId ?? undefined}
        corner="top-left"
        onPointerDown={stopPointerDown}
        style={anchoredPinStyle(point, transform.scale)}
      />
    </FloatingComposer>
  );
}
