import { describe, expect, it } from 'vitest';
import { validateDestination } from './input';

describe('validateDestination', () => {
  it('accepts and normalizes an HTTP URL', () => {
    expect(validateDestination('  https://example.com/path  ')).toEqual({ ok: true, value: 'https://example.com/path' });
  });
  it('rejects empty and malformed values', () => {
    expect(validateDestination('')).toMatchObject({ ok: false });
    expect(validateDestination('not a url')).toMatchObject({ ok: false });
  });
  it('rejects unsafe or unsupported schemes', () => {
    expect(validateDestination('javascript:alert(1)')).toMatchObject({ ok: false });
    expect(validateDestination('file:///tmp/test')).toMatchObject({ ok: false });
  });
});
