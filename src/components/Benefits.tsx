import React from 'react';
import { ShieldCheck, Ship, Gavel, CreditCard, Award, CheckCircle2, ArrowRight } from 'lucide-react';

interface BenefitsProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Benefits: React.FC<BenefitsProps> = ({ onOpenAuth }) => {
  const benefitsList = [
    {
      icon: ShieldCheck,
      title: "Máquinas Inspeccionadas 100%",
      description: "Reporte técnico detallado de más de 140 puntos: motor, sistema hidráulico, tren de rodaje, horas reales y pruebas de trabajo con video en alta definición.",
      badge: "Garantía de Estado",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: Ship,
      title: "Importación Segura EE.UU. / China",
      description: "Gestión logística integral puerta a puerto. Despacho aduanal garantizado en Puerto Cabello y La Guaira con nacionalización y documentación legal al día.",
      badge: "Logística Certificada",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Gavel,
      title: "Subastas Transparentes en Vivo",
      description: "Pujas en tiempo real auditadas. Sin intermediarios ni comisiones ocultas. Visualiza el historial completo de ofertas con cuenta regresiva en directo.",
      badge: "Precios de Remate",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: CreditCard,
      title: "Opciones de Financiamiento",
      description: "Facilidades de pago por fases (reserva, embarque y recepción en puerto venezuela) con planes adaptados para empresas registrables mediante RIF comercial.",
      badge: "Planes Flexibles",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <section className="py-20 bg-slate-900/60 relative border-t border-b border-slate-800/80 overflow-hidden">
      
      {/* Background Subtle Accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>¿Por qué confiar en MAKIMPORT?</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            La vía más segura para adquirir maquinaria pesada en Venezuela
          </h2>
          
          <p className="text-slate-400 text-base">
            Eliminamos los riesgos en compras internacionales de equipos industriales con transparencia total y respaldo legal.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefitsList.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="group relative bg-slate-900/80 border border-slate-800 hover:border-orange-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-950/20 flex flex-col justify-between"
              >
                <div>
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <IconComp className="w-6 h-6 text-orange-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Features Check Bullet */}
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verificado por MAKIMPORT</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Banner Callout */}
        <div className="mt-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-orange-600/20 border border-orange-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">¿Representas a una empresa constructora o contratista en Venezuela?</h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Regístrate con tu RIF comercial para solicitar inspección personalizada y asesoría aduanal previa.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenAuth('register')}
            className="shrink-0 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg transition-all"
          >
            <span>Registrar Empresa / RIF</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
