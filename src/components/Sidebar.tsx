import React from 'react';
import { 
  Home, 
  WashingMachine, 
  Users, 
  FileText, 
  CreditCard, 
  BarChart3, 
  TrendingUp, 
  Settings,
  Sparkles,
  CloudCheck
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  washersCount: number;
  activeRentalsCount: number;
  firebaseConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  washersCount,
  activeRentalsCount,
  firebaseConnected,
}) => {
  const menuItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'inicio', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { id: 'lavadoras', label: 'Lavadoras', icon: <WashingMachine className="w-5 h-5" />, badge: washersCount },
    { id: 'clientes', label: 'Clientes', icon: <Users className="w-5 h-5" /> },
    { id: 'alquileres', label: 'Alquileres', icon: <FileText className="w-5 h-5" />, badge: activeRentalsCount },
    { id: 'pagos', label: 'Pagos', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'calendario', label: 'Calendario', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'estado', label: 'Estado del día', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'reportes', label: 'Reportes', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'configuracion', label: 'Configuración / Datos', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-[#0A3871] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-blue-900 shadow-xl select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-blue-800/80 flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shadow-md shadow-blue-950/40">
            <WashingMachine className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1 font-serif">
              Lav<span className="text-cyan-300">Arrienda</span>
            </h1>
            <p className="text-xs text-blue-200/90 font-medium">Agencia de Lavadoras</p>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-blue-900/60 border border-blue-700/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">Firebase Firestore</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
            Activo
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 translate-x-1'
                    : 'text-blue-100/80 hover:bg-blue-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-cyan-200' : 'text-blue-300'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white text-blue-700'
                        : 'bg-blue-800/80 text-blue-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Brand Mascot / Footer note */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-blue-900/80 to-blue-950/80 border border-blue-800/60 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 mb-2">
          <WashingMachine className="w-6 h-6 animate-bounce" />
        </div>
        <p className="text-xs font-semibold text-cyan-200">Tu ropa limpia,</p>
        <p className="text-[11px] text-blue-300">sin complicaciones</p>
        <div className="mt-2 pt-2 border-t border-blue-800/60 text-[10px] text-blue-300/80 flex items-center justify-center gap-1">
          <span>Tarifas en COP ($)</span>
        </div>
      </div>
    </aside>
  );
};
