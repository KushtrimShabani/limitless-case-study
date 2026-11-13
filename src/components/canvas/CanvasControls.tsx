import type { CSSProperties } from "react";
import { MAX_SCALE, MIN_SCALE } from "../../lib/constants";

type CanvasControlsProps = {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

const buttonStyle: CSSProperties = {
  minWidth: 32,
  height: 32,
  padding: "0 8px",
  background: "transparent",
  border: "none",
  borderRadius: 6,
  fontSize: 16,
  cursor: "pointer",
};

export function CanvasControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}: CanvasControlsProps) {
  return (
    <div
      data-canvas-pan-ignore
      role="toolbar"
      aria-label="Zoom"
      style={{
        position: "absolute",
        left: 12,
        bottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: 2,
        background: "#ffffff",
        border: "1px solid #00000030",
        borderRadius: 8,
        cursor: "default",
      }}
    >
      <button
        type="button"
        aria-label="Zoom out"
        onClick={onZoomOut}
        disabled={scale <= MIN_SCALE}
        style={buttonStyle}
      >
        −
      </button>
      <span
        style={{
          minWidth: 48,
          textAlign: "center",
          fontSize: 13,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {Math.round(scale * 100)}%
      </span>
      <button
        type="button"
        aria-label="Zoom in"
        onClick={onZoomIn}
        disabled={scale >= MAX_SCALE}
        style={buttonStyle}
      >
        +
      </button>
      <button
        type="button"
        onClick={onReset}
        style={{ ...buttonStyle, fontSize: 13 }}
      >
        Reset
      </button>
    </div>
  );
}
