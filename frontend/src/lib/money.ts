const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function centsToBRL(cents: number): string {
  return brl.format(cents / 100);
}

export function reaisToCents(value: number): number {
  return Math.round(value * 100);
}
