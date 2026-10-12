import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  X, 
  Lock, 
  Mail, 
  User, 
  Clock, 
  CheckCircle,
  KeyRound
} from 'lucide-react';
import { UserAdmin } from '../types';

interface UsersAdminViewProps {
  currentUser: { name: string; email: string; role: string };
  onLogout: () => void;
}

const DEFAULT_ADMINS: UserAdmin[] = [
  {
    id: 'USR-01',
    name: 'Dueño Principal',
    email: 'anapse_video@hotmail.com',
    role: 'Super Administrador',
    passwordHint: '16546203',
    lastLogin: 'Hoy (En sesión activa)',
    createdAt: '2026-10-11',
  },
  {
    id: 'USR-02',
    name: 'Operador de Turno',
    email: 'operador@lavarrienda.com',
    role: 'Operador',
    passwordHint: 'operador123',
    lastLogin: '10/10/2026 18:30',
    createdAt: '2026-10-09',
  },
];

export const UsersAdminView: React.FC<UsersAdminViewProps> = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState<UserAdmin[]>(() => {
    try {
      const saved = localStorage.getItem('lavarrienda_admin_users');
      return saved ? JSON.parse(saved) : DEFAULT_ADMINS;
    } catch {
      return DEFAULT_ADMINS;
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'Administrador' | 'Operador'>('Administrador');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('lavarrienda_admin_users', JSON.stringify(users));
  }, [users]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserAdmin = {
      id: 'USR-' + String(users.length + 1).padStart(2, '0'),
      name,
      email: email.trim().toLowerCase(),
      role,
      passwordHint: password,
      lastLogin: 'Sin ingresos aún',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    setIsAddModalOpen(false);
    setSuccessMsg(`Usuario ${name} agregado correctamente con rol de ${role}.`);
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('¿Deseas eliminar este usuario de la administración?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <span>Panel de Usuarios y Administradores</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de accesos exclusivos para el dueño y personal autorizado
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Administrador</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active User Highlight Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md border border-blue-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-2xl text-cyan-300">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white">{currentUser.name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/30">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">{currentUser.email}</p>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Sesión activa en este dispositivo móvil
            </p>
          </div>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Cuentas con Acceso al Sistema</h3>
          <span className="text-xs text-slate-500 font-medium">{users.length} usuarios registrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Correo</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Último Ingreso</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((u) => {
                const isMainOwner = u.email === 'anapse_video@hotmail.com';
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'Super Administrador'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{u.lastLogin || 'Reciente'}</td>
                    <td className="py-3 px-4 text-center">
                      {!isMainOwner ? (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 italic">Cuenta Principal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Admin / Operator */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0A4D9A] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Agregar Nuevo Usuario Administrador</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ej: Pedro Administrador"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Ej: pedro@hotmail.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contraseña de Acceso *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Contraseña"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rol / Permisos *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                >
                  <option value="Administrador">Administrador (Control total)</option>
                  <option value="Operador">Operador (Registro de alquileres y pagos)</option>
                </select>
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
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
