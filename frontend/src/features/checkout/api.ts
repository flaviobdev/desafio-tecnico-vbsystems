import { apiFetch } from '../../lib/api-client';
import { CardCharge, Charge, CreateCardChargePayload, CreatePixChargePayload, Fee, PixCharge } from './types';

export function getFees(brand: string): Promise<{ total: number; fees: Fee[] }> {
  return apiFetch(`/checkout/fees?brand=${encodeURIComponent(brand)}`);
}

export function createPixCharge(payload: CreatePixChargePayload): Promise<PixCharge> {
  return apiFetch<PixCharge>('/checkout/pix', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createCardCharge(payload: CreateCardChargePayload): Promise<CardCharge> {
  return apiFetch<CardCharge>('/checkout/card', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCharge(id: string): Promise<Charge> {
  return apiFetch<Charge>(`/checkout/${id}`);
}
