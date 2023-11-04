import { vi } from 'vitest';

export const mockRequest = (shouldResolve = true, timeout = 1000): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(shouldResolve ? resolve : reject, timeout);
    vi.advanceTimersByTime(timeout);
  });
};
