import { describe, expect, it } from 'vitest';
import { validateDestination } from './input';

describe('application contracts', () => {
  it('requires web destinations', () => {
    expect(validateDestination('https://example.com').ok).toBe(true);
    expect(validateDestination('')).toMatchObject({ ok: false });
  });
});
