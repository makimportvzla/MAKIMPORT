'use client';

import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Plus, CheckCircle2, AlertCircle, Loader2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ImageUploaderProps {
  initialImages?: string[];
  onImagesChanged: (urls: string[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  initialImages = [],
  onImagesChanged,
}) => {
  const [images, setImages] = useState<string[]>(
    initialImages.length > 0
      ? initialImages
      : ['https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800']
  );
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setStorageError(null);
    const newUrls: string[] = [];
    let uploadFailures = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let uploadedPublicUrl: string | null = null;
      
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `machinery/${fileName}`;

        const { data, error } = await supabase.storage
          .from('machinery-photos')
          .upload(filePath, file, { upsert: true, cacheControl: '3600' });

        if (error) {
          uploadFailures++;
          console.warn('Storage upload error:', error.message);
        } else if (data) {
          const { data: publicUrlData } = supabase.storage
            .from('machinery-photos')
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            uploadedPublicUrl = publicUrlData.publicUrl;
          }
        }
      } catch (err: any) {
        uploadFailures++;
        console.warn('Storage upload exception:', err);
      }

      // Use uploaded public URL if successful, otherwise use local ObjectURL fallback
      if (uploadedPublicUrl) {
        newUrls.push(uploadedPublicUrl);
      } else {
        const previewUrl = URL.createObjectURL(file);
        newUrls.push(previewUrl);
      }
    }

    if (uploadFailures > 0) {
      setStorageError(
        `Aviso: No se pudo conectar directamente con el bucket 'machinery-photos' en Supabase. Se utilizarán previsualizaciones locales para la publicación.`
      );
    }

    const updated = [...images, ...newUrls];
    setImages(updated);
    onImagesChanged(updated);
    setUploading(false);
    e.target.value = '';
  };

  const handleAddCustomUrl = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    const updated = [...images, customUrlInput.trim()];
    setImages(updated);
    onImagesChanged(updated);
    setCustomUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    setImages(updated);
    onImagesChanged(updated);
  };

  return (
    <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-orange-500" />
          <span>Fotografías del Equipo ({images.length})</span>
        </label>
        <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          Bucket: machinery-photos
        </span>
      </div>

      {/* File Drop Area */}
      <div className="relative border-2 border-dashed border-slate-800 hover:border-orange-500/50 rounded-xl p-4 text-center bg-slate-900/50 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center space-y-1 pointer-events-none">
          <Upload className="w-6 h-6 text-orange-400" />
          <span className="text-xs font-bold text-white">Haz clic o arrastra fotos desde tu equipo</span>
          <span className="text-[10px] text-slate-500">Soporta JPG, PNG, WEBP (múltiples archivos)</span>
        </div>
      </div>

      {/* Uploading Status Indicator */}
      {uploading && (
        <div className="p-2.5 bg-orange-950/60 border border-orange-500/40 rounded-lg text-xs text-orange-300 font-semibold flex items-center justify-center gap-2 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
          <span>Subiendo fotos a Supabase Storage ('machinery-photos')...</span>
        </div>
      )}

      {/* Storage Warning/Error Alert */}
      {storageError && (
        <div className="p-2.5 bg-amber-950/60 border border-amber-500/40 rounded-lg text-xs text-amber-300 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{storageError}</span>
        </div>
      )}

      {/* External URL Fallback Input */}
      <div className="pt-1">
        <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
          <LinkIcon className="w-3 h-3 text-orange-400" />
          <span>Casilla Alternativa: Agregar URL directa de imagen externa</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={customUrlInput}
            onChange={(e) => setCustomUrlInput(e.target.value)}
            placeholder="Pega enlace de imagen (https://ejemplo.com/maquinaria.jpg)"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomUrl(e);
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddCustomUrl}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg shrink-0 border border-slate-700 transition-colors"
          >
            Añadir URL
          </button>
        </div>
      </div>

      {/* Thumbnail Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative group h-20 rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
              <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
              
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 rounded-full text-white transition-colors"
                title="Eliminar foto"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
