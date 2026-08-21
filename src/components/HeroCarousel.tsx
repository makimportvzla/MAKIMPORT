'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface CarouselBanner {
  id: string;
  image_url: string;
  title: string;
  subtitle?: string;
  link_url?: string;
  is_active: boolean;
  order: number;
}

const DEFAULT_BANNERS: CarouselBanner[] = [
  {
    id: 'default-1',
    image_url: 'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=1200',
    title: 'COMPRA, VENDE, ALQUILA Y COTIZA MAQUINARIA PESADA',
    subtitle: 'El ecosistema integral de equipos pesados en Venezuela con fletes marítimos desde Houston o Shanghai y aduana garantizada.',
    link_url: '#catalogo-marketplace',
    is_active: true,
    order: 1
  },
  {
    id: 'default-2',
    image_url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&q=80&w=1200',
    title: 'COTIZACIÓN FORMAL DE OBRAS Y PROYECTOS',
    subtitle: '¿Necesitas presupuesto con maquinarias y operadores calificados? Completa los requerimientos y recibe respuesta en 24 horas.',
    link_url: '/cotizacion-obra',
    is_active: true,
    order: 2
  },
  {
    id: 'default-3',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200',
    title: 'IMPORTACIÓN DIRECTA DESDE EE.UU. Y CHINA',
    subtitle: 'Trae tu maquinaria pesada directo al Puerto de La Guaira o Puerto Cabello con total respaldo logístico y aduanal.',
    link_url: '#catalogo-marketplace',
    is_active: true,
    order: 3
  }
];

export const HeroCarousel: React.FC = () => {
  const [banners, setBanners] = useState<CarouselBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      // 1. Load from cache first for instant rendering
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('makimport_carousel_banners');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBanners(parsed);
            }
          } catch (e) {
            console.error('Error parsing cached banners:', e);
          }
        }
      }

      try {
        const { data, error } = await supabase
          .from('carousel_banners')
          .select('*')
          .eq('is_active', true)
          .order('order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setBanners(data as CarouselBanner[]);
          if (typeof window !== 'undefined') {
            localStorage.setItem('makimport_carousel_banners', JSON.stringify(data));
          }
        } else {
          // If DB is empty, use defaults
          setBanners(DEFAULT_BANNERS);
        }
      } catch (err) {
        console.warn('Error loading carousel banners, using fallback:', err);
        // Fallback to cache if exists, else defaults
        if (banners.length === 0) {
          setBanners(DEFAULT_BANNERS);
        }
      }
    };

    fetchBanners();
  }, []);

  // Handle Autoplay Loop
  useEffect(() => {
    if (banners.length <= 1 || isPaused) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 6000);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [banners, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleCtaClick = (linkUrl?: string) => {
    if (!linkUrl) return;
    if (linkUrl.startsWith('#')) {
      const element = document.getElementById(linkUrl.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = linkUrl;
    }
  };

  if (banners.length === 0) return null;

  return (
    <div
      className="relative w-full h-[320px] sm:h-[400px] lg:h-[460px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Wrapper */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 w-full h-full transition-all duration-[800ms] ease-out ${
              index === currentIndex
                ? 'opacity-100 translate-x-0 scale-100 z-10'
                : 'opacity-0 translate-x-full scale-105 z-0 pointer-events-none'
            }`}
          >
            {/* Slide Image */}
            <div className="absolute inset-0 bg-slate-950">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover object-center opacity-40 select-none pointer-events-none transition-transform duration-[6000ms] ease-in-out scale-100 group-hover:scale-105"
              />
              {/* Premium Gradients overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>
              {/* Industrial overlay grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
            </div>

            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14 z-20 text-left max-w-4xl">
              <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                {/* Glowing Pill Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-[9px] sm:text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                  <span>Destacado</span>
                </div>

                {/* Banner Title */}
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight uppercase tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  {banner.title}
                </h2>

                {/* Banner Subtitle */}
                {banner.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                    {banner.subtitle}
                  </p>
                )}

                {/* CTA Button */}
                {banner.link_url && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleCtaClick(banner.link_url)}
                      className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50 hover:shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 duration-200"
                    >
                      <span>Saber Más</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Navigation Chevrons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-orange-600 border border-slate-800 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105"
            aria-label="Anterior banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-orange-600 border border-slate-800 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105"
            aria-label="Siguiente banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-6 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'
                  : 'w-2 bg-slate-500 hover:bg-slate-400'
              }`}
              aria-label={`Ir al banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
