// Liveblocks only reports failed saves to useErrorListener when they are
// HTTP errors; a network failure ("Failed to fetch") is re-thrown and ends
// up as an unhandled rejection. Turning it into a 503 response makes it go
// through the same error path as any other failed save.
export async function liveblocksFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    return new Response(null, {
      status: 503,
      statusText: "Network request failed",
    });
  }
}
