'use client';

import React, { useState } from 'react';
import { Calculator, Ship, MapPin, ShieldCheck, DollarSign, Calendar, ArrowRight, HelpCircle } from 'lucide-react';

export const ImportCalculator: React.FC = () => {
  const [origin, setOrigin] = useState<'usa' | 'china'>('usa');
  const [destinationPort, setDestinationPort] = useState<'puertocabello' | 'laguaira'>('puertocabello');
  const [machineWeight, setMachineWeight] = useState<number>(20); // tons
  const [fobPrice, setFobPrice] = useState<number>(55000);

  // Estimations calculation logic
  const freightRatePerTon = origin === 'usa' ? 120 : 180;
  const estimatedFreight = Math.round(machineWeight * freightRatePerTon + (origin === 'usa' ? 1800 : 2500));
  const insuranceCost = Math.round(fobPrice * 0.015); // 1.5% insurance
  const estimatedCustoms = Math.round(fobPrice * 0.08); // 8% estimated import duty/advalorem
  const totalEstimatedCost = fobPrice + estimatedFreight + insuranceCost + estimatedCustoms;
  const estimatedDays = origin === 'usa' ? '14 - 20 Días' : '30 - 38 Días';

  return (
    <section id="importacion" className="py-20 bg-slate-900/40 relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculadora de Logística & Aduana</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Estima el Costo de Importación a Venezuela
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Calcula de forma transparente el flete marítimo, seguro y tramitación aduanal directa a Puerto Cabello o La Guaira.
          </p>
        </div>

        {/* Calculator Interactive Box */}
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Input Controls */}
            <div className="space-y-5">
              
              {/* Origin Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Origen del Embarque
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrigin('usa')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      origin === 'usa'
                        ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>🇺🇸 Estados Unidos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrigin('china')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      origin === 'china'
                        ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>🇨🇳 China</span>
                  </button>
                </div>
              </div>

              {/* Destination Port Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  2. Puerto de Destino en Venezuela
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDestinationPort('puertocabello')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      destinationPort === 'puertocabello'
                        ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Ship className="w-4 h-4" />
                    <span>Puerto Cabello</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestinationPort('laguaira')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      destinationPort === 'laguaira'
                        ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Ship className="w-4 h-4" />
                    <span>La Guaira</span>
                  </button>
                </div>
              </div>

              {/* FOB Price Slider/Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    3. Valor FOB de la Máquina (USD)
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400">${fobPrice.toLocaleString()} USD</span>
                </div>
                <input
                  type="range"
                  min={15000}
                  max={250000}
                  step={5000}
                  value={fobPrice}
                  onChange={(e) => setFobPrice(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer bg-slate-950 rounded-lg h-2"
                />
              </div>

              {/* Weight Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    4. Peso Estimado (Toneladas Métricas)
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400">{machineWeight} Toneladas</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={1}
                  value={machineWeight}
                  onChange={(e) => setMachineWeight(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer bg-slate-950 rounded-lg h-2"
                />
              </div>

            </div>

            {/* Results Output Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Desglose Estimado de Inversión</span>
                  <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40 text-[10px]">
                    Tarifas Actualizadas 2026
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-300 py-1.5 border-b border-slate-900">
                    <span>Valor de la Máquina (FOB):</span>
                    <span className="font-mono font-bold text-white">${fobPrice.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-300 py-1.5 border-b border-slate-900">
                    <span>Flete Marítimo Ro-Ro / Flat Rack:</span>
                    <span className="font-mono font-bold text-white">${estimatedFreight.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-300 py-1.5 border-b border-slate-900">
                    <span>Seguro Marítimo Todo Riesgo:</span>
                    <span className="font-mono font-bold text-white">${insuranceCost.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-300 py-1.5 border-b border-slate-900">
                    <span>Gestión Aduanal & Nacionalización (Est.):</span>
                    <span className="font-mono font-bold text-white">${estimatedCustoms.toLocaleString()} USD</span>
                  </div>

                  <div className="flex justify-between text-slate-300 pt-2 font-bold text-sm">
                    <span className="text-slate-200">Tiempo de Tránsito Estimado:</span>
                    <span className="text-orange-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {estimatedDays}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Output Highlight */}
              <div className="bg-slate-900 border border-orange-500/30 rounded-xl p-4 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-medium block">
                  Costo Total Puesto en Puerto Venezuela
                </span>
                <span className="text-3xl font-black text-amber-400 font-mono block mt-1">
                  ${totalEstimatedCost.toLocaleString()} USD
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  * Valores aproximados. Cotización formal emitida tras verificación del modelo de máquina.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
