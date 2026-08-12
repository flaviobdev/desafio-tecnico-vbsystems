import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Spinner } from '../../components/Spinner';
import { StatusStamp } from '../../components/StatusStamp';
import { useAsync } from '../../hooks/useAsync';
import { ApiError } from '../../lib/api-client';
import { centsToBRL, reaisToCents } from '../../lib/money';
import { createWithdrawal, getWithdrawal, listWithdrawals } from './api';
import './withdrawals.css';

const schema = z.object({
  amount: z.coerce.number().positive('Informe um valor maior que zero.'),
  pixKey: z.string().min(1, 'Informe a chave Pix de destino.'),
});

type FormValues = z.infer<typeof schema>;

export function WithdrawalsPage() {
  const { data: withdrawals, loading, error, reload } = useAsync(listWithdrawals, []);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      await createWithdrawal({ amountCents: reaisToCents(values.amount), pixKey: values.pixKey });
      reset();
      reload();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Não foi possível solicitar o saque.');
    }
  }

  async function checkStatus(id: string) {
    setCheckingId(id);
    try {
      await getWithdrawal(id);
      reload();
    } finally {
      setCheckingId(null);
    }
  }

  return (
    <div className="withdrawals-page">
      <Card className="withdrawals-form-card">
        <h2>Solicitar saque</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="ui-field">
            <label htmlFor="amount">Valor (R$)</label>
            <input id="amount" type="number" step="0.01" min="0.01" {...register('amount')} />
            {errors.amount && <span className="ui-field-error">{errors.amount.message}</span>}
          </div>
          <div className="ui-field">
            <label htmlFor="pixKey">Chave Pix de destino</label>
            <input id="pixKey" {...register('pixKey')} />
            {errors.pixKey && <span className="ui-field-error">{errors.pixKey.message}</span>}
          </div>
          {submitError && <ErrorBanner message={submitError} />}
          <Button type="submit" loading={isSubmitting}>
            Solicitar saque
          </Button>
        </form>
      </Card>

      <Card>
        <h2>Saques solicitados</h2>
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {withdrawals && withdrawals.length === 0 && <p className="withdrawals-empty">Nenhum saque solicitado ainda.</p>}
        {withdrawals && withdrawals.length > 0 && (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Solicitado em</th>
                <th>Chave Pix</th>
                <th>Status</th>
                <th className="ledger-table-amount">Valor</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id}>
                  <td className="mono">{new Date(w.requestedAt).toLocaleString('pt-BR')}</td>
                  <td>{w.pixKey}</td>
                  <td>
                    <StatusStamp status={w.status} />
                  </td>
                  <td className="ledger-table-amount money">{centsToBRL(w.amountCents)}</td>
                  <td>
                    <Button variant="secondary" loading={checkingId === w.id} onClick={() => checkStatus(w.id)}>
                      Consultar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
