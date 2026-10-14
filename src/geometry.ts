/**
 * Plain geometry behind the Realign Connectors command
 */

interface IPoint {
  x: number;
  y: number;
}

interface IBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Estimate the width a text annotation needs: ~7px per character,
 * min 100px, max 400px
 */
export function estimateAnnotationWidth(text: string): number {
  return Math.max(100, Math.min(400, text.length * 7));
}

/**
 * Get the center point of a shape
 */
export function getShapeCenter(shape: IBox): IPoint {
  return {
    x: shape.x + shape.width / 2,
    y: shape.y + shape.height / 2
  };
}

/**
 * Check if a point is on the boundary of a shape (within tolerance)
 */
export function isPointOnBoundary(
  point: IPoint,
  shape: IBox,
  tolerance: number = 5
): boolean {
  const { x, y, width, height } = shape;
  const left = x;
  const right = x + width;
  const top = y;
  const bottom = y + height;

  // Check if point is within shape bounds (with tolerance)
  const withinX = point.x >= left - tolerance && point.x <= right + tolerance;
  const withinY = point.y >= top - tolerance && point.y <= bottom + tolerance;

  if (!withinX || !withinY) {
    return false;
  }

  // Check if point is on one of the edges (within tolerance)
  const onLeft = Math.abs(point.x - left) <= tolerance;
  const onRight = Math.abs(point.x - right) <= tolerance;
  const onTop = Math.abs(point.y - top) <= tolerance;
  const onBottom = Math.abs(point.y - bottom) <= tolerance;

  return onLeft || onRight || onTop || onBottom;
}

/**
 * Calculate intersection point on shape border along line from inside to outside
 */
export function getBorderIntersection(
  shape: IBox,
  inside: IPoint,
  outside: IPoint
): IPoint {
  const { x, y, width, height } = shape;

  // Shape bounds
  const left = x;
  const right = x + width;
  const top = y;
  const bottom = y + height;

  // Direction vector from inside to outside
  const dx = outside.x - inside.x;
  const dy = outside.y - inside.y;

  // Handle zero-length direction
  if (dx === 0 && dy === 0) {
    return { x: inside.x, y: top }; // Default to top center
  }

  // Calculate intersection with each edge
  const intersections: Array<{ x: number; y: number; t: number }> = [];

  // Left edge (x = left)
  if (dx !== 0) {
    const t = (left - inside.x) / dx;
    const iy = inside.y + t * dy;
    if (t > 0 && iy >= top && iy <= bottom) {
      intersections.push({ x: left, y: iy, t });
    }
  }

  // Right edge (x = right)
  if (dx !== 0) {
    const t = (right - inside.x) / dx;
    const iy = inside.y + t * dy;
    if (t > 0 && iy >= top && iy <= bottom) {
      intersections.push({ x: right, y: iy, t });
    }
  }

  // Top edge (y = top)
  if (dy !== 0) {
    const t = (top - inside.y) / dy;
    const ix = inside.x + t * dx;
    if (t > 0 && ix >= left && ix <= right) {
      intersections.push({ x: ix, y: top, t });
    }
  }

  // Bottom edge (y = bottom)
  if (dy !== 0) {
    const t = (bottom - inside.y) / dy;
    const ix = inside.x + t * dx;
    if (t > 0 && ix >= left && ix <= right) {
      intersections.push({ x: ix, y: bottom, t });
    }
  }

  // Return intersection with smallest positive t (closest to inside point)
  if (intersections.length > 0) {
    intersections.sort((a, b) => a.t - b.t);
    return { x: intersections[0].x, y: intersections[0].y };
  }

  // Fallback: return center of closest edge
  return { x: inside.x, y: top };
}
