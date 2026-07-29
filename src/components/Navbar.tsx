'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { User, Menu, X, Ship, Send, Instagram, Mail, Plus, LayoutDashboard, LogOut, ChevronDown, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenAdminPublish: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenAdminPublish,
}) => {
  const { user, profile, userRole, loading, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setUserDropdownOpen(false);
      setContactDropdownOpen(false);
    };
    if (userDropdownOpen || contactDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userDropdownOpen, contactDropdownOpen]);

  const displayName = profile?.nombre_completo || user?.email?.split('@')[0] || 'Usuario';
  const isAdmin = userRole === 'admin';
  const isLoggedIn = !!user;

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setContactDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      
      {/* Top Banner */}
      <div className="bg-slate-950 border-b border-slate-800 text-xs py-1.5 px-4 text-slate-300 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Ship className="w-3.5 h-3.5 text-orange-500" />
              <span>Importación Directa: <strong>Caracas, Venezuela</strong> ➔ Aduanas Puerto Cabello &amp; La Guaira</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Subastas en vivo activas
            </span>
          </div>

          <div className="flex items-center space-x-5">
            <a
              href="https://t.me/makimportvzla"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors font-medium"
            >
              <Send className="w-3.5 h-3.5" />
              <span>@makimportvzla</span>
            </a>

            <a
              href="https://instagram.com/makimport.vzla"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors font-medium"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@makimport.vzla</span>
            </a>

            <a
              href="mailto:makimportvzla@gmail.com"
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-orange-500" />
              <span>makimportvzla@gmail.com</span>
            </a>
          </div>

        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`px-4 lg:px-8 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 py-3 shadow-xl shadow-black/40' 
          : 'bg-gradient-to-b from-slate-950/90 to-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <Link href="/" className="group flex items-center shrink-0 h-12" aria-label="MAKIMPORT - Inicio">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-200">
            <Link href="/" className="hover:text-orange-500 transition-colors py-1 border-b-2 border-orange-500 text-white font-semibold">
              Inicio
            </Link>
            <Link href="/catalogo" className="hover:text-orange-400 transition-colors py-1 border-b-2 border-transparent hover:border-orange-500/50">
              Catálogo Completo
            </Link>
            <a href="#subastas" className="hover:text-orange-400 transition-colors py-1 border-b-2 border-transparent hover:border-orange-500/50 flex items-center gap-1.5">
              Subastas
              <span className="bg-orange-600/90 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                En vivo
              </span>
            </a>
            <a href="#importacion" className="hover:text-orange-400 transition-colors py-1 border-b-2 border-transparent hover:border-orange-500/50">
              Calculadora Logística
            </a>

            {/* Atención Personalizada Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setContactDropdownOpen(!contactDropdownOpen); }}
                className="hover:text-orange-400 transition-colors py-1 border-b-2 border-transparent hover:border-orange-500/50 flex items-center gap-1.5 focus:outline-none"
              >
                <span>Atención Personalizada</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${contactDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {contactDropdownOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="p-2 border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 py-1.5">
                    Canales Directos
                  </div>
                  
                  <a
                    href="https://t.me/makimportvzla"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-4 py-3 text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <Send className="w-4 h-4 text-sky-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200">Telegram</span>
                      <span className="text-[10px] text-slate-500">@makimportvzla</span>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/584146370819?text=Hola%20MAKIMPORT%2C%20busco%20atenci%C3%B3n%20personalizada%20para%20la%20compra%2Fb%C3%BAsqueda%20de%20maquinaria."
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-4 py-3 text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors border-t border-slate-800/80"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200">WhatsApp</span>
                      <span className="text-[10px] text-slate-500">+58 414-6370819</span>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Panel Admin link — only for admin users */}
            {isLoggedIn && isAdmin && (
              <Link href="/admin" className="hover:text-amber-400 transition-colors py-1 border-b-2 border-transparent hover:border-amber-500/50 flex items-center gap-1 text-amber-400 font-bold">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Panel Admin</span>
              </Link>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            
            {loading ? (
              /* Skeleton while session is loading */
              <div className="w-24 h-8 bg-slate-800 rounded-lg animate-pulse" />
            ) : isLoggedIn ? (
              /* Logged in state */
              <div className="flex items-center space-x-2">
                {/* Admin publish button */}
                {isAdmin && (
                  <button
                    onClick={onOpenAdminPublish}
                    className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-orange-950 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publicar Maquinaria</span>
                  </button>
                )}

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setUserDropdownOpen(!userDropdownOpen); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      isAdmin
                        ? 'bg-amber-950/60 border-amber-600/50 text-amber-300 hover:border-amber-500'
                        : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isAdmin ? 'bg-amber-600 text-white' : 'bg-orange-700 text-white'
                    }`}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate">
                      {isAdmin ? '👑 ' : ''}{displayName}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/80">
                        <p className="text-xs text-slate-400">Sesión activa como</p>
                        <p className="text-sm font-bold text-white truncate">{displayName}</p>
                        <p className="text-[10px] mt-0.5 font-semibold uppercase tracking-widest">
                          {isAdmin 
                            ? <span className="text-amber-400">👑 Administrador</span>
                            : <span className="text-sky-400">Cliente Verificado</span>
                          }
                        </p>
                      </div>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-amber-300 hover:bg-amber-950/40 transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Panel de Administración
                        </Link>
                      )}
                      <Link
                        href="/perfil"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-850 hover:text-white transition-colors border-t border-slate-800/80"
                      >
                        <User className="w-3.5 h-3.5 text-orange-400" />
                        Mi Perfil / Oficina Virtual
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors border-t border-slate-800"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Guest state */
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="relative group overflow-hidden rounded-lg p-[1px] font-semibold text-xs shadow-lg shadow-orange-900/30"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-lg group-hover:opacity-90 transition-opacity"></span>
                  <span className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-slate-950 text-white group-hover:bg-opacity-0 transition-all duration-300">
                    <User className="w-3.5 h-3.5 text-orange-400 group-hover:text-white transition-colors" />
                    <span>Registrar Empresa / RIF</span>
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg border border-slate-800 bg-slate-900/60"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-4 border-t border-slate-800 bg-slate-900/95 rounded-xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3 font-medium text-slate-200 text-sm">
              
              {/* Mobile: show user info if logged in */}
              {isLoggedIn && (
                <div className="flex items-center gap-3 py-2 px-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                    isAdmin ? 'bg-amber-600 text-white' : 'bg-orange-700 text-white'
                  }`}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-xs truncate">{isAdmin ? '👑 ' : ''}{displayName}</p>
                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${isAdmin ? 'text-amber-400' : 'text-sky-400'}`}>
                      {isAdmin ? 'Administrador' : 'Cliente'}
                    </p>
                  </div>
                </div>
              )}

              {/* Admin: Publish button */}
              {isLoggedIn && isAdmin && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAdminPublish(); }}
                  className="w-full py-2.5 bg-orange-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar Nueva Maquinaria</span>
                </button>
              )}

              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-orange-400 py-1.5 border-b border-slate-800/50">
                Inicio
              </Link>
              <Link href="/catalogo" onClick={() => setMobileMenuOpen(false)} className="hover:text-orange-400 py-1.5 border-b border-slate-800/50">
                Catálogo Completo
              </Link>

              {/* Mobile: Atención Personalizada Section */}
              <div className="border-b border-slate-800/50 py-2.5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Atención Personalizada</span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="https://t.me/makimportvzla"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-sky-950/40 hover:bg-sky-900/60 border border-sky-850 text-sky-400 text-xs font-bold rounded-lg transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </a>
                  <a
                    href="https://wa.me/584146370819?text=Hola%20MAKIMPORT%2C%20busco%20atenci%C3%B3n%20personalizada%20para%20la%20compra%2Fb%C3%BAsqueda%20de%20maquinaria."
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-850 text-emerald-400 text-xs font-bold rounded-lg transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Admin panel link — only for admin */}
              {isLoggedIn && isAdmin && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1.5 border-b border-slate-800/50 font-bold text-amber-400 flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Panel Admin
                </Link>
              )}

              {/* Mi Perfil / Oficina Virtual — all logged-in users */}
              {isLoggedIn && (
                <Link
                  href="/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-orange-500/40 text-slate-200 hover:text-white rounded-xl font-bold text-xs transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-700/80 flex items-center justify-center text-[11px] font-black text-white shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-white text-xs">Mi Perfil / Oficina Virtual</span>
                    <span className="block text-[10px] text-orange-400 font-medium">Subastas · Compras · Configuración</span>
                  </div>
                  <span className="text-orange-500 text-xs">›</span>
                </Link>
              )}

              <div className="pt-2 flex flex-col space-y-2">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2.5 rounded-lg border border-red-800/60 bg-red-950/40 text-red-400 font-semibold flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
                      className="w-full text-center py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white font-medium"
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
                      className="w-full text-center py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold shadow-lg shadow-orange-950"
                    >
                      Registrar Empresa / RIF
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
