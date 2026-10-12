import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  WashingMachine, 
  DollarSign, 
  Truck, 
  AlertCircle, 
  CheckCircle2, 
  Plus
} from 'lucide-react';
import { Washer, Customer, Rental, PaymentMethod } from '../types';
import { formatCOP, addDaysToDate, calculateDaysBetween } from '../utils/formatters';

interface RegisterRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  washers: Washer[];
  customers: Customer[];
  onSaveRental: (
    rental: Rental,
    advancePaymentDetails?: { amount: number; paymentMethod: PaymentMethod; reference?: string }
  ) => Promise<void>;
  preselectedWasherId?: string;
  onQuickAddCustomer?: () => void;
}

export const RegisterRentalModal: React.FC<RegisterRentalModalProps> = ({
  isOpen,
  onClose,
  washers,
  customers,
  onSaveRental,
  preselectedWasherId,
  onQuickAddCustomer,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [clientDoc, setClientDoc] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientAddress, setClientAddress] = useState<string>('');
  
  const [selectedWasherId, setSelectedWasherId] = useState<string>(preselectedWasherId || '');
  const [pricePerDay, setPricePerDay] = useState<number>(35000);
  
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [days, setDays] = useState<number>(1);
  const [endDate, setEndDate] = useState<string>(addDaysToDate(todayStr, 1));
  const [endTime, setEndTime] = useState<string>('18:00');
  
  const [deliveryType, setDeliveryType] = useState<'En tienda / Local' | 'A domicilio'>('En tienda / Local');
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  
  const [advancePayment, setAdvancePayment] = useState<number>(0);
  const [advanceMethod, setAdvanceMethod] = useState<PaymentMethod>('Efectivo');
  const [advanceRef, setAdvanceRef] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync washer when preselectedWasherId changes
  useEffect(() => {
    if (preselectedWasherId) {
      setSelectedWasherId(preselectedWasherId);
      const w = washers.find(item => item.id === preselectedWasherId);
      if (w) setPricePerDay(w.pricePerDay);
    } else if (washers.length > 0 && !selectedWasherId) {
      const firstAvailable = washers.find(w => w.status === 'disponible');
      if (firstAvailable) {
        setSelectedWasherId(firstAvailable.id);
        setPricePerDay(firstAvailable.pricePerDay);
      }
    }
  }, [preselectedWasherId, washers]);

  // When customer changes, autofill DNI, phone, address
  useEffect(() => {
    const cust = customers.find(c => c.id === selectedCustomerId);
    if (cust) {
      setClientDoc(cust.documentId);
      setClientPhone(cust.phone);
      setClientAddress(cust.address);
    }
  }, [selectedCustomerId, customers]);

  // When washer changes, update pricePerDay
  const handleWasherChange = (id: string) => {
    setSelectedWasherId(id);
    const w = washers.find(item => item.id === id);
    if (w) {
      setPricePerDay(w.pricePerDay);
    }
  };

  // Sync days & endDate
  const handleDaysChange = (newDays: number) => {
    const d = Math.max(1, newDays);
    setDays(d);
    setEndDate(addDaysToDate(startDate, d));
  };

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    setEndDate(addDaysToDate(newStart, days));
  };

  const handleEndDateChange = (newEnd: string) => {
    setEndDate(newEnd);
    const diff = calculateDaysBetween(startDate, newEnd);
    setDays(diff);
  };

  // Calculate totals
  const subtotal = days * pricePerDay;
  const totalAmount = subtotal + (deliveryType === 'A domicilio' ? deliveryFee : 0);
  const balanceDue = Math.max(0, totalAmount - advancePayment);

  // Auto-set initial advance payment to full total when totalAmount changes if advance was untouched
  useEffect(() => {
    if (advancePayment === 0) {
      setAdvancePayment(totalAmount);
    }
  }, [totalAmount]);

  if (!isOpen) return null;

  const currentWasher = washers.find(w => w.id === selectedWasherId);
  const isCurrentWasherOccupied = currentWasher && currentWasher.status !== 'disponible';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedCustomerId) {
      setErrorMessage('Por favor selecciona o registra un cliente.');
      return;
    }

    if (!selectedWasherId) {
      setErrorMessage('Por favor selecciona una lavadora del inventario.');
      return;
    }

    if (isCurrentWasherOccupied) {
      setErrorMessage(`¡Atención! La lavadora #${selectedWasherId} está marcada como ${currentWasher?.status}. No puedes alquilarla hasta que se devuelva o libere.`);
      return;
    }

    if (days < 1) {
      setErrorMessage('El tiempo de alquiler debe ser de al menos 1 día.');
      return;
    }

    try {
      setIsSubmitting(true);
      const cust = customers.find(c => c.id === selectedCustomerId);
      const newRentalId = 'A' + Math.floor(100 + Math.random() * 900);

      const rentalData: Rental = {
        id: newRentalId,
        customerId: selectedCustomerId,
        customerName: cust ? cust.name : 'Cliente',
        customerDoc: clientDoc,
        customerPhone: clientPhone,
        customerAddress: clientAddress,
        washerId: selectedWasherId,
        washerModel: currentWasher ? currentWasher.model : `Lavadora #${selectedWasherId}`,
        startDate,
        startTime,
        endDate,
        endTime,
        days,
        pricePerDay,
        totalAmount,
        advancePayment,
        balanceDue,
        deliveryType,
        deliveryFee: deliveryType === 'A domicilio' ? deliveryFee : 0,
        status: 'en_curso',
        observations,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSaveRental(
        rentalData,
        advancePayment > 0
          ? {
              amount: advancePayment,
              paymentMethod: advanceMethod,
              reference: advanceRef,
            }
          : undefined
      );

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Ocurrió un error al registrar el alquiler. Revisa los datos.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0A4D9A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-cyan-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Registrar Nuevo Alquiler</h2>
              <p className="text-xs text-blue-200">Ingresa los datos para generar el contrato de alquiler</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Cliente */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Datos del Cliente *</span>
              </label>
              {onQuickAddCustomer && (
                <button
                  type="button"
                  onClick={onQuickAddCustomer}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Nuevo Cliente
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Seleccionar Cliente *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                >
                  <option value="">-- Selecciona un cliente registrado --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (CC: {c.documentId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Cédula / DNI del cliente
                </label>
                <input
                  type="text"
                  value={clientDoc}
                  onChange={(e) => setClientDoc(e.target.value)}
                  placeholder="Ej: 1023456789"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej: 311 987 6543"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Dirección de Entrega
                </label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Ej: Carrera 15 # 45-20"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Lavadora */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <WashingMachine className="w-4 h-4 text-blue-600" />
              <span>Lavadora y Tarifa *</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Seleccionar Lavadora (ID y Modelo) *
                </label>
                <select
                  value={selectedWasherId}
                  onChange={(e) => handleWasherChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                >
                  <option value="">-- Seleccionar lavadora --</option>
                  {washers.map((w) => {
                    const isAvailable = w.status === 'disponible';
                    return (
                      <option key={w.id} value={w.id} disabled={!isAvailable}>
                        #{w.id} - {w.model} ({w.type}) {isAvailable ? `[Disponible - ${formatCOP(w.pricePerDay)}/día]` : `[NO DISPONIBLE: ${w.status.toUpperCase()}]`}
                      </option>
                    );
                  })}
                </select>
                {isCurrentWasherOccupied && (
                  <p className="mt-1 text-xs text-rose-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Esta lavadora está {currentWasher?.status}. Por favor selecciona una libre.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Precio por día (COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Fechas y Horas */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Fechas, Horarios y Duración *</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Fecha de inicio *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Hora de inicio
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tiempo (días) *
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={days}
                    onChange={(e) => handleDaysChange(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-center text-blue-700 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Fecha vencimiento *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Hora entrega/retorno
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modalidad de entrega */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Modalidad de Entrega
                </label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="En tienda / Local">En tienda / Local (Cliente recoge)</option>
                  <option value="A domicilio">A domicilio (Flete)</option>
                </select>
              </div>

              {deliveryType === 'A domicilio' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Costo de Flete / Domicilio (COP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Liquidación y Pago */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Subtotal Alquiler</span>
                <p className="text-sm font-semibold text-slate-800">{days} días × {formatCOP(pricePerDay)}</p>
                <p className="text-base font-bold text-blue-700">{formatCOP(subtotal)}</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Total Contrato</span>
                <p className="text-xs text-slate-500">Incluye flete ({formatCOP(deliveryType === 'A domicilio' ? deliveryFee : 0)})</p>
                <p className="text-xl font-extrabold text-blue-900">{formatCOP(totalAmount)}</p>
              </div>

              <div className={`p-3 rounded-lg border shadow-xs ${balanceDue > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Saldo Pendiente</span>
                <p className="text-xs text-slate-500">{balanceDue === 0 ? 'Completamente pagado' : 'Por cobrar en devolución'}</p>
                <p className={`text-xl font-extrabold ${balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {formatCOP(balanceDue)}
                </p>
              </div>
            </div>

            {/* Registro de Adelanto */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adelanto Pagado Hoy (COP)
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalAmount}
                  step="1000"
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(Number(e.target.value))}
                  className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Método de Pago del Adelanto
                </label>
                <select
                  value={advanceMethod}
                  onChange={(e) => setAdvanceMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comprobante / Nro. Recibo
                </label>
                <input
                  type="text"
                  value={advanceRef}
                  onChange={(e) => setAdvanceRef(e.target.value)}
                  placeholder="Ej: NQ-84920"
                  className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Observaciones adicionales
            </label>
            <input
              type="text"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ej: Entregar manguera larga, timbre 202, paga con billete de $50k"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(isCurrentWasherOccupied)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando en Firebase...' : 'Confirmar y Alquilar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
