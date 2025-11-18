/**
 * Pure utility functions for DiceStage component.
 * All functions are side-effect free and deterministic (except where randomness is explicit).
 */

import * as THREE from "three";

// ========================================
// Grid & Layout Utilities
// ========================================

/**
 * Calculate 3D grid positions for arranging items in a centered grid layout.
 *
 * @param count - Number of items to position
 * @param cols - Number of columns in the grid
 * @param cell - Size of each grid cell (spacing between items)
 * @param originX - X-coordinate of the grid center
 * @param originY - Y-coordinate of the first row
 * @returns Array of [x, y, z] position tuples
 */
export function gridPositions(
  count: number,
  cols: number,
  cell: number,
  originX: number,
  originY = 0
): [number, number, number][] {
  const poses: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const rowIndex = Math.floor(i / cols);
    const columnIndex = i % cols;
    const x = originX + (columnIndex - (cols - 1) / 2) * cell;
    const y = originY - rowIndex * cell;
    poses.push([x, y, 0]);
  }
  return poses;
}

/**
 * Calculate the number of rows needed to arrange items in a grid.
 * Always returns at least 1 row.
 *
 * @param itemCount - Number of items to arrange
 * @param cols - Number of columns in the grid
 * @returns Number of rows needed (minimum 1)
 */
export function calculateGridRows(itemCount: number, cols: number): number {
  return Math.max(1, Math.ceil((itemCount || 1) / cols));
}

/**
 * Calculate the total content height based on number of rows.
 *
 * @param rows - Number of rows
 * @param rowPx - Height of each row in pixels
 * @returns Total content height in pixels
 */
export function calculateContentHeight(rows: number, rowPx: number): number {
  return rows * rowPx;
}

/**
 * Calculate effective height clamped to maximum height if provided.
 *
 * @param contentHeight - Desired content height
 * @param maxHeight - Optional maximum height constraint
 * @returns Effective height (clamped if maxHeight provided)
 */
export function calculateEffectiveHeight(
  contentHeight: number,
  maxHeight: number | undefined
): number {
  return maxHeight ? Math.min(contentHeight, maxHeight) : contentHeight;
}

/**
 * Derive orthographic camera zoom from pixel row height and world cell size.
 * This ensures consistent apparent scale of dice regardless of viewport size.
 *
 * @param rowPx - Desired row height in pixels
 * @param cellSize - World-space size of a grid cell
 * @returns Camera zoom factor (pixels per world unit)
 */
export function deriveCameraZoom(rowPx: number, cellSize: number): number {
  return rowPx / cellSize;
}

// ========================================
// Animation Utilities
// ========================================

/**
 * Cubic ease-out function (decelerating to zero velocity).
 * Formula: 1 - (1 - progress)^3
 *
 * @param progress - Progress value from 0 to 1
 * @returns Eased value from 0 to 1
 */
export function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

/**
 * Interpolate between two values with cubic ease-out.
 *
 * @param from - Starting value
 * @param to - Ending value
 * @param progress - Progress from 0 to 1 (linear)
 * @returns Interpolated value with easing applied
 */
export function interpolateHeight(
  from: number,
  to: number,
  progress: number
): number {
  const eased = easeOutCubic(progress);
  return from + (to - from) * eased;
}

// ========================================
// Rotation & Drag Utilities
// ========================================

/**
 * Calculate new rotation values based on pointer drag delta.
 *
 * @param deltaX - Horizontal pointer delta (pixels)
 * @param deltaY - Vertical pointer delta (pixels)
 * @param startRotationX - Initial X rotation (radians)
 * @param startRotationY - Initial Y rotation (radians)
 * @param sensitivity - Rotation sensitivity multiplier
 * @returns New rotation values
 */
export function calculateRotationFromDrag(
  deltaX: number,
  deltaY: number,
  startRotationX: number,
  startRotationY: number,
  sensitivity: number
): { rotationX: number; rotationY: number } {
  return {
    rotationY: startRotationY + deltaX * sensitivity,
    rotationX: startRotationX + deltaY * sensitivity,
  };
}

/**
 * Clamp a rotation value to a min/max range.
 *
 * @param rotation - Rotation value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped rotation value
 */
export function clampRotation(
  rotation: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, rotation));
}

/**
 * Calculate angular velocity from angle change over time.
 * Uses a minimum time delta of 1ms to prevent division by zero.
 *
 * @param currentAngle - Current angle (radians)
 * @param lastAngle - Previous angle (radians)
 * @param deltaTimeMilliseconds - Time elapsed in milliseconds
 * @returns Angular velocity in radians per second
 */
export function calculateAngularVelocity(
  currentAngle: number,
  lastAngle: number,
  deltaTimeMilliseconds: number
): number {
  const deltaTimeSeconds = Math.max(1, deltaTimeMilliseconds) / 1000; // convert to seconds, minimum 1ms
  return (currentAngle - lastAngle) / deltaTimeSeconds;
}

// ========================================
// Spin & Inertia Utilities
// ========================================

/**
 * Generate random spin speeds for dice roll animation.
 * Y-axis spin (primary): 2.2 to 7.8 rad/s
 * X-axis spin (secondary): 0.2 to 1.0 rad/s
 * Both axes get random direction (positive or negative).
 *
 * @returns Object with spinSpeedX (x-axis) and spinSpeedY (y-axis) spin speeds in rad/s
 */
export function generateRandomSpinSpeed(): {
  spinSpeedX: number;
  spinSpeedY: number;
} {
  const directionY = Math.random() < 0.5 ? -1 : 1;
  const directionX = Math.random() < 0.5 ? -1 : 1;
  const spinSpeedY = THREE.MathUtils.lerp(2.2, 7.8, Math.random()) * directionY;
  const spinSpeedX = THREE.MathUtils.lerp(0.2, 1.0, Math.random()) * directionX;
  return { spinSpeedX, spinSpeedY };
}

/**
 * Calculate exponential damping factor for inertia decay.
 * Uses formula: 0.1^delta (decays to ~10% per second).
 *
 * @param delta - Time delta in seconds
 * @returns Damping factor to multiply velocity by
 */
export function calculateDampingFactor(delta: number): number {
  return Math.pow(0.1, delta);
}

/**
 * Apply damping factor to a velocity value.
 *
 * @param velocity - Current velocity
 * @param dampFactor - Damping factor (0-1)
 * @returns Damped velocity
 */
export function applyDamping(velocity: number, dampFactor: number): number {
  return velocity * dampFactor;
}

/**
 * Determine if inertia should stop based on velocity threshold.
 * Stops when both absolute velocities are at or below the threshold.
 *
 * @param velocityX - X-axis velocity
 * @param velocityY - Y-axis velocity
 * @param threshold - Minimum velocity to continue (absolute value)
 * @returns True if inertia should stop
 */
export function shouldStopInertia(
  velocityX: number,
  velocityY: number,
  threshold: number
): boolean {
  return Math.abs(velocityX) <= threshold && Math.abs(velocityY) <= threshold;
}
