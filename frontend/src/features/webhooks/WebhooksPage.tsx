import { Card } from '../../components/Card';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Spinner } from '../../components/Spinner';
import { useAsync } from '../../hooks/useAsync';
import { listWebhooks } from './api';

export function WebhooksPage() {
  const { data: webhooks, loading, error } = useAsync(listWebhooks, []);

  return (
    <Card>
      <h2>Webhooks configurados</h2>
      <p className="webhooks-hint">Endpoints que o gateway notifica quando um pagamento ou saque muda de status.</p>
      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {webhooks && webhooks.length === 0 && <p className="webhooks-hint">Nenhum webhook configurado.</p>}
      {webhooks && webhooks.length > 0 && (
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Evento</th>
              <th>URL</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {webhooks.map((hook) => (
              <tr key={hook.id}>
                <td className="mono">{hook.event}</td>
                <td className="mono">{hook.url}</td>
                <td>{hook.active ? 'Ativo' : 'Inativo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
