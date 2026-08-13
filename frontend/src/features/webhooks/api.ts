import { apiFetch } from '../../lib/api-client';
import { Paginated } from '../../lib/pagination';
import { CreateWebhookPayload, Webhook } from './types';

export function listWebhooks(page: number): Promise<Paginated<Webhook>> {
  return apiFetch<Paginated<Webhook>>(`/webhooks?page=${page}`);
}

export function upsertWebhook(payload: CreateWebhookPayload): Promise<Webhook> {
  return apiFetch<Webhook>('/webhooks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function removeWebhook(id: string): Promise<void> {
  return apiFetch<void>(`/webhooks/${id}`, { method: 'DELETE' });
}
