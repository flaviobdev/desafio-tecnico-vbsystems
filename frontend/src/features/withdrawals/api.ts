import { apiFetch } from '../../lib/api-client';
import { CreateWithdrawalPayload, Withdrawal } from './types';

export function createWithdrawal(payload: CreateWithdrawalPayload): Promise<Withdrawal> {
  return apiFetch<Withdrawal>('/withdrawals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getWithdrawal(id: string): Promise<Withdrawal> {
  return apiFetch<Withdrawal>(`/withdrawals/${id}`);
}
