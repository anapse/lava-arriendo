import React, { useState } from 'react';
import { 
  WashingMachine, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  Wrench, 
  Edit, 
  Trash2, 
  Sparkles,
  DollarSign,
  TrendingUp,
  X
} from 'lucide-react';
import { Washer, WasherStatus } from '../types';
import { formatCOP } from '../utils/formatters';

interface WashersViewProps {
  washers: Washer[];
  onSaveWasher: (washer: Washer) => Promise<void>;
  onDeleteWasher: (id: string) => Promise<void>;
  onStartRentalForWasher: (washerId: string) => void;
}

export const WashersView: React.FC<WashersViewProps> = ({
  washers,
  onSaveWasher,
  onDeleteWasher,
  onStartRentalForWasher,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'disponible' | 'alquilada' | 'mantenimiento'>('todos');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingWasher, setEditingWasher] = useState<Washer | null>(null);

  // Form state
  const [washerId, setWasherId] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [brand, setBrand] = useState<string>('LG');
  const [capacityKg, setCapacityKg] = useState<number>(12);
  const [type, setType] = useState<'Carga frontal' | 'Carga superior'>('Carga frontal');
  const [pricePerDay, setPricePerDay] = useState<number>(35000);
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [status, setStatus] = useState<WasherStatus>('disponible');
  const [notes, setNotes] = useState<string>('');

  const openAddModal = () => {
    const nextNum = String(washers.length + 1).padStart(2, '0');
    setEditingWasher(null);
    setWasherId(nextNum);
    setModel(`LG ${capacityKg}kg (${nextNum})`);
    setBrand('LG');
    setCapacityKg(12);
    setType('Carga frontal');
    setPricePerDay(35000);
    setSerialNumber(`SN-LAV-${nextNum}`);
    setStatus('disponible');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (w: Washer) => {
    setEditingWasher(w);
    setWasherId(w.id);
    setModel(w.model);
    setBrand(w.brand);
    setCapacityKg(w.capacityKg);
    setType(w.type);
    setPricePerDay(w.pricePerDay);
    setSerialNumber(w.serialNumber || '');
    setStatus(w.status);
    setNotes(w.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const washerData: Washer = {
      id: washerId,
      model,
      brand,
      capacityKg,
      type,
      pricePerDay,
      serialNumber,
      status,
      notes,
      totalRentalsCount: editingWasher?.totalRentalsCount || 0,
      totalEarnings: editingWasher?.totalEarnings || 0,
      createdAt: editingWasher?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await onSaveWasher(washerData);
    setIsModalOpen(false);
  };

  const filteredWashers = washers.filter((w) => {
    if (statusFilter !== 'todos' && w.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        w.id.toLowerCase().includes(q) ||
        w.model.toLowerCase().includes(q) ||
        w.brand.toLowerCase().includes(q) ||
        w.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <WashingMachine className="w-6 h-6 text-blue-600" />
            <span>Inventario de Lavadoras</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de máquinas, modelos, tarifas por día en COP, estado físico y mantenimiento
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Lavadora</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID, modelo, marca..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(
            [
              { id: 'todos', label: 'Todas' },
              { id: 'disponible', label: 'Disponibles' },
              { id: 'alquilada', label: 'Alquiladas' },
              { id: 'mantenimiento', label: 'Mantenimiento' },
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

      {/* Grid of Washer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredWashers.map((w) => {
          const isAvailable = w.status === 'disponible';
          const isRented = w.status === 'alquilada';

          return (
            <div
              key={w.id}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${
                isAvailable
                  ? 'border-slate-200/90 hover:border-blue-400'
                  : isRented
                  ? 'border-rose-200/80 bg-rose-50/20'
                  : 'border-amber-200/80 bg-amber-50/20'
              }`}
            >
              <div>
                {/* Card Top: ID and Status */}
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono font-extrabold text-xs">
                    #{w.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : isRented
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isAvailable ? 'Disponible' : isRented ? 'Alquilada' : 'En Mantenimiento'}
                  </span>
                </div>

                {/* Washer Visual & Title */}
                <div className="flex items-center gap-3 my-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isAvailable ? 'bg-blue-50 text-blue-600' : isRented ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <WashingMachine className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{w.model}</h3>
                    <p className="text-xs text-slate-500 font-medium">{w.brand} • {w.capacityKg} kg</p>
                  </div>
                </div>

                {/* Specs */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipo de carga:</span>
                    <span className="font-semibold text-slate-700">{w.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tarifa por día:</span>
                    <span className="font-extrabold text-blue-700 text-sm">{formatCOP(w.pricePerDay)}</span>
                  </div>
                  {w.serialNumber && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Serie:</span>
                      <span className="font-mono text-slate-500">{w.serialNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {isAvailable ? (
                  <button
                    onClick={() => onStartRentalForWasher(w.id)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors text-center cursor-pointer"
                  >
                    Alquilar Ahora
                  </button>
                ) : isRented ? (
                  <span className="flex-1 py-1.5 px-3 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs text-center border border-rose-200">
                    En Servicio
                  </span>
                ) : (
                  <button
                    onClick={() => onSaveWasher({ ...w, status: 'disponible' })}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors text-center"
                  >
                    Marcar Lista
                  </button>
                )}

                <button
                  onClick={() => openEditModal(w)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  title="Editar datos de la lavadora"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Washer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0A4D9A] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingWasher ? 'Editar Lavadora' : 'Agregar Nueva Lavadora'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ID / Número *</label>
                  <input
                    type="text"
                    value={washerId}
                    onChange={(e) => setWasherId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marca *</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                  >
                    <option value="LG">LG</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Daewoo">Daewoo</option>
                    <option value="Whirlpool">Whirlpool</option>
                    <option value="Mabe">Mabe</option>
                    <option value="Electrolux">Electrolux</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre / Modelo Completo *</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                  placeholder="Ej: LG 12kg (01)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacidad (Kg) *</label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={capacityKg}
                    onChange={(e) => setCapacityKg(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de carga *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                  >
                    <option value="Carga frontal">Carga frontal</option>
                    <option value="Carga superior">Carga superior</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tarifa por día (COP) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-extrabold text-blue-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado Operativo *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as WasherStatus)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="alquilada">Alquilada</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Número de Serie (Opcional)</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Ej: SN-LG-8849"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Guardar Lavadora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
