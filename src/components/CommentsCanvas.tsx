import { ThreadData } from "@liveblocks/client";
import { useThreads, useEditThreadMetadata } from "@liveblocks/react/suspense";
import {
  DataRef,
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useCallback, useRef, useState } from "react";
import { PlaceThreadButton } from "./PlaceThreadButton";
import { DraggableThread } from "./DraggableThread";
import { NewThreadComposer } from "./NewThreadComposer";
import { useMaxZIndex } from "../hooks/useMaxZIndex";
import {
  clampToImage,
  clientToImage,
  imageToClient,
  isInsideImage,
  type Point,
} from "../lib/coords";

const IMAGE = {
  src: "/sample-design.svg",
  width: 1600,
  height: 1000,
  alt: "Landing page design for Acme Planner",
};

// Largest size that fits in 90vw × 85vh while keeping the aspect ratio.
// Set explicitly (not left to the image's natural size) so the frame has
// its final size before the image loads and pins never jump.
const IMAGE_CSS_WIDTH = `min(90vw, ${(85 * IMAGE.width) / IMAGE.height}vh)`;

type PlacementMode =
  | { kind: "idle" }
  | { kind: "placing" }
  | { kind: "composing"; point: Point };

export function CommentsCanvas() {
  const { threads } = useThreads();
  const editThreadMetadata = useEditThreadMetadata();
  const maxZIndex = useMaxZIndex();
  const imageRef = useRef<HTMLImageElement>(null);
  const [mode, setMode] = useState<PlacementMode>({ kind: "idle" });

  // Allow click event on avatar if thread moved less than 3px
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // On drag end, move the anchor by the drag distance (converted from pixels
  // to image space), keep it on the image, and raise it to the top z-index.
  const handleDragEnd = useCallback(
    ({ active, delta }: DragEndEvent) => {
      const thread = (active.data as DataRef<{ thread: ThreadData }>).current
        ?.thread;
      const image = imageRef.current;
      if (!thread || !image) {
        return;
      }
      const rect = image.getBoundingClientRect();
      const start = imageToClient(thread.metadata, rect);
      const moved = clientToImage(start.x + delta.x, start.y + delta.y, rect);
      if (!moved) {
        return;
      }
      const { x, y } = clampToImage(moved);
      editThreadMetadata({
        threadId: thread.id,
        metadata: { x, y, zIndex: maxZIndex + 1 },
      });
    },
    [editThreadMetadata, maxZIndex]
  );

  // Placing click: start composing if it landed on the image, else cancel.
  const handlePlace = useCallback((clientX: number, clientY: number) => {
    const image = imageRef.current;
    const point = image
      ? clientToImage(clientX, clientY, image.getBoundingClientRect())
      : null;
    if (point && isInsideImage(point)) {
      setMode({ kind: "composing", point });
    } else {
      setMode({ kind: "idle" });
    }
  }, []);

  const resetMode = useCallback(() => setMode({ kind: "idle" }), []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Image frame: pins are positioned in % of this box, which is exactly
          the image's box. `isolation` keeps pin z-indexes inside it. */}
      <div style={{ position: "relative", isolation: "isolate" }}>
        {/* Plain <img>, not next/image: we need a direct ref for
            getBoundingClientRect, and next/image skips optimizing SVGs anyway */}
        <img
          ref={imageRef}
          src={IMAGE.src}
          width={IMAGE.width}
          height={IMAGE.height}
          alt={IMAGE.alt}
          draggable={false}
          style={{
            display: "block",
            width: IMAGE_CSS_WIDTH,
            height: "auto",
            userSelect: "none",
          }}
        />
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
          {threads.map((thread) => (
            <DraggableThread key={thread.id} thread={thread} />
          ))}
        </DndContext>
        {mode.kind === "composing" ? (
          <NewThreadComposer point={mode.point} onClose={resetMode} />
        ) : null}
      </div>
      <PlaceThreadButton
        isPlacing={mode.kind === "placing"}
        onStart={() => setMode({ kind: "placing" })}
        onPlace={handlePlace}
        onCancel={resetMode}
      />
    </div>
  );
}
