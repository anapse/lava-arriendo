import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw,
  User,
  WashingMachine
} from 'lucide-react';
import { Rental } from '../types';
import { formatCOP, getComputedRentalStatus } from '../utils/formatters';

interface CalendarViewProps {
  rentals: Rental[];
  onOpenReturnModal: (rental: Rental) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  rentals,
  onOpenReturnModal,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(11);
  const [currentMonth, setCurrentMonth] = useState<string>('Octubre 2026');

  // October 2026 starts on Thursday (1st)
  // Let's create the 31 days of October
  const daysInOctober = Array.from({ length: 31 }, (_, i) => i + 1);

  // Helper to format date string for day number
  const getDateString = (day: number) => `2026-10-${String(day).padStart(2, '0')}`;

  // Find rentals active on a given day
  const getRentalsForDay = (day: number) => {
    const dStr = getDateString(day);
    return rentals.filter((r) => {
      return r.startDate <= dStr && r.endDate >= dStr;
    });
  };

  // Find rentals due specifically on a given day
  const getRentalsExpiringOnDay = (day: number) => {
    const dStr = getDateString(day);
    return rentals.filter((r) => r.endDate === dStr);
  };

  const selectedDayRentals = getRentalsForDay(selectedDay);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <span>Calendario de Alquileres</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualización interactiva de entregas programadas, vencimientos y alertas de devolución
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-500"></span>
            <span className="text-slate-600 font-medium">Alquiler Activo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500"></span>
            <span className="text-slate-600 font-medium">Vence Hoy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500"></span>
            <span className="text-slate-600 font-medium">Retraso / Vencido</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-300"></span>
            <span className="text-slate-600 font-medium">Finalizado</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
          {/* Month Navigator */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900">{currentMonth}</h3>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                Hoy (11 Oct)
              </button>
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
            <span>LUN</span><span>MAR</span><span>MIÉ</span><span>JUE</span><span>VIE</span><span>SÁB</span><span>DOM</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset for 1 Oct 2026 (Thursday) -> 3 blank slots */}
            <div className="h-24 p-2 bg-slate-50/50 rounded-xl opacity-40"></div>
            <div className="h-24 p-2 bg-slate-50/50 rounded-xl opacity-40"></div>
            <div className="h-24 p-2 bg-slate-50/50 rounded-xl opacity-40"></div>

            {daysInOctober.map((day) => {
              const dayRentals = getRentalsForDay(day);
              const expiringCount = getRentalsExpiringOnDay(day).length;
              const isToday = day === 11;
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-24 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/30 bg-blue-50/30 shadow-xs'
                      : isToday
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-slate-100 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-800'
                      }`}
                    >
                      {day}
                    </span>

                    {expiringCount > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                        {expiringCount} vto
                      </span>
                    )}
                  </div>

                  {/* Badges / Rental pill count */}
                  <div className="space-y-1">
                    {dayRentals.slice(0, 2).map((r) => (
                      <div
                        key={r.id}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate ${
                          r.status === 'finalizado'
                            ? 'bg-slate-100 text-slate-600'
                            : r.endDate === getDateString(day)
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                        title={`${r.customerName} - ${r.washerModel}`}
                      >
                        {r.customerName.split(' ')[0]} ({r.washerId})
                      </div>
                    ))}
                    {dayRentals.length > 2 && (
                      <span className="text-[9px] font-semibold text-slate-400 block text-right">
                        +{dayRentals.length - 2} más
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Alquileres del {selectedDay} de Octubre</span>
              </h3>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                {selectedDayRentals.length} activos
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {selectedDayRentals.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No hay contratos programados para este día.
                </div>
              ) : (
                selectedDayRentals.map((r) => {
                  const computedStatus = getComputedRentalStatus(r.status, r.endDate);
                  const isDueOnSelectedDay = r.endDate === getDateString(selectedDay);

                  return (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{r.customerName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">Contrato #{r.id}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.status === 'finalizado'
                              ? 'bg-slate-200 text-slate-700'
                              : isDueOnSelectedDay
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {r.status === 'finalizado' ? 'Finalizado' : isDueOnSelectedDay ? 'Vence este día' : 'En curso'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 flex items-center gap-2">
                        <WashingMachine className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold">{r.washerModel}</span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex justify-between">
                        <span>{r.startDate} al {r.endDate}</span>
                        <span className="font-bold text-slate-800">{formatCOP(r.totalAmount)}</span>
                      </div>

                      {r.status !== 'finalizado' && (
                        <div className="pt-2 border-t border-slate-200 flex justify-end">
                          <button
                            onClick={() => onOpenReturnModal(r)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Registrar Devolución</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Usa el calendario para planificar entregas y rutas de devolución
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
