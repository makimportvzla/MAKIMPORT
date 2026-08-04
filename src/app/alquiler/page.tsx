'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { AdminPublishModal } from '@/components/AdminPublishModal';
import { FloatingContactButtons } from '@/components/FloatingContactButtons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CATEGORIES } from '@/constants/machineryOptions';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Settings, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const INDUSTRIAS = [
  'Construcción',
  'Agricultura',
  'Sector Petrolero / Industrial',
  'Minería',
  'Logística / Transporte'
];

const DURACIONES = [
  { value: 'Por Días', label: 'Por Días' },
  { value: '1 Semana', label: '1 Semana' },
  { value: '1 Mes', label: '1 Mes' },
  { value: 'Contrato a Largo Plazo (+3 Meses)', label: 'Contrato a Largo Plazo (+3 Meses)' }
];

export default function AlquilerPage() {
  const { userRole } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [adminPublishOpen, setAdminPublishOpen] = useState(false);

  // Form Steps: 1, 2, 3
  const [step, setStep] = useState(1);

  // Form Fields
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState('');
  const [ciudad, setCiudad] = useState('');

  const [industria, setIndustria] = useState('Construcción');
  const [categoriaEquipo, setCategoriaEquipo] = useState('');
  const [marcaPreferida, setMarcaPreferida] = useState('');
  const [modeloEspecificacion, setModeloEspecificacion] = useState('');
  const [anoDeseado, setAnoDeseado] = useState('');
  const [horasMaximas, setHorasMaximas] = useState('');

  const [duracionEstimada, setDuracionEstimada] = useState('Por Días');
  const [incluyeOperador, setIncluyeOperador] = useState('si'); // 'si' | 'no'
  const [modalidadGastos, setModalidadGastos] = useState('basic'); // 'basic' | 'all_inclusive'
  const [presupuestoEstimado, setPresupuestoEstimado] = useState('');
  const [notasAdicionales, setNotasAdicionales] = useState('');

  // Submit and UI status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenAdminPublish = () => {
    if (userRole !== 'admin') {
      handleOpenAuth('login');
      return;
    }
    setAdminPublishOpen(true);
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!nombreCompleto.trim()) return 'Nombre y Apellido es requerido.';
      if (!telefono.trim()) return 'Teléfono de contacto es requerido.';
      if (!email.trim()) return 'Correo electrónico es requerido.';
      if (!estado.trim()) return 'Estado de ubicación es requerido.';
      if (!ciudad.trim()) return 'Ciudad de ubicación es requerido.';
    } else if (currentStep === 2) {
      if (!categoriaEquipo) return 'Debe seleccionar una categoría de maquinaria.';
    }
    return '';
  };

  const handleNextStep = () => {
    const error = validateStep(step);
    if (error) {
      setErrorMsg(error);
      return;
    }
    setErrorMsg('');
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) {
      return;
    }
    const error = validateStep(3);
    if (error) {
      setErrorMsg(error);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error: insertError } = await supabase
        .from('rental_requests')
        .insert({
          nombre_completo: nombreCompleto.trim(),
          telefono: telefono.trim(),
          email: email.trim(),
          estado: estado.trim(),
          ciudad: ciudad.trim(),
          industria,
          categoria_equipo: categoriaEquipo,
          marca_preferida: marcaPreferida.trim() || null,
          modelo_especificacion: modeloEspecificacion.trim() || null,
          ano_deseado: anoDeseado ? Number(anoDeseado) : null,
          horas_maximas: horasMaximas ? Number(horasMaximas) : null,
          duracion_estimada: duracionEstimada,
          incluye_operador: incluyeOperador === 'si',
          modalidad_gastos: modalidadGastos === 'basic' 
            ? 'Tarifa Básica ($/hr) — El Cliente asume Combustible/Gasoil, Grasa y Servicios Diarios' 
            : 'Tarifa Todo Incluido ($/hr) — El Proveedor asume Combustible, Mantenimiento, Grasa y Logística',
          presupuesto_estimado: presupuestoEstimado ? Number(presupuestoEstimado) : null,
          notas_adicionales: notasAdicionales.trim() || null,
          estado_solicitud: 'pendiente'
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setShowSuccessModal(true);
      resetForm();
    } catch (err: any) {
      console.error('Error insertando solicitud de alquiler:', err);
      setErrorMsg(err.message || 'Error al procesar la solicitud de alquiler. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setNombreCompleto('');
    setTelefono('');
    setEmail('');
    setEstado('');
    setCiudad('');
    setIndustria('Construcción');
    setCategoriaEquipo('');
    setMarcaPreferida('');
    setModeloEspecificacion('');
    setAnoDeseado('');
    setHorasMaximas('');
    setDuracionEstimada('Por Días');
    setIncluyeOperador('si');
    setModalidadGastos('basic');
    setPresupuestoEstimado('');
    setNotasAdicionales('');
    setErrorMsg('');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 md:pb-0">
      
      {/* Navbar */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenAdminPublish={handleOpenAdminPublish}
      />

      {/* Main Content Area */}
      <div className="pt-28 pb-16 flex-grow flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full">
        
        {/* Header Block */}
        <div className="text-center space-y-3 mb-10 w-full">
          <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold rounded-full uppercase tracking-widest">
            Alquiler de Maquinaria Pesada
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Solicita y Licita Tu Próximo Equipo
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Completa los detalles de tu obra o requerimiento. En MAKIMPORT gestionamos y licitamos tu solicitud con nuestra red de proveedores certificados para conseguirte la mejor tarifa.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
          
          {/* Progress Indicator */}
          <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 1 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  1
                </span>
                <span className={`text-xs font-semibold ${step === 1 ? 'text-white' : 'text-slate-500'} hidden sm:inline`}>
                  Contacto y Ubicación
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 2 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  2
                </span>
                <span className={`text-xs font-semibold ${step === 2 ? 'text-white' : 'text-slate-500'} hidden sm:inline`}>
                  Maquinaria e Industria
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 3 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  3
                </span>
                <span className={`text-xs font-semibold ${step === 3 ? 'text-white' : 'text-slate-500'} hidden sm:inline`}>
                  Condiciones del Alquiler
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-orange-400 font-mono bg-orange-950/30 px-2.5 py-1 rounded-lg border border-orange-500/25">
              Paso {step} de 3
            </span>
          </div>

          <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className="p-6 sm:p-8 space-y-6 text-sm">
            
            {errorMsg && (
              <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 flex items-start gap-2.5 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Datos de Contacto y Ubicación */}
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <User className="w-4 h-4 text-orange-500" />
                  <h3 className="font-bold text-white">Datos de Contacto y Ubicación de Obra</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Nombre y Apellido *</label>
                    <input
                      type="text"
                      required
                      value={nombreCompleto}
                      onChange={(e) => setNombreCompleto(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">WhatsApp / Teléfono *</label>
                    <input
                      type="tel"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600 font-mono"
                      placeholder="Ej. +584141234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                    placeholder="Ej. juan.perez@empresa.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Estado de Ejecución *</label>
                    <input
                      type="text"
                      required
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                      placeholder="Ej. Carabobo"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Ciudad / Municipio de Ejecución *</label>
                    <input
                      type="text"
                      required
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                      placeholder="Ej. Valencia"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Tipo de Industria y Maquinaria */}
            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Building2 className="w-4 h-4 text-orange-500" />
                  <h3 className="font-bold text-white">Especificaciones del Equipo e Industria</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Sector de Industria *</label>
                    <select
                      value={industria}
                      onChange={(e) => setIndustria(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      {INDUSTRIAS.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Categoría del Equipo *</label>
                    <select
                      required
                      value={categoriaEquipo}
                      onChange={(e) => setCategoriaEquipo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="">-- Seleccione una categoría --</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.label}>{cat.label}</option>
                      ))}
                      <option value="Camiones de Servicio/Lubricación">Camiones de Servicio / Lubricación 🚛</option>
                      <option value="Montacargas Especiales">Montacargas Especiales 🏗️</option>
                      <option value="Chutos/Gándolas">Chutos / Gándolas 🚚</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Marca Preferida (Opcional)</label>
                    <input
                      type="text"
                      value={marcaPreferida}
                      onChange={(e) => setMarcaPreferida(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                      placeholder="Ej. Caterpillar, Komatsu"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Modelo / Capacidad Exacta</label>
                    <input
                      type="text"
                      value={modeloEspecificacion}
                      onChange={(e) => setModeloEspecificacion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                      placeholder="Ej. 320D L, 20 Toneladas"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Rango de Año Requerido (Opcional)</label>
                    <input
                      type="number"
                      value={anoDeseado}
                      onChange={(e) => setAnoDeseado(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600 font-mono"
                      placeholder="Ej. 2018"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Máximo Uso Aceptable (Hrs / Km)</label>
                    <input
                      type="number"
                      value={horasMaximas}
                      onChange={(e) => setHorasMaximas(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600 font-mono"
                      placeholder="Ej. 5000"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Condiciones del Contrato de Alquiler */}
            {step === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <h3 className="font-bold text-white">Condiciones del Contrato de Alquiler</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1.5">Duración Estimada del Contrato *</label>
                    <select
                      value={duracionEstimada}
                      onChange={(e) => setDuracionEstimada(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      {DURACIONES.map((dur) => (
                        <option key={dur.value} value={dur.value}>{dur.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1.5">¿Requiere Operador? *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        incluyeOperador === 'si' 
                          ? 'border-orange-500 bg-orange-950/20 text-orange-400 font-semibold' 
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="operador"
                          value="si"
                          checked={incluyeOperador === 'si'}
                          onChange={() => setIncluyeOperador('si')}
                          className="sr-only"
                        />
                        <span>Sí (Con Operador)</span>
                      </label>

                      <label className={`border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        incluyeOperador === 'no' 
                          ? 'border-orange-500 bg-orange-950/20 text-orange-400 font-semibold' 
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="operador"
                          value="no"
                          checked={incluyeOperador === 'no'}
                          onChange={() => setIncluyeOperador('no')}
                          className="sr-only"
                        />
                        <span>No (Solo Máquina)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-slate-300">Modalidad de Gastos Operativos e Insumos *</label>
                  
                  <div className="space-y-3">
                    <label className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-all ${
                      modalidadGastos === 'basic' 
                        ? 'border-orange-500 bg-orange-950/10 text-white' 
                        : 'border-slate-855 bg-slate-950 hover:bg-slate-900 text-slate-400'
                    }`}>
                      <input
                        type="radio"
                        name="modalidadGastos"
                        value="basic"
                        checked={modalidadGastos === 'basic'}
                        onChange={() => setModalidadGastos('basic')}
                        className="mt-1 accent-orange-500"
                      />
                      <div>
                        <span className="font-bold text-slate-200 block text-xs">Tarifa Básica ($/hora)</span>
                        <span className="text-slate-400 text-xs block mt-0.5">El Cliente asume el costo de Combustible / Gasoil, Grasa, Logística y Servicios Diarios mínimos de mantenimiento.</span>
                      </div>
                    </label>

                    <label className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-all ${
                      modalidadGastos === 'all_inclusive' 
                        ? 'border-orange-500 bg-orange-950/10 text-white' 
                        : 'border-slate-855 bg-slate-950 hover:bg-slate-900 text-slate-400'
                    }`}>
                      <input
                        type="radio"
                        name="modalidadGastos"
                        value="all_inclusive"
                        checked={modalidadGastos === 'all_inclusive'}
                        onChange={() => setModalidadGastos('all_inclusive')}
                        className="mt-1 accent-orange-500"
                      />
                      <div>
                        <span className="font-bold text-slate-200 block text-xs">Tarifa Todo Incluido ($/hora)</span>
                        <span className="text-slate-400 text-xs block mt-0.5">El Proveedor asume el costo de Combustible, Mantenimiento preventivo, Repuestos, Lubricación y Logística de transporte inicial/final.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                      <span>Presupuesto Estimado ($ USD/hora)</span>
                    </label>
                    <input
                      type="number"
                      value={presupuestoEstimado}
                      onChange={(e) => setPresupuestoEstimado(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600 font-mono"
                      placeholder="Ej. 75"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Notas y Especificaciones Adicionales</label>
                  <textarea
                    rows={4}
                    value={notasAdicionales}
                    onChange={(e) => setNotasAdicionales(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                    placeholder="Escriba aquí si requiere accesorios especiales, tipo de terreno, tipo de material a excavar o condiciones específicas del operador..."
                  />
                </div>
              </div>
            )}

            {/* Form Footer Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-3 bg-slate-850 hover:bg-slate-750 text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  key="btn-next"
                  type="button"
                  onClick={handleNextStep}
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
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>Enviar Solicitud de Alquiler</span>
                  )}
                </button>
              )}
            </div>

          </form>

        </div>

      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative">
            <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-emerald-950">
              <CheckCircle className="w-10 h-10" />
            </div>
            
            <h3 className="text-xl font-extrabold text-white">Solicitud Recibida Exitosamente</h3>
            
            <p className="text-sm text-slate-400">
              Tu solicitud de alquiler ha sido registrada en el sistema de MAKIMPORT Venezuela. Nuestro equipo evaluará los requerimientos y licitará el equipo con nuestra red de proveedores certificados para brindarte la mejor cotización.
            </p>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-500 font-mono text-center">
              Un asesor de MAKIMPORT se pondrá en contacto contigo a la brevedad vía WhatsApp o Correo Electrónico.
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer onOpenAuth={handleOpenAuth} />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />

      {userRole === 'admin' && (
        <AdminPublishModal
          isOpen={adminPublishOpen}
          onClose={() => setAdminPublishOpen(false)}
          onMachineryCreated={() => {}}
        />
      )}

      {/* Floating Contact Buttons */}
      <FloatingContactButtons />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        onSelectSubastas={() => {}}
        onOpenAdminPublish={handleOpenAdminPublish}
      />

    </main>
  );
}
