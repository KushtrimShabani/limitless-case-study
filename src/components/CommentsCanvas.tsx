import { useThreads } from "@liveblocks/react/suspense";
import { useCallback, useRef, useState } from "react";
import { PlaceThreadButton } from "./PlaceThreadButton";
import { ThreadPin } from "./ThreadPin";
import { NewThreadComposer } from "./NewThreadComposer";
import { ImageCanvas } from "./canvas/ImageCanvas";
import { clientToImage, isInsideImage, type Point } from "../lib/coords";

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
  const imageRef = useRef<HTMLImageElement>(null);
  const [mode, setMode] = useState<PlacementMode>({ kind: "idle" });

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
      }}
    >
      <ImageCanvas
        imageRef={imageRef}
        src={IMAGE.src}
        width={IMAGE.width}
        height={IMAGE.height}
        alt={IMAGE.alt}
        imageStyle={{ width: IMAGE_CSS_WIDTH, height: "auto" }}
      >
        {threads.map((thread) => (
          <ThreadPin key={thread.id} thread={thread} />
        ))}
        {mode.kind === "composing" ? (
          <NewThreadComposer point={mode.point} onClose={resetMode} />
        ) : null}
      </ImageCanvas>
      <PlaceThreadButton
        isPlacing={mode.kind === "placing"}
        onStart={() => setMode({ kind: "placing" })}
        onPlace={handlePlace}
        onCancel={resetMode}
      />
    </div>
  );
}
