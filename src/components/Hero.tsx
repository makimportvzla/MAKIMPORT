'use client';

import React, { useState } from 'react';
import { Search, Gavel, FileText, ArrowRight, ShieldCheck, Ship, CheckCircle2, ChevronRight, Globe2, Wrench, ShoppingBag, Calendar, BarChart3, Tag } from 'lucide-react';
import { CATEGORIES, BRANDS } from '@/constants/machineryOptions';

interface HeroProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onFilterChange?: (filters: { brand: string; type: string; origin: string; transaction: string }) => void;
  onOpenCustomRequest?: () => void;
  onOpenPostularEquipo?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth, onFilterChange, onOpenCustomRequest, onOpenPostularEquipo }) => {
  const [brand, setBrand] = useState('all');
  const [type, setType] = useState('all');
  const [origin, setOrigin] = useState('all');
  const [transaction, setTransaction] = useState('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFilterChange) {
      onFilterChange({ brand, type, origin, transaction });
    }
    const catalogEl = document.getElementById('catalogo-marketplace');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSeeAuctions = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onFilterChange) {
      onFilterChange({ brand: 'all', type: 'all', origin: 'all', transaction: 'auction' });
    }
    const catalogEl = document.getElementById('catalogo-marketplace');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCatalogClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const catalogEl = document.getElementById('catalogo-marketplace');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/catalogo';
    }
  };

  return (
    <section className="relative min-h-screen pt-28 pb-20 flex flex-col justify-center overflow-hidden bg-slate-950">
      
      {/* Background Graphic Effects & Industrial Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Dynamic Glowing Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[350px] h-[250px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full">
        
        {/* Top Tag / Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-orange-500/30 text-xs font-semibold text-orange-400 backdrop-blur-md shadow-lg shadow-black/40">
            <Globe2 className="w-4 h-4 text-orange-500 animate-pulse animate-duration-[2000ms]" />
            <span>Ecosistema Integral de Maquinaria Pesada en Venezuela</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-300 font-normal">Aduanas en Puerto Cabello & La Guaira</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Compra, Vende, Alquila y Cotiza{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent underline decoration-orange-500/40 decoration-wavy decoration-2">
              Maquinaria Pesada
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Tu solución integral: catálogo nacional verificado, alquiler de equipos para proyectos, red de servicios técnicos e importación directa desde EE.UU. y China.
          </p>

          {/* CTA SECUNDARIO DESTACADO: Banner de Cotización de Obra */}
          <div className="pt-4 max-w-3xl mx-auto">
            <div
              onClick={() => { window.location.href = '/cotizacion-obra'; }}
              className="group relative bg-gradient-to-r from-orange-950/40 via-slate-900 to-amber-950/40 border border-orange-500/30 hover:border-orange-500/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 cursor-pointer shadow-xl shadow-black/30 hover:shadow-orange-950/20 hover:-translate-y-0.5"
            >
              {/* Decorative side glows */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500"></div>

              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/35 flex items-center justify-center text-orange-400 shrink-0">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    Cotizar Obra o Proyecto
                    <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-black rounded-full uppercase tracking-wider">Nuevo</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">¿Necesitas presupuesto de obra con maquinarias y operadores? Solicita tu propuesta formal 24h.</p>
                </div>
              </div>
              <button
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50 transition-colors z-10"
              >
                <span>Cotizar Proyecto</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* MATRIZ DE ACCIONES RÁPIDAS (Grid 4 columnas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 max-w-5xl mx-auto">
            {/* Accion 1: Catálogo */}
            <div
              onClick={handleCatalogClick}
              className="group p-4 bg-slate-900/60 border border-slate-800/80 hover:border-orange-500/40 rounded-2xl text-center space-y-3 cursor-pointer transition-all hover:bg-slate-900/90 hover:-translate-y-0.5 shadow-lg shadow-black/20"
            >
              <div className="mx-auto w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-600/20 group-hover:border-orange-500/35 transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white group-hover:text-orange-400 transition-colors uppercase tracking-wider">Catálogo Nacional</h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">Compra y venta directa de maquinaria pesada verificada.</p>
              </div>
            </div>

            {/* Accion 2: Alquiler */}
            <div
              onClick={() => { window.location.href = '/alquiler'; }}
              className="group p-4 bg-slate-900/60 border border-slate-800/80 hover:border-orange-500/40 rounded-2xl text-center space-y-3 cursor-pointer transition-all hover:bg-slate-900/90 hover:-translate-y-0.5 shadow-lg shadow-black/20"
            >
              <div className="mx-auto w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-600/20 group-hover:border-orange-500/35 transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white group-hover:text-orange-400 transition-colors uppercase tracking-wider">Alquiler de Equipos</h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">Servicio de renta de maquinaria para obras en todo el país.</p>
              </div>
            </div>

            {/* Accion 3: Servicios */}
            <div
              onClick={() => { window.location.href = '/servicios'; }}
              className="group p-4 bg-slate-900/60 border border-slate-800/80 hover:border-orange-500/40 rounded-2xl text-center space-y-3 cursor-pointer transition-all hover:bg-slate-900/90 hover:-translate-y-0.5 shadow-lg shadow-black/20"
            >
              <div className="mx-auto w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-600/20 group-hover:border-orange-500/35 transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white group-hover:text-orange-400 transition-colors uppercase tracking-wider">Servicios Técnicos</h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">Mecánicos certificados, grúas de servicio y repuestos directos.</p>
              </div>
            </div>

            {/* Accion 4: Subastas */}
            <div
              onClick={handleSeeAuctions}
              className="group p-4 bg-slate-900/60 border border-slate-800/80 hover:border-orange-500/40 rounded-2xl text-center space-y-3 cursor-pointer transition-all hover:bg-slate-900/90 hover:-translate-y-0.5 shadow-lg shadow-black/20"
            >
              <div className="mx-auto w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-600/20 group-hover:border-orange-500/35 transition-colors">
                <Gavel className="w-5 h-5 animate-pulse animate-duration-[3000ms]" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white group-hover:text-orange-400 transition-colors uppercase tracking-wider">Subastas e Importación</h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">Adjudica y trae directo desde EE.UU. o China con total aduana.</p>
              </div>
            </div>

            {/* Accion 5: Vender mi Equipo */}
            <div
              onClick={() => onOpenPostularEquipo?.()}
              className="group p-4 bg-amber-950/20 border border-amber-700/40 hover:border-amber-500/60 rounded-2xl text-center space-y-3 cursor-pointer transition-all hover:bg-amber-950/35 hover:-translate-y-0.5 shadow-lg shadow-black/20 sm:col-span-2 lg:col-span-1"
            >
              <div className="mx-auto w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-600/30 group-hover:border-amber-500/50 transition-colors">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-amber-300 group-hover:text-amber-200 transition-colors uppercase tracking-wider">Publica tu Equipo</h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">Vende tu maquinaria en nuestro catálogo nacional.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Search Filter Card */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/80 relative">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-orange-400">
              <Search className="w-4 h-4 text-orange-500" />
              <span>Buscador Rápido de Maquinaria</span>
            </div>

            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Brand Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Marca</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                >
                  <option value="all">Todas las Marcas</option>
                  {BRANDS.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Machine Type Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Tipo de Máquina</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                >
                  <option value="all">Todos los Tipos</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Origin Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Origen de Importación</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                >
                  <option value="all">EE.UU. & China</option>
                  <option value="USA">🇺🇸 EE.UU. (Houston / Miami)</option>
                  <option value="China">🇨🇳 China (Shanghai / Ningbo)</option>
                </select>
              </div>

              {/* Transaction Type & Search Button */}
              <div className="flex flex-col justify-end space-y-2 sm:space-y-0 sm:flex-row sm:items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-950 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Buscar Equipo</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Metrics & Trust Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-slate-800/80 pt-8">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">500+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Máquinas Entregadas en Venezuela</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">$14M+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Ahorrados en Subastas Directas</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-500">100%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Inspección Mecánica Certificada</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">18 - 25 Días</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Tiempo de Flete Marítimo Promedio</div>
          </div>
        </div>

      </div>
    </section>
  );
};
