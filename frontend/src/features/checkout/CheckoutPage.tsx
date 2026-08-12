import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Spinner } from '../../components/Spinner';
import { ApiError } from '../../lib/api-client';
import { centsToBRL, reaisToCents } from '../../lib/money';
import { createCheckout, getFees } from './api';
import { CheckoutResult, Fee } from './types';
import './checkout.css';

const schema = z.object({
  amount: z.coerce.number().positive('Informe um valor maior que zero.'),
  method: z.enum(['PIX', 'CARD']),
  installments: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutPage() {
  const [fees, setFees] = useState<Fee[] | null>(null);
  const [feesError, setFeesError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { method: 'PIX' } });

  const method = watch('method');
  const installments = watch('installments');
  const amount = watch('amount');

  useEffect(() => {
    if (method !== 'CARD' || fees) return;
    getFees()
      .then(setFees)
      .catch((err) => setFeesError(err instanceof ApiError ? err.message : 'Não foi possível carregar as taxas.'));
  }, [method, fees]);

  const selectedFee = fees?.find((f) => f.installments === Number(installments));

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    setResult(null);
    try {
      const checkoutResult = await createCheckout({
        amountCents: reaisToCents(values.amount),
        method: values.method,
        installments: values.method === 'CARD' ? Number(values.installments) : undefined,
      });
      setResult(checkoutResult);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Não foi possível criar o checkout.');
    }
  }

  async function copyEmv(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="checkout-page">
      <Card>
        <h2>Criar link de pagamento</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="ui-field">
            <label htmlFor="amount">Valor (R$)</label>
            <input id="amount" type="number" step="0.01" min="0.01" {...register('amount')} />
            {errors.amount && <span className="ui-field-error">{errors.amount.message}</span>}
          </div>

          <div className="ui-field">
            <label htmlFor="method">Forma de pagamento</label>
            <select id="method" {...register('method')}>
              <option value="PIX">Pix</option>
              <option value="CARD">Cartão</option>
            </select>
          </div>

          {method === 'CARD' && (
            <div className="ui-field">
              <label htmlFor="installments">Parcelas</label>
              {feesError && <ErrorBanner message={feesError} />}
              {!fees && !feesError && <Spinner />}
              {fees && (
                <select id="installments" {...register('installments')}>
                  <option value="">Selecione</option>
                  {fees.map((fee) => (
                    <option key={fee.installments} value={fee.installments}>
                      {fee.installments}x · taxa {fee.feePercent}%
                    </option>
                  ))}
                </select>
              )}
              {selectedFee && amount > 0 && (
                <p className="checkout-fee-preview mono">
                  Taxa aplicada: {selectedFee.feePercent}% · você recebe{' '}
                  {centsToBRL(reaisToCents(amount) * (1 - selectedFee.feePercent / 100))}
                </p>
              )}
            </div>
          )}

          {submitError && <ErrorBanner message={submitError} />}

          <Button type="submit" loading={isSubmitting}>
            Gerar link
          </Button>
        </form>
      </Card>

      {result?.method === 'PIX' && (
        <Card className="checkout-result">
          <h3>Cobrança Pix gerada</h3>
          <img
            className="checkout-qr"
            src={`data:image/png;base64,${result.qrCodeBase64}`}
            alt="QR Code Pix para pagamento"
          />
          <div className="ui-field">
            <label htmlFor="emv">Copia e cola</label>
            <div className="checkout-emv-row">
              <input id="emv" readOnly value={result.emvCode} className="mono" />
              <Button type="button" variant="secondary" onClick={() => copyEmv(result.emvCode)}>
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </div>
          <p className="checkout-expiry">Expira em {new Date(result.expiresAt).toLocaleString('pt-BR')}</p>
        </Card>
      )}

      {result?.method === 'CARD' && (
        <Card className="checkout-result">
          <h3>Link de pagamento gerado</h3>
          <p>
            Taxa confirmada de <strong>{result.feePercent}%</strong>.
          </p>
          <a href={result.checkoutUrl} target="_blank" rel="noreferrer">
            {result.checkoutUrl}
          </a>
        </Card>
      )}
    </div>
  );
}
