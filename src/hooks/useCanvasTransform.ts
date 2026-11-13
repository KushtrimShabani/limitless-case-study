import { useCallback, useState } from "react";
import { type CanvasTransform, zoomAtPoint } from "../lib/transform";

const INITIAL_TRANSFORM: CanvasTransform = { x: 0, y: 0, scale: 1 };

export function useCanvasTransform() {
  const [transform, setTransform] =
    useState<CanvasTransform>(INITIAL_TRANSFORM);

  const panBy = useCallback((deltaX: number, deltaY: number) => {
    setTransform((current) => ({
      ...current,
      x: current.x + deltaX,
      y: current.y + deltaY,
    }));
  }, []);

  const zoomAt = useCallback(
    (pointX: number, pointY: number, scaleFactor: number) => {
      setTransform((current) =>
        zoomAtPoint(current, { x: pointX, y: pointY }, scaleFactor)
      );
    },
    []
  );

  const reset = useCallback(() => {
    setTransform(INITIAL_TRANSFORM);
  }, []);

  return { ...transform, panBy, zoomAt, reset };
}
