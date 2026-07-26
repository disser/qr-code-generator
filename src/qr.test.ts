import { describe, expect, it } from 'vitest';
import { calculateLogoModules, calculateCoverCrop } from './qr';

describe('calculateLogoModules', () => {
  it('uses a positive whole-module value capped at 15%', () => {
    for (const count of [21, 25, 57, 177]) {
      const result = calculateLogoModules(count);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result % 1).toBe(0);
      expect(result).toBeLessThanOrEqual(Math.floor(count * 0.15));
    }
  });
  it('calculates a centered cover crop for non-square logos', () => {
    expect(calculateCoverCrop(1600, 800)).toEqual({ sourceX: 400, sourceY: 0, sourceSize: 800 });
    expect(calculateCoverCrop(800, 1600)).toEqual({ sourceX: 0, sourceY: 400, sourceSize: 800 });
    expect(calculateCoverCrop(500, 500)).toEqual({ sourceX: 0, sourceY: 0, sourceSize: 500 });
  });
  it('handles invalid module counts conservatively', () => {
    expect(calculateLogoModules(0)).toBe(1);
    expect(calculateLogoModules(Number.NaN)).toBe(1);
  });
});
