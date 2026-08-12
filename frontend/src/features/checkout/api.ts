import { apiFetch } from '../../lib/api-client';
import { CheckoutResult, CreateCheckoutPayload, Fee } from './types';

export function getFees(): Promise<Fee[]> {
  return apiFetch<Fee[]>('/fees');
}

export function createCheckout(payload: CreateCheckoutPayload): Promise<CheckoutResult> {
  return apiFetch<CheckoutResult>('/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
