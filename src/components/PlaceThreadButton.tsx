import { useEffect, useState } from "react";
import { CommentPin } from "@liveblocks/react-ui";

type PlaceThreadButtonProps = {
  isPlacing: boolean;
  onStart: () => void;
  /** Raw click position in client coordinates; the parent converts it. */
  onPlace: (clientX: number, clientY: number) => void;
  onCancel: () => void;
};

// "+" button that enters placing mode, plus the overlay that captures the
// click where the new thread should go.
export function PlaceThreadButton({
  isPlacing,
  onStart,
  onPlace,
  onCancel,
}: PlaceThreadButtonProps) {
  return (
    <>
      <div style={{ position: "absolute", top: 12, right: 12 }}>
        <button
          onClick={onStart}
          style={{
            cursor: isPlacing ? "none" : undefined,
            background: "#ffffff",
            border: "1px solid #00000030",
            borderRadius: 8,
            width: 36,
            height: 36,
            fontSize: 24,
          }}
        >
          +
        </button>
      </div>

      {/* Overlay that captures the placing click; right-click cancels */}
      {isPlacing ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.2)",
            cursor: "none",
          }}
          onClick={(e) => onPlace(e.clientX, e.clientY)}
          onContextMenu={(e) => {
            e.preventDefault();
            onCancel();
          }}
        >
          <NewThreadCursor />
        </div>
      ) : null}
    </>
  );
}

// Render the new thread component over the current user's cursor
function NewThreadCursor() {
  const [coords, setCoords] = useState({
    x: -10000,
    y: -10000,
  });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setCoords({
        x: e.clientX,
        y: e.clientY,
      });
    };

    document.addEventListener("mousemove", updatePosition, false);
    document.addEventListener("mouseenter", updatePosition, false);

    return () => {
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseenter", updatePosition);
    };
  }, []);

  return (
    <CommentPin
      corner="top-left"
      style={{
        cursor: "none",
        position: "fixed",
        top: 0,
        left: 0,
        transform: `translate(${coords.x}px, ${coords.y}px)`,
        zIndex: 99999999999,
      }}
    />
  );
}
