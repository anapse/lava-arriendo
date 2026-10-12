import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  RotateCcw, 
  Receipt, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Edit
} from 'lucide-react';
import { Rental } from '../types';
import { formatCOP, getComputedRentalStatus } from '../utils/formatters';

interface RentalsViewProps {
  rentals: Rental[];
  onOpenNewRental: () => void;
  onOpenReturnModal: (rental: Rental) => void;
  onOpenReceiptModal: (rental: Rental) => void;
  onOpenEditModal?: (rental: Rental) => void;
}

export const RentalsView: React.FC<RentalsViewProps> = ({
  rentals,
  onOpenNewRental,
  onOpenReturnModal,
  onOpenReceiptModal,
  onOpenEditModal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'en_curso' | 'por_vencer' | 'vencido' | 'finalizado'>('todos');

  const filteredRentals = rentals.filter((r) => {
    const computedStatus = getComputedRentalStatus(r.status, r.endDate);
    
    // Status filter
    if (statusFilter !== 'todos') {
      if (statusFilter === 'finalizado' && r.status !== 'finalizado') return false;
      if (statusFilter === 'en_curso' && (computedStatus !== 'en_curso' || r.status === 'finalizado')) return false;
      if (statusFilter === 'por_vencer' && (computedStatus !== 'por_vencer' || r.status === 'finalizado')) return false;
      if (statusFilter === 'vencido' && (computedStatus !== 'vencido' || r.status === 'finalizado')) return false;
    }

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerDoc.toLowerCase().includes(q) ||
        r.washerModel.toLowerCase().includes(q) ||
        r.washerId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Gestión de Alquileres</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Control de contratos activos, fechas de vencimiento, devoluciones e historial en Pesos Colombianos (COP)
          </p>
        </div>

        <button
          onClick={onOpenNewRental}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Alquiler</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, cédula, modelo, ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(
            [
              { id: 'todos', label: 'Todos' },
              { id: 'en_curso', label: 'En curso' },
              { id: 'por_vencer', label: 'Por vencer' },
              { id: 'vencido', label: 'Vencidos' },
              { id: 'finalizado', label: 'Finalizados' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rentals Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Contrato</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Lavadora</th>
                <th className="py-3.5 px-4">Fechas (Inicio - Fin)</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Saldo Pendiente</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron alquileres con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((r) => {
                  const computedStatus = getComputedRentalStatus(r.status, r.endDate);
                  const isReturned = r.status === 'finalizado';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {r.id}
                      </td>

                      {/* Cliente */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{r.customerName}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          CC: {r.customerDoc} • Tel: {r.customerPhone}
                        </span>
                        {r.customerAddress && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-xs">
                            📍 {r.customerAddress}
                          </span>
                        )}
                      </td>

                      {/* Lavadora */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{r.washerModel}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: #{r.washerId}</span>
                      </td>

                      {/* Fechas */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {r.startDate} al {r.endDate}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {r.days} {r.days === 1 ? 'día' : 'días'} ({formatCOP(r.pricePerDay)}/día)
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        {formatCOP(r.totalAmount)}
                      </td>

                      {/* Saldo Pendiente */}
                      <td className="py-3 px-4">
                        {r.balanceDue > 0 && !isReturned ? (
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {formatCOP(r.balanceDue)}
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Pagado
                          </span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-4">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            <CheckCircle className="w-3 h-3 text-slate-500" /> Devuelta
                          </span>
                        ) : computedStatus === 'vencido' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                            <AlertCircle className="w-3 h-3" /> Vencido
                          </span>
                        ) : computedStatus === 'por_vencer' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" /> Por vencer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            <Clock className="w-3 h-3" /> En curso
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Botón Devolución */}
                          {!isReturned && (
                            <button
                              onClick={() => onOpenReturnModal(r)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              title="Registrar devolución física y liberar máquina"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Devolver</span>
                            </button>
                          )}

                          {/* Editar / Modificar Contrato */}
                          {!isReturned && onOpenEditModal && (
                            <button
                              onClick={() => onOpenEditModal(r)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                              title="Modificar fechas o cancelar alquiler"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Recibo */}
                          <button
                            onClick={() => onOpenReceiptModal(r)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                            title="Ver e imprimir comprobante"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>

                          {/* WhatsApp */}
                          {r.customerPhone && (
                            <a
                              href={`https://wa.me/57${r.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Hola ${r.customerName}, le saludamos de LavArrienda respecto a su alquiler de la lavadora ${r.washerModel} (Contrato #${r.id}).`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Contactar al cliente por WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
