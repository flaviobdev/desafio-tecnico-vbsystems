import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Spinner } from '../../components/Spinner';
import { StatusStamp } from '../../components/StatusStamp';
import { ApiError } from '../../lib/api-client';
import { cleanDocument, isValidDocumentValue, maskDocument } from '../../lib/document';
import { centsToBRL, reaisToCents } from '../../lib/money';
import { cancelCharge, createCardCharge, createPixCharge, getCharge, getFees } from './api';
import { CardPreview } from './CardPreview';
import { detectCardBrand } from './card-brand';
import { Charge, Fee } from './types';
import './checkout.css';

const pixSchema = z.object({
  method: z.literal('PIX'),
  amount: z.coerce.number().positive('Informe um valor maior que zero.'),
  payerDocument: z
    .string()
    .min(1, 'Informe o CPF ou CNPJ do pagador.')
    .refine(isValidDocumentValue, 'CPF ou CNPJ inválido.')
    .transform(cleanDocument),
  description: z.string().optional(),
  externalReference: z.string().optional(),
});

const cardSchema = z.object({
  method: z.literal('CREDIT_CARD'),
  amount: z.coerce.number().positive('Informe um valor maior que zero.'),
  description: z.string().optional(),
  externalReference: z.string().optional(),
  cardNumber: z.string().min(13, 'Número do cartão inválido.'),
  cardHolder: z.string().min(1, 'Informe o nome impresso no cartão.'),
  expiryMonth: z.string().min(1, 'Mês de validade.'),
  expiryYear: z.string().min(1, 'Ano de validade.'),
  cvv: z.string().min(3, 'CVV inválido.'),
  installments: z.coerce.number().min(1, 'Selecione as parcelas.'),
});

const schema = z.discriminatedUnion('method', [pixSchema, cardSchema]);
type FormValues = z.infer<typeof schema>;

export function CheckoutPage() {
  const [fees, setFees] = useState<Fee[] | null>(null);
  const [feesError, setFeesError] = useState<string | null>(null);
  const [charge, setCharge] = useState<Charge | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cvvFocused, setCvvFocused] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { method: 'PIX' } as FormValues,
  });

  const method = watch('method');
  const amount = watch('amount');
  const isCard = method === 'CREDIT_CARD';
  const installments = isCard ? watch('installments' as keyof FormValues) : undefined;
  const cardNumber = isCard ? ((watch('cardNumber' as keyof FormValues) as string) ?? '') : '';
  const cardHolder = isCard ? ((watch('cardHolder' as keyof FormValues) as string) ?? '') : '';
  const expiryMonth = isCard ? ((watch('expiryMonth' as keyof FormValues) as string) ?? '') : '';
  const expiryYear = isCard ? ((watch('expiryYear' as keyof FormValues) as string) ?? '') : '';
  const cvv = isCard ? ((watch('cvv' as keyof FormValues) as string) ?? '') : '';
  const cvvField = register('cvv');
  const payerDocumentField = register('payerDocument');
  const brand = isCard ? detectCardBrand(cardNumber.replace(/\D/g, '')) : null;

  useEffect(() => {
    if (!brand) {
      setFees(null);
      setFeesError(null);
      return;
    }
    setFees(null);
    setFeesError(null);
    getFees(brand)
      .then((res) => setFees(res.fees))
      .catch((err) => setFeesError(err instanceof ApiError ? err.message : 'Não foi possível carregar as taxas.'));
  }, [brand]);

  const selectedFee = fees?.find((f) => f.installments === Number(installments));

  useEffect(() => {
    if (!charge || charge.status !== 'PENDING') return;
    const interval = setInterval(() => {
      getCharge(charge.id)
        .then(setCharge)
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [charge?.id, charge?.status]);

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    setCharge(null);
    try {
      if (values.method === 'PIX') {
        const result = await createPixCharge({
          amount: reaisToCents(values.amount),
          payerDocument: values.payerDocument,
          description: values.description || undefined,
          externalReference: values.externalReference || undefined,
        });
        setCharge(result);
      } else {
        if (!selectedFee) {
          setSubmitError('Selecione uma opção de parcelas válida antes de continuar.');
          return;
        }
        const result = await createCardCharge({
          amount: reaisToCents(values.amount),
          description: values.description || undefined,
          externalReference: values.externalReference || undefined,
          cardNumber: values.cardNumber,
          cardHolder: values.cardHolder,
          expiryMonth: values.expiryMonth,
          expiryYear: values.expiryYear,
          cvv: values.cvv,
          installments: values.installments,
          feePercent: selectedFee.feePercent,
        });
        setCharge(result);
      }
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Não foi possível criar a cobrança.');
    }
  }

  function buildPixShareMessage(pixCharge: Extract<Charge, { method: 'PIX' }>) {
    return `Pagamento Pix de ${centsToBRL(pixCharge.amount)}. Código copia e cola:\n${pixCharge.emv}`;
  }

  async function copyEmv(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCancel() {
    if (!charge) return;
    setCanceling(true);
    try {
      setCharge(await cancelCharge(charge.id));
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Não foi possível cancelar a cobrança.');
    } finally {
      setCanceling(false);
    }
  }

  return (
    <div className={`checkout-page${isCard ? ' checkout-page--card' : ''}`}>
      <div className="checkout-form-col">
      <Card>
        <h2>Criar cobrança</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="ui-field">
            <label htmlFor="method">Forma de pagamento</label>
            <select id="method" {...register('method')}>
              <option value="PIX">Pix</option>
              <option value="CREDIT_CARD">Cartão de crédito</option>
            </select>
          </div>

          <div className="ui-field">
            <label htmlFor="amount">Valor (R$)</label>
            <input id="amount" type="number" step="0.01" min="0.01" {...register('amount')} />
            {errors.amount && <span className="ui-field-error">{errors.amount.message}</span>}
          </div>

          {method === 'PIX' && (
            <div className="ui-field">
              <label htmlFor="payerDocument">CPF ou CNPJ do pagador</label>
              <input
                id="payerDocument"
                {...payerDocumentField}
                onChange={(e) => {
                  e.target.value = maskDocument(e.target.value);
                  void payerDocumentField.onChange(e);
                }}
              />
              {'payerDocument' in errors && (
                <span className="ui-field-error">{errors.payerDocument?.message}</span>
              )}
            </div>
          )}

          {method === 'CREDIT_CARD' && (
            <>
              <div className="ui-field">
                <label htmlFor="cardNumber">Número do cartão</label>
                <input id="cardNumber" inputMode="numeric" {...register('cardNumber')} />
                {'cardNumber' in errors && <span className="ui-field-error">{errors.cardNumber?.message}</span>}
              </div>

              <div className="ui-field">
                <label htmlFor="cardHolder">Nome impresso no cartão</label>
                <input id="cardHolder" {...register('cardHolder')} />
                {'cardHolder' in errors && <span className="ui-field-error">{errors.cardHolder?.message}</span>}
              </div>

              <div className="ui-field">
                <label htmlFor="expiryMonth">Validade (mês/ano)</label>
                <div className="checkout-emv-row">
                  <input id="expiryMonth" placeholder="MM" {...register('expiryMonth')} />
                  <input id="expiryYear" placeholder="AAAA" {...register('expiryYear')} />
                </div>
              </div>

              <div className="ui-field">
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  inputMode="numeric"
                  {...cvvField}
                  onFocus={() => setCvvFocused(true)}
                  onBlur={(e) => {
                    setCvvFocused(false);
                    cvvField.onBlur(e);
                  }}
                />
                {'cvv' in errors && <span className="ui-field-error">{errors.cvv?.message}</span>}
              </div>

              <div className="ui-field">
                <label htmlFor="installments">Parcelas</label>
                {!brand && (
                  <p className="checkout-fee-preview">
                    Informe o número do cartão para ver as parcelas disponíveis.
                  </p>
                )}
                {brand && feesError && <ErrorBanner message={feesError} />}
                {brand && !fees && !feesError && <Spinner />}
                {brand && fees && (
                  <select id="installments" {...register('installments')}>
                    <option value="">Selecione</option>
                    {fees.map((fee) => (
                      <option key={fee.installments} value={fee.installments}>
                        {fee.installments}x · taxa {fee.feePercentFormatted}
                      </option>
                    ))}
                  </select>
                )}
                {'installments' in errors && (
                  <span className="ui-field-error">{errors.installments?.message}</span>
                )}
                {selectedFee && amount > 0 && (
                  <p className="checkout-fee-preview mono">
                    Taxa aplicada: {selectedFee.feePercentFormatted} · você recebe{' '}
                    {centsToBRL(Math.round(reaisToCents(amount) * (1 - selectedFee.feePercent / 100)))}
                  </p>
                )}
              </div>
            </>
          )}

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
            Gerar cobrança
          </Button>
        </form>
      </Card>

      {charge?.method === 'PIX' && (
        <Card className="checkout-result">
          <h3>
            Cobrança Pix gerada <StatusStamp status={charge.status} />
          </h3>
          {charge.status === 'PENDING' && (
            <>
              <p className="checkout-pending-hint">
                <Spinner /> Aguardando confirmação do pagamento...
              </p>
              {charge.expiresAt && (
                <p className="checkout-fee-preview">
                  Expira às {new Date(charge.expiresAt).toLocaleTimeString('pt-BR')}
                </p>
              )}
              <Button type="button" variant="secondary" loading={canceling} onClick={handleCancel}>
                Cancelar cobrança
              </Button>
            </>
          )}
          {charge.emv && (
            <>
              <div className="checkout-qr">
                <QRCodeSVG value={charge.emv} size={200} />
              </div>
              <div className="ui-field">
                <label htmlFor="emv">Copia e cola</label>
                <div className="checkout-emv-row">
                  <input id="emv" readOnly value={charge.emv} className="mono" />
                  <Button type="button" variant="secondary" onClick={() => copyEmv(charge.emv!)}>
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
              </div>
              <div className="checkout-share-row">
                <a
                  className="ui-btn ui-btn--secondary"
                  href={`https://wa.me/?text=${encodeURIComponent(buildPixShareMessage(charge))}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Enviar por WhatsApp
                </a>
                <a
                  className="ui-btn ui-btn--secondary"
                  href={`mailto:?subject=${encodeURIComponent('Pagamento Pix')}&body=${encodeURIComponent(buildPixShareMessage(charge))}`}
                >
                  Enviar por e-mail
                </a>
              </div>
            </>
          )}
          {charge.status === 'APPROVED' && (
            <Link className="checkout-receipt-link" to={`/checkout/${charge.id}/comprovante`} target="_blank">
              Ver comprovante de pagamento →
            </Link>
          )}
        </Card>
      )}

      {charge?.method === 'CREDIT_CARD' && (
        <Card className="checkout-result">
          <h3>
            Pagamento com cartão <StatusStamp status={charge.status} />
          </h3>
          <dl>
            <dt>Bandeira</dt>
            <dd>{charge.cardBrand ?? '—'}</dd>
            <dt>Cartão</dt>
            <dd>•••• {charge.cardLast4 ?? '----'}</dd>
            <dt>Parcelas</dt>
            <dd>{charge.installments}x</dd>
            <dt>Taxa</dt>
            <dd>{charge.feePercent}%</dd>
            <dt>Valor líquido</dt>
            <dd>{charge.netAmountCents != null ? centsToBRL(charge.netAmountCents) : '—'}</dd>
          </dl>
          {charge.status === 'APPROVED' && (
            <Link className="checkout-receipt-link" to={`/checkout/${charge.id}/comprovante`} target="_blank">
              Ver comprovante de pagamento →
            </Link>
          )}
        </Card>
      )}
      </div>

      {isCard && (
        <div className="checkout-card-col">
          <CardPreview
            cardNumber={cardNumber}
            cardHolder={cardHolder}
            expiryMonth={expiryMonth}
            expiryYear={expiryYear}
            cvv={cvv}
            flipped={cvvFocused}
          />
        </div>
      )}
    </div>
  );
}
