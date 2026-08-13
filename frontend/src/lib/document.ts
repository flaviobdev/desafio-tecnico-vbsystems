import {
  cleanAlphanumeric,
  cleanNumbers,
  formatDocument,
  isValidDocument,
} from 'cnpj-cpf-validator';

// O CNPJ alfanumérico (Receita Federal, vigente desde jul/2026) usa letras maiúsculas
// no cálculo do dígito verificador — normalizamos pra maiúscula antes de mascarar,
// validar ou limpar, senão o dígito verificador não bate.
function normalize(value: string): string {
  return value.toUpperCase();
}

export function maskDocument(value: string): string {
  return formatDocument(normalize(value), true);
}

export function isValidDocumentValue(value: string): boolean {
  return isValidDocument(normalize(value));
}

export function cleanDocument(value: string): string {
  const upper = normalize(value);
  return /[A-Z]/.test(upper) ? cleanAlphanumeric(upper) : cleanNumbers(upper);
}
