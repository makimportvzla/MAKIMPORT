'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, PlayCircle, PauseCircle, Loader2, Save, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { CarouselBanner } from './HeroCarousel';

export const AdminBannersTab: React.FC = () => {
  const [banners, setBanners] = useState<CarouselBanner[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [orderNum, setOrderNum] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('carousel_banners')
        .select('*')
        .order('order', { ascending: true });
      if (error) throw error;
      setBanners(data || []);
    } catch (err: any) {
      console.error('Error fetching banners:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setLinkUrl('');
    setOrderNum(0);
    setIsActive(true);
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEditClick = (banner: CarouselBanner) => {
    setEditingId(banner.id);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setImageUrl(banner.image_url);
    setLinkUrl(banner.link_url || '');
    setOrderNum(banner.order);
    setIsActive(banner.is_active);
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `banners/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('machinery-photos')
        .upload(fileName, file, { upsert: true, cacheControl: '3600' });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('machinery-photos')
        .getPublicUrl(fileName);

      if (publicUrlData?.publicUrl) {
        setImageUrl(publicUrlData.publicUrl);
      }
    } catch (err: any) {
      alert('Error subiendo imagen a Supabase: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      alert('Por favor completa el título y carga una imagen.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        image_url: imageUrl.trim(),
        link_url: linkUrl.trim() || null,
        order: Number(orderNum) || 0,
        is_active: isActive,
      };

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('carousel_banners')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('carousel_banners')
          .insert(payload);
        if (error) throw error;
      }
      
      resetForm();
      fetchBanners();
    } catch (err: any) {
      alert('Error al guardar el banner: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este banner de forma permanente?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('carousel_banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchBanners();
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (banner: CarouselBanner) => {
    try {
      const { error } = await supabase
        .from('carousel_banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);
      if (error) throw error;
      fetchBanners();
    } catch (err: any) {
      alert('Error al alternar estado: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-white">Administrar Banners del Carrusel</h2>
          <p className="text-xs text-slate-400">Publica banners promocionales dinámicos en el Home de MAKIMPORT</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-orange-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Banner</span>
          </button>
        )}
      </div>

      {/* Editing Form Section */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {editingId ? 'Editar Banner Destacado' : 'Crear Nuevo Banner Destacado'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-slate-400 text-xs mb-1 font-medium">Título del Banner *</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. NUEVA EXCAVADORA SANY DISPONIBLE"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Link URL */}
            <div>
              <label className="block text-slate-400 text-xs mb-1 font-medium flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Ruta o Enlace de Acción (URL)</span>
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Ej. /cotizacion-obra o #catalogo-marketplace"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            {/* Subtitle */}
            <div className="md:col-span-2">
              <label className="block text-slate-400 text-xs mb-1 font-medium">Subtítulo o Descripción Corta</label>
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ingresa los detalles o términos de la promoción en un par de líneas..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 h-16 resize-none"
              />
            </div>

            {/* Order & Active Switch */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-medium">Orden Numérico</label>
                <input
                  type="number"
                  value={orderNum}
                  onChange={(e) => setOrderNum(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex flex-col justify-center">
                <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">Visible en Home</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                  <span className="ml-2 text-xs font-medium text-slate-300">{isActive ? 'Activo' : 'Inactivo'}</span>
                </label>
              </div>
            </div>

            {/* Image Uploader & Preview */}
            <div className="space-y-2">
              <label className="block text-slate-400 text-xs mb-1 font-medium">Imagen del Banner *</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="banner-image-file"
                  />
                  <label
                    htmlFor="banner-image-file"
                    className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-950 border border-dashed border-slate-700 hover:border-orange-500/60 rounded-lg cursor-pointer text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                    <span>{uploading ? 'Subiendo imagen...' : 'Cargar archivo de imagen'}</span>
                  </label>
                </div>
                {uploading && <Loader2 className="w-5 h-5 animate-spin text-orange-400" />}
              </div>

              <div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="O pega una URL externa de imagen directa aquí"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              {imageUrl && (
                <div className="relative h-28 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                  <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-slate-400 text-[8px] font-mono px-2 py-0.5 rounded truncate max-w-[200px]">
                    {imageUrl}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-orange-950/40 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Guardar Banner</span>
            </button>
          </div>
        </form>
      )}

      {/* Banners List Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
          <span>Banners Publicados ({banners.length})</span>
        </div>

        {loading && banners.length === 0 ? (
          <div className="p-10 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            <span>Cargando banners...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            No hay banners en la base de datos. Se mostrarán los banners estáticos por defecto en el Home.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {banners.map((b) => (
              <div key={b.id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-slate-950/40 transition-colors">
                {/* Details */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-12 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                    <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{b.title}</span>
                      <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-750 text-slate-400 text-[9px] font-mono rounded">
                        Orden: {b.order}
                      </span>
                    </div>
                    {b.subtitle && <p className="text-[10px] text-slate-400 max-w-md line-clamp-1">{b.subtitle}</p>}
                    {b.link_url && <p className="text-[9px] text-slate-500 font-mono truncate max-w-sm">{b.link_url}</p>}
                  </div>
                </div>

                {/* Operations */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Active Toggle Button */}
                  <button
                    onClick={() => handleToggleActive(b)}
                    className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-[10px] font-bold ${
                      b.is_active
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:bg-slate-800/40'
                    }`}
                    title={b.is_active ? 'Hacer Inactivo' : 'Hacer Activo'}
                  >
                    {b.is_active ? (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Oculto</span>
                      </>
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleEditClick(b)}
                    className="p-1.5 bg-slate-950 border border-slate-850 hover:border-orange-500/50 text-slate-400 hover:text-white rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 bg-slate-950 border border-slate-850 hover:border-red-500/50 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
