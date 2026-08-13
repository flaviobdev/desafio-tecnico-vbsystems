import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Pagination } from '../../components/Pagination';
import { Spinner } from '../../components/Spinner';
import { useAsync } from '../../hooks/useAsync';
import { ApiError } from '../../lib/api-client';
import { listWebhooks, removeWebhook, upsertWebhook } from './api';
import './webhooks.css';

const EVENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'PAYMENT_PIX', label: 'Pagamento Pix' },
  { value: 'PAYMENT_CARD', label: 'Pagamento com cartão' },
  { value: 'WITHDRAWAL', label: 'Saque' },
];

const schema = z.object({
  event: z.enum(['PAYMENT_PIX', 'PAYMENT_CARD', 'WITHDRAWAL']),
  url: z.string().min(1, 'Informe a URL que receberá o webhook.'),
  secret: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function WebhooksPage() {
  const [page, setPage] = useState(1);
  const { data: webhooks, loading, error, reload } = useAsync(() => listWebhooks(page), [page]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { event: 'PAYMENT_PIX' },
  });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      await upsertWebhook({
        event: values.event,
        url: values.url,
        secret: values.secret || undefined,
      });
      reset({ event: values.event, url: '', secret: '' });
      if (page === 1) reload();
      else setPage(1);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Não foi possível cadastrar o webhook.');
    }
  }

  async function remove(id: string) {
    setRemovingId(id);
    try {
      await removeWebhook(id);
      reload();
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="webhooks-page">
      <Card className="webhooks-form-card">
        <h2>Cadastrar webhook</h2>
        <p className="webhooks-hint">Um URL por evento — cadastrar de novo para o mesmo evento atualiza a URL.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="ui-field">
            <label htmlFor="event">Evento</label>
            <select id="event" {...register('event')}>
              {EVENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="ui-field">
            <label htmlFor="url">URL de destino</label>
            <input id="url" placeholder="https://seu-sistema.com/webhooks/lera-box/pix" {...register('url')} />
            {errors.url && <span className="ui-field-error">{errors.url.message}</span>}
          </div>
          <div className="ui-field">
            <label htmlFor="secret">Segredo para HMAC (opcional)</label>
            <input id="secret" {...register('secret')} />
          </div>
          {submitError && <ErrorBanner message={submitError} />}
          <Button type="submit" loading={isSubmitting}>
            Salvar webhook
          </Button>
        </form>
      </Card>

      <Card>
        <h2>Webhooks configurados</h2>
        <p className="webhooks-hint">Endpoints que o gateway notifica quando um pagamento ou saque muda de status.</p>
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {webhooks && webhooks.data.length === 0 && <p className="webhooks-hint">Nenhum webhook configurado.</p>}
        {webhooks && webhooks.data.length > 0 && (
          <div className="table-scroll">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {webhooks.data.map((hook) => (
                  <tr key={hook.id}>
                    <td className="mono">{hook.event}</td>
                    <td className="mono">{hook.url}</td>
                    <td>{hook.active ? 'Ativo' : 'Inativo'}</td>
                    <td>
                      <Button variant="secondary" loading={removingId === hook.id} onClick={() => remove(hook.id)}>
                        Remover
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {webhooks && <Pagination page={webhooks.page} totalPages={webhooks.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
