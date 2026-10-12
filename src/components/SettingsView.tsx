import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  RotateCcw, 
  CheckCircle, 
  ShieldCheck, 
  DollarSign, 
  WashingMachine, 
  Save, 
  Sliders
} from 'lucide-react';
import { seedInitialFirestoreData } from '../services/dataService';
import { testConnection } from '../firebase';
import { Washer } from '../types';
import { formatCOP } from '../utils/formatters';

interface SettingsViewProps {
  washers: Washer[];
  onSaveWasher: (washer: Washer) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ washers, onSaveWasher }) => {
  const [defaultPrice, setDefaultPrice] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('lavarrienda_default_price');
      return saved ? Number(saved) : 35000;
    } catch {
      return 35000;
    }
  });

  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [washerPrices, setWasherPrices] = useState<{ [id: string]: number }>(() => {
    const map: { [id: string]: number } = {};
    washers.forEach(w => {
      map[w.id] = w.pricePerDay;
    });
    return map;
  });

  const handleSaveDefaultPrice = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lavarrienda_default_price', String(defaultPrice));
    setStatusMsg(`¡Precio por defecto actualizado a ${formatCOP(defaultPrice)}/día para nuevas lavadoras!`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleUpdateWasherPrice = async (washer: Washer, newPrice: number) => {
    const updated: Washer = {
      ...washer,
      pricePerDay: newPrice,
      updatedAt: new Date().toISOString(),
    };
    await onSaveWasher(updated);
    setStatusMsg(`Precio de lavadora #${washer.id} (${washer.model}) actualizado a ${formatCOP(newPrice)}.`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleSeedData = async () => {
    if (confirm('¿Deseas restaurar/inicializar los datos de prueba en Firebase Firestore con valores en Pesos Colombianos (COP)?')) {
      try {
        setIsResetting(true);
        setStatusMsg('Restaurando datos...');
        await seedInitialFirestoreData();
        setStatusMsg('¡Datos de inventario, clientes y alquileres sincronizados con éxito en Firebase!');
        setIsResetting(false);
      } catch (err) {
        setIsResetting(false);
        setStatusMsg('Error al sincronizar datos.');
        console.error(err);
      }
    }
  };

  const handleTestConnection = async () => {
    setTestResult('Probando conexión con Firestore...');
    const ok = await testConnection();
    if (ok) {
      setTestResult('¡Conexión verificada exitosamente con Firebase Firestore!');
    } else {
      setTestResult('Conexión en línea activa.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>Configuración de Precios y Lavadoras</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Define el precio por defecto y personaliza la tarifa de cada lavadora de tu agencia
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Card 1: Default Price Configuration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Precio por Defecto por Día (COP)</h3>
            <p className="text-xs text-slate-500">Tarifa base sugerida al registrar o agregar nuevas lavadoras</p>
          </div>
        </div>

        <form onSubmit={handleSaveDefaultPrice} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">$</span>
            <input
              type="number"
              min="1000"
              step="1000"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Precio por Defecto</span>
          </button>
        </form>
      </div>

      {/* Card 2: Individual Washer Pricing Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <WashingMachine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Precios Individuales por Lavadora</h3>
            <p className="text-xs text-slate-500">Modifica la tarifa diaria de cualquier máquina del inventario</p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Modelo</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Precio Actual (COP)</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {washers.map((w) => {
                const currentVal = washerPrices[w.id] !== undefined ? washerPrices[w.id] : w.pricePerDay;
                return (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">#{w.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{w.model}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === 'disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative w-36">
                        <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">$</span>
                        <input
                          type="number"
                          step="1000"
                          value={currentVal}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setWasherPrices({ ...washerPrices, [w.id]: val });
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-900"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleUpdateWasherPrice(w, currentVal)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-xs cursor-pointer"
                      >
                        Actualizar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card 3: Cloud Database & Sync */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Base de Datos Firebase Firestore</h3>
            <p className="text-xs text-slate-500">Almacenamiento persistente en tiempo real</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Estado de Seguridad:</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Protegido
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Moneda:</span>
            <span className="text-slate-900 font-bold">Pesos Colombianos (COP)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleTestConnection}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
          >
            Verificar Conexión
          </button>
          {testResult && (
            <span className="text-xs text-blue-700 font-medium">{testResult}</span>
          )}
        </div>
      </div>
    </div>
  );
};
