'use client';

import React, { useState } from 'react';
import {
  X, CheckCircle2, AlertCircle, Loader2,
  Wrench, User, Phone, MapPin, DollarSign, Calendar, Tag
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BRANDS, CATEGORIES } from '@/constants/machineryOptions';
import { ImageUploader } from './ImageUploader';
import { useAuth } from '@/context/AuthContext';

interface PostularEquipoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostularEquipoModal: React.FC<PostularEquipoModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  // Client Data
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedulaRif, setCedulaRif] = useState('');
  const [telefono, setTelefono] = useState('');

  // Equipment Data
  const [categoria, setCategoria] = useState('excavadora');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [condicion, setCondicion] = useState('Operativa');
  
  // Specifications
  const [usoValor, setUsoValor] = useState('');
  const [usoUnidad, setUsoUnidad] = useState('Horas');

  // Logistics & Price
  const [ciudad, setCiudad] = useState('');
  const [precioEstimado, setPrecioEstimado] = useState('');

  // Files/Photos
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setNombre('');
    setApellido('');
    setCedulaRif('');
    setTelefono('');
    setCategoria('excavadora');
    setMarca('');
    setModelo('');
    setAno('');
    setCondicion('Operativa');
    setUsoValor('');
    setUsoUnidad('Horas');
    setCiudad('');
    setPrecioEstimado('');
    setPhotoUrls([]);
    setErrorMsg('');
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!nombre.trim() || !apellido.trim() || !cedulaRif.trim() || !telefono.trim()) {
      setErrorMsg('Por favor completa todos los datos de contacto.');
      return;
    }
    if (!marca || !modelo.trim() || !ano || !ciudad.trim() || !precioEstimado) {
      setErrorMsg('Por favor completa las especificaciones principales y el precio estimado.');
      return;
    }
    if (photoUrls.length === 0) {
      setErrorMsg('Por favor carga al menos una fotografía de tu equipo.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error: dbErr } = await supabase.from('postulaciones_equipos').insert({
        nombre_cliente: nombre.trim(),
        apellido_cliente: apellido.trim(),
        cedula_rif_cliente: cedulaRif.trim(),
        telefono_cliente: telefono.trim(),
        marca: marca,
        modelo: modelo.trim(),
        ano: Number(ano),
        condicion: condicion,
        uso_valor: Number(usoValor) || 0,
        uso_unidad: usoUnidad,
        ciudad_venezuela: ciudad.trim(),
        precio_estimado: Number(precioEstimado) || 0,
        fotos_urls: photoUrls,
        estado: 'Pendiente de Revisión',
        creado_por: user?.id || null
      });

      if (dbErr) {
        throw dbErr;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('[PostularEquipo] DB error:', err);
      setErrorMsg(err.message || 'Error al guardar la postulación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center">
              <Tag className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Publica tu Equipo con Nosotros</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Envía los detalles de tu maquinaria para revisión y publicación en el catálogo</p>
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

        {/* Form Content */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6">
          {success ? (
            <div className="py-10 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-extrabold text-white">¡Postulación Registrada!</h4>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                  La información de tu equipo ha sido recibida con éxito y se encuentra **Pendiente de Revisión**. 
                  Nos comunicaremos contigo a tu WhatsApp a la brevedad para verificar la información.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Cerrar ventana
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3.5 bg-red-950/60 border border-red-700/60 rounded-xl text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Datos del Cliente */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <p className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5 pb-1.5 border-b border-slate-800/60">
                  <User className="w-4 h-4 text-orange-400" /> Datos del Propietario / Cliente
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Nombre *</label>
                    <input
                      required
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Carlos"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Apellido *</label>
                    <input
                      required
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Ej. Rodríguez"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Cédula o RIF *</label>
                    <input
                      required
                      type="text"
                      value={cedulaRif}
                      onChange={(e) => setCedulaRif(e.target.value)}
                      placeholder="V-12345678 o J-30000000-0"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Teléfono / WhatsApp *</label>
                    <input
                      required
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej. +584141234567"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Datos del Equipo */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <p className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5 pb-1.5 border-b border-slate-800/60">
                  <Wrench className="w-4 h-4 text-orange-400" /> Datos y Especificaciones de la Maquinaria
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Categoría *</label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Marca *</label>
                    <select
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Selecciona marca...</option>
                      {BRANDS.map((b) => (
                        <option key={b.value} value={b.label}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-slate-400 mb-1 font-medium">Modelo *</label>
                    <input
                      required
                      type="text"
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      placeholder="Ej. 320D L"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-orange-400" /> Año *
                    </label>
                    <input
                      required
                      type="number"
                      min={1980}
                      max={2026}
                      value={ano}
                      onChange={(e) => setAno(e.target.value)}
                      placeholder="2020"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Condición *</label>
                    <select
                      value={condicion}
                      onChange={(e) => setCondicion(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Operativa">100% Operativa / Lista para trabajar</option>
                      <option value="Detalles">Operativa con detalles de desgaste</option>
                      <option value="Inoperativa">Inoperativa / Requiere reparación</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Uso *</label>
                    <div className="flex gap-2">
                      <input
                        required
                        type="number"
                        min={0}
                        value={usoValor}
                        onChange={(e) => setUsoValor(e.target.value)}
                        placeholder="Ej. 3200"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-orange-500"
                      />
                      <select
                        value={usoUnidad}
                        onChange={(e) => setUsoUnidad(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-orange-500 w-24"
                      >
                        <option>Horas</option>
                        <option>Kilómetros</option>
                        <option>Millas</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Logística y Precio */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <p className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5 pb-1.5 border-b border-slate-800/60">
                  <MapPin className="w-4 h-4 text-orange-400" /> Logística y Precio Estimado
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-400" /> Ubicación en Venezuela (Ciudad/Estado) *
                    </label>
                    <input
                      required
                      type="text"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      placeholder="Ej. Valencia, Carabobo"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-orange-400" /> Precio Estimado de Venta (USD) *
                    </label>
                    <input
                      required
                      type="number"
                      min={0}
                      value={precioEstimado}
                      onChange={(e) => setPrecioEstimado(e.target.value)}
                      placeholder="Ej. 65000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Archivos/Fotos */}
              <ImageUploader
                initialImages={[]}
                onImagesChanged={(urls) => setPhotoUrls(urls)}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando postulación...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enviar Postulación para Publicación</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
