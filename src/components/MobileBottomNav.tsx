'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Home, Gavel, Settings, MessageCircle, Send, Plus, LayoutDashboard, X, Wrench, User, Calendar, HardHat } from 'lucide-react';
import Link from 'next/link';

interface MobileBottomNavProps {
  onSelectSubastas?: () => void;
  onOpenAdminPublish?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onSelectSubastas,
  onOpenAdminPublish,
}) => {
  const { userRole, user, profile } = useAuth();
  const isAdmin = userRole === 'admin';
  const isLoggedIn = !!user;
  const displayName = profile?.nombre_completo || user?.email?.split('@')[0] || 'Usuario';

  const [menuOpen, setMenuOpen] = useState(false);
  const [alquilerOpen, setAlquilerOpen] = useState(false);
  const [serviciosOpen, setServiciosOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setAlquilerOpen(false);
        setServiciosOpen(false);
      }
    };
    if (menuOpen || alquilerOpen || serviciosOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, alquilerOpen, serviciosOpen]);

  const handleHomeClick = () => {
    setMenuOpen(false);
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.href = '/';
    }
  };

  const handleCatalogClick = () => {
    setMenuOpen(false);
    setAlquilerOpen(false);
    window.location.href = '/catalogo';
  };

  const handleSubastasClick = () => {
    setMenuOpen(false);
    setAlquilerOpen(false);
    if (onSelectSubastas) {
      onSelectSubastas();
    } else {
      window.location.href = '/catalogo?filter=auction';
    }
  };

  const handleAlquilerClick = () => {
    setMenuOpen(false);
    setServiciosOpen(false);
    setAlquilerOpen(!alquilerOpen);
  };

  const handleServiciosClick = () => {
    setMenuOpen(false);
    setAlquilerOpen(false);
    setServiciosOpen(!serviciosOpen);
  };

  const handleMenuToggle = () => {
    setAlquilerOpen(false);
    setServiciosOpen(false);
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="md:hidden" ref={menuRef}>
      {/* Floating Servicios Options Overlay */}
      {serviciosOpen && (
        <div className="fixed bottom-20 right-4 left-4 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Servicios y Proyectos
            </span>
            <button
              onClick={() => setServiciosOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/40"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/servicios"
              onClick={() => setServiciosOpen(false)}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 active:scale-[0.98] transition-all"
            >
              <Wrench className="w-4 h-4" />
              <span>Postular como Proveedor</span>
            </Link>
            <Link
              href="/cotizacion-obra"
              onClick={() => setServiciosOpen(false)}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 border border-slate-700/60 active:scale-[0.98] transition-all"
            >
              <HardHat className="w-4 h-4 text-amber-400" />
              <span>Cotizar Obra o Proyecto</span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Alquiler Options Overlay */}

      {alquilerOpen && (
        <div className="fixed bottom-20 right-4 left-4 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Servicio de Alquileres
            </span>
            <button
              onClick={() => setAlquilerOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/40"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/alquiler"
              onClick={() => setAlquilerOpen(false)}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 active:scale-[0.98] transition-all text-center"
            >
              <span>Alquiler de Equipos</span>
            </Link>
            <Link
              href="/postular-equipo"
              onClick={() => setAlquilerOpen(false)}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 border border-slate-700/60 active:scale-[0.98] transition-all text-center"
            >
              <span>Alquilar mi Equipo</span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Menu Overlay (WhatsApp/Telegram or Admin Menu) */}
      {menuOpen && (
        <div className="fixed bottom-20 right-4 left-4 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isAdmin ? 'Panel de Administración' : isLoggedIn ? 'Mi Cuenta MAKIMPORT' : 'Atención Personalizada'}
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/40"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isAdmin ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (onOpenAdminPublish) onOpenAdminPublish();
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Publicar Nueva Maquinaria</span>
              </button>

              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 border border-slate-700/60 active:scale-[0.98] transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Ir al Panel Admin</span>
              </Link>

              {/* Admin también accede a su perfil */}
              <Link
                href="/perfil"
                onClick={() => setMenuOpen(false)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-800 active:scale-[0.98] transition-all"
              >
                <User className="w-3.5 h-3.5 text-orange-400" />
                <span>Mi Perfil / Oficina Virtual</span>
              </Link>
            </div>
          ) : isLoggedIn ? (
            <div className="flex flex-col gap-3">
              {/* Perfil Card */}
              <Link
                href="/perfil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-orange-950/60 to-slate-950 border border-orange-500/30 hover:border-orange-500/60 rounded-xl active:scale-[0.98] transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-orange-700/80 flex items-center justify-center text-sm font-black text-white shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-extrabold text-white text-sm truncate">{displayName}</span>
                  <span className="block text-[10px] text-orange-400 font-bold uppercase tracking-wider mt-0.5">
                    Mi Perfil · Subastas · Compras
                  </span>
                </div>
                <span className="text-orange-500 font-bold text-sm shrink-0">›</span>
              </Link>

              {/* Contacto directo */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://wa.me/584146370819?text=Hola%20MAKIMPORT%2C%20busco%20atenci%C3%B3n%20personalizada%20para%20la%20compra%2Fb%C3%BAsqueda%20de%20maquinaria."
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-3 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/50 text-emerald-400 text-xs font-bold rounded-xl active:scale-[0.98] transition-all"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="https://t.me/makimportvzla"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-3 bg-sky-950/30 hover:bg-sky-900/40 border border-sky-800/50 text-sky-400 text-xs font-bold rounded-xl active:scale-[0.98] transition-all"
                >
                  <Send className="w-5 h-5 text-sky-400" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://wa.me/584146370819?text=Hola%20MAKIMPORT%2C%20busco%20atenci%C3%B3n%20personalizada%20para%20la%20compra%2Fb%C3%BAsqueda%20de%20maquinaria."
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center justify-center gap-2 py-4 px-3 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/50 text-emerald-400 text-xs font-bold rounded-xl active:scale-[0.98] transition-all"
              >
                <MessageCircle className="w-6 h-6 text-emerald-400" />
                <span>WhatsApp Directo</span>
                <span className="text-[10px] text-slate-400 font-normal">+58 414-6370819</span>
              </a>

              <a
                href="https://t.me/makimportvzla"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center justify-center gap-2 py-4 px-3 bg-sky-950/30 hover:bg-sky-900/40 border border-sky-800/50 text-sky-400 text-xs font-bold rounded-xl active:scale-[0.98] transition-all"
              >
                <Send className="w-6 h-6 text-sky-400" />
                <span>Telegram Oficial</span>
                <span className="text-[10px] text-slate-400 font-normal">@makimportvzla</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 z-50 flex justify-around items-center px-2 select-none shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
        {/* Inicio */}
        <button
          onClick={handleHomeClick}
          className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 active:text-orange-500 hover:text-slate-200 transition-colors"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-wide">Inicio</span>
        </button>

        {/* Catálogo */}
        <button
          onClick={handleCatalogClick}
          className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 active:text-orange-500 hover:text-slate-200 transition-colors"
        >
          <Wrench className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-wide">Catálogo</span>
        </button>

        {/* Servicios */}
        <button
          onClick={handleServiciosClick}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            serviciosOpen ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HardHat className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-wide">Servicios</span>
        </button>

        {/* Alquiler */}
        <button
          onClick={handleAlquilerClick}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            alquilerOpen ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-wide">Alquiler</span>
        </button>

        {/* Perfil / Admin / Menú */}
        <button
          onClick={handleMenuToggle}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
            menuOpen
              ? 'text-orange-500 font-bold'
              : isAdmin
              ? 'text-amber-500 hover:text-amber-400'
              : isLoggedIn
              ? 'text-orange-400 hover:text-orange-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAdmin ? (
            <>
              <Settings className={`w-5 h-5 mb-0.5 transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''}`} />
              <span className="text-[10px] font-bold tracking-wide">Admin</span>
            </>
          ) : isLoggedIn ? (
            <>
              {/* Mini avatar initial */}
              <div className={`w-5 h-5 mb-0.5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 transition-all ${menuOpen ? 'bg-orange-500' : 'bg-orange-700/90'}`}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-semibold tracking-wide">Perfil</span>
            </>
          ) : (
            <>
              <MessageCircle className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold tracking-wide">Menú</span>
            </>
          )}
        </button>
      </nav>
    </div>
  );
};




