import { describe, expect, it } from 'vitest';
import { findPath } from '../../util';
import { mockBrannslange, mockFeature } from '../mocks';

describe('findPath', () => {
  it('should return ikke-i-bruk if status is ikkeIBruk', () => {
    const result = findPath(mockFeature);

    expect(result).toEqual('ikke-i-bruk.png');
  });

  it('should return correct icon for Beredskapspunkt brannslange', () => {
    const result = findPath(mockBrannslange);

    expect(result).toEqual('Beredskapspunkt/Beredskapspunkt_brannslange.png');
  });
});
