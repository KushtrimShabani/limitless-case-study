import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCanvasTransform } from "../../hooks/useCanvasTransform";
import { useImageLoad } from "../../hooks/useImageLoad";
import { ZOOM_STEP } from "../../lib/constants";
import { wheelZoomFactor } from "../../lib/coords";
import { CanvasControls } from "./CanvasControls";
import { CanvasProvider } from "./CanvasContext";
import { ImageLoadError, ImageSkeleton } from "./ImageStatus";

const DRAG_THRESHOLD = 5;

type ImageCanvasProps = {
  imageRef: RefObject<HTMLImageElement>;
  src: string;
  width: number;
  height: number;
  alt: string;
  imageStyle?: CSSProperties;
  onImageClick: (clientX: number, clientY: number) => void;
  children: ReactNode;
};

type PanPointer = {
  id: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  onImage: boolean;
};

export function ImageCanvas({
  imageRef,
  src,
  width,
  height,
  alt,
  imageStyle,
  onImageClick,
  children,
}: ImageCanvasProps) {
  const { x, y, scale, panBy, zoomAt, reset } = useCanvasTransform();
  const image = useImageLoad(src);
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const panPointer = useRef<PanPointer | null>(null);
  const didDrag = useRef(false);
  const [isPanning, setIsPanning] = useState(false);

  // The world is flex-centered, so zoom points are measured from its layout
  // position (offsetLeft/Top ignore transforms), not from the viewport corner.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const handleWheel = (event: WheelEvent) => {
      const world = worldRef.current;
      if (!world) {
        return;
      }
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      zoomAt(
        event.clientX - rect.left - world.offsetLeft,
        event.clientY - rect.top - world.offsetTop,
        wheelZoomFactor(event.deltaY, event.deltaMode, viewport.clientHeight)
      );
    };
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [zoomAt]);

  const zoomAtCenter = useCallback(
    (factor: number) => {
      const viewport = viewportRef.current;
      const world = worldRef.current;
      if (!viewport || !world) {
        return;
      }
      zoomAt(
        viewport.clientWidth / 2 - world.offsetLeft,
        viewport.clientHeight / 2 - world.offsetTop,
        factor
      );
    },
    [zoomAt]
  );

  // Capture phase: runs even when a pin stops the pointerdown from bubbling.
  const resetDidDrag = useCallback(() => {
    didDrag.current = false;
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const target = event.target;
      if (
        event.button !== 0 ||
        !(target instanceof Node) ||
        !event.currentTarget.contains(target) ||
        shouldIgnorePan(target)
      ) {
        return;
      }

      panPointer.current = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        onImage: target === imageRef.current,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [imageRef]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const pointer = panPointer.current;
      if (!pointer || pointer.id !== event.pointerId) {
        return;
      }

      if (!didDrag.current) {
        const distance = Math.hypot(
          event.clientX - pointer.startX,
          event.clientY - pointer.startY
        );
        if (distance < DRAG_THRESHOLD) {
          return;
        }

        didDrag.current = true;
        setIsPanning(true);
        panBy(event.clientX - pointer.startX, event.clientY - pointer.startY);
      } else {
        panBy(event.clientX - pointer.lastX, event.clientY - pointer.lastY);
      }

      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
    },
    [panBy]
  );

  // Capture retargets the click to the viewport, so an image click is
  // detected here: a pointerup without drag on a press that began on the image.
  const finishPan = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const pointer = panPointer.current;
      if (!pointer || pointer.id !== event.pointerId) {
        return;
      }

      panPointer.current = null;
      setIsPanning(false);
      if (
        event.type === "pointercancel" ||
        event.type === "lostpointercapture"
      ) {
        didDrag.current = false;
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (event.type === "pointerup" && !didDrag.current && pointer.onImage) {
        onImageClick(event.clientX, event.clientY);
      }
    },
    [onImageClick]
  );

  const handleClickCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!didDrag.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      didDrag.current = false;
    },
    []
  );

  return (
    <div
      ref={viewportRef}
      onPointerDownCapture={resetDidDrag}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPan}
      onPointerCancel={finishPan}
      onLostPointerCapture={finishPan}
      onClickCapture={handleClickCapture}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isPanning ? "grabbing" : "grab",
        touchAction: "none",
      }}
    >
      <div
        ref={worldRef}
        style={{
          position: "relative",
          isolation: "isolate",
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        <img
          key={image.attempt}
          ref={imageRef}
          src={image.src}
          width={width}
          height={height}
          alt={alt}
          draggable={false}
          onLoad={image.onLoad}
          onError={image.onError}
          style={{
            display: "block",
            userSelect: "none",
            visibility: image.status === "loaded" ? "visible" : "hidden",
            ...imageStyle,
          }}
        />
        {image.status === "loading" ? <ImageSkeleton /> : null}
        {image.status === "error" ? (
          <ImageLoadError onRetry={image.retry} />
        ) : null}
        {image.status === "loaded" ? (
          <CanvasProvider transform={{ x, y, scale }} viewportRef={viewportRef}>
            {children}
          </CanvasProvider>
        ) : null}
      </div>
      <CanvasControls
        scale={scale}
        onZoomIn={() => zoomAtCenter(ZOOM_STEP)}
        onZoomOut={() => zoomAtCenter(1 / ZOOM_STEP)}
        onReset={reset}
      />
    </div>
  );
}

function shouldIgnorePan(target: EventTarget): boolean {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        "button, input, textarea, [contenteditable='true'], [data-canvas-pan-ignore]"
      )
    )
  );
}
