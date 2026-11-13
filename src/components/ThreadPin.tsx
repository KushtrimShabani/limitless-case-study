import { useMemo, useState } from "react";
import { FloatingThread, CommentPin } from "@liveblocks/react-ui";
import type { ThreadData } from "@liveblocks/client";
import { useMaxZIndex } from "../hooks/useMaxZIndex";
import { useCanvasScale } from "./canvas/CanvasScaleContext";
import { anchoredPinStyle, stopPointerDown } from "./canvas/anchoredPin";

export function ThreadPin({ thread }: { thread: ThreadData }) {
  const scale = useCanvasScale();
  const maxZIndex = useMaxZIndex();
  // Open threads that have just been created
  const defaultOpen = useMemo(() => {
    return Number(new Date()) - Number(new Date(thread.createdAt)) <= 100;
  }, [thread]);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const zIndex = isOpen ? maxZIndex + 1 : thread.metadata.zIndex || 0;

  return (
    <FloatingThread
      thread={thread}
      open={isOpen}
      onOpenChange={setIsOpen}
      defaultOpen={defaultOpen}
      side="right"
    >
      <CommentPin
        userId={thread.comments[0]?.userId}
        corner="top-left"
        onPointerDown={stopPointerDown}
        style={anchoredPinStyle(thread.metadata, scale, zIndex)}
      />
    </FloatingThread>
  );
}
