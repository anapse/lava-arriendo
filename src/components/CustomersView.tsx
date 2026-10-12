import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  FileText, 
  MessageSquare, 
  Calendar, 
  CreditCard, 
  X,
  UserCheck
} from 'lucide-react';
import { Customer, Rental, Payment } from '../types';
import { formatCOP } from '../utils/formatters';

interface CustomersViewProps {
  customers: Customer[];
  rentals: Rental[];
  payments: Payment[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  onSaveCustomer: (customer: Customer) => Promise<void>;
  onStartRentalForCustomer: (customerId: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  rentals,
  payments,
  selectedCustomer,
  onSelectCustomer,
  onSaveCustomer,
  onStartRentalForCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [documentId, setDocumentId] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [referenceLocation, setReferenceLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const openNewCustomerModal = () => {
    setName('');
    setDocumentId('');
    setPhone('');
    setAddress('');
    setReferenceLocation('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = 'C' + String(customers.length + 1).padStart(3, '0');
    const newCust: Customer = {
      id: newId,
      name,
      documentId,
      phone,
      address,
      referenceLocation,
      status: 'Activo',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await onSaveCustomer(newCust);
    setIsAddModalOpen(false);
  };

  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.documentId.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  // Rental and payment histories for selected customer
  const customerRentals = selectedCustomer
    ? rentals.filter((r) => r.customerId === selectedCustomer.id || r.customerDoc === selectedCustomer.documentId)
    : [];

  const customerPayments = selectedCustomer
    ? payments.filter((p) => p.customerId === selectedCustomer.id || p.customerName === selectedCustomer.name)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Gestión de Clientes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ficha individual con DNI/Cédula, teléfono, dirección, historial de alquileres, pagos y estado
          </p>
        </div>

        <button
          onClick={openNewCustomerModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex gap-3 items-center">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, cédula o teléfono..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Grid of Customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCustomers.map((c) => {
          const rentalCount = rentals.filter(r => r.customerId === c.id || r.customerDoc === c.documentId).length;

          return (
            <div
              key={c.id}
              onClick={() => onSelectCustomer(c)}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-blue-400 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-sm">
                    {c.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {c.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                <p className="text-xs text-slate-500 font-medium">CC: {c.documentId}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.phone}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">{c.address}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{rentalCount} {rentalCount === 1 ? 'alquiler' : 'alquileres'}</span>
                <span className="text-blue-600 font-bold hover:underline">Ver ficha →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual Customer Profile Modal (Ficha del cliente) */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#0A4D9A] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center font-black text-lg">
                  {selectedCustomer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">{selectedCustomer.name}</h3>
                  <p className="text-xs text-blue-200">Ficha del Cliente • Estado: {selectedCustomer.status}</p>
                </div>
              </div>
              <button onClick={() => onSelectCustomer(null)} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Cédula / DNI:</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedCustomer.documentId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Teléfono:</span>
                  <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    {selectedCustomer.phone}
                    <a
                      href={`https://wa.me/57${selectedCustomer.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Dirección:</span>
                  <span className="font-semibold text-slate-800 block truncate">{selectedCustomer.address}</span>
                  {selectedCustomer.referenceLocation && (
                    <span className="text-[10px] text-slate-500 block truncate">Ref: {selectedCustomer.referenceLocation}</span>
                  )}
                </div>
              </div>

              {/* Action: New rental for this client */}
              <div className="flex justify-between items-center bg-blue-50 p-3 rounded-xl border border-blue-200">
                <span className="text-blue-900 font-bold">¿Deseas registrar un nuevo alquiler para este cliente?</span>
                <button
                  onClick={() => {
                    const cid = selectedCustomer.id;
                    onSelectCustomer(null);
                    onStartRentalForCustomer(cid);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  + Alquilar Lavadora
                </button>
              </div>

              {/* Historial de Alquileres */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Historial de Alquileres ({customerRentals.length})</span>
                </h4>

                {customerRentals.length === 0 ? (
                  <p className="text-slate-400 italic py-2">No registra alquileres previos.</p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Contrato</th>
                          <th className="py-2 px-3">Lavadora</th>
                          <th className="py-2 px-3">Período</th>
                          <th className="py-2 px-3">Total</th>
                          <th className="py-2 px-3 text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerRentals.map((r) => (
                          <tr key={r.id}>
                            <td className="py-2 px-3 font-mono font-bold text-blue-700">{r.id}</td>
                            <td className="py-2 px-3 font-semibold text-slate-800">{r.washerModel}</td>
                            <td className="py-2 px-3 text-slate-600">{r.startDate} - {r.endDate} ({r.days}d)</td>
                            <td className="py-2 px-3 font-bold text-slate-900">{formatCOP(r.totalAmount)}</td>
                            <td className="py-2 px-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.status === 'finalizado' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Historial de Pagos */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Pagos Registrados ({customerPayments.length})</span>
                </h4>

                {customerPayments.length === 0 ? (
                  <p className="text-slate-400 italic py-2">No registra pagos directos en el sistema.</p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Recibo</th>
                          <th className="py-2 px-3">Fecha</th>
                          <th className="py-2 px-3">Método</th>
                          <th className="py-2 px-3 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerPayments.map((p) => (
                          <tr key={p.id}>
                            <td className="py-2 px-3 font-mono font-bold text-slate-700">{p.id}</td>
                            <td className="py-2 px-3 text-slate-600">{p.date}</td>
                            <td className="py-2 px-3 text-slate-700">{p.paymentMethod}</td>
                            <td className="py-2 px-3 font-bold text-emerald-700 text-right">{formatCOP(p.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0A4D9A] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Registrar Nuevo Cliente</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre y Apellido *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ej: Ana Torres"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cédula / DNI *</label>
                  <input
                    type="text"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    required
                    placeholder="Ej: 1023456789"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono / Celular *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="Ej: 312 900 1122"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección completa *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Ej: Transversal 28 # 53-40, Barrio Los Olivos"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Punto de Referencia (Opcional)</label>
                <input
                  type="text"
                  value={referenceLocation}
                  onChange={(e) => setReferenceLocation(e.target.value)}
                  placeholder="Ej: Diagonal a la panadería, casa reja negra"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas / Observaciones</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Horario de entrega preferido tardes"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
