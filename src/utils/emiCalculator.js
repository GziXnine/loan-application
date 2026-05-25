/**
 * LendSwift EMI Calculator
 *
 * Provides the EMI formula, total cost computation, processing fee calculation,
 * EMI-to-income ratio checks, and Indian number-system formatting utilities.
 */

// ============================================================
// Loan-type-aware default rates
// ============================================================

const RATE_MAP = {
  personal: { annualRate: 0.12, processingFeeRate: 0.015 },
  home:     { annualRate: 0.085, processingFeeRate: 0.005 },
  business: { annualRate: 0.14, processingFeeRate: 0.02 },
};

const FALLBACK_RATE = { annualRate: 0.12, processingFeeRate: 0.01 };

/**
 * Returns the default annual interest rate for a given loan type.
 * @param {'personal'|'home'|'business'} loanType
 * @returns {number} annual interest rate (decimal, e.g. 0.12 = 12%)
 */
export function getInterestRateForLoanType(loanType) {
  return (RATE_MAP[loanType] || FALLBACK_RATE).annualRate;
}

/**
 * Returns the default processing-fee rate for a given loan type.
 * @param {'personal'|'home'|'business'} loanType
 * @returns {number} fee rate (decimal, e.g. 0.015 = 1.5%)
 */
export function getProcessingFeeRate(loanType) {
  return (RATE_MAP[loanType] || FALLBACK_RATE).processingFeeRate;
}

// ============================================================
// Core financial computations
// ============================================================

/**
 * Calculates EMI using the standard reducing-balance formula.
 * EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
 */
export function calculateEmi({ principal, annualRate, tenureMonths }) {
  if (!principal || !tenureMonths) return 0;
  const rate = annualRate ?? FALLBACK_RATE.annualRate;
  const monthlyRate = rate / 12;
  if (monthlyRate === 0) return principal / tenureMonths;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * Total amount repaid over the full tenure.
 */
export function calculateTotalRepayment({ emi, tenureMonths }) {
  if (!emi || !tenureMonths) return 0;
  return emi * tenureMonths;
}

/**
 * Total interest component = totalRepayment − principal.
 */
export function calculateTotalInterest({ totalRepayment, principal }) {
  if (!totalRepayment || !principal) return 0;
  return totalRepayment - principal;
}

/**
 * One-time processing fee charged on the principal.
 */
export function calculateProcessingFee({ principal, feeRate }) {
  if (!principal) return 0;
  const rate = feeRate ?? FALLBACK_RATE.processingFeeRate;
  return principal * rate;
}

// ============================================================
// EMI-to-income ratio
// ============================================================

/**
 * Calculates the EMI-to-income ratio.
 * If co-applicant income is provided it is added to the monthly income.
 *
 * @returns {{ ratio: number, exceedsThreshold: boolean, totalIncome: number }}
 */
export function calculateEmiToIncomeRatio({ emi, monthlyIncome, coapplicantIncome = 0 }) {
  const totalIncome = (Number(monthlyIncome) || 0) + (Number(coapplicantIncome) || 0);
  if (!totalIncome || !emi) return { ratio: 0, exceedsThreshold: false, totalIncome };
  const ratio = emi / totalIncome;
  return {
    ratio,
    exceedsThreshold: ratio > 0.5,
    totalIncome,
  };
}

// ============================================================
// Pre-approval summary builder
// ============================================================

/**
 * Builds a complete pre-approval financial summary object.
 * Automatically picks the correct interest & fee rates for the loan type
 * when explicit rates are not supplied.
 */
export function buildPreApprovalSummary({
  principal,
  tenureMonths,
  loanType,
  annualRate,
  processingFeeRate,
  monthlyIncome,
  coapplicantIncome,
}) {
  const rate = annualRate ?? getInterestRateForLoanType(loanType);
  const feeRate = processingFeeRate ?? getProcessingFeeRate(loanType);

  const emi = calculateEmi({ principal, annualRate: rate, tenureMonths });
  const totalRepayment = calculateTotalRepayment({ emi, tenureMonths });
  const totalInterest = calculateTotalInterest({ totalRepayment, principal });
  const processingFee = calculateProcessingFee({ principal, feeRate });
  const netDisbursal = principal - processingFee;
  const emiRatio = calculateEmiToIncomeRatio({ emi, monthlyIncome, coapplicantIncome });

  return {
    annualRate: rate,
    processingFeeRate: feeRate,
    emi,
    totalRepayment,
    totalInterest,
    processingFee,
    netDisbursal,
    emiToIncomeRatio: emiRatio.ratio,
    exceedsEmiThreshold: emiRatio.exceedsThreshold,
    totalMonthlyIncome: emiRatio.totalIncome,
  };
}

// ============================================================
// Indian number-system formatters
// ============================================================

/**
 * Formats a number as ₹X,XX,XXX using the Indian locale.
 */
export function formatINR(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '₹0';
  return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

/**
 * Formats a number in compact Indian notation.
 *   – values ≥ 1 Cr  → "X.XX Cr"
 *   – values ≥ 1 L   → "X.XX L"
 *   – values ≥ 1 K   → "X.XX K"
 *   – else            → "₹X"
 */
export function formatINRCompact(value) {
  const num = Number(value);
  if (!num || Number.isNaN(num)) return '₹0';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(2)} K`;
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Formats a decimal as a percentage string, e.g. 0.12 → "12.00%"
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0%';
  return `${(Number(value) * 100).toFixed(decimals)}%`;
}
