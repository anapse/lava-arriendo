import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  WashingMachine, 
  DollarSign, 
  AlertTriangle,
  RotateCcw,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Rental, PaymentMethod } from '../types';
import { formatCOP, calculateDaysBetween } from '../utils/formatters';

interface ReturnRentalModalProps {
  rental: Rental | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReturn: (
    rentalId: string,
    washerId: string,
    customerName: string,
    finalBalancePaid?: number,
    paymentMethod?: PaymentMethod,
    returnDate?: string,
    actualDays?: number,
    skipRefund?: boolean,
    refundAmount?: number
  ) => Promise<void>;
}

export const ReturnRentalModal: React.FC<ReturnRentalModalProps> = ({
  rental,
  isOpen,
  onClose,
  onConfirmReturn,
}) => {
  if (!isOpen || !rental) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [returnDate, setReturnDate] = useState<string>(todayStr);

  // Calculate actual days used from rental.startDate to returnDate
  const actualDays = Math.max(1, calculateDaysBetween(rental.startDate, returnDate));
  const proportionalTotal = (actualDays * rental.pricePerDay) + (rental.deliveryFee || 0);
  const totalPaid = rental.advancePayment; // Amount paid so far
  const potentialRefund = totalPaid > proportionalTotal ? totalPaid - proportionalTotal : 0;

  const [skipRefund, setSkipRefund] = useState<boolean>(false);
  const [collectBalance, setCollectBalance] = useState<boolean>(rental.balanceDue > 0);
  const [balanceAmount, setBalanceAmount] = useState<number>(rental.balanceDue);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [washerCondition, setWasherCondition] = useState<string>('Excelente estado');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onConfirmReturn(
        rental.id,
        rental.washerId,
        rental.customerName,
        collectBalance ? balanceAmount : 0,
        paymentMethod,
        returnDate,
        actualDays,
        skipRefund,
        potentialRefund
      );

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-600 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Registrar Devolución</h2>
              <p className="text-[11px] text-emerald-100">Liberar lavadora y liquidar contrato</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Summary Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Cliente:</span>
              <span className="font-bold text-slate-800">{rental.customerName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Lavadora:</span>
              <span className="font-bold text-blue-700">{rental.washerModel}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Período original:</span>
              <span className="font-medium text-slate-700">{rental.startDate} al {rental.endDate} ({rental.days} días)</span>
            </div>

            {/* Return Date Selector */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Fecha real de devolución:</span>
              </label>
              <input
                type="date"
                value={returnDate}
                min={rental.startDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
              />
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-slate-500 font-semibold">Días efectivos usados:</span>
              <span className="font-bold text-emerald-700">{actualDays} {actualDays === 1 ? 'día' : 'días'}</span>
            </div>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-semibold">Total original contrato:</span>
              <span className="font-bold text-slate-900">{formatCOP(rental.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Adelanto / Pagado:</span>
              <span className="font-bold text-emerald-700">{formatCOP(totalPaid)}</span>
            </div>
            {actualDays < rental.days && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Costo proporcional ({actualDays} días):</span>
                <span className="font-bold text-blue-700">{formatCOP(proportionalTotal)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-800">Saldo pendiente:</span>
              <span className={`font-extrabold ${rental.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {formatCOP(rental.balanceDue)}
              </span>
            </div>
          </div>

          {/* Early Return Refund Box */}
          {actualDays < rental.days && potentialRefund > 0 && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-900">Devolución Anticipada (Días no usados)</span>
              </div>
              <p className="text-xs text-emerald-800">
                El cliente devolvió la lavadora antes del plazo. El monto a devolver por los días no usados es de{' '}
                <span className="font-extrabold text-emerald-900">{formatCOP(potentialRefund)}</span>.
              </p>

              <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipRefund}
                  onChange={(e) => setSkipRefund(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-emerald-900">
                  Cliente no requiere devolución de dinero (no devolver resto del pago)
                </span>
              </label>
            </div>
          )}

          {/* Settle pending balance */}
          {rental.balanceDue > 0 && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">Cobro de Saldo Pendiente</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monto a liquidar (COP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={rental.balanceDue}
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(Number(e.target.value))}
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Nequi">Nequi</option>
                    <option value="Daviplata">Daviplata</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Inspection state */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estado físico de la lavadora devuelta
            </label>
            <select
              value={washerCondition}
              onChange={(e) => setWasherCondition(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
            >
              <option value="Excelente estado">Excelente estado (Limpia y funcional)</option>
              <option value="Buen estado">Buen estado (Operativa)</option>
              <option value="Requiere limpieza">Requiere limpieza leve</option>
              <option value="Requiere revisión técnica">Requiere revisión técnica / mantenimiento</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Procesando devolución...' : 'Confirmar Devolución y Liberar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

