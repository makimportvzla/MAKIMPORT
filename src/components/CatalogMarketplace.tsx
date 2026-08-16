'use client';

import React, { useState, useEffect } from 'react';
import { MachineryItem } from '@/types/machinery';
import { MachineryDetailModal } from './MachineryDetailModal';
import { Gavel, CheckCircle2, Clock, MapPin, Gauge, Calendar, ShieldCheck, ArrowUpRight, Search, Ship, Filter, Grid, List, LayoutGrid, SlidersHorizontal, ChevronRight, X, CreditCard, RotateCcw, Wrench, Star, Megaphone, ChevronLeft, Flame, AlertTriangle, Tag, Building2, Package, TrendingUp, Share2, Copy, MessageCircle, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CustomRequestModal } from './CustomRequestModal';
import { CATEGORIES, BRANDS, PREDEFINED_CATEGORY_VALUES as PREDEFINED_CATEGORIES, PREDEFINED_BRAND_VALUES as PREDEFINED_BRANDS } from '@/constants/machineryOptions';

interface AnuncioDinamico {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  etiqueta_badge?: string;
  link_accion?: string;
  activo: boolean;
  orden: number;
}

// Fallback announcements shown when Supabase table is empty
const STATIC_ANUNCIOS: AnuncioDinamico[] = [
  {
    id: 'fallback-1',
    tipo: 'requerimiento_obra',
    titulo: '📢 Se necesita con urgencia: Retroexcavadora CAT 420F',
    descripcion: 'Makimport busca operadores y propietarios de retroexcavadoras disponibles en alquiler para proyecto activo en el estado Zulia.',
    etiqueta_badge: '¡Urgente!',
    link_accion: '#alquiler',
    activo: true,
    orden: 0,
  },
  {
    id: 'fallback-2',
    tipo: 'match_servicio',
    titulo: '👷 Se busca Ingeniero Civil y Operador de Maquinaria',
    descripcion: 'Proyecto de construcción en expansión. Postúlate como proveedor de servicios y trabaja con nosotros en importantes obras.',
    etiqueta_badge: 'Reclutando',
    link_accion: '#postular',
    activo: true,
    orden: 1,
  },
  {
    id: 'fallback-3',
    tipo: 'promocion_tiempo',
    titulo: '🏗️ ¿Tienes un proyecto de construcción? ¡Cotízalo con nosotros!',
    descripcion: 'Makimport ejecuta proyectos de obra civil de principio a fin. Equipos propios, mano de obra certificada y tiempos garantizados.',
    etiqueta_badge: 'Nuevo servicio',
    link_accion: '#cotizar',
    activo: true,
    orden: 2,
  },
];

interface CatalogMarketplaceProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  userRole?: 'admin' | 'client';
  onOpenAdminPublish?: () => void;
  initialFilters?: { brand?: string; type?: string; origin?: string; transaction?: string };
  onOpenCustomRequest?: () => void;
  onScrollToSection?: (sectionId: string) => void;
  onOpenPostularEquipo?: () => void;
}

// Full Dataset for Machinery Marketplace
const DEMO_MACHINERY: MachineryItem[] = [
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
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 18 + 1000 * 60 * 42),
    images: [
      'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800'
    ],
    serialNumber: 'CAT0320DL098421',
    engineSpecs: 'Cat C6.4 ACERT (148 HP)',
    inspectionScore: 94,
    description: 'Excavadora hidráulica Caterpillar 320D L en excelente condición operativa. Cadena y zapatas al 85% de vida útil, sistema hidráulico sin fugas.',
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
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 5 + 1000 * 60 * 15),
    images: [
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800'
    ],
    serialNumber: 'KMTPC200-87421',
    engineSpecs: 'Komatsu SAA6D107E-1 (148 HP)',
    inspectionScore: 92,
    description: 'Komatsu PC200-8 probada en campo con mantenimiento de distribuidor oficial. Cabina con A/C operativo.',
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
    bidsCount: 0,
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800'
    ],
    serialNumber: 'CATD6TXL003912',
    engineSpecs: 'Cat C9.3 ACERT (207 HP)',
    inspectionScore: 96,
    description: 'Tractor de Orugas CAT D6T XL con hoja SU, ripper de 3 vástagos, transmisión Powershift y tren de rodaje Heavy Duty.',
    financingAvailable: true
  },
  {
    id: 'sany-sy215c',
    name: 'SANY SY215C',
    model: 'SY215C Heavy Duty',
    brand: 'SANY',
    category: 'Excavadora',
    year: 2022,
    hours: 1650,
    origin: 'China',
    location: 'Ningbo Port - China',
    destinationPort: 'Puerto Cabello, VZLA',
    status: 'auction',
    price: 52000,
    currentBid: 39800,
    minBidIncrement: 500,
    bidsCount: 18,
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 32 + 1000 * 60 * 10),
    images: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=800'
    ],
    serialNumber: 'SNY215C992104',
    engineSpecs: 'Isuzu 4HK1X (172 HP)',
    inspectionScore: 95,
    description: 'Excavadora SANY SY215C seminueva de baja horas. Motor Isuzu certificado, bombas Kawasaki.',
    financingAvailable: false
  },
  {
    id: 'xcmg-xe215d',
    name: 'XCMG XE215D',
    model: 'XE215D Smart Series',
    brand: 'XCMG',
    category: 'Excavadora',
    year: 2021,
    hours: 2100,
    origin: 'China',
    location: 'Qingdao Port - China',
    destinationPort: 'Puerto Cabello, VZLA',
    status: 'direct',
    price: 48500,
    bidsCount: 0,
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800'
    ],
    serialNumber: 'XCMG215D884102',
    engineSpecs: 'Cummins QSB7 (178 HP)',
    inspectionScore: 91,
    description: 'XCMG XE215D disponible para compra e importación inmediata. Excelente rendimiento de combustible.',
    financingAvailable: true
  },
  {
    id: 'volvo-ec220d',
    name: 'Volvo EC220D',
    model: 'EC220D Prime',
    brand: 'Volvo',
    category: 'Excavadora',
    year: 2020,
    hours: 3100,
    origin: 'USA',
    location: 'Jacksonville, FL - EE.UU.',
    destinationPort: 'La Guaira, VZLA',
    status: 'auction',
    price: 65000,
    currentBid: 51000,
    minBidIncrement: 1000,
    bidsCount: 11,
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 9 + 1000 * 60 * 30),
    images: [
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800'
    ],
    serialNumber: 'VLVEC220D12948',
    engineSpecs: 'Volvo D6E (174 HP)',
    inspectionScore: 93,
    description: 'Volvo EC220D importada de EE.UU. con modo ECO de ahorro de diésel y tubería hidráulica auxiliar instalada.',
    financingAvailable: true
  },
  {
    id: 'jcb-3cx',
    name: 'JCB 3CX Eco',
    model: '3CX Backhoe Loader',
    brand: 'JCB',
    category: 'Retroexcavadora',
    year: 2021,
    hours: 1950,
    origin: 'USA',
    location: 'Houston, TX - EE.UU.',
    destinationPort: 'Puerto Cabello, VZLA',
    status: 'direct',
    price: 42000,
    bidsCount: 0,
    images: [
      'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800'
    ],
    serialNumber: 'JCB3CX984102',
    engineSpecs: 'JCB EcoMAX (91 HP)',
    inspectionScore: 94,
    description: 'Retroexcavadora JCB 3CX Eco con tracción 4x4, extenda-hoe y balde frontal de 1.0 m³.',
    financingAvailable: true
  },
  {
    id: 'cat-950m',
    name: 'Caterpillar 950M',
    model: '950M Wheel Loader',
    brand: 'Caterpillar',
    category: 'Cargador',
    year: 2018,
    hours: 5400,
    origin: 'USA',
    location: 'Miami, FL - EE.UU.',
    destinationPort: 'La Guaira, VZLA',
    status: 'auction',
    price: 85000,
    currentBid: 69000,
    minBidIncrement: 1000,
    bidsCount: 16,
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 44),
    images: [
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800'
    ],
    serialNumber: 'CAT950M00192',
    engineSpecs: 'Cat C7.1 ACERT (250 HP)',
    inspectionScore: 90,
    description: 'Cargador frontal de ruedas Caterpillar 950M con balde de 3.3 m³, báscula digital integrada y cauchos en 80%.',
    financingAvailable: true
  }
];

export const CatalogMarketplace: React.FC<CatalogMarketplaceProps> = ({
  onOpenAuth,
  userRole = 'client',
  onOpenAdminPublish,
  initialFilters,
  onOpenCustomRequest,
  onScrollToSection,
  onOpenPostularEquipo,
}) => {
  const [items, setItems] = useState<MachineryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MachineryItem | null>(null);
  
  // UI Display Mode: 'grid' vs 'list'
  const [viewMode, setViewMode] = useState<'grid' | 'grid3' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter States (Simplified to Category, Brand, Model, Year)
  const [categoryFilter, setCategoryFilter] = useState<string>(initialFilters?.type || 'all');
  const [brandFilter, setBrandFilter] = useState<string>(initialFilters?.brand || 'all');
  const [modelFilter, setModelFilter] = useState<string>('');
  const [minYear, setMinYear] = useState<string>('');
  const [maxYear, setMaxYear] = useState<string>('');
  const [customRequestOpen, setCustomRequestOpen] = useState(false);
  
  // Sorting State
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'ending-soon' | 'newest'>('featured');
  // Transaction type filter: 'all' | 'direct' | 'auction'
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'direct' | 'auction'>(initialFilters?.transaction === 'direct' ? 'direct' : initialFilters?.transaction === 'auction' ? 'auction' : 'all');

  const [favorites, setFavorites] = useState<string[]>([]);

  // Share Modal States & logic
  const [shareItem, setShareItem] = useState<MachineryItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = async (item: MachineryItem) => {
    const text = `*MAKIMPORT - Oportunidad de Maquinaria Pesada*\n\n${item.name} (${item.brand} ${item.model})\nAño: ${item.year}\nPrecio: $${item.price.toLocaleString()} USD\nUbicación: ${item.location}`;
    const url = `${window.location.origin}/?id=${item.id}#catalogo-marketplace`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `MAKIMPORT - ${item.name}`,
          text: `${item.brand} ${item.model} (${item.year})`,
          url: url,
        });
      } catch (err) {
        console.warn('Web Share API cancelled or failed:', err);
      }
    } else {
      setShareItem(item);
      setCopiedLink(false);
    }
  };

  // Dynamic announcements ticker state
  const [anuncios, setAnuncios] = useState<AnuncioDinamico[]>(STATIC_ANUNCIOS);
  const [anuncioIndex, setAnuncioIndex] = useState(0);
  const [anunciosLoaded, setAnunciosLoaded] = useState(false);

  // Load favorites
  useEffect(() => {
    const loadFavs = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || 'guest';
        const stored = localStorage.getItem(`makimport_favorites_${userId}`);
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (err) {
        console.warn('Error loading favorites:', err);
      }
    };
    loadFavs();
  }, []);

  const toggleFavorite = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'guest';
      let updated = [...favorites];
      if (updated.includes(id)) {
        updated = updated.filter(x => x !== id);
      } else {
        updated.push(id);
      }
      setFavorites(updated);
      localStorage.setItem(`makimport_favorites_${userId}`, JSON.stringify(updated));
    } catch (err) {
      console.warn('Error toggling favorite:', err);
    }
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const [timeLeftMap, setTimeLeftMap] = useState<{ [key: string]: string }>({});

  // Sync initialFilters from parent components / Hero
  useEffect(() => {
    if (initialFilters) {
      setBrandFilter(initialFilters.brand || 'all');
      setCategoryFilter(initialFilters.type || 'all');
      if (initialFilters.transaction === 'direct') setTransactionFilter('direct');
      else if (initialFilters.transaction === 'auction') setTransactionFilter('auction');
    }
  }, [initialFilters]);

  const mapDbRowToMachineryItem = (row: any, bidsCountMap: { [key: string]: number } = {}): MachineryItem => {
    const photos = Array.isArray(row.fotos_urls) && row.fotos_urls.length > 0
      ? row.fotos_urls
      : ['https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800'];

    return {
      id: row.id,
      name: row.titulo || `${row.marca || ''} ${row.modelo || ''}`.trim() || 'Maquinaria Pesada',
      model: row.modelo || 'Standard',
      brand: row.marca || 'Sin marca',
      category: row.categoria || 'Otros',
      year: Number(row.ano) || 2021,
      hours: Number(row.horas_uso) || 0,
      origin: row.ubicacion_origen?.includes('China')
        ? 'China'
        : row.ubicacion_origen?.includes('VZLA') || row.ubicacion_origen?.includes('Venezuela')
        ? 'Venezuela'
        : 'USA',
      location: row.ubicacion_origen || 'Houston, TX - EE.UU.',
      destinationPort: row.puerto_destino || 'Puerto Cabello, VZLA',
      status: row.es_subasta ? 'auction' : 'direct',
      price: Number(row.precio_compra_inmediata) || 0,
      currentBid: Number(row.puja_actual || row.precio_inicial_subasta || 0) || undefined,
      minBidIncrement: 500,
      bidsCount: bidsCountMap[row.id] || 0,
      auctionEndsAt: row.fecha_fin_subasta ? new Date(row.fecha_fin_subasta) : undefined,
      image: photos[0],
      images: photos,
      serialNumber: row.numero_serie || 'SN-' + (row.id ? String(row.id).substring(0, 8) : '001'),
      engineSpecs: 'Motor diésel de alta eficiencia industrial',
      inspectionScore: Number(row.inspeccion_general) || 94,
      description: row.condicion_detalles || 'Maquinaria pesada inspeccionada y lista para embarque directo a Venezuela.',
      
      pdfReportUrl: row.pdf_reporte_url || undefined,
      inspeccionGeneral: Number(row.inspeccion_general) || 94,
      inspeccionMotor: Number(row.inspeccion_motor) || 95,
      inspeccionHidraulico: Number(row.inspeccion_hidraulico) || 92,
      inspeccionTransmision: Number(row.inspeccion_transmision) || 94,
      inspeccionCabina: Number(row.inspeccion_cabina) || 90,
      inspeccionCauchos: row.inspeccion_cauchos !== undefined && row.inspeccion_cauchos !== null ? Number(row.inspeccion_cauchos) : undefined,
      transitTime: row.tiempo_transito || '25-35 días',
      ciudadVenezuela: row.ciudad_venezuela || undefined,
      unidadUso: row.unidad_uso || 'Horas',
      badgePromocion: row.badge_promocion || undefined,
      esUltimaUnidad: row.es_ultima_unidad === true,
      financingAvailable: row.financiamiento_disponible === true,
    };
  };

  // Realtime Supabase Subscription & Initial Fetch
  useEffect(() => {
    const fetchMachinery = async () => {
      try {
        let bidsData: any = null;
        try {
          const { data } = await supabase
            .from('bids')
            .select('machinery_id');
          bidsData = data;
        } catch (err) {
          console.warn('Error fetching bids count list:', err);
        }

        const bidsCountMap: { [key: string]: number } = {};
        const bidsList = Array.isArray(bidsData) ? bidsData : [];
        bidsList.forEach((b: any) => {
          if (b && b.machinery_id) {
            bidsCountMap[b.machinery_id] = (bidsCountMap[b.machinery_id] || 0) + 1;
          }
        });

        const { data, error } = await supabase
          .from('machinery')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Error al cargar maquinaria de Supabase:', error);
          setItems([]);
          return;
        }

        if (data) {
          const dbItems = data.map((row) => mapDbRowToMachineryItem(row, bidsCountMap));
          setItems(dbItems);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.warn('Error al cargar maquinaria de Supabase:', err);
        setItems([]);
      }
    };

    fetchMachinery();

    let channel: any = null;
    try {
      channel = supabase
        .channel('catalog_marketplace_changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'bids' },
          (payload) => {
            const newBid = payload.new;
            if (newBid && newBid.machinery_id) {
              setItems((prev) =>
                prev.map((item) => {
                  if (item.id === newBid.machinery_id) {
                    return {
                      ...item,
                      currentBid: Math.max(item.currentBid || 0, Number(newBid.amount || 0)),
                      bidsCount: (item.bidsCount || 0) + 1
                    };
                  }
                  return item;
                })
              );
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'machinery' },
          (payload) => {
            if (payload.new) {
              const newItem = mapDbRowToMachineryItem(payload.new);
              setItems((prev) => {
                const exists = prev.some((item) => item.id === newItem.id);
                if (exists) {
                  return prev.map((item) => item.id === newItem.id ? newItem : item);
                }
                return [newItem, ...prev];
              });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'machinery' },
          (payload) => {
            if (payload.new) {
              setItems((prev) => prev.map((item) => {
                if (item.id === payload.new.id) {
                  const updatedItem = mapDbRowToMachineryItem(payload.new);
                  return {
                    ...updatedItem,
                    bidsCount: item.bidsCount
                  };
                }
                return item;
              }));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'machinery' },
          (payload) => {
            if (payload.old && payload.old.id) {
              setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    } catch (realtimeErr) {
      console.warn('Error setting up Realtime subscription in catalog:', realtimeErr);
    }

    const handleLocalCreate = (e: any) => {
      if (e.detail) {
        setItems((prev) => {
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
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          console.warn('Error removing channel:', e);
        }
      }
      window.removeEventListener('machinery_created', handleLocalCreate);
      window.removeEventListener('machinery_updated', handleLocalCreate);
    };
  }, []);

  // Fetch dynamic announcements from Supabase
  useEffect(() => {
    const fetchAnuncios = async () => {
      try {
        const { data, error } = await supabase
          .from('anuncios_catalogo_dinamico')
          .select('*')
          .eq('activo', true)
          .order('orden', { ascending: true });
        if (!error && data && data.length > 0) {
          setAnuncios(data as AnuncioDinamico[]);
        }
        // if error or empty, keep static fallback
      } catch (err) {
        console.warn('Error fetching anuncios:', err);
      } finally {
        setAnunciosLoaded(true);
      }
    };
    fetchAnuncios();
  }, []);

  // Auto-rotate ticker
  useEffect(() => {
    if (anuncios.length <= 1) return;
    const ticker = setInterval(() => {
      setAnuncioIndex((prev) => (prev + 1) % anuncios.length);
    }, 5000);
    return () => clearInterval(ticker);
  }, [anuncios]);

  // Sync selectedItem with live updates from items state
  useEffect(() => {
    if (selectedItem) {
      const updated = items.find((i) => i.id === selectedItem.id);
      if (updated) {
        if (
          updated.currentBid !== selectedItem.currentBid ||
          updated.status !== selectedItem.status ||
          updated.bidsCount !== selectedItem.bidsCount
        ) {
          setSelectedItem(updated);
        }
      }
    }
  }, [items, selectedItem]);

  // Timer Tick
  useEffect(() => {
    const updateTimers = () => {
      const newMap: { [key: string]: string } = {};
      items.forEach((item) => {
        if (item.status === 'auction' && item.auctionEndsAt) {
          let endDate: Date | null = null;
          try {
            endDate = item.auctionEndsAt instanceof Date ? item.auctionEndsAt : new Date(item.auctionEndsAt);
          } catch (e) {
            endDate = null;
          }
          
          if (endDate && !isNaN(endDate.getTime())) {
            const diff = endDate.getTime() - Date.now();
            if (diff <= 0) {
              newMap[item.id] = 'Finalizada';
            } else {
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diff % (1000 * 60)) / 1000);
              newMap[item.id] = `${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
            }
          } else {
            newMap[item.id] = 'Finalizada';
          }
        }
      });
      setTimeLeftMap(newMap);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [items]);

  // Reset Filters Function
  const handleResetFilters = () => {
    setCategoryFilter('all');
    setBrandFilter('all');
    setModelFilter('');
    setMinYear('');
    setMaxYear('');
    setSortBy('featured');
    setTransactionFilter('all');
  };

  // Filter & Sorting Logic (Strictly only Category, Brand, Model, and Year)
  const filteredAndSortedItems = items
    .filter((item) => {
      const itemCategory = (item.category || '').trim().toLowerCase();
      const itemBrand = (item.brand || '').trim().toLowerCase();
      const filterCategory = categoryFilter.trim().toLowerCase();
      const filterBrand = brandFilter.trim().toLowerCase();

      // Category filter (support custom categories with "Otros")
      if (filterCategory !== 'all') {
        if (filterCategory === 'otros') {
          const isPredefined = PREDEFINED_CATEGORIES.some(cat => itemCategory.includes(cat) || cat.includes(itemCategory));
          if (isPredefined && itemCategory !== 'otros') {
            return false;
          }
        } else {
          if (!itemCategory.includes(filterCategory) && !filterCategory.includes(itemCategory)) {
            return false;
          }
        }
      }

      // Brand filter (support custom brands with "Otros")
      if (filterBrand !== 'all') {
        if (filterBrand === 'otros') {
          const isPredefined = PREDEFINED_BRANDS.some(b => itemBrand.includes(b) || b.includes(itemBrand));
          if (isPredefined && itemBrand !== 'otros') {
            return false;
          }
        } else {
          if (!itemBrand.includes(filterBrand) && !filterBrand.includes(itemBrand)) {
            return false;
          }
        }
      }

      // Model filter
      if (modelFilter) {
        const itemModel = (item.model || '').trim().toLowerCase();
        const filterModel = modelFilter.trim().toLowerCase();
        if (!itemModel.includes(filterModel)) {
          return false;
        }
      }

      // Year range filter
      if (minYear) {
        const min = Number(minYear);
        if (!isNaN(min) && item.year < min) return false;
      }
      if (maxYear) {
        const max = Number(maxYear);
        if (!isNaN(max) && item.year > max) return false;
      }

      // Transaction type filter (Compra Inmediata vs Subasta en Vivo / Finalizada)
      if (transactionFilter !== 'all') {
        const itemWasAuction = !!item.auctionEndsAt; // had a scheduled auction (active or closed)
        if (transactionFilter === 'direct') {
          // Only pure direct-sale items that never had an auction
          if (item.status !== 'direct' || itemWasAuction) return false;
        }
        if (transactionFilter === 'auction') {
          // Include active auctions AND closed/expired auctions
          if (item.status !== 'auction' && !itemWasAuction) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const getPrice = (item: MachineryItem) => (item.status === 'auction' ? item.currentBid || item.price : item.price);
      
      if (sortBy === 'price-asc') return getPrice(a) - getPrice(b);
      if (sortBy === 'price-desc') return getPrice(b) - getPrice(a);
      if (sortBy === 'ending-soon') {
        const timeA = a.auctionEndsAt ? a.auctionEndsAt.getTime() : Infinity;
        const timeB = b.auctionEndsAt ? b.auctionEndsAt.getTime() : Infinity;
        return timeA - timeB;
      }
      if (sortBy === 'newest') return b.year - a.year;
      return 0;
    });

  return (
    <section id="catalogo-marketplace" className="py-16 bg-slate-950 text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── DYNAMIC ANNOUNCEMENTS TICKER ─────────────────────────── */}
        {anuncios.length > 0 && (() => {
          const anuncio = anuncios[anuncioIndex];
          const borderColor =
            anuncio.tipo === 'urgencia_stock' ? 'border-red-500/40' :
            anuncio.tipo === 'promocion_tiempo' ? 'border-amber-500/40' :
            anuncio.tipo === 'requerimiento_obra' ? 'border-orange-500/40' :
            'border-emerald-500/40';
          const iconBg =
            anuncio.tipo === 'urgencia_stock' ? 'bg-red-950/60 border-red-700/40' :
            anuncio.tipo === 'promocion_tiempo' ? 'bg-amber-950/60 border-amber-700/40' :
            anuncio.tipo === 'requerimiento_obra' ? 'bg-orange-950/60 border-orange-700/40' :
            'bg-emerald-950/60 border-emerald-700/40';
          const iconColor =
            anuncio.tipo === 'urgencia_stock' ? 'text-red-400' :
            anuncio.tipo === 'promocion_tiempo' ? 'text-amber-400' :
            anuncio.tipo === 'requerimiento_obra' ? 'text-orange-400' :
            'text-emerald-400';
          const badgeBg =
            anuncio.tipo === 'urgencia_stock' ? 'bg-red-600' :
            anuncio.tipo === 'promocion_tiempo' ? 'bg-amber-600' :
            anuncio.tipo === 'requerimiento_obra' ? 'bg-orange-600' :
            'bg-emerald-600';

          const handleTickerAction = () => {
            if (!anuncio.link_accion) return;
            const link = anuncio.link_accion;
            if (link.startsWith('#')) {
              const sectionId = link.slice(1);
              if (onScrollToSection) {
                onScrollToSection(sectionId);
              } else {
                const el = document.getElementById(sectionId);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            } else {
              window.open(link, '_blank', 'noopener');
            }
          };

          return (
            <div className={`mb-6 rounded-2xl border ${borderColor} bg-gradient-to-r from-slate-900 to-slate-900/95 shadow-lg`}>
              {/* Top row: icon + text + nav arrows */}
              <div className="flex items-start sm:items-center gap-3 p-4 sm:p-5">
                {/* Megaphone icon */}
                <div className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${iconBg} ${iconColor} mt-0.5 sm:mt-0`}>
                  <Megaphone className="w-4 h-4" />
                </div>

                {/* Text block — wraps freely, no truncation */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {anuncio.etiqueta_badge && (
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full text-white uppercase tracking-wider ${badgeBg}`}>
                        {anuncio.etiqueta_badge}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                      {anuncioIndex + 1} / {anuncios.length}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-white leading-snug">{anuncio.titulo}</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{anuncio.descripcion}</p>
                </div>

                {/* Navigation arrows — desktop only */}
                <div className="shrink-0 hidden sm:flex items-center gap-1">
                  <button
                    onClick={() => setAnuncioIndex((prev) => (prev - 1 + anuncios.length) % anuncios.length)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAnuncioIndex((prev) => (prev + 1) % anuncios.length)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bottom row: CTA button + mobile arrows */}
              {anuncio.link_accion && (
                <div className="px-4 pb-4 flex items-center justify-between gap-3">
                  <button
                    onClick={handleTickerAction}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-orange-950/40"
                  >
                    Ver más <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  {/* Mobile arrows */}
                  <div className="flex sm:hidden items-center gap-1">
                    <button
                      onClick={() => setAnuncioIndex((prev) => (prev - 1 + anuncios.length) % anuncios.length)}
                      className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setAnuncioIndex((prev) => (prev + 1) % anuncios.length)}
                      className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Progress dots */}
              <div className="flex items-center gap-1 px-4 pb-3">
                {anuncios.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setAnuncioIndex(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === anuncioIndex ? 'w-6 bg-orange-500' : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Header Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Catálogo de Maquinaria Industrial
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Mercado especializado en importación y subastas en tiempo real hacia Venezuela desde EE.UU. y China.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 text-white"
            >
              <SlidersHorizontal className="w-4 h-4 text-orange-500" />
              <span>Filtros</span>
            </button>

            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              <strong className="text-white">{filteredAndSortedItems.length}</strong> Equipos encontrados
            </span>
          </div>
        </div>

        {/* Catalog Header Information */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/50">
          <span className="text-xs text-slate-400 font-medium">
            Explore nuestro inventario completo de maquinaria disponible para compra inmediata y subastas.
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Total: <strong className="text-slate-300 font-extrabold">{filteredAndSortedItems.length}</strong> equipos
          </span>
        </div>

        {/* Custom Request Banner */}
        <button
          onClick={() => onOpenCustomRequest ? onOpenCustomRequest() : setCustomRequestOpen(true)}
          className="w-full mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/30 border border-orange-500/30 hover:border-orange-500/70 rounded-2xl shadow-lg shadow-orange-950/20 transition-all group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center shrink-0 group-hover:bg-orange-600/30 transition-colors">
              <Search className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">¿No encuentras la máquina que buscas?</p>
              <p className="text-xs text-slate-400 mt-0.5">¡Te la conseguimos y enviamos el presupuesto! Encarga cualquier equipo de EE.UU. o China.</p>
            </div>
          </div>
          <span className="shrink-0 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-orange-950 transition-all">
            <Wrench className="w-4 h-4" />
            Solicitar Cotización
            <ChevronRight className="w-4 h-4" />
          </span>
        </button>

        {/* MAIN LAYOUT: Sidebar (3 cols) + Grid/List (9 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* DESKTOP SIDEBAR FILTERS (3 Cols) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-slate-900/70 border border-slate-800/80 p-5 rounded-2xl h-fit sticky top-24">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                <span>Filtros</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            </div>

            {/* 1. Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Categoría / Tipo de Equipo
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="all">Todas las Categorías</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* 2. Brand Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Marca del Fabricante
              </label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="all">Todas las Marcas</option>
                {BRANDS.map((brand) => (
                  <option key={brand.value} value={brand.value}>{brand.label}</option>
                ))}
              </select>
            </div>

            {/* 3. Model Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Modelo
              </label>
              <input
                type="text"
                placeholder="Escribe el modelo..."
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* 4. Year Range Filter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Rango de Año</label>
                <span className="font-mono text-orange-400 font-bold">{minYear || 'Mín'} - {maxYear || 'Máx'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Desde"
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono text-center focus:outline-none focus:border-orange-500"
                />
                <input
                  type="number"
                  placeholder="Hasta"
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono text-center focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

          </aside>

          {/* MAIN CONTENT AREA (9 Cols) */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Control Bar: Transaction Tabs + Sorting + View Switcher */}
            <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 flex flex-col gap-4 shadow-lg">

              {/* Transaction Type Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setTransactionFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    transactionFilter === 'all'
                      ? 'bg-slate-700 text-white shadow-md border border-slate-600'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Todos los Equipos
                </button>
                <button
                  onClick={() => setTransactionFilter('direct')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    transactionFilter === 'direct'
                      ? 'bg-emerald-600 text-white shadow-md border border-emerald-500'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Compra Inmediata
                </button>
                <button
                  onClick={() => setTransactionFilter('auction')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    transactionFilter === 'auction'
                      ? 'bg-orange-600 text-white shadow-md border border-orange-500'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Gavel className="w-3.5 h-3.5" />
                  Subastas en Vivo
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <span>Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-orange-500"
                >
                  <option value="featured">Destacados MAKIMPORT</option>
                  <option value="price-asc">Menor a Mayor Precio</option>
                  <option value="price-desc">Mayor a Menor Precio</option>
                  <option value="ending-soon">Próximas a Cerrar (Subastas)</option>
                  <option value="newest">Año más Reciente</option>
                </select>
              </div>

              {/* View Toggle: 3-col | 2-col | list */}
              <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
                <button
                  onClick={() => setViewMode('grid3')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid3'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Vista 3 Columnas (Compacta)"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Vista Cuadrícula 2 Columnas"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Vista Lista (Tarjeta Completa)"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              </div>

            </div>

            {/* ── CATEGORY HORIZONTAL SCROLL TABS (above results) ─────────── */}
            <div className="relative">
              <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-slate-950 to-transparent z-10" />
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 border ${
                    categoryFilter === 'all'
                      ? 'bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-950/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  Todos
                </button>
                {CATEGORIES.filter((c) => c.value !== 'otros').map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter(cat.value)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 border whitespace-nowrap ${
                      categoryFilter === cat.value
                        ? 'bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-950/40'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
                <button
                  onClick={() => setCategoryFilter('otros')}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 border whitespace-nowrap ${
                    categoryFilter === 'otros'
                      ? 'bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-950/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  Otros
                </button>
              </div>
            </div>

            {/* MACHINERY ITEMS RESULTS GRID OR LIST */}
            {filteredAndSortedItems.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-slate-500 mx-auto border border-slate-800">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">No se encontraron maquinarias con los filtros seleccionados</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Prueba ajustar los parámetros de año, horas u origen para visualizar más unidades disponibles.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : viewMode === 'grid3' ? (

              /* ─── 3-COLUMN COMPACT GRID (forced 3 cols on ALL screen sizes) ─── */
              <div className="grid grid-cols-3 gap-2">
                {filteredAndSortedItems.map((item) => {
                  const isAuction = item.status === 'auction';
                  const timerStr = timeLeftMap[item.id] || 'Cargando...';
                  let g3EndDate: Date | null = null;
                  if (item.auctionEndsAt) {
                    try { g3EndDate = item.auctionEndsAt instanceof Date ? item.auctionEndsAt : new Date(item.auctionEndsAt); } catch { g3EndDate = null; }
                  }
                  const g3WasAuction = !!item.auctionEndsAt;
                  const g3Expired = g3WasAuction && g3EndDate && !isNaN(g3EndDate.getTime()) && g3EndDate.getTime() <= Date.now();
                  const g3TimerFin = timerStr === 'Finalizada';
                  const g3Closed = g3WasAuction && (g3Expired || g3TimerFin);
                  const displayPrice = g3Closed
                    ? (item.currentBid || 0)
                    : isAuction
                    ? (item.currentBid || item.price)
                    : item.price;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`group relative bg-slate-900/90 border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-left flex flex-col ${
                        g3Closed
                          ? 'border-red-900/40 hover:border-red-700/40 opacity-80'
                          : 'border-slate-800/90 hover:border-orange-500/50 hover:shadow-orange-950/30'
                      }`}
                    >
                      {/* Image — fixed compact height, no breakpoint overrides */}
                      <div className="relative w-full overflow-hidden bg-slate-950 shrink-0" style={{ height: '90px' }}>
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className={`w-full h-full object-cover transition-transform duration-500 ${g3Closed ? 'grayscale-[30%]' : 'group-hover:scale-110'}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                        {/* Flex overlay for top elements inside 3-column card */}
                        <div className="absolute top-1 left-1 right-1 flex items-start justify-between gap-1 z-10 pointer-events-none">
                          {/* Badges on left */}
                          <div className="flex flex-col gap-0.5 items-start">
                            {g3Closed ? (
                              <span className="inline-flex items-center px-1 py-0.5 rounded bg-red-900/95 text-red-200 text-[8px] font-extrabold uppercase">
                                Cerrada
                              </span>
                            ) : isAuction ? (
                              <span className="inline-flex items-center px-1 py-0.5 rounded bg-orange-600/95 text-white text-[8px] font-extrabold uppercase animate-pulse">
                                Subasta
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1 py-0.5 rounded bg-emerald-600/95 text-white text-[8px] font-extrabold uppercase">
                                Compra
                              </span>
                            )}
                            
                            {item.badgePromocion && !g3Closed && (
                              <span className="inline-flex items-center px-1 py-0.5 rounded bg-gradient-to-r from-red-600 to-orange-500 text-white text-[7.5px] font-black uppercase tracking-wider shadow-sm max-w-[65px] truncate">
                                {item.badgePromocion}
                              </span>
                            )}
                          </div>

                          {/* Actions on right — only star, no share here to avoid badge collision */}
                          <div className="flex items-center gap-0.5 pointer-events-auto">
                            {/* Fav star */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                              className="w-4 h-4 rounded-full bg-slate-950/80 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-all"
                              title="Favorito"
                            >
                              <Star className={`w-2 h-2 ${isFavorite(item.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Share button — bottom right, always accessible */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleShare(item); }}
                          className="absolute bottom-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-slate-950/85 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-orange-400 transition-all pointer-events-auto"
                          title="Compartir"
                        >
                          <Share2 className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* Content — ultra compact */}
                      <div className="p-1.5 flex flex-col flex-1 gap-0.5">
                        <h3 className="text-[10px] font-extrabold text-white group-hover:text-orange-400 transition-colors leading-tight line-clamp-2">{item.name}</h3>
                        <span className={`text-[11px] font-black font-mono ${ g3Closed ? 'text-red-400' : 'text-amber-400' }`}>
                          ${displayPrice.toLocaleString()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

            ) : viewMode === 'grid' ? (
              
              /* GRID VIEW CARDS — with PromoCards injected every 6 items */
              (() => {
                // 3 rotating promo card templates
                const PROMO_CARDS = [
                  {
                    key: 'promo-postular',
                    gradient: 'from-orange-950/60 via-slate-900 to-slate-900',
                    border: 'border-orange-500/30 hover:border-orange-400/60',
                    icon: <Package className="w-7 h-7 text-orange-400" />,
                    badge: '¡Gana dinero!',
                    badgeBg: 'bg-orange-600',
                    title: 'Publica tu equipo con nosotros',
                    desc: '¿Tienes maquinaria parada? La promovemos, conseguimos comprador y gestionamos la venta.',
                    cta: 'Postular Equipo',
                    ctaBg: 'bg-orange-600 hover:bg-orange-500',
                    action: () => { const btn = document.querySelector('[data-postular-trigger]') as HTMLElement; btn?.click(); },
                  },
                  {
                    key: 'promo-importar',
                    gradient: 'from-blue-950/40 via-slate-900 to-slate-900',
                    border: 'border-blue-500/30 hover:border-blue-400/60',
                    icon: <Ship className="w-7 h-7 text-blue-400" />,
                    badge: 'Importación directa',
                    badgeBg: 'bg-blue-600',
                    title: '¿No encuentras el equipo?',
                    desc: 'Lo importamos desde EE.UU. o China con inspección técnica, logística y entrega en Venezuela.',
                    cta: 'Solicitar Cotización',
                    ctaBg: 'bg-blue-600 hover:bg-blue-500',
                    action: () => onOpenCustomRequest ? onOpenCustomRequest() : setCustomRequestOpen(true),
                  },
                  {
                    key: 'promo-obra',
                    gradient: 'from-emerald-950/40 via-slate-900 to-slate-900',
                    border: 'border-emerald-500/30 hover:border-emerald-400/60',
                    icon: <Building2 className="w-7 h-7 text-emerald-400" />,
                    badge: 'Obra a llave en mano',
                    badgeBg: 'bg-emerald-600',
                    title: '¿Tienes un proyecto de construcción?',
                    desc: 'Makimport ejecuta obras civiles de principio a fin. Equipos propios, mano de obra certificada.',
                    cta: 'Cotizar mi Obra',
                    ctaBg: 'bg-emerald-600 hover:bg-emerald-500',
                    action: () => { const el = document.getElementById('cotizar-obra'); el?.scrollIntoView({ behavior: 'smooth' }); },
                  },
                ];

                const elements: React.ReactNode[] = [];
                filteredAndSortedItems.forEach((item, index) => {
                  // Inject promo card before every 6th item (positions 6, 12, 18…)
                  if (index > 0 && index % 6 === 0) {
                    const promoTypes = [
                      {
                        key: 'promo-postular',
                        border: 'border-orange-500/40',
                        glow: 'shadow-orange-950/30',
                        topBar: 'bg-orange-600',
                        icon: <Package className="w-8 h-8 text-white" />,
                        eyebrow: '💰 ¡Gana dinero con tu equipo!',
                        title: 'Publica tu maquinaria con nosotros',
                        desc: '¿Tienes un equipo parado? Lo promovemos, encontramos comprador y gestionamos toda la venta por ti.',
                        cta: 'Postular mi Equipo →',
                        ctaClass: 'bg-orange-600 hover:bg-orange-500 shadow-orange-950/50',
                        action: () => onOpenPostularEquipo ? onOpenPostularEquipo() : undefined,
                      },
                      {
                        key: 'promo-importar',
                        border: 'border-sky-500/40',
                        glow: 'shadow-sky-950/30',
                        topBar: 'bg-sky-600',
                        icon: <Ship className="w-8 h-8 text-white" />,
                        eyebrow: '🌎 Importación directa EE.UU. / China',
                        title: '¿No encuentras el equipo que necesitas?',
                        desc: 'Lo importamos por ti con inspección técnica certificada, flete y entrega en Venezuela.',
                        cta: 'Solicitar Cotización →',
                        ctaClass: 'bg-sky-600 hover:bg-sky-500 shadow-sky-950/50',
                        action: () => onOpenCustomRequest ? onOpenCustomRequest() : setCustomRequestOpen(true),
                      },
                      {
                        key: 'promo-obra',
                        border: 'border-emerald-500/40',
                        glow: 'shadow-emerald-950/30',
                        topBar: 'bg-emerald-600',
                        icon: <Building2 className="w-8 h-8 text-white" />,
                        eyebrow: '🏗️ Llave en mano',
                        title: '¿Tienes un proyecto de construcción?',
                        desc: 'Makimport ejecuta tu obra de principio a fin: equipos propios, mano de obra certificada y tiempos garantizados.',
                        cta: 'Cotizar mi Obra →',
                        ctaClass: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50',
                        action: () => {
                          const el = document.getElementById('import-calculator');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        },
                      },
                    ];
                    const promo = promoTypes[(index / 6 - 1) % promoTypes.length];
                    elements.push(
                      <div
                        key={promo.key + '-' + index}
                        className={`col-span-2 rounded-2xl border ${promo.border} bg-slate-900/80 shadow-xl ${promo.glow} overflow-hidden`}
                      >
                        {/* Coloured top bar */}
                        <div className={`${promo.topBar} px-5 py-3 flex items-center gap-3`}>
                          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            {promo.icon}
                          </div>
                          <p className="text-xs font-extrabold text-white uppercase tracking-widest">{promo.eyebrow}</p>
                        </div>
                        {/* Body */}
                        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-base sm:text-lg font-extrabold text-white leading-tight">{promo.title}</p>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{promo.desc}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); promo.action(); }}
                            className={`shrink-0 w-full sm:w-auto px-6 py-3 ${promo.ctaClass} text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all hover:-translate-y-0.5`}
                          >
                            {promo.cta}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  const isAuction = item.status === 'auction';
                  const timerStr = timeLeftMap[item.id] || 'Cargando...';
                  let cardEndDate: Date | null = null;
                  if (item.auctionEndsAt) {
                    try { cardEndDate = item.auctionEndsAt instanceof Date ? item.auctionEndsAt : new Date(item.auctionEndsAt); } catch { cardEndDate = null; }
                  }
                  const wasAuctionItem = !!item.auctionEndsAt;
                  const isAuctionExpired = wasAuctionItem && cardEndDate && !isNaN(cardEndDate.getTime()) && cardEndDate.getTime() <= Date.now();
                  const isTimerFinalizada = timerStr === 'Finalizada';
                  const isClosed = wasAuctionItem && (isAuctionExpired || isTimerFinalizada);
                  const displayPrice = isClosed
                    ? (item.currentBid || 0)
                    : isAuction
                    ? (item.currentBid || item.price)
                    : item.price;
                  const isHighDemand = (item.bidsCount || 0) >= 8;

                  elements.push(
                    <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`relative group bg-slate-900/90 border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between cursor-pointer ${
                      isClosed
                        ? 'border-red-900/40 hover:border-red-700/40 hover:shadow-red-950/20 opacity-80'
                        : 'border-slate-800/90 hover:border-orange-500/50 hover:shadow-orange-950/30'
                    }`}
                  >

                    <div>
                        {/* Image Container with square aspect ratio */}
                        <div className="relative aspect-square w-full overflow-hidden bg-slate-950">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className={`w-full h-full object-cover transition-transform duration-500 ${isClosed ? 'grayscale-[30%]' : 'group-hover:scale-105'}`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

                          {/* Flex overlay for top elements in 2-column card */}
                          <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1.5 z-10 pointer-events-none">
                            {/* Badges on left */}
                            <div className="flex flex-col gap-1.5 items-start">
                              {/* Status Badge */}
                              <div>
                                {isClosed ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-900/95 border border-red-700/60 text-red-200 text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                                    <X className="w-2.5 h-2.5" />
                                    Cerrada
                                  </span>
                                ) : isAuction ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-600/95 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                                    <Gavel className="w-2.5 h-2.5 animate-pulse" />
                                    Subasta
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/95 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    Compra
                                  </span>
                                )}
                              </div>

                              {/* Manual urgency marketing badge */}
                              {item.badgePromocion && !isClosed && (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider rounded-r-xl rounded-bl-xl shadow-lg border border-red-500/20">
                                    <Flame className="w-3 h-3 text-white animate-bounce" style={{ animationDuration: '3s' }} />
                                    {item.badgePromocion}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Actions on right — only star, no share here to avoid badge collision */}
                            <div className="flex items-center gap-1.5 pointer-events-auto">
                              {/* Origin Tag */}
                              <div className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-white text-[10px] font-bold">
                                {item.origin === 'USA' ? '🇺🇸 EE.UU.' : item.origin === 'China' ? '🇨🇳 China' : '🇻🇪 VZLA'}
                              </div>

                              {/* Star Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(item.id);
                                }}
                                className="w-6 h-6 rounded-full bg-slate-950/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-all active:scale-95"
                                title={isFavorite(item.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
                              >
                                <Star className={`w-3.5 h-3.5 ${isFavorite(item.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {/* Share button — bottom right corner, always visible and unobstructed */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(item);
                            }}
                            className="absolute bottom-2 right-2 z-10 w-7 h-7 rounded-full bg-slate-950/85 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-orange-400 hover:border-orange-500/60 transition-all active:scale-95 pointer-events-auto"
                            title="Compartir"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-3 space-y-1">
                          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                            {item.brand} • {item.category}
                          </p>
                          <h3 className="text-sm font-extrabold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                            {item.name}
                          </h3>
                          <div className="pt-1">
                            <span className={`text-base font-black font-mono ${ isClosed ? 'text-red-400' : 'text-amber-400' }`}>
                              ${displayPrice.toLocaleString()} USD
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
                return <div className="grid grid-cols-2 gap-4 items-start">{elements}</div>;
              })()

            ) : (

              /* LIST VIEW CARDS */
              <div className="space-y-4">
                {filteredAndSortedItems.map((item) => {
                  const isAuction = item.status === 'auction';
                  const timerStr = timeLeftMap[item.id] || 'Cargando...';
                  let listEndDate: Date | null = null;
                  if (item.auctionEndsAt) {
                    try { listEndDate = item.auctionEndsAt instanceof Date ? item.auctionEndsAt : new Date(item.auctionEndsAt); } catch { listEndDate = null; }
                  }
                  const wasListAuctionItem = !!item.auctionEndsAt;
                  const isListAuctionExpired = wasListAuctionItem && listEndDate && !isNaN(listEndDate.getTime()) && listEndDate.getTime() <= Date.now();
                  const isListTimerFinalizada = timerStr === 'Finalizada';
                  const isListClosed = wasListAuctionItem && (isListAuctionExpired || isListTimerFinalizada);

                  return (
                    <div
                      key={item.id}
                      className="group bg-slate-900/90 border border-slate-800/90 hover:border-orange-500/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:shadow-xl"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
                        <div className="relative h-44 w-full sm:w-56 shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>

                          {/* Flex overlay for top elements inside list view image */}
                          <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1.5 z-10 pointer-events-none">
                            {/* Badges on left */}
                            <div className="flex flex-col gap-1.5 items-start">
                              <div className="px-2.5 py-0.5 rounded bg-slate-955 border border-slate-700 text-white text-[9px] font-extrabold uppercase tracking-wide">
                                {item.origin === 'USA' ? '🇺🇸 EE.UU.' : item.origin === 'China' ? '🇨🇳 China' : '🇻🇪 VZLA'}
                              </div>

                              {isListClosed ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-900/95 text-red-200 text-[8px] font-extrabold uppercase">
                                  Cerrada
                                </span>
                              ) : isAuction ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-orange-600/95 text-white text-[8px] font-extrabold uppercase animate-pulse">
                                  Subasta
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-600/95 text-white text-[8px] font-extrabold uppercase">
                                  Compra
                                </span>
                              )}

                              {item.badgePromocion && !isListClosed && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white text-[9px] font-black uppercase tracking-wider rounded-r-xl rounded-bl-xl shadow-lg border border-red-500/10">
                                  <Flame className="w-2.5 h-2.5 text-white" />
                                  {item.badgePromocion}
                                </span>
                              )}
                            </div>

                            {/* Actions on right */}
                            <div className="flex items-center gap-1 pointer-events-auto">
                              {/* Share Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(item);
                                }}
                                className="w-7 h-7 rounded-full bg-slate-950/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-orange-400 transition-all active:scale-95"
                                title="Compartir"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Star Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(item.id);
                                }}
                                className="w-7 h-7 rounded-full bg-slate-950/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-all active:scale-95"
                                title={isFavorite(item.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
                              >
                                <Star className={`w-3.5 h-3.5 ${isFavorite(item.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-orange-400 uppercase">{item.brand}</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-300">{item.category}</span>
                            {item.ciudadVenezuela && (
                              <>
                                <span className="text-xs text-slate-500">•</span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  {item.ciudadVenezuela}
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="text-xl font-extrabold text-white group-hover:text-orange-400 transition-colors">
                            {item.name} ({item.model})
                          </h3>

                          <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Año {item.year}
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <Gauge className="w-3.5 h-3.5 text-slate-400" />
                              {item.hours.toLocaleString()} {item.unidadUso || 'Horas'}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Inspección {item.inspectionScore}/100 PTS
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right space-y-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-medium block">
                            {isListClosed ? `Monto Final (${item.bidsCount || 0} pujas):` : isAuction ? `Puja Actual (${item.bidsCount || 0} pujas):` : 'Precio Directo:'}
                          </span>
                          <span className={`text-2xl font-black font-mono ${isListClosed ? 'text-red-400' : 'text-amber-400'}`}>
                            ${(
                              isListClosed
                                ? (item.currentBid || 0)             // puja ganadora final
                                : isAuction
                                ? (item.currentBid || item.price)   // puja actual
                                : item.price                        // precio fijo
                            ).toLocaleString()} USD
                          </span>
                          {isListClosed && (
                            <span className="block text-[10px] text-red-400/80 font-bold uppercase tracking-wider mt-0.5">Adjudicada</span>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedItem(item)}
                          className={`w-full sm:w-auto px-5 py-2.5 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors ${
                            isListClosed
                              ? 'bg-slate-700 hover:bg-slate-600 shadow-slate-950'
                              : 'bg-orange-600 hover:bg-orange-500 shadow-orange-950'
                          }`}
                        >
                          <span>{isListClosed ? 'Ver Ficha' : isAuction ? 'Pujar en Vivo' : 'Comprar Ahora'}</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            )}

          </main>

        </div>

      </div>

      {/* MOBILE DRAWER FILTERS */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in">
          <div className="w-full max-w-xs bg-slate-900 border-l border-slate-800 h-full p-5 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white text-sm">Filtros</span>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Categoría</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
              >
                <option value="all">Todas las Categorías</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Brand Dropdown */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Marca</label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
              >
                <option value="all">Todas las Marcas</option>
                {BRANDS.map((brand) => (
                  <option key={brand.value} value={brand.value}>{brand.label}</option>
                ))}
              </select>
            </div>

            {/* Model Input */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Modelo</label>
              <input
                type="text"
                placeholder="Escribe el modelo..."
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Year Range */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Rango de Año</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Desde"
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white text-center focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Hasta"
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white text-center focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  handleResetFilters();
                  setMobileFiltersOpen(false);
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl shadow-md"
              >
                Limpiar
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Machinery Detail Modal */}
      <MachineryDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenAuth={onOpenAuth}
        userRole={userRole}
      />

      {/* Custom Request Modal */}
      <CustomRequestModal
        isOpen={customRequestOpen}
        onClose={() => setCustomRequestOpen(false)}
      />

      {/* Fallback Share Modal */}
      {shareItem && (() => {
        const text = `MAKIMPORT - Oportunidad de Maquinaria Pesada\n\n${shareItem.name} (${shareItem.brand} ${shareItem.model})\nAño: ${shareItem.year}\nPrecio: $${shareItem.price.toLocaleString()} USD\nUbicación: ${shareItem.location}`;
        const url = `${window.location.origin}/?id=${shareItem.id}#catalogo-marketplace`;
        
        const handleCopyLink = () => {
          navigator.clipboard.writeText(url).then(() => {
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
          });
        };

        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n' + url)}`;
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
              <button
                onClick={() => setShareItem(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center pb-2">
                <Share2 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h3 className="text-base font-extrabold text-white text-center">Compartir Equipo</h3>
                <p className="text-[11px] text-slate-400 mt-1">Comparte la información de {shareItem.name} por redes sociales</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/60 rounded-xl text-emerald-400 hover:text-white transition-all font-bold text-xs"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 p-3 bg-sky-950/40 border border-sky-500/20 hover:border-sky-500/60 rounded-xl text-sky-400 hover:text-white transition-all font-bold text-xs"
                >
                  <Send className="w-6 h-6" />
                  <span>Telegram</span>
                </a>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-750"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Enlace Ficha</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })()}
    </section>
  );
};
