import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Receipt, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  X,
  FileCheck
} from 'lucide-react';
import { Payment, PaymentMethod, Rental, Customer } from '../types';
import { formatCOP } from '../utils/formatters';

interface PaymentsViewProps {
  payments: Payment[];
  rentals: Rental[];
  customers: Customer[];
  onSavePayment: (payment: Payment) => Promise<void>;
  onOpenReceiptModalForPayment?: (payment: Payment) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  rentals,
  customers,
  onSavePayment,
  onOpenReceiptModalForPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [rentalId, setRentalId] = useState<string>('');
  const [amount, setAmount] = useState<number>(35000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Nequi');
  const [referenceOrVoucher, setReferenceOrVoucher] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const totalCollected = payments.reduce((acc, p) => (p.status === 'Pagado' ? acc + p.amount : acc), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pid = 'P' + Math.floor(100 + Math.random() * 900);
    const newPayment: Payment = {
      id: pid,
      rentalId: rentalId || undefined,
      customerId: 'C-GEN',
      customerName,
      amount,
      date: todayStr,
      time: nowTime,
      paymentMethod,
      status: 'Pagado',
      referenceOrVoucher: referenceOrVoucher || `REC-${pid}`,
      notes,
      createdAt: new Date().toISOString(),
    };
    await onSavePayment(newPayment);
    setIsModalOpen(false);
  };

  const filteredPayments = payments.filter((p) => {
    if (filterMethod !== 'todos' && p.paymentMethod !== filterMethod) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.id.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        (p.referenceOrVoucher && p.referenceOrVoucher.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <span>Control de Pagos e Ingresos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registro contable, adelantos, liquidaciones y comprobantes en Pesos Colombianos (COP)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] font-bold text-emerald-600 uppercase block">Total Recaudado</span>
            <span className="text-lg font-black text-emerald-800">{formatCOP(totalCollected)}</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Pago</span>
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, recibo, referencia..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(
            [
              { id: 'todos', label: 'Todos los métodos' },
              { id: 'Efectivo', label: 'Efectivo' },
              { id: 'Nequi', label: 'Nequi' },
              { id: 'Daviplata', label: 'Daviplata' },
              { id: 'Transferencia Bancaria', label: 'Transferencia' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMethod(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterMethod === m.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Recibo ID</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Contrato</th>
                <th className="py-3.5 px-4">Fecha y Hora</th>
                <th className="py-3.5 px-4">Método</th>
                <th className="py-3.5 px-4">Comprobante</th>
                <th className="py-3.5 px-4">Monto (COP)</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{p.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{p.customerName}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{p.rentalId || '—'}</td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="font-semibold block">{p.date}</span>
                    <span className="text-[10px] text-slate-400">{p.time}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    {p.referenceOrVoucher || '—'}
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900 text-sm">
                    {formatCOP(p.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Pagado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0A4D9A] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Registrar Nuevo Pago</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Cliente *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monto a Registrar (COP) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-black text-emerald-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Método de Pago *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Nequi">Nequi</option>
                    <option value="Daviplata">Daviplata</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nro. Contrato Alquiler (Opcional)</label>
                  <input
                    type="text"
                    value={rentalId}
                    onChange={(e) => setRentalId(e.target.value)}
                    placeholder="Ej: A001"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Comprobante / Nro. Transacción</label>
                  <input
                    type="text"
                    value={referenceOrVoucher}
                    onChange={(e) => setReferenceOrVoucher(e.target.value)}
                    placeholder="Ej: NQ-99321"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas o concepto</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Pago de saldo pendiente"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Guardar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
