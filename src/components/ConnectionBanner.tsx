import { useEffect, useState } from "react";
import type { LostConnectionEvent } from "@liveblocks/client";
import {
  useLostConnectionListener,
  useStatus,
} from "@liveblocks/react/suspense";
import { type ConnectionNotice, connectionNotice } from "../lib/connection";
import { Notice, type NoticeTone } from "./ui/Notice";

const RESTORED_NOTICE_MS = 3000;

const NOTICES: Record<ConnectionNotice, { message: string; tone: NoticeTone }> =
  {
    reconnecting: {
      message: "Connection lost. Reconnecting…",
      tone: "warning",
    },
    restored: { message: "Reconnected.", tone: "success" },
    failed: {
      message: "Couldn't reconnect. New comments may not be saved.",
      tone: "error",
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
    <div role="status" aria-live="polite">
      {notice ? (
        <Notice
          tone={NOTICES[notice].tone}
          action={
            notice === "failed"
              ? { label: "Reload", onClick: () => window.location.reload() }
              : undefined
          }
        >
          {NOTICES[notice].message}
        </Notice>
      ) : null}
    </div>
  );
}
