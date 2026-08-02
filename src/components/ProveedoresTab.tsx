'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Plus, Edit, Trash2, Search, MapPin, Phone, Instagram,
  MessageCircle, Copy, CheckCircle2, Send, ChevronDown, ChevronUp,
  Loader2, X, AlertTriangle, RefreshCw, Users, Megaphone, CheckSquare,
  Square, ExternalLink, Sparkles, Info,
} from 'lucide-react';
import { supabase, ProveedorDbRow } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

type Proveedor = ProveedorDbRow;

interface ProveedorForm {
  nombre_empresa: string;
  nombre_contacto: string;
  telefono: string;
  ubicacion: string;
  instagram: string;
  especialidad: string;
  notas: string;
}

const EMPTY_FORM: ProveedorForm = {
  nombre_empresa: '',
  nombre_contacto: '',
  telefono: '',
  ubicacion: '',
  instagram: '',
  especialidad: '',
  notas: '',
};

const PLANTILLA_DEFAULT =
  'Hola [Empresa], estoy buscando para cliente directo: [Modelo/Maquinaria]. ¿Tienen alguna disponible para revendedor? Favor enviar precio y fotos. Saludos, MAKIMPORT.';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatWANumber(raw: string): string {
  return raw.replace(/[\s\-().]/g, '');
}

function buildWALink(telefono: string, mensaje: string): string {
  const num = formatWANumber(telefono).replace('+', '');
  return `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`;
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold border
        ${ok
          ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-200'
          : 'bg-red-900/90 border-red-500/50 text-red-200'
        }`}
    >
      {ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
      {msg}
    </div>
  );
}

// ─── Modal Formulario ────────────────────────────────────────────────────────

interface ModalFormProps {
  isOpen: boolean;
  initial: ProveedorForm;
  editingId: string | null;
  onClose: () => void;
  onSaved: (p: Proveedor) => void;
}

function ProveedorModal({ isOpen, initial, editingId, onClose, onSaved }: ModalFormProps) {
  const [form, setForm] = useState<ProveedorForm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) { setForm(initial); setError(''); }
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const set = (k: keyof ProveedorForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre_empresa.trim()) { setError('El nombre de la empresa es obligatorio.'); return; }
    if (!form.telefono.trim()) { setError('El número de WhatsApp es obligatorio.'); return; }
    setSaving(true);
    setError('');

    const payload = {
      nombre_empresa: form.nombre_empresa.trim(),
      nombre_contacto: form.nombre_contacto.trim() || null,
      telefono: form.telefono.trim(),
      ubicacion: form.ubicacion.trim() || null,
      instagram: form.instagram.trim() || null,
      especialidad: form.especialidad.trim() || null,
      notas: form.notas.trim() || null,
    };

    try {
      let result: Proveedor | null = null;
      if (editingId) {
        const { data, error: err } = await supabase
          .from('proveedores')
          .update(payload)
          .eq('id', editingId)
          .select()
          .single();
        if (err) throw err;
        result = data as Proveedor;
      } else {
        const { data, error: err } = await supabase
          .from('proveedores')
          .insert(payload)
          .select()
          .single();
        if (err) throw err;
        result = data as Proveedor;
      }
      if (result) onSaved(result);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el proveedor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-500" />
            <h2 className="text-sm font-extrabold text-white">
              {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Nombre de la Empresa *</label>
            <input
              value={form.nombre_empresa}
              onChange={set('nombre_empresa')}
              placeholder="Ej: Maquinarias Carabobo C.A."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Nombre de Contacto</label>
            <input
              value={form.nombre_contacto}
              onChange={set('nombre_contacto')}
              placeholder="Ej: Juan Pérez"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              Número de WhatsApp * <span className="text-slate-600 font-normal">(formato internacional)</span>
            </label>
            <input
              value={form.telefono}
              onChange={set('telefono')}
              placeholder="Ej: +584146372782"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Estado / Ubicación</label>
            <input
              value={form.ubicacion}
              onChange={set('ubicacion')}
              placeholder="Ej: Carabobo, Valencia"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Instagram</label>
            <input
              value={form.instagram}
              onChange={set('instagram')}
              placeholder="Ej: @maquinariazulia"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Especialidad</label>
            <textarea
              value={form.especialidad}
              onChange={set('especialidad')}
              rows={2}
              placeholder="Ej: Repuestos, Excavadoras, Plantas Eléctricas"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Notas Internas</label>
            <textarea
              value={form.notas}
              onChange={set('notas')}
              rows={2}
              placeholder="Notas de uso interno del equipo MAKIMPORT"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/40 rounded-xl p-3 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-sm font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-extrabold shadow-lg shadow-orange-950 flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main ProveedoresTab ─────────────────────────────────────────────────────

export const ProveedoresTab: React.FC = () => {
  // ── CRUD state ──
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialForm, setInitialForm] = useState<ProveedorForm>(EMPTY_FORM);

  // ── WhatsApp Broadcast state ──
  const [broadcastOpen, setBroadcastOpen] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ──
  const fetchProveedores = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProveedores((data || []) as Proveedor[]);
    } catch (err: any) {
      showToast('Error al cargar proveedores: ' + (err?.message || err), false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProveedores(); }, [fetchProveedores]);

  // ── Filtered list ──
  const filtered = proveedores.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.nombre_empresa.toLowerCase().includes(q) ||
      (p.ubicacion || '').toLowerCase().includes(q) ||
      (p.especialidad || '').toLowerCase().includes(q) ||
      (p.nombre_contacto || '').toLowerCase().includes(q)
    );
  });

  // ── Open Add modal ──
  const handleAdd = () => {
    setEditingId(null);
    setInitialForm(EMPTY_FORM);
    setModalOpen(true);
  };

  // ── Open Edit modal ──
  const handleEdit = (p: Proveedor) => {
    setEditingId(p.id);
    setInitialForm({
      nombre_empresa: p.nombre_empresa,
      nombre_contacto: p.nombre_contacto || '',
      telefono: p.telefono,
      ubicacion: p.ubicacion || '',
      instagram: p.instagram || '',
      especialidad: p.especialidad || '',
      notas: p.notas || '',
    });
    setModalOpen(true);
  };

  // ── After save ──
  const handleSaved = (saved: Proveedor) => {
    setProveedores(prev => {
      const exists = prev.some(p => p.id === saved.id);
      return exists
        ? prev.map(p => p.id === saved.id ? saved : p)
        : [saved, ...prev];
    });
    showToast(editingId ? 'Proveedor actualizado.' : 'Proveedor agregado correctamente.');
  };

  // ── Delete ──
  const handleDelete = async (id: string, empresa: string) => {
    if (!window.confirm(`¿Eliminar a "${empresa}" de la base de datos?`)) return;
    try {
      const { error } = await supabase.from('proveedores').delete().eq('id', id);
      if (error) throw error;
      setProveedores(prev => prev.filter(p => p.id !== id));
      setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
      showToast('Proveedor eliminado.');
    } catch (err: any) {
      showToast('Error al eliminar: ' + (err?.message || err), false);
    }
  };

  // ── Selection helpers ──
  const toggleSelect = (id: string) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleAll = () => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(p => p.id)));
    }
  };

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  // ── Broadcast helpers ──
  const selectedProveedores = proveedores.filter(p => selected.has(p.id));

  const handleCopyNumbers = async () => {
    const nums = selectedProveedores.map(p => p.telefono).join(', ');
    try {
      await navigator.clipboard.writeText(nums);
      setCopied(true);
      showToast(`${selectedProveedores.length} número(s) copiados al portapapeles.`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('No se pudo copiar al portapapeles.', false);
    }
  };

  const handleOpenAll = () => {
    if (!mensaje.trim()) { showToast('Redacta un mensaje antes de enviar.', false); return; }
    if (selectedProveedores.length === 0) { showToast('Selecciona al menos un proveedor.', false); return; }
    showToast(`Abriendo ${selectedProveedores.length} chat(s) de WhatsApp... Permite los popups en tu navegador.`);
    selectedProveedores.forEach((p, i) => {
      setTimeout(() => {
        window.open(
          buildWALink(p.telefono, mensaje.replace('[Empresa]', p.nombre_empresa)),
          '_blank'
        );
      }, i * 700);
    });
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header + Search ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Red de Proveedores</h2>
              <p className="text-xs text-slate-400">
                {proveedores.length} proveedor{proveedores.length !== 1 ? 'es' : ''} registrado{proveedores.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchProveedores}
              className="p-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
              title="Recargar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-950 transition-all"
            >
              <Plus className="w-4 h-4" />
              Agregar Proveedor
            </button>
          </div>
        </div>

        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por empresa, ubicación, especialidad o contacto..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/60 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Tabla de Proveedores ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
          <div className="flex items-center gap-3">
            <button onClick={toggleAll} className="text-slate-400 hover:text-white transition-colors" title="Seleccionar todos">
              {allSelected
                ? <CheckSquare className="w-4 h-4 text-orange-500" />
                : <Square className="w-4 h-4" />}
            </button>
            <span>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              {selected.size > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-600/20 border border-orange-500/30 text-orange-300">
                  {selected.size} seleccionado{selected.size !== 1 ? 's' : ''}
                </span>
              )}
            </span>
          </div>
          <span className="text-slate-600">Distribuidores Venezuela</span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            <span className="text-sm">Cargando proveedores...</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
            <Users className="w-10 h-10 opacity-30" />
            <p className="text-sm font-bold">
              {searchQuery ? 'No hay resultados para tu búsqueda.' : 'No hay proveedores registrados aún.'}
            </p>
            {!searchQuery && (
              <button onClick={handleAdd} className="text-xs text-orange-400 hover:underline flex items-center gap-1 mt-1">
                <Plus className="w-3 h-3" /> Agregar el primero
              </button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="divide-y divide-slate-800/80">
            {filtered.map(p => (
              <div
                key={p.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row gap-4 hover:bg-slate-950/40 transition-colors ${
                  selected.has(p.id) ? 'bg-orange-950/10 border-l-2 border-orange-500' : ''
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleSelect(p.id)}
                    className="mt-0.5 shrink-0 text-slate-500 hover:text-orange-400 transition-colors"
                  >
                    {selected.has(p.id)
                      ? <CheckSquare className="w-4 h-4 text-orange-500" />
                      : <Square className="w-4 h-4" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-white truncate">{p.nombre_empresa}</span>
                      {p.especialidad && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400 truncate max-w-[200px]">
                          {p.especialidad}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                      {p.nombre_contacto && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-600" />
                          {p.nombre_contacto}
                        </span>
                      )}
                      {p.ubicacion && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-600" />
                          {p.ubicacion}
                        </span>
                      )}
                      {p.instagram && (
                        <span className="flex items-center gap-1">
                          <Instagram className="w-3 h-3 text-pink-500/70" />
                          <span className="text-pink-400/80">{p.instagram}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-mono text-emerald-400/80">
                        <Phone className="w-3 h-3 text-slate-600" />
                        {p.telefono}
                      </span>
                    </div>

                    {p.notas && (
                      <p className="mt-1 text-[11px] text-slate-600 italic truncate">📝 {p.notas}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <a
                    href={buildWALink(p.telefono, (mensaje || PLANTILLA_DEFAULT).replace('[Empresa]', p.nombre_empresa))}
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir WhatsApp"
                    className="p-2 rounded-xl bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleEdit(p)}
                    title="Editar"
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(p.id, p.nombre_empresa)}
                    title="Eliminar"
                    className="p-2 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400 hover:bg-red-900 hover:text-red-200 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Difusión por WhatsApp ── */}
      <div className="bg-slate-900 border border-amber-500/20 rounded-2xl shadow-xl overflow-hidden">
        <button
          onClick={() => setBroadcastOpen(o => !o)}
          className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-extrabold text-white">Difusión de Requerimiento</h2>
              <p className="text-xs text-slate-400">Envía solicitudes de cotización masivas por WhatsApp</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            {selected.size > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-600/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                {selected.size} seleccionado{selected.size !== 1 ? 's' : ''}
              </span>
            )}
            {broadcastOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {broadcastOpen && (
          <div className="p-5 space-y-5 border-t border-slate-800">

            {/* Área de mensaje */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300">Mensaje de Solicitud</label>
                <button
                  onClick={() => setMensaje(PLANTILLA_DEFAULT)}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400/50 bg-amber-950/20 rounded-lg px-2.5 py-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  Usar Plantilla
                </button>
              </div>
              <textarea
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                rows={4}
                placeholder={PLANTILLA_DEFAULT}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors resize-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-600 mt-1.5 flex items-start gap-1">
                <Info className="w-3 h-3 shrink-0 mt-0.5" />
                Usa{' '}
                <code className="text-amber-400/80 mx-1">[Empresa]</code>
                como variable: se reemplaza con el nombre del proveedor al enviar individualmente.
              </p>
            </div>

            {/* Botones de envío */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-amber-400" />
                Opciones de Envío — {selected.size} proveedor{selected.size !== 1 ? 'es' : ''} seleccionado{selected.size !== 1 ? 's' : ''}
              </p>

              {selected.size === 0 ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Selecciona proveedores en la tabla usando los checkboxes.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Copiar números */}
                  <button
                    onClick={handleCopyNumbers}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                      copied
                        ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? '¡Copiado!' : 'Copiar Números Seleccionados'}
                  </button>

                  {/* Abrir todos */}
                  <button
                    onClick={handleOpenAll}
                    disabled={!mensaje.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white text-sm font-bold shadow-lg shadow-emerald-950 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar a Todos ({selected.size})
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </button>
                </div>
              )}
            </div>

            {/* Preview cola de difusión */}
            {selected.size > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400">Proveedores en cola de difusión:</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedProveedores.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-amber-600/20 border border-amber-500/30 text-amber-400 text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.nombre_empresa}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{p.telefono}</p>
                        </div>
                      </div>
                      <a
                        href={buildWALink(p.telefono, (mensaje || PLANTILLA_DEFAULT).replace('[Empresa]', p.nombre_empresa))}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/30 border border-emerald-700/40 text-emerald-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 text-xs font-bold transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      <ProveedorModal
        isOpen={modalOpen}
        initial={initialForm}
        editingId={editingId}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />

      {/* Toast */}
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
};
