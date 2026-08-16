'use client';

import React, { useState } from 'react';
import { Send, MessageCircle, X, Phone } from 'lucide-react';

const TELEGRAM_URL = 'https://t.me/makimportvzla';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hola MAKIMPORT, busco atención personalizada para la compra/búsqueda de maquinaria.'
);
const WHATSAPP_URL = `https://wa.me/584146370819?text=${WHATSAPP_MESSAGE}`;

export const FloatingContactButtons: React.FC = () => {
  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-auto">
      {/* Telegram Button */}
      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Contactar por Telegram"
        className="group flex items-center gap-2"
      >
        <span className="bg-slate-900 border border-slate-700 text-[10px] font-semibold text-slate-300 px-2.5 py-1 rounded-full shadow-md whitespace-nowrap opacity-80 group-hover:opacity-100 transition-all">
          Telegram
        </span>
        <div className="w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-400 active:scale-90 text-white flex items-center justify-center shadow-lg shadow-sky-900/40 transition-all duration-200 hover:scale-105">
          <Send className="w-4 h-4" />
        </div>
      </a>

      {/* WhatsApp Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Contactar por WhatsApp"
        className="group flex items-center gap-2"
      >
        <span className="bg-slate-900 border border-slate-700 text-xs font-black text-white px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap transition-all group-hover:border-emerald-500">
          WhatsApp Directo
        </span>
        <div className="relative w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-90 text-white flex items-center justify-center shadow-xl shadow-emerald-900/50 transition-all duration-200 hover:scale-115 hover:shadow-emerald-500/40">
          <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-40 animate-ping pointer-events-none" />
          <MessageCircle className="w-6 h-6 fill-white" />
        </div>
      </a>
    </div>
  );
};
