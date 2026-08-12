import { useState } from 'react';
import { Card } from '../../components/Card';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Spinner } from '../../components/Spinner';
import { StatusStamp, TransactionStatus } from '../../components/StatusStamp';
import { useAsync } from '../../hooks/useAsync';
import { centsToBRL } from '../../lib/money';
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
  { value: 'CARD', label: 'Cartão' },
  { value: 'WITHDRAWAL', label: 'Saque' },
];

const TYPE_LABEL: Record<TransactionType, string> = {
  PIX: 'Pix',
  CARD: 'Cartão',
  WITHDRAWAL: 'Saque',
};

export function WalletPage() {
  const [filters, setFilters] = useState<TransactionFilters>({ status: 'ALL', type: 'ALL' });
  const balance = useAsync(getBalance, []);
  const transactions = useAsync(() => getTransactions(filters), [filters.status, filters.type]);

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
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as TransactionFilters['status'] }))}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as TransactionFilters['type'] }))}
            >
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
        {transactions.data && transactions.data.length === 0 && (
          <p className="wallet-empty">Nenhuma movimentação para os filtros selecionados.</p>
        )}
        {transactions.data && transactions.data.length > 0 && (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Status</th>
                <th className="ledger-table-amount">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.data.map((tx) => (
                <tr key={tx.id}>
                  <td className="mono">{new Date(tx.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>{tx.description}</td>
                  <td>{TYPE_LABEL[tx.type]}</td>
                  <td>
                    <StatusStamp status={tx.status} />
                  </td>
                  <td className="ledger-table-amount money">{centsToBRL(tx.amountCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
