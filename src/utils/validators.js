/**
 * Validates PAN format and 4th character entity type.
 * 4th character must be one of: C, P, H, F, A, T, B, L, J, G
 */
export function validatePAN(pan) {
  if (!pan || typeof pan !== 'string') return false;
  const regex = /^[A-Z]{3}[CPHFATBLJG][A-Z]\d{4}[A-Z]$/i;
  return regex.test(pan);
}

/**
 * Aadhaar Verhoeff Checksum Algorithm
 */
const verhoeffD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const verhoeffP = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

const verhoeffInv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

export function validateAadhaar(aadhaar) {
  if (!aadhaar || typeof aadhaar !== 'string') return false;
  if (!/^\d{12}$/.test(aadhaar)) return false;

  const array = aadhaar.split('').map(Number).reverse();
  let c = 0;
  
  for (let i = 0; i < array.length; i++) {
    c = verhoeffD[c][verhoeffP[i % 8][array[i]]];
  }

  return c === 0;
}

/**
 * GSTIN validation with checksum
 * Format: 15 chars -> state code (2) + PAN (10) + entity (1) + Z + checksum (1)
 */
export function validateGST(gstin) {
  if (!gstin || typeof gstin !== 'string') return false;
  const value = gstin.toUpperCase();
  const formatRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  if (!formatRegex.test(value)) return false;

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charToValue = (char) => chars.indexOf(char);
  const valueToChar = (val) => chars[val];

  const body = value.slice(0, 14);
  let sum = 0;
  let factor = 2;

  for (let i = body.length - 1; i >= 0; i -= 1) {
    const code = charToValue(body[i]);
    if (code === -1) return false;
    const product = code * factor;
    sum += Math.floor(product / 36) + (product % 36);
    factor = factor === 2 ? 1 : 2;
  }

  const checkCode = (36 - (sum % 36)) % 36;
  const expected = valueToChar(checkCode);
  return value[value.length - 1] === expected;
}
