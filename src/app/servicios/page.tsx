'use client';

import React, { useState, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingContactButtons } from '@/components/FloatingContactButtons';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Wrench,
  Truck,
  Droplets,
  Paintbrush2,
  Package,
  HardHat,
  Container,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  X,
  Loader2,
  User,
  Building2,
  MapPin,
  Clock,
  Image as ImageIcon,
  FileText,
  Star,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

// ── SERVICE CATEGORIES ──────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
  {
    id: 'mecanico',
    label: 'Mecánico / Taller',
    description: 'Reparación, mantenimiento y diagnóstico de maquinaria pesada',
    icon: Wrench,
    color: 'orange',
  },
  {
    id: 'camion_servicio',
    label: 'Camión de Servicio / Grúa',
    description: 'Asistencia en campo y remolque de equipos averiados',
    icon: Truck,
    color: 'amber',
  },
  {
    id: 'lavado',
    label: 'Lavado Industrial',
    description: 'Limpieza y descontaminación de equipos y maquinaria',
    icon: Droplets,
    color: 'sky',
  },
  {
    id: 'restauracion',
    label: 'Restauración y Pintura',
    description: 'Arenado, galvanizado, anticorrosivos y pintura industrial',
    icon: Paintbrush2,
    color: 'purple',
  },
  {
    id: 'repuestos',
    label: 'Proveedor de Repuestos',
    description: 'Venta de piezas, filtros y componentes para maquinaria',
    icon: Package,
    color: 'emerald',
  },
  {
    id: 'operador',
    label: 'Operador Certificado',
    description: 'Operación profesional de excavadoras, grúas y equipos pesados',
    icon: HardHat,
    color: 'yellow',
  },
  {
    id: 'transporte',
    label: 'Transporte y Logística',
    description: 'Traslado de maquinaria en cama baja y plataformas especiales',
    icon: Container,
    color: 'blue',
  },
];

const COVERAGE_OPTIONS = ['Local (mismo municipio)', 'Regional (mismo estado)', 'Nacional (todo el país)'];

const SCHEDULE_OPTIONS = [
  'Lunes a Viernes (horario comercial)',
  'Lunes a Sábado',
  'Todos los días',
  'Disponibilidad 24/7 (emergencias)',
  'Por cita previa únicamente',
];

const COLOR_MAP: Record<string, string> = {
  orange: 'border-orange-500/40 bg-orange-950/20 text-orange-400',
  amber:  'border-amber-500/40 bg-amber-950/20 text-amber-400',
  sky:    'border-sky-500/40 bg-sky-950/20 text-sky-400',
  purple: 'border-purple-500/40 bg-purple-950/20 text-purple-400',
  emerald:'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
  yellow: 'border-yellow-500/40 bg-yellow-950/20 text-yellow-400',
  blue:   'border-blue-500/40 bg-blue-950/20 text-blue-400',
};

const COLOR_ACTIVE: Record<string, string> = {
  orange: 'border-orange-500 bg-orange-950/50 ring-2 ring-orange-500/30',
  amber:  'border-amber-500 bg-amber-950/50 ring-2 ring-amber-500/30',
  sky:    'border-sky-500 bg-sky-950/50 ring-2 ring-sky-500/30',
  purple: 'border-purple-500 bg-purple-950/50 ring-2 ring-purple-500/30',
  emerald:'border-emerald-500 bg-emerald-950/50 ring-2 ring-emerald-500/30',
  yellow: 'border-yellow-500 bg-yellow-950/50 ring-2 ring-yellow-500/30',
  blue:   'border-blue-500 bg-blue-950/50 ring-2 ring-blue-500/30',
};

// ── COMPONENT ────────────────────────────────────────────────────────────────
export default function ServiciosPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Step 1
  const [categoryId, setCategoryId] = useState('');
  const [applicantType, setApplicantType] = useState<'personal' | 'company'>('personal');
  const [fullName, setFullName] = useState('');
  const [idDocNumber, setIdDocNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [idDocFile, setIdDocFile] = useState<File | null>(null);
  const [idDocUrl, setIdDocUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Step 2
  const [stateCity, setStateCity] = useState('');
  const [coverage, setCoverage] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [schedule, setSchedule] = useState('');

  // Step 3
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [portfolioPreview, setPortfolioPreview] = useState<string[]>([]);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  const [error, setError] = useState('');
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  // ── helpers ─────────────────────────────────────────────────────────────
  const selectedCategory = SERVICE_CATEGORIES.find(c => c.id === categoryId);

  const handleDocUpload = async (file: File) => {
    setUploadingDoc(true);
    setError('');
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `id_documents/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('services_documents')
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('services_documents').getPublicUrl(path);
      setIdDocUrl(data.publicUrl);
    } catch (e: any) {
      setError('Error subiendo documento: ' + e.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handlePortfolioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (portfolioFiles.length + files.length > 6) {
      setError('Máximo 6 fotos de portafolio permitidas.');
      return;
    }
    setError('');
    const newFiles = [...portfolioFiles, ...files];
    setPortfolioFiles(newFiles);
    const previews = newFiles.map(f => URL.createObjectURL(f));
    setPortfolioPreview(previews);
  };

  const removePortfolioPhoto = (idx: number) => {
    const newFiles = portfolioFiles.filter((_, i) => i !== idx);
    const newPreviews = portfolioPreview.filter((_, i) => i !== idx);
    setPortfolioFiles(newFiles);
    setPortfolioPreview(newPreviews);
  };

  const uploadPortfolio = async (): Promise<string[]> => {
    if (portfolioFiles.length === 0) return [];
    setUploadingPortfolio(true);
    const urls: string[] = [];
    try {
      for (const file of portfolioFiles) {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `portfolio/${categoryId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('machinery-photos')
          .upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('machinery-photos').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    } catch (e: any) {
      throw new Error('Error subiendo portafolio: ' + e.message);
    } finally {
      setUploadingPortfolio(false);
    }
    return urls;
  };

  const validateStep1 = () => {
    if (!categoryId) return 'Selecciona una categoría de servicio.';
    if (!fullName.trim()) return 'Ingresa tu nombre completo o razón social.';
    if (!idDocNumber.trim()) return 'Ingresa tu cédula o RIF.';
    if (!phone.trim()) return 'Ingresa tu número de teléfono / WhatsApp.';
    return '';
  };

  const validateStep2 = () => {
    if (!stateCity.trim()) return 'Indica tu estado y ciudad de operación.';
    if (!coverage) return 'Selecciona tu radio de cobertura.';
    if (!specialization.trim()) return 'Describe tu especialización.';
    if (!schedule) return 'Selecciona tu horario de trabajo.';
    return '';
  };

  const handleStep1Next = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Next = () => {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const uploadedUrls = await uploadPortfolio();
      const payload = {
        category_id: categoryId,
        applicant_type: applicantType,
        full_name_or_company: fullName.trim(),
        id_document_number: idDocNumber.trim(),
        id_document_url: idDocUrl || null,
        state_city: stateCity.trim(),
        coverage_radius: coverage,
        specialization_details: specialization.trim(),
        work_schedule: schedule,
        portfolio_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
        phone_contact: phone.trim(),
        user_id: user?.id || null,
      };
      const { data, error: dbErr } = await supabase
        .from('services_applications')
        .insert(payload)
        .select('id')
        .single();
      if (dbErr) throw dbErr;
      setPortfolioUrls(uploadedUrls);
      setSuccessId(data?.id?.substring(0, 8).toUpperCase() || 'OK');
    } catch (e: any) {
      setError(e.message || 'Error al enviar. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── SUCCESS MODAL ────────────────────────────────────────────────────────
  if (successId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar onOpenAuth={() => {}} onOpenAdminPublish={() => {}} />
        <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
          <div className="max-w-lg w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-white">¡Postulación Enviada!</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Tu postulación como <strong className="text-white">{selectedCategory?.label}</strong> fue registrada exitosamente. Nuestro equipo la revisará y se comunicará contigo en las próximas 48 horas hábiles.
            </p>
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">N° de Referencia</p>
              <p className="text-2xl font-black font-mono text-orange-400 mt-1"># {successId}</p>
            </div>
            <p className="text-xs text-slate-500">
              Puedes guardar este número como referencia para consultas vía{' '}
              <a href="https://wa.me/584146370819" target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline">
                WhatsApp
              </a>.
            </p>
            <Link
              href="/"
              className="inline-block mt-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-xl text-sm transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
        <Footer onOpenAuth={() => {}} />
      </main>
    );
  }

  // ── MAIN FORM ────────────────────────────────────────────────────────────
  const progressPct = ((step - 1) / 2) * 100;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenAuth={() => {}} onOpenAdminPublish={() => {}} />
      <FloatingContactButtons />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 pt-28 pb-24 space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <Link href="/" className="hover:text-orange-400 transition-colors">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300">Postular como Proveedor</span>
          </div>
          <h1 className="text-3xl font-black text-white">Postula tu Servicio</h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Conecta tu taller, equipo o servicio con constructoras, empresas mineras y propietarios de maquinaria en Venezuela.
          </p>
        </div>

        {/* Stepper */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            {['Identidad y Servicio', 'Operación', 'Portafolio'].map((label, i) => (
              <span key={i} className={i + 1 === step ? 'text-orange-400' : i + 1 < step ? 'text-emerald-400' : ''}>
                {i + 1 < step ? '✓ ' : ''}{label}
              </span>
            ))}
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 text-right">Paso {step} de 3</p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-300 font-bold flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ─── STEP 1 ─────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">

            {/* Category Selection */}
            <div className="space-y-3">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-400" />
                ¿Cuál es tu servicio?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICE_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isActive = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3 ${
                        isActive ? COLOR_ACTIVE[cat.color] : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${COLOR_MAP[cat.color]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-white">{cat.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{cat.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Applicant Type */}
            <div className="space-y-3">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-orange-400" />
                Tipo de postulante
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {([['personal', 'Persona Natural', User], ['company', 'Empresa / Jurídica', Building2]] as const).map(([val, label, Icon]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setApplicantType(val)}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                      applicantType === val
                        ? 'border-orange-500 bg-orange-950/40 ring-2 ring-orange-500/20 text-orange-400'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-extrabold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Identity Fields */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" />
                Datos de Identidad
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  {applicantType === 'company' ? 'Razón Social / Nombre de Empresa' : 'Nombre Completo'}
                </label>
                <input
                  type="text"
                  placeholder={applicantType === 'company' ? 'Ej: Servicios Industriales C.A.' : 'Ej: Juan Carlos Pérez'}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  {applicantType === 'company' ? 'RIF' : 'Cédula de Identidad'}
                </label>
                <input
                  type="text"
                  placeholder={applicantType === 'company' ? 'J-12345678-9' : 'V-12345678'}
                  value={idDocNumber}
                  onChange={e => setIdDocNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="Ej: +58 414-1234567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                />
              </div>

              {/* ID Document Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Foto del Documento (Opcional)
                </label>
                <div className="flex items-center gap-3">
                  {idDocUrl ? (
                    <div className="flex items-center gap-2 flex-1 p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs text-emerald-400 font-bold">Documento subido</span>
                      <button
                        type="button"
                        onClick={() => { setIdDocUrl(''); setIdDocFile(null); }}
                        className="ml-auto text-slate-400 hover:text-red-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-dashed border-slate-700 hover:border-orange-500/60 rounded-xl text-slate-400 hover:text-orange-400 text-xs font-bold cursor-pointer transition-colors bg-slate-950/60">
                      {uploadingDoc ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</>
                      ) : (
                        <><Upload className="w-4 h-4" /> Subir foto del documento</>
                      )}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        disabled={uploadingDoc}
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) { setIdDocFile(f); handleDocUpload(f); }
                        }}
                      />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Acepta imagen o PDF. Máximo 5MB.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStep1Next}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-950/30"
            >
              Continuar
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── STEP 2 ─────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                Área de Operación
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Estado y Ciudad</label>
                <input
                  type="text"
                  placeholder="Ej: Miranda, Caracas"
                  value={stateCity}
                  onChange={e => setStateCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Radio de Cobertura</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {COVERAGE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCoverage(opt)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        coverage === opt
                          ? 'border-orange-500 bg-orange-950/40 text-orange-400 ring-2 ring-orange-500/20'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-400" />
                Especialización y Horario
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Describe tu Especialización</label>
                <textarea
                  rows={4}
                  placeholder={`Ej: Especialista en reparación de motores Cummins y Caterpillar. Experiencia de 15 años en mantenimiento de excavadoras y motoniveladoras para obras viales...`}
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors resize-none"
                />
                <p className="text-[10px] text-slate-500">{specialization.length}/500 caracteres</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Horario de Trabajo
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {SCHEDULE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSchedule(opt)}
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                        schedule === opt
                          ? 'border-orange-500 bg-orange-950/40 text-orange-400 ring-2 ring-orange-500/20'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                        schedule === opt ? 'border-orange-500 bg-orange-500' : 'border-slate-600'
                      }`} />
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setError(''); setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                type="button"
                onClick={handleStep2Next}
                className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-950/30"
              >
                Continuar
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3 ─────────────────────────────────────────────────────── */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Portfolio Upload */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-orange-400" />
                Fotos de Trabajos Anteriores
                <span className="text-xs text-slate-500 font-normal">(Opcional, máx. 6)</span>
              </h2>

              {/* Thumbnails */}
              {portfolioPreview.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {portfolioPreview.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePortfolioPhoto(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center shadow"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {portfolioFiles.length < 6 && (
                <label className="flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-700 hover:border-orange-500/60 rounded-2xl text-slate-400 hover:text-orange-400 cursor-pointer transition-colors bg-slate-950/40">
                  <Upload className="w-7 h-7" />
                  <span className="text-xs font-bold">Agregar fotos de trabajos</span>
                  <span className="text-[10px] text-slate-500">JPEG, PNG — máx. 10MB por imagen</span>
                  <input
                    ref={portfolioInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePortfolioSelect}
                  />
                </label>
              )}
            </div>

            {/* Summary */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-base font-extrabold text-white">Resumen de tu Postulación</h2>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">Servicio</span>
                  <span className="font-bold text-orange-400">{selectedCategory?.label}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">Tipo</span>
                  <span className="font-bold">{applicantType === 'personal' ? 'Persona Natural' : 'Empresa'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">Nombre / Razón Social</span>
                  <span className="font-bold truncate max-w-[55%] text-right">{fullName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">Cédula / RIF</span>
                  <span className="font-bold font-mono">{idDocNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">Ubicación</span>
                  <span className="font-bold">{stateCity}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">Cobertura</span>
                  <span className="font-bold">{coverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Horario</span>
                  <span className="font-bold text-right max-w-[60%]">{schedule}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Al enviar esta postulación, autorizas a MAKIMPORT a contactarte para verificar tu información y publicar tu perfil en la plataforma de proveedores de servicios.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setError(''); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingPortfolio}
                className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-950/30"
              >
                {submitting || uploadingPortfolio ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Enviar Postulación</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer onOpenAuth={() => {}} />
      <MobileBottomNav onSelectSubastas={() => {}} onOpenAdminPublish={() => {}} />
    </main>
  );
}
