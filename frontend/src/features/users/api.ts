import { apiFetch } from '../../lib/api-client';
import { SignupPayload, SignupResponse } from './types';

export function signup(payload: SignupPayload): Promise<SignupResponse> {
  return apiFetch<SignupResponse>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
