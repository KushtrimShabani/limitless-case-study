import { buttonStyle } from "../ui/buttonStyle";

export function ImageSkeleton() {
  return (
    <div
      className="image-skeleton"
      role="status"
      aria-label="Loading image"
      style={{ position: "absolute", inset: 0, borderRadius: 4 }}
    />
  );
}

export function ImageLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        background: "#ffffff",
        border: "1px solid #00000020",
        borderRadius: 4,
        color: "#1b1d1c",
        cursor: "default",
      }}
    >
      <span>Couldn&apos;t load the image.</span>
      <button type="button" onClick={onRetry} style={buttonStyle}>
        Retry
      </button>
    </div>
  );
}
