import { describe, expect, it, vi } from "vitest";
import {
  applyDamping,
  calculateAngularVelocity,
  calculateContentHeight,
  calculateDampingFactor,
  calculateEffectiveHeight,
  calculateGridRows,
  calculateRotationFromDrag,
  clampRotation,
  deriveCameraZoom,
  easeOutCubic,
  generateRandomSpinSpeed,
  gridPositions,
  interpolateHeight,
  shouldStopInertia,
} from "./DiceStage.utils";

describe("DiceStage.utils", () => {
  // ========================================
  // Grid & Layout Utilities
  // ========================================
  describe("gridPositions", () => {
    // AC1: Should calculate correct grid positions for single item
    it("should position single item centered in grid", () => {
      const result = gridPositions(1, 5, 2.4, 0, 0);
      expect(result).toHaveLength(1);
      // Single item at index 0 in 5-col grid: (0 - (5-1)/2) * 2.4 = -4.8
      expect(result[0]).toEqual([-4.8, 0, 0]);
    });

    // AC2: Should arrange items in centered grid
    it("should arrange 5 items in single row centered around originX", () => {
      const result = gridPositions(5, 5, 2.4, 0, 0);
      expect(result).toHaveLength(5);
      // Items should be centered: indices 0-4 with cols=5 means positions -2, -1, 0, 1, 2 relative
      expect(result[0][0]).toBeCloseTo(-4.8); // (0 - 4/2) * 2.4 = -4.8
      expect(result[2][0]).toBeCloseTo(0); // center item
      expect(result[4][0]).toBeCloseTo(4.8); // (2) * 2.4 = 4.8
      // All in same row (y=0)
      expect(result[0][1]).toBe(0);
      expect(result[4][1]).toBe(0);
    });

    // AC3: Should arrange items in multiple rows
    it("should arrange 10 items in 2 rows", () => {
      const result = gridPositions(10, 5, 2.4, 0, 10);
      expect(result).toHaveLength(10);
      // First row (items 0-4) at y=10
      expect(result[0][1]).toBe(10);
      expect(result[4][1]).toBe(10);
      // Second row (items 5-9) at y=10-2.4=7.6
      expect(result[5][1]).toBe(10 - 2.4);
      expect(result[9][1]).toBe(10 - 2.4);
    });

    // AC4: Should handle custom originX
    it("should offset all x positions by originX", () => {
      const result = gridPositions(3, 5, 2.4, 5, 0);
      // Item at index 1 in 5-col grid: originX + (1 - (5-1)/2) * 2.4 = 5 + (-1) * 2.4 = 2.6
      expect(result[1][0]).toBeCloseTo(2.6);
    });

    // AC5: All z positions should be 0
    it("should set all z positions to 0", () => {
      const result = gridPositions(6, 3, 2.4, 0, 0);
      result.forEach((pos) => {
        expect(pos[2]).toBe(0);
      });
    });
  });

  describe("calculateGridRows", () => {
    // AC1: Should return 1 for empty or single item
    it("should return 1 row for 0 items", () => {
      expect(calculateGridRows(0, 5)).toBe(1);
    });

    it("should return 1 row for 1 item", () => {
      expect(calculateGridRows(1, 5)).toBe(1);
    });

    // AC2: Should calculate correct number of rows
    it("should return 1 row for items equal to column count", () => {
      expect(calculateGridRows(5, 5)).toBe(1);
    });

    it("should return 2 rows for 6 items with 5 columns", () => {
      expect(calculateGridRows(6, 5)).toBe(2);
    });

    it("should return 3 rows for 11 items with 5 columns", () => {
      expect(calculateGridRows(11, 5)).toBe(3);
    });

    // AC3: Should handle exact multiples
    it("should return exact rows for perfect multiple", () => {
      expect(calculateGridRows(10, 5)).toBe(2);
      expect(calculateGridRows(15, 5)).toBe(3);
    });
  });

  describe("calculateContentHeight", () => {
    // AC1: Should multiply rows by rowPx
    it("should calculate height for single row", () => {
      expect(calculateContentHeight(1, 120)).toBe(120);
    });

    it("should calculate height for multiple rows", () => {
      expect(calculateContentHeight(3, 120)).toBe(360);
    });

    // AC2: Should handle fractional rowPx
    it("should handle fractional pixel values", () => {
      expect(calculateContentHeight(2, 100.5)).toBe(201);
    });
  });

  describe("calculateEffectiveHeight", () => {
    // AC1: Should return contentHeight when no maxHeight
    it("should return contentHeight when maxHeight is undefined", () => {
      expect(calculateEffectiveHeight(300, undefined)).toBe(300);
    });

    // AC2: Should clamp to maxHeight
    it("should return maxHeight when content exceeds it", () => {
      expect(calculateEffectiveHeight(500, 300)).toBe(300);
    });

    // AC3: Should return contentHeight when under maxHeight
    it("should return contentHeight when under maxHeight", () => {
      expect(calculateEffectiveHeight(200, 300)).toBe(200);
    });

    // AC4: Should handle equal values
    it("should handle contentHeight equal to maxHeight", () => {
      expect(calculateEffectiveHeight(300, 300)).toBe(300);
    });
  });

  describe("deriveCameraZoom", () => {
    // AC1: Should calculate zoom as rowPx / cellSize
    it("should derive zoom from rowPx and cellSize", () => {
      expect(deriveCameraZoom(120, 2.4)).toBeCloseTo(50);
    });

    it("should handle different values", () => {
      expect(deriveCameraZoom(240, 2.4)).toBeCloseTo(100);
      expect(deriveCameraZoom(60, 2.4)).toBeCloseTo(25);
    });

    // AC2: Should handle fractional results
    it("should return fractional zoom values", () => {
      expect(deriveCameraZoom(100, 2.4)).toBeCloseTo(41.667, 1);
    });
  });

  // ========================================
  // Animation Utilities
  // ========================================
  describe("easeOutCubic", () => {
    // AC1: Should return 0 at t=0
    it("should return 0 at start (t=0)", () => {
      expect(easeOutCubic(0)).toBe(0);
    });

    // AC2: Should return 1 at t=1
    it("should return 1 at end (t=1)", () => {
      expect(easeOutCubic(1)).toBe(1);
    });

    // AC3: Should ease out (slow at end)
    it("should ease out with cubic function", () => {
      // At progress=0.5, easeOutCubic should be > 0.5 (accelerated early, slower later)
      const mid = easeOutCubic(0.5);
      expect(mid).toBeGreaterThan(0.5);
      expect(mid).toBeCloseTo(0.875, 2); // 1 - (1-0.5)^3 = 1 - 0.125 = 0.875
    });

    // AC4: Should handle values between 0 and 1
    it("should produce values between 0 and 1 for input 0-1", () => {
      for (let progress = 0; progress <= 1; progress += 0.1) {
        const result = easeOutCubic(progress);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("interpolateHeight", () => {
    // AC1: Should return from value when progress is 0
    it("should return from value at progress=0", () => {
      expect(interpolateHeight(100, 200, 0)).toBe(100);
    });

    // AC2: Should return to value when progress is 1
    it("should return to value at progress=1", () => {
      expect(interpolateHeight(100, 200, 1)).toBe(200);
    });

    // AC3: Should interpolate with easing
    it("should interpolate with easeOutCubic at progress=0.5", () => {
      // easeOutCubic(0.5) = 0.875
      // 100 + (200-100) * 0.875 = 187.5
      expect(interpolateHeight(100, 200, 0.5)).toBeCloseTo(187.5, 1);
    });

    // AC4: Should handle reverse interpolation (from > to)
    it("should handle from > to", () => {
      expect(interpolateHeight(200, 100, 0)).toBe(200);
      expect(interpolateHeight(200, 100, 1)).toBe(100);
    });
  });

  // ========================================
  // Rotation & Drag Utilities
  // ========================================
  describe("calculateRotationFromDrag", () => {
    // AC1: Should calculate rotation based on drag delta
    it("should increase Y rotation for positive X drag", () => {
      const result = calculateRotationFromDrag(100, 0, 0, 0, 0.01);
      expect(result.rotationY).toBeCloseTo(1); // 100 * 0.01
      expect(result.rotationX).toBeCloseTo(0);
    });

    it("should increase X rotation for positive Y drag", () => {
      const result = calculateRotationFromDrag(0, 100, 0, 0, 0.01);
      expect(result.rotationX).toBeCloseTo(1); // 100 * 0.01
      expect(result.rotationY).toBeCloseTo(0);
    });

    // AC2: Should add to start rotation
    it("should add delta to start rotation", () => {
      const result = calculateRotationFromDrag(50, 50, 0.5, 0.3, 0.01);
      expect(result.rotationY).toBeCloseTo(0.8); // 0.3 + 50*0.01
      expect(result.rotationX).toBeCloseTo(1.0); // 0.5 + 50*0.01
    });

    // AC3: Should handle negative drag
    it("should handle negative drag values", () => {
      const result = calculateRotationFromDrag(-100, -50, 0, 0, 0.01);
      expect(result.rotationY).toBeCloseTo(-1);
      expect(result.rotationX).toBeCloseTo(-0.5);
    });

    // AC4: Should respect sensitivity parameter
    it("should scale by sensitivity", () => {
      const result = calculateRotationFromDrag(100, 100, 0, 0, 0.02);
      expect(result.rotationY).toBeCloseTo(2);
      expect(result.rotationX).toBeCloseTo(2);
    });
  });

  describe("clampRotation", () => {
    // AC1: Should clamp to max
    it("should clamp value above max", () => {
      expect(clampRotation(2, -1.2, 1.2)).toBe(1.2);
    });

    // AC2: Should clamp to min
    it("should clamp value below min", () => {
      expect(clampRotation(-2, -1.2, 1.2)).toBe(-1.2);
    });

    // AC3: Should not clamp values within range
    it("should not change value within range", () => {
      expect(clampRotation(0.5, -1.2, 1.2)).toBe(0.5);
      expect(clampRotation(-0.5, -1.2, 1.2)).toBe(-0.5);
      expect(clampRotation(0, -1.2, 1.2)).toBe(0);
    });

    // AC4: Should handle boundary values
    it("should preserve exact min/max values", () => {
      expect(clampRotation(1.2, -1.2, 1.2)).toBe(1.2);
      expect(clampRotation(-1.2, -1.2, 1.2)).toBe(-1.2);
    });
  });

  describe("calculateAngularVelocity", () => {
    // AC1: Should calculate velocity in radians per second
    it("should calculate velocity for positive rotation", () => {
      // 1 radian change over 100ms = 10 rad/s
      expect(calculateAngularVelocity(1, 0, 100)).toBeCloseTo(10);
    });

    it("should calculate velocity for negative rotation", () => {
      // -0.5 radian change over 100ms = -5 rad/s
      expect(calculateAngularVelocity(0, 0.5, 100)).toBeCloseTo(-5);
    });

    // AC2: Should handle different time deltas
    it("should scale by time delta", () => {
      // 1 radian over 1000ms = 1 rad/s
      expect(calculateAngularVelocity(1, 0, 1000)).toBeCloseTo(1);
      // 1 radian over 50ms = 20 rad/s
      expect(calculateAngularVelocity(1, 0, 50)).toBeCloseTo(20);
    });

    // AC3: Should handle zero velocity
    it("should return 0 for no change", () => {
      expect(calculateAngularVelocity(1, 1, 100)).toBe(0);
    });

    // AC4: Should prevent division by zero with minimum time
    it("should use minimum 1ms to prevent division by zero", () => {
      expect(calculateAngularVelocity(1, 0, 0)).toBeCloseTo(1000); // 1 rad / 0.001s
    });
  });

  // ========================================
  // Spin & Inertia Utilities
  // ========================================
  describe("generateRandomSpinSpeed", () => {
    // Mock Math.random for deterministic tests
    it("should generate spin speeds within expected ranges", () => {
      // Mock random to return 0.5 for mid-range values
      const mockRandom = vi.spyOn(Math, "random");
      mockRandom.mockReturnValueOnce(0.5); // directionY
      mockRandom.mockReturnValueOnce(0.5); // directionX
      mockRandom.mockReturnValueOnce(0.5); // spinSpeedY magnitude
      mockRandom.mockReturnValueOnce(0.5); // spinSpeedX magnitude

      const result = generateRandomSpinSpeed();

      // spinSpeedY should be in range [2.2, 7.8], lerp(2.2, 7.8, 0.5) = 5.0
      expect(Math.abs(result.spinSpeedY)).toBeCloseTo(5.0, 1);
      // spinSpeedX should be in range [0.2, 1.0], lerp(0.2, 1.0, 0.5) = 0.6
      expect(Math.abs(result.spinSpeedX)).toBeCloseTo(0.6, 1);

      mockRandom.mockRestore();
    });

    it("should generate random directions", () => {
      const results = [];
      for (let i = 0; i < 20; i++) {
        results.push(generateRandomSpinSpeed());
      }

      // Should have mix of positive and negative values
      const positiveSpinSpeedY = results.filter(
        (result) => result.spinSpeedY > 0
      ).length;
      const positiveSpinSpeedX = results.filter(
        (result) => result.spinSpeedX > 0
      ).length;

      // With 20 samples, should have some variety (not all same sign)
      expect(positiveSpinSpeedY).toBeGreaterThan(0);
      expect(positiveSpinSpeedY).toBeLessThan(20);
      expect(positiveSpinSpeedX).toBeGreaterThan(0);
      expect(positiveSpinSpeedX).toBeLessThan(20);
    });
  });

  describe("calculateDampingFactor", () => {
    // AC1: Should calculate exponential damping (0.1^delta)
    it("should calculate damping for 1 second", () => {
      expect(calculateDampingFactor(1)).toBeCloseTo(0.1);
    });

    it("should calculate damping for 0.5 seconds", () => {
      // 0.1^0.5 ≈ 0.316
      expect(calculateDampingFactor(0.5)).toBeCloseTo(0.316, 2);
    });

    // AC2: Should approach 1 for very small delta
    it("should approach 1 for very small delta", () => {
      expect(calculateDampingFactor(0.01)).toBeCloseTo(0.977, 2);
    });

    // AC3: Should approach 0 for large delta
    it("should approach 0 for large delta", () => {
      expect(calculateDampingFactor(2)).toBeCloseTo(0.01);
    });
  });

  describe("applyDamping", () => {
    // AC1: Should multiply velocity by damping factor
    it("should reduce velocity by damping factor", () => {
      expect(applyDamping(10, 0.5)).toBeCloseTo(5);
      expect(applyDamping(5, 0.1)).toBeCloseTo(0.5);
    });

    // AC2: Should preserve sign
    it("should preserve velocity sign", () => {
      expect(applyDamping(-10, 0.5)).toBeCloseTo(-5);
      expect(applyDamping(-5, 0.1)).toBeCloseTo(-0.5);
    });

    // AC3: Should handle zero velocity
    it("should handle zero velocity", () => {
      expect(applyDamping(0, 0.5)).toBe(0);
    });
  });

  describe("shouldStopInertia", () => {
    // AC1: Should stop when both velocities below threshold
    it("should return true when both velocities below threshold", () => {
      expect(shouldStopInertia(0.005, 0.005, 0.01)).toBe(true);
    });

    // AC2: Should continue when either velocity above threshold
    it("should return false when velocityX above threshold", () => {
      expect(shouldStopInertia(0.02, 0.005, 0.01)).toBe(false);
    });

    it("should return false when velocityY above threshold", () => {
      expect(shouldStopInertia(0.005, 0.02, 0.01)).toBe(false);
    });

    it("should return false when both above threshold", () => {
      expect(shouldStopInertia(0.02, 0.03, 0.01)).toBe(false);
    });

    // AC3: Should handle negative velocities (use absolute value)
    it("should use absolute values for comparison", () => {
      expect(shouldStopInertia(-0.005, -0.005, 0.01)).toBe(true);
      expect(shouldStopInertia(-0.02, 0.005, 0.01)).toBe(false);
    });

    // AC4: Should handle exact threshold values
    it("should return true at exact threshold", () => {
      expect(shouldStopInertia(0.01, 0.01, 0.01)).toBe(true);
    });
  });
});
