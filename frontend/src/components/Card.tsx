import { HTMLAttributes } from 'react';
import './ui.css';

export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ui-card ${className}`} {...rest} />;
}
