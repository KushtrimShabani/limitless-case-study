import type { LiveblocksErrorContext } from "@liveblocks/client";

export function saveErrorMessage(
  type: LiveblocksErrorContext["type"]
): string | null {
  switch (type) {
    case "CREATE_THREAD_ERROR":
      return "Your comment couldn't be saved. Please try again.";
    case "CREATE_COMMENT_ERROR":
      return "Your reply couldn't be saved. Please try again.";
    default:
      return null;
  }
}
