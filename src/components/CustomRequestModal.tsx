'use client';

import React, { useState } from 'react';
import {
  X, Search, Send, MessageCircle, CheckCircle2, AlertCircle, Loader2,
  MapPin, DollarSign, Calendar, Tag, Wrench, User, Phone, Mail,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BRANDS } from '@/constants/machineryOptions';

interface CustomRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WHATSAPP_NUMBER = '584120125567';
const TELEGRAM_USER  = 'makimportvzla';

export const CustomRequestModal: React.FC<CustomRequestModalProps> = ({ isOpen, onClose }) => {
  const [marca, setMarca]           = useState('');
  const [modelo, setModelo]         = useState('');
  const [anoMinimo, setAnoMinimo]   = useState(2018);
  const [puerto, setPuerto]         = useState('Puerto Cabello');
  const [presupuesto, setPresupuesto] = useState('');
  const [nombre, setNombre]         = useState('');
  const [telefono, setTelefono]     = useState('');
  const [email, setEmail]           = useState('');

  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setMarca(''); setModelo(''); setAnoMinimo(2018); setPuerto('Puerto Cabello');
    setPresupuesto(''); setNombre(''); setTelefono(''); setEmail('');
    setErrorMsg(''); setSuccess(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Save to Supabase
      const { error: dbErr } = await supabase.from('custom_machinery_requests').insert({
        marca:              marca.trim(),
        modelo:             modelo.trim(),
        ano_minimo:         anoMinimo,
        puerto_destino:     puerto,
        presupuesto_maximo: Number(presupuesto) || 0,
        nombre:             nombre.trim(),
        telefono:           telefono.trim(),
        email:              email.trim(),
        estado:             'pendiente',
      });

      if (dbErr) {
        console.warn('[CustomRequest] DB warning:', dbErr.message);
      }

      // 2. Send email notification
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'custom_request',
            nombre, telefono, email,
            marca, modelo, anoMinimo, puerto,
            presupuesto: Number(presupuesto) || 0,
          }),
        });
      } catch (mailErr) {
        console.warn('[CustomRequest] Email non-critical:', mailErr);
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappMsg = encodeURIComponent(
    `Hola MAKIMPORT! Solicito cotización para: ${marca} ${modelo} (Año ≥ ${anoMinimo}), Puerto: ${puerto}, Presupuesto: $${presupuesto} USD. Soy ${nombre}.`
  );
  const telegramMsg = encodeURIComponent(
    `Hola MAKIMPORT! Busco cotización: ${marca} ${modelo} (Año ≥ ${anoMinimo}), Puerto ${puerto}, hasta $${presupuesto} USD.`
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center">
              <Search className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Solicitar / Encargar Maquinaria</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Te buscamos el equipo y enviamos el presupuesto</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {success ? (
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-white mb-1">¡Solicitud Enviada!</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Recibimos tu encargo. Nuestro equipo preparará un presupuesto personalizado y te contactará pronto.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={`https://t.me/${TELEGRAM_USER}?text=${telegramMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-600/20 hover:bg-sky-600 border border-sky-500/40 text-sky-300 hover:text-white text-xs font-bold transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram</span>
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <button
                onClick={handleClose}
                className="text-xs text-slate-500 hover:text-white transition-colors underline"
              >
                Cerrar ventana
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-700/60 rounded-xl text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Machine Info */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-orange-400" /> Datos del Equipo Deseado
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Marca *</label>
                    <select
                      required
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Seleccionar...</option>
                      {BRANDS.map((brand) => (
                        <option key={brand.value} value={brand.label}>{brand.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Modelo *</label>
                    <input
                      required
                      type="text"
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      placeholder="Ej: 320D, PC200-8"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Año Mínimo *
                    </label>
                    <input
                      required
                      type="number"
                      min={2000}
                      max={2026}
                      value={anoMinimo}
                      onChange={(e) => setAnoMinimo(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Presupuesto Máx. (USD) *
                    </label>
                    <input
                      required
                      type="number"
                      min={1000}
                      value={presupuesto}
                      onChange={(e) => setPresupuesto(e.target.value)}
                      placeholder="Ej: 75000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-600 font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Puerto de Destino *
                  </label>
                  <select
                    required
                    value={puerto}
                    onChange={(e) => setPuerto(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option>Puerto Cabello</option>
                    <option>La Guaira</option>
                    <option>Maracaibo</option>
                    <option>Guanta / Barcelona</option>
                    <option>Otro</option>
                  </select>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-400" /> Datos de Contacto
                </p>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Nombre Completo *</label>
                  <input
                    required
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre o empresa"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Teléfono / WA *
                    </label>
                    <input
                      required
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+584XX..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Correo *
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando solicitud...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Enviar Solicitud de Cotización</span>
                  </>
                )}
              </button>

              <p className="text-center text-slate-600 leading-relaxed">
                Al enviar, nuestro equipo comercial recibirá tu encargo y te responderá por Telegram, WhatsApp o correo.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
