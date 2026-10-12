import React from 'react';
import { X, Bell, AlertTriangle, Clock, RotateCcw, CreditCard, WashingMachine } from 'lucide-react';
import { Rental, Washer } from '../types';
import { formatCOP, getComputedRentalStatus } from '../utils/formatters';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentals: Rental[];
  washers: Washer[];
  onOpenReturnModal: (rental: Rental) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  rentals,
  washers,
  onOpenReturnModal,
}) => {
  if (!isOpen) return null;

  const overdueRentals = rentals.filter((r) => {
    if (r.status === 'finalizado' || r.status === 'cancelado') return false;
    return getComputedRentalStatus(r.status, r.endDate) === 'vencido';
  });

  const dueTodayRentals = rentals.filter((r) => {
    if (r.status === 'finalizado' || r.status === 'cancelado') return false;
    return getComputedRentalStatus(r.status, r.endDate) === 'por_vencer';
  });

  const pendingBalanceRentals = rentals.filter((r) => {
    return r.status !== 'finalizado' && r.balanceDue > 0;
  });

  const maintenanceWashers = washers.filter((w) => w.status === 'mantenimiento');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#0A4D9A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Alertas y Notificaciones del Sistema</h3>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section 1: Vencidos */}
          {overdueRentals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-rose-700 font-bold uppercase tracking-wider text-[11px]">
                <AlertTriangle className="w-4 h-4" />
                <span>Alquileres Vencidos con Retraso ({overdueRentals.length})</span>
              </div>
              <div className="space-y-2">
                {overdueRentals.map((r) => (
                  <div key={r.id} className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-rose-900">{r.customerName} ({r.washerModel})</p>
                      <p className="text-[11px] text-rose-700">Venció: {r.endDate} • Tel: {r.customerPhone}</p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenReturnModal(r);
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px]"
                    >
                      Devolver
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Vencen Hoy */}
          {dueTodayRentals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-amber-700 font-bold uppercase tracking-wider text-[11px]">
                <Clock className="w-4 h-4" />
                <span>Alquileres por Vencer Hoy ({dueTodayRentals.length})</span>
              </div>
              <div className="space-y-2">
                {dueTodayRentals.map((r) => (
                  <div key={r.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-amber-900">{r.customerName} ({r.washerModel})</p>
                      <p className="text-[11px] text-amber-700">Retorno programado hoy a las {r.endTime}</p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenReturnModal(r);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px]"
                    >
                      Devolver
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Saldos Pendientes */}
          {pendingBalanceRentals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold uppercase tracking-wider text-[11px]">
                <CreditCard className="w-4 h-4" />
                <span>Saldos Pendientes de Cobro ({pendingBalanceRentals.length})</span>
              </div>
              <div className="space-y-2">
                {pendingBalanceRentals.map((r) => (
                  <div key={r.id} className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-blue-900">{r.customerName}</p>
                      <p className="text-[11px] text-blue-700 font-bold">Saldo: {formatCOP(r.balanceDue)}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Contrato #{r.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {overdueRentals.length === 0 && dueTodayRentals.length === 0 && pendingBalanceRentals.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No hay alertas pendientes en este momento. La operación está al día.
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
