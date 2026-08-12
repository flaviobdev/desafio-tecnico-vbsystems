import { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';
import './ui.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

export function Button({ variant = 'primary', loading, disabled, children, ...rest }: Props) {
  return (
    <button className={`ui-btn ui-btn--${variant}`} disabled={disabled || loading} {...rest}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}
