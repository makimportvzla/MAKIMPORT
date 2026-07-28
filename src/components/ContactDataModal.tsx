'use client';

import React, { useState } from 'react';
import { X, Phone, CreditCard, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const VENEZUELA_CITIES = [
  'Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay',
  'Ciudad Guayana', 'Barcelona', 'Maturín', 'Cumaná', 'Mérida',
  'San Cristóbal', 'Cabimas', 'Barinas', 'Puerto Cabello', 'Punto Fijo',
  'Los Teques', 'Turmero', 'Petare', 'Guatire', 'Guarenas',
  'La Victoria', 'Cagua', 'Acarigua', 'Porlamar', 'El Tigre',
  'Otra ciudad'
];

interface ContactDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ContactDataModal: React.FC<ContactDataModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { user, refreshProfile } = useAuth();

  const [telefono, setTelefono] = useState('');
  const [cedulaRif, setCedulaRif] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!telefono.trim()) {
      setError('El teléfono/WhatsApp es obligatorio.');
      return;
    }
    if (!cedulaRif.trim()) {
      setError('La Cédula o RIF es obligatorio.');
      return;
    }
    if (!ciudad) {
      setError('Selecciona tu ciudad.');
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          telefono: telefono.trim(),
          cedula_rif: cedulaRif.trim(),
          ciudad: ciudad,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh context profile so downstream components have fresh data
      await refreshProfile();
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Error al guardar tus datos. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-orange-500/30 rounded-2xl shadow-2xl overflow-hidden">

        {/* Gradient glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold text-white">Completa tus datos de contacto</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Para continuar con tu operación, necesitamos tus datos de contacto reales. Esto nos permite coordinar directamente contigo.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors ml-4 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Teléfono */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              Teléfono / WhatsApp *
            </label>
            <input
              type="tel"
              placeholder="+58 414-0000000"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Cédula / RIF */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-orange-400" />
              Cédula de Identidad / RIF *
            </label>
            <input
              type="text"
              placeholder="V-12345678 / J-123456789"
              value={cedulaRif}
              onChange={(e) => setCedulaRif(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Ciudad */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              Ciudad *
            </label>
            <select
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors appearance-none"
            >
              <option value="">Selecciona tu ciudad...</option>
              {VENEZUELA_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-300 font-medium">
              ✗ {error}
            </div>
          )}

          {/* Note */}
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Tus datos son confidenciales y se utilizan únicamente para coordinar la compra o adjudicación del equipo. No serán compartidos con terceros.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar y Continuar</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
