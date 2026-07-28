'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Home, Gavel, Calculator, Settings, MessageCircle, Send, Plus, LayoutDashboard, X, Wrench } from 'lucide-react';
import Link from 'next/link';

interface MobileBottomNavProps {
  onSelectSubastas?: () => void;
  onOpenAdminPublish?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onSelectSubastas,
  onOpenAdminPublish,
}) => {
  const { userRole, user } = useAuth();
  const isAdmin = userRole === 'admin';
  const isLoggedIn = !!user;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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
    const element = document.getElementById('catalogo-marketplace');
    if (element) {
      element.scrollIntoView({ behavior: 'auto' });
    } else {
      window.location.href = '/catalogo';
    }
  };

  const handleSubastasClick = () => {
    setMenuOpen(false);
    if (onSelectSubastas) {
      onSelectSubastas();
    } else {
      // If we are on a page that doesn't have onSelectSubastas directly (e.g. if we are elsewhere)
      window.location.href = '/catalogo?filter=auction';
    }
  };

  const handleCotizarClick = () => {
    setMenuOpen(false);
    const element = document.getElementById('importacion');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#importacion';
    }
  };

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="md:hidden" ref={menuRef}>
      {/* Floating Menu Overlay (WhatsApp/Telegram or Admin Menu) */}
      {menuOpen && (
        <div className="fixed bottom-20 right-4 left-4 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isAdmin ? 'Panel de Administración' : 'Atención Personalizada'}
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

        {/* Subastas */}
        <button
          onClick={handleSubastasClick}
          className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 active:text-orange-500 hover:text-slate-200 transition-colors relative"
        >
          <Gavel className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-wide">Subastas</span>
          <span className="absolute top-1 right-3 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        </button>

        {/* Cotizar */}
        <button
          onClick={handleCotizarClick}
          className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 active:text-orange-500 hover:text-slate-200 transition-colors"
        >
          <Calculator className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-wide">Cotizar</span>
        </button>

        {/* Admin / Menú */}
        <button
          onClick={handleMenuToggle}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
            menuOpen
              ? 'text-orange-500 font-bold'
              : isAdmin
              ? 'text-amber-500 hover:text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAdmin ? (
            <>
              <Settings className={`w-5 h-5 mb-0.5 transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''}`} />
              <span className="text-[10px] font-bold tracking-wide">Admin</span>
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
