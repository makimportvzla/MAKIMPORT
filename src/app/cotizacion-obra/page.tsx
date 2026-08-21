'use client';

import React, { useState, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingContactButtons } from '@/components/FloatingContactButtons';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { supabase } from '@/lib/supabase';
import { addToOfflineQueue } from '@/lib/offlineQueue';
import { useAuth } from '@/context/AuthContext';
import {
  HardHat,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  X,
  Loader2,
  User,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Calendar,
  ClipboardList,
  Paperclip,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const PROJECT_TYPES = [
  'Movimiento de Tierras',
  'Demolición y Desmonte',
  'Excavación y Cimentación',
  'Pavimentación y Vialidad',
  'Minería y Extracción',
  'Obras Hidráulicas',
  'Construcción Industrial / Comercial',
  'Agricultura y Ganadería',
  'Sector Petrolero / Petroquímico',
  'Otro (especificar en descripción)',
];

const SCOPE_OPTIONS = [
  'Solo Maquinaria',
  'Maquinaria + Operadores',
  'Maquinaria + Operadores + Combustible',
  'Llave en mano (servicio completo)',
];

const DURATION_OPTIONS = [
  'Menos de 1 semana',
  '1 a 2 semanas',
  '1 mes',
  '2 a 3 meses',
  'Más de 3 meses (contrato a largo plazo)',
  'Por jornada / días sueltos',
];

const BUDGET_OPTIONS = [
  'Menos de $5,000 USD',
  '$5,000 – $15,000 USD',
  '$15,000 – $50,000 USD',
  '$50,000 – $200,000 USD',
  'Más de $200,000 USD',
  'Prefiero no indicar',
];

// ── COMPONENT ────────────────────────────────────────────────────────────────
export default function CotizacionObraPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [offlineSaved, setOfflineSaved] = useState(false);

  // Step 1 — Solicitante
  const [clientName, setClientName] = useState('');
  const [idDocument, setIdDocument] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 — Proyecto
  const [projectLocation, setProjectLocation] = useState('');
  const [projectType, setProjectType] = useState('');
  const [scope, setScope] = useState<string[]>([]);
  const [siteVisit, setSiteVisit] = useState(false);
  const [durationStart, setDurationStart] = useState('');
  const [startDate, setStartDate] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');

  // Step 3 — Adjuntos
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── helpers ─────────────────────────────────────────────────────────────
  const toggleScope = (val: string) => {
    setScope(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (attachmentFiles.length + files.length > 5) {
      setError('Máximo 5 archivos adjuntos permitidos.');
      return;
    }
    setError('');
    const merged = [...attachmentFiles, ...files];
    setAttachmentFiles(merged);
    setAttachmentNames(merged.map(f => f.name));
  };

  const removeAttachment = (idx: number) => {
    const newFiles = attachmentFiles.filter((_, i) => i !== idx);
    setAttachmentFiles(newFiles);
    setAttachmentNames(newFiles.map(f => f.name));
  };

  const uploadAttachments = async (): Promise<string[]> => {
    if (attachmentFiles.length === 0) return [];
    setUploadingFiles(true);
    const urls: string[] = [];
    try {
      for (const file of attachmentFiles) {
        const ext = file.name.split('.').pop() || 'pdf';
        const path = `project_attachments/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('services_documents')
          .upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('services_documents').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    } catch (e: any) {
      throw new Error('Error subiendo adjuntos: ' + e.message);
    } finally {
      setUploadingFiles(false);
    }
    return urls;
  };

  const validateStep1 = () => {
    if (!clientName.trim()) return 'Ingresa tu nombre completo o razón social.';
    if (!idDocument.trim()) return 'Ingresa tu cédula o RIF.';
    if (!phone.trim()) return 'Ingresa un número de contacto.';
    return '';
  };

  const validateStep2 = () => {
    if (!projectLocation.trim()) return 'Indica la ubicación del proyecto.';
    if (!projectType) return 'Selecciona el tipo de proyecto.';
    if (scope.length === 0) return 'Selecciona al menos un alcance del servicio.';
    if (!durationStart) return 'Indica la duración estimada del trabajo.';
    if (!description.trim()) return 'Agrega una descripción del proyecto.';
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
      if (!navigator.onLine) {
        throw new Error('OFFLINE_DETECTOR');
      }

      const attachUrls = await uploadAttachments();
      const durationAndStart = [durationStart, startDate ? `Inicio: ${startDate}` : ''].filter(Boolean).join(' — ');
      const payload = {
        client_name_or_company: clientName.trim(),
        id_document: idDocument.trim(),
        phone_contact: phone.trim(),
        project_location: projectLocation.trim(),
        project_type: projectType,
        scope,
        requires_site_visit: siteVisit,
        duration_and_start_date: durationAndStart,
        estimated_budget: budget || null,
        project_description: description.trim(),
        attachments_urls: attachUrls.length > 0 ? attachUrls : null,
        user_id: user?.id || null,
      };
      const { data, error: dbErr } = await supabase
        .from('project_quotes')
        .insert(payload)
        .select('id')
        .single();
      if (dbErr) {
        if (dbErr.message === 'Failed to fetch') {
          throw new Error('OFFLINE_DETECTOR');
        }
        throw dbErr;
      }
      setSuccessId(data?.id?.substring(0, 8).toUpperCase() || 'OK');
    } catch (e: any) {
      if (e.message === 'OFFLINE_DETECTOR' || !navigator.onLine) {
        const durationAndStart = [durationStart, startDate ? `Inicio: ${startDate}` : ''].filter(Boolean).join(' — ');
        const payload = {
          client_name_or_company: clientName.trim(),
          id_document: idDocument.trim(),
          phone_contact: phone.trim(),
          project_location: projectLocation.trim(),
          project_type: projectType,
          scope,
          requires_site_visit: siteVisit,
          duration_and_start_date: durationAndStart,
          estimated_budget: budget || null,
          project_description: description.trim(),
          attachments_urls: null, // offline
          user_id: user?.id || null,
        };
        addToOfflineQueue('cotizacion', 'project_quotes', payload);
        setOfflineSaved(true);
        setSuccessId('OFFLINE_SYNC');
      } else {
        setError(e.message || 'Error al enviar. Intenta de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (successId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar onOpenAuth={() => {}} onOpenAdminPublish={() => {}} />
        <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
          <div className={`max-w-lg w-full bg-slate-900 border ${offlineSaved ? 'border-amber-500/30' : 'border-emerald-500/30'} rounded-3xl p-8 text-center space-y-5 shadow-2xl`}>
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-white">
              {offlineSaved ? '¡Cotización Guardada!' : '¡Solicitud Recibida!'}
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {offlineSaved ? (
                <span className="text-amber-400 font-bold">
                  Sin conexión. Tu solicitud de cotización se guardó localmente en este dispositivo y se enviará automáticamente cuando recuperes la conexión a internet.
                </span>
              ) : (
                <>
                  Tu solicitud de cotización para el proyecto <strong className="text-white">"{projectType}"</strong> fue registrada correctamente. Nuestro equipo comercial la revisará y te contactará vía WhatsApp en un plazo de 24 horas hábiles.
                </>
              )}
            </p>
            {offlineSaved ? (
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs text-slate-500">
                La sincronización se realizará en segundo plano de manera automática al detectar red.
              </div>
            ) : (
              <>
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">N° de Referencia</p>
                  <p className="text-2xl font-black font-mono text-orange-400 mt-1"># {successId}</p>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>Guarda este número para hacer seguimiento de tu cotización.</p>
                  <a
                    href={`https://wa.me/584146370819?text=${encodeURIComponent(`Hola MAKIMPORT, solicité una cotización de obra con N° de referencia #${successId}. Quisiera hacer seguimiento.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-400 font-bold hover:underline mt-1"
                  >
                    Consultar por WhatsApp →
                  </a>
                </div>
              </>
            )}
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
            <span className="text-slate-300">Cotizar Obra o Proyecto</span>
          </div>
          <h1 className="text-3xl font-black text-white">Cotiza tu Proyecto</h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Recibe una cotización formal de maquinaria pesada con operadores para tu obra. Movimiento de tierras, demolición, minería, pavimentación y más.
          </p>
        </div>

        {/* Stepper */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            {['Datos del Solicitante', 'Detalle del Proyecto', 'Adjuntos y Envío'].map((label, i) => (
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
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-orange-400" />
                Datos del Solicitante
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Nombre Completo o Razón Social
                </label>
                <input
                  type="text"
                  placeholder="Ej: Constructora Los Andes C.A."
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Cédula / RIF
                  </label>
                  <input
                    type="text"
                    placeholder="V-12345678 / J-12345678-9"
                    value={idDocument}
                    onChange={e => setIdDocument(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+58 414-1234567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                  />
                </div>
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

            {/* Location & Type */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <HardHat className="w-4 h-4 text-orange-400" />
                Información del Proyecto
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Ubicación de la Obra
                </label>
                <input
                  type="text"
                  placeholder="Ej: Caracas, Miranda — Autopista Regional del Centro"
                  value={projectLocation}
                  onChange={e => setProjectLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Tipo de Proyecto / Trabajo</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PROJECT_TYPES.map(pt => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setProjectType(pt)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        projectType === pt
                          ? 'border-orange-500 bg-orange-950/40 text-orange-400 ring-2 ring-orange-500/20'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scope */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-orange-400" />
                Alcance del Servicio
                <span className="text-xs text-slate-500 font-normal">(Selecciona todos los que apliquen)</span>
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {SCOPE_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleScope(opt)}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold text-left flex items-center gap-3 transition-all ${
                      scope.includes(opt)
                        ? 'border-orange-500 bg-orange-950/40 text-orange-400 ring-2 ring-orange-500/20'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      scope.includes(opt) ? 'border-orange-500 bg-orange-500' : 'border-slate-600'
                    }`}>
                      {scope.includes(opt) && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              {/* Site Visit */}
              <button
                type="button"
                onClick={() => setSiteVisit(!siteVisit)}
                className={`w-full py-3 px-4 rounded-xl border text-xs font-bold text-left flex items-center gap-3 transition-all ${
                  siteVisit
                    ? 'border-sky-500 bg-sky-950/30 text-sky-400 ring-2 ring-sky-500/20'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  siteVisit ? 'border-sky-500 bg-sky-500' : 'border-slate-600'
                }`}>
                  {siteVisit && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                </span>
                <div>
                  <span className="block">Requiero visita técnica al sitio</span>
                  <span className="text-[10px] text-slate-500 font-normal">Un técnico de MAKIMPORT visitará la obra para evaluar el acceso y requisitos</span>
                </div>
              </button>
            </div>

            {/* Duration & Budget */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                Duración y Presupuesto
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Duración Estimada del Trabajo</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DURATION_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDurationStart(opt)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        durationStart === opt
                          ? 'border-orange-500 bg-orange-950/40 text-orange-400 ring-2 ring-orange-500/20'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Fecha de Inicio Estimada (Opcional)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  Presupuesto Estimado (Opcional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BUDGET_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setBudget(opt)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        budget === opt
                          ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400 ring-2 ring-emerald-500/20'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Descripción del Proyecto</label>
                <textarea
                  rows={5}
                  placeholder="Describe los trabajos a realizar, el tipo de terreno, volumetría estimada, condiciones de acceso, y cualquier detalle relevante para preparar la cotización..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors resize-none"
                />
                <p className="text-[10px] text-slate-500">{description.length} caracteres</p>
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

            {/* Attachments */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-orange-400" />
                Adjuntar Planos o Documentos
                <span className="text-xs text-slate-500 font-normal">(Opcional, máx. 5)</span>
              </h2>

              {attachmentNames.length > 0 && (
                <div className="space-y-2">
                  {attachmentNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                      <Paperclip className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-xs text-slate-300 flex-1 truncate">{name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {attachmentFiles.length < 5 && (
                <label className="flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-700 hover:border-orange-500/60 rounded-2xl text-slate-400 hover:text-orange-400 cursor-pointer transition-colors bg-slate-950/40">
                  <Upload className="w-7 h-7" />
                  <span className="text-xs font-bold">Adjuntar planos, especificaciones o documentos</span>
                  <span className="text-[10px] text-slate-500">PDF, DWG, JPEG, PNG — máx. 20MB por archivo</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.dwg,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                    onChange={handleAttachmentSelect}
                  />
                </label>
              )}
            </div>

            {/* Summary */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-base font-extrabold text-white">Resumen de la Solicitud</h2>
              <div className="space-y-2 text-xs text-slate-300">
                {[
                  ['Solicitante', clientName],
                  ['Cédula / RIF', idDocument],
                  ['Teléfono', phone],
                  ['Ubicación', projectLocation],
                  ['Tipo de Proyecto', projectType],
                  ['Alcance', scope.join(', ')],
                  ['Duración', durationStart],
                  ['Visita Técnica', siteVisit ? 'Sí, requerida' : 'No'],
                  ['Presupuesto', budget || 'No indicado'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between border-b border-slate-800/70 pb-1.5">
                    <span className="text-slate-500 shrink-0">{label}</span>
                    <span className="font-bold text-right max-w-[60%]">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Al enviar esta solicitud, autorizas a MAKIMPORT a contactarte por teléfono/WhatsApp para preparar la cotización formal de maquinaria y operadores para tu obra.
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
                disabled={submitting || uploadingFiles}
                className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-950/30"
              >
                {submitting || uploadingFiles ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Enviar Solicitud</>
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
