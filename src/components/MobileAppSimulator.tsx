import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  Users, 
  WashingMachine, 
  Menu, 
  Bell, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Clock, 
  RotateCcw,
  CheckCircle,
  CreditCard,
  Search,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Washer, Customer, Rental, Payment, Activity, NavigationTab } from '../types';
import { formatCOP, getComputedRentalStatus } from '../utils/formatters';

interface MobileAppSimulatorProps {
  washers: Washer[];
  customers: Customer[];
  rentals: Rental[];
  payments: Payment[];
  activities: Activity[];
  onOpenNewRental: () => void;
  onOpenReturnModal: (rental: Rental) => void;
  onSelectCustomer: (customer: Customer) => void;
  onOpenNewCustomer: () => void;
  onOpenNewPayment: () => void;
}

export const MobileAppSimulator: React.FC<MobileAppSimulatorProps> = ({
  washers,
  customers,
  rentals,
  payments,
  activities,
  onOpenNewRental,
  onOpenReturnModal,
  onSelectCustomer,
  onOpenNewCustomer,
  onOpenNewPayment,
}) => {
  const [mobileTab, setMobileTab] = useState<'inicio' | 'alquileres' | 'clientes' | 'lavadoras' | 'estado' | 'reportes'>('inicio');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const totalWashers = washers.length;
  const rentedWashers = washers.filter((w) => w.status === 'alquilada').length;
  const availableWashers = washers.filter((w) => w.status === 'disponible').length;
  const activeRentals = rentals.filter((r) => r.status !== 'finalizado' && r.status !== 'cancelado');

  return (
    <div className="flex justify-center items-start py-4">
      {/* Smartphone Frame (iPhone 15 / Galaxy style) */}
      <div className="w-full max-w-[420px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-900/50">
        {/* Dynamic Island / Speaker Notch */}
        <div className="w-28 h-5 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
        </div>

        {/* Inner Phone Screen */}
        <div className="bg-[#F8FAFC] rounded-[36px] overflow-hidden flex flex-col h-[780px] text-slate-800 font-sans shadow-inner relative">
          
          {/* Top Mobile Bar (Matching Mockup 1) */}
          <div className="bg-[#0A4D9A] text-white px-5 pt-3 pb-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-cyan-300">
                <WashingMachine className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight leading-tight">LavArrienda</h1>
                <p className="text-[10px] text-blue-200">Agencia de Lavadoras</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center relative">
                <Bell className="w-4 h-4 text-white" />
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-1.5"></span>
              </div>
            </div>
          </div>

          {/* Sub-header Screen Switcher Pills */}
          <div className="bg-[#0A4D9A] px-3 pb-3 flex gap-1.5 overflow-x-auto text-[11px] font-bold text-white/80 scrollbar-none shrink-0">
            {[
              { id: 'inicio', label: 'Resumen' },
              { id: 'alquileres', label: 'Alquileres' },
              { id: 'clientes', label: 'Clientes' },
              { id: 'lavadoras', label: 'Lavadoras' },
              { id: 'estado', label: 'Estado del día' },
              { id: 'reportes', label: 'Reportes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMobileTab(tab.id as any)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                  mobileTab === tab.id ? 'bg-white text-blue-900 font-extrabold shadow-xs' : 'bg-white/15 hover:bg-white/25'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Phone Screen Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* SCREEN: INICIO */}
            {mobileTab === 'inicio' && (
              <div className="space-y-4">
                {/* Resumen del día header */}
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-900 text-sm">Resumen del día</h3>
                  <span className="text-[11px] text-slate-500 font-semibold">11 de Octubre de 2026</span>
                </div>

                {/* 4 Colored Cards (Matching Mockup 1 Screen 2) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-sm space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <WashingMachine className="w-4 h-4" />
                    </div>
                    <span className="text-2xl font-black block">{totalWashers}</span>
                    <span className="text-[10px] text-blue-100 font-medium">Total lavadoras</span>
                  </div>

                  <div className="bg-emerald-500 text-white p-3.5 rounded-2xl shadow-sm space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-2xl font-black block">{rentedWashers}</span>
                    <span className="text-[10px] text-emerald-100 font-medium">Alquiladas</span>
                  </div>

                  <div className="bg-sky-500 text-white p-3.5 rounded-2xl shadow-sm space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-2xl font-black block">{availableWashers}</span>
                    <span className="text-[10px] text-sky-100 font-medium">Disponibles</span>
                  </div>

                  <div className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-sm space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-2xl font-black block">{customers.length}</span>
                    <span className="text-[10px] text-indigo-100 font-medium">Clientes</span>
                  </div>
                </div>

                {/* Card Ingresos del día */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex justify-between items-center">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block">Ingresos del día</span>
                    <span className="text-xl font-black text-slate-900">{formatCOP(280000)}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    +12% vs. ayer
                  </span>
                </div>

                {/* Próximos vencimientos */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-slate-800">Próximos vencimientos</h4>
                    <button onClick={() => setMobileTab('alquileres')} className="text-[11px] text-blue-600 font-bold hover:underline">
                      Ver todos
                    </button>
                  </div>

                  <div className="space-y-2">
                    {activeRentals.slice(0, 3).map((r) => {
                      const st = getComputedRentalStatus(r.status, r.endDate);
                      return (
                        <div key={r.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900 block">{r.customerName}</span>
                            <span className="text-[10px] text-slate-500">{r.washerModel}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st === 'por_vencer' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {st === 'por_vencer' ? 'Por vencer' : 'En curso'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Add Rental Button */}
                <button
                  onClick={onOpenNewRental}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Alquiler</span>
                </button>
              </div>
            )}

            {/* SCREEN: ALQUILERES */}
            {mobileTab === 'alquileres' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-900 text-sm">Alquileres Activos</h3>
                  <button onClick={onOpenNewRental} className="p-1.5 rounded-lg bg-blue-600 text-white">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {activeRentals.map((r) => (
                    <div key={r.id} className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-900 block">{r.customerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">DNI: {r.customerDoc}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {r.status === 'en_curso' ? 'En curso' : r.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-700">
                        <span className="font-semibold">{r.washerModel}</span> • <span className="font-bold text-blue-700">{formatCOP(r.pricePerDay)}/día</span>
                      </div>

                      <div className="text-[10px] text-slate-500 flex justify-between items-center pt-2 border-t border-slate-100">
                        <span>{r.startDate} al {r.endDate}</span>
                        <button
                          onClick={() => onOpenReturnModal(r)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Devolver
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN: CLIENTES */}
            {mobileTab === 'clientes' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-900 text-sm">Clientes Registrados</h3>
                  <button onClick={onOpenNewCustomer} className="p-1.5 rounded-lg bg-blue-600 text-white">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {customers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onSelectCustomer(c)}
                      className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between text-xs cursor-pointer hover:border-blue-400"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs">
                          {c.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{c.name}</span>
                          <span className="text-[10px] text-slate-400">CC: {c.documentId} • {c.phone}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN: LAVADORAS */}
            {mobileTab === 'lavadoras' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-900 text-sm">Lavadoras ({washers.length})</h3>
                </div>

                <div className="space-y-2">
                  {washers.map((w) => (
                    <div key={w.id} className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                          w.status === 'disponible' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          <WashingMachine className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{w.model}</span>
                          <span className="text-[11px] font-bold text-blue-700">{formatCOP(w.pricePerDay)}/día</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === 'disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {w.status === 'disponible' ? 'Disponible' : 'Alquilada'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN: ESTADO */}
            {mobileTab === 'estado' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Estado Diario</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                    <span className="text-[10px] text-emerald-800 font-bold block">Alquiladas</span>
                    <span className="text-2xl font-black text-emerald-700">{rentedWashers}</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                    <span className="text-[10px] text-blue-800 font-bold block">Disponibles</span>
                    <span className="text-2xl font-black text-blue-700">{availableWashers}</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Desglose por modelo:</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span>LG 12kg</span><strong className="text-blue-700">3 alquiladas</strong></div>
                    <div className="flex justify-between"><span>Samsung 10kg</span><strong className="text-blue-700">2 alquiladas</strong></div>
                    <div className="flex justify-between"><span>Daewoo 8kg</span><strong className="text-blue-700">1 alquilada</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN: REPORTES */}
            {mobileTab === 'reportes' && (
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm">Reportes de Ingresos</h3>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-xs text-slate-500">Ingresos Totales (Semana)</span>
                  <p className="text-2xl font-black text-blue-900">{formatCOP(1280000)}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">+12% vs. período anterior</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation Bar (Matching Mockup 1) */}
          <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between shrink-0 text-slate-600 text-[10px] font-semibold">
            <button
              onClick={() => setMobileTab('inicio')}
              className={`flex flex-col items-center gap-0.5 ${mobileTab === 'inicio' ? 'text-blue-600 font-bold' : ''}`}
            >
              <Home className="w-5 h-5" />
              <span>Inicio</span>
            </button>
            <button
              onClick={() => setMobileTab('alquileres')}
              className={`flex flex-col items-center gap-0.5 ${mobileTab === 'alquileres' ? 'text-blue-600 font-bold' : ''}`}
            >
              <FileText className="w-5 h-5" />
              <span>Alquileres</span>
            </button>
            <button
              onClick={() => setMobileTab('clientes')}
              className={`flex flex-col items-center gap-0.5 ${mobileTab === 'clientes' ? 'text-blue-600 font-bold' : ''}`}
            >
              <Users className="w-5 h-5" />
              <span>Clientes</span>
            </button>
            <button
              onClick={() => setMobileTab('lavadoras')}
              className={`flex flex-col items-center gap-0.5 ${mobileTab === 'lavadoras' ? 'text-blue-600 font-bold' : ''}`}
            >
              <WashingMachine className="w-5 h-5" />
              <span>Lavadoras</span>
            </button>
            <button
              onClick={() => setMobileTab('estado')}
              className={`flex flex-col items-center gap-0.5 ${mobileTab === 'estado' ? 'text-blue-600 font-bold' : ''}`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Estado</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
