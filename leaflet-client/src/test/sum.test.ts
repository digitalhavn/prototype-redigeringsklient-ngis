import { describe, it, expect, vi } from 'vitest';
import { getDatasets } from '../ngisClient';

global.fetch = vi.fn();

describe('sum', () => {
  it('should return 4', async () => {
    expect(2 + 2).toEqual(4);
    const result = await getDatasets();

    expect(result.length).toEqual(2);
  });
});
