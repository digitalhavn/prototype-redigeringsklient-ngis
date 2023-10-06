import { describe, it, expect, vi, MockedFunction, afterEach } from 'vitest';
import { getDatasets } from '../ngisClient';
import axios, { AxiosError } from 'axios';

vi.mock('axios');

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getDatasets', () => {
  it('should return datasets if promise resolves', async () => {
    const mockResponse = [{ id: 'abc123', name: 'Arendal' }];
    (axios.get as MockedFunction<typeof axios.get>).mockResolvedValueOnce({ data: mockResponse });

    const result = await getDatasets();

    expect(result.length).toEqual(1);
    expect(axios.get).toHaveBeenCalledOnce();
    expect(result).toEqual(mockResponse);
  });

  it('should throw error if promise rejects', async () => {
    const axiosError = new AxiosError('rejected');
    (axios.get as MockedFunction<typeof axios.get>).mockReturnValueOnce(Promise.reject(axiosError));

    try {
      const result = await getDatasets();
      expect(result.length).toEqual(1);
    } catch (error) {
      expect(axios.get).toHaveBeenCalledOnce();
      expect(error).toEqual(axiosError);
    }
  });
});
