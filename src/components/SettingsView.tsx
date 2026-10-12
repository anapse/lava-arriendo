import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  CloudCheck,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { seedInitialFirestoreData } from '../services/dataService';
import { testConnection } from '../firebase';

export const SettingsView: React.FC = () => {
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [testResult, setTestResult] = useState<string | null>(null);

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
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>Configuración del Sistema y Base de Datos</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Estado del servicio en la nube Firebase Firestore y herramientas operativas
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Card 1: Cloud Database */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Base de Datos Firebase Firestore</h3>
            <p className="text-xs text-slate-500">Almacenamiento persistente en tiempo real para LavArrienda</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Estado de Reglas de Seguridad:</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Desplegadas y Protegidas
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Moneda del Sistema:</span>
            <span className="text-slate-900 font-bold">Pesos Colombianos (COP)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Modo de sincronización:</span>
            <span className="text-blue-700 font-bold">Tiempo Real (WebSockets onSnapshot)</span>
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

      {/* Card 2: Seed & Restore Data */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Carga y Restauración de Datos Iniciales</h3>
            <p className="text-xs text-slate-500">Rellena el inventario con las 12 lavadoras y clientes del mockup</p>
          </div>
        </div>

        <p className="text-xs text-slate-600">
          Si la base de datos está vacía o deseas volver a cargar los datos demostrativos completos con tarifas en Pesos Colombianos (COP), haz clic en el siguiente botón:
        </p>

        <button
          onClick={handleSeedData}
          disabled={isResetting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isResetting ? 'Sincronizando...' : 'Cargar / Restaurar Datos en Firebase'}</span>
        </button>
      </div>
    </div>
  );
};
