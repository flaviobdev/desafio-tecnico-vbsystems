import { apiFetch } from '../../lib/api-client';
import { Balance, Transaction, TransactionFilters } from './types';

export function getBalance(): Promise<Balance> {
  return apiFetch<Balance>('/wallet');
}

export function getTransactions(filters: TransactionFilters): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (filters.status !== 'ALL') params.set('status', filters.status);
  if (filters.type !== 'ALL') params.set('type', filters.type);
  const query = params.toString();
  return apiFetch<Transaction[]>(`/wallet/transactions${query ? `?${query}` : ''}`);
}
