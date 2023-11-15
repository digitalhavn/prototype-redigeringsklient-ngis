import { describe, expect, it, vi } from 'vitest';
import { getErrorMessage } from '../../util';
import axios, { AxiosError } from 'axios';

describe('getErrorMessage', () => {
  it('should return stringified version of error if it is not an axios error', () => {
    const error = new Error();
    error.message = 'something went wrong';
    const result = getErrorMessage(error);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(JSON.stringify({ message: 'something went wrong' }));
  });

  it('should return a specific message for ECONNABORTED', () => {
    const error = new AxiosError(undefined, 'ECONNABORTED');
    const result = getErrorMessage(error);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual('Forespørselen ble avbrutt fordi det tok for lang tid...');
  });

  it('should return a specific message for server errors', () => {
    const spy = vi.spyOn(axios, 'isAxiosError');
    spy.mockReturnValueOnce(true);
    const error = {
      response: {
        status: 500,
      },
    };

    const result = getErrorMessage(error);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual('500: Noe gikk galt med serveren. Prøv på nytt senere...');
  });

  it('should return a specific message for server errors', () => {
    const spy = vi.spyOn(axios, 'isAxiosError');
    spy.mockReturnValueOnce(true);
    const error = {
      response: {
        status: 400,
        data: {
          errors: [
            {
              lokalid: 'abc123',
              reason: "Object is missing required property 'kvalitet'",
            },
            {
              lokalid: 'def456',
              reason: 'Object is outside of dataset boundaries',
            },
          ],
          title: 'Validation error',
        },
      },
    };

    const result = getErrorMessage(error);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual('Validation error:');
    expect((result[1] as HTMLDivElement).textContent).toEqual(
      "lokalid abc123... - Object is missing required property 'kvalitet'",
    );
    expect((result[2] as HTMLDivElement).textContent).toEqual(
      'lokalid def456... - Object is outside of dataset boundaries',
    );
  });

  it('should return a catch all error message if status is not explicitly handled', () => {
    const spy = vi.spyOn(axios, 'isAxiosError');
    spy.mockReturnValueOnce(true);
    const error = {
      response: {
        status: 418,
      },
    };

    const result = getErrorMessage(error);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual('Noe gikk galt...');
  });
});
