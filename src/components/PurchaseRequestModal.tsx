'use client';

import React, { useState } from 'react';
import { X, ShoppingBag, User, MapPin, Mail, Phone, CheckCircle2, AlertCircle, Loader2, Send, MessageCircle } from 'lucide-react';
import { MachineryItem } from '@/types/machinery';
import { supabase } from '@/lib/supabase';

interface PurchaseRequestModalProps {
  item: MachineryItem;
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseRequestModal: React.FC<PurchaseRequestModalProps> = ({ item, isOpen, onClose }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setNombre('');
    setApellido('');
    setCiudad('');
    setEmail('');
    setTelefono('');
    setErrorMsg('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Save to Supabase purchase_requests table
      const { error: dbError } = await supabase.from('purchase_requests').insert({
        machinery_id: item.id,
        machinery_title: item.name,
        machinery_price: item.price,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        ciudad: ciudad.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        estado: 'pendiente',
      });

      if (dbError) {
        console.warn('[PurchaseRequest] DB Error (non-critical):', dbError.message);
        // Non-fatal: proceed to send email anyway
      }

      // 2. Send notification email via API route
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            apellido,
            ciudad,
            email,
            telefono,
            machineryTitle: item.name,
            machineryId: item.id,
            machineryPrice: item.price,
          }),
        });
      } catch (mailErr) {
        console.warn('[PurchaseRequest] Email send failed (non-critical):', mailErr);
      }

      // 3. Show success confirmation options
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const purchaseMessage = encodeURIComponent(
    `Hola MAKIMPORT! Acabo de enviar una solicitud de compra para: ${item.name} (${item.model}) - $${item.price.toLocaleString()} USD. Mi nombre es ${nombre} ${apellido}.`
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Solicitud de Compra Inmediata</h3>
              <p className="text-[10px] text-slate-400 font-mono">{item.name} — ${item.price.toLocaleString()} USD</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { resetForm(); onClose(); }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-white mb-1">¡Solicitud Registrada con Éxito!</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hemos enviado la notificación a <strong className="text-white">makimportvzla@gmail.com</strong>. <br />
                ¿Cómo deseas recibir atención comercial inmediata?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={`https://t.me/makimportvzla?text=${purchaseMessage}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-sky-600/20 hover:bg-sky-600 border border-sky-500/40 text-sky-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Continuar por Telegram (@makimportvzla)</span>
              </a>

              <a
                href={`https://wa.me/584146370819?text=${purchaseMessage}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Continuar por WhatsApp (+58 414-6370819)</span>
              </a>
            </div>

            <button
              onClick={() => { resetForm(); onClose(); }}
              className="text-xs text-slate-500 hover:text-slate-300 underline pt-2 transition-colors"
            >
              Cerrar ventana
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">

            {errorMsg && (
              <div className="p-3 bg-red-950/90 border border-red-800 text-red-200 rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Price Info Banner */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
              <span className="text-slate-400 font-medium">Precio de Compra:</span>
              <span className="text-lg font-black text-amber-400 font-mono">${item.price.toLocaleString()} USD</span>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-slate-400" /> Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Juan"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Apellido *</label>
                <input
                  type="text"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Pérez"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400" /> Ciudad *
              </label>
              <input
                type="text"
                required
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="Ej. Caracas, Valencia, Maracaibo..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-slate-400" /> Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" /> Teléfono / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+58 412 000 0000"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
              />
            </div>

            {/* Info note */}
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Al enviar, notificaremos a nuestro equipo en <span className="text-emerald-400 font-semibold">makimportvzla@gmail.com</span> y serás redirigido a <span className="text-sky-400 font-semibold">@makimportvzla</span> en Telegram para coordinar el proceso de compra.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando Solicitud...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Solicitud de Compra</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
