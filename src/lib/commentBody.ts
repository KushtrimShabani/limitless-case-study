import type { CommentBody } from "@liveblocks/client";

export function hasCommentContent(body: CommentBody): boolean {
  return body.content.some((paragraph) =>
    paragraph.children.some((inline) =>
      inline.type === undefined ? inline.text.trim() !== "" : true
    )
  );
}
