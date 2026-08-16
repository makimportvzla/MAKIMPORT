'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { User, Menu, X, Ship, Send, Instagram, Mail, Plus, LayoutDashboard, LogOut, ChevronDown, MessageCircle, Wrench, HardHat } from 'lucide-react';
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
  const [serviciosDropdownOpen, setServiciosDropdownOpen] = useState(false);

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
      setServiciosDropdownOpen(false);
    };
    if (userDropdownOpen || contactDropdownOpen || serviciosDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userDropdownOpen, contactDropdownOpen, serviciosDropdownOpen]);

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
            <Link href="/alquiler" className="hover:text-orange-400 transition-colors py-1 border-b-2 border-transparent hover:border-orange-500/50">
              Alquiler de Equipos
            </Link>
            <Link href="/postular-equipo" className="hover:text-orange-400 transition-colors py-1 border-b-2 border-transparent hover:border-orange-500/50 flex items-center gap-1.5">
              <span className="text-[10px] bg-emerald-600/80 text-white px-1.5 py-0.5 rounded font-bold">NUEVO</span>
              Postular mi Equipo
            </Link>
            <a href="#subastas" className="hover:text-orange-400 transition-colors py-1 border-b-2 border-transparent hover:border-orange-500/50 flex items-center gap-1.5">
              Subastas
              <span className="bg-orange-600/90 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                En vivo
              </span>
            </a>

            {/* Servicios & Proyectos Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setServiciosDropdownOpen(!serviciosDropdownOpen); }}
                className="hover:text-orange-400 transition-colors py-1 border-b-2 border-transparent hover:border-orange-500/50 flex items-center gap-1.5 focus:outline-none"
              >
                <span>Servicios y Proyectos</span>
                <span className="text-[10px] bg-orange-600/80 text-white px-1.5 py-0.5 rounded font-bold">NUEVO</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${serviciosDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {serviciosDropdownOpen && (
                <div className="absolute left-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="p-2 border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 py-1.5">
                    Para Proveedores y Clientes
                  </div>
                  <Link
                    href="/servicios"
                    onClick={() => setServiciosDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <Wrench className="w-4 h-4 text-orange-400" />
                    <div className="flex flex-col">
                      <span className="font-bold">Postular como Proveedor</span>
                      <span className="text-[10px] text-slate-500">Mecánico, transporte, repuestos...</span>
                    </div>
                  </Link>
                  <Link
                    href="/cotizacion-obra"
                    onClick={() => setServiciosDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors border-t border-slate-800/80"
                  >
                    <HardHat className="w-4 h-4 text-amber-400" />
                    <div className="flex flex-col">
                      <span className="font-bold">Cotizar Obra o Proyecto</span>
                      <span className="text-[10px] text-slate-500">Movimiento de tierras, demolición...</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

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
          <div className="lg:hidden mt-2 pt-3 pb-[100px] border-t border-slate-800 bg-slate-900/98 rounded-xl p-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-100px)] overflow-y-auto">
            <div className="flex flex-col space-y-2.5 font-medium text-slate-200 text-sm">
              
              {/* 1. User Header (Avatar + Name + Role) */}
              {isLoggedIn && (
                <div className="flex items-center gap-2.5 py-1.5 px-2.5 bg-slate-950 rounded-lg border border-slate-850">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    isAdmin ? 'bg-amber-600 text-white' : 'bg-orange-700 text-white'
                  }`}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-xs truncate leading-tight">{isAdmin ? '👑 ' : ''}{displayName}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-wider ${isAdmin ? 'text-amber-400' : 'text-sky-400'}`}>
                      {isAdmin ? 'Administrador' : 'Cliente'}
                    </p>
                  </div>
                </div>
              )}

              {/* 2. Admin: Publish button */}
              {isLoggedIn && isAdmin && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAdminPublish(); }}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-lg text-[11px] flex items-center justify-center gap-1 shadow-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publicar Nueva Maquinaria</span>
                </button>
              )}

              {/* 3. General Links (Inicio / Catálogo) */}
              <div className="flex flex-col">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-orange-400 py-1.5 px-1 border-b border-slate-800/40 text-xs">
                  Inicio
                </Link>
                <Link href="/catalogo" onClick={() => setMobileMenuOpen(false)} className="hover:text-orange-400 py-1.5 px-1 border-b border-slate-800/40 text-xs">
                  Catálogo Completo
                </Link>
              </div>

              {/* 4. Mi Perfil / Oficina Virtual (High priority) */}
              {isLoggedIn && (
                <Link
                  href="/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 px-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-orange-500/30 text-slate-200 hover:text-white rounded-lg font-bold text-xs transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-orange-700/80 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-white text-[11px]">Mi Perfil / Oficina Virtual</span>
                  </div>
                  <span className="text-orange-500 text-xs font-bold">›</span>
                </Link>
              )}

              {/* 5. Panel Admin (only admin) */}
              {isLoggedIn && isAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="hover:text-amber-400 py-1.5 px-1 border-b border-slate-800/40 font-bold text-amber-400 text-xs flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Panel Admin</span>
                </Link>
              )}

              {/* 6. Alquiler de Equipos / Postular Equipo */}
              <div className="flex flex-col">
                <Link href="/alquiler" onClick={() => setMobileMenuOpen(false)} className="hover:text-orange-400 py-1.5 px-1 border-b border-slate-800/40 text-xs">
                  Alquiler de Equipos (Renta)
                </Link>
                <Link href="/postular-equipo" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-400 py-1.5 px-1 border-b border-slate-800/40 text-xs flex items-center gap-1.5">
                  <span className="text-[8px] bg-emerald-600/80 text-white px-1 py-0.5 rounded font-black">NUEVO</span>
                  Postular mi Equipo
                </Link>
              </div>

              {/* 7. Servicios & Proyectos */}
              <div className="border-b border-slate-800/40 pb-2 space-y-1.5">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block mt-1">
                  Servicios y Proyectos
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href="/servicios"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col justify-center p-2 bg-orange-950/15 hover:bg-orange-950/25 border border-orange-900/20 text-orange-400 text-[10px] font-bold rounded-lg transition-all"
                  >
                    <span className="block">Postular Proveedor</span>
                  </Link>
                  <Link
                    href="/cotizacion-obra"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col justify-center p-2 bg-amber-950/15 hover:bg-amber-950/25 border border-amber-900/20 text-amber-400 text-[10px] font-bold rounded-lg transition-all"
                  >
                    <span className="block">Cotizar Obra</span>
                  </Link>
                </div>
              </div>

              {/* 8. Contacto / Redes en una sola fila compacta */}
              <div className="pb-1.5">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block mb-1.5">Contacto Rápido</span>
                <div className="grid grid-cols-3 gap-1">
                  <a
                    href="https://t.me/makimportvzla"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1 py-1.5 px-1 bg-sky-950/30 hover:bg-sky-900/40 border border-sky-900/25 text-sky-400 text-[10px] font-bold rounded-md transition-all"
                  >
                    <Send className="w-3 h-3" />
                    <span>Telegram</span>
                  </a>
                  <a
                    href="https://wa.me/584146370819?text=Hola%20MAKIMPORT%2C%20busco%20atenci%C3%B3n%20personalizada%20para%20la%20compra%2Fb%C3%BAsqueda%20de%20maquinaria."
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1 py-1.5 px-1 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-900/25 text-emerald-400 text-[10px] font-bold rounded-md transition-all"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="https://instagram.com/makimport.vzla"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1 py-1.5 px-1 bg-pink-950/30 hover:bg-pink-900/40 border border-pink-900/20 text-pink-400 text-[10px] font-bold rounded-md transition-all"
                  >
                    <Instagram className="w-3 h-3" />
                    <span>Instagram</span>
                  </a>
                </div>
              </div>

              {/* 9. Auth Actions / Cerrar Sesión */}
              <div className="pt-1.5 flex flex-col space-y-1.5">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2 rounded-lg border border-red-900/45 bg-red-950/20 hover:bg-red-950/35 text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                ) : (
                  <div className="flex flex-col space-y-1.5">
                    <button
                      onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
                      className="w-full text-center py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs transition-colors"
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
                      className="w-full text-center py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-colors"
                    >
                      Registrar Empresa / RIF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
