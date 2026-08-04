'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { AdminPublishModal } from '@/components/AdminPublishModal';
import { ShieldCheck, Lock, ArrowLeft, Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AdminAlquileresPage() {
  const { user, userRole, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [adminPublishOpen, setAdminPublishOpen] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenAdminPublish = () => {
    if (userRole === 'admin') setAdminPublishOpen(true);
  };

  // ── Loading state while Supabase session is being resolved ──
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Verificando sesión de administrador...</p>
      </main>
    );
  }

  // ── Not authenticated at all ──
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar onOpenAuth={handleOpenAuth} onOpenAdminPublish={handleOpenAdminPublish} />

        <div className="min-h-screen flex items-center justify-center p-4 pt-24">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-slate-800 border border-slate-700 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">Acceso Restringido</h2>
              <p className="text-sm text-slate-400">
                Debes iniciar sesión con tu cuenta de administrador para acceder al Panel de Control de MAKIMPORT.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <button
                onClick={() => handleOpenAuth('login')}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>

              <Link
                href="/"
                className="w-full py-2.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Inicio</span>
              </Link>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
        />
      </main>
    );
  }

  // ── Authenticated but NOT admin ──
  if (userRole !== 'admin') {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar onOpenAuth={handleOpenAuth} onOpenAdminPublish={handleOpenAdminPublish} />

        <div className="min-h-screen flex items-center justify-center p-4 pt-24">
          <div className="max-w-md w-full bg-slate-900 border border-red-900/50 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-red-950/80 border border-red-800/60 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">Permiso Denegado</h2>
              <p className="text-sm text-slate-400">
                Tu cuenta no tiene permisos de administrador. Esta sección es exclusiva para el equipo de MAKIMPORT Venezuela.
              </p>
              <p className="text-xs text-slate-500 pt-1">
                Si crees que esto es un error, contacta a{' '}
                <a href="mailto:makimportvzla@gmail.com" className="text-orange-400 hover:underline">
                  makimportvzla@gmail.com
                </a>
              </p>
            </div>

            <Link
              href="/"
              className="w-full py-2.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Catálogo</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Authenticated + Admin ──
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenAdminPublish={handleOpenAdminPublish}
      />

      <AdminDashboard initialTab="alquileres" />

      <Footer onOpenAuth={handleOpenAuth} />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />

      <AdminPublishModal
        isOpen={adminPublishOpen}
        onClose={() => setAdminPublishOpen(false)}
        onMachineryCreated={() => {}}
      />

    </main>
  );
}
