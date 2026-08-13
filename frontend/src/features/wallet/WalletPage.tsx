import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Pagination } from '../../components/Pagination';
import { Spinner } from '../../components/Spinner';
import { StatusStamp, TransactionStatus } from '../../components/StatusStamp';
import { useAsync } from '../../hooks/useAsync';
import { centsToBRL } from '../../lib/money';
import { mailtoUrl, whatsAppShareUrl } from '../../lib/share';
import { getBalance, getTransactions } from './api';
import { TransactionFilters, TransactionType } from './types';
import './wallet.css';

const STATUS_OPTIONS: { value: TransactionStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos os status' },
  { value: 'APPROVED', label: 'Sucesso' },
  { value: 'DENIED', label: 'Falha' },
  { value: 'EXPIRED', label: 'Expirado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const TYPE_OPTIONS: { value: TransactionType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos os tipos' },
  { value: 'PIX', label: 'Pix' },
  { value: 'CREDIT_CARD', label: 'Cartão' },
  { value: 'WITHDRAWAL', label: 'Saque' },
];

const TYPE_LABEL: Record<TransactionType, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão',
  WITHDRAWAL: 'Saque',
};

export function WalletPage() {
  const [filters, setFilters] = useState<TransactionFilters>({ status: 'ALL', type: 'ALL' });
  const [page, setPage] = useState(1);
  const balance = useAsync(getBalance, []);
  const transactions = useAsync(() => getTransactions(filters, page), [filters.status, filters.type, page]);

  function updateFilters(next: Partial<TransactionFilters>) {
    setFilters((f) => ({ ...f, ...next }));
    setPage(1);
  }

  function buildReceiptShareMessage(orderId: string, type: TransactionType, amountCents: number) {
    const receiptUrl = `${window.location.origin}/checkout/${orderId}/comprovante`;
    return `Comprovante de pagamento — ${TYPE_LABEL[type]} de ${centsToBRL(amountCents)}\n${receiptUrl}`;
  }

  return (
    <div className="wallet-page">
      <section className="wallet-masthead">
        <p className="wallet-eyebrow">Saldo disponível</p>
        {balance.loading ? (
          <Spinner />
        ) : balance.error ? (
          <ErrorBanner message={balance.error} />
        ) : (
          <p className="wallet-balance money">{centsToBRL(balance.data!.balanceCents)}</p>
        )}
      </section>

      <Card>
        <div className="wallet-toolbar">
          <h2>Extrato</h2>
          <div className="wallet-filters">
            <select value={filters.status} onChange={(e) => updateFilters({ status: e.target.value as TransactionFilters['status'] })}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select value={filters.type} onChange={(e) => updateFilters({ type: e.target.value as TransactionFilters['type'] })}>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {transactions.loading && <Spinner />}
        {transactions.error && <ErrorBanner message={transactions.error} />}
        {transactions.data && transactions.data.data.length === 0 && (
          <p className="wallet-empty">Nenhuma movimentação para os filtros selecionados.</p>
        )}
        {transactions.data && transactions.data.data.length > 0 && (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Status</th>
                <th className="ledger-table-amount">Valor</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {transactions.data.data.map((tx) => (
                <tr key={tx.id}>
                  <td className="mono">{new Date(tx.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>{tx.description}</td>
                  <td>{TYPE_LABEL[tx.type]}</td>
                  <td>
                    <StatusStamp status={tx.status} />
                  </td>
                  <td className="ledger-table-amount money">{centsToBRL(tx.amountCents)}</td>
                  <td>
                    {tx.orderId && tx.status === 'APPROVED' && (
                      <div className="wallet-row-actions">
                        <Link to={`/checkout/${tx.orderId}/comprovante`} target="_blank">
                          Comprovante
                        </Link>
                        <a
                          href={whatsAppShareUrl(buildReceiptShareMessage(tx.orderId, tx.type, tx.amountCents))}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={mailtoUrl(
                            'Comprovante de pagamento',
                            buildReceiptShareMessage(tx.orderId, tx.type, tx.amountCents),
                          )}
                        >
                          E-mail
                        </a>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {transactions.data && (
          <Pagination page={transactions.data.page} totalPages={transactions.data.totalPages} onPageChange={setPage} />
        )}
      </Card>
    </div>
  );
}
