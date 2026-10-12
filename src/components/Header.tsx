import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  PlusCircle, 
  Smartphone, 
  Monitor, 
  Bell, 
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Rental } from '../types';
import { getComputedRentalStatus } from '../utils/formatters';

interface HeaderProps {
  onOpenNewRental: () => void;
  onOpenNewPayment: () => void;
  viewMode: 'desktop' | 'mobile';
  setViewMode: (mode: 'desktop' | 'mobile') => void;
  rentals: Rental[];
  onOpenAlertsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewRental,
  onOpenNewPayment,
  viewMode,
  setViewMode,
  rentals,
  onOpenAlertsModal,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setDateStr(now.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute urgent alerts count
  const urgentCount = rentals.filter(r => {
    if (r.status === 'finalizado' || r.status === 'cancelado') return false;
    const computed = getComputedRentalStatus(r.status, r.endDate);
    return computed === 'vencido' || computed === 'por_vencer';
  }).length;

  return (
    <header className="h-18 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Date & Time pill */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-slate-700 text-xs font-semibold">
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          <span>{dateStr || '11 de Octubre de 2026'}</span>
          <span className="text-slate-300">|</span>
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="font-mono text-slate-800">{timeStr || '17:36:00'}</span>
        </div>

        {/* Currency reminder */}
        <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          🇨🇴 Pesos Colombianos (COP)
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'desktop'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Vista de escritorio completa"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Escritorio</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'mobile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Simulador de App Móvil como en el mockup"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulador Móvil</span>
          </button>
        </div>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlertsModal}
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Ver alertas de vencimiento"
        >
          <Bell className="w-5 h-5" />
          {urgentCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
              {urgentCount}
            </span>
          )}
        </button>

        {/* Quick Payment Button */}
        <button
          onClick={onOpenNewPayment}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold transition-all"
        >
          <CreditCard className="w-4 h-4" />
          <span>Registrar Pago</span>
        </button>

        {/* Primary New Rental Button */}
        <button
          onClick={onOpenNewRental}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Alquiler</span>
        </button>

        {/* Admin profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            A
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Administrador</p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> En línea
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
