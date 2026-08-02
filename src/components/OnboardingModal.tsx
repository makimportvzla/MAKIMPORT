'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, CheckCircle2, Search, Megaphone, Gavel, HeadphonesIcon } from 'lucide-react';

const STORAGE_KEY = 'has_seen_onboarding_v1';

interface Slide {
  icon: React.ReactNode;
  accent: string;
  tag: string;
  title: string;
  body: string;
  gradient: string;
  bg: string;
}

const slides: Slide[] = [
  {
    icon: <Search className="w-10 h-10" />,
    accent: '#f97316',
    tag: 'Paso 1 de 4',
    title: 'Buscar y Comprar\nMaquinaria',
    body: 'Encuentra equipos industriales inspeccionados de los mejores fabricantes del mundo — Caterpillar, Komatsu, SANY, XCMG y más. Disponibles para compra inmediata o subasta en vivo.',
    gradient: 'from-orange-600/25 via-transparent to-transparent',
    bg: 'bg-orange-500/10',
  },
  {
    icon: <Megaphone className="w-10 h-10" />,
    accent: '#38bdf8',
    tag: 'Paso 2 de 4',
    title: 'Publica y Vende\ncon Nosotros',
    body: '¿Tienes maquinaria, plantas eléctricas, motores o equipos del sector industrial, petrolero o de construcción? Contáctanos por WhatsApp, Telegram, Instagram o Correo enviándonos las fotos, detalles técnicos y tus datos — ¡y nosotros los publicaremos en la App!',
    gradient: 'from-sky-600/25 via-transparent to-transparent',
    bg: 'bg-sky-500/10',
  },
  {
    icon: <Gavel className="w-10 h-10" />,
    accent: '#a78bfa',
    tag: 'Paso 3 de 4',
    title: 'Subastas en Vivo y\nCotización Importada',
    body: 'Oferta en tiempo real en subastas internacionales o solicita la importación de tu equipo desde EE. UU. (Houston / Miami) o China (Shanghai / Ningbo) con entrega Puerta a Puerta hasta Venezuela.',
    gradient: 'from-violet-600/25 via-transparent to-transparent',
    bg: 'bg-violet-500/10',
  },
  {
    icon: <HeadphonesIcon className="w-10 h-10" />,
    accent: '#34d399',
    tag: 'Paso 4 de 4',
    title: 'Gestión y Atención\nDirecta',
    body: 'Administra tus solicitudes y contratos desde tu Oficina Virtual. Recibe atención personalizada instantánea vía WhatsApp o Telegram y un asesor estará disponible para guiarte en cada etapa del proceso.',
    gradient: 'from-emerald-600/25 via-transparent to-transparent',
    bg: 'bg-emerald-500/10',
  },
];

export const OnboardingModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Small delay so the page renders first
        const t = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage not available (SSR guard)
    }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setVisible(false);
  };

  const goTo = (next: number) => {
    if (animating) return;
    if (next >= slides.length) { dismiss(); return; }
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 220);
  };

  if (!visible) return null;

  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      {/* Modal shell */}
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
        style={{ background: '#0f172a' }}
      >
        {/* Gradient accent top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
          style={{ background: slide.accent }}
        />

        {/* Background radial glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} pointer-events-none transition-all duration-500`}
        />

        {/* Content */}
        <div className="relative z-10 px-7 pt-10 pb-8 flex flex-col min-h-[460px] sm:min-h-[480px]">

          {/* Skip button */}
          <button
            onClick={dismiss}
            className="absolute top-5 right-5 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-800"
            aria-label="Saltar introducción"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon badge */}
          <div
            className={`self-start ${slide.bg} rounded-2xl p-4 mb-6 transition-all duration-500`}
            style={{ color: slide.accent }}
          >
            {slide.icon}
          </div>

          {/* Tag */}
          <span
            className="text-xs font-bold tracking-widest uppercase mb-3 transition-all duration-500"
            style={{ color: slide.accent }}
          >
            {slide.tag}
          </span>

          {/* Title */}
          <h2
            className={`text-2xl font-extrabold text-white leading-tight mb-4 whitespace-pre-line transition-all duration-300 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
          >
            {slide.title}
          </h2>

          {/* Body text */}
          <p
            className={`text-slate-400 text-sm leading-relaxed flex-1 transition-all duration-300 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
            style={{ transitionDelay: animating ? '0ms' : '50ms' }}
          >
            {slide.body}
          </p>

          {/* Bottom bar */}
          <div className="flex items-center justify-between mt-8 gap-4">

            {/* Skip (bottom left) */}
            <button
              onClick={dismiss}
              className="text-slate-500 hover:text-slate-300 text-xs font-semibold tracking-wider uppercase transition-colors px-2 py-1"
            >
              Saltar
            </button>

            {/* Dot indicators (center) */}
            <div className="flex items-center gap-2 mx-auto">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Ir al paso ${i + 1}`}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 24 : 8,
                    height: 8,
                    background: i === step ? slide.accent : '#334155',
                  }}
                />
              ))}
            </div>

            {/* Next / Finish (bottom right) */}
            <button
              onClick={() => goTo(step + 1)}
              className="flex items-center gap-1.5 font-bold text-sm px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 whitespace-nowrap"
              style={{
                background: slide.accent,
                color: '#fff',
                boxShadow: `0 4px 20px ${slide.accent}50`,
              }}
            >
              {isLast ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Empezar
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};
