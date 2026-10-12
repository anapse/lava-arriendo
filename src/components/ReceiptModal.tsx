import React from 'react';
import { X, Printer, CheckCircle, WashingMachine, Download } from 'lucide-react';
import { Rental } from '../types';
import { formatCOP } from '../utils/formatters';

interface ReceiptModalProps {
  rental: Rental | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  rental,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !rental) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls */}
        <div className="bg-slate-100 px-5 py-3 flex items-center justify-between border-b border-slate-200">
          <span className="text-xs font-bold text-slate-700">Comprobante de Alquiler</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-white text-xs font-semibold flex items-center gap-1"
              title="Imprimir comprobante"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Body (Formatted like receipt voucher) */}
        <div className="p-6 space-y-4 text-xs font-sans" id="printable-receipt">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-600 flex items-center justify-center text-white mb-1.5 shadow-sm">
              <WashingMachine className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">LavArrienda</h2>
            <p className="text-[11px] text-slate-500 font-medium">Agencia de Lavadoras a Domicilio</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Bogotá D.C., Colombia • Tel: 312 900 1122</p>
            <div className="mt-2 inline-block px-2.5 py-0.5 bg-blue-50 text-blue-800 rounded font-mono font-bold text-[11px]">
              CONTRATO #{rental.id}
            </div>
          </div>

          {/* Customer & Machine Info */}
          <div className="space-y-1.5 py-1 text-slate-700 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Cliente:</span>
              <span className="font-bold text-slate-900">{rental.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Cédula / DNI:</span>
              <span className="font-mono">{rental.customerDoc}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Teléfono:</span>
              <span>{rental.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Dirección:</span>
              <span className="truncate max-w-[200px] text-right">{rental.customerAddress}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400 font-medium">Lavadora:</span>
              <span className="font-bold text-blue-700">{rental.washerModel} (ID #{rental.washerId})</span>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-1 py-1 text-slate-700 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Inicio:</span>
              <span className="font-semibold">{rental.startDate} {rental.startTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Vencimiento:</span>
              <span className="font-semibold text-slate-900">{rental.endDate} {rental.endTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Tiempo:</span>
              <span>{rental.days} día(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Entrega:</span>
              <span>{rental.deliveryType}</span>
            </div>
          </div>

          {/* Financials */}
          <div className="space-y-1.5 pt-1 text-slate-800">
            <div className="flex justify-between">
              <span>Alquiler ({rental.days}d × {formatCOP(rental.pricePerDay)}):</span>
              <span className="font-semibold">{formatCOP(rental.days * rental.pricePerDay)}</span>
            </div>
            {rental.deliveryFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Costo de flete:</span>
                <span>{formatCOP(rental.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-extrabold text-slate-900">
              <span>TOTAL (COP):</span>
              <span>{formatCOP(rental.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Adelanto pagado:</span>
              <span>{formatCOP(rental.advancePayment)}</span>
            </div>
            <div className="flex justify-between text-amber-700 font-bold">
              <span>Saldo pendiente:</span>
              <span>{formatCOP(rental.balanceDue)}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-400">
            <p>¡Gracias por confiar en LavArrienda!</p>
            <p>Cuide la máquina y devuélvala en la fecha y hora pactada.</p>
          </div>
        </div>

        {/* Modal footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
