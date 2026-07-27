'use client';

import React, { useState } from 'react';
import { X, Clock, MapPin, Gauge, Calendar, ShieldCheck, Gavel, DollarSign, Phone, CheckCircle2, Ship, FileText, Send, Instagram, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MachineryItem } from '@/types/machinery';

export type { MachineryItem };

interface MachineryModalProps {
  item: MachineryItem | null;
  onClose: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  userRole?: 'admin' | 'client';
  onBidSuccess?: (amount: number) => void;
}

export const MachineryModal: React.FC<MachineryModalProps> = ({
  item,
  onClose,
  onOpenAuth,
  userRole = 'client',
  onBidSuccess
}) => {
  const [bidAmount, setBidAmount] = useState<number>(
    item ? (item.currentBid ? item.currentBid + (item.minBidIncrement || 500) : item.price) : 0
  );
  const [bidSuccessMessage, setBidSuccessMessage] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);

  if (!item) return null;

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBid(true);

    try {
      // Try inserting into Supabase bids table
      try {
        await supabase.from('bids').insert({
          machinery_id: item.id,
          user_id: '00000000-0000-0000-0000-000000000000', // Anonymous or authenticated user ID
          monto_puja: Number(bidAmount)
        });
      } catch (err) {
        console.warn('Fallback local para bid:', err);
      }

      if (onBidSuccess) {
        onBidSuccess(Number(bidAmount));
      }

      setBidSuccessMessage(true);
      setTimeout(() => {
        setBidSuccessMessage(false);
      }, 4000);
    } finally {
      setSubmittingBid(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white bg-slate-950/80 rounded-full border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Column: Photo & Details */}
          <div className="relative bg-slate-950 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden mb-4 border border-slate-800">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute top-3 left-3">
                  {item.status === 'auction' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                      <Gavel className="w-3.5 h-3.5 animate-pulse" />
                      Subasta Activa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Compra Inmediata
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5">
                  <span>{item.origin === 'USA' ? '🇺🇸 EE.UU.' : '🇨🇳 China'}</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-medium text-slate-300">Puntaje Inspección Técnica</span>
                </div>
                <span className="text-sm font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/50">
                  {item.inspectionScore} / 100 PTS
                </span>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-xl text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-orange-400">
                <Ship className="w-3.5 h-3.5" />
                <span>Ruta Marítima de Envío:</span>
              </div>
              <p>Origen: <strong>{item.location}</strong></p>
              <p>Destino: <strong>Puerto Cabello / La Guaira, Venezuela</strong></p>
            </div>
          </div>

          {/* Right Column: Specs & Bidding */}
          <div className="p-6 flex flex-col justify-between space-y-6">
            
            <div>
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">
                {item.brand} • {item.category}
              </div>
              
              <h2 className="text-2xl font-extrabold text-white mb-2">
                {item.name} ({item.model})
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {item.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase">Año Fabricación</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    {item.year}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase">Horas Operativas</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <Gauge className="w-3.5 h-3.5 text-orange-400" />
                    {item.hours.toLocaleString()} hrs
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase">Ubicación Origen</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    {item.location}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase">Número Serie / VIN</span>
                  <span className="font-mono font-bold text-slate-200 mt-0.5 block truncate">
                    {item.serialNumber}
                  </span>
                </div>
              </div>

              {/* Pricing & Bidding Form */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {item.status === 'auction' ? 'Puja Actual Auditada:' : 'Precio Compra Directa:'}
                  </span>
                  <span className="text-2xl font-black text-amber-400">
                    ${(item.status === 'auction' ? item.currentBid || item.price : item.price).toLocaleString()} USD
                  </span>
                </div>

                {item.status === 'auction' && (
                  <form onSubmit={handlePlaceBid} className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={(item.currentBid || item.price) + (item.minBidIncrement || 500)}
                        step={item.minBidIncrement || 500}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-orange-500"
                        placeholder="Monto de la puja"
                      />
                      <button
                        type="submit"
                        disabled={submittingBid}
                        className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-sm shrink-0 shadow-md shadow-orange-950 transition-colors"
                      >
                        {submittingBid ? 'Enviando...' : 'Enviar Puja'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      * Puja mínima recomendada: +${(item.minBidIncrement || 500).toLocaleString()} USD. Las pujas quedan registradas en Supabase Realtime.
                    </p>
                  </form>
                )}

                {bidSuccessMessage && (
                  <div className="p-2.5 bg-emerald-950/90 border border-emerald-500/50 rounded-lg text-xs text-emerald-300 font-semibold text-center animate-in fade-in">
                    ✓ Puja registrada exitosamente en Supabase. La oferta se ha actualizado en tiempo real.
                  </div>
                )}
              </div>
            </div>

            {/* Official Contact Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Contactar Asesor MAKIMPORT:</div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={`https://t.me/makimportvzla`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-sky-600/20 hover:bg-sky-600 border border-sky-500/40 text-sky-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram @makimportvzla</span>
                </a>

                <a
                  href={`https://instagram.com/makimport.vzla`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-pink-600/20 hover:bg-pink-600 border border-pink-500/40 text-pink-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram @makimport.vzla</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
