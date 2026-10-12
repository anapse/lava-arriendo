/**
 * Currency formatter for Colombian Pesos (COP)
 * Example: 35000 -> "$ 35.000"
 */
export function formatCOP(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$ 0';
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate difference in days between two YYYY-MM-DD dates (inclusive or minimum 1)
 */
export function calculateDaysBetween(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

/**
 * Add days to a date string (YYYY-MM-DD)
 */
export function addDaysToDate(dateStr: string, days: number): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Format date for friendly display
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Determine dynamic status of a rental based on current date
 */
export function getComputedRentalStatus(
  status: string,
  endDate: string,
  currentDateStr: string = '2026-10-11'
): 'finalizado' | 'cancelado' | 'vencido' | 'por_vencer' | 'en_curso' {
  if (status === 'finalizado') return 'finalizado';
  if (status === 'cancelado') return 'cancelado';

  const end = new Date(endDate);
  const current = new Date(currentDateStr);
  
  // Set both to midnight for pure day comparison
  end.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);

  const diffDays = Math.round((end.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'vencido';
  } else if (diffDays === 0 || diffDays === 1) {
    return 'por_vencer';
  }
  return 'en_curso';
}
