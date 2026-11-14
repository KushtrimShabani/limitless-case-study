import type { FallbackProps } from "react-error-boundary";
import { buttonStyle } from "./ui/buttonStyle";

export function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div
      className="error"
      role="alert"
      style={{ flexDirection: "column", gap: 12 }}
    >
      <span>Couldn&apos;t load the comments.</span>
      <button type="button" onClick={resetErrorBoundary} style={buttonStyle}>
        Retry
      </button>
    </div>
  );
}
