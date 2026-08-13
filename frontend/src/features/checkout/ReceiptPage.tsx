import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Spinner } from '../../components/Spinner';
import { StatusStamp } from '../../components/StatusStamp';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../../lib/api-client';
import { centsToBRL } from '../../lib/money';
import { getCharge } from './api';
import { Charge } from './types';
import './receipt.css';

export function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [charge, setCharge] = useState<Charge | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getCharge(id)
      .then(setCharge)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o comprovante.'));
  }, [id]);

  if (error) {
    return (
      <div className="receipt-page">
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (!charge) {
    return (
      <div className="receipt-page">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="receipt-page">
      <div className="receipt-actions no-print">
        <Link to="/checkout">&larr; Voltar</Link>
        <button className="ui-btn ui-btn--primary" onClick={() => window.print()}>
          Imprimir / salvar PDF
        </button>
      </div>

      <div className="receipt-sheet">
        <header className="receipt-header">
          <h1>VBA · BaaS</h1>
          <p>Comprovante de pagamento</p>
        </header>

        <div className="receipt-status">
          <StatusStamp status={charge.status} />
        </div>

        <dl className="receipt-fields">
          <dt>Valor</dt>
          <dd className="money">{centsToBRL(charge.amount)}</dd>

          <dt>Método</dt>
          <dd>{charge.method === 'PIX' ? 'Pix' : 'Cartão de crédito'}</dd>

          {charge.method === 'PIX' && charge.payerDocument && (
            <>
              <dt>Pagador</dt>
              <dd>{charge.payerDocument}</dd>
            </>
          )}

          {charge.method === 'CREDIT_CARD' && (
            <>
              <dt>Cartão</dt>
              <dd>
                {charge.cardBrand ?? '—'} •••• {charge.cardLast4 ?? '----'}
              </dd>
              <dt>Parcelas</dt>
              <dd>{charge.installments}x</dd>
              {charge.netAmountCents != null && (
                <>
                  <dt>Valor líquido</dt>
                  <dd>{centsToBRL(charge.netAmountCents)}</dd>
                </>
              )}
            </>
          )}

          <dt>Recebido por</dt>
          <dd>{user?.name ?? '—'}</dd>

          {charge.description && (
            <>
              <dt>Descrição</dt>
              <dd>{charge.description}</dd>
            </>
          )}

          {charge.externalReference && (
            <>
              <dt>Referência</dt>
              <dd>{charge.externalReference}</dd>
            </>
          )}

          <dt>Identificador</dt>
          <dd className="mono">{charge.id}</dd>

          {charge.gatewayTransactionId && (
            <>
              <dt>Transação no gateway</dt>
              <dd className="mono">{charge.gatewayTransactionId}</dd>
            </>
          )}

          <dt>Data</dt>
          <dd>{new Date(charge.createdAt).toLocaleString('pt-BR')}</dd>
        </dl>

        <footer className="receipt-footer">
          <p>Documento gerado eletronicamente pela VBA · BaaS.</p>
        </footer>
      </div>
    </div>
  );
}
