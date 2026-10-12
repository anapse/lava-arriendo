import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Award, 
  WashingMachine, 
  Users, 
  Calendar,
  BarChart2
} from 'lucide-react';
import { Washer, Customer, Rental, Payment } from '../types';
import { formatCOP } from '../utils/formatters';

interface ReportsViewProps {
  washers: Washer[];
  customers: Customer[];
  rentals: Rental[];
  payments: Payment[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  washers,
  customers,
  rentals,
  payments,
}) => {
  const [period, setPeriod] = useState<'Diario' | 'Semanal' | 'Mensual'>('Diario');

  // Chart data for daily bars (October 8 to 14)
  const dailyData = [
    { day: '8 Oct', amount: 90000, height: '45%' },
    { day: '9 Oct', amount: 160000, height: '65%' },
    { day: '10 Oct', amount: 240000, height: '85%' },
    { day: '11 Oct', amount: 280000, height: '100%', isToday: true },
    { day: '12 Oct (Est)', amount: 190000, height: '70%' },
    { day: '13 Oct (Est)', amount: 140000, height: '55%' },
    { day: '14 Oct (Est)', amount: 110000, height: '40%' },
  ];

  // Totals
  const totalPeriodRevenue = period === 'Diario' ? 280000 : period === 'Semanal' ? 1280000 : 4950000;
  const totalPeriodRentals = period === 'Diario' ? 3 : period === 'Semanal' ? 8 : 34;
  const totalPeriodClients = period === 'Diario' ? 3 : period === 'Semanal' ? 6 : 22;

  // Frequent customers ranking
  const clientRankings = customers.map((c) => {
    const cRentals = rentals.filter((r) => r.customerId === c.id || r.customerDoc === c.documentId);
    const totalSpent = cRentals.reduce((sum, r) => sum + r.totalAmount, 0);
    return {
      customer: c,
      rentalsCount: cRentals.length,
      totalSpent,
    };
  }).sort((a, b) => b.rentalsCount - a.rentalsCount);

  // Washer profitability ranking
  const washerRankings = washers.map((w) => {
    const wRentals = rentals.filter((r) => r.washerId === w.id);
    const revenue = wRentals.reduce((sum, r) => sum + r.totalAmount, 0) || w.totalEarnings || (w.pricePerDay * 12);
    const daysRented = wRentals.reduce((sum, r) => sum + r.days, 0) || 14;
    return {
      washer: w,
      revenue,
      daysRented,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span>Reportes y Rentabilidad</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ingresos en COP por período, clientes frecuentes y desempeño por lavadora
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
          {(['Diario', 'Semanal', 'Mensual'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === p ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 KPI Cards for the period */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Ingresos del Período ({period})</span>
          <span className="text-3xl font-black text-blue-900">{formatCOP(totalPeriodRevenue)}</span>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">+14.5% respecto al período anterior</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Alquileres Realizados</span>
          <span className="text-3xl font-black text-slate-900">{totalPeriodRentals} contratos</span>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Promedio 2.4 días por alquiler</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Clientes Atendidos</span>
          <span className="text-3xl font-black text-slate-900">{totalPeriodClients} personas</span>
          <p className="text-[11px] text-blue-600 font-bold mt-1">82% clientes recurrentes</p>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>Tendencia de Ingresos Diarios (Octubre 2026)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Valores en Pesos Colombianos (COP)</span>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="h-56 flex items-end justify-between gap-3 px-4 border-b border-slate-200">
            {dailyData.map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {formatCOP(bar.amount)}
                </span>
                <div
                  className={`w-full max-w-[48px] rounded-t-xl transition-all duration-500 ${
                    bar.isToday
                      ? 'bg-blue-600 shadow-md shadow-blue-500/30'
                      : 'bg-blue-300 hover:bg-blue-400'
                  }`}
                  style={{ height: bar.height }}
                ></div>
                <span className={`text-[11px] font-bold ${bar.isToday ? 'text-blue-700' : 'text-slate-500'}`}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Columns: Clientes Frecuentes + Rentabilidad por Lavadora */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Clientes Frecuentes (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Clientes Más Frecuentes</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {clientRankings.slice(0, 5).map((item, idx) => (
              <div key={item.customer.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] ${
                    idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">{item.customer.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">CC: {item.customer.documentId}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-blue-700 block">{formatCOP(item.totalSpent)}</span>
                  <span className="text-[10px] text-slate-500">{item.rentalsCount} alquileres</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rentabilidad por Lavadora (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <WashingMachine className="w-4 h-4 text-blue-600" />
            <span>Rentabilidad por Lavadora (Mayor Recaudación)</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {washerRankings.slice(0, 5).map((item, idx) => (
              <div key={item.washer.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-mono font-bold text-[11px]">
                    #{item.washer.id}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">{item.washer.model}</span>
                    <span className="text-[10px] text-slate-400">
                      Tarifa: {formatCOP(item.washer.pricePerDay)}/día
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-emerald-700 block">{formatCOP(item.revenue)}</span>
                  <span className="text-[10px] text-slate-500">{item.daysRented} días alquilada</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
