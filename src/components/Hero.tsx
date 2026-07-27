'use client';

import React, { useState } from 'react';
import { Search, Gavel, FileText, ArrowRight, ShieldCheck, Ship, CheckCircle2, ChevronRight, Globe2, Wrench } from 'lucide-react';

interface HeroProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onFilterChange?: (filters: { brand: string; type: string; origin: string; transaction: string }) => void;
  onOpenCustomRequest?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth, onFilterChange, onOpenCustomRequest }) => {
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
            <Globe2 className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>Importación Directa desde EE.UU. y China hacia Venezuela</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-300 font-normal">Aduanas en Puerto Cabello & La Guaira</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            La plataforma líder en importación y subastas de{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent underline decoration-orange-500/40 decoration-wavy decoration-2">
              maquinaria pesada
            </span>{' '}
            para Venezuela
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Accede a subastas en vivo e inventario verificado en <strong className="text-white">Estados Unidos (Houston, Miami)</strong> y <strong className="text-white">China (Shanghai, Ningbo)</strong>. Inspección técnica de 140 puntos y logística marítima integral garantizada.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleSeeAuctions}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-orange-950/50 hover:shadow-orange-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <Gavel className="w-5 h-5 text-white" />
              <span>Ver Subastas Activas</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenCustomRequest}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg backdrop-blur-md transition-all border-orange-500/20 hover:border-orange-500/50"
            >
              <Wrench className="w-5 h-5 text-orange-400" />
              <span>Cotizar Maquinaria</span>
            </button>
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
                  <option value="Caterpillar">Caterpillar (CAT)</option>
                  <option value="Komatsu">Komatsu</option>
                  <option value="SANY">SANY</option>
                  <option value="XCMG">XCMG</option>
                  <option value="Volvo">Volvo CE</option>
                  <option value="JCB">JCB</option>
                  <option value="John Deere">John Deere</option>
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
                  <option value="Excavadora">Excavadoras de Oruga</option>
                  <option value="Bulldozer">Bulldozers / Tractores</option>
                  <option value="Cargador">Cargadores Frontales</option>
                  <option value="Retroexcavadora">Retroexcavadoras</option>
                  <option value="Grúa">Grúas Industriales</option>
                  <option value="Motoniveladora">Motoniveladoras</option>
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
