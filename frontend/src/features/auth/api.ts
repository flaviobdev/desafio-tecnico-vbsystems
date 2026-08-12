import { apiFetch } from '../../lib/api-client';
import { LoginPayload, LoginResponse } from './types';

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
