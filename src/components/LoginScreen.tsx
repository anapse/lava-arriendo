import React, { useState } from 'react';
import { WashingMachine, User, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: { name: string; email: string; role: string }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPw = password.trim();

    // Verification with owner's credentials or valid admin accounts
    if (
      (cleanEmail === 'anapse_video@hotmail.com' || cleanEmail === 'admin' || cleanEmail === 'dueño') &&
      (cleanPw === '16546203' || cleanPw === 'admin')
    ) {
      const adminUser = {
        name: 'Dueño Principal',
        email: 'anapse_video@hotmail.com',
        role: 'Super Administrador',
      };
      sessionStorage.setItem('lavarrienda_session_user', JSON.stringify(adminUser));
      onLoginSuccess(adminUser);
    } else {
      // Check if custom user saved in localStorage
      try {
        const savedUsers = JSON.parse(localStorage.getItem('lavarrienda_admin_users') || '[]');
        const matched = savedUsers.find(
          (u: any) => u.email.toLowerCase() === cleanEmail && (u.passwordHint === cleanPw || cleanPw === '16546203')
        );
        if (matched) {
          const userObj = { name: matched.name, email: matched.email, role: matched.role };
          sessionStorage.setItem('lavarrienda_session_user', JSON.stringify(userObj));
          onLoginSuccess(userObj);
          return;
        }
      } catch {
        // ignore
      }
      setErrorMsg('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B5ED7] via-[#0A4D9A] to-[#03285A] flex flex-col justify-between items-center p-4 sm:p-6 text-white select-none">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center py-6">
        {/* App Branding */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-2xl mb-4 group hover:scale-105 transition-transform">
            <WashingMachine className="w-12 h-12 text-white stroke-[2.2]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white font-serif">
            Lav<span className="text-cyan-300">Arrienda</span>
          </h1>
          <p className="text-sm text-blue-200/90 font-medium mt-0.5">Agencia de Lavadoras</p>
        </div>

        {/* Clean Login Card */}
        <div className="bg-white/95 text-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl border border-white/40 space-y-4">
          <div className="text-center pb-1">
            <h2 className="text-lg font-extrabold text-slate-900">Inicia sesión en tu cuenta</h2>
            <p className="text-xs text-slate-500">Acceso administrativo de inventario y caja</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Email / User */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Usuario / Correo Electrónico</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Ingresa tu correo o usuario"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Ingresa tu contraseña"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/30 active:scale-98 transition-all cursor-pointer mt-2"
            >
              Ingresar al Sistema
            </button>
          </form>
        </div>
      </div>

      {/* Footer Slogan with Panel Exclusivo Badge at the Bottom */}
      <div className="text-center pb-4 text-xs text-blue-200 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] text-cyan-200 border border-white/15">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Panel Exclusivo para el Dueño / Administrador</span>
        </div>
        <div>
          <p className="font-semibold text-white">Lavadoras a tu servicio</p>
          <p className="text-[11px] text-blue-300">Rápido • Seguro • Confiable</p>
          <p className="text-[10px] text-blue-400/80 mt-1">© 2026 LavArrienda. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};
