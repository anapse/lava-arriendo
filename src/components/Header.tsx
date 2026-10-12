import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  PlusCircle, 
  Bell, 
  ShieldCheck,
  CreditCard,
  LogOut,
  UserCheck,
  Menu,
  X,
  WashingMachine,
  FileText,
  BarChart3,
  TrendingUp,
  Settings
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      setDateStr(`${day}/${month}/${year}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const urgentCount = rentals.filter(r => {
    if (r.status === 'finalizado' || r.status === 'cancelado') return false;
    const computed = getComputedRentalStatus(r.status, r.endDate);
    return computed === 'vencido' || computed === 'por_vencer';
  }).length;

  return (
    <header className="h-18 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-50 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Trigger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Date & Time pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-slate-700 text-xs font-semibold">
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          <span className="font-mono">{dateStr}</span>
          <span className="text-slate-300">|</span>
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="font-mono text-slate-800">{timeStr}</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Alerts Bell */}
        <button
          onClick={onOpenAlertsModal}
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {urgentCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
              {urgentCount}
            </span>
          )}
        </button>

        {/* Primary New Rental Button */}
        <button
          onClick={onOpenNewRental}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Alquiler</span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl p-4 flex flex-col gap-2 z-40 md:hidden">
          <button onClick={() => { onNavigateTab?.('usuarios'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 font-bold">
            <UserCheck className="w-5 h-5 text-blue-600" /> Gestionar Usuarios
          </button>
          <button onClick={() => { onNavigateTab?.('lavadoras'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 font-bold">
            <WashingMachine className="w-5 h-5 text-blue-600" /> Lavadoras
          </button>
          <button onClick={() => { onLogout?.(); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-rose-50 text-rose-700 font-bold">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      )}
    </header>
  );
};
