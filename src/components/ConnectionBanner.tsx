import { useEffect, useState } from "react";
import type { LostConnectionEvent } from "@liveblocks/client";
import {
  useLostConnectionListener,
  useStatus,
} from "@liveblocks/react/suspense";
import { type ConnectionNotice, connectionNotice } from "../lib/connection";
import { buttonStyle } from "./ui/buttonStyle";

const RESTORED_NOTICE_MS = 3000;

const NOTICES: Record<
  ConnectionNotice,
  { message: string; background: string }
> = {
  reconnecting: {
    message: "Connection lost. Reconnecting…",
    background: "#fdf0d2",
  },
  restored: { message: "Reconnected.", background: "#dcefe7" },
  failed: {
    message: "Couldn't reconnect. New comments may not be saved.",
    background: "#fbe1dd",
  },
};

export function ConnectionBanner() {
  const status = useStatus();
  const [lastEvent, setLastEvent] = useState<LostConnectionEvent | null>(null);
  useLostConnectionListener(setLastEvent);

  useEffect(() => {
    if (lastEvent !== "restored") {
      return;
    }
    const timeout = setTimeout(() => setLastEvent(null), RESTORED_NOTICE_MS);
    return () => clearTimeout(timeout);
  }, [lastEvent]);

  const notice = connectionNotice(status, lastEvent);

  // The live region stays mounted so screen readers announce changes.
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
      }}
    >
      {notice ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 14px",
            background: NOTICES[notice].background,
            border: "1px solid #00000020",
            borderRadius: 8,
            fontSize: 14,
            color: "#1b1d1c",
          }}
        >
          {NOTICES[notice].message}
          {notice === "failed" ? (
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={buttonStyle}
            >
              Reload
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
