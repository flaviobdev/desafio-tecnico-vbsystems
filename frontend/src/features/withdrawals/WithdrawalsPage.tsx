import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ErrorBanner } from '../../components/ErrorBanner';
import { StatusStamp } from '../../components/StatusStamp';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../../lib/api-client';
import { centsToBRL, reaisToCents } from '../../lib/money';
import { createWithdrawal, getWithdrawal } from './api';
import { Withdrawal } from './types';
import './withdrawals.css';

const schema = z.object({
  amount: z.coerce.number().positive('Informe um valor maior que zero.'),
  pixKey: z.string().min(1, 'Informe a chave Pix de destino.'),
  document: z.string().min(1, 'Informe o CPF do titular da chave Pix.'),
  description: z.string().optional(),
  externalReference: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function WithdrawalsPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<Withdrawal | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { document: user?.document ?? '' },
  });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      const created = await createWithdrawal({
        amount: reaisToCents(values.amount),
        pixKey: values.pixKey,
        document: values.document,
        description: values.description || undefined,
        externalReference: values.externalReference || undefined,
      });
      setResult(created);
      reset({ document: values.document });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Não foi possível solicitar o saque.');
    }
  }

  async function checkStatus() {
    if (!result) return;
    setChecking(true);
    try {
      setResult(await getWithdrawal(result.id));
    } finally {
      setChecking(false);
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
          <div className="ui-field">
            <label htmlFor="document">CPF do titular da chave Pix</label>
            <input id="document" {...register('document')} />
            {errors.document && <span className="ui-field-error">{errors.document.message}</span>}
          </div>
          <div className="ui-field">
            <label htmlFor="description">Descrição (opcional)</label>
            <input id="description" {...register('description')} />
          </div>
          <div className="ui-field">
            <label htmlFor="externalReference">Referência (opcional)</label>
            <input id="externalReference" {...register('externalReference')} />
          </div>
          {submitError && <ErrorBanner message={submitError} />}
          <Button type="submit" loading={isSubmitting}>
            Solicitar saque
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="withdrawals-result-card">
          <h3>
            Saque solicitado <StatusStamp status={result.status} />
          </h3>
          {result.status === 'DENIED' && result.denialReason && (
            <p className="withdrawals-denial-reason">{result.denialReason}</p>
          )}
          <dl>
            <dt>Valor</dt>
            <dd className="money">{centsToBRL(result.amount)}</dd>
            <dt>Chave Pix</dt>
            <dd>{result.pixKey}</dd>
          </dl>
          <Button variant="secondary" loading={checking} onClick={checkStatus}>
            Consultar status
          </Button>
          <p className="withdrawals-hint">Veja o histórico completo de saques na Carteira.</p>
        </Card>
      )}
    </div>
  );
}
