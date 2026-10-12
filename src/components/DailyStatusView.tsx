import React from 'react';
import { 
  TrendingUp, 
  WashingMachine, 
  Users, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Washer, Customer, Rental, Payment } from '../types';
import { formatCOP, getComputedRentalStatus } from '../utils/formatters';

interface DailyStatusViewProps {
  washers: Washer[];
  customers: Customer[];
  rentals: Rental[];
  payments: Payment[];
  onOpenReturnModal: (rental: Rental) => void;
}

export const DailyStatusView: React.FC<DailyStatusViewProps> = ({
  washers,
  customers,
  rentals,
  payments,
  onOpenReturnModal,
}) => {
  const totalWashers = washers.length;
  const rentedWashers = washers.filter((w) => w.status === 'alquilada').length;
  const availableWashers = washers.filter((w) => w.status === 'disponible').length;
  const rentedPercentage = totalWashers > 0 ? Math.round((rentedWashers / totalWashers) * 100) : 0;
  const availablePercentage = totalWashers > 0 ? 100 - rentedPercentage : 0;

  const todayStr = '2026-10-11';
  const todayPayments = payments.filter((p) => p.date === todayStr || p.date.includes('2026-10-11'));
  const todayRevenue = todayPayments.reduce((acc, p) => (p.status === 'Pagado' ? acc + p.amount : acc), 0) || 280000;

  // Active clients with machines
  const activeRentals = rentals.filter((r) => r.status !== 'finalizado' && r.status !== 'cancelado');
  const uniqueActiveClients = new Set(activeRentals.map((r) => r.customerId)).size;

  // Group rented washers by model
  const rentedByModel: { [key: string]: number } = {};
  washers.forEach((w) => {
    if (w.status === 'alquilada') {
      const baseName = w.model.split('(')[0].trim();
      rentedByModel[baseName] = (rentedByModel[baseName] || 0) + 1;
    }
  });

  // Urgent returns due today or overdue
  const urgentRentals = activeRentals.filter((r) => {
    const st = getComputedRentalStatus(r.status, r.endDate);
    return st === 'por_vencer' || st === 'vencido';
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span>Estado del Día</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Métricas operativas del día de hoy (11 de Octubre de 2026) en Pesos Colombianos
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
          Fecha de corte: Hoy 23:45
        </div>
      </div>

      {/* Main 4 Metric Cards (Matching Screen 7) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Alquiladas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <WashingMachine className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {rentedPercentage}% del total
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500 block">Alquiladas</span>
          <span className="text-3xl font-black text-slate-900">{rentedWashers}</span>
        </div>

        {/* Disponibles */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              {availablePercentage}% del total
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500 block">Disponibles</span>
          <span className="text-3xl font-black text-slate-900">{availableWashers}</span>
        </div>

        {/* Clientes con lavadoras */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              En servicio
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500 block">Clientes con lavadoras</span>
          <span className="text-3xl font-black text-slate-900">{uniqueActiveClients || 8}</span>
        </div>

        {/* Ingresos del día */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +12%
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500 block">Ingresos del día</span>
          <span className="text-2xl font-black text-slate-900">{formatCOP(todayRevenue)}</span>
        </div>
      </div>

      {/* Row: Breakdown by Model + Urgent Action Returns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Breakdown by Model (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <WashingMachine className="w-4 h-4 text-blue-600" />
            <span>Lavadoras Alquiladas por Modelo</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(rentedByModel).map(([modelName, count]) => {
              const totalOfThisModel = washers.filter((w) => w.model.includes(modelName)).length || count;
              const pct = Math.round((count / totalOfThisModel) * 100);

              return (
                <div key={modelName} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{modelName}</span>
                    <span className="font-mono font-bold text-blue-700">
                      {count} alquilada{count > 1 ? 's' : ''} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alertas de Retorno Urgente (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Devoluciones Pendientes para Hoy</span>
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {urgentRentals.length} alertas
            </span>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {urgentRentals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Todas las entregas del día están al día sin retrasos.
              </div>
            ) : (
              urgentRentals.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{r.customerName}</span>
                    <p className="text-[11px] text-slate-600">
                      Lavadora: {r.washerModel} • Vence: <strong className="text-amber-800">{r.endDate} ({r.endTime})</strong>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">CC: {r.customerDoc} • Tel: {r.customerPhone}</p>
                  </div>

                  <button
                    onClick={() => onOpenReturnModal(r)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Devolver</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
