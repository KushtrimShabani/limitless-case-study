import { useCallback, useState } from "react";

export type ImageLoadStatus = "loading" | "loaded" | "error";

export function useImageLoad(src: string) {
  const [status, setStatus] = useState<ImageLoadStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  const onLoad = useCallback(() => setStatus("loaded"), []);
  const onError = useCallback(() => setStatus("error"), []);
  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
    setStatus("loading");
  }, []);

  // A new query string bypasses a cached failed response on retry.
  const separator = src.includes("?") ? "&" : "?";
  const currentSrc = attempt === 0 ? src : `${src}${separator}retry=${attempt}`;

  return { status, attempt, src: currentSrc, onLoad, onError, retry };
}
