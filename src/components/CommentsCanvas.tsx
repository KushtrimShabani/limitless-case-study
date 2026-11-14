import { useThreads } from "@liveblocks/react/suspense";
import { useCallback, useRef, useState } from "react";
import { ConnectionBanner } from "./ConnectionBanner";
import { ThreadPin } from "./ThreadPin";
import { NewThreadComposer } from "./NewThreadComposer";
import { ImageCanvas } from "./canvas/ImageCanvas";
import { clampToImage, clientToImage, type Point } from "../lib/coords";

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

export function CommentsCanvas() {
  const { threads } = useThreads();
  const imageRef = useRef<HTMLImageElement>(null);
  const [draft, setDraft] = useState<Point | null>(null);
  // The composer closes on pointerdown outside it, before the click arrives,
  // so remember whether a draft was open: that click only cancels it.
  const draftOpenOnPointerDown = useRef(false);

  const handleImageClick = useCallback((clientX: number, clientY: number) => {
    const image = imageRef.current;
    if (draftOpenOnPointerDown.current || !image) {
      return;
    }
    const point = clientToImage(
      clientX,
      clientY,
      image.getBoundingClientRect()
    );
    if (point) {
      setDraft(clampToImage(point));
    }
  }, []);

  const clearDraft = useCallback(() => setDraft(null), []);

  return (
    <div
      onPointerDownCapture={() => {
        draftOpenOnPointerDown.current = draft !== null;
      }}
      style={{ width: "100vw", height: "100vh" }}
    >
      <ImageCanvas
        imageRef={imageRef}
        src={IMAGE.src}
        width={IMAGE.width}
        height={IMAGE.height}
        alt={IMAGE.alt}
        imageStyle={{ width: IMAGE_CSS_WIDTH, height: "auto" }}
        onImageClick={handleImageClick}
      >
        {threads.map((thread) => (
          <ThreadPin key={thread.id} thread={thread} />
        ))}
        {draft ? (
          <NewThreadComposer point={draft} onClose={clearDraft} />
        ) : null}
      </ImageCanvas>
      <ConnectionBanner />
    </div>
  );
}
