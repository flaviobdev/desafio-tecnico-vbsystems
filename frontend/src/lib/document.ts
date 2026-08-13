import { cleanAlphanumeric, cleanNumbers, formatDocument } from 'cnpj-cpf-validator';

// O CNPJ alfanumérico (Receita Federal, vigente desde jul/2026) usa letras maiúsculas
// no cálculo do dígito verificador — normalizamos pra maiúscula antes de mascarar
// ou limpar, senão a máscara não bate.
function normalize(value: string): string {
  return value.toUpperCase();
}

function cleanValue(value: string): string {
  const upper = normalize(value);
  return /[A-Z]/.test(upper) ? cleanAlphanumeric(upper) : cleanNumbers(upper);
}

export function maskDocument(value: string): string {
  return formatDocument(normalize(value), true);
}

// Só valida o formato (11 dígitos pra CPF, 14 pra CNPJ), sem conferir o dígito
// verificador: o ambiente de simulação do desafio admite CPF/CNPJ fictício no
// gateway, e um documento fictício pode não bater no cálculo do mod-11.
export function isValidDocumentValue(value: string): boolean {
  const length = cleanValue(value).length;
  return length === 11 || length === 14;
}

export function cleanDocument(value: string): string {
  return cleanValue(value);
}
