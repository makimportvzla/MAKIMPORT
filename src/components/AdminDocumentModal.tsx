'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Send, Phone, MessageSquare, ShieldCheck, Mail, Calendar, MapPin, User, FileSignature } from 'lucide-react';
import { MachineryItem } from '@/types/machinery';
import { supabase } from '@/lib/supabase';
import { jsPDF } from 'jspdf';

interface AdminDocumentModalProps {
  item: MachineryItem;
  initialBuyer?: {
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    ciudad?: string;
  };
  onClose: () => void;
}

export const AdminDocumentModal: React.FC<AdminDocumentModalProps> = ({
  item,
  initialBuyer,
  onClose
}) => {
  // Buyer form states
  const [compradorNombre, setCompradorNombre] = useState('');
  const [compradorCedula, setCompradorCedula] = useState('');
  const [compradorEstadoCivil, setCompradorEstadoCivil] = useState('Soltero(a)');
  const [compradorTelefono, setCompradorTelefono] = useState('');
  const [compradorEmail, setCompradorEmail] = useState('');
  const [compradorCiudad, setCompradorCiudad] = useState('');
  const [compradorEstado, setCompradorEstado] = useState('');
  const [compradorDestino, setCompradorDestino] = useState('Puerto Cabello, VZLA');
  const [fechaContrato, setFechaContrato] = useState('');

  // UI state
  const [sendingEmail, setSendingEmail] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Pre-fill fields
  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    setFechaContrato(today);

    if (initialBuyer) {
      const fullNombre = `${initialBuyer.nombre || ''} ${initialBuyer.apellido || ''}`.trim();
      setCompradorNombre(fullNombre || '');
      setCompradorEmail(initialBuyer.email || '');
      setCompradorTelefono(initialBuyer.telefono || '');
      setCompradorCiudad(initialBuyer.ciudad || '');
    }
  }, [initialBuyer]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const getMontoFinal = () => {
    return item.currentBid || item.price || 0;
  };

  // Helper to generate contract document
  const generatePDFDoc = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);

    // Paleta de colores profesionales
    const primaryColor = [234, 88, 12]; // Naranja MAKIMPORT #ea580c
    const textColor = [15, 23, 42]; // Slate 900
    const secondaryText = [71, 85, 105]; // Slate 600
    const lightGrey = [248, 250, 252]; // Slate 50
    const borderGrey = [226, 232, 240]; // Slate 200

    let y = 15;

    // Línea superior decorativa naranja
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, y, contentWidth, 5, 'F');
    y += 12;

    // Encabezado
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('MAKIMPORT VENEZUELA', margin, y);
    y += 6;

    doc.setFontSize(8.5);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);
    doc.text('Caracas, Venezuela | RIF: J-50123984-2 | Email: makimportvzla@gmail.com | Web: www.makimport.com', margin, y);
    y += 10;

    // Título del documento
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('CONTRATO PRELIMINAR DE COMPRA-VENTA Y ADJUDICACIÓN DE MAQUINARIA', margin, y);
    y += 5;

    // Línea divisoria
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Cláusula introductoria
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    const introText = `Reunidos en la fecha de hoy, se conviene celebrar el presente Contrato de Compra-Venta entre la empresa comercializadora MAKIMPORT VENEZUELA (en lo sucesivo denominada "EL VENDEDOR") y, por la otra parte, el comprador ${compradorNombre.toUpperCase()}, de estado civil ${compradorEstadoCivil}, titular de la Cédula de Identidad o RIF N° ${compradorCedula}, con residencia en la ciudad de ${compradorCiudad}, Estado ${compradorEstado} (en lo sucesivo denominado "EL COMPRADOR"). Ambas partes convienen formalizar la transacción de conformidad con el Art. 1.474 y concordantes del Código Civil de la República Bolivariana de Venezuela, bajo las siguientes estipulaciones:`;

    const splitIntro = doc.splitTextToSize(introText, contentWidth);
    doc.text(splitIntro, margin, y);
    y += splitIntro.length * 4.2 + 5;

    // Primera Cláusula: Objeto
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PRIMERA: OBJETO DEL CONTRATO (ESPECIFICACIONES TÉCNICAS)', margin, y);
    y += 5;

    // Especificaciones de Maquinaria
    const specs = [
      ['Marca y Modelo', `${item.brand} ${item.model}`],
      ['Año de Fabricación', `${item.year}`],
      ['Serial de Chasis / VIN', `${item.serialNumber}`],
      ['Uso / Recorrido Registrado', `${item.hours.toLocaleString()} ${item.unidadUso || 'Horas'}`],
      ['Ubicación de Origen', `${item.location}`],
      ['Certificación de Inspección', `${item.inspectionScore} / 100 Puntos`],
      ['Puerto de Arribo Destinado', `${compradorDestino}`],
      ['Modalidad de Operación', `${item.status === 'auction' ? 'Subasta Adjudicada' : 'Compra Inmediata'}`]
    ];

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.setLineWidth(0.2);

    specs.forEach((spec, idx) => {
      // Fondo alterno
      if (idx % 2 === 0) {
        doc.setFillColor(lightGrey[0], lightGrey[1], lightGrey[2]);
        doc.rect(margin, y, contentWidth, 6, 'F');
      }
      
      doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);
      doc.setFont('Helvetica', 'bold');
      doc.text(spec[0], margin + 3, y + 4.2);

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('Helvetica', 'normal');
      doc.text(spec[1], margin + 70, y + 4.2);

      doc.line(margin, y + 6, pageWidth - margin, y + 6);
      y += 6;
    });
    y += 6;

    // Segunda Cláusula: Precio
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('SEGUNDA: DEL PRECIO CONVENIDO Y CONDICIONES DE PAGO', margin, y);
    y += 5;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const priceText = `El monto acordado de la presente compraventa asciende a la cantidad de $${getMontoFinal().toLocaleString()} USD (DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA). EL COMPRADOR se compromete a realizar la transferencia o depósito de los fondos en las cuentas bancarias de custodia de EL VENDEDOR. La entrega y despacho internacional se iniciará tras la confirmación de la transferencia del porcentaje estipulado.`;
    const splitPrice = doc.splitTextToSize(priceText, contentWidth);
    doc.text(splitPrice, margin, y);
    y += splitPrice.length * 4.2 + 5;

    // Tercera Cláusula: Logística
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('TERCERA: DE LA LOGÍSTICA DE EMBARQUE Y NACIONALIZACIÓN', margin, y);
    y += 5;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    const logisticsText = `EL VENDEDOR asume la responsabilidad del flete marítimo y resguardo del equipo hasta el puerto de ${compradorDestino}. Toda la gestión aduanera, aranceles nacionales y posterior traslado final terrestre correrán bajo cuenta y responsabilidad de EL COMPRADOR, contando con la debida asesoría institucional por parte del equipo comercial de MAKIMPORT.`;
    const splitLogistics = doc.splitTextToSize(logisticsText, contentWidth);
    doc.text(splitLogistics, margin, y);
    y += splitLogistics.length * 4.2 + 8;

    // Control de salto de página para firmas
    if (y > 210) {
      doc.addPage();
      y = 25;
    }

    // Firmas
    doc.text(`En señal de conformidad con todas y cada una de las cláusulas, se firma el presente documento en duplicado el día ${new Date(fechaContrato).toLocaleDateString('es-VE')}.`, margin, y);
    y += 25;

    const colWidth = contentWidth / 2;
    doc.setDrawColor(secondaryText[0], secondaryText[1], secondaryText[2]);
    doc.setLineWidth(0.3);

    // Firma Vendedor
    doc.line(margin + 5, y, margin + colWidth - 10, y);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('POR EL VENDEDOR (MAKIMPORT VENEZUELA)', margin + 5, y + 4.5);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Firma y Sello Comercial', margin + 5, y + 8.5);

    // Firma Comprador
    doc.line(margin + colWidth + 5, y, margin + (colWidth * 2) - 5, y);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('POR EL COMPRADOR', margin + colWidth + 5, y + 4.5);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(compradorNombre.toUpperCase(), margin + colWidth + 5, y + 8.5);
    doc.text(`C.I. / RIF: ${compradorCedula}`, margin + colWidth + 5, y + 12.5);

    return doc;
  };

  // Generate jsPDF Contract Document and download
  const handleDownloadPDF = () => {
    try {
      const doc = generatePDFDoc();
      doc.save(`Contrato_Adjudicacion_${item.brand}_${item.model}_${compradorCedula || 'Cliente'}.pdf`);
      showToast('Documento PDF generado y descargado correctamente.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Error al generar el PDF. Revisa los datos ingresados.', 'error');
    }
  };

  // Send Contract via Email API
  const handleSendEmail = async () => {
    if (!compradorEmail) {
      showToast('Por favor, ingresa el correo del cliente.', 'error');
      return;
    }

    setSendingEmail(true);
    try {
      let pdfBase64 = '';
      try {
        const doc = generatePDFDoc();
        pdfBase64 = doc.output('datauristring').split(',')[1];
      } catch (pdfErr) {
        console.warn('Could not generate PDF base64 for attachment:', pdfErr);
      }

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contract_sent',
          machineryTitle: `${item.brand} ${item.model}`,
          machineryBrand: item.brand,
          machineryModel: item.model,
          machineryVin: item.serialNumber,
          finalAmount: getMontoFinal(),
          compradorNombre,
          compradorEmail,
          compradorCedula,
          compradorEstadoCivil,
          compradorTelefono,
          compradorCiudad,
          compradorEstado,
          compradorDestino,
          fechaContrato,
          pdfAttachment: pdfBase64
        })
      });

      const res = await response.json();
      if (res.success) {
        showToast(`Contrato enviado exitosamente al correo ${compradorEmail}.`, 'success');
      } else {
        showToast(res.error || 'Ocurrió un error al enviar el correo.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('No se pudo establecer conexión con el servidor.', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  // Prefilled WhatsApp API link
  const handleSendWhatsApp = () => {
    if (!compradorTelefono) {
      showToast('Por favor, ingresa el teléfono del cliente.', 'error');
      return;
    }

    const cleanPhone = compradorTelefono.replace(/[^0-9]/g, '');
    const message = `Estimado(a) *${compradorNombre}*,\n\nLe saludamos de *MAKIMPORT Venezuela*. Adjuntamos la información del *Contrato de Adjudicación y Compra-Venta* generado para su equipo:\n\n*Detalles del Equipo:*\n- *Maquinaria:* ${item.brand} ${item.model}\n- *Serial/VIN:* ${item.serialNumber}\n- *Monto de Adjudicación:* $${getMontoFinal().toLocaleString()} USD\n- *Puerto de Destino:* ${compradorDestino}\n\nHemos enviado una copia detallada a su correo electrónico: *${compradorEmail}*.\n\nPor favor, confirme su recepción para coordinar los próximos pasos administrativos.`;
    
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-white font-extrabold text-sm sm:text-base">
            <FileSignature className="w-5 h-5 text-orange-500" />
            <span>Generador de Contrato de Venta</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-850/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`p-3 text-center text-xs font-bold ${
            toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-300 border-b border-emerald-500/30' : 'bg-red-950/90 text-red-300 border-b border-red-500/30'
          }`}>
            {toast.message}
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Machine Summary Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">🏗️ Especificaciones del Equipo Adjudicado</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 block">Equipo:</span>
                <span className="font-bold text-white truncate block">{item.brand} {item.model}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Serial / VIN:</span>
                <span className="font-mono font-bold text-white block">{item.serialNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Monto Final:</span>
                <span className="font-mono font-bold text-amber-400 block">${getMontoFinal().toLocaleString()} USD</span>
              </div>
              <div>
                <span className="text-slate-500 block">Operación:</span>
                <span className="font-bold text-orange-400 block uppercase">{item.status === 'auction' ? 'Subasta' : 'Compra Directa'}</span>
              </div>
            </div>
          </div>

          {/* Form Buyer Information */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>👤 Información Legal del Comprador</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nombres y Apellidos *</label>
                <input
                  type="text"
                  required
                  value={compradorNombre}
                  onChange={(e) => setCompradorNombre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  placeholder="Ej. Carlos Mendoza"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Cédula / RIF *</label>
                <input
                  type="text"
                  required
                  value={compradorCedula}
                  onChange={(e) => setCompradorCedula(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  placeholder="Ej. V-12345678 o J-30948201-4"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estado Civil</label>
                <select
                  value={compradorEstadoCivil}
                  onChange={(e) => setCompradorEstadoCivil(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Soltero(a)">Soltero(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viudo(a)">Viudo(a)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">WhatsApp / Teléfono *</label>
                <input
                  type="text"
                  required
                  value={compradorTelefono}
                  onChange={(e) => setCompradorTelefono(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  placeholder="Ej. +584121234567"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={compradorEmail}
                  onChange={(e) => setCompradorEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  placeholder="Ej. carlos@empresa.com"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ciudad *</label>
                <input
                  type="text"
                  required
                  value={compradorCiudad}
                  onChange={(e) => setCompradorCiudad(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  placeholder="Ej. Valencia"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estado *</label>
                <input
                  type="text"
                  required
                  value={compradorEstado}
                  onChange={(e) => setCompradorEstado(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  placeholder="Ej. Carabobo"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Puerto / Ciudad de Destino *</label>
                <input
                  type="text"
                  required
                  value={compradorDestino}
                  onChange={(e) => setCompradorDestino(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  placeholder="Ej. Puerto Cabello, VZLA"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Fecha del Contrato *</label>
                <input
                  type="date"
                  required
                  value={fechaContrato}
                  onChange={(e) => setFechaContrato(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleDownloadPDF}
            className="py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF</span>
          </button>

          <button
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingEmail ? (
              <span>Enviando...</span>
            ) : (
              <>
                <Mail className="w-4 h-4 text-orange-400" />
                <span>Enviar por Correo</span>
              </>
            )}
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="py-3 px-4 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Enviar por WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
};
