import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAlert } from '../../components/alerts/alerts';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('createAlert', () => {
  it('should create a div with classes alert and show, and remove show after 5 seconds', () => {
    const alert = createAlert();

    expect(alert.className).toEqual('alert show');

    vi.advanceTimersByTime(5000);

    expect(alert.className).toEqual('alert');
  });

  it('should create a div with classes alert and show, and not remove show after 3 seconds', () => {
    const alert = createAlert();

    expect(alert.className).toEqual('alert show');

    vi.advanceTimersByTime(3000);

    expect(alert.className).toEqual('alert show');
  });
});
