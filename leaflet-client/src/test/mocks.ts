import { Feature } from 'geojson';
import { vi } from 'vitest';

export const mockRequest = (shouldResolve = true, timeout = 1000): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(shouldResolve ? resolve : reject, timeout);
    vi.advanceTimersByTime(timeout);
  });
};

export const mockFeature: Feature = {
  properties: {
    status: 'ikkeIBruk',
    featuretype: 'Beredskapspunkt',
  },
  geometry: {
    coordinates: [0, 0],
    type: 'Point',
  },
  type: 'Feature',
};

export const mockBrannslange: Feature = {
  properties: {
    featuretype: 'Beredskapspunkt',

    beredskapstype: ['brannslange'],
  },
  geometry: {
    coordinates: [0, 0],
    type: 'Point',
  },
  type: 'Feature',
};
