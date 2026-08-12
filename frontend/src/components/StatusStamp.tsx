import './ui.css';


export type TransactionStatus = 'APPROVED' | 'DENIED' | 'EXPIRED' | 'CANCELLED' | 'PENDING';

const LABEL: Record<TransactionStatus, string> = {
  APPROVED: 'Sucesso',
  DENIED: 'Falha',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
  PENDING: 'Pendente',
};

const VARIANT: Record<TransactionStatus, string> = {
  APPROVED: 'success',
  DENIED: 'failed',
  EXPIRED: 'void',
  CANCELLED: 'void',
  PENDING: 'pending',
};

export function StatusStamp({ status }: { status: TransactionStatus }) {
  return <span className={`ui-stamp ui-stamp--${VARIANT[status]}`}>{LABEL[status]}</span>;
}
