import { useState } from "react";
import { useErrorListener } from "@liveblocks/react";
import { saveErrorMessage } from "../lib/saveError";
import { Notice } from "./ui/Notice";

export function SaveErrorNotice() {
  const [message, setMessage] = useState<string | null>(null);

  useErrorListener((error) => {
    const next = saveErrorMessage(error.context.type);
    if (next) {
      setMessage(next);
    }
  });

  return (
    <div role="alert">
      {message ? (
        <Notice
          tone="error"
          action={{ label: "Dismiss", onClick: () => setMessage(null) }}
        >
          {message}
        </Notice>
      ) : null}
    </div>
  );
}
