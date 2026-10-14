import {
  estimateAnnotationWidth,
  getBorderIntersection,
  getShapeCenter,
  isPointOnBoundary
} from '../geometry';

const box = { x: 100, y: 50, width: 200, height: 100 };

describe('estimateAnnotationWidth', () => {
  it('gives 7 px per character', () => {
    expect(estimateAnnotationWidth('a'.repeat(30))).toBe(210);
  });

  it('never goes below 100 px', () => {
    expect(estimateAnnotationWidth('')).toBe(100);
    expect(estimateAnnotationWidth('a'.repeat(14))).toBe(100);
  });

  it('never goes above 400 px', () => {
    expect(estimateAnnotationWidth('a'.repeat(100))).toBe(400);
  });
});

describe('getShapeCenter', () => {
  it('returns the middle of the bounds', () => {
    expect(getShapeCenter(box)).toEqual({ x: 200, y: 100 });
  });
});

describe('isPointOnBoundary', () => {
  it('accepts a point on each edge', () => {
    expect(isPointOnBoundary({ x: 100, y: 80 }, box)).toBe(true);
    expect(isPointOnBoundary({ x: 300, y: 80 }, box)).toBe(true);
    expect(isPointOnBoundary({ x: 150, y: 50 }, box)).toBe(true);
    expect(isPointOnBoundary({ x: 150, y: 150 }, box)).toBe(true);
  });

  it('accepts a point 5 px off an edge, not 6 px', () => {
    expect(isPointOnBoundary({ x: 95, y: 80 }, box)).toBe(true);
    expect(isPointOnBoundary({ x: 94, y: 80 }, box)).toBe(false);
    expect(isPointOnBoundary({ x: 106, y: 80 }, box)).toBe(false);
  });

  it('rejects the inside and points beyond the corners', () => {
    expect(isPointOnBoundary({ x: 200, y: 100 }, box)).toBe(false);
    expect(isPointOnBoundary({ x: 100, y: 200 }, box)).toBe(false);
  });
});

describe('getBorderIntersection', () => {
  const center = getShapeCenter(box);

  it('hits the right edge for a target to the right', () => {
    expect(getBorderIntersection(box, center, { x: 500, y: 100 })).toEqual({
      x: 300,
      y: 100
    });
  });

  it('hits the left edge for a target to the left', () => {
    expect(getBorderIntersection(box, center, { x: 0, y: 100 })).toEqual({
      x: 100,
      y: 100
    });
  });

  it('hits the top edge for a target above', () => {
    expect(getBorderIntersection(box, center, { x: 200, y: -100 })).toEqual({
      x: 200,
      y: 50
    });
  });

  it('hits the bottom edge for a target below', () => {
    expect(getBorderIntersection(box, center, { x: 200, y: 400 })).toEqual({
      x: 200,
      y: 150
    });
  });

  it('hits the nearer edge on a diagonal', () => {
    // direction (400, 100): reaches x = 300 at t = 0.25, before y = 150 at t = 0.5
    expect(getBorderIntersection(box, center, { x: 600, y: 200 })).toEqual({
      x: 300,
      y: 125
    });
  });

  it('falls back to the top centre when both points coincide', () => {
    expect(getBorderIntersection(box, center, center)).toEqual({
      x: 200,
      y: 50
    });
  });
});
