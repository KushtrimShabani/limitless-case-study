declare global {
  interface Liveblocks {
    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string; // Accessible through `user.id`
      info: {
        name: string;
        avatar: string;
      }; // Accessible through `user.info`
    };
    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    // x/y are the pin's anchor, normalized to the image (see src/lib/coords.ts):
    // 0 = left/top edge, 1 = right/bottom edge. Never screen pixels.
    ThreadMetadata: {
      x: number;
      y: number;
      zIndex: number;
    };
  }
}

export {};
