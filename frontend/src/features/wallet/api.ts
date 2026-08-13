import { apiFetch } from '../../lib/api-client';
import { Paginated } from '../../lib/pagination';
import { Balance, Transaction, TransactionFilters } from './types';

export function getBalance(): Promise<Balance> {
  return apiFetch<Balance>('/wallet');
}

export function getTransactions(filters: TransactionFilters, page: number): Promise<Paginated<Transaction>> {
  const params = new URLSearchParams();
  if (filters.status !== 'ALL') params.set('status', filters.status);
  if (filters.type !== 'ALL') params.set('type', filters.type);
  params.set('page', String(page));
  return apiFetch<Paginated<Transaction>>(`/wallet/transactions?${params.toString()}`);
}
