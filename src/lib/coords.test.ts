import { describe, expect, it } from "vitest";
import {
  DOM_DELTA_LINE,
  THREAD_FLIP_MARGIN,
  THREAD_WIDTH,
  WHEEL_LINE_HEIGHT,
  WHEEL_MAX_STEP,
} from "./constants";
import {
  clampToImage,
  clientToImage,
  threadSide,
  wheelZoomFactor,
  zoomAtPoint,
  type CanvasTransform,
  type ImageRect,
  type Point,
} from "./coords";

const DOM_DELTA_PIXEL = 0;
const PAGE_HEIGHT = 800;
const SPACE_NEEDED = THREAD_WIDTH + THREAD_FLIP_MARGIN;

const RECT_AT_SCALE_1: ImageRect = {
  left: 100,
  top: 50,
  width: 400,
  height: 200,
};

describe("clientToImage", () => {
  it("converts client coordinates from an image rendered at scale 1", () => {
    const rect = RECT_AT_SCALE_1;
    const clientX = rect.left + rect.width * 0.25;
    const clientY = rect.top + rect.height * 0.5;

    expect(clientToImage(clientX, clientY, rect)).toEqual({ x: 0.25, y: 0.5 });
  });

  it("converts client coordinates from an image rendered at scale 3", () => {
    const rect: ImageRect = {
      left: -200,
      top: 30,
      width: RECT_AT_SCALE_1.width * 3,
      height: RECT_AT_SCALE_1.height * 3,
    };
    const clientX = rect.left + rect.width * 0.25;
    const clientY = rect.top + rect.height * 0.5;

    expect(clientToImage(clientX, clientY, rect)).toEqual({ x: 0.25, y: 0.5 });
  });

  it("returns null for an image with no size", () => {
    const rect = { ...RECT_AT_SCALE_1, width: 0 };

    expect(clientToImage(150, 100, rect)).toBeNull();
  });
});

describe("clampToImage", () => {
  it.each([
    { point: { x: 1.4, y: -0.2 }, expected: { x: 1, y: 0 } },
    { point: { x: -3, y: 2 }, expected: { x: 0, y: 1 } },
    { point: { x: 0, y: 1 }, expected: { x: 0, y: 1 } },
    { point: { x: 0.3, y: 0.7 }, expected: { x: 0.3, y: 0.7 } },
  ])(
    "maps ($point.x, $point.y) to ($expected.x, $expected.y)",
    ({ point, expected }) => {
      expect(clampToImage(point)).toEqual(expected);
    }
  );
});

describe("zoomAtPoint", () => {
  it("keeps the cursor point fixed while zooming in", () => {
    const transform = { x: 40, y: -20, scale: 1 };
    const cursor = { x: 260, y: 140 };

    const next = zoomAtPoint(transform, cursor.x, cursor.y, 2.5);

    expect(next.scale).toBe(2.5);
    expectSamePoint(
      pointAtCursor(next, cursor),
      pointAtCursor(transform, cursor)
    );
  });

  it("keeps the cursor point fixed when zoom is clamped", () => {
    const transform = { x: -120, y: 75, scale: 3 };
    const cursor = { x: 180, y: 225 };

    const next = zoomAtPoint(transform, cursor.x, cursor.y, 2);

    expect(next.scale).toBe(4);
    expectSamePoint(
      pointAtCursor(next, cursor),
      pointAtCursor(transform, cursor)
    );
  });
});

describe("threadSide", () => {
  it("opens left near the image's right edge, even with room in the viewport", () => {
    const imageRight = 1000;
    const viewportRight = 1400;
    const pinRight = imageRight - SPACE_NEEDED + 1;

    expect(threadSide(pinRight, imageRight, viewportRight)).toBe("left");
  });

  it("opens left near the viewport's right edge when the image extends past it", () => {
    const imageRight = 1600;
    const viewportRight = 1000;
    const pinRight = viewportRight - SPACE_NEEDED + 1;

    expect(threadSide(pinRight, imageRight, viewportRight)).toBe("left");
  });

  it("opens right when both edges leave enough room", () => {
    const imageRight = 1000;
    const viewportRight = 1400;
    const pinRight = imageRight - SPACE_NEEDED;

    expect(threadSide(pinRight, imageRight, viewportRight)).toBe("right");
  });
});

describe("wheelZoomFactor", () => {
  it("treats a line delta as WHEEL_LINE_HEIGHT pixels", () => {
    expect(wheelZoomFactor(3, DOM_DELTA_LINE, PAGE_HEIGHT)).toBeCloseTo(
      wheelZoomFactor(3 * WHEEL_LINE_HEIGHT, DOM_DELTA_PIXEL, PAGE_HEIGHT)
    );
  });

  it("zooms in on scroll up and out on scroll down by the same factor", () => {
    const zoomIn = wheelZoomFactor(-100, DOM_DELTA_PIXEL, PAGE_HEIGHT);
    const zoomOut = wheelZoomFactor(100, DOM_DELTA_PIXEL, PAGE_HEIGHT);

    expect(zoomIn).toBeGreaterThan(1);
    expect(zoomIn * zoomOut).toBeCloseTo(1);
  });

  it("caps a single event at WHEEL_MAX_STEP in both directions", () => {
    expect(wheelZoomFactor(-10_000, DOM_DELTA_PIXEL, PAGE_HEIGHT)).toBe(
      WHEEL_MAX_STEP
    );
    expect(wheelZoomFactor(10_000, DOM_DELTA_PIXEL, PAGE_HEIGHT)).toBe(
      1 / WHEEL_MAX_STEP
    );
  });
});

function pointAtCursor(transform: CanvasTransform, cursor: Point): Point {
  return {
    x: (cursor.x - transform.x) / transform.scale,
    y: (cursor.y - transform.y) / transform.scale,
  };
}

function expectSamePoint(actual: Point, expected: Point): void {
  expect(actual.x).toBeCloseTo(expected.x);
  expect(actual.y).toBeCloseTo(expected.y);
}
