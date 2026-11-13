import { createContext, useContext, type ReactNode } from "react";

const CanvasScaleContext = createContext(1);

type CanvasScaleProviderProps = {
  scale: number;
  children: ReactNode;
};

export function CanvasScaleProvider({
  scale,
  children,
}: CanvasScaleProviderProps) {
  return (
    <CanvasScaleContext.Provider value={scale}>
      {children}
    </CanvasScaleContext.Provider>
  );
}

export function useCanvasScale(): number {
  return useContext(CanvasScaleContext);
}
