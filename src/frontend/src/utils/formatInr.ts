/**
 * Utility to format bigint/number amounts as integer INR display strings with ₹ prefix
 */
export function formatInr(amount: bigint | number): string {
  const numAmount = typeof amount === 'bigint' ? Number(amount) : amount;
  return `₹${numAmount.toLocaleString('en-IN')}`;
}

/**
 * Safe conversion from bigint to number for UI display
 */
export function bigintToNumber(value: bigint): number {
  return Number(value);
}
