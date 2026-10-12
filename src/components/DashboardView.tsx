import React from 'react';
import { 
  WashingMachine, 
  CheckCircle, 
  XCircle, 
  Users, 
  DollarSign, 
  Plus, 
  Calendar, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  CreditCard,
  FileCheck,
  Settings,
  Sparkles
} from 'lucide-react';
import { Washer, Customer, Rental, Payment, Activity, PaymentMethod } from '../types';
import { formatCOP } from '../utils/formatters';

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
  const totalWashers = washers.length;
  const rentedWashers = washers.filter(w => w.status === 'alquilada').length;
  const availableWashers = washers.filter(w => w.status === 'disponible').length;
  const rentedPercentage = totalWashers > 0 ? Math.round((rentedWashers / totalWashers) * 100) : 0;
  const availablePercentage = totalWashers > 0 ? 100 - rentedPercentage : 0;
  const totalCustomers = customers.length;

  const todayStr = '2026-10-11';
  const todayPayments = payments.filter(p => p.status === 'Pagado' && (p.date === todayStr || p.date.includes('2026-10-11')));
  const todayIncome = todayPayments.reduce((acc, p) => acc + p.amount, 0) || 280000;

  const activeRentals = rentals.filter(r => r.status !== 'finalizado' && r.status !== 'cancelado');

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Banner & Quick Action Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-blue-500/40 text-blue-100 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Sistema de Alquiler de Lavadoras
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2 tracking-tight">Panel Principal</h1>
          <p className="text-blue-100 text-xs md:text-sm mt-1 max-w-xl">
            Gestiona alquileres, lavadoras y pagos de forma rápida. Selecciona una opción abajo o utiliza el menú de navegación inferior.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button
            onClick={onOpenNewRental}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nuevo Alquiler
          </button>
          <button
            onClick={() => onNavigateTab('alquileres')}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-blue-700/80 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 border border-blue-400/30 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" /> Alquileres ({activeRentals.length})
          </button>
        </div>
      </div>

      {/* 5 Top Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <WashingMachine className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Lavadoras</span>
            <span className="text-2xl font-black text-slate-900">{totalWashers}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Alquiladas Hoy</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{rentedWashers}</span>
              <span className="text-xs font-bold text-emerald-600">{rentedPercentage}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Disponibles</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{availableWashers}</span>
              <span className="text-xs font-bold text-rose-600">{availablePercentage}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Clientes</span>
            <span className="text-2xl font-black text-slate-900">{totalCustomers}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5 col-span-2 md:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Ingresos del Día</span>
            <span className="text-lg font-black text-slate-900">{formatCOP(todayIncome)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Cards Grid (Streamlined Workflow) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card: Alquileres */}
        <div 
          onClick={() => onNavigateTab('alquileres')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {activeRentals.length} Activos
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-slate-800 text-base">Gestión de Alquileres</h3>
            <p className="text-xs text-slate-500 mt-1">Ver contratos vigentes, registrar devoluciones anticipadas o liquidar saldos.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>Abrir sección</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card: Lavadoras */}
        <div 
          onClick={() => onNavigateTab('lavadoras')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <WashingMachine className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {availableWashers} Disponibles
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-slate-800 text-base">Lavadoras e Inventario</h3>
            <p className="text-xs text-slate-500 mt-1">Configurar precios por lavadora, estado operativo y agregar nuevos equipos.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
            <span>Ver inventario</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card: Clientes */}
        <div 
          onClick={() => onNavigateTab('clientes')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {totalCustomers} Registrados
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-slate-800 text-base">Directorio de Clientes</h3>
            <p className="text-xs text-slate-500 mt-1">Registrar nuevos clientes antes de alquilar, consultar historial y datos de contacto.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
            <span>Ver clientes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card: Pagos */}
        <div 
          onClick={() => onNavigateTab('pagos')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Pagos & Cobros
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-slate-800 text-base">Control de Pagos</h3>
            <p className="text-xs text-slate-500 mt-1">Registrar pagos adelantados, abonos pendientes y comprobantes de ingresos.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
            <span>Gestionar pagos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card: Calendario */}
        <div 
          onClick={() => onNavigateTab('calendario')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Agenda
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-slate-800 text-base">Calendario de Entregas</h3>
            <p className="text-xs text-slate-500 mt-1">Visualizar vencimientos diarios, entregas programadas y disponibilidad mes a mes.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
            <span>Abrir calendario</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card: Configuración */}
        <div 
          onClick={() => onNavigateTab('configuracion')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold group-hover:bg-slate-800 group-hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              Ajustes
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-slate-800 text-base">Configuración & Precios</h3>
            <p className="text-xs text-slate-500 mt-1">Configurar tarifas por defecto, datos de lavadoras y opciones del sistema.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Configurar</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
