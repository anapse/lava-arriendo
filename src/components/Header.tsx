import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  PlusCircle, 
  Smartphone, 
  Monitor, 
  Bell, 
  ShieldCheck,
  CreditCard,
  LogOut,
  UserCheck
} from 'lucide-react';
import { Rental } from '../types';
import { getComputedRentalStatus } from '../utils/formatters';

interface HeaderProps {
  onOpenNewRental: () => void;
  onOpenNewPayment: () => void;
  rentals: Rental[];
  onOpenAlertsModal: () => void;
  currentUser?: { name: string; email: string; role: string };
  onLogout?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewRental,
  onOpenNewPayment,
  rentals,
  onOpenAlertsModal,
  currentUser,
  onLogout,
  onNavigateTab,
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
      <div className="flex items-center gap-2.5">
        {/* Currency reminder */}
        <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          🇨🇴 COP
        </span>

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

        {/* Admin profile & Logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <button
            onClick={() => onNavigateTab && onNavigateTab('usuarios')}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity text-left cursor-pointer"
            title="Ir al panel de usuarios y administradores"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {currentUser?.name?.charAt(0) || 'D'}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser?.name || 'Administrador'}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {currentUser?.role || 'Dueño Principal'}
              </p>
            </div>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
