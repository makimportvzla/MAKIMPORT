import React from 'react';
import { Logo } from './Logo';
import { Phone, Mail, MapPin, ShieldCheck, Ship, Clock, Globe2, ArrowRight, Send, Instagram, MessageCircle } from 'lucide-react';

interface FooterProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth }) => {
  return (
    <footer id="contacto" className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <Logo size="lg" />
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed">
              Plataforma especializada en la importación directa y subastas en vivo de maquinaria pesada para Venezuela desde Estados Unidos y China. Inspecciones garantizadas y despacho aduanal en Puerto Cabello y La Guaira.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                🇺🇸 Houston & Miami
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                🇨🇳 Shanghai & Ningbo
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-orange-400 font-bold">
                🇻🇪 Caracas - Venezuela
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Navegación</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">Inicio</a>
              </li>
              <li>
                <a href="#catalogo" className="hover:text-orange-400 transition-colors">Catálogo de Maquinaria</a>
              </li>
              <li>
                <a href="#subastas" className="hover:text-orange-400 transition-colors">Subastas en Vivo</a>
              </li>
              <li>
                <a href="#importacion" className="hover:text-orange-400 transition-colors">Calculadora de Flete Marítimo</a>
              </li>
              <li>
                <button onClick={() => onOpenAuth('register')} className="hover:text-orange-400 transition-colors text-left">
                  Registro de Empresa / RIF
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info & Address */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Sede Principal Venezuela</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>Caracas - Venezuela</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <a href="mailto:makimportvzla@gmail.com" className="hover:text-orange-400 font-medium">
                  makimportvzla@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href="https://wa.me/584146370819" target="_blank" rel="noreferrer" className="hover:text-emerald-400 font-medium">
                  +58 414-6370819 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Aduanas: Puerto Cabello & La Guaira</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Social Channels */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Canales Oficiales</h4>
            <div className="space-y-2.5 text-xs">
              
              {/* Telegram Button */}
              <a
                href="https://t.me/makimportvzla"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-sky-400 hover:bg-sky-950/30 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-950 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-white">Telegram</span>
                  <span className="text-[11px] text-slate-400">@makimportvzla</span>
                </div>
              </a>

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/584146370819?text=Hola%20MAKIMPORT%2C%20deseo%20atenci%C3%B3n%20personalizada."
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/30 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-white">WhatsApp</span>
                  <span className="text-[11px] text-slate-400">+58 414-6370819</span>
                </div>
              </a>

              {/* Instagram Button */}
              <a
                href="https://instagram.com/makimport.vzla"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 text-pink-400 hover:bg-pink-950/30 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-pink-950 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-white">Instagram</span>
                  <span className="text-[11px] text-slate-400">@makimport.vzla</span>
                </div>
              </a>

              <div className="pt-1">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="w-full py-2 px-3 bg-orange-600/20 hover:bg-orange-600 border border-orange-500/40 text-orange-300 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span>Portal de Subastas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} MAKIMPORT - Caracas, Venezuela. Todos los derechos reservados.
          </div>
          <div className="flex items-center space-x-6">
            <a href="mailto:makimportvzla@gmail.com" className="hover:text-slate-400">makimportvzla@gmail.com</a>
            <a href="https://t.me/makimportvzla" target="_blank" rel="noreferrer" className="hover:text-slate-400">Telegram</a>
            <a href="https://instagram.com/makimport.vzla" target="_blank" rel="noreferrer" className="hover:text-slate-400">Instagram</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
