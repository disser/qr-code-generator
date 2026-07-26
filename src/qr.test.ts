import { describe, expect, it } from 'vitest';
import { calculateLogoModules, calculateCoverCrop, getLogoThreshold, getLogoWarning } from './qr';

describe('calculateLogoModules', () => {
  it('uses a positive whole-module value capped at 15%', () => {
    for (const count of [21, 25, 57, 177]) {
      const result = calculateLogoModules(count, 15);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result % 1).toBe(0);
      expect(result).toBeLessThanOrEqual(Math.floor(count * 0.15));
    }
  });
  it('uses correction-level thresholds and warnings', () => {
    expect(getLogoThreshold('L')).toBe(7);
    expect(getLogoThreshold('M')).toBe(10);
    expect(getLogoThreshold('Q')).toBe(13);
    expect(getLogoThreshold('H')).toBe(15);
    expect(getLogoWarning('H', 15)).toBeNull();
    expect(getLogoWarning('M', 11)).toContain('level M');
  });
  it('supports custom logo percentages', () => {
    expect(calculateLogoModules(100, 5)).toBe(5);
    expect(calculateLogoModules(100, 30)).toBe(30);
  });
  it('calculates a centered cover crop for non-square logos', () => {
    expect(calculateCoverCrop(1600, 800)).toEqual({ sourceX: 400, sourceY: 0, sourceSize: 800 });
    expect(calculateCoverCrop(800, 1600)).toEqual({ sourceX: 0, sourceY: 400, sourceSize: 800 });
    expect(calculateCoverCrop(500, 500)).toEqual({ sourceX: 0, sourceY: 0, sourceSize: 500 });
  });
  it('handles invalid module counts conservatively', () => {
    expect(calculateLogoModules(0, 15)).toBe(1);
    expect(calculateLogoModules(Number.NaN, 15)).toBe(1);
  });
});
