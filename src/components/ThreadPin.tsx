import { useRef, useState } from "react";
import { FloatingThread, CommentPin } from "@liveblocks/react-ui";
import type { ThreadData } from "@liveblocks/client";
import { useFlipSide } from "../hooks/useFlipSide";
import { useMaxZIndex } from "../hooks/useMaxZIndex";
import { useCanvas } from "./canvas/CanvasContext";
import { anchoredPinStyle, stopPointerDown } from "./canvas/anchoredPin";

export function ThreadPin({ thread }: { thread: ThreadData }) {
  const { transform, imageRef, viewportRef } = useCanvas();
  const pinRef = useRef<HTMLButtonElement>(null);
  const maxZIndex = useMaxZIndex();
  // Open threads that have just been created
  const [isOpen, setIsOpen] = useState(
    () => Date.now() - thread.createdAt.getTime() <= 100
  );
  const side = useFlipSide(pinRef, imageRef, viewportRef, transform, isOpen);

  const zIndex = isOpen ? maxZIndex + 1 : thread.metadata.zIndex || 0;

  return (
    <FloatingThread
      thread={thread}
      open={isOpen}
      onOpenChange={setIsOpen}
      side={side}
    >
      <CommentPin
        ref={pinRef}
        userId={thread.comments[0]?.userId}
        corner="top-left"
        onPointerDown={stopPointerDown}
        style={anchoredPinStyle(thread.metadata, transform.scale, zIndex)}
      />
    </FloatingThread>
  );
}
