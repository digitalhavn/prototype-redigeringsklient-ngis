import { SpyInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeRequest } from '../../util';
import { mockRequest } from '../mocks';
import { TIMEOUT_WARNING } from '../../config';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('makeRequest', () => {
  let querySelectorSpy: SpyInstance<[selectors: string], Element | null>;
  let mockLoader: HTMLDivElement;

  beforeEach(() => {
    mockLoader = document.createElement('div');
    querySelectorSpy = vi.spyOn(document, 'querySelector');
    querySelectorSpy.mockReturnValue(mockLoader);
  });

  it('should enable and disable loader, and show success', async () => {
    const successSpan = document.createElement('span');
    const successAlert = document.createElement('div');
    const createElementSpy = vi.spyOn(document, 'createElement');
    createElementSpy.mockReturnValueOnce(successSpan).mockReturnValueOnce(successAlert);

    await makeRequest(mockRequest);

    expect(querySelectorSpy).toHaveBeenCalledTimes(3);
    expect(querySelectorSpy).toHaveBeenNthCalledWith(1, '#loading-container');
    expect(querySelectorSpy).toHaveBeenNthCalledWith(2, 'body');
    expect(querySelectorSpy).toHaveBeenNthCalledWith(3, '#loading-container');
    expect(mockLoader.style.display).toEqual('none');

    expect(createElementSpy).toHaveBeenCalledTimes(2);
    expect(createElementSpy).toHaveBeenNthCalledWith(1, 'span');
    expect(createElementSpy).toHaveBeenNthCalledWith(2, 'div');

    expect(successAlert.textContent).toEqual('✔Endringer lagret');
  });

  it('should not display success message if showSuccess is false', async () => {
    await makeRequest(mockRequest, false);

    expect(querySelectorSpy).toHaveBeenCalledTimes(2);
    expect(querySelectorSpy).toHaveBeenNthCalledWith(1, '#loading-container');
    expect(querySelectorSpy).toHaveBeenNthCalledWith(2, '#loading-container');
  });

  it('should display error message if promise rejects', async () => {
    const errorAlert = document.createElement('div');
    const createElementSpy = vi.spyOn(document, 'createElement');
    createElementSpy.mockReturnValueOnce(errorAlert);
    const onError = vi.fn();

    await makeRequest(() => mockRequest(false), undefined, onError, undefined, 'Something went wrong');

    expect(createElementSpy).toHaveBeenCalledTimes(1);
    expect(errorAlert.textContent).toEqual('Something went wrong');
    expect(onError).toHaveBeenCalledOnce();
  });

  it('should display info alert if request takes a long time', async () => {
    const infoAlert = document.createElement('div');
    const errorAlert = document.createElement('div');
    const createElementSpy = vi.spyOn(document, 'createElement');
    createElementSpy.mockReturnValueOnce(infoAlert).mockReturnValueOnce(errorAlert);

    await makeRequest(
      () => mockRequest(false, TIMEOUT_WARNING),
      undefined,
      undefined,
      undefined,
      'Something went wrong',
    );

    expect(createElementSpy).toHaveBeenCalledTimes(2);
    expect(infoAlert.textContent).toEqual('Forespørselen tar lengere tid enn forventet. Vennligst vent...');
    expect(errorAlert.textContent).toEqual('Something went wrong');
  });
});
