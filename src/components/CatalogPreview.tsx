'use client';

import React, { useState, useEffect } from 'react';
import { MachineryModal } from './MachineryModal';
import { MachineryItem } from '@/types/machinery';
import { Gavel, CheckCircle2, Clock, MapPin, Gauge, Calendar, ShieldCheck, ArrowUpRight, Search, Ship, Filter, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CatalogPreviewProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  externalFilters?: { brand: string; type: string; origin: string; transaction: string };
  userRole: 'admin' | 'client';
  onOpenAdminPublish: () => void;
  customItems?: MachineryItem[];
}

// Initial Heavy Machinery Dataset
const INITIAL_ITEMS: MachineryItem[] = [
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
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 18 + 1000 * 60 * 42),
    image: 'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800'],
    serialNumber: 'CAT0320DL098421',
    engineSpecs: 'Cat C6.4 ACERT (148 HP)',
    inspectionScore: 94,
    description: 'Excavadora hidráulica Caterpillar 320D L en excelente condición operativa. Cadena y zapatas al 85% de vida útil, sistema hidráulico sin fugas.'
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
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 5 + 1000 * 60 * 15),
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800'],
    serialNumber: 'KMTPC200-87421',
    engineSpecs: 'Komatsu SAA6D107E-1 (148 HP)',
    inspectionScore: 92,
    description: 'Komatsu PC200-8 probada en campo con mantenimiento de distribuidor oficial. Cabina con A/C operativo.'
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
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800'],
    serialNumber: 'CATD6TXL003912',
    engineSpecs: 'Cat C9.3 ACERT (207 HP)',
    inspectionScore: 96,
    description: 'Tractor de Orugas CAT D6T XL con hoja SU, ripper de 3 vástagos, transmisión Powershift y tren de rodaje Heavy Duty.'
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
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 32 + 1000 * 60 * 10),
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=800'],
    serialNumber: 'SNY215C992104',
    engineSpecs: 'Isuzu 4HK1X (172 HP)',
    inspectionScore: 95,
    description: 'Excavadora SANY SY215C seminueva de baja horas. Motor Isuzu certificado, bombas Kawasaki.'
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
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800'],
    serialNumber: 'XCMG215D884102',
    engineSpecs: 'Cummins QSB7 (178 HP)',
    inspectionScore: 91,
    description: 'XCMG XE215D disponible para compra e importación inmediata. Excelente rendimiento de combustible.'
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
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 9 + 1000 * 60 * 30),
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800'],
    serialNumber: 'VLVEC220D12948',
    engineSpecs: 'Volvo D6E (174 HP)',
    inspectionScore: 93,
    description: 'Volvo EC220D importada de EE.UU. con modo ECO de ahorro de diésel y tubería hidráulica auxiliar instalada.'
  }
];

export const CatalogPreview: React.FC<CatalogPreviewProps> = ({
  onOpenAuth,
  externalFilters,
  userRole,
  onOpenAdminPublish,
  customItems = []
}) => {
  const [items, setItems] = useState<MachineryItem[]>([...INITIAL_ITEMS, ...customItems]);
  const [selectedItem, setSelectedItem] = useState<MachineryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'auction' | 'direct'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [timeLeftMap, setTimeLeftMap] = useState<{ [key: string]: string }>({});

  // Sync custom published items
  useEffect(() => {
    if (customItems.length > 0) {
      setItems((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const newToAdd = customItems.filter((ci) => !existingIds.has(ci.id));
        return [...newToAdd, ...prev];
      });
    }
  }, [customItems]);

  // Realtime Supabase Subscription for Bids & Machinery updates
  useEffect(() => {
    const channel = supabase
      .channel('public_realtime_changes')
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
                    currentBid: Math.max(item.currentBid || 0, Number(newBid.monto_puja))
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
          const newMach = payload.new;
          if (newMach) {
            const photos = Array.isArray(newMach.fotos_urls) && newMach.fotos_urls.length > 0
              ? newMach.fotos_urls
              : ['https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800'];

            const converted: MachineryItem = {
              id: newMach.id,
              name: newMach.titulo,
              brand: newMach.marca,
              model: newMach.modelo,
              year: newMach.ano,
              hours: newMach.horas_uso,
              category: 'Excavadora',
              origin: (newMach.ubicacion_origen?.includes('China') ? 'China' : 'USA') as 'USA' | 'China',
              location: newMach.ubicacion_origen || 'Houston, TX - EE.UU.',
              destinationPort: 'Puerto Cabello, VZLA',
              status: newMach.es_subasta ? 'auction' : 'direct',
              price: Number(newMach.precio_compra_inmediata),
              currentBid: newMach.es_subasta ? Number(newMach.puja_actual || newMach.precio_inicial_subasta) : undefined,
              auctionEndsAt: newMach.fecha_fin_subasta ? new Date(newMach.fecha_fin_subasta) : undefined,
              image: photos[0],
              images: photos,
              serialNumber: 'SN-' + (newMach.id ? String(newMach.id).substring(0, 8) : '001'),
              engineSpecs: 'Motor Industrial',
              inspectionScore: 94,
              description: newMach.condicion_detalles || 'Maquinaria pesada publicada.'
            };
            setItems((prev) => [converted, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Real-time countdown timer tick
  useEffect(() => {
    const updateTimers = () => {
      const newMap: { [key: string]: string } = {};
      items.forEach((item) => {
        if (item.status === 'auction' && item.auctionEndsAt) {
          const diff = item.auctionEndsAt.getTime() - Date.now();
          if (diff <= 0) {
            newMap[item.id] = 'Finalizada';
          } else {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            newMap[item.id] = `${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
          }
        }
      });
      setTimeLeftMap(newMap);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [items]);

  // Handle local bid placement in state for immediate feedback
  const handleBidPlaced = (machineryId: string, newBidAmount: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === machineryId) {
          return {
            ...item,
            currentBid: newBidAmount
          };
        }
        return item;
      })
    );
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (activeTab === 'auction' && item.status !== 'auction') return false;
    if (activeTab === 'direct' && item.status !== 'direct') return false;

    if (selectedBrand !== 'all' && item.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    if (selectedOrigin !== 'all' && item.origin !== selectedOrigin) return false;

    if (externalFilters) {
      if (externalFilters.brand !== 'all' && item.brand.toLowerCase() !== externalFilters.brand.toLowerCase()) return false;
      if (externalFilters.origin !== 'all' && item.origin !== externalFilters.origin) return false;
      if (externalFilters.transaction === 'auction' && item.status !== 'auction') return false;
      if (externalFilters.transaction === 'direct' && item.status !== 'direct') return false;
    }

    return true;
  });

  return (
    <section id="catalogo" className="py-24 bg-slate-950 relative scroll-mt-10">
      
      <div id="subastas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Gavel className="w-3.5 h-3.5" />
              <span>Inventario Verificado EE.UU. & China ➔ Venezuela</span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Catálogo de Maquinaria Pesada
              </h2>

              {userRole === 'admin' && (
                <button
                  onClick={onOpenAdminPublish}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-xl shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar Máquina (Admin)</span>
                </button>
              )}
            </div>

            <p className="text-slate-400 text-sm mt-2 max-w-2xl">
              Explora subastas activas en vivo y unidades de compra inmediata con despacho marítimo a Puerto Cabello y La Guaira.
            </p>
          </div>

          {/* Transaction Filter Tabs */}
          <div className="flex items-center p-1.5 bg-slate-900 border border-slate-800 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('auction')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'auction'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Subastas en Vivo</span>
            </button>
            <button
              onClick={() => setActiveTab('direct')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'direct'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Compra Inmediata</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-orange-500" />
              <span>Filtrar por:</span>
            </span>

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">Todas las marcas</option>
              <option value="caterpillar">Caterpillar</option>
              <option value="komatsu">Komatsu</option>
              <option value="sany">SANY</option>
              <option value="xcmg">XCMG</option>
              <option value="volvo">Volvo</option>
            </select>

            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">Todos los orígenes</option>
              <option value="USA">🇺🇸 EE.UU. (Houston / Miami)</option>
              <option value="China">🇨🇳 China (Shanghai / Ningbo)</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Mostrando <strong className="text-white">{filteredItems.length}</strong> de <strong>{items.length}</strong> máquinas disponibles
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const isAuction = item.status === 'auction';
            const timerStr = timeLeftMap[item.id] || 'Cargando...';

            return (
              <div
                key={item.id}
                className="group bg-slate-900/90 border border-slate-800/90 hover:border-orange-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-orange-950/30 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

                    <div className="absolute top-3 left-3">
                      {isAuction ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-600/95 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg">
                          <Gavel className="w-3 h-3 animate-pulse" />
                          Subasta Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600/95 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg">
                          <CheckCircle2 className="w-3 h-3" />
                          Compra Inmediata
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-white text-xs font-bold">
                      {item.origin === 'USA' ? '🇺🇸 EE.UU.' : '🇨🇳 China'}
                    </div>

                    {isAuction && (
                      <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md border border-orange-500/40 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-orange-400 animate-spin" style={{ animationDuration: '4s' }} />
                          Cierra en:
                        </span>
                        <span className="font-mono font-extrabold text-amber-400 tracking-wider">
                          {timerStr}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                        {item.brand} • {item.category}
                      </span>
                      <h3 className="text-xl font-extrabold text-white group-hover:text-orange-400 transition-colors mt-0.5">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {item.model}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <span className="text-[10px] text-slate-500 block">Año</span>
                          <span className="font-bold text-white">{item.year}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex items-center gap-2">
                        <Gauge className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <span className="text-[10px] text-slate-500 block">Horas uso</span>
                          <span className="font-bold text-white">{item.hours.toLocaleString()} h</span>
                        </div>
                      </div>

                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex items-center gap-2 col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        <div className="truncate">
                          <span className="text-[10px] text-slate-500 block">Origen ➔ Destino</span>
                          <span className="font-bold text-slate-200 truncate block">
                            {item.location} ➔ Puerto Cabello
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">
                        {isAuction ? 'Puja Actual Auditada:' : 'Precio Compra Directa:'}
                      </span>
                      <span className="text-xl font-black text-amber-400">
                        ${(isAuction ? item.currentBid || item.price : item.price).toLocaleString()} USD
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 font-bold block bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                        ✓ Inspección {item.inspectionScore}/100
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedItem(item)}
                    className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-950 transition-colors"
                  >
                    <span>{isAuction ? 'Pujar en Vivo / Ver Detalle' : 'Ver Detalles & Comprar'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      <MachineryModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenAuth={onOpenAuth}
        userRole={userRole}
        onBidSuccess={(amount) => {
          if (selectedItem) {
            handleBidPlaced(selectedItem.id, amount);
          }
        }}
      />
    </section>
  );
};
