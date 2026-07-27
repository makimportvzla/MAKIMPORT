'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Phone, Building2, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Reset mode when initialMode changes (e.g. user clicked "Register" button)
  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [idDocument, setIdDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // UI state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      setErrorMessage('Debes aceptar los términos y condiciones de las subastas para continuar.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const assignedRole: 'admin' | 'client' =
      email.toLowerCase().trim() === 'makimportvzla@gmail.com' ? 'admin' : 'client';

    try {
      // 1. Supabase Auth SignUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            nombre_completo: fullName,
            cedula_rif: idDocument,
            telefono: phone,
            role: assignedRole,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 2. Insert profile row (ignore conflict if trigger already created it)
      if (authData?.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: email.trim(),
          nombre_completo: fullName,
          cedula_rif: idDocument,
          telefono: phone,
          role: assignedRole,
        }, { onConflict: 'id' });
      }

      // 3. Attempt automatic login immediately if session is not already active
      let activeSession = authData?.session;

      if (!activeSession) {
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          });
          if (!signInError && signInData.session) {
            activeSession = signInData.session;
          }
        } catch (signInErr) {
          console.warn("Auto-login post sign-up failed:", signInErr);
        }
      }

      if (activeSession) {
        setSuccessMessage('¡Registro exitoso! Iniciando sesión automáticamente...');
        // Close modal quickly so the user is redirected/logged in immediately
        setTimeout(() => {
          onClose();
          setSuccessMessage(null);
          setEmail(''); setPassword(''); setFullName(''); setIdDocument(''); setPhone('');
          setAcceptTerms(false);
        }, 500);
      } else {
        // Fallback if email confirmation is strictly required by the Supabase project settings
        setSuccessMessage('¡Registro completado! Por favor confirma tu correo para ingresar.');
        setTimeout(() => {
          onClose();
          setSuccessMessage(null);
        }, 2500);
      }

    } catch (err: any) {
      const msg = err?.message || 'Error durante el registro';
      if (msg.includes('already registered') || msg.includes('User already registered')) {
        setErrorMessage('Este correo ya está registrado. Por favor inicia sesión.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session) {
        setSuccessMessage('¡Sesión iniciada correctamente!');
        // Close modal quickly so Header is refreshed immediately
        setTimeout(() => {
          onClose();
          setSuccessMessage(null);
          setLoginEmail(''); setLoginPassword('');
        }, 500);
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
        setErrorMessage('Correo o contraseña incorrectos. Verifica tus datos.');
      } else if (msg.includes('Email not confirmed')) {
        setErrorMessage('Tu correo no ha sido confirmado. Revisa tu bandeja de entrada.');
      } else {
        setErrorMessage(msg || 'Error al iniciar sesión. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim());
      if (error) throw new Error(error.message);
      setSuccessMessage('Se enviaron las instrucciones de recuperación a tu correo electrónico.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error enviando el correo de recuperación.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setIsForgotPassword(false);
      }, 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-950/80 rounded-full border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pb-4 text-center border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex justify-center mb-3">
            <Logo size="md" />
          </div>
          <p className="text-xs text-slate-400">
            Plataforma de Subastas &amp; Importación de Maquinaria Pesada para Venezuela
          </p>

          {!isForgotPassword && (
            <div className="mt-5 grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Registrarse (Empresa/RIF)
              </button>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-950/90 border border-red-800 rounded-xl text-xs text-red-300 font-semibold text-center animate-in fade-in flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-semibold text-center animate-in fade-in flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORGOT PASSWORD FORM */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotSubmit} className="p-6 space-y-4">
            <div className="text-center space-y-1 mb-4">
              <h3 className="text-lg font-bold text-white">Recuperar Contraseña</h3>
              <p className="text-xs text-slate-400">
                Ingresa tu correo registrado y te enviaremos las instrucciones.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="makimportvzla@gmail.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl shadow-lg transition-colors"
            >
              {loading ? 'Procesando...' : 'Enviar Enlace de Recuperación'}
            </button>

            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="w-full text-center text-xs text-slate-400 hover:text-white pt-2"
            >
              ← Volver al Inicio de Sesión
            </button>
          </form>
        ) : mode === 'login' ? (
          
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="correo@empresa.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">Contraseña</label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs text-orange-400 hover:underline"
                >
                  ¿Olvidé mi contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-950 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Verificando credenciales...' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        ) : (

          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 max-h-[65vh] overflow-y-auto">
            
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Verificación comercial RIF / Cédula para habilitar pujas en subastas en vivo.</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nombre y Apellido / Razón Social de la Empresa *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="Constructora MAK C.A. / Juan Pérez"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cédula de Identidad (V/E) o RIF (J/G/V) *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={idDocument}
                  onChange={(e) => setIdDocument(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                  placeholder="J-12345678-9 ó V-18234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="correo@empresa.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Teléfono Celular (WhatsApp / Telegram) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="+58 412 1234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña * (mín. 6 caracteres)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-orange-600 focus:ring-orange-500 bg-slate-950"
                />
                <span>
                  Acepto los <strong className="text-orange-400">términos y condiciones</strong> de las subastas en vivo e importación a Venezuela de MAKIMPORT.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-950 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Creando Perfil en Supabase...' : 'Crear Cuenta Comercial'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        )}

      </div>
    </div>
  );
};
