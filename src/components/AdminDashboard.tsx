'use client';

import React, { useState, useEffect } from 'react';
import { MachineryItem } from '@/types/machinery';
import { ImageUploader } from './ImageUploader';
import { Gavel, CheckCircle2, Plus, Edit, Trash2, PauseCircle, PlayCircle, Users, LayoutDashboard, ShieldCheck, Phone, Mail, Clock, Search, MapPin, DollarSign, Calendar, AlertCircle, FileText, Send, ShoppingBag, RefreshCw, ExternalLink, Wrench, Building2, Instagram, MessageCircle, Copy, X, ChevronLeft, ChevronRight, HardHat, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminEditModal } from './AdminEditModal';
import { AdminDocumentModal } from './AdminDocumentModal';
import { ProveedoresTab } from './ProveedoresTab';

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
    description: 'Excavadora hidráulica Caterpillar 320D L en excelente condición operativa.',
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

interface RentalRequest {
  id: string;
  created_at: string;
  nombre_completo: string;
  telefono: string;
  email: string;
  estado: string;
  ciudad: string;
  industria: string;
  categoria_equipo: string;
  marca_preferida?: string;
  modelo_especificacion?: string;
  ano_deseado?: number;
  horas_maximas?: number;
  duracion_estimada: string;
  incluye_operador: boolean;
  modalidad_gastos: string;
  presupuesto_estimado?: number;
  notas_adicionales?: string;
  estado_solicitud: 'pendiente' | 'en_proceso' | 'cotizado';
}

interface OwnerMachinery {
  id: string;
  created_at: string;
  nombre_propietario: string;
  telefono: string;
  email: string | null;
  instagram: string | null;
  estado_base: string;
  ciudad_base: string;
  categoria_equipo: string;
  marca: string;
  modelo: string | null;
  ano: number | null;
  horas_uso: number | null;
  capacidad: string | null;
  tarifa_hora: number | null;
  tarifa_dia: number | null;
  incluye_operador: boolean;
  modalidad_disponible: string;
  disponible_desde: string | null;
  notas: string | null;
  estado: 'disponible' | 'ocupado' | 'mantenimiento';
  photos: string[] | null;
}

interface AdminDashboardProps {
  initialTab?: 'inventory' | 'auctions' | 'users' | 'purchases' | 'custom' | 'proveedores' | 'alquileres' | 'projectQuotes' | 'serviceApplications' | 'machineryPostulations';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'inventory' }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'auctions' | 'users' | 'purchases' | 'custom' | 'proveedores' | 'alquileres' | 'projectQuotes' | 'serviceApplications' | 'machineryPostulations'>(initialTab);
  const [machines, setMachines] = useState<MachineryItem[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [projectQuotes, setProjectQuotes] = useState<any[]>([]);
  const [serviceApplications, setServiceApplications] = useState<any[]>([]);
  const [machineryPostulations, setMachineryPostulations] = useState<any[]>([]);
  const [loadingPostulations, setLoadingPostulations] = useState(false);
  
  // Rental requests state
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(false);
  const [broadcastPrefill, setBroadcastPrefill] = useState('');

  // Owner machinery registry â€” for auto-matching
  const [ownerMachinery, setOwnerMachinery] = useState<OwnerMachinery[]>([]);
  const [loadingOwners, setLoadingOwners]   = useState(false);

  // Alquileres module: sub-tabs, search, delete/edit modals
  const [alquileresSubTab, setAlquileresSubTab] = useState<'solicitudes' | 'propietarios' | 'matches'>('solicitudes');
  const [alquileresSearch, setAlquileresSearch] = useState('');
  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; table: string; id: string; label: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Lightbox for owner photos
  const [lightbox, setLightbox] = useState<{ photos: string[]; idx: number } | null>(null);

  // Project Quotes — search, filter, selected detail
  const [projectQuotesSearch, setProjectQuotesSearch] = useState('');
  const [projectQuotesFilter, setProjectQuotesFilter] = useState('all');
  const [selectedProjectQuote, setSelectedProjectQuote] = useState<any>(null);

  // Service Applications — search, filter, selected detail
  const [servicesSearch, setServicesSearch] = useState('');
  const [servicesFilter, setServicesFilter] = useState('all');
  const [servicesCategory, setServicesCategory] = useState('all');
  const [selectedServiceApp, setSelectedServiceApp] = useState<any>(null);

  // Inline quick-edit for rental status / owner status
  const [editingRentalId, setEditingRentalId]     = useState<string | null>(null);
  const [editingOwnerStatus, setEditingOwnerStatus] = useState<{ id: string; estado: string } | null>(null);

  // Postulation approval modal state
  const [approvingPostulation, setApprovingPostulation] = useState<any | null>(null);
  const [appPrice, setAppPrice] = useState(0);
  const [appDestinationPort, setAppDestinationPort] = useState('Puerto Cabello, VZLA');
  const [appTransitTime, setAppTransitTime] = useState('25-35 días');
  const [appInspGeneral, setAppInspGeneral] = useState(85);
  const [appInspMotor, setAppInspMotor] = useState(85);
  const [appInspHydraulic, setAppInspHydraulic] = useState(85);
  const [appInspTransmission, setAppInspTransmission] = useState(85);
  const [appInspCabin, setAppInspCabin] = useState(85);
  const [appInspTires, setAppInspTires] = useState(85);
  const [approvingLoading, setApprovingLoading] = useState(false);
  const [expandedPostulationId, setExpandedPostulationId] = useState<string | null>(null);

  const [auctionLeaders, setAuctionLeaders] = useState<{[machineryId: string]: { userName: string; email: string; phone: string; amount: number }}>( {});

  // Fetch auction leaders/winners in real-time
  useEffect(() => {
    const fetchLeaders = async () => {
      const auctionMachs = machines.filter(m => m.status === 'auction' || !!m.auctionEndsAt);
      if (auctionMachs.length === 0) return;
      
      const leadersMap: any = {};
      for (const m of auctionMachs) {
        try {
          const { data: bidsData } = await supabase
            .from('bids')
            .select('amount, user_id')
            .eq('machinery_id', m.id)
            .order('amount', { ascending: false })
            .limit(1);
            
          const bidsList = Array.isArray(bidsData) ? bidsData : [];
          if (bidsList.length > 0) {
            const topBid = bidsList[0];
            const { data: profileData } = await supabase
              .from('profiles')
              .select('nombre_completo, email, telefono')
              .eq('id', topBid.user_id)
              .single();
              
            if (profileData) {
              leadersMap[m.id] = {
                userName: profileData.nombre_completo || 'Usuario Anónimo',
                email: profileData.email || '',
                phone: profileData.telefono || 'Sin teléfono',
                amount: Number(topBid.amount)
              };
            } else {
              leadersMap[m.id] = {
                userName: 'Usuario Sin Perfil',
                email: '',
                phone: 'Sin teléfono',
                amount: Number(topBid.amount)
              };
            }
          }
        } catch (e) {
          console.warn('Error fetching leader for machine:', m.id, e);
        }
      }
      setAuctionLeaders(leadersMap);
    };

    fetchLeaders();
  }, [machines]);

  // Contract Generation States
  const [selectedContractItem, setSelectedContractItem] = useState<MachineryItem | null>(null);
  const [selectedContractBuyer, setSelectedContractBuyer] = useState<{
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    ciudad?: string;
  } | undefined>(undefined);
  const [showContractModal, setShowContractModal] = useState(false);

  const handleOpenContract = (item: MachineryItem, buyer?: typeof selectedContractBuyer) => {
    setSelectedContractItem(item);
    setSelectedContractBuyer(buyer);
    setShowContractModal(true);
  };

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
  const [duenoNombre, setDuenoNombre] = useState('');
  const [duenoInstagram, setDuenoInstagram] = useState('');
  const [duenoTelefono, setDuenoTelefono] = useState('');

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
            currentBid: Number(m.puja_actual || m.precio_inicial_subasta || 0) || undefined,
            // Always preserve auctionEndsAt so we can detect closed auctions even if es_subasta=false
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
            transitTime: m.tiempo_transito || '25-35 días',
            duenoNombre: m.dueno_nombre || undefined,
            duenoInstagram: m.dueno_instagram || undefined,
            duenoTelefono: m.dueno_telefono || undefined
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

  const fetchRentalRequests = async () => {
    setLoadingRentals(true);
    try {
      const { data, error } = await supabase
        .from('rental_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setRentalRequests(data as RentalRequest[]);
      }
    } catch (err) {
      console.warn('[AdminDashboard] Could not fetch rental_requests:', err);
    } finally {
      setLoadingRentals(false);
    }
  };

  const fetchOwnerMachinery = async () => {
    setLoadingOwners(true);
    try {
      const { data, error } = await supabase
        .from('owner_machinery')
        .select('*')
        .eq('estado', 'disponible')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setOwnerMachinery(data as OwnerMachinery[]);
      }
    } catch (err) {
      console.warn('[AdminDashboard] Could not fetch owner_machinery:', err);
    } finally {
      setLoadingOwners(false);
    }
  };

  const [loadingProjectQuotes, setLoadingProjectQuotes] = useState(false);
  const [loadingServiceApplications, setLoadingServiceApplications] = useState(false);

  const fetchProjectQuotes = async () => {
    setLoadingProjectQuotes(true);
    try {
      const { data, error } = await supabase
        .from('project_quotes')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setProjectQuotes(data);
      }
    } catch (err) {
      console.warn('[AdminDashboard] Could not fetch project_quotes:', err);
    } finally {
      setLoadingProjectQuotes(false);
    }
  };

  const fetchServiceApplications = async () => {
    setLoadingServiceApplications(true);
    try {
      const { data, error } = await supabase
        .from('services_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setServiceApplications(data);
      }
    } catch (err) {
      console.warn('[AdminDashboard] Could not fetch services_applications:', err);
    } finally {
      setLoadingServiceApplications(false);
    }
  };

  const fetchMachineryPostulations = async () => {
    setLoadingPostulations(true);
    try {
      const { data, error } = await supabase
        .from('postulaciones_equipos')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setMachineryPostulations(data);
      }
    } catch (err) {
      console.warn('[AdminDashboard] Could not fetch postulaciones_equipos:', err);
    } finally {
      setLoadingPostulations(false);
    }
  };

  const handleUpdateProjectQuoteStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('project_quotes').update({ status }).eq('id', id);
      if (!error) {
        setProjectQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status: status as any } : q));
      }
    } catch (err) {
      console.warn('Project quote status update error:', err);
    }
  };

  const handleUpdateServiceApplicationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('services_applications').update({ status }).eq('id', id);
      if (!error) {
        setServiceApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: status as any } : a));
      }
    } catch (err) {
      console.warn('Service application status update error:', err);
    }
  };

  const handleUpdateRentalStatus = async (id: string, estado: string) => {
    try {
      await supabase.from('rental_requests').update({ estado_solicitud: estado }).eq('id', id);
      setRentalRequests((prev) => prev.map((r) => r.id === id ? { ...r, estado_solicitud: estado as any } : r));
    } catch (err) {
      console.warn('Rental status update error:', err);
    }
  };

  const handleUpdateOwnerStatus = async (id: string, estado: string) => {
    try {
      await supabase.from('owner_machinery').update({ estado }).eq('id', id);
      setOwnerMachinery((prev) => prev.map((o) => o.id === id ? { ...o, estado: estado as any } : o));
      setEditingOwnerStatus(null);
    } catch (err) {
      console.warn('Owner status update error:', err);
    }
  };

  useEffect(() => {
    // Always prefetch all lists on mount so badge counts show immediately
    fetchPurchaseRequests();
    fetchCustomRequests();
    fetchRentalRequests();
    fetchOwnerMachinery();
    fetchProjectQuotes();
    fetchServiceApplications();
    fetchMachineryPostulations();
  }, []);

  useEffect(() => {
    if (activeTab === 'purchases')   fetchPurchaseRequests();
    if (activeTab === 'custom')      fetchCustomRequests();
    if (activeTab === 'alquileres')  { fetchRentalRequests(); fetchOwnerMachinery(); }
    if (activeTab === 'projectQuotes') fetchProjectQuotes();
    if (activeTab === 'serviceApplications') fetchServiceApplications();
    if (activeTab === 'machineryPostulations') fetchMachineryPostulations();
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

    const rentalCh = supabase
      .channel('admin-rental-requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rental_requests' }, () => {
        fetchRentalRequests();
      })
      .subscribe();

    const ownerCh = supabase
      .channel('admin-owner-machinery')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'owner_machinery' }, () => {
        fetchOwnerMachinery();
      })
      .subscribe();

    const quotesCh = supabase
      .channel('admin-project-quotes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_quotes' }, () => {
        fetchProjectQuotes();
      })
      .subscribe();

    const servicesCh = supabase
      .channel('admin-services-applications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services_applications' }, () => {
        fetchServiceApplications();
      })
      .subscribe();

    const postulacionesCh = supabase
      .channel('admin-postulaciones-equipos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'postulaciones_equipos' }, () => {
        fetchMachineryPostulations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(purchaseCh);
      supabase.removeChannel(customCh);
      supabase.removeChannel(rentalCh);
      supabase.removeChannel(ownerCh);
      supabase.removeChannel(quotesCh);
      supabase.removeChannel(servicesCh);
      supabase.removeChannel(postulacionesCh);
    };
  }, []);


  const handleDeleteRecord = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      const { error } = await supabase.from(deleteConfirm.table as any).delete().eq('id', deleteConfirm.id);
      if (error) {
        alert(`No se pudo eliminar el registro en la base de datos: ${error.message || error.details}`);
      } else {
        if (deleteConfirm.table === 'rental_requests') {
          setRentalRequests((prev) => prev.filter((r) => r.id !== deleteConfirm.id));
        } else if (deleteConfirm.table === 'owner_machinery') {
          setOwnerMachinery((prev) => prev.filter((o) => o.id !== deleteConfirm.id));
        } else if (deleteConfirm.table === 'project_quotes') {
          setProjectQuotes((prev) => prev.filter((q) => q.id !== deleteConfirm.id));
        } else if (deleteConfirm.table === 'services_applications') {
          setServiceApplications((prev) => prev.filter((s) => s.id !== deleteConfirm.id));
        }
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.warn('Delete error:', err);
      alert('Ocurrió un error inesperado al intentar eliminar.');
    } finally {
      setDeleteLoading(false);
    }
  };

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
      engineSpecs: 'Motor Diésel Industrial',
      inspectionScore: Number(inspectionScore),
      description: description || 'Maquinaria pesada certificada.',
      financingAvailable: financing,
      duenoNombre: duenoNombre.trim() || undefined,
      duenoInstagram: duenoInstagram.trim() || undefined,
      duenoTelefono: duenoTelefono.trim() || undefined
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
        tiempo_transito: '25-35 días',
        dueno_nombre: duenoNombre.trim() || null,
        dueno_instagram: duenoInstagram.trim() || null,
        dueno_telefono: duenoTelefono.trim() || null
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
      // 1. Delete corresponding postulation if any
      await supabase.from('postulaciones_equipos').delete().eq('machinery_id', id);

      // 2. Delete the machinery itself
      const { error } = await supabase.from('machinery').delete().eq('id', id);
      if (error) {
        alert(`Error al eliminar en Supabase: ${error.message}`);
        return;
      }

      // 3. Update local state for both postulations and machines
      setMachineryPostulations((prev) => prev.filter((p) => p.machinery_id !== id));
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
    setDuenoNombre('');
    setDuenoInstagram('');
    setDuenoTelefono('');
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
                Gestión de Inventario, Control de Subastas en Tiempo Real y Verificación de Usuarios.
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
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-10 gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">Inventario</span>
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
            <span className="truncate">Subastas</span>
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
            <span className="truncate">Usuarios</span>
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
              Compras
              {purchaseRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-emerald-700 rounded-full text-[10px]">{purchaseRequests.length}</span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Cotizaciones
              {customRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-orange-700 rounded-full text-[10px]">{customRequests.length}</span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('proveedores')}
            className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'proveedores'
                ? 'bg-emerald-700 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Proveedores</span>
          </button>

          <button
            onClick={() => setActiveTab('alquileres')}
            className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'alquileres'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Alquileres
              {rentalRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-orange-700 rounded-full text-[10px]">{rentalRequests.length}</span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('projectQuotes')}
            className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'projectQuotes'
                ? 'bg-emerald-705 bg-emerald-700 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HardHat className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Obras
              {projectQuotes.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-emerald-850 bg-emerald-800 rounded-full text-[10px]">{projectQuotes.length}</span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('serviceApplications')}
            className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'serviceApplications'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Postulaciones
              {serviceApplications.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-orange-700 rounded-full text-[10px]">{serviceApplications.length}</span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('machineryPostulations')}
            className={`py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'machineryPostulations'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Tag className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Equipos a Vender
              {machineryPostulations.filter(p => p.estado === 'Pendiente de Revisión').length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-700 rounded-full text-[10px]">{machineryPostulations.filter(p => p.estado === 'Pendiente de Revisión').length}</span>
              )}
            </span>
          </button>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Catálogo Publicado</span>
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
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-white font-bold">{m.name}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{m.model} | {m.year} | {m.hours.toLocaleString()} hrs</p>
                        <div className="flex items-center gap-2 mt-1">
                          {(() => {
                            const mWasAuction = !!m.auctionEndsAt;
                            const mEndDate = m.auctionEndsAt instanceof Date ? m.auctionEndsAt : m.auctionEndsAt ? new Date(m.auctionEndsAt) : null;
                            const mIsExpired = mWasAuction && mEndDate && !isNaN(mEndDate.getTime()) && mEndDate.getTime() <= Date.now();
                            if (mIsExpired) return (
                              <span className="px-2 py-0.5 rounded bg-red-900/30 border border-red-700/40 text-red-300 text-[10px] font-bold">
                                Subasta Cerrada
                              </span>
                            );
                            if (m.status === 'auction') return (
                              <span className="px-2 py-0.5 rounded bg-orange-600/20 border border-orange-500/40 text-orange-300 text-[10px] font-bold">
                                Subasta Activa
                              </span>
                            );
                            return (
                              <span className="px-2 py-0.5 rounded bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                                Compra Inmediata
                              </span>
                            );
                          })()}
                          <span className="text-[11px] text-amber-400 font-mono font-bold">
                            ${(() => {
                              const mWasAuction = !!m.auctionEndsAt;
                              const mEndDate = m.auctionEndsAt instanceof Date ? m.auctionEndsAt : m.auctionEndsAt ? new Date(m.auctionEndsAt) : null;
                              const mIsExpired = mWasAuction && mEndDate && !isNaN(mEndDate.getTime()) && mEndDate.getTime() <= Date.now();
                              // Closed auction: show final winning bid; Active auction: show current bid; Direct: show price
                              if (mIsExpired) return (m.currentBid || 0).toLocaleString();
                              if (m.status === 'auction') return (m.currentBid || m.price).toLocaleString();
                              return m.price.toLocaleString();
                            })()} USD
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Proveedor Directo Info */}
                    <div className="flex flex-col items-start sm:items-center text-xs space-y-1 bg-slate-950/50 border border-slate-800/80 rounded-xl p-2 min-w-[200px] max-w-[240px] w-full shrink-0">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ðŸ”’ Proveedor Directo</span>
                      {m.duenoNombre ? (
                        <div className="space-y-1 w-full text-center">
                          <p className="text-white font-bold truncate">{m.duenoNombre}</p>
                          <div className="flex items-center justify-center gap-2">
                            {m.duenoInstagram && (
                              <a
                                href={`https://instagram.com/${m.duenoInstagram.replace('@', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-pink-400 hover:text-pink-300 flex items-center gap-0.5 font-medium text-[11px]"
                              >
                                <Instagram className="w-3.5 h-3.5" />
                                <span>Instagram</span>
                              </a>
                            )}
                            {m.duenoTelefono && (
                              <a
                                href={`https://wa.me/${m.duenoTelefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, tengo un cliente interesado en tu ${m.name}`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 font-medium text-[11px]"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-[11px] py-1">Sin registrar</span>
                      )}
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
                        onClick={() => handleOpenContract(m)}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-orange-400 hover:text-orange-300 hover:bg-slate-900 transition-colors flex items-center gap-1 text-xs font-bold"
                        title="Generar contrato"
                      >
                        <FileText className="w-4 h-4 text-orange-500" />
                        <span className="hidden xl:inline">Contrato</span>
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
            {/* Summary counters */}
            {(() => {
              const activeAuctions = machines.filter(m => m.status === 'auction' && (() => {
                const ed = m.auctionEndsAt instanceof Date ? m.auctionEndsAt : m.auctionEndsAt ? new Date(m.auctionEndsAt) : null;
                return !ed || isNaN(ed.getTime()) || ed.getTime() > Date.now();
              })());
              const closedAuctions = machines.filter(m => {
                if (!m.auctionEndsAt) return false;
                const ed = m.auctionEndsAt instanceof Date ? m.auctionEndsAt : new Date(m.auctionEndsAt);
                return !isNaN(ed.getTime()) && ed.getTime() <= Date.now();
              });
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-900 border border-orange-500/30 rounded-xl p-4">
                    <span className="text-slate-400 block">Subastas en Curso</span>
                    <span className="text-2xl font-black text-orange-400">{activeAuctions.length}</span>
                  </div>
                  <div className="bg-slate-900 border border-red-700/30 rounded-xl p-4">
                    <span className="text-slate-400 block">Subastas Cerradas</span>
                    <span className="text-2xl font-black text-red-400">{closedAuctions.length}</span>
                  </div>
                  <div className="bg-slate-900 border border-emerald-700/30 rounded-xl p-4 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block">Valor Total Adjudicado</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      ${closedAuctions.reduce((acc, m) => acc + (m.currentBid || 0), 0).toLocaleString()} USD
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {machines
                .filter(m => m.status === 'auction' || !!m.auctionEndsAt)
                .map((m) => {
                  const mEndDate = m.auctionEndsAt instanceof Date ? m.auctionEndsAt : m.auctionEndsAt ? new Date(m.auctionEndsAt) : null;
                  const mIsClosed = !!mEndDate && !isNaN(mEndDate.getTime()) && mEndDate.getTime() <= Date.now();
                  const finalAmount = m.currentBid || 0;
                  const closedOnStr = mIsClosed && mEndDate ? mEndDate.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

                  return (
                    <div key={m.id} className={`bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-xl ${
                      mIsClosed ? 'border-red-700/30' : 'border-orange-500/30'
                    }`}>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Gavel className={`w-5 h-5 ${mIsClosed ? 'text-red-400' : 'text-orange-500 animate-bounce'}`} />
                          <span className="font-extrabold text-white text-sm truncate">{m.name}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded font-extrabold text-[10px] uppercase ${
                          mIsClosed
                            ? 'bg-red-900/50 border border-red-700/50 text-red-300'
                            : 'bg-orange-600 text-white'
                        }`}>
                          {mIsClosed ? 'CERRADA' : `${m.bidsCount || 0} Pujas`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-slate-500 block">{mIsClosed ? 'Monto Final Adjudicado:' : 'Puja Líder Actual:'}</span>
                          <span className={`text-xl font-black font-mono ${ mIsClosed ? 'text-red-400' : 'text-amber-400'}`}>
                            ${(mIsClosed ? finalAmount : (m.currentBid || m.price)).toLocaleString()} USD
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">{mIsClosed ? 'Cerrada el:' : 'Cierra el:'}</span>
                          <span className="font-bold text-slate-200 block truncate text-[11px]">
                            {closedOnStr || (mEndDate ? mEndDate.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha')}
                          </span>
                          {!mIsClosed && (
                            <span className="text-[10px] text-orange-400 font-mono">
                              {mEndDate && !isNaN(mEndDate.getTime()) ? (() => {
                                const diff = mEndDate.getTime() - Date.now();
                                if (diff <= 0) return 'Finalizando...';
                                const h = Math.floor(diff / 3600000);
                                const min = Math.floor((diff % 3600000) / 60000);
                                return `${h}h ${min}m restantes`;
                              })() : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Winner / Leader Profile info */}
                      {(() => {
                        const leader = auctionLeaders[m.id];
                        if (leader) {
                          return (
                            <div className={`p-3 rounded-xl border text-xs ${mIsClosed ? 'bg-red-950/20 border-red-900/30' : 'bg-slate-950 border-slate-800'}`}>
                              <span className="text-slate-500 block uppercase text-[9px] font-bold tracking-wider mb-1">
                                {mIsClosed ? 'Ganador de la Subasta Adjudicada' : 'Postor Líder Actual'}
                              </span>
                              <div className="flex justify-between items-center gap-2">
                                <div>
                                  <span className="font-extrabold text-white block text-sm">{leader.userName}</span>
                                  <span className="text-slate-400 block text-[11px] font-mono mt-0.5">{leader.email || 'Sin correo registrado'}</span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="block font-bold text-orange-400 text-xs font-mono">{leader.phone}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-500 italic">
                            Sin ofertas registradas en esta subasta todavía.
                          </div>
                        );
                      })()}

                      {mIsClosed ? (
                        (() => {
                          const leader = auctionLeaders[m.id];
                          if (leader) {
                            return (
                              <div className="flex flex-col gap-2 pt-1">
                                <a
                                  href={`https://wa.me/${leader.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${leader.userName}! Te contactamos de MAKIMPORT sobre la adjudicación de la subasta para ${m.name}.`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>Contactar Ganador por WhatsApp</span>
                                </a>
                              </div>
                            );
                          }
                          return (
                            <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-3 text-xs text-red-300 font-bold flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>Subasta finalizada sin ofertas registradas.</span>
                            </div>
                          );
                        })()
                      ) : (
                        (() => {
                          const leader = auctionLeaders[m.id];
                          if (leader) {
                            return (
                              <div className="flex items-center justify-between text-xs pt-1">
                                <a
                                  href={`https://wa.me/${leader.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${leader.userName}! Te contactamos de MAKIMPORT en relación a tu puja líder para ${m.name}.`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>Contactar Postor Líder por WhatsApp</span>
                                </a>
                              </div>
                            );
                          }
                          return (
                            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-500 italic">
                              Subasta abierta sin pujas.
                            </div>
                          );
                        })()
                      )}
                    </div>
                  );
              })}
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
                    <th className="p-4">Cédula / RIF</th>
                    <th className="p-4">Nombre / Razón Social</th>
                    <th className="p-4">Correo Electrónico</th>
                    <th className="p-4">Teléfono</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4 text-center">Acción Directa</th>
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
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveMachine} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Título de la Maquinaria *</label>
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
                    <label className="block font-medium text-slate-300 mb-1">Año</label>
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
                  <label className="block font-medium text-slate-300 mb-1">Detalles de Condición e Inspección</label>
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" placeholder="Motor, bombas hidráulicas..." />
                </div>

                {/*ðŸ”’ Datos Privados del Proveedor / Dueño (Solo Admin) */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-orange-400">
                    <ShieldCheck className="w-4 h-4 text-orange-500" />
                    <span>ðŸ”’ Datos Privados del Proveedor / Dueño (Solo Admin)</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Nombre del Vendedor/Dueño</label>
                      <input
                        type="text"
                        value={duenoNombre}
                        onChange={(e) => setDuenoNombre(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        placeholder="Ej. Carlos Mendoza"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Instagram del Vendedor</label>
                      <input
                        type="text"
                        value={duenoInstagram}
                        onChange={(e) => setDuenoInstagram(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        placeholder="Ej. @maquinarias_valencia"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Teléfono / WhatsApp</label>
                      <input
                        type="text"
                        value={duenoTelefono}
                        onChange={(e) => setDuenoTelefono(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                        placeholder="Ej. +584141234567"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl shadow-lg">
                  Guardar y Publicar en MAKIMPORT
                </button>
              </form>

            </div>
          </div>
        )}

        {/* TAB 4: PURCHASE REQUESTS & ADJUDICATIONS */}
        {activeTab === 'purchases' && (
          <div className="space-y-8">
            {/* Direct Purchase Section */}
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
                              <span className="text-xs text-slate-500">â€¢</span>
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
                            <button
                              onClick={() => {
                                const matchingItem = machines.find(m => m.id === req.machinery_id) || {
                                  id: req.machinery_id,
                                  name: req.machinery_title,
                                  model: '',
                                  brand: '',
                                  category: 'Excavadora',
                                  year: 2022,
                                  hours: 0,
                                  origin: 'USA',
                                  location: 'No especificada',
                                  destinationPort: 'Puerto Cabello, VZLA',
                                  status: 'direct',
                                  price: req.machinery_price,
                                  images: [],
                                  serialNumber: 'VIN-PENDIENTE',
                                  engineSpecs: '',
                                  inspectionScore: 90,
                                  description: ''
                                } as MachineryItem;
                                handleOpenContract(matchingItem, {
                                  nombre: req.nombre,
                                  apellido: req.apellido,
                                  email: req.email,
                                  telefono: req.telefono,
                                  ciudad: req.ciudad
                                });
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600 border border-orange-500/40 text-orange-300 hover:text-white rounded-lg text-xs font-bold transition-all w-full justify-center"
                            >
                              <FileText className="w-3 h-3 text-orange-500" />
                              <span>Emitir Contrato</span>
                            </button>

                            <select
                              value={req.estado}
                              onChange={(e) => handleUpdatePurchaseStatus(req.id, e.target.value)}
                              className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 w-full"
                            >
                              <option value="pendiente">ðŸŸ¡ Pendiente</option>
                              <option value="en_proceso">ðŸ”µ En Proceso</option>
                              <option value="completado">ðŸŸ¢ Completado</option>
                              <option value="cancelado">ðŸ”´ Cancelado</option>
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

            {/* Adjudicated Auctions Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Subastas Adjudicadas (Finalizadas con Oferta)</span>
                <span>
                  Total: {
                    machines.filter(m => {
                      if (!m.auctionEndsAt) return false;
                      const ed = m.auctionEndsAt instanceof Date ? m.auctionEndsAt : new Date(m.auctionEndsAt);
                      return !isNaN(ed.getTime()) && ed.getTime() <= Date.now() && !!auctionLeaders[m.id];
                    }).length
                  } adjudicaciones
                </span>
              </div>

              <div className="p-0">
                {(() => {
                  const adjudicatedList = machines.filter(m => {
                    if (!m.auctionEndsAt) return false;
                    const ed = m.auctionEndsAt instanceof Date ? m.auctionEndsAt : new Date(m.auctionEndsAt);
                    return !isNaN(ed.getTime()) && ed.getTime() <= Date.now() && !!auctionLeaders[m.id];
                  });

                  if (adjudicatedList.length === 0) {
                    return (
                      <div className="p-12 text-center space-y-3">
                        <Gavel className="w-10 h-10 mx-auto text-slate-700" />
                        <p className="text-slate-500 text-sm font-medium">No hay subastas finalizadas con ganador aún.</p>
                        <p className="text-slate-600 text-xs">Las subastas cerradas que tengan al menos una puja líder se listarán automáticamente aquí.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="divide-y divide-slate-800/80">
                      {adjudicatedList.map((m) => {
                        const winner = auctionLeaders[m.id];
                        const mEndDate = m.auctionEndsAt instanceof Date ? m.auctionEndsAt : new Date(m.auctionEndsAt!);

                        return (
                          <div key={m.id} className="p-4 sm:p-5 hover:bg-slate-950/40 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-extrabold text-white">{winner.userName}</span>
                                  <span className="text-xs text-slate-500">â€¢</span>
                                  <span className="px-2 py-0.5 rounded bg-red-950/50 border border-red-800/40 text-red-400 text-[10px] font-bold uppercase tracking-wide">
                                    Adjudicado por Subasta
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                                  <a href={`mailto:${winner.email}`} className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300">
                                    <Mail className="w-3 h-3" /> {winner.email || 'Sin email'}
                                  </a>
                                  <a href={`tel:${winner.phone}`} className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300">
                                    <Phone className="w-3 h-3" /> {winner.phone}
                                  </a>
                                </div>

                                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                                  <span className="text-slate-400">Equipo adjudicado: </span>
                                  <span className="text-white font-semibold">{m.name} ({m.model})</span>
                                  <span className="text-amber-400 font-mono font-bold ml-2">Monto Final: ${winner.amount.toLocaleString()} USD</span>
                                </div>

                                <p className="text-[10px] text-slate-600 font-mono">
                                  Cerrada el: {mEndDate.toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                              </div>

                              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                                <button
                                  onClick={() => handleOpenContract(m, {
                                    nombre: winner.userName.split(' ')[0] || '',
                                    apellido: winner.userName.split(' ').slice(1).join(' ') || '',
                                    email: winner.email,
                                    telefono: winner.phone,
                                    ciudad: ''
                                  })}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600 border border-orange-500/40 text-orange-300 hover:text-white rounded-lg text-xs font-bold transition-all w-full justify-center"
                                >
                                  <FileText className="w-3 h-3 text-orange-400" />
                                  <span>Emitir Contrato</span>
                                </button>

                                <a
                                  href={`https://wa.me/${winner.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${winner.userName}! Te contactamos de MAKIMPORT en relación a la adjudicación del equipo ${m.name} por $${winner.amount.toLocaleString()} USD.`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-650 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-lg text-xs font-bold transition-all w-full justify-center"
                                >
                                  <Phone className="w-3 h-3 text-emerald-400" />
                                  <span>WhatsApp</span>
                                  <ExternalLink className="w-3 h-3 opacity-60" />
                                </a>

                                <a
                                  href={`mailto:${winner.email}?subject=MAKIMPORT - Adjudicación de Subasta Ganadora&body=Estimado/a ${winner.userName},%0A%0ANos complace informarle que ha resultado ganador de la subasta del equipo ${m.name} (${m.model}) con una oferta final de $${winner.amount.toLocaleString()} USD.%0A%0APor favor, responda a este correo para coordinar los detalles de pago y logística de entrega.%0A%0AAtentamente,%0AMAKIMPORT Venezuela`}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all w-full justify-center"
                                >
                                  <Mail className="w-3 h-3 text-orange-400" />
                                  <span>Enviar Correo</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
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
                            <span className="text-xs text-slate-500">â€¢</span>
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
                            <option value="pendiente">ðŸŸ¡ Pendiente</option>
                            <option value="en_proceso">ðŸ”µ En Proceso</option>
                            <option value="completado">ðŸŸ¢ Completado</option>
                            <option value="cancelado">ðŸ”´ Cancelado</option>
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

        {/* TAB 6: PROVEEDORES + DIFUSIÓN WHATSAPP */}
        {activeTab === 'proveedores' && (
          <ProveedoresTab initialMessage={broadcastPrefill} />
        )}

        {/* TAB 7: MÓDULO DE ALQUILERES — Sub-tabs */}
        {activeTab === 'alquileres' && (() => {
          // ── Scoring helper ──
          const computeMatches = (req: RentalRequest) =>
            ownerMachinery
              .map(owner => {
                let score = 0;
                const rc = (req.categoria_equipo || '').toLowerCase();
                const oc = (owner.categoria_equipo || '').toLowerCase();
                const rm = (req.marca_preferida || '').toLowerCase();
                const om = (owner.marca || '').toLowerCase();
                const re = (req.estado || '').toLowerCase();
                const oe = (owner.estado_base || '').toLowerCase();
                if (oc === rc) score += 3; else if (oc.includes(rc) || rc.includes(oc)) score += 2;
                if (rm && rm !== 'cualquier marca') { if (om.includes(rm) || rm.includes(om)) score += 2; } else score += 1;
                if (oe && re && (oe.includes(re) || re.includes(oe))) score += 1;
                return { owner, score };
              })
              .filter(m => m.score >= 2)
              .sort((a, b) => b.score - a.score)
              .slice(0, 5);

          // ── Search filter helpers ──
          const sq = alquileresSearch.toLowerCase();
          const filteredRentals = rentalRequests.filter(r =>
            !sq ||
            r.nombre_completo?.toLowerCase().includes(sq) ||
            r.categoria_equipo?.toLowerCase().includes(sq) ||
            r.estado?.toLowerCase().includes(sq) ||
            r.ciudad?.toLowerCase().includes(sq) ||
            r.telefono?.includes(sq)
          );
          const filteredOwners = ownerMachinery.filter(o =>
            !sq ||
            o.nombre_propietario?.toLowerCase().includes(sq) ||
            o.categoria_equipo?.toLowerCase().includes(sq) ||
            o.estado_base?.toLowerCase().includes(sq) ||
            o.ciudad_base?.toLowerCase().includes(sq) ||
            o.telefono?.includes(sq) ||
            o.marca?.toLowerCase().includes(sq)
          );

          // All matches across all active rental requests
          const allMatches: { req: RentalRequest; owner: OwnerMachinery; score: number }[] = [];
          rentalRequests.forEach(req => {
            computeMatches(req).forEach(({ owner, score }) => {
              allMatches.push({ req, owner, score });
            });
          });
          const filteredMatches = allMatches.filter(({ req, owner }) =>
            !sq ||
            req.nombre_completo?.toLowerCase().includes(sq) ||
            owner.nombre_propietario?.toLowerCase().includes(sq) ||
            req.categoria_equipo?.toLowerCase().includes(sq) ||
            owner.estado_base?.toLowerCase().includes(sq)
          );

          const SUB_TABS = [
            { key: 'solicitudes',  label: 'Solicitudes',           count: rentalRequests.length,  emoji: '📋' },
            { key: 'propietarios', label: 'Equipos / Propietarios', count: ownerMachinery.length,  emoji: '🏗️' },
            { key: 'matches',      label: 'Matches Automáticos',    count: allMatches.length,      emoji: '⚡' },
          ] as const;

          return (
            <div className="space-y-4">

              {/* ── Header bar: sub-tabs + search ── */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Sub-tabs */}
                  <div className="flex gap-1.5 flex-wrap">
                    {SUB_TABS.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setAlquileresSubTab(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          alquileresSubTab === tab.key
                            ? 'bg-orange-600 text-white shadow-md shadow-orange-950/30'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span>{tab.emoji}</span>
                        <span>{tab.label}</span>
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                          alquileresSubTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>{tab.count}</span>
                      </button>
                    ))}
                  </div>
                  {/* Search bar */}
                  <div className="relative flex-1 max-w-xs sm:max-w-[260px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={alquileresSearch}
                      onChange={e => setAlquileresSearch(e.target.value)}
                      placeholder="Buscar por nombre, equipo, estado..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                    {alquileresSearch && (
                      <button onClick={() => setAlquileresSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-xs">✕</button>
                    )}
                  </div>
                </div>

                {/* ══ SUB-TAB 1: SOLICITUDES ══ */}
                {alquileresSubTab === 'solicitudes' && (
                  <div>
                    {loadingRentals ? (
                      <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-orange-500" /><span>Cargando solicitudes...</span>
                      </div>
                    ) : filteredRentals.length === 0 ? (
                      <div className="p-12 text-center space-y-2">
                        <Clock className="w-10 h-10 mx-auto text-slate-700" />
                        <p className="text-slate-500 text-sm font-medium">{alquileresSearch ? 'Sin resultados para esa búsqueda.' : 'No hay solicitudes de alquiler aún.'}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/80">
                        {filteredRentals.map((req) => {
                          const reqDate       = new Date(req.created_at);
                          const opStr         = req.incluye_operador ? 'Con Operador' : 'Sin Operador';
                          const bmStr         = `${req.marca_preferida || 'Cualquier marca'} ${req.modelo_especificacion || ''}`.trim();
                          const broadcastText = `🚨 REQUERIMIENTO DE ALQUILER - MAKIMPORT\n\nBuscamos para cliente directo en ${req.ciudad}, ${req.estado}:\n- Equipo: ${req.categoria_equipo} - ${bmStr}\n- Duración: ${req.duracion_estimada}\n- Modalidad: ${opStr} | ${req.modalidad_gastos}\n- Trabajo: Sector ${req.industria}\n\n¿Tienes disponibilidad inmediata? Por favor enviar tarifa y ficha por privado.`;
                          const matches       = computeMatches(req);
                          const isEditing     = editingRentalId === req.id;

                          return (
                            <div key={req.id} className="p-4 sm:p-5 hover:bg-slate-950/40 transition-colors group">
                              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">

                                {/* ── Main Info ── */}
                                <div className="flex-1 min-w-0 space-y-3">
                                  {/* Header row */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-extrabold text-white">{req.nombre_completo}</span>
                                      <span className="text-slate-600">•</span>
                                      <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-orange-400" /> {req.ciudad}, {req.estado}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                        req.estado_solicitud === 'pendiente'  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                                        req.estado_solicitud === 'en_proceso' ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' :
                                        'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                      }`}>{req.estado_solicitud}</span>
                                      {matches.length > 0 && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600/20 border border-emerald-500/40 text-emerald-300">
                                          ⚡ {matches.length} match{matches.length > 1 ? 'es' : ''}
                                        </span>
                                      )}
                                    </div>
                                    {/* Edit / Delete action buttons */}
                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                      <button
                                        onClick={() => setEditingRentalId(isEditing ? null : req.id)}
                                        title="Editar estado"
                                        className="p-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/40 border border-sky-600/30 text-sky-400 transition-all"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm({ open: true, table: 'rental_requests', id: req.id, label: req.nombre_completo })}
                                        title="Eliminar solicitud"
                                        className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 text-red-400 transition-all"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Inline edit panel */}
                                  {isEditing && (
                                    <div className="p-3 bg-slate-950 border border-sky-700/40 rounded-xl flex items-center gap-3 flex-wrap">
                                      <label className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Cambiar estado:</label>
                                      {(['pendiente', 'en_proceso', 'cotizado'] as const).map(s => (
                                        <button
                                          key={s}
                                          onClick={() => { handleUpdateRentalStatus(req.id, s); setEditingRentalId(null); }}
                                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                                            req.estado_solicitud === s
                                              ? 'bg-orange-600 text-white border-orange-500'
                                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                          }`}
                                        >
                                          {s === 'pendiente' ? '🟡 Pendiente' : s === 'en_proceso' ? '🔵 En Proceso' : '🟢 Cotizado'}
                                        </button>
                                      ))}
                                      <button onClick={() => setEditingRentalId(null)} className="text-[10px] text-slate-500 hover:text-slate-300 ml-auto">✕ Cerrar</button>
                                    </div>
                                  )}

                                  {/* Structured Details Layout */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* 1. Datos del Cliente */}
                                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5">
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center gap-1">
                                        👤 Datos del Cliente
                                      </p>
                                      <div className="text-xs text-slate-300 space-y-1">
                                        <div><span className="text-slate-500">Nombre:</span> <strong className="text-white">{req.nombre_completo}</strong></div>
                                        <div><span className="text-slate-500">Teléfono:</span> <a href={`tel:${req.telefono}`} className="text-emerald-400 hover:underline">{req.telefono}</a></div>
                                        <div><span className="text-slate-500">Correo:</span> <a href={`mailto:${req.email}`} className="text-sky-400 hover:underline">{req.email}</a></div>
                                        <div><span className="text-slate-500">Ubicación/Obra:</span> <strong className="text-slate-200">{req.ciudad}, {req.estado}</strong></div>
                                      </div>
                                    </div>

                                    {/* 2. Requerimiento Técnico */}
                                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5">
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center gap-1">
                                        🔧 Requerimiento Técnico
                                      </p>
                                      <div className="text-xs text-slate-300 space-y-1">
                                        <div><span className="text-slate-500">Categoría:</span> <strong className="text-white">{req.categoria_equipo}</strong></div>
                                        <div><span className="text-slate-500">Marca/Modelo:</span> <strong className="text-white">{bmStr || 'No especificado'}</strong></div>
                                        <div><span className="text-slate-500">Año Deseado:</span> <strong className="text-slate-200">{req.ano_deseado ? `>= ${req.ano_deseado}` : 'Cualquiera'}</strong></div>
                                        <div><span className="text-slate-500">Uso Máximo:</span> <strong className="text-slate-200">{req.horas_maximas ? `${req.horas_maximas.toLocaleString()} Hrs/Km` : 'Sin límite'}</strong></div>
                                      </div>
                                    </div>

                                    {/* 3. Condiciones de Contrato */}
                                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5">
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center gap-1">
                                        📄 Condiciones de Contrato
                                      </p>
                                      <div className="text-xs text-slate-300 space-y-1">
                                        <div><span className="text-slate-500">Duración:</span> <strong className="text-slate-200">{req.duracion_estimada}</strong></div>
                                        <div><span className="text-slate-500">Operador:</span> <strong className="text-slate-200">{req.incluye_operador ? 'Sí, incluido' : 'No (Solo máquina)'}</strong></div>
                                        <div><span className="text-slate-500">Esquema Gastos:</span> <strong className="text-slate-200">{req.modalidad_gastos}</strong></div>
                                        <div><span className="text-slate-500">Presupuesto:</span> <strong className="text-emerald-400 font-mono">{req.presupuesto_estimado ? `$${req.presupuesto_estimado}/hr` : 'Abierto'}</strong></div>
                                      </div>
                                    </div>
                                  </div>

                                  {req.notas_adicionales && (
                                    <div className="text-[11px] text-slate-400 italic p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
                                      “{req.notas_adicionales}”
                                    </div>
                                  )}

                                  {/* Matches mini-preview */}
                                  {matches.length > 0 && (
                                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 overflow-hidden">
                                      <div className="px-3 py-2 bg-emerald-900/20 border-b border-emerald-500/20 text-[11px] font-black text-emerald-400 flex items-center justify-between">
                                        <span>⚡ {matches.length} MATCH{matches.length > 1 ? 'ES' : ''} AUTOMÁTICO{matches.length > 1 ? 'S' : ''} — propietarios en tu red</span>
                                        <span className="text-[9px] font-bold bg-emerald-800/40 px-1.5 py-0.5 rounded text-emerald-300">Coincidencia rápida</span>
                                      </div>
                                      <div className="divide-y divide-emerald-900/20">
                                        {matches.map(({ owner, score }) => {
                                          const lbl = score >= 5 ? '🟢 Alta' : score >= 3 ? '🟡 Media' : '🔵 Parcial';
                                          const waT = `Hola ${owner.nombre_propietario}, soy de MAKIMPORT. Tenemos un cliente buscando alquilar un ${req.categoria_equipo} en ${req.estado}. ¿Tu equipo (${owner.marca} ${owner.modelo || ''}) está disponible? Por favor envíame tarifa y condiciones. ¡Gracias!`;
                                          return (
                                            <div key={owner.id} className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-emerald-900/10 transition-colors">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                                                  <span className="font-bold text-white truncate">{owner.nombre_propietario}</span>
                                                  <span className="font-bold text-[10px]">{lbl}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                                  {owner.categoria_equipo} · {owner.marca} {owner.modelo || ''} · {owner.ciudad_base}, {owner.estado_base}
                                                  {owner.tarifa_hora && <span className="text-amber-300 font-mono ml-2">${owner.tarifa_hora}/hr</span>}
                                                </div>
                                              </div>
                                              <a href={`https://wa.me/${owner.telefono.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(waT)}`} target="_blank" rel="noreferrer"
                                                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black transition-all">
                                                <Phone className="w-3 h-3" /><span>Contactar</span>
                                              </a>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  <p className="text-[10px] text-slate-600 font-mono">
                                    Solicitado el: {reqDate.toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' })}
                                  </p>
                                </div>

                                {/* ── Action sidebar ── */}
                                <div className="flex flex-col gap-2.5 shrink-0 w-full lg:w-44">
                                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Estado</label>
                                  <select
                                    value={req.estado_solicitud}
                                    onChange={(e) => handleUpdateRentalStatus(req.id, e.target.value)}
                                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-orange-500 font-bold"
                                  >
                                    <option value="pendiente">🟡 Pendiente</option>
                                    <option value="en_proceso">🔵 En Proceso</option>
                                    <option value="cotizado">🟢 Cotizado</option>
                                  </select>
                                  <a href={`https://wa.me/${req.telefono.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(`Hola ${req.nombre_completo}, te contactamos de MAKIMPORT en relación a tu solicitud de alquiler para un equipo ${req.categoria_equipo}.`)}`}
                                    target="_blank" rel="noreferrer"
                                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-lg text-xs font-bold transition-all text-center">
                                    <Phone className="w-4 h-4 text-emerald-400" /><span>WA Cliente</span><ExternalLink className="w-3 h-3 opacity-60" />
                                  </a>
                                  <button onClick={() => { setBroadcastPrefill(broadcastText); setActiveTab('proveedores'); navigator.clipboard.writeText(broadcastText); }}
                                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-lg text-xs font-black transition-all text-center shadow-md shadow-orange-950/20 border border-orange-500/45">
                                    <Send className="w-4 h-4" /><span>Difundir a Proveedores</span>
                                  </button>
                                  <button onClick={() => { navigator.clipboard.writeText(broadcastText); }}
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition-all text-center">
                                    <Copy className="w-3.5 h-3.5" /><span>Copiar Texto</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ══ SUB-TAB 2: PROPIETARIOS / EQUIPOS REGISTRADOS ══ */}
                {alquileresSubTab === 'propietarios' && (
                  <div>
                    {loadingOwners ? (
                      <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-orange-500" /><span>Cargando propietarios...</span>
                      </div>
                    ) : filteredOwners.length === 0 ? (
                      <div className="p-12 text-center space-y-2">
                        <Wrench className="w-10 h-10 mx-auto text-slate-700" />
                        <p className="text-slate-500 text-sm font-medium">{alquileresSearch ? 'Sin resultados para esa busqueda.' : 'No hay equipos registrados en la red de propietarios aun.'}</p>
                        <a href="/postular-equipo" target="_blank" className="inline-block mt-2 text-xs text-orange-400 hover:underline font-bold">Ir al formulario de postulacion</a>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/80">
                        {filteredOwners.map((owner) => {
                          const isEditingO = editingOwnerStatus?.id === owner.id;
                          const statusColors: Record<string, string> = {
                            disponible:    'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
                            ocupado:       'bg-amber-500/20  border-amber-500/40  text-amber-300',
                            mantenimiento: 'bg-red-500/20    border-red-500/40    text-red-300',
                          };
                          return (
                            <div key={owner.id} className="p-4 sm:p-5 hover:bg-slate-950/40 transition-colors group">
                              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                                <div className="flex-1 min-w-0 space-y-3">
                                  {/* Header */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-extrabold text-white">{owner.nombre_propietario}</span>
                                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColors[owner.estado] || 'bg-slate-700 border-slate-600 text-slate-300'}`}>
                                        {owner.estado}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                      <button
                                        onClick={() => setEditingOwnerStatus(isEditingO ? null : { id: owner.id, estado: owner.estado })}
                                        title="Editar estado"
                                        className="p-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/40 border border-sky-600/30 text-sky-400 transition-all"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm({ open: true, table: 'owner_machinery', id: owner.id, label: `${owner.nombre_propietario} - ${owner.categoria_equipo}` })}
                                        title="Eliminar registro"
                                        className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 text-red-400 transition-all"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Inline status editor */}
                                  {isEditingO && (
                                    <div className="p-3 bg-slate-950 border border-sky-700/40 rounded-xl flex items-center gap-3 flex-wrap">
                                      <label className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Cambiar estado:</label>
                                      {(['disponible', 'ocupado', 'mantenimiento'] as const).map(s => (
                                        <button key={s}
                                          onClick={() => handleUpdateOwnerStatus(owner.id, s)}
                                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border capitalize ${owner.estado === s ? 'bg-orange-600 text-white border-orange-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
                                        >
                                          {s === 'disponible' ? '🟢' : s === 'ocupado' ? '🟡' : '🔴'} {s}
                                        </button>
                                      ))}
                                      <button onClick={() => setEditingOwnerStatus(null)} className="text-[10px] text-slate-500 hover:text-slate-300 ml-auto">✕ Cerrar</button>
                                    </div>
                                  )}

                                  {/* Info grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-1">Datos de Contacto</p>
                                      <div className="text-xs text-slate-300 space-y-1">
                                        <div><span className="text-slate-500">Dueno:</span> <strong className="text-white">{owner.nombre_propietario}</strong></div>
                                        <div><span className="text-slate-500">Telefono:</span> <a href={`tel:${owner.telefono}`} className="text-emerald-400 hover:underline">{owner.telefono}</a></div>
                                        <div><span className="text-slate-500">Correo:</span> <strong className="text-slate-200">{owner.email || 'No especificado'}</strong></div>
                                        {owner.instagram && <div><span className="text-slate-500">Instagram:</span> <span className="text-pink-400 font-mono">{owner.instagram}</span></div>}
                                      </div>
                                    </div>
                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-1">Ficha del Equipo</p>
                                      <div className="text-xs text-slate-300 space-y-1">
                                        <div><span className="text-slate-500">Categoria:</span> <strong className="text-white">{owner.categoria_equipo}</strong></div>
                                        <div><span className="text-slate-500">Marca/Modelo:</span> <strong className="text-white">{owner.marca} {owner.modelo || ''}</strong></div>
                                        <div><span className="text-slate-500">Ano:</span> <strong className="text-slate-200">{owner.ano || 'No especificado'}</strong></div>
                                        <div><span className="text-slate-500">Horas de Uso:</span> <strong className="text-slate-200">{owner.horas_uso ? `${owner.horas_uso.toLocaleString()} Hrs` : 'No especificadas'}</strong></div>
                                      </div>
                                    </div>
                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-1">Tarifas y Ubicacion</p>
                                      <div className="text-xs text-slate-300 space-y-1">
                                        <div><span className="text-slate-500">Ubicacion Base:</span> <strong className="text-white">{owner.ciudad_base}, {owner.estado_base}</strong></div>
                                        <div>
                                          <span className="text-slate-500">Tarifas:</span>{' '}
                                          <strong className="text-amber-300 font-mono">
                                            {owner.tarifa_hora ? `$${owner.tarifa_hora}/hr` : ''}
                                            {owner.tarifa_hora && owner.tarifa_dia ? ' | ' : ''}
                                            {owner.tarifa_dia ? `$${owner.tarifa_dia}/dia` : ''}
                                            {!owner.tarifa_hora && !owner.tarifa_dia ? 'A consultar' : ''}
                                          </strong>
                                        </div>
                                        <div><span className="text-slate-500">Operador:</span> <strong className="text-slate-200">{owner.incluye_operador ? 'Si, incluido' : 'Solo maquina'}</strong></div>
                                        <div><span className="text-slate-500">Disponibilidad:</span> <strong className="text-sky-400 capitalize">{owner.modalidad_disponible?.replace('_', ' ')}</strong></div>
                                      </div>
                                    </div>
                                  </div>

                                  {owner.notas && (
                                    <div className="text-[11px] text-slate-400 italic p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                                      {owner.notas}
                                    </div>
                                  )}

                                  {/* Photo gallery */}
                                  {owner.photos && owner.photos.length > 0 && (
                                    <div>
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Fotos del Equipo ({owner.photos.length})
                                      </p>
                                      <div className="flex gap-2 flex-wrap">
                                        {owner.photos.slice(0, 8).map((url, pi) => (
                                          <button
                                            key={pi}
                                            type="button"
                                            onClick={() => setLightbox({ photos: owner.photos!, idx: pi })}
                                            className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 hover:border-orange-500 transition-all hover:scale-105 shrink-0"
                                          >
                                            <img src={url} alt={`Foto ${pi + 1}`} className="w-full h-full object-cover" />
                                            {pi === 7 && owner.photos!.length > 8 && (
                                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                                                +{owner.photos!.length - 8}
                                              </div>
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Action column */}
                                <div className="flex flex-col gap-2 shrink-0 w-full lg:w-40 justify-end self-end">
                                  <a
                                    href={`https://wa.me/${owner.telefono.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(`Hola ${owner.nombre_propietario}, soy del equipo de MAKIMPORT. Tenemos un cliente interesado en alquilar tu equipo (${owner.categoria_equipo} ${owner.marca}). Esta disponible?`)}`}
                                    target="_blank" rel="noreferrer"
                                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black transition-all text-center"
                                  >
                                    <Phone className="w-3.5 h-3.5" /><span>Contactar Propietario</span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ══ SUB-TAB 3: MATCHES AUTOMÁTICOS ══ */}
                {alquileresSubTab === 'matches' && (
                  <div>
                    {filteredMatches.length === 0 ? (
                      <div className="p-12 text-center space-y-2">
                        <Search className="w-10 h-10 mx-auto text-slate-700" />
                        <p className="text-slate-500 text-sm font-medium">
                          {alquileresSearch
                            ? 'Sin matches para esa búsqueda.'
                            : ownerMachinery.length === 0
                              ? 'No hay propietarios registrados aún. Los matches aparecerán aquí automáticamente.'
                              : 'No hay coincidencias activas entre solicitudes y propietarios.'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/80">
                        {/* Group matches by request */}
                        {rentalRequests.map((req) => {
                          const reqMatches = filteredMatches.filter(m => m.req.id === req.id);
                          if (reqMatches.length === 0) return null;
                          return (
                            <div key={req.id} className="p-4 sm:p-5 space-y-3">
                              {/* Request summary header */}
                              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between flex-wrap gap-3">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap text-xs">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Solicitud de Alquiler</span>
                                    <span className="text-slate-600">•</span>
                                    <span className="font-extrabold text-white">{req.nombre_completo}</span>
                                  </div>
                                  <div className="text-xs text-slate-350">
                                    Busca: <strong className="text-orange-400">{req.categoria_equipo}</strong>
                                    {req.marca_preferida && <span> ({req.marca_preferida})</span>} en{' '}
                                    <strong className="text-white">{req.ciudad}, {req.estado}</strong>
                                  </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                  req.estado_solicitud === 'pendiente'  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                                  req.estado_solicitud === 'en_proceso' ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' :
                                  'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                }`}>{req.estado_solicitud}</span>
                              </div>

                              {/* Match cards list */}
                              <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-950/60 overflow-hidden">
                                <div className="px-3.5 py-2 border-b border-emerald-500/20 bg-emerald-900/20 flex items-center justify-between text-[11px] font-black text-emerald-400">
                                  <span>⚡ {reqMatches.length} Coincidencia{reqMatches.length > 1 ? 's' : ''} en la Red de Propietarios</span>
                                  <span className="text-[10px] font-bold text-emerald-300/80">Match Automático</span>
                                </div>
                                <div className="divide-y divide-emerald-900/25">
                                  {reqMatches.map(({ owner, score }) => {
                                    const lbl = score >= 5 ? '🟢 Alta coincidencia' : score >= 3 ? '🟡 Coincidencia media' : '🔵 Coincidencia parcial';
                                    const col = score >= 5 ? 'text-emerald-300' : score >= 3 ? 'text-amber-300' : 'text-sky-300';
                                    const waT = `Hola ${owner.nombre_propietario}, soy del equipo MAKIMPORT Venezuela. Un cliente en ${req.estado} necesita alquilar urgente un ${req.categoria_equipo} (${req.marca_preferida || 'cualquier marca'}). ¿Tu equipo (${owner.categoria_equipo} ${owner.marca} ${owner.modelo || ''}) en ${owner.ciudad_base} está disponible? Por favor envíame tarifa y condiciones. ¡Gracias!`;
                                    return (
                                      <div key={`${req.id}-${owner.id}`} className="px-4 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-emerald-900/10 transition-colors">
                                        <div className="flex-1 min-w-0 space-y-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-extrabold text-white text-xs">{owner.nombre_propietario}</span>
                                            <span className={`text-[10px] font-bold ${col}`}>{lbl}</span>
                                            <span className="text-[10px] text-slate-500 font-mono bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800">Score: {score}/6</span>
                                          </div>
                                          <div className="text-[11px] text-slate-350 flex flex-wrap gap-x-3 gap-y-0.5 items-center">
                                            <span className="text-emerald-400 font-bold">{owner.categoria_equipo}</span>
                                            <span className="text-slate-600">•</span>
                                            <span>{owner.marca} {owner.modelo || ''}</span>
                                            {owner.ano && <><span className="text-slate-600">•</span><span>Año {owner.ano}</span></>}
                                            <span className="text-slate-600">•</span>
                                            <span className="flex items-center gap-1 text-slate-300"><MapPin className="w-3 h-3 text-orange-400" />{owner.ciudad_base}, {owner.estado_base}</span>
                                          </div>
                                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
                                            {owner.tarifa_hora && <div><span className="text-slate-500">Tarifa hora:</span> <strong className="text-amber-300 font-mono font-bold">${owner.tarifa_hora}/hr</strong></div>}
                                            {owner.tarifa_dia  && <div><span className="text-slate-500">Tarifa día:</span> <strong className="text-amber-300/70 font-mono">${owner.tarifa_dia}/día</strong></div>}
                                            {owner.incluye_operador && <span className="text-sky-400">✓ Operador incluido</span>}
                                            <div><span className="text-slate-500">Contacto:</span> <span className="text-slate-400 font-mono">{owner.telefono}</span></div>
                                          </div>
                                        </div>
                                        <a href={`https://wa.me/${owner.telefono.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(waT)}`}
                                          target="_blank" rel="noreferrer"
                                          className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black transition-all shadow-sm shadow-emerald-950 border border-emerald-500/40 text-center">
                                          <Phone className="w-4 h-4 text-white" /><span>Contactar por WhatsApp</span>
                                        </a>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
</div>
                    )}
                  </div>
                )}

              </div>{/* end main panel */}

            </div>
          );
        })()}

        {/* TAB 8: COTIZACIONES DE OBRA */}
        {activeTab === 'projectQuotes' && (() => {
          const sq = projectQuotesSearch.toLowerCase();
          const filtered = projectQuotes.filter(q => {
            const matchText = !sq || [
              q.client_name_or_company, q.id_document, q.phone_contact, q.project_location
            ].some(f => (f || '').toLowerCase().includes(sq));
            const matchStatus = projectQuotesFilter === 'all' || q.status === projectQuotesFilter;
            return matchText && matchStatus;
          });

          const statusBadge = (s: string) => {
            const map: Record<string, string> = {
              received: 'bg-sky-950/70 text-sky-400 border-sky-800/40',
              in_review: 'bg-amber-950/70 text-amber-400 border-amber-800/40',
              quoted: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40',
              archived: 'bg-slate-800/70 text-slate-500 border-slate-700/40',
            };
            const labels: Record<string, string> = { received: 'Recibido', in_review: 'En Revisión', quoted: 'Cotizado', archived: 'Archivado' };
            return <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${map[s] || map.received}`}>{labels[s] || s}</span>;
          };

          return (
            <div className="space-y-4">
              {/* Header + Search + Filter */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <HardHat className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-slate-300">Cotizaciones de Obra y Proyectos</span>
                    <span className="px-2 py-0.5 bg-orange-600/20 border border-orange-600/30 text-orange-400 text-[9px] font-black rounded-full">{filtered.length} registros</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 max-w-[240px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                      <input
                        type="text"
                        value={projectQuotesSearch}
                        onChange={e => setProjectQuotesSearch(e.target.value)}
                        placeholder="Nombre, RIF, ubicación..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                      {projectQuotesSearch && (
                        <button onClick={() => setProjectQuotesSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">✕</button>
                      )}
                    </div>
                    {/* Filter */}
                    <select
                      value={projectQuotesFilter}
                      onChange={e => setProjectQuotesFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="all">Todos los estatus</option>
                      <option value="received">Recibido</option>
                      <option value="in_review">En Revisión</option>
                      <option value="quoted">Cotizado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>
                </div>

                {loadingProjectQuotes ? (
                  <div className="p-12 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-2" />
                    <span>Cargando cotizaciones...</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Search className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <span>{projectQuotesSearch || projectQuotesFilter !== 'all' ? 'Sin resultados para esa búsqueda.' : 'No hay solicitudes de cotización registradas.'}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 divide-y md:divide-y-0 divide-slate-800/80">
                    {filtered.map((q) => {
                      const waPhone = (q.phone_contact || '').replace(/\D/g, '');
                      return (
                        <div
                          key={q.id}
                          className="group p-4 border-r border-b border-slate-800/50 hover:bg-slate-950/30 transition-colors cursor-pointer flex flex-col gap-3"
                          onClick={() => setSelectedProjectQuote(q)}
                        >
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-extrabold text-white truncate group-hover:text-orange-400 transition-colors">{q.client_name_or_company}</h4>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{q.id_document}</p>
                            </div>
                            {statusBadge(q.status)}
                          </div>

                          {/* Info row */}
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
                              <span className="truncate">{q.project_location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                              <HardHat className="w-3 h-3 shrink-0" />
                              <span className="truncate">{q.project_type}</span>
                            </div>
                            {q.estimated_budget && q.estimated_budget !== 'Prefiero no indicar' && (
                              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                                <DollarSign className="w-3 h-3 shrink-0" />
                                <span>{q.estimated_budget}</span>
                              </div>
                            )}
                          </div>

                          {/* Bottom row */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                            <span className="text-[9px] text-slate-600">{new Date(q.created_at).toLocaleDateString('es-VE')}</span>
                            <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                              {waPhone && (
                                <a
                                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hola ${q.client_name_or_company}, somos del equipo de MAKIMPORT. Estamos revisando tu solicitud de cotización de obra (${q.project_type}).`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-400 text-[10px] font-bold rounded-lg transition-colors"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                              <select
                                value={q.status}
                                onChange={(e) => { e.stopPropagation(); handleUpdateProjectQuoteStatus(q.id, e.target.value); }}
                                className="bg-slate-950 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-205 px-2 py-1 focus:outline-none focus:border-orange-500 transition-colors"
                              >
                                <option value="received">Recibido</option>
                                <option value="in_review">En Revisión</option>
                                <option value="quoted">Cotizado</option>
                                <option value="archived">Archivado</option>
                              </select>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm({
                                    open: true,
                                    table: 'project_quotes',
                                    id: q.id,
                                    label: q.client_name_or_company
                                  });
                                }}
                                className="p-1 text-red-500 hover:text-red-400 bg-red-950/20 hover:bg-red-950/45 border border-red-900/30 rounded-lg transition-colors shrink-0"
                                title="Eliminar Cotización"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Detail Modal */}
              {selectedProjectQuote && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProjectQuote(null)}>
                  <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    {/* Modal Header */}
                    <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-black text-white">{selectedProjectQuote.client_name_or_company}</h3>
                        <p className="text-xs text-orange-400 font-bold mt-0.5">{selectedProjectQuote.project_type}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{selectedProjectQuote.id_document}</p>
                      </div>
                      <button onClick={() => setSelectedProjectQuote(null)} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Scrollable body */}
                    <div className="overflow-y-auto flex-1 p-5 space-y-5">

                      {/* Contact + Status */}
                      <div className="flex flex-wrap items-center gap-3">
                        {selectedProjectQuote.phone_contact && (
                          <a
                            href={`https://wa.me/${selectedProjectQuote.phone_contact.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${selectedProjectQuote.client_name_or_company}, somos MAKIMPORT. Revisamos tu cotización de obra (${selectedProjectQuote.project_type}).`)}`}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/40 text-emerald-400 font-bold text-xs rounded-xl transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{selectedProjectQuote.phone_contact}</span>
                          </a>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Estatus:</span>
                          <select
                            value={selectedProjectQuote.status}
                            onChange={(e) => {
                              handleUpdateProjectQuoteStatus(selectedProjectQuote.id, e.target.value);
                              setSelectedProjectQuote((prev: any) => ({ ...prev, status: e.target.value }));
                            }}
                            className="bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 px-3 py-1.5 focus:outline-none focus:border-orange-500 transition-colors"
                          >
                            <option value="received">Recibido</option>
                            <option value="in_review">En Revisión</option>
                            <option value="quoted">Cotizado</option>
                            <option value="archived">Archivado</option>
                          </select>
                        </div>
                      </div>

                      {/* Grid info */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <p className="text-slate-500 uppercase text-[9px] font-black">Ubicación</p>
                          <p className="text-slate-200 mt-1">{selectedProjectQuote.project_location}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <p className="text-slate-500 uppercase text-[9px] font-black">Duración / Inicio</p>
                          <p className="text-slate-200 mt-1">{selectedProjectQuote.duration_and_start_date}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <p className="text-slate-500 uppercase text-[9px] font-black">Presupuesto</p>
                          <p className="text-amber-400 font-semibold mt-1">{selectedProjectQuote.estimated_budget || 'No indicado'}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <p className="text-slate-500 uppercase text-[9px] font-black">Visita Técnica</p>
                          <p className="mt-1">{selectedProjectQuote.requires_site_visit ? <span className="text-amber-400 font-bold">⚠️ Sí requiere</span> : <span className="text-slate-400">No</span>}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2">
                          <p className="text-slate-500 uppercase text-[9px] font-black">Alcance requerido</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {Array.isArray(selectedProjectQuote.scope) && selectedProjectQuote.scope.map((s: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-orange-950/30 border border-orange-800/40 text-orange-300 text-[10px] font-semibold rounded">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Descripción de la Obra</p>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/50 p-3 rounded-xl border border-slate-800">{selectedProjectQuote.project_description}</p>
                      </div>

                      {/* Attachments */}
                      {Array.isArray(selectedProjectQuote.attachments_urls) && selectedProjectQuote.attachments_urls.length > 0 && (
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase mb-2">Planos / Documentos Adjuntos</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {selectedProjectQuote.attachments_urls.map((url: string, idx: number) => {
                              const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url);
                              return isImage ? (
                                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer group" onClick={() => setLightbox({ photos: selectedProjectQuote.attachments_urls.filter((u: string) => /\.(jpe?g|png|gif|webp)$/i.test(u)), idx })}>
                                  <img src={url} alt={`Plano ${idx+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                              ) : (
                                <a key={idx} href={url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-1 aspect-video rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
                                  <FileText className="w-5 h-5 text-orange-400" />
                                  <span className="text-[9px] font-bold">Ver Adjunto {idx+1}</span>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-600 text-right">Registrado el {new Date(selectedProjectQuote.created_at).toLocaleDateString('es-VE')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 9: POSTULACIONES / SERVICIOS */}
        {activeTab === 'serviceApplications' && (() => {
          const sq = servicesSearch.toLowerCase();
          const filtered = serviceApplications.filter(app => {
            const matchText = !sq || [
              app.full_name_or_company, app.id_document_number, app.phone_contact,
              app.state_city, app.category_id
            ].some(f => (f || '').toLowerCase().includes(sq));
            const matchStatus = servicesFilter === 'all' || app.status === servicesFilter;
            const matchCategory = servicesCategory === 'all' || app.category_id === servicesCategory;
            return matchText && matchStatus && matchCategory;
          });

          const statusBadge = (s: string) => {
            const map: Record<string, string> = {
              pending: 'bg-amber-950/70 text-amber-400 border-amber-800/40',
              approved: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40',
              rejected: 'bg-red-950/70 text-red-400 border-red-800/40',
            };
            const labels: Record<string, string> = { pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado' };
            return <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${map[s] || map.pending}`}>{labels[s] || s}</span>;
          };

          return (
            <div className="space-y-4">
              {/* Header + Search + Filter */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Wrench className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-slate-300">Postulaciones de Proveedores de Servicios</span>
                    <span className="px-2 py-0.5 bg-orange-600/20 border border-orange-600/30 text-orange-400 text-[9px] font-black rounded-full">{filtered.length} registros</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 max-w-[240px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                      <input
                        type="text"
                        value={servicesSearch}
                        onChange={e => setServicesSearch(e.target.value)}
                        placeholder="Nombre, RIF, categoría..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                      {servicesSearch && (
                        <button onClick={() => setServicesSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">✕</button>
                      )}
                    </div>
                    <select
                      value={servicesFilter}
                      onChange={e => setServicesFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="all">Todos los estatus</option>
                      <option value="pending">Pendiente</option>
                      <option value="approved">Aprobado</option>
                      <option value="rejected">Rechazado</option>
                    </select>
                    <select
                      value={servicesCategory}
                      onChange={e => setServicesCategory(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="all">Todas las Categorías</option>
                      <option value="mecanico">Mecánico / Taller</option>
                      <option value="camion_servicio">Camión de Servicio / Grúa</option>
                      <option value="lavado">Lavado Industrial</option>
                      <option value="restauracion">Restauración y Pintura</option>
                      <option value="repuestos">Proveedor de Repuestos</option>
                      <option value="operador">Operador Certificado</option>
                      <option value="transporte">Transporte y Logística</option>
                    </select>
                  </div>
                </div>

                {loadingServiceApplications ? (
                  <div className="p-12 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-2" />
                    <span>Cargando postulaciones...</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Search className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <span>{servicesSearch || servicesFilter !== 'all' || servicesCategory !== 'all' ? 'Sin resultados para esa búsqueda.' : 'No hay postulaciones registradas aún.'}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 divide-y md:divide-y-0 divide-slate-800/80">
                    {filtered.map((app) => {
                      const waPhone = (app.phone_contact || '').replace(/\D/g, '');
                      return (
                        <div
                          key={app.id}
                          className="group p-4 border-r border-b border-slate-800/50 hover:bg-slate-950/30 transition-colors cursor-pointer flex flex-col gap-3"
                          onClick={() => setSelectedServiceApp(app)}
                        >
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-extrabold text-white truncate group-hover:text-orange-400 transition-colors">{app.full_name_or_company}</h4>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{app.id_document_number}</p>
                            </div>
                            {statusBadge(app.status)}
                          </div>

                          {/* Info row */}
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-orange-400 font-bold capitalize">
                              <Wrench className="w-3 h-3 shrink-0" />
                              <span className="truncate">{app.category_id}</span>
                              <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] font-bold rounded uppercase shrink-0">
                                {app.applicant_type === 'company' ? 'Empresa' : 'Natural'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <MapPin className="w-3 h-3 shrink-0 text-slate-600" />
                              <span className="truncate">{app.state_city}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-[10px] text-slate-500 shrink-0">{app.coverage_radius?.split(' ')[0]}</span>
                            </div>
                            {Array.isArray(app.portfolio_urls) && app.portfolio_urls.length > 0 && (
                              <div className="flex gap-1">
                                {app.portfolio_urls.slice(0, 4).map((url: string, i: number) => (
                                  <div key={i} className="w-8 h-8 rounded-md overflow-hidden border border-slate-800">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                {app.portfolio_urls.length > 4 && <span className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">+{app.portfolio_urls.length - 4}</span>}
                              </div>
                            )}
                          </div>

                          {/* Bottom row */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                            <span className="text-[9px] text-slate-600">{new Date(app.created_at).toLocaleDateString('es-VE')}</span>
                            <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                              {waPhone && (
                                <a
                                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hola ${app.full_name_or_company}, somos del equipo MAKIMPORT. Revisamos tu postulación como proveedor de ${app.category_id}.`)}`}
                                  target="_blank" rel="noreferrer"
                                  className="flex items-center gap-1 px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-400 text-[10px] font-bold rounded-lg transition-colors"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                              <select
                                value={app.status}
                                onChange={(e) => { e.stopPropagation(); handleUpdateServiceApplicationStatus(app.id, e.target.value); }}
                                className="bg-slate-950 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-200 px-2 py-1 focus:outline-none focus:border-orange-500 transition-colors"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="approved">Aprobado</option>
                                <option value="rejected">Rechazado</option>
                              </select>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm({
                                    open: true,
                                    table: 'services_applications',
                                    id: app.id,
                                    label: app.full_name_or_company
                                  });
                                }}
                                className="p-1 text-red-500 hover:text-red-400 bg-red-950/20 hover:bg-red-950/45 border border-red-900/30 rounded-lg transition-colors shrink-0"
                                title="Eliminar Postulación"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Detail Modal */}
              {selectedServiceApp && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedServiceApp(null)}>
                  <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    {/* Modal Header */}
                    <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-black text-white">{selectedServiceApp.full_name_or_company}</h3>
                        <p className="text-xs text-orange-400 font-bold capitalize mt-0.5">{selectedServiceApp.category_id} • {selectedServiceApp.applicant_type === 'company' ? 'Empresa' : 'Persona Natural'}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{selectedServiceApp.id_document_number}</p>
                      </div>
                      <button onClick={() => setSelectedServiceApp(null)} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Scrollable body */}
                    <div className="overflow-y-auto flex-1 p-5 space-y-5">

                      {/* Contact + Status */}
                      <div className="flex flex-wrap items-center gap-3">
                        {selectedServiceApp.phone_contact && (
                          <a
                            href={`https://wa.me/${selectedServiceApp.phone_contact.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${selectedServiceApp.full_name_or_company}, somos MAKIMPORT. Revisamos tu postulación como proveedor de ${selectedServiceApp.category_id}.`)}`}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/40 text-emerald-400 font-bold text-xs rounded-xl transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{selectedServiceApp.phone_contact}</span>
                          </a>
                        )}
                        {selectedServiceApp.id_document_url && (
                          <a href={selectedServiceApp.id_document_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-colors">
                            <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                            <span>Ver Cédula / RIF</span>
                          </a>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Estatus:</span>
                          <select
                            value={selectedServiceApp.status}
                            onChange={(e) => {
                              handleUpdateServiceApplicationStatus(selectedServiceApp.id, e.target.value);
                              setSelectedServiceApp((prev: any) => ({ ...prev, status: e.target.value }));
                            }}
                            className="bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 px-3 py-1.5 focus:outline-none focus:border-orange-500 transition-colors"
                          >
                            <option value="pending">Pendiente</option>
                            <option value="approved">Aprobado</option>
                            <option value="rejected">Rechazado</option>
                          </select>
                        </div>
                      </div>

                      {/* Grid info */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <p className="text-slate-500 uppercase text-[9px] font-black">Ubicación</p>
                          <p className="text-slate-200 mt-1">{selectedServiceApp.state_city}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <p className="text-slate-500 uppercase text-[9px] font-black">Cobertura</p>
                          <p className="text-slate-200 mt-1">{selectedServiceApp.coverage_radius}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <p className="text-slate-500 uppercase text-[9px] font-black">Horario</p>
                          <p className="text-slate-200 mt-1">{selectedServiceApp.work_schedule}</p>
                        </div>
                      </div>

                      {/* Specialization */}
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Detalles de Experiencia</p>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/50 p-3 rounded-xl border border-slate-800">{selectedServiceApp.specialization_details}</p>
                      </div>

                      {/* Portfolio */}
                      {Array.isArray(selectedServiceApp.portfolio_urls) && selectedServiceApp.portfolio_urls.length > 0 && (
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase mb-2">Fotos del Portafolio ({selectedServiceApp.portfolio_urls.length} fotos)</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {selectedServiceApp.portfolio_urls.map((url: string, idx: number) => (
                              <div
                                key={idx}
                                className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer group"
                                onClick={() => setLightbox({ photos: selectedServiceApp.portfolio_urls, idx })}
                              >
                                <img src={url} alt={`Trabajo ${idx+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                  <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-600 text-right">Registrado el {new Date(selectedServiceApp.created_at).toLocaleDateString('es-VE')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── TAB 10: REVISIÓN DE EQUIPOS PARA VENTA ── */}
        {activeTab === 'machineryPostulations' && (() => {
          const pendingCount = machineryPostulations.filter(p => p.estado === 'Pendiente de Revisión').length;

          const copyToClipboard = (text: string, label: string) => {
            navigator.clipboard.writeText(text).catch(() => {});
          };

          const startApprovalFlow = (p: any) => {
            setApprovingPostulation(p);
            setAppPrice(p.precio_estimado || 0);
            setAppDestinationPort('Puerto Cabello, VZLA');
            setAppTransitTime('25-35 días');
            setAppInspGeneral(85);
            setAppInspMotor(85);
            setAppInspHydraulic(85);
            setAppInspTransmission(85);
            setAppInspCabin(85);
            setAppInspTires(85);
          };

          const handleRejectPostulation = async (p: any) => {
            if (!window.confirm(`¿Eliminar/rechazar la postulación de "${p.nombre_cliente} ${p.apellido_cliente}" — ${p.marca} ${p.modelo}?`)) return;
            try {
              const { error } = await supabase.from('postulaciones_equipos').delete().eq('id', p.id);
              if (error) throw error;
              setMachineryPostulations(prev => prev.filter(x => x.id !== p.id));
            } catch (err: any) {
              alert(`Error al eliminar: ${err.message}`);
            }
          };

          return (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-slate-900 border border-amber-800/30 rounded-2xl p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-white">Revisión de Equipos para Publicar en Catálogo</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {machineryPostulations.length} total ·{' '}
                        <span className="text-amber-400 font-bold">{pendingCount} pendientes de revisión</span>
                      </p>
                    </div>
                  </div>
                  <button onClick={fetchMachineryPostulations} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                  </button>
                </div>
              </div>

              {loadingPostulations ? (
                <div className="text-center py-16 text-slate-500 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin opacity-40" />
                  Cargando postulaciones...
                </div>
              ) : machineryPostulations.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs">
                  <Tag className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>Aún no hay postulaciones de equipos para venta.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {machineryPostulations.map((p) => {
                    const isExpanded = expandedPostulationId === p.id;
                    const mainPhoto = Array.isArray(p.fotos_urls) && p.fotos_urls.length > 0
                      ? p.fotos_urls[0]
                      : 'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=200';

                    return (
                      <div key={p.id} className={`bg-slate-900 rounded-2xl border transition-all overflow-hidden ${
                        p.estado === 'Pendiente de Revisión'
                          ? 'border-amber-600/30 hover:border-amber-500/50'
                          : p.estado === 'Aprobado'
                          ? 'border-emerald-600/30'
                          : 'border-red-700/30 opacity-60'
                      }`}>
                        
                        {/* ─ Collapsed Header Row ─ */}
                        <div 
                          onClick={() => setExpandedPostulationId(isExpanded ? null : p.id)}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-950/40 transition-colors"
                        >
                          <div className="flex items-center gap-4 w-full sm:w-auto min-w-0 flex-1">
                            {/* Main photo thumbnail */}
                            <img src={mainPhoto} alt={p.marca} className="w-16 h-12 rounded-xl object-cover border border-slate-800 shrink-0" />
                            
                            <div className="min-w-0 flex-1">
                              {/* Title, Year */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-orange-400">{p.marca}</span>
                                <span className="text-xs text-slate-500">•</span>
                                <span className="text-xs text-white font-bold truncate">{p.modelo}</span>
                                <span className="text-xs text-slate-500">•</span>
                                <span className="text-xs text-slate-300 font-semibold">{p.ano}</span>
                              </div>

                              {/* Owner simple summary line */}
                              <p className="text-[11px] text-slate-400 mt-1 truncate">
                                Propietario: <span className="text-slate-300 font-semibold">{p.nombre_cliente} {p.apellido_cliente}</span> ({p.telefono_cliente})
                              </p>
                            </div>
                          </div>

                          {/* Right side info: price, status badge, action toggle */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                            {/* Price */}
                            <div className="text-left sm:text-right">
                              <p className="text-[9px] text-slate-500 uppercase font-black">Precio Estimado</p>
                              <p className="text-emerald-400 font-extrabold font-mono text-xs sm:text-sm">
                                ${Number(p.precio_estimado || 0).toLocaleString()} USD
                              </p>
                            </div>

                            {/* Status */}
                            <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              p.estado === 'Pendiente de Revisión'
                                ? 'bg-amber-950/60 border border-amber-600/50 text-amber-300'
                                : p.estado === 'Aprobado'
                                ? 'bg-emerald-950/60 border border-emerald-600/50 text-emerald-300'
                                : 'bg-red-950/60 border border-red-600/50 text-red-300'
                            }`}>
                              {p.estado}
                            </span>

                            {/* Action toggle label */}
                            <div className="text-slate-400">
                              {isExpanded ? (
                                <span className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg font-bold text-white uppercase transition-colors">Colapsar</span>
                              ) : (
                                <span className="text-[10px] bg-orange-600 hover:bg-orange-500 px-2.5 py-1 rounded-lg font-bold text-white uppercase transition-colors">Detalles</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ─ Expanded details body ─ */}
                        {isExpanded && (
                          <div className="p-5 border-t border-slate-800/80 bg-slate-950/40 space-y-4 animate-in fade-in duration-200">
                            {/* Top Row: Date & DB key */}
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                              <span>Recibida el {new Date(p.created_at).toLocaleDateString('es-VE')}</span>
                              <span>•</span>
                              <span>ID: {p.id}</span>
                            </div>

                            <div className="flex items-start gap-4 flex-wrap">
                              {/* Left: Info */}
                              <div className="flex-1 min-w-0 space-y-3">
                                {/* Specs grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                                    <p className="text-slate-500 text-[10px] font-bold uppercase mb-0.5">Condición</p>
                                    <p className="text-slate-200 font-semibold">{p.condicion}</p>
                                  </div>
                                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                                    <p className="text-slate-500 text-[10px] font-bold uppercase mb-0.5">Uso</p>
                                    <p className="text-slate-200 font-semibold font-mono">{(p.uso_valor || 0).toLocaleString()} {p.uso_unidad}</p>
                                  </div>
                                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                                    <p className="text-slate-500 text-[10px] font-bold uppercase mb-0.5">Ciudad / Estado</p>
                                    <p className="text-slate-200 font-semibold">{p.ciudad_venezuela}</p>
                                  </div>
                                  {/* Precio con copia */}
                                  <div className="bg-slate-950 border border-emerald-800/40 rounded-lg p-2.5 flex items-start justify-between gap-1">
                                    <div>
                                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-0.5">Precio Estimado</p>
                                      <p className="text-emerald-300 font-extrabold font-mono">${Number(p.precio_estimado || 0).toLocaleString()} USD</p>
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); copyToClipboard(String(p.precio_estimado), 'precio'); }}
                                      className="mt-0.5 p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                                      title="Copiar precio"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Notas adicionales */}
                                {p.descripcion_notas && (
                                  <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Notas del propietario</p>
                                    <p className="text-xs text-slate-300 leading-relaxed">{p.descripcion_notas}</p>
                                  </div>
                                )}

                                {/* Client data with copy buttons */}
                                <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 space-y-2 text-xs">
                                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Datos del propietario</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {/* Nombre */}
                                    <div className="flex items-center justify-between gap-2 bg-slate-900/50 rounded-lg px-3 py-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="text-slate-300 font-bold truncate">{p.nombre_cliente} {p.apellido_cliente}</span>
                                      </div>
                                      <button onClick={(e) => { e.stopPropagation(); copyToClipboard(`${p.nombre_cliente} ${p.apellido_cliente}`, 'nombre'); }}
                                        className="p-1 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors shrink-0" title="Copiar nombre">
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    {/* Cédula */}
                                    <div className="flex items-center justify-between gap-2 bg-slate-900/50 rounded-lg px-3 py-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="text-slate-200 font-mono truncate">{p.cedula_rif_cliente}</span>
                                      </div>
                                      <button onClick={(e) => { e.stopPropagation(); copyToClipboard(p.cedula_rif_cliente, 'cédula'); }}
                                        className="p-1 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors shrink-0" title="Copiar cédula/RIF">
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    {/* Modelo */}
                                    <div className="flex items-center justify-between gap-2 bg-slate-900/50 rounded-lg px-3 py-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="text-slate-200 font-mono truncate">{p.marca} {p.modelo}</span>
                                      </div>
                                      <button onClick={(e) => { e.stopPropagation(); copyToClipboard(`${p.marca} ${p.modelo}`, 'modelo'); }}
                                        className="p-1 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors shrink-0" title="Copiar modelo">
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    {/* Teléfono / WA */}
                                    <div className="flex items-center justify-between gap-2 bg-slate-900/50 rounded-lg px-3 py-2">
                                      <a
                                        href={`https://wa.me/${p.telefono_cliente.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-2 min-w-0 flex-1"
                                      >
                                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <span className="text-emerald-400 hover:text-emerald-300 font-mono font-bold truncate transition-colors">{p.telefono_cliente}</span>
                                      </a>
                                      <button onClick={(e) => { e.stopPropagation(); copyToClipboard(p.telefono_cliente, 'teléfono'); }}
                                        className="p-1 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors shrink-0" title="Copiar teléfono">
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Photo Gallery with download */}
                              {Array.isArray(p.fotos_urls) && p.fotos_urls.length > 0 && (
                                <div className="shrink-0 w-full sm:w-auto">
                                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1.5">
                                    Fotos ({p.fotos_urls.length})
                                  </p>
                                  <div className="grid grid-cols-3 gap-1.5 animate-in fade-in">
                                    {p.fotos_urls.slice(0, 6).map((url: string, idx: number) => (
                                      <div key={idx} className="relative group">
                                        <div
                                          className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 cursor-pointer"
                                          onClick={(e) => { e.stopPropagation(); setLightbox({ photos: p.fotos_urls, idx }); }}
                                        >
                                          <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                            <ExternalLink className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                          {idx === 0 && (
                                            <span className="absolute bottom-0.5 left-0.5 bg-orange-600 text-white text-[8px] font-bold px-1 py-0.5 rounded">Principal</span>
                                          )}
                                        </div>
                                        {/* Download button */}
                                        <a
                                          href={url}
                                          download={`equipo-foto-${idx + 1}.jpg`}
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-800 hover:bg-slate-600 border border-slate-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                          title="Descargar foto"
                                        >
                                          <ExternalLink className="w-2.5 h-2.5 text-slate-300" />
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                  {p.fotos_urls.length > 6 && (
                                    <p className="text-[10px] text-slate-500 mt-1">+{p.fotos_urls.length - 6} más — clic en foto para ver todas</p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {p.estado === 'Pendiente de Revisión' && (
                              <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); startApprovalFlow(p); }}
                                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Aprobar y Publicar en Catálogo
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleRejectPostulation(p); }}
                                  className="sm:w-auto py-2.5 px-4 bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-700/50 text-slate-400 hover:text-red-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Rechazar / Eliminar
                                </button>
                              </div>
                            )}
                            {p.estado === 'Aprobado' && (
                              <div className="pt-3 border-t border-emerald-800/30 flex items-center gap-2 text-[11px] text-emerald-500">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>Equipo aprobado y publicado en el catálogo. Revisa el inventario para editarlo.</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}


        {/* ── Delete Confirmation Modal ── */}
        {deleteConfirm?.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="max-w-sm w-full bg-slate-900 border border-red-800/50 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-600/40 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <h4 className="font-extrabold text-white text-sm">¿Eliminar este registro?</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Esta acción no se puede deshacer.</p>
                </div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <p className="text-xs text-slate-300 font-semibold truncate">{deleteConfirm.label}</p>
                <p className="text-[10px] text-slate-505 mt-0.5 uppercase tracking-wide">
                  {deleteConfirm.table === 'rental_requests' ? 'Solicitud de Alquiler' : 
                   deleteConfirm.table === 'owner_machinery' ? 'Propietario / Equipo' : 
                   deleteConfirm.table === 'project_quotes' ? 'Cotización de Obra' : 
                   'Postulación de Servicio'}
                </p>
              </div>
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteRecord}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {deleteLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{deleteLoading ? 'Eliminando...' : 'Sí, eliminar'}</span>
                </button>
              </div>
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

      {showContractModal && selectedContractItem && (
        <AdminDocumentModal
          item={selectedContractItem}
          initialBuyer={selectedContractBuyer}
          onClose={() => {
            setShowContractModal(false);
            setSelectedContractItem(null);
            setSelectedContractBuyer(undefined);
          }}
        />
      )}
      {/* ── Lightbox Modal for Owner Photos ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
              <img src={lightbox.photos[lightbox.idx]} alt={`Foto ${lightbox.idx + 1} de ${lightbox.photos.length}`} className="w-full max-h-[70vh] object-contain" />
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 text-white text-xs font-bold rounded-full">
                {lightbox.idx + 1} / {lightbox.photos.length}
              </div>
              {lightbox.idx > 0 && (
                <button onClick={() => setLightbox({ ...lightbox, idx: lightbox.idx - 1 })} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {lightbox.idx < lightbox.photos.length - 1 && (
                <button onClick={() => setLightbox({ ...lightbox, idx: lightbox.idx + 1 })} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
              <a href={lightbox.photos[lightbox.idx]} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Abrir original
              </a>
              <a href={`https://wa.me/?text=${encodeURIComponent(lightbox.photos[lightbox.idx])}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                <Phone className="w-3.5 h-3.5" /> Compartir por WhatsApp
              </a>
            </div>
            {lightbox.photos.length > 1 && (
              <div className="mt-3 flex gap-2 justify-center flex-wrap">
                {lightbox.photos.map((url, i) => (
                  <button key={i} onClick={() => setLightbox({ ...lightbox, idx: i })} className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === lightbox.idx ? 'border-orange-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={url} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal de Aprobación y Publicación de Equipo ── */}
      {approvingPostulation && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Configurar Publicación del Equipo
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {approvingPostulation.marca} {approvingPostulation.modelo} ({approvingPostulation.ano})
                </p>
              </div>
              <button
                onClick={() => setApprovingPostulation(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg border border-slate-850 bg-slate-950/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 text-xs">
              
              {/* Logística */}
              <div className="space-y-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">1. Logística y Puerto</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Puerto de Destino</label>
                    <input
                      type="text"
                      value={appDestinationPort}
                      onChange={(e) => setAppDestinationPort(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Tiempo de Tránsito</label>
                    <input
                      type="text"
                      value={appTransitTime}
                      onChange={(e) => setAppTransitTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Inspección Técnica */}
              <div className="space-y-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">2. Inspección Técnica (%)</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Inspección General</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={appInspGeneral}
                      onChange={(e) => setAppInspGeneral(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px] font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Motor</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={appInspMotor}
                      onChange={(e) => setAppInspMotor(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px] font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Sistema Hidráulico</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={appInspHydraulic}
                      onChange={(e) => setAppInspHydraulic(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px] font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Transmisión</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={appInspTransmission}
                      onChange={(e) => setAppInspTransmission(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px] font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Cabina</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={appInspCabin}
                      onChange={(e) => setAppInspCabin(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px] font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Cauchos / Chasis</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={appInspTires}
                      onChange={(e) => setAppInspTires(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px] font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Precio Final */}
              <div className="space-y-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">3. Precio Final de Venta</p>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Precio (USD) *</label>
                  <input
                    type="number"
                    min={0}
                    value={appPrice}
                    onChange={(e) => setAppPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2.5 pt-3 border-t border-slate-800 shrink-0">
              <button
                onClick={() => setApprovingPostulation(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setApprovingLoading(true);
                  try {
                    const p = approvingPostulation;
                    const titulo = `${p.marca} ${p.modelo} ${p.ano}`;
                    
                    // 1. Insert into machinery
                    const { data: insertedData, error: insertErr } = await supabase.from('machinery').insert({
                      titulo,
                      marca: p.marca,
                      modelo: p.modelo,
                      ano: p.ano,
                      horas_uso: p.uso_valor || 0,
                      condicion_detalles: p.descripcion_notas || `${p.condicion}. Propietario: ${p.nombre_cliente} ${p.apellido_cliente}. Tel: ${p.telefono_cliente}. Ubicación: ${p.ciudad_venezuela}.`,
                      precio_compra_inmediata: appPrice,
                      es_subasta: false,
                      precio_inicial_subasta: 0,
                      puja_actual: 0,
                      fecha_fin_subasta: null,
                      fotos_urls: p.fotos_urls || [],
                      ubicacion_origen: p.ciudad_venezuela || 'Venezuela',
                      categoria: p.categoria || 'Maquinaria Pesada',
                      unidad_uso: p.uso_unidad || 'Horas',
                      dueno_nombre: `${p.nombre_cliente} ${p.apellido_cliente}`,
                      dueno_telefono: p.telefono_cliente,
                      ciudad_venezuela: p.ciudad_venezuela,
                      puerto_destino: appDestinationPort,
                      tiempo_transito: appTransitTime,
                      inspeccion_general: appInspGeneral,
                      inspeccion_motor: appInspMotor,
                      inspeccion_hidraulico: appInspHydraulic,
                      inspeccion_transmision: appInspTransmission,
                      inspeccion_cabina: appInspCabin,
                      inspeccion_cauchos: appInspTires,
                    }).select();

                    if (insertErr) throw insertErr;

                    const newMachId = insertedData && insertedData[0] ? insertedData[0].id : null;

                    // 2. Update postulation state to 'Aprobado' and store machinery_id
                    const { error: updateErr } = await supabase
                      .from('postulaciones_equipos')
                      .update({ 
                        estado: 'Aprobado',
                        machinery_id: newMachId
                      })
                      .eq('id', p.id);

                    if (updateErr) throw updateErr;

                    // Update local state
                    setMachineryPostulations(prev => 
                      prev.map(x => x.id === p.id ? { ...x, estado: 'Aprobado', machinery_id: newMachId } : x)
                    );

                    alert(`✅ Equipo "${titulo}" aprobado y publicado exitosamente.`);
                    setApprovingPostulation(null);
                  } catch (err: any) {
                    alert(`Error al publicar: ${err.message}`);
                  } finally {
                    setApprovingLoading(false);
                  }
                }}
                disabled={approvingLoading || !appPrice}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {approvingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{approvingLoading ? 'Publicando...' : 'Confirmar y Publicar'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
