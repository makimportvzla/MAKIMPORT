'use client';

import React, { useState } from 'react';
import { Send, MessageCircle, X, Phone } from 'lucide-react';

const TELEGRAM_URL = 'https://t.me/makimportvzla';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hola MAKIMPORT, busco atención personalizada para la compra/búsqueda de maquinaria.'
);
const WHATSAPP_URL = `https://wa.me/584146370819?text=${WHATSAPP_MESSAGE}`;

export const FloatingContactButtons: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 hidden md:flex flex-col items-end gap-3">

      {/* Telegram Button */}
      <div
        className={`flex items-center gap-2 transition-all duration-300 ease-out ${
          expanded
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <span className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
          Atención Telegram
        </span>
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Contactar por Telegram"
          className="w-12 h-12 rounded-full bg-sky-500 hover:bg-sky-400 active:scale-90 text-white flex items-center justify-center shadow-xl shadow-sky-900/50 transition-all duration-200 hover:scale-110 hover:shadow-sky-500/40"
        >
          <Send className="w-5 h-5" />
        </a>
      </div>

      {/* WhatsApp Button */}
      <div
        className={`flex items-center gap-2 transition-all duration-300 ease-out delay-75 ${
          expanded
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <span className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
          Atención WhatsApp
        </span>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Contactar por WhatsApp"
          className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-90 text-white flex items-center justify-center shadow-xl shadow-emerald-900/50 transition-all duration-200 hover:scale-110 hover:shadow-emerald-500/40"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      </div>

      {/* Main FAB Toggle Button */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        aria-label={expanded ? 'Cerrar contacto' : 'Atención personalizada'}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group ${
          expanded
            ? 'bg-slate-700 hover:bg-slate-600 shadow-slate-900/60 rotate-45'
            : 'bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 shadow-orange-900/60'
        }`}
      >
        {/* Pulse ring (only when collapsed) */}
        {!expanded && (
          <span className="absolute inset-0 rounded-full bg-orange-500 opacity-40 animate-ping pointer-events-none" />
        )}

        {expanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Phone className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
};
