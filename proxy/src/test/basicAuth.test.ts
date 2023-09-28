import { basicAuthEncode } from '../basicAuth';
import { describe, it, expect } from 'vitest';

describe('basicAuthEncode', () => {
  it('should base64 encode username and password correctly', () => {
    const result = basicAuthEncode('username', 'password');

    expect(result).toEqual('dXNlcm5hbWU6cGFzc3dvcmQ=');
  });
});
