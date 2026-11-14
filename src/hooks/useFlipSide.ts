import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  type CanvasTransform,
  type ThreadSide,
  threadSide,
} from "../lib/coords";

export function useFlipSide(
  pinRef: RefObject<HTMLElement>,
  viewportRef: RefObject<HTMLElement>,
  transform: CanvasTransform
): ThreadSide {
  const [side, setSide] = useState<ThreadSide>("right");

  const update = useCallback(() => {
    const pin = pinRef.current;
    const viewport = viewportRef.current;
    if (!pin || !viewport) {
      return;
    }
    setSide(
      threadSide(
        pin.getBoundingClientRect().right,
        viewport.getBoundingClientRect().right
      )
    );
  }, [pinRef, viewportRef]);

  const { x, y, scale } = transform;
  useLayoutEffect(update, [update, x, y, scale]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [update, viewportRef]);

  return side;
}
