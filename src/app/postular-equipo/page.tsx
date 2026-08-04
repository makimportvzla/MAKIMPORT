'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { AdminPublishModal } from '@/components/AdminPublishModal';
import { FloatingContactButtons } from '@/components/FloatingContactButtons';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES, BRANDS } from '@/constants/machineryOptions';
import {
  User,
  Phone,
  MapPin,
  Settings,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Wrench,
  Hammer,
  Zap,
  Star,
} from 'lucide-react';

const ESTADOS_VZ = [
  'Amazonas','Anzoátegui','Apure','Aragua','Barinas','Bolívar',
  'Carabobo','Cojedes','Delta Amacuro','Distrito Capital','Falcón',
  'Guárico','Lara','Mérida','Miranda','Monagas','Nueva Esparta',
  'Portuguesa','Sucre','Táchira','Trujillo','Vargas','Yaracuy','Zulia',
];

const MODALIDADES = [
  { value: 'dias',        label: 'Por Días' },
  { value: 'semanas',     label: 'Por Semanas' },
  { value: 'meses',       label: 'Por Meses' },
  { value: 'largo_plazo', label: 'Contrato Largo Plazo (+3 meses)' },
];

const BENEFICIOS = [
  { icon: Zap,    title: 'Visibilidad Instantánea', desc: 'Tu equipo aparece en nuestra red de clientes activos buscando alquiler en Venezuela.' },
  { icon: Star,   title: 'Clientes Verificados',    desc: 'Conectamos solo con empresas y constructoras con proyectos reales y presupuesto.' },
  { icon: Hammer, title: 'Sin Intermediarios',      desc: 'Trato directo. MAKIMPORT actúa como facilitador — tú decides precio y condiciones.' },
  { icon: Wrench, title: '0% Comisión al Registro', desc: 'Registrar tu equipo es completamente gratuito. Pagamos comisión solo al cerrar.' },
];

export default function PostularEquipoPage() {
  const { userRole } = useAuth();
  const [authModalOpen, setAuthModalOpen]   = useState(false);
  const [authMode, setAuthMode]             = useState<'login' | 'register'>('login');
  const [adminPublishOpen, setAdminPublishOpen] = useState(false);

  /* ── Multi-step state ── */
  const [step, setStep] = useState(1);

  /* Step 1 — Propietario */
  const [nombrePropietario, setNombrePropietario] = useState('');
  const [telefono, setTelefono]                   = useState('');
  const [email, setEmail]                         = useState('');
  const [instagram, setInstagram]                 = useState('');
  const [estadoBase, setEstadoBase]               = useState('');
  const [ciudadBase, setCiudadBase]               = useState('');

  /* Step 2 — Equipo */
  const [categoriaEquipo, setCategoriaEquipo]     = useState('');
  const [marca, setMarca]                         = useState('');
  const [modelo, setModelo]                       = useState('');
  const [ano, setAno]                             = useState('');
  const [horasUso, setHorasUso]                   = useState('');
  const [capacidad, setCapacidad]                 = useState('');

  /* Step 3 — Términos */
  const [tarifaHora, setTarifaHora]               = useState('');
  const [tarifaDia, setTarifaDia]                 = useState('');
  const [incluyeOperador, setIncluyeOperador]     = useState('si');
  const [modalidadDisponible, setModalidadDisponible] = useState('dias');
  const [disponibleDesde, setDisponibleDesde]     = useState('');
  const [notas, setNotas]                         = useState('');

  /* UI */
  const [loading, setLoading]         = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };
  const handleOpenAdminPublish = () => {
    if (userRole !== 'admin') { handleOpenAuth('login'); return; }
    setAdminPublishOpen(true);
  };

  /* ── Validation ── */
  const validate = (s: number): string => {
    if (s === 1) {
      if (!nombrePropietario.trim()) return 'Nombre del propietario es requerido.';
      if (!telefono.trim())          return 'Número de WhatsApp es requerido.';
      if (!estadoBase)               return 'Estado de base del equipo es requerido.';
      if (!ciudadBase.trim())        return 'Ciudad de base es requerida.';
    }
    if (s === 2) {
      if (!categoriaEquipo) return 'Categoría del equipo es requerida.';
      if (!marca.trim())    return 'Marca del equipo es requerida.';
    }
    return '';
  };

  const nextStep = () => {
    const err = validate(step);
    if (err) { setErrorMsg(err); return; }
    setErrorMsg('');
    setStep(p => p + 1);
  };
  const prevStep = () => { setErrorMsg(''); setStep(p => p - 1); };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) {
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.from('owner_machinery').insert({
        nombre_propietario: nombrePropietario.trim(),
        telefono:           telefono.trim(),
        email:              email.trim() || null,
        instagram:          instagram.trim() || null,
        estado_base:        estadoBase,
        ciudad_base:        ciudadBase.trim(),
        categoria_equipo:   categoriaEquipo,
        marca:              marca.trim(),
        modelo:             modelo.trim() || null,
        ano:                ano ? Number(ano) : null,
        horas_uso:          horasUso ? Number(horasUso) : null,
        capacidad:          capacidad.trim() || null,
        tarifa_hora:        tarifaHora ? Number(tarifaHora) : null,
        tarifa_dia:         tarifaDia  ? Number(tarifaDia)  : null,
        incluye_operador:   incluyeOperador === 'si',
        modalidad_disponible: modalidadDisponible,
        disponible_desde:   disponibleDesde || null,
        notas:              notas.trim() || null,
        estado:             'disponible',
      });
      if (error) throw new Error(error.message);
      setShowSuccess(true);
      resetForm();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar el equipo. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setNombrePropietario(''); setTelefono(''); setEmail('');
    setInstagram(''); setEstadoBase(''); setCiudadBase('');
    setCategoriaEquipo(''); setMarca(''); setModelo('');
    setAno(''); setHorasUso(''); setCapacidad('');
    setTarifaHora(''); setTarifaDia(''); setIncluyeOperador('si');
    setModalidadDisponible('dias'); setDisponibleDesde(''); setNotas('');
    setErrorMsg('');
  };

  /* ── Step label helpers ── */
  const stepLabels = ['Propietario', 'Equipo', 'Términos'];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 md:pb-0">
      <Navbar onOpenAuth={handleOpenAuth} onOpenAdminPublish={handleOpenAdminPublish} />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-10 px-4 overflow-hidden">
        {/* Glow bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-orange-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <span className="inline-block px-3 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold rounded-full uppercase tracking-widest">
            Red de Propietarios · MAKIMPORT
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Registra tu Maquinaria para <br />
            <span className="text-orange-400">Alquiler en Venezuela</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Postula tu excavadora, grúa, montacargas, planta eléctrica o camión de servicio. Te conectamos con constructoras y empresas que buscan equipar proyectos activos ahora mismo.
          </p>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="px-4 pb-10 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BENEFICIOS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-orange-500/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-orange-600/15 border border-orange-500/30 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-orange-400" />
              </div>
              <p className="text-white text-xs font-bold">{title}</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form Card ── */}
      <section className="px-4 pb-16 flex-grow flex flex-col items-center max-w-3xl mx-auto w-full">

        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">

          {/* Progress header */}
          <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-5">
              {stepLabels.map((label, i) => {
                const idx = i + 1;
                const active  = step === idx;
                const done    = step > idx;
                return (
                  <React.Fragment key={label}>
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        done   ? 'bg-emerald-600 text-white' :
                        active ? 'bg-orange-500 text-white' :
                                 'bg-slate-800 text-slate-400'
                      }`}>
                        {done ? '✓' : idx}
                      </span>
                      <span className={`text-xs font-semibold hidden sm:inline transition-colors ${
                        active ? 'text-white' : done ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        {label}
                      </span>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-700 hidden sm:block" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <span className="text-xs font-bold text-orange-400 font-mono bg-orange-950/30 px-2.5 py-1 rounded-lg border border-orange-500/25">
              Paso {step} / 3
            </span>
          </div>

          <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className="p-6 sm:p-8 space-y-6 text-sm">

            {/* Error banner */}
            {errorMsg && (
              <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* ─ STEP 1 ─ Datos del Propietario ─ */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <User className="w-4 h-4 text-orange-500" />
                  <h3 className="font-bold text-white">Datos del Propietario y Ubicación del Equipo</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Nombre del Propietario / Empresa *</label>
                    <input type="text" required value={nombrePropietario}
                      onChange={e => setNombrePropietario(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                      placeholder="Ej. Juan Pérez / Maquinarias Zulia C.A." />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">WhatsApp / Teléfono *</label>
                    <input type="tel" required value={telefono}
                      onChange={e => setTelefono(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600 font-mono"
                      placeholder="+584141234567" />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Correo Electrónico (opcional)</label>
                    <input type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                      placeholder="propietario@empresa.com" />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Instagram (opcional)</label>
                    <input type="text" value={instagram}
                      onChange={e => setInstagram(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600 font-mono"
                      placeholder="@maquinariazulia" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Estado donde se ubica el equipo *</label>
                    <select value={estadoBase} onChange={e => setEstadoBase(e.target.value)} required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors">
                      <option value="">-- Selecciona Estado --</option>
                      {ESTADOS_VZ.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Ciudad / Municipio base *</label>
                    <input type="text" required value={ciudadBase}
                      onChange={e => setCiudadBase(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                      placeholder="Ej. Maracaibo" />
                  </div>
                </div>
              </div>
            )}

            {/* ─ STEP 2 ─ Datos del Equipo ─ */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Settings className="w-4 h-4 text-orange-500" />
                  <h3 className="font-bold text-white">Especificaciones Técnicas del Equipo</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Categoría del Equipo *</label>
                    <select required value={categoriaEquipo} onChange={e => setCategoriaEquipo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors">
                      <option value="">-- Selecciona categoría --</option>
                      {CATEGORIES.map(c => <option key={c.value} value={c.label}>{c.label}</option>)}
                      <option value="Camiones de Servicio/Lubricación">Camiones de Servicio / Lubricación 🚛</option>
                      <option value="Montacargas Especiales">Montacargas Especiales 🏗️</option>
                      <option value="Chutos/Gándolas">Chutos / Gándolas 🚚</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Marca *</label>
                    <select required value={marca} onChange={e => setMarca(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors">
                      <option value="">-- Selecciona marca --</option>
                      {BRANDS.map(b => <option key={b.value} value={b.label}>{b.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Modelo / Serie</label>
                    <input type="text" value={modelo} onChange={e => setModelo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                      placeholder="Ej. 320D L, PC200-8" />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Capacidad / Tonelaje</label>
                    <input type="text" value={capacidad} onChange={e => setCapacidad(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                      placeholder="Ej. 20 Ton, 500 kVA, 3 Ton" />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Año del Equipo</label>
                    <input type="number" value={ano} onChange={e => setAno(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600 font-mono"
                      placeholder="Ej. 2018" min={1980} max={2026} />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Horas de Uso Actuales</label>
                    <input type="number" value={horasUso} onChange={e => setHorasUso(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600 font-mono"
                      placeholder="Ej. 3400" />
                  </div>
                </div>
              </div>
            )}

            {/* ─ STEP 3 ─ Condiciones de Alquiler ─ */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                  <h3 className="font-bold text-white">Condiciones de Alquiler y Disponibilidad</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Tarifa por Hora ($ USD)</label>
                    <input type="number" value={tarifaHora} onChange={e => setTarifaHora(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600 font-mono"
                      placeholder="Ej. 85" />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Tarifa por Día ($ USD)</label>
                    <input type="number" value={tarifaDia} onChange={e => setTarifaDia(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600 font-mono"
                      placeholder="Ej. 680" />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-2">¿El equipo incluye Operador Calificado?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['si','no'] as const).map(opt => (
                      <label key={opt} className={`border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        incluyeOperador === opt
                          ? 'border-orange-500 bg-orange-950/20 text-orange-300 font-semibold'
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                      }`}>
                        <input type="radio" name="operador" value={opt}
                          checked={incluyeOperador === opt} onChange={() => setIncluyeOperador(opt)}
                          className="sr-only" />
                        {opt === 'si' ? 'Sí, incluye operador' : 'No (Solo máquina)'}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Modalidad de Disponibilidad</label>
                    <select value={modalidadDisponible} onChange={e => setModalidadDisponible(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors">
                      {MODALIDADES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Disponible a Partir de</label>
                    <input type="date" value={disponibleDesde} onChange={e => setDisponibleDesde(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Notas Adicionales / Condiciones Especiales</label>
                  <textarea rows={3} value={notas} onChange={e => setNotas(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600 resize-none"
                    placeholder="Ej. El equipo no incluye combustible, disponibilidad solo en Zulia y Mérida, requiere traslado previo mínimo 5 días..." />
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-[11px] text-slate-400 space-y-1">
                  <p className="font-bold text-slate-300">📋 Información importante antes de enviar:</p>
                  <p>Al registrar tu equipo aceptas ser contactado por el equipo de MAKIMPORT para validar la disponibilidad y condiciones del contrato. Tu información de contacto es confidencial y no se comparte públicamente.</p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  key="btn-next"
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-orange-950/40 transition-colors ml-auto"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  key="btn-submit"
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold rounded-xl flex items-center gap-2 shadow-lg shadow-orange-950/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed ml-auto"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Registrando...</span></>
                    : <span>✅ Registrar Mi Equipo</span>
                  }
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* ── Success Modal ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-7 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-white">¡Equipo Registrado con Éxito!</h3>
            <p className="text-sm text-slate-400">
              Tu equipo ha sido agregado a la base de datos de MAKIMPORT. El equipo revisará la información y te contactará a la brevedad cuando haya un cliente compatible con tu equipo.
            </p>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-500 font-mono">
              Mantén tu WhatsApp activo — nuestros asesores te avisarán cuando haya una solicitud de alquiler que coincida con tu maquinaria.
            </div>
            <button onClick={() => setShowSuccess(false)}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95">
              Entendido
            </button>
          </div>
        </div>
      )}

      <Footer onOpenAuth={handleOpenAuth} />

      <AuthModal isOpen={authModalOpen} initialMode={authMode} onClose={() => setAuthModalOpen(false)} />

      {userRole === 'admin' && (
        <AdminPublishModal isOpen={adminPublishOpen} onClose={() => setAdminPublishOpen(false)} onMachineryCreated={() => {}} />
      )}

      <FloatingContactButtons />
      <MobileBottomNav onSelectSubastas={() => {}} onOpenAdminPublish={handleOpenAdminPublish} />
    </main>
  );
}
