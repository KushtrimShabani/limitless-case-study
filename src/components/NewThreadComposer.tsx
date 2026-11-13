import { CommentPin, FloatingComposer } from "@liveblocks/react-ui";
import { useSelf } from "@liveblocks/react";
import { useMaxZIndex } from "../hooks/useMaxZIndex";
import type { Point } from "../lib/coords";
import { useCanvasScale } from "./canvas/CanvasScaleContext";

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
  // Create thread above other threads
  const maxZIndex = useMaxZIndex();
  const scale = useCanvasScale();

  return (
    <FloatingComposer
      defaultOpen={true}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      metadata={{
        x: point.x,
        y: point.y,
        zIndex: maxZIndex + 1,
      }}
      onComposerSubmit={onClose}
    >
      <CommentPin
        data-canvas-pan-ignore
        userId={creatorId ?? undefined}
        corner="top-left"
        style={{
          position: "absolute",
          left: `${point.x * 100}%`,
          top: `${point.y * 100}%`,
          transform: `scale(${1 / scale})`,
          transformOrigin: "0 0",
        }}
      />
    </FloatingComposer>
  );
}
