import type { LostConnectionEvent, Status } from "@liveblocks/client";

export type ConnectionNotice = "reconnecting" | "restored" | "failed";

export function connectionNotice(
  status: Status,
  lastEvent: LostConnectionEvent | null
): ConnectionNotice | null {
  if (status === "disconnected" || lastEvent === "failed") {
    return "failed";
  }
  if (
    status === "reconnecting" ||
    (lastEvent === "lost" && status !== "connected")
  ) {
    return "reconnecting";
  }
  if (lastEvent === "restored") {
    return "restored";
  }
  return null;
}
