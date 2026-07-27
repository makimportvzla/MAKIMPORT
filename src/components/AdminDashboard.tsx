'use client';

import React, { useState, useEffect } from 'react';
import { MachineryItem } from '@/types/machinery';
import { ImageUploader } from './ImageUploader';
import { Gavel, CheckCircle2, Plus, Edit, Trash2, PauseCircle, PlayCircle, Users, LayoutDashboard, ShieldCheck, Phone, Mail, Clock, Search, MapPin, DollarSign, Calendar, AlertCircle, FileText, Send, ShoppingBag, RefreshCw, ExternalLink, Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminEditModal } from './AdminEditModal';

interface UserProfile {
  id: string;
  email: string;
  nombre_completo: string;
  cedula_rif: string;
  telefono: string;
  role: string;
  created_at: string;
}

interface PurchaseRequest {
  id: string;
  machinery_id: string;
  machinery_title: string;
  machinery_price: number;
  nombre: string;
  apellido: string;
  ciudad: string;
  email: string;
  telefono: string;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  created_at: string;
}

interface CustomRequest {
  id: string;
  marca: string;
  modelo: string;
  ano_minimo: number;
  puerto_destino: string;
  presupuesto_maximo: number;
  nombre: string;
  telefono: string;
  email: string;
  estado: string;
  created_at: string;
}

const INITIAL_DEMO_MACHINES: MachineryItem[] = [
  {
    id: 'cat-320d',
    name: 'Caterpillar 320D L',
    model: '320D L Tier 3',
    brand: 'Caterpillar',
    category: 'Excavadora',
    year: 2021,
    hours: 3450,
    origin: 'USA',
    location: 'Houston, TX - EE.UU.',
    destinationPort: 'Puerto Cabello, VZLA',
    status: 'auction',
    price: 68000,
    currentBid: 54500,
    minBidIncrement: 1000,
    bidsCount: 14,
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 18),
    images: ['https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800'],
    serialNumber: 'CAT0320DL098421',
    engineSpecs: 'Cat C6.4 ACERT (148 HP)',
    inspectionScore: 94,
    description: 'Excavadora hidrÃ¡ulica Caterpillar 320D L en excelente condiciÃ³n operativa.',
    financingAvailable: true
  },
  {
    id: 'komatsu-pc200',
    name: 'Komatsu PC200-8',
    model: 'PC200-8 Galerie',
    brand: 'Komatsu',
    category: 'Excavadora',
    year: 2020,
    hours: 2890,
    origin: 'China',
    location: 'Shanghai Port - China',
    destinationPort: 'Puerto Cabello, VZLA',
    status: 'auction',
    price: 59000,
    currentBid: 46200,
    minBidIncrement: 500,
    bidsCount: 9,
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 5),
    images: ['https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800'],
    serialNumber: 'KMTPC200-87421',
    engineSpecs: 'Komatsu SAA6D107E-1 (148 HP)',
    inspectionScore: 92,
    description: 'Komatsu PC200-8 probada en campo.',
    financingAvailable: true
  },
  {
    id: 'cat-d6t',
    name: 'Caterpillar D6T XL',
    model: 'D6T XL Dozer',
    brand: 'Caterpillar',
    category: 'Bulldozer',
    year: 2019,
    hours: 4120,
    origin: 'USA',
    location: 'Miami, FL - EE.UU.',
    destinationPort: 'La Guaira, VZLA',
    status: 'direct',
    price: 112000,
    images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800'],
    serialNumber: 'CATD6TXL003912',
    engineSpecs: 'Cat C9.3 ACERT (207 HP)',
    inspectionScore: 96,
    description: 'Tractor de Orugas CAT D6T XL.',
    financingAvailable: true
  }
];

const MOCK_PROFILES: UserProfile[] = [
  {
    id: 'p-1',
    nombre_completo: 'Constructora Oriente C.A. / Ing. Carlos Mendoza',
    cedula_rif: 'J-30948201-4',
    email: 'cmendoza@orienteca.com',
    telefono: '+584121234567',
    role: 'client',
    created_at: '2026-07-20'
  },
  {
    id: 'p-2',
    nombre_completo: 'Inversiones Industriales VZLA / Roberto Silva',
    cedula_rif: 'J-40192841-0',
    email: 'rsilva@inversionesind.com',
    telefono: '+584149876543',
    role: 'client',
    created_at: '2026-07-22'
  },
  {
    id: 'p-3',
    nombre_completo: 'Inversiones MAKIMPORT Admin',
    cedula_rif: 'J-50123984-2',
    email: 'makimportvzla@gmail.com',
    telefono: '+584120000000',
    role: 'admin',
    created_at: '2026-07-01'
  }
];

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'auctions' | 'users' | 'purchases' | 'custom'>('inventory');
  const [machines, setMachines] = useState<MachineryItem[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);

  // Form State for Add / Edit Machinery
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState<MachineryItem | null>(null);

  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Caterpillar');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<string>('Excavadora');
  const [year, setYear] = useState(2022);
  const [hours, setHours] = useState(2400);
  const [origin, setOrigin] = useState<'USA' | 'China' | 'Venezuela'>('USA');
  const [location, setLocation] = useState('Houston, TX - EE.UU.');
  const [isAuction, setIsAuction] = useState(false);
  const [priceDirect, setPriceDirect] = useState(65000);
  const [priceStartAuction, setPriceStartAuction] = useState(50000);
  const [auctionEndDate, setAuctionEndDate] = useState('2026-08-15T18:00');
  const [inspectionScore, setInspectionScore] = useState(94);
  const [description, setDescription] = useState('');
  const [financing, setFinancing] = useState(true);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800'
  ]);

  // Fetch Users & Machinery from Supabase and subscribe to updates
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        const { data: profs, error: profsError } = await supabase.from('profiles').select('*');
        if (!profsError && profs) {
          setUsersList(profs as UserProfile[]);
        } else {
          setUsersList([]);
        }

        const { data: machs, error: machsError } = await supabase.from('machinery').select('*').order('created_at', { ascending: false });
        if (!machsError && machs) {
          const converted: MachineryItem[] = machs.map((m: any) => ({
            id: m.id,
            name: m.titulo,
            model: m.modelo,
            brand: m.marca,
            category: m.categoria || 'Excavadora',
            year: m.ano,
            hours: m.horas_uso,
            origin: m.ubicacion_origen?.includes('China')
              ? 'China'
              : m.ubicacion_origen?.includes('VZLA') || m.ubicacion_origen?.includes('Venezuela')
              ? 'Venezuela'
              : 'USA',
            location: m.ubicacion_origen || 'Houston, TX',
            destinationPort: m.puerto_destino || 'Puerto Cabello, VZLA',
            status: m.es_subasta ? 'auction' : 'direct',
            price: Number(m.precio_compra_inmediata),
            currentBid: m.es_subasta ? Number(m.puja_actual || m.precio_inicial_subasta) : undefined,
            auctionEndsAt: m.fecha_fin_subasta ? new Date(m.fecha_fin_subasta) : undefined,
            images: Array.isArray(m.fotos_urls) && m.fotos_urls.length > 0 ? m.fotos_urls : ['https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800'],
            serialNumber: m.numero_serie || 'SN-' + (m.id ? m.id.substring(0, 6) : '001'),
            engineSpecs: 'Motor Diesel Industrial',
            inspectionScore: Number(m.inspeccion_general) || 94,
            description: m.condicion_detalles || '',
            financingAvailable: true,
            pdfReportUrl: m.pdf_reporte_url || undefined,
            inspeccionGeneral: Number(m.inspeccion_general) || 94,
            inspeccionMotor: Number(m.inspeccion_motor) || 95,
            inspeccionHidraulico: Number(m.inspeccion_hidraulico) || 92,
            inspeccionTransmision: Number(m.inspeccion_transmision) || 94,
            inspeccionCabina: Number(m.inspeccion_cabina) || 90,
            inspeccionCauchos: m.inspeccion_cauchos !== undefined && m.inspeccion_cauchos !== null ? Number(m.inspeccion_cauchos) : undefined,
            transitTime: m.tiempo_transito || '25-35 días'
          }));
          setMachines(converted);
        } else {
          setMachines([]);
        }
      } catch (err) {
        console.warn('Fallback a mock admin:', err);
        setMachines([]);
        setUsersList([]);
      }
    };

    fetchSupabaseData();

    const handleLocalCreate = (e: any) => {
      if (e.detail) {
        setMachines((prev) => {
          const exists = prev.some((item) => item.id === e.detail.id);
          if (exists) {
            return prev.map((item) => item.id === e.detail.id ? e.detail : item);
          }
          return [e.detail, ...prev];
        });
      }
    };
    window.addEventListener('machinery_created', handleLocalCreate);
    window.addEventListener('machinery_updated', handleLocalCreate);

    return () => {
      window.removeEventListener('machinery_created', handleLocalCreate);
      window.removeEventListener('machinery_updated', handleLocalCreate);
    };
  }, []);

  const fetchPurchaseRequests = async () => {
    setLoadingPurchases(true);
    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setPurchaseRequests(data as PurchaseRequest[]);
      }
    } catch (err) {
      console.warn('[AdminDashboard] Could not fetch purchase_requests:', err);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const fetchCustomRequests = async () => {
    setLoadingCustom(true);
    try {
      const { data, error } = await supabase
        .from('custom_machinery_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setCustomRequests(data as CustomRequest[]);
      }
    } catch (err) {
      console.warn('[AdminDashboard] Could not fetch custom_machinery_requests:', err);
    } finally {
      setLoadingCustom(false);
    }
  };

  useEffect(() => {
    // Always prefetch both lists on mount so badge counts show immediately
    fetchPurchaseRequests();
    fetchCustomRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'purchases') fetchPurchaseRequests();
    if (activeTab === 'custom')    fetchCustomRequests();
  }, [activeTab]);

  // Realtime: auto-refresh when new requests are inserted
  useEffect(() => {
    const purchaseCh = supabase
      .channel('admin-purchase-requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'purchase_requests' }, () => {
        fetchPurchaseRequests();
      })
      .subscribe();

    const customCh = supabase
      .channel('admin-custom-requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'custom_machinery_requests' }, () => {
        fetchCustomRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(purchaseCh);
      supabase.removeChannel(customCh);
    };
  }, []);

  const handleUpdatePurchaseStatus = async (id: string, estado: string) => {
    try {
      await supabase.from('purchase_requests').update({ estado }).eq('id', id);
      setPurchaseRequests((prev) => prev.map((r) => r.id === id ? { ...r, estado: estado as any } : r));
    } catch (err) {
      console.warn('Status update error:', err);
    }
  };

  const handleUpdateCustomStatus = async (id: string, estado: string) => {
    try {
      await supabase.from('custom_machinery_requests').update({ estado }).eq('id', id);
      setCustomRequests((prev) => prev.map((r) => r.id === id ? { ...r, estado } : r));
    } catch (err) {
      console.warn('Custom status update error:', err);
    }
  };

  const handleSaveMachine = async (e: React.FormEvent) => {
    e.preventDefault();

    const endDate = isAuction ? new Date(auctionEndDate) : undefined;
    const newItem: MachineryItem = {
      id: editingId || 'mach-' + Date.now(),
      name: title || `${brand} ${model}`,
      model: model || 'Heavy Duty',
      brand: brand,
      category: category as any,
      year: Number(year),
      hours: Number(hours),
      origin: origin as any,
      location: location,
      destinationPort: 'Puerto Cabello / La Guaira, VZLA',
      status: isAuction ? 'auction' : 'direct',
      price: Number(priceDirect),
      currentBid: isAuction ? Number(priceStartAuction) : undefined,
      auctionEndsAt: endDate,
      images: images,
      serialNumber: 'VIN-' + Math.floor(100000 + Math.random() * 900000),
      engineSpecs: 'Motor DiÃ©sel Industrial',
      inspectionScore: Number(inspectionScore),
      description: description || 'Maquinaria pesada certificada.',
      financingAvailable: financing
    };

    // Save to Supabase
    try {
      const { data, error } = await supabase.from('machinery').upsert({
        id: editingId || undefined,
        titulo: newItem.name,
        marca: newItem.brand,
        modelo: newItem.model,
        ano: newItem.year,
        horas_uso: newItem.hours,
        condicion_detalles: newItem.description,
        precio_compra_inmediata: newItem.price,
        es_subasta: isAuction,
        precio_inicial_subasta: isAuction ? newItem.currentBid : 0,
        puja_actual: isAuction ? newItem.currentBid : 0,
        fecha_fin_subasta: endDate ? endDate.toISOString() : null,
        fotos_urls: newItem.images,
        ubicacion_origen: newItem.location,
        
        categoria: newItem.category,
        numero_serie: newItem.serialNumber,
        inspeccion_general: newItem.inspectionScore,
        inspeccion_motor: 95,
        inspeccion_hidraulico: 92,
        inspeccion_transmision: 94,
        inspeccion_cabina: 90,
        puerto_destino: newItem.destinationPort || 'Puerto Cabello, VZLA',
        tiempo_transito: '25-35 días'
      }).select();

      if (error) {
        alert(`Error al guardar en Supabase: ${error.message}`);
      } else if (data && data[0]) {
        newItem.id = data[0].id;
      }
    } catch (err: any) {
      console.warn('Upsert fallback local:', err);
    }

    if (editingId) {
      setMachines((prev) => prev.map((m) => (m.id === editingId ? newItem : m)));
    } else {
      setMachines((prev) => [newItem, ...prev]);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('machinery_created', { detail: newItem }));
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleDeleteMachine = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación de la plataforma?')) return;

    try {
      const { error } = await supabase.from('machinery').delete().eq('id', id);
      if (error) {
        alert(`Error al eliminar en Supabase: ${error.message}`);
        return;
      }
    } catch (err: any) {
      alert(`Error de conexión al eliminar: ${err.message || err}`);
      return;
    }

    setMachines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleToggleAuctionState = (id: string) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus = m.status === 'auction' ? 'direct' : 'auction';
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setModel('');
    setYear(2022);
    setHours(2400);
    setIsAuction(false);
    setPriceDirect(65000);
    setPriceStartAuction(50000);
    setDescription('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-500">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Panel de Administrador</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  Propietario / MAKIMPORT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                GestiÃ³n de Inventario, Control de Subastas en Tiempo Real y VerificaciÃ³n de Usuarios.
              </p>
            </div>
          </div>

          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-5 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-950 flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Nueva Maquinaria</span>
          </button>
        </div>

        {/* Tab Controls — responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate"><span className="hidden sm:inline">1. </span>Inventario</span>
          </button>

          <button
            onClick={() => setActiveTab('auctions')}
            className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'auctions'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gavel className="w-4 h-4 shrink-0" />
            <span className="truncate"><span className="hidden sm:inline">2. </span>Subastas</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate"><span className="hidden sm:inline">3. </span>Usuarios</span>
          </button>

          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'purchases'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">4. </span>Compras
              {purchaseRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-emerald-700 rounded-full text-[10px]">{purchaseRequests.length}</span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1 ${
              activeTab === 'custom'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">5. </span>Cotizaciones
              {customRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-orange-700 rounded-full text-[10px]">{customRequests.length}</span>
              )}
            </span>
          </button>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
                <span>CatÃ¡logo Publicado</span>
                <span>Total: {machines.length} equipos</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {machines.map((m) => (
                  <div key={m.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-slate-950/40 transition-colors">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img src={m.images[0]} alt={m.name} className="w-20 h-16 rounded-xl object-cover border border-slate-800 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-orange-400">{m.brand}</span>
                          <span className="text-xs text-slate-500">â€¢</span>
                          <span className="text-xs text-white font-bold">{m.name}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{m.model} | {m.year} | {m.hours.toLocaleString()} hrs</p>
                        <div className="flex items-center gap-2 mt-1">
                          {m.status === 'auction' ? (
                            <span className="px-2 py-0.5 rounded bg-orange-600/20 border border-orange-500/40 text-orange-300 text-[10px] font-bold">
                              Subasta Activa
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                              Compra Inmediata
                            </span>
                          )}
                          <span className="text-[11px] text-amber-400 font-mono font-bold">
                            ${(m.status === 'auction' ? m.currentBid || m.price : m.price).toLocaleString()} USD
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleToggleAuctionState(m.id)}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 font-bold"
                        title="Cambiar modalidad"
                      >
                        {m.status === 'auction' ? <PauseCircle className="w-4 h-4 text-orange-400" /> : <PlayCircle className="w-4 h-4 text-emerald-400" />}
                        <span className="hidden sm:inline">{m.status === 'auction' ? 'Pausar Subasta' : 'Activar Subasta'}</span>
                      </button>

                      <button
                        onClick={() => { setEditingMachine(m); setShowEditModal(true); }}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-900 transition-colors"
                        title="Editar maquinaria"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteMachine(m.id)}
                        className="p-2 rounded-lg bg-red-950/60 border border-red-800 text-red-300 hover:bg-red-900 transition-colors"
                        title="Eliminar maquinaria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE AUCTIONS MONITOR */}
        {activeTab === 'auctions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {machines.filter(m => m.status === 'auction').map((m) => (
                <div key={m.id} className="bg-slate-900 border border-orange-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Gavel className="w-5 h-5 text-orange-500 animate-bounce" />
                      <span className="font-extrabold text-white text-sm">{m.name}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-orange-600 text-white font-extrabold text-[10px] uppercase">
                      {m.bidsCount || 12} Pujas
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block">Puja LÃ­der Actual:</span>
                      <span className="text-xl font-black text-amber-400 font-mono">${(m.currentBid || m.price).toLocaleString()} USD</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Usuario LÃ­der:</span>
                      <span className="font-bold text-slate-200 block truncate">Constructora ***0412</span>
                      <span className="text-[10px] text-slate-400">+58 (412) 123-4567</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <a
                      href="https://wa.me/584121234567?text=Hola,%20te%20contactamos%20de%20MAKIMPORT%20sobre%20tu%20puja%20l%C3%ADder."
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Contactar LÃ­der por WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: USERS & VERIFICATION TABLE */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Usuarios Registrados en Supabase Profiles</span>
              <span>Total: {usersList.length} registros</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">CÃ©dula / RIF</th>
                    <th className="p-4">Nombre / RazÃ³n Social</th>
                    <th className="p-4">Correo ElectrÃ³nico</th>
                    <th className="p-4">TelÃ©fono</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4 text-center">AcciÃ³n Directa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-950/40">
                      <td className="p-4 font-mono font-bold text-orange-400">{u.cedula_rif || 'N/A'}</td>
                      <td className="p-4 font-bold text-white">{u.nombre_completo || 'Usuario'}</td>
                      <td className="p-4 text-slate-300">{u.email || 'Sin correo'}</td>
                      <td className="p-4 font-mono text-slate-200">{u.telefono || 'Sin teléfono'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          (u.role || 'client') === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {(u.role || 'client').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <a
                          href={`https://wa.me/${(u.telefono || '').replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(u.nombre_completo || 'cliente')},%20te%20contactamos%20desde%20la%20administraci%C3%B3n%20de%20MAKIMPORT%20Venezuela.`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg inline-flex items-center gap-1 shadow-md"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL FORM: ADD / EDIT MACHINERY */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <span className="font-bold text-white text-sm">Publicar / Editar Maquinaria (Admin)</span>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                  âœ•
                </button>
              </div>

              <form onSubmit={handleSaveMachine} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">TÃ­tulo de la Maquinaria *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    placeholder="Ej. Caterpillar 320D L"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Categoría *</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white">
                      <option value="Excavadora">Excavadora</option>
                      <option value="Retroexcavadora">Retroexcavadora</option>
                      <option value="Cargador">Cargador Frontal</option>
                      <option value="Bulldozer">Bulldozer / Tractor</option>
                      <option value="Compactadora">Compactadora</option>
                      <option value="Trituradora">Trituradora</option>
                      <option value="Volteo">Camión de Volteo</option>
                      <option value="Grúa">Grúa Industrial</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Marca *</label>
                    <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white">
                      <option value="Caterpillar">Caterpillar</option>
                      <option value="Komatsu">Komatsu</option>
                      <option value="SANY">SANY</option>
                      <option value="XCMG">XCMG</option>
                      <option value="Volvo">Volvo</option>
                      <option value="JCB">JCB</option>
                      <option value="John Deere">John Deere</option>
                      <option value="Case">Case</option>
                      <option value="Hyundai">Hyundai</option>
                      <option value="Zoomlion">Zoomlion</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Modelo *</label>
                  <input type="text" required value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" placeholder="320D L" />
                </div>

                {/* Supabase Storage Image Uploader */}
                <ImageUploader
                  initialImages={images}
                  onImagesChanged={(urls) => setImages(urls)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">AÃ±o</label>
                    <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Horas Operativas</label>
                    <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" />
                  </div>
                </div>

                {/* Auction Settings */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <label className="flex items-center gap-2 font-bold text-white cursor-pointer">
                    <input type="checkbox" checked={isAuction} onChange={(e) => setIsAuction(e.target.checked)} className="rounded border-slate-700 text-orange-600" />
                    <span>Publicar como SUBASTA EN VIVO</span>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Precio Compra Inmediata (USD)</label>
                      <input type="number" value={priceDirect} onChange={(e) => setPriceDirect(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-bold" />
                    </div>
                    {isAuction && (
                      <div>
                        <label className="block text-slate-400 mb-1">Precio Inicial Subasta (USD)</label>
                        <input type="number" value={priceStartAuction} onChange={(e) => setPriceStartAuction(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-orange-400 font-bold" />
                      </div>
                    )}
                  </div>

                  {isAuction && (
                    <div>
                      <label className="block text-slate-400 mb-1">Fecha y Hora Exacta de Fin de Subasta</label>
                      <input
                        type="datetime-local"
                        value={auctionEndDate}
                        onChange={(e) => setAuctionEndDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Detalles de CondiciÃ³n e InspecciÃ³n</label>
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" placeholder="Motor, bombas hidrÃ¡ulicas..." />
                </div>

                <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl shadow-lg">
                  Guardar y Publicar en MAKIMPORT
                </button>
              </form>

            </div>
          </div>
        )}

        {/* TAB 4: PURCHASE REQUESTS */}
        {activeTab === 'purchases' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Solicitudes de Compra Inmediata</span>
              <span>Total: {purchaseRequests.length} solicitudes</span>
            </div>

            <div className="p-0">
              {loadingPurchases ? (
                <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                  <span>Cargando solicitudes de compra...</span>
                </div>
              ) : purchaseRequests.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="text-slate-500 text-sm font-medium">No hay solicitudes de compra registradas aún.</p>
                  <p className="text-slate-600 text-xs">Cuando un cliente presione &quot;Solicitar Compra Inmediata&quot;, aparecerá aquí.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {purchaseRequests.map((req) => (
                    <div key={req.id} className="p-4 sm:p-5 hover:bg-slate-950/40 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Buyer Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-white">{req.nombre} {req.apellido}</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-orange-400" /> {req.ciudad}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              req.estado === 'pendiente' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' :
                              req.estado === 'en_proceso' ? 'bg-sky-500/20 border border-sky-500/40 text-sky-300' :
                              req.estado === 'completado' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' :
                              'bg-red-500/20 border border-red-500/40 text-red-300'
                            }`}>
                              {req.estado}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                            <a href={`mailto:${req.email}`} className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300">
                              <Mail className="w-3 h-3" /> {req.email}
                            </a>
                            <a href={`tel:${req.telefono}`} className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300">
                              <Phone className="w-3 h-3" /> {req.telefono}
                            </a>
                          </div>

                          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                            <span className="text-slate-400">Interesado en: </span>
                            <span className="text-white font-semibold">{req.machinery_title}</span>
                            <span className="text-amber-400 font-mono font-bold ml-2">${Number(req.machinery_price).toLocaleString()} USD</span>
                          </div>

                          <p className="text-[10px] text-slate-600 font-mono">
                            {new Date(req.created_at).toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                          <select
                            value={req.estado}
                            onChange={(e) => handleUpdatePurchaseStatus(req.id, e.target.value)}
                            className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="pendiente">🟡 Pendiente</option>
                            <option value="en_proceso">🔵 En Proceso</option>
                            <option value="completado">🟢 Completado</option>
                            <option value="cancelado">🔴 Cancelado</option>
                          </select>

                          <a
                            href={`https://t.me/makimportvzla?text=${encodeURIComponent(`Hola! Solicitud de compra de ${req.nombre} ${req.apellido} para: ${req.machinery_title} - $${Number(req.machinery_price).toLocaleString()} USD. Tel: ${req.telefono}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600 border border-sky-500/40 text-sky-300 hover:text-white rounded-lg text-xs font-bold transition-all"
                          >
                            <Send className="w-3 h-3" />
                            <span>Telegram</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>

                          <a
                            href={`mailto:${req.email}?subject=MAKIMPORT - Seguimiento solicitud de compra&body=Estimado/a ${req.nombre} ${req.apellido},%0A%0AGracias por su interés en ${req.machinery_title}.%0A%0AEn breve le contactaremos.%0A%0AMAKIMPORT Venezuela%0Amakimportvzla@gmail.com`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Responder</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOM MACHINERY REQUESTS / COTIZACIONES */}
        {activeTab === 'custom' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Encargos y Cotizaciones Personalizadas</span>
              <span>Total: {customRequests.length} solicitudes</span>
            </div>

            <div className="p-0">
              {loadingCustom ? (
                <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                  <span>Cargando solicitudes personalizadas...</span>
                </div>
              ) : customRequests.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Search className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="text-slate-500 text-sm font-medium">No hay cotizaciones solicitadas aún.</p>
                  <p className="text-slate-600 text-xs">Cuando un cliente solicite cotización, aparecerá aquí.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {customRequests.map((req) => (
                    <div key={req.id} className="p-4 sm:p-5 hover:bg-slate-950/40 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Custom Request Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-white">{req.nombre}</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-orange-400" /> {req.puerto_destino}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              req.estado === 'pendiente' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' :
                              req.estado === 'en_proceso' ? 'bg-sky-500/20 border border-sky-500/40 text-sky-300' :
                              req.estado === 'completado' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' :
                              'bg-red-500/20 border border-red-500/40 text-red-300'
                            }`}>
                              {req.estado}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                            <a href={`mailto:${req.email}`} className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300">
                              <Mail className="w-3 h-3" /> {req.email}
                            </a>
                            <a href={`tel:${req.telefono}`} className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300">
                              <Phone className="w-3 h-3" /> {req.telefono}
                            </a>
                          </div>

                          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1.5">
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Equipo deseado:</span>
                              <span className="text-amber-400 font-mono font-bold">Presupuesto Máx: ${Number(req.presupuesto_maximo).toLocaleString()} USD</span>
                            </div>
                            <p className="text-white text-sm font-bold">
                              {req.marca} {req.modelo} <span className="text-xs text-slate-400 font-normal">(Año mínimo: {req.ano_minimo})</span>
                            </p>
                          </div>

                          <p className="text-[10px] text-slate-600 font-mono">
                            {new Date(req.created_at).toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                          <select
                            value={req.estado}
                            onChange={(e) => handleUpdateCustomStatus(req.id, e.target.value)}
                            className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="pendiente">🟡 Pendiente</option>
                            <option value="en_proceso">🔵 En Proceso</option>
                            <option value="completado">🟢 Completado</option>
                            <option value="cancelado">🔴 Cancelado</option>
                          </select>

                          <a
                            href={`https://wa.me/${(req.telefono || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${req.nombre}, nos contactamos de MAKIMPORT en relación a tu cotización para un equipo ${req.marca} ${req.modelo}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-lg text-xs font-bold transition-all w-full justify-center"
                          >
                            <Phone className="w-3 h-3" />
                            <span>WhatsApp</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>

                          <a
                            href={`https://t.me/makimportvzla?text=${encodeURIComponent(`Hola! Solicitud de cotización de ${req.nombre} para un equipo ${req.marca} ${req.modelo} (${req.ano_minimo}) en ${req.puerto_destino}. Presupuesto: $${Number(req.presupuesto_maximo).toLocaleString()} USD.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600 border border-sky-500/40 text-sky-300 hover:text-white rounded-lg text-xs font-bold transition-all w-full justify-center"
                          >
                            <Send className="w-3 h-3" />
                            <span>Telegram</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {showEditModal && editingMachine && (
        <AdminEditModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setEditingMachine(null); }}
          machineryItem={editingMachine}
          onMachineryUpdated={(updatedItem) => {
            setMachines((prev) => prev.map((m) => m.id === updatedItem.id ? updatedItem : m));
          }}
        />
      )}
    </div>
  );
};
