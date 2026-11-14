import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type RefObject,
} from "react";
import type { CanvasTransform } from "../../lib/coords";

type CanvasContextValue = {
  transform: CanvasTransform;
  viewportRef: RefObject<HTMLDivElement>;
};

const CanvasContext = createContext<CanvasContextValue | null>(null);

type CanvasProviderProps = CanvasContextValue & { children: ReactNode };

export function CanvasProvider({
  transform: { x, y, scale },
  viewportRef,
  children,
}: CanvasProviderProps) {
  const value = useMemo(
    () => ({ transform: { x, y, scale }, viewportRef }),
    [x, y, scale, viewportRef]
  );
  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
}

export function useCanvas(): CanvasContextValue {
  const value = useContext(CanvasContext);
  if (!value) {
    throw new Error("useCanvas must be used inside ImageCanvas");
  }
  return value;
}
