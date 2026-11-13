import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useRef,
  useState,
} from "react";
import { useCanvasTransform } from "../../hooks/useCanvasTransform";

const DRAG_THRESHOLD = 5;

type ImageCanvasProps = {
  imageRef: RefObject<HTMLImageElement>;
  src: string;
  width: number;
  height: number;
  alt: string;
  imageStyle?: CSSProperties;
  children: ReactNode;
};

type PanPointer = {
  id: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
};

export function ImageCanvas({
  imageRef,
  src,
  width,
  height,
  alt,
  imageStyle,
  children,
}: ImageCanvasProps) {
  const { x, y, scale, panBy } = useCanvasTransform();
  const panPointer = useRef<PanPointer | null>(null);
  const didDrag = useRef(false);
  const [isPanning, setIsPanning] = useState(false);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      didDrag.current = false;
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
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    []
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

  const finishPan = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const pointer = panPointer.current;
    if (!pointer || pointer.id !== event.pointerId) {
      return;
    }

    panPointer.current = null;
    setIsPanning(false);
    if (event.type === "pointercancel" || event.type === "lostpointercapture") {
      didDrag.current = false;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPan}
      onPointerCancel={finishPan}
      onLostPointerCapture={finishPan}
      onClickCapture={handleClickCapture}
      style={{
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
        style={{
          position: "relative",
          isolation: "isolate",
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        <img
          ref={imageRef}
          src={src}
          width={width}
          height={height}
          alt={alt}
          draggable={false}
          style={{
            display: "block",
            userSelect: "none",
            ...imageStyle,
          }}
        />
        {children}
      </div>
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
