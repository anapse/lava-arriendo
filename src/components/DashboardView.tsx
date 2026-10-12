import React, { useState } from 'react';
import { 
  WashingMachine, 
  CheckCircle, 
  XCircle, 
  Users, 
  DollarSign, 
  Plus, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp, 
  ArrowRight, 
  Check, 
  CreditCard,
  FileCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Washer, Customer, Rental, Payment, Activity, PaymentMethod } from '../types';
import { formatCOP, getComputedRentalStatus, addDaysToDate } from '../utils/formatters';

interface DashboardViewProps {
  washers: Washer[];
  customers: Customer[];
  rentals: Rental[];
  payments: Payment[];
  activities: Activity[];
  onOpenNewRental: () => void;
  onOpenNewPayment: () => void;
  onOpenNewCustomer: () => void;
  onOpenNewWasher: () => void;
  onOpenReturnModal: (rental: Rental) => void;
  onSelectCustomer: (customer: Customer) => void;
  onNavigateTab: (tab: any) => void;
  onSaveQuickRental: (rental: Rental, advancePaymentDetails?: { amount: number; paymentMethod: PaymentMethod; reference?: string }) => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  washers,
  customers,
  rentals,
  payments,
  activities,
  onOpenNewRental,
  onOpenNewPayment,
  onOpenNewCustomer,
  onOpenNewWasher,
  onOpenReturnModal,
  onSelectCustomer,
  onNavigateTab,
  onSaveQuickRental,
}) => {
  // Metric calculations
  const totalWashers = washers.length;
  const rentedWashers = washers.filter(w => w.status === 'alquilada').length;
  const availableWashers = washers.filter(w => w.status === 'disponible').length;
  const rentedPercentage = totalWashers > 0 ? Math.round((rentedWashers / totalWashers) * 100) : 0;
  const availablePercentage = totalWashers > 0 ? 100 - rentedPercentage : 0;
  const totalCustomers = customers.length;

  // Today's total earnings calculation
  const todayStr = '2026-10-11';
  const todayPayments = payments.filter(p => p.status === 'Pagado' && (p.date === todayStr || p.date.includes('2026-10-11')));
  const todayIncome = todayPayments.reduce((acc, p) => acc + p.amount, 0) || 280000;

  // Active rentals
  const activeRentals = rentals.filter(r => r.status !== 'finalizado' && r.status !== 'cancelado');

  // Mini-form state for quick rental card
  const [quickCustomerId, setQuickCustomerId] = useState<string>('');
  const [quickWasherId, setQuickWasherId] = useState<string>('');
  const [quickDays, setQuickDays] = useState<number>(1);
  const [quickDelivery, setQuickDelivery] = useState<'En tienda / Local' | 'A domicilio'>('En tienda / Local');
  const [quickNotes, setQuickNotes] = useState<string>('');
  const [isQuickSubmitting, setIsQuickSubmitting] = useState<boolean>(false);

  const selectedQuickWasher = washers.find(w => w.id === quickWasherId);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCustomerId || !quickWasherId) {
      onOpenNewRental();
      return;
    }

    const washer = washers.find(w => w.id === quickWasherId);
    if (!washer || washer.status !== 'disponible') {
      alert('Esta lavadora no está disponible');
      return;
    }

    const cust = customers.find(c => c.id === quickCustomerId);
    if (!cust) return;

    try {
      setIsQuickSubmitting(true);
      const newRentalId = 'A' + Math.floor(100 + Math.random() * 900);
      const total = quickDays * washer.pricePerDay;

      const newRental: Rental = {
        id: newRentalId,
        customerId: cust.id,
        customerName: cust.name,
        customerDoc: cust.documentId,
        customerPhone: cust.phone,
        customerAddress: cust.address,
        washerId: washer.id,
        washerModel: washer.model,
        startDate: todayStr,
        startTime: '10:00',
        endDate: addDaysToDate(todayStr, quickDays),
        endTime: '18:00',
        days: quickDays,
        pricePerDay: washer.pricePerDay,
        totalAmount: total,
        advancePayment: total,
        balanceDue: 0,
        deliveryType: quickDelivery,
        deliveryFee: 0,
        status: 'en_curso',
        observations: quickNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSaveQuickRental(newRental, {
        amount: total,
        paymentMethod: 'Efectivo',
      });

      // Reset
      setQuickCustomerId('');
      setQuickWasherId('');
      setQuickDays(1);
      setQuickNotes('');
      setIsQuickSubmitting(false);
    } catch (err) {
      setIsQuickSubmitting(false);
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 5 Top Summary Metric Cards (Matching Mockup 2) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Total de lavadoras */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/30">
            <WashingMachine className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total de lavadoras</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">{totalWashers}</span>
          </div>
        </div>

        {/* Card 2: Alquiladas hoy */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/30">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Alquiladas hoy</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">{rentedWashers}</span>
              <span className="text-xs font-bold text-emerald-600">{rentedPercentage}% del total</span>
            </div>
          </div>
        </div>

        {/* Card 3: Sin alquilar / Disponibles */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-rose-500/30">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Sin alquilar (Libres)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">{availableWashers}</span>
              <span className="text-xs font-bold text-rose-600">{availablePercentage}% del total</span>
            </div>
          </div>
        </div>

        {/* Card 4: Clientes registrados */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Clientes registrados</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">{totalCustomers}</span>
          </div>
        </div>

        {/* Card 5: Ingresos del día */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow col-span-2 md:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-sky-500/30">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-slate-500 block">Ingresos del día</span>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-black text-slate-900 tracking-tight">{formatCOP(todayIncome)}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                +12% vs. ayer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Quick Register Rental + Lavadoras Inventory + Calendar Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Rental Box (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Registrar Alquiler Rápido</h3>
            </div>
            <button
              onClick={onOpenNewRental}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline"
            >
              Formulario Completo
            </button>
          </div>

          <form onSubmit={handleQuickSubmit} className="p-5 space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Cliente *</label>
              <select
                value={quickCustomerId}
                onChange={(e) => setQuickCustomerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar cliente...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (CC: {c.documentId})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Lavadora disponible *</label>
              <select
                value={quickWasherId}
                onChange={(e) => setQuickWasherId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar lavadora...</option>
                {washers.map(w => (
                  <option key={w.id} value={w.id} disabled={w.status !== 'disponible'}>
                    #{w.id} - {w.model} {w.status === 'disponible' ? `(${formatCOP(w.pricePerDay)}/día)` : `[OCUPADA]`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tiempo (días)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={quickDays}
                  onChange={(e) => setQuickDays(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-bold text-center focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Precio por día</label>
                <input
                  type="text"
                  readOnly
                  value={selectedQuickWasher ? formatCOP(selectedQuickWasher.pricePerDay) : '$ 35.000'}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Entrega</label>
                <select
                  value={quickDelivery}
                  onChange={(e) => setQuickDelivery(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium"
                >
                  <option value="En tienda / Local">En tienda / Local</option>
                  <option value="A domicilio">A domicilio</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Total a cobrar</label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-900 font-extrabold text-sm">
                  {formatCOP(quickDays * (selectedQuickWasher?.pricePerDay || 35000))}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Observaciones (opcional)</label>
              <input
                type="text"
                placeholder="Ej. Sin observaciones"
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={isQuickSubmitting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isQuickSubmitting ? 'Registrando...' : 'Registrar Alquiler'}</span>
            </button>
          </form>
        </div>

        {/* Lavadoras Table (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WashingMachine className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Lavadoras</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenNewWasher}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Lavadora
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[340px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Modelo</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Precio/día</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {washers.slice(0, 8).map((w) => {
                    const isRented = w.status === 'alquilada';
                    return (
                      <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{w.id}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{w.model}</td>
                        <td className="py-2 px-3 text-slate-500">{w.type}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isRented
                                ? 'bg-rose-100 text-rose-700'
                                : w.status === 'disponible'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {w.status === 'alquilada' ? 'Alquilada' : w.status === 'disponible' ? 'Disponible' : 'Mantenimiento'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-800">
                          {formatCOP(w.pricePerDay)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
            <span className="text-slate-500">Mostrando {Math.min(8, washers.length)} de {washers.length} lavadoras</span>
            <button
              onClick={() => onNavigateTab('lavadoras')}
              className="text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              Ver inventario completo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mini Calendar Widget (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Calendario de Alquileres
              </h3>
              <div className="flex items-center gap-1 text-slate-500">
                <button className="p-1 hover:bg-slate-100 rounded"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-[11px] font-bold text-slate-800">Octubre 2026</span>
                <button className="p-1 hover:bg-slate-100 rounded"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1.5">
              <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
            </div>

            {/* Calendar Days Matrix (October 2026) */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-700">
              {/* Empty offset for Wednesday 1st Oct */}
              <span className="py-1 text-slate-300"></span>
              <span className="py-1 text-slate-300"></span>
              <span className="py-1 text-slate-300"></span>
              <span className="py-1">1</span>
              <span className="py-1">2</span>
              <span className="py-1">3</span>
              <span className="py-1">4</span>
              
              <span className="py-1">5</span>
              <span className="py-1">6</span>
              <span className="py-1">7</span>
              <span className="py-1 rounded-md bg-blue-100 text-blue-800 font-bold">8</span>
              <span className="py-1 rounded-md bg-blue-100 text-blue-800 font-bold">9</span>
              <span className="py-1 rounded-md bg-blue-500 text-white font-bold shadow-xs">10</span>
              <span className="py-1 rounded-md bg-emerald-500 text-white font-extrabold ring-2 ring-emerald-300">11</span>

              <span className="py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">12</span>
              <span className="py-1">13</span>
              <span className="py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">14</span>
              <span className="py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">15</span>
              <span className="py-1">16</span>
              <span className="py-1">17</span>
              <span className="py-1">18</span>

              <span className="py-1">19</span>
              <span className="py-1 rounded-md bg-rose-500 text-white font-bold">20</span>
              <span className="py-1">21</span>
              <span className="py-1 rounded-md bg-blue-100 text-blue-800 font-bold">22</span>
              <span className="py-1">23</span>
              <span className="py-1">24</span>
              <span className="py-1">25</span>

              <span className="py-1">26</span>
              <span className="py-1">27</span>
              <span className="py-1">28</span>
              <span className="py-1">29</span>
              <span className="py-1">30</span>
              <span className="py-1">31</span>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-slate-600">Alquileres activos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">Vencimiento próximo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-600">Vencido / En mora</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('calendario')}
            className="mt-3 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            Abrir calendario completo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Clientes + Alquileres Activos + Pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Clientes Table (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Clientes</h3>
              </div>
              <button
                onClick={onOpenNewCustomer}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700"
              >
                <Plus className="w-3 h-3" /> Agregar
              </button>
            </div>

            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Nombre</th>
                    <th className="py-2 px-3">Teléfono</th>
                    <th className="py-2 px-2 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {customers.slice(0, 6).map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCustomer(c)}
                      className="hover:bg-blue-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {c.name}
                        <span className="block text-[10px] text-slate-400 font-normal">CC: {c.documentId}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 text-[11px]">{c.phone}</td>
                      <td className="py-2 px-2 text-right">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
            <button
              onClick={() => onNavigateTab('clientes')}
              className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
            >
              Ver todos los clientes <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Alquileres Activos Table (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Alquileres Activos</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">{activeRentals.length} en curso</span>
            </div>

            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5">ID</th>
                    <th className="py-2 px-3">Cliente</th>
                    <th className="py-2 px-3">Lavadora</th>
                    <th className="py-2 px-2.5">Vencimiento</th>
                    <th className="py-2 px-2.5">Estado</th>
                    <th className="py-2 px-2.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeRentals.map((r) => {
                    const computedStatus = getComputedRentalStatus(r.status, r.endDate);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-2.5 font-mono font-bold text-blue-700">{r.id}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{r.customerName}</td>
                        <td className="py-2 px-3 text-slate-700 font-medium">{r.washerModel}</td>
                        <td className="py-2 px-2.5 text-slate-600 font-mono text-[11px]">{r.endDate}</td>
                        <td className="py-2 px-2.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              computedStatus === 'por_vencer'
                                ? 'bg-amber-100 text-amber-800'
                                : computedStatus === 'vencido'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {computedStatus === 'por_vencer' ? 'Por vencer' : computedStatus === 'vencido' ? 'Vencido' : 'En curso'}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-center">
                          <button
                            onClick={() => onOpenReturnModal(r)}
                            className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-[10px] border border-emerald-200 transition-colors cursor-pointer"
                            title="Registrar devolución y liberar lavadora"
                          >
                            Devolver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
            <span className="text-slate-500">Mostrando {activeRentals.length} contratos activos</span>
            <button
              onClick={() => onNavigateTab('alquileres')}
              className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
            >
              Gestionar todos los alquileres <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Pagos Table (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Pagos</h3>
              </div>
              <button
                onClick={onOpenNewPayment}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700"
              >
                <Plus className="w-3 h-3" /> Registrar
              </button>
            </div>

            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5">Cliente</th>
                    <th className="py-2 px-2.5">Monto (COP)</th>
                    <th className="py-2 px-2 text-right">Método</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payments.slice(0, 6).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-2.5 font-semibold text-slate-900">
                        {p.customerName}
                        <span className="block text-[10px] text-slate-400 font-normal">{p.date}</span>
                      </td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">
                        {formatCOP(p.amount)}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {p.paymentMethod}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
            <button
              onClick={() => onNavigateTab('pagos')}
              className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
            >
              Ver reporte de pagos <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Resumen del día + Estado general progress + Últimos registros */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Resumen del día (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Resumen del Día</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
              <span className="text-[11px] font-semibold text-emerald-800 block">Alquiladas hoy</span>
              <span className="text-2xl font-black text-emerald-700">{rentedWashers}</span>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-center">
              <span className="text-[11px] font-semibold text-blue-800 block">Disponibles</span>
              <span className="text-2xl font-black text-blue-700">{availableWashers}</span>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-center">
              <span className="text-[11px] font-semibold text-purple-800 block">Clientes atendidos</span>
              <span className="text-2xl font-black text-purple-700">6</span>
            </div>

            <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 text-center">
              <span className="text-[11px] font-semibold text-sky-800 block">Ingresos del día</span>
              <span className="text-lg font-black text-sky-700">{formatCOP(todayIncome)}</span>
            </div>
          </div>
        </div>

        {/* Estado general (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Estado General del Inventario</h3>
          </div>

          {/* Progress bar: Alquiladas */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Lavadoras alquiladas</span>
              <span className="text-emerald-700 font-bold">{rentedPercentage}% ({rentedWashers}/{totalWashers})</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${rentedPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Progress bar: Disponibles */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Lavadoras disponibles</span>
              <span className="text-blue-700 font-bold">{availablePercentage}% ({availableWashers}/{totalWashers})</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${availablePercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2 mt-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Capacidad operativa óptima. El sistema bloquea lavadoras alquiladas automáticamente.</span>
          </div>
        </div>

        {/* Últimos registros (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Últimos Registros (Bitácora)</h3>
          </div>

          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5"></span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{act.description}</p>
                  <p className="text-[10px] text-slate-400">{act.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
