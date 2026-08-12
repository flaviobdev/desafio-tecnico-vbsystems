import { apiFetch } from '../../lib/api-client';
import { Webhook } from './types';

export function listWebhooks(): Promise<Webhook[]> {
  return apiFetch<Webhook[]>('/webhooks');
}
