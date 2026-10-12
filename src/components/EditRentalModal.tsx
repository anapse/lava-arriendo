import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle, CheckCircle, Trash2, Ban } from 'lucide-react';
import { Rental, RentalStatus } from '../types';
import { formatCOP, addDaysToDate, calculateDaysBetween } from '../utils/formatters';

interface EditRentalModalProps {
  rental: Rental | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveEdit: (updatedRental: Rental) => Promise<void>;
  onCancelRental: (rentalId: string, washerId: string) => Promise<void>;
}

export const EditRentalModal: React.FC<EditRentalModalProps> = ({
  rental,
  isOpen,
  onClose,
  onSaveEdit,
  onCancelRental,
}) => {
  if (!isOpen || !rental) return null;

  const [startDate, setStartDate] = useState<string>(rental.startDate);
  const [startTime, setStartTime] = useState<string>(rental.startTime);
  const [endDate, setEndDate] = useState<string>(rental.endDate);
  const [endTime, setEndTime] = useState<string>(rental.endTime);
  const [days, setDays] = useState<number>(rental.days);
  const [observations, setObservations] = useState<string>(rental.observations || '');
  const [advancePayment, setAdvancePayment] = useState<number>(rental.advancePayment);
  const [deliveryType, setDeliveryType] = useState<'En tienda / Local' | 'A domicilio'>(rental.deliveryType);
  const [deliveryFee, setDeliveryFee] = useState<number>(rental.deliveryFee || 0);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (rental) {
      setStartDate(rental.startDate);
      setStartTime(rental.startTime);
      setEndDate(rental.endDate);
      setEndTime(rental.endTime);
      setDays(rental.days);
      setObservations(rental.observations || '');
      setAdvancePayment(rental.advancePayment);
      setDeliveryType(rental.deliveryType);
      setDeliveryFee(rental.deliveryFee || 0);
      setShowCancelModal(false);
    }
  }, [rental]);

  const handleDaysChange = (newDays: number) => {
    const d = Math.max(1, newDays);
    setDays(d);
    setEndDate(addDaysToDate(startDate, d));
  };

  const subtotal = days * rental.pricePerDay;
  const totalAmount = subtotal + (deliveryType === 'A domicilio' ? deliveryFee : 0);
  const balanceDue = Math.max(0, totalAmount - advancePayment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const updated: Rental = {
        ...rental,
        startDate,
        startTime,
        endDate,
        endTime,
        days,
        totalAmount,
        advancePayment,
        balanceDue,
        deliveryType,
        deliveryFee: deliveryType === 'A domicilio' ? deliveryFee : 0,
        observations,
        updatedAt: new Date().toISOString(),
      };
      await onSaveEdit(updated);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      setIsSubmitting(true);
      await onCancelRental(rental.id, rental.washerId);
      setIsSubmitting(false);
      setShowCancelModal(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#0A4D9A] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Modificar Alquiler #{rental.id}</h3>
            <p className="text-xs text-blue-200">{rental.customerName} • {rental.washerModel}</p>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Days and Dates */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiempo (Días)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={days}
                  onChange={(e) => handleDaysChange(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-bold text-center text-blue-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-bold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hora Retorno</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2"
                />
              </div>
            </div>
          </div>

          {/* Delivery & Financials */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Modalidad Entrega</label>
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium"
              >
                <option value="En tienda / Local">En tienda / Local</option>
                <option value="A domicilio">A domicilio</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Adelanto en Efectivo (COP)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={advancePayment}
                onChange={(e) => setAdvancePayment(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Total Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500 block">Total Recalculado:</span>
              <strong className="text-blue-900 text-sm">{formatCOP(totalAmount)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Saldo Pendiente:</span>
              <strong className="text-amber-800 text-sm">{formatCOP(balanceDue)}</strong>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Observaciones</label>
            <input
              type="text"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ej: Cambio de fecha solicitado por el cliente"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Ban className="w-4 h-4" />
              <span>Cancelar Alquiler</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-sm"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal for Cancellation / Deletion */}
      {showCancelModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">¿Cancelar y Anular Alquiler #{rental.id}?</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                La lavadora <strong className="text-slate-800 font-mono">#{rental.washerId}</strong> quedará disponible inmediatamente y el monto total de <strong className="text-rose-700">{formatCOP(rental.totalAmount)}</strong> se descontará de los ingresos y totales registrados.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                No, volver
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmCancel}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20"
              >
                {isSubmitting ? 'Anulando...' : 'Sí, anular y descontar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
