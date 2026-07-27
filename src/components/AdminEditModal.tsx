'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Gavel, DollarSign, Calendar, MapPin, ShieldCheck, CheckCircle2, AlertCircle, Loader2, FileText, Upload, Ship, Settings } from 'lucide-react';
import { MachineryItem } from '@/types/machinery';
import { ImageUploader } from './ImageUploader';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES, BRANDS, VENEZUELA_CITIES } from '@/constants/machineryOptions';

interface AdminEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineryItem: MachineryItem | null;
  onMachineryUpdated: (item: MachineryItem) => void;
}

export const AdminEditModal: React.FC<AdminEditModalProps> = ({
  isOpen,
  onClose,
  machineryItem,
  onMachineryUpdated,
}) => {
  const { user } = useAuth();
  
  // Section 1: Datos Generales
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Caterpillar (CAT)');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('Excavadora de Oruga');
  const [year, setYear] = useState(2022);
  const [hours, setHours] = useState(2500);
  const [directPrice, setDirectPrice] = useState(65000);
  const [origin, setOrigin] = useState('USA');
  const [location, setLocation] = useState('Houston, TX - EE.UU.');
  const [ciudadVenezuela, setCiudadVenezuela] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  // Section 2: Carga de Medios & PDF
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [pdfReportUrl, setPdfReportUrl] = useState('');
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  // Section 3: Inspección (Puntuación 100/100)
  const [inspeccionGeneral, setInspeccionGeneral] = useState(94);
  const [inspeccionMotor, setInspeccionMotor] = useState(95);
  const [inspeccionHidraulico, setInspeccionHidraulico] = useState(92);
  const [inspeccionTransmision, setInspeccionTransmision] = useState(94);
  const [inspeccionCabina, setInspeccionCabina] = useState(90);
  const [inspeccionCauchos, setInspeccionCauchos] = useState(88);
  
  // Section 4: Logística
  const [destinationPort, setDestinationPort] = useState('Puerto Cabello, VZLA');
  const [transitTime, setTransitTime] = useState('25-35 días');
  const [paymentTerms, setPaymentTerms] = useState('Reserva 20%, Embarque 50%, Recepción Puerto Cabello 30%');

  // Auction settings
  const [isAuction, setIsAuction] = useState(false);
  const [startPrice, setStartPrice] = useState(50000);
  const [auctionEndDate, setAuctionEndDate] = useState('');
  
  const [details, setDetails] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load values when machineryItem changes
  useEffect(() => {
    if (isOpen && machineryItem) {
      setTitle(machineryItem.name || '');
      setBrand(machineryItem.brand || 'Caterpillar (CAT)');
      setModel(machineryItem.model || '');
      setCategory(machineryItem.category || 'Excavadora de Oruga');
      setYear(machineryItem.year || 2022);
      setHours(machineryItem.hours || 0);
      setDirectPrice(machineryItem.price || 0);
      setOrigin(machineryItem.origin || 'USA');
      setLocation(machineryItem.location || '');
      setCiudadVenezuela(machineryItem.ciudadVenezuela || '');
      setSerialNumber(machineryItem.serialNumber || '');
      setPhotoUrls(machineryItem.images || []);
      setPdfReportUrl(machineryItem.pdfReportUrl || '');
      setInspeccionGeneral(machineryItem.inspeccionGeneral ?? 94);
      setInspeccionMotor(machineryItem.inspeccionMotor ?? 95);
      setInspeccionHidraulico(machineryItem.inspeccionHidraulico ?? 92);
      setInspeccionTransmision(machineryItem.inspeccionTransmision ?? 94);
      setInspeccionCabina(machineryItem.inspeccionCabina ?? 90);
      setInspeccionCauchos(machineryItem.inspeccionCauchos ?? 88);
      setDestinationPort(machineryItem.destinationPort || 'Puerto Cabello, VZLA');
      setTransitTime(machineryItem.transitTime || '25-35 días');
      
      const dbRowPayment = (machineryItem as any).paymentTerms || (machineryItem as any).condicionesPago || 'Reserva 20%, Embarque 50%, Recepción Puerto Cabello 30%';
      setPaymentTerms(dbRowPayment);

      setIsAuction(machineryItem.status === 'auction');
      setStartPrice(machineryItem.currentBid ?? machineryItem.price ?? 50000);
      
      if (machineryItem.auctionEndsAt) {
        const dateObj = new Date(machineryItem.auctionEndsAt);
        if (!isNaN(dateObj.getTime())) {
          const tzOffset = dateObj.getTimezoneOffset() * 60000;
          const localISOTime = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
          setAuctionEndDate(localISOTime);
        } else {
          setAuctionEndDate('');
        }
      } else {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const tzOffset = tomorrow.getTimezoneOffset() * 60000;
        const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
        setAuctionEndDate(localISOTime);
      }
      setDetails(machineryItem.description || '');
      setErrorMsg('');
      setToastMessage(null);
    }
  }, [isOpen, machineryItem]);

  if (!isOpen || !machineryItem) return null;

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfUploading(true);
    setPdfError('');

    try {
      const fileExt = file.name.split('.').pop() || 'pdf';
      const fileName = `${Date.now()}_pdf_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { data, error } = await supabase.storage
        .from('machinery-photos')
        .upload(filePath, file, { upsert: true, cacheControl: '3600' });

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('machinery-photos')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          setPdfReportUrl(publicUrlData.publicUrl);
        }
      }
    } catch (err: any) {
      console.warn('PDF upload failed:', err.message);
      setPdfError('Error al subir PDF. Se utilizará previsualización local temporal.');
      const localUrl = URL.createObjectURL(file);
      setPdfReportUrl(localUrl);
    } finally {
      setPdfUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMsg('');
    setToastMessage(null);

    const finalPhotos = photoUrls.length > 0
      ? photoUrls
      : ['https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800'];

    try {
      const endsAtDate = isAuction && auctionEndDate ? new Date(auctionEndDate) : null;

      const updatedItem: MachineryItem = {
        id: machineryItem.id,
        name: title.trim() || `${brand} ${model}`,
        model: model.trim() || 'Standard Heavy Duty',
        brand: brand,
        category: category,
        year: Number(year),
        hours: Number(hours),
        origin: origin as any,
        location: location,
        destinationPort: destinationPort,
        status: isAuction ? 'auction' : 'direct',
        price: Number(directPrice),
        currentBid: isAuction ? Number(startPrice) : undefined,
        minBidIncrement: 500,
        bidsCount: machineryItem.bidsCount || 0,
        auctionEndsAt: endsAtDate ? endsAtDate : undefined,
        image: finalPhotos[0],
        images: finalPhotos,
        serialNumber: serialNumber,
        engineSpecs: 'Motor diésel industrial de alta compresión',
        inspectionScore: Number(inspeccionGeneral),
        description: details.trim() || 'Maquinaria pesada certificada.',
        pdfReportUrl: pdfReportUrl || undefined,
        inspeccionGeneral: Number(inspeccionGeneral),
        inspeccionMotor: Number(inspeccionMotor),
        inspeccionHidraulico: Number(inspeccionHidraulico),
        inspeccionTransmision: Number(inspeccionTransmision),
        inspeccionCabina: Number(inspeccionCabina),
        inspeccionCauchos: Number(inspeccionCauchos),
        transitTime: transitTime,
        ciudadVenezuela: ciudadVenezuela || undefined
      };

      const { data: dbData, error: dbError } = await supabase
        .from('machinery')
        .update({
          titulo: updatedItem.name,
          marca: updatedItem.brand,
          modelo: updatedItem.model,
          ano: updatedItem.year,
          horas_uso: updatedItem.hours,
          condicion_detalles: updatedItem.description,
          precio_compra_inmediata: updatedItem.price,
          es_subasta: isAuction,
          precio_inicial_subasta: isAuction ? updatedItem.currentBid : 0,
          puja_actual: isAuction ? updatedItem.currentBid : 0,
          fecha_fin_subasta: endsAtDate ? endsAtDate.toISOString() : null,
          fotos_urls: finalPhotos,
          ubicacion_origen: updatedItem.location,
          condiciones_pago: paymentTerms,
          categoria: updatedItem.category,
          numero_serie: updatedItem.serialNumber,
          pdf_reporte_url: pdfReportUrl || null,
          inspeccion_general: Number(inspeccionGeneral),
          inspeccion_motor: Number(inspeccionMotor),
          inspeccion_hidraulico: Number(inspeccionHidraulico),
          inspeccion_transmision: Number(inspeccionTransmision),
          inspeccion_cabina: Number(inspeccionCabina),
          inspeccion_cauchos: Number(inspeccionCauchos),
          puerto_destino: updatedItem.destinationPort,
          tiempo_transito: transitTime,
          ciudad_venezuela: ciudadVenezuela || null
        })
        .eq('id', machineryItem.id)
        .select();

      if (dbError) {
        console.error('Error actualizando en Supabase:', dbError);
        setErrorMsg(`Error de Supabase: ${dbError.message}${dbError.details ? ` (${dbError.details})` : ''}`);
        setLoading(false);
        return;
      }

      onMachineryUpdated(updatedItem);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('machinery_updated', { detail: updatedItem }));
        window.dispatchEvent(new CustomEvent('machinery_created', { detail: updatedItem }));
      }

      setToastMessage(`¡Maquinaria "${updatedItem.name}" editada exitosamente!`);

      setTimeout(() => {
        setToastMessage(null);
        onClose();
      }, 1600);

    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado al guardar la maquinaria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 max-w-md bg-emerald-950 border-2 border-emerald-500 text-emerald-100 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm text-white">¡Edición Guardada!</h4>
            <p className="text-xs text-emerald-200 mt-0.5">{toastMessage}</p>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-orange-400 font-extrabold text-lg">
            <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Editar Ficha Técnica de Maquinaria</span>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg border border-slate-800 bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {errorMsg && (
            <div className="p-3.5 bg-red-950/90 border border-red-800 text-red-200 rounded-xl font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div className="flex-1">
                <span className="block font-bold text-red-100">No se pudo actualizar en Supabase</span>
                <span className="text-[11px] font-mono text-red-300">{errorMsg}</span>
              </div>
            </div>
          )}

          {/* SECCIÓN A: DATOS GENERALES */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-1.5 text-orange-400">
              A) Datos Generales
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Título / Nombre Comercial *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  placeholder="Ej. Excavadora Hidráulica Caterpillar 320D L"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Categoría *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.label}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Marca *</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  {BRANDS.map((b) => (
                    <option key={b.value} value={b.label}>{b.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Modelo exacto *</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  placeholder="Ej. 320D L"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Número de Serie (VIN / Chasis)</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-orange-500"
                  placeholder="Ej. CAT0320DL098..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Año de Fabricación</label>
                <input
                  type="number"
                  min={2000}
                  max={2027}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Horas de Uso</label>
                <input
                  type="number"
                  min={0}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ubicación de Origen</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  placeholder="Ej. Houston, TX - EE.UU."
                />
              </div>

              {origin === 'Venezuela' && (
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    <span>🇻🇪 Ciudad / Ubicación Actual en Venezuela</span>
                  </label>
                  <select
                    value={ciudadVenezuela}
                    onChange={(e) => setCiudadVenezuela(e.target.value)}
                    className="w-full bg-slate-950 border border-orange-500/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">— Seleccionar ciudad —</option>
                    {VENEZUELA_CITIES.map((city) => (
                      <option key={city.value} value={city.value}>{city.label}</option>
                    ))}
                  </select>
                  {ciudadVenezuela && (
                    <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
                      ✓ La máquina se encuentra físicamente en Venezuela — se mostrará en la ficha del catálogo.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN B: CARGA DE MEDIOS & PDF */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-1.5 text-orange-400">
              B) Carga de Medios & Reportes
            </h3>

            <ImageUploader
              initialImages={photoUrls}
              onImagesChanged={(newUrls) => setPhotoUrls(newUrls)}
            />

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span>Reporte Mecánico (PDF de Inspección)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative border border-dashed border-slate-800 hover:border-orange-500/50 rounded-xl p-3 text-center bg-slate-900/40 transition-colors flex flex-col items-center justify-center min-h-[90px]">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {pdfUploading ? (
                    <div className="flex flex-col items-center gap-1">
                      <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
                      <span className="text-[10px] text-slate-300">Subiendo PDF...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 pointer-events-none">
                      <Upload className="w-5 h-5 text-orange-400" />
                      <span className="text-[10px] font-bold text-white">Adjuntar Documento PDF</span>
                      <span className="text-[9px] text-slate-500">Haz clic para buscar archivo</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center space-y-2">
                  <label className="block text-[10px] font-semibold text-slate-400">
                    URL Directa del PDF (Alternativo o Subido)
                  </label>
                  <input
                    type="url"
                    value={pdfReportUrl}
                    onChange={(e) => setPdfReportUrl(e.target.value)}
                    placeholder="https://ejemplo.com/informe.pdf"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-mono"
                  />
                  {pdfError && <span className="text-[9px] text-amber-400 font-bold block">{pdfError}</span>}
                  {pdfReportUrl && (
                    <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PDF enlazado correctamente.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN C: INSPECCIÓN MECÁNICA (100 PTS) */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-1.5 text-orange-400">
              C) Inspección Técnica (Puntuación sobre 100)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-400">General *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min="50" max="100"
                    value={inspeccionGeneral}
                    onChange={(e) => setInspeccionGeneral(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                  <span className="font-mono font-bold text-white text-xs min-w-[24px]">{inspeccionGeneral}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-400">Motor *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min="50" max="100"
                    value={inspeccionMotor}
                    onChange={(e) => setInspeccionMotor(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                  <span className="font-mono font-bold text-white text-xs min-w-[24px]">{inspeccionMotor}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-400">Sistema Hidráulico *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min="50" max="100"
                    value={inspeccionHidraulico}
                    onChange={(e) => setInspeccionHidraulico(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                  <span className="font-mono font-bold text-white text-xs min-w-[24px]">{inspeccionHidraulico}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-400">Transmisión *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min="50" max="100"
                    value={inspeccionTransmision}
                    onChange={(e) => setInspeccionTransmision(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                  <span className="font-mono font-bold text-white text-xs min-w-[24px]">{inspeccionTransmision}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-400">Cabina *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min="50" max="100"
                    value={inspeccionCabina}
                    onChange={(e) => setInspeccionCabina(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                  <span className="font-mono font-bold text-white text-xs min-w-[24px]">{inspeccionCabina}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-400">Neumáticos *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min="0" max="100"
                    value={inspeccionCauchos}
                    onChange={(e) => setInspeccionCauchos(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                  <span className="font-mono font-bold text-white text-xs min-w-[24px]">{inspeccionCauchos}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN D: LOGÍSTICA */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-1.5 text-orange-400">
              D) Logística & Envío a Venezuela
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Ship className="w-3.5 h-3.5 text-orange-400" />
                  <span>Puerto de Destino (Venezuela)</span>
                </label>
                <select
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Puerto Cabello, VZLA">Puerto Cabello, Venezuela (🇻🇪)</option>
                  <option value="La Guaira, VZLA">La Guaira, Venezuela (🇻🇪)</option>
                  <option value="Maracaibo, VZLA">Puerto de Maracaibo, Venezuela (🇻🇪)</option>
                  <option value="Guanta, VZLA">Puerto de Guanta, Venezuela (🇻🇪)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tiempo de Tránsito Estimado</label>
                <select
                  value={transitTime}
                  onChange={(e) => setTransitTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="15-25 días">15 - 25 días (Rápido)</option>
                  <option value="25-35 días">25 - 35 días (Estándar)</option>
                  <option value="35-45 días">35 - 45 días (Largo alcance)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Origen Transacción</label>
                <select
                  value={origin}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOrigin(val);
                    if (val === 'USA') setLocation('Houston, TX - EE.UU.');
                    else if (val === 'China') setLocation('Shanghai Port - China');
                    else if (val === 'Venezuela') setLocation('Venezuela');
                    else setLocation('En Tránsito');
                    if (val !== 'Venezuela') setCiudadVenezuela('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="USA">EE.UU. (🇺🇸)</option>
                  <option value="China">China (🇨🇳)</option>
                  <option value="En Tránsito">En Tránsito</option>
                  <option value="Venezuela">Venezuela (🇻🇪)</option>
                </select>
              </div>
            </div>
          </div>

          {/* MODALIDAD DE PUBLICACIÓN (Subasta vs Compra Inmediata) */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                <input
                  type="checkbox"
                  checked={isAuction}
                  onChange={(e) => setIsAuction(e.target.checked)}
                  className="rounded border-slate-700 text-orange-600 focus:ring-orange-500 bg-slate-900 w-4 h-4"
                />
                <Gavel className="w-4 h-4 text-orange-400" />
                <span>Habilitar puja / Subasta en vivo</span>
              </label>

              <span className="text-[10px] text-slate-400">
                {isAuction ? 'Subasta + Compra Inmediata' : 'Solo Compra Inmediata'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Precio Compra Directa (USD) *
                </label>
                <input
                  type="number"
                  min={1000}
                  required
                  value={directPrice}
                  onChange={(e) => setDirectPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none"
                />
              </div>

              {isAuction && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Precio Inicial Subasta (USD) *
                    </label>
                    <input
                      type="number"
                      min={500}
                      required={isAuction}
                      value={startPrice}
                      onChange={(e) => setStartPrice(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-orange-400 font-mono font-bold focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-300 mb-1">
                      Fecha y Hora Exacta de Fin de Subasta
                    </label>
                    <input
                      type="datetime-local"
                      required={isAuction}
                      value={auctionEndDate}
                      onChange={(e) => setAuctionEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Condición & Detalles Adicionales</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-orange-500"
              placeholder="Describa brevemente aspectos clave no cubiertos..."
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-950 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando Cambios...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
