'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Gauge, Calendar, ShieldCheck, Gavel, DollarSign, Phone, CheckCircle2, Ship, FileText, Send, Instagram, Download, ChevronLeft, ChevronRight, Eye, AlertCircle, ShoppingBag, CreditCard, MessageCircle } from 'lucide-react';
import { MachineryItem, BidRecord } from '@/types/machinery';
import { supabase } from '@/lib/supabase';
import { PurchaseRequestModal } from './PurchaseRequestModal';
import { useAuth } from '@/context/AuthContext';

interface MachineryDetailModalProps {
  item: MachineryItem | null;
  onClose: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  userRole?: 'admin' | 'client';
  onBidSuccess?: (machineryId: string, amount: number) => void;
}

export const MachineryDetailModal: React.FC<MachineryDetailModalProps> = ({
  item,
  onClose,
  onOpenAuth,
  userRole = 'client',
  onBidSuccess
}) => {
  const { user } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  // Bidding states
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidsLog, setBidsLog] = useState<BidRecord[]>([]);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Timer state
  const [timerString, setTimerString] = useState<string>('00d : 00h : 00m : 00s');

  const [prevItemId, setPrevItemId] = useState<string | null>(null);
  const [isProcessingEnd, setIsProcessingEnd] = useState(false);
  const [winnerProfile, setWinnerProfile] = useState<any | null>(null);
  const [showAwardModal, setShowAwardModal] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Fecha no disponible';
    }
  };

  const fetchBidsHistory = async (machineryId: string) => {
    try {
      const { data, error } = await supabase
        .from('bid_history_view')
        .select('*')
        .eq('machinery_id', machineryId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('Error loading bid history:', error);
        return;
      }

      if (data) {
        const records: BidRecord[] = data.map((row: any) => ({
          id: row.id || `bid-${row.created_at}`,
          machineryId: row.machinery_id,
          userName: row.bidder_name || 'Comprador Anónimo',
          amount: Number(row.amount),
          timestamp: formatTimestamp(row.created_at)
        }));
        setBidsLog(records);

        if (data.length > 0 && item) {
          const highestAmount = Number(data[0].amount);
          setBidAmount(highestAmount + (item.minBidIncrement || 500));
        } else if (item) {
          setBidAmount(item.currentBid || item.price);
        }
      }
    } catch (err) {
      console.warn('Error fetching bid history:', err);
    }
  };

  const handleAuctionEnd = async () => {
    if (isProcessingEnd || !item) return;
    setIsProcessingEnd(true);

    try {
      // 1. If it's still status='auction', update it in the database to es_subasta = false
      if (item.status === 'auction') {
        const { error: updateError } = await supabase
          .from('machinery')
          .update({ es_subasta: false })
          .eq('id', item.id);
        
        if (updateError) {
          console.error('Error marking auction as ended:', updateError);
        }
      }

      // 2. Query the highest bid to find the winner
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .eq('machinery_id', item.id)
        .order('amount', { ascending: false })
        .limit(1);

      if (bidsError) {
        console.error('Error fetching winning bid:', bidsError);
        return;
      }

      if (bidsData && bidsData.length > 0) {
        const winningBid = bidsData[0];
        const winnerId = winningBid.user_id;
        const finalAmount = Number(winningBid.amount);

        // Fetch winner's profile details
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', winnerId)
          .single();

        if (profileError) {
          console.error('Error fetching winner profile:', profileError);
        } else if (profileData) {
          setWinnerProfile({
            ...profileData,
            amount: finalAmount
          });

          // Trigger email notification to admin & winner
          try {
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'auction_closed',
                machineryId: item.id,
                machineryTitle: item.name,
                machineryBrand: item.brand,
                machineryModel: item.model,
                finalAmount: finalAmount,
                winnerName: profileData.nombre_completo,
                winnerEmail: profileData.email,
                winnerPhone: profileData.telefono || 'No especificado',
                closedAt: new Date().toISOString()
              })
            });
          } catch (emailErr) {
            console.error('Error sending auction end emails:', emailErr);
          }

          // If the logged-in user is the winner, open the award modal!
          if (user && user.id === winnerId) {
            setShowAwardModal(true);
          }
        }
      }
    } catch (err) {
      console.error('Error in handleAuctionEnd:', err);
    } finally {
      setIsProcessingEnd(false);
    }
  };

  const checkWinnerStatus = async (machineryId: string) => {
    try {
      const { data: bidsData } = await supabase
        .from('bids')
        .select('*')
        .eq('machinery_id', machineryId)
        .order('amount', { ascending: false })
        .limit(1);

      if (bidsData && bidsData.length > 0) {
        const winningBid = bidsData[0];
        if (user && user.id === winningBid.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', winningBid.user_id)
            .single();
          
          if (profileData) {
            setWinnerProfile({
              ...profileData,
              amount: Number(winningBid.amount)
            });
            setShowAwardModal(true);
          }
        }
      }
    } catch (err) {
      console.warn('Error checking winner status:', err);
    }
  };

  useEffect(() => {
    if (item) {
      if (item.id !== prevItemId) {
        setSelectedImageIndex(0);
        setPrevItemId(item.id);
        setShowAwardModal(false);
        setWinnerProfile(null);
      }
      
      // Fetch initial history
      fetchBidsHistory(item.id);

      // Check if auction is already ended
      const isExpired = item.auctionEndsAt ? item.auctionEndsAt.getTime() <= Date.now() : false;
      if (item.status === 'auction' && isExpired) {
        handleAuctionEnd();
      } else if (isExpired || item.status === 'direct') {
        checkWinnerStatus(item.id);
      }
    }
  }, [item, user]);

  // Realtime Supabase Subscription for live bids
  useEffect(() => {
    if (!item) return;

    const channel = supabase
      .channel(`bids_modal_${item.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bids', filter: `machinery_id=eq.${item.id}` },
        async (payload) => {
          const newBid = payload.new;
          if (newBid) {
            // Re-fetch bids history to get bidder name
            await fetchBidsHistory(item.id);
            
            const newAmount = Number(newBid.amount);
            setBidAmount(newAmount + (item.minBidIncrement || 500));
            
            if (onBidSuccess) {
              onBidSuccess(item.id, newAmount);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [item]);

  // Countdown timer tick
  useEffect(() => {
    if (!item || item.status !== 'auction' || !item.auctionEndsAt) return;

    const updateTimer = () => {
      const diff = item.auctionEndsAt!.getTime() - Date.now();
      if (diff <= 0) {
        setTimerString('Subasta Finalizada');
        handleAuctionEnd();
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimerString(`${days.toString().padStart(2, '0')}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [item]);

  if (!item) return null;

  const currentHighestBid = bidsLog.length > 0 ? Math.max(...bidsLog.map((b) => b.amount)) : (item.currentBid || item.price);
  const minRequiredBid = bidsLog.length > 0 ? currentHighestBid + (item.minBidIncrement || 500) : currentHighestBid;
  const isExpired = item.auctionEndsAt ? item.auctionEndsAt.getTime() <= Date.now() : false;

  const handlePlaceBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onOpenAuth('login');
      return;
    }

    if (bidAmount < minRequiredBid) {
      showToast(`El monto de la puja debe ser al menos de $${minRequiredBid.toLocaleString()} USD (incremento mínimo +$${item.minBidIncrement || 500}).`, 'error');
      return;
    }

    setSubmittingBid(true);

    try {
      const { data, error } = await supabase.from('bids').insert({
        machinery_id: item.id,
        user_id: user.id,
        amount: Number(bidAmount)
      }).select();

      if (error) {
        throw error;
      }

      showToast(`¡Puja enviada exitosamente por $${Number(bidAmount).toLocaleString()} USD!`, 'success');
      setBidAmount(Number(bidAmount) + (item.minBidIncrement || 500));

      if (onBidSuccess) {
        onBidSuccess(item.id, Number(bidAmount));
      }
    } catch (err: any) {
      console.error('[Bidding Exception]:', err);
      showToast(err.message || 'Error al procesar tu puja. Intenta de nuevo.', 'error');
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleDirectPurchase = () => {
    setShowPurchaseModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300">
            <span className="text-orange-400">{item.brand}</span>
            <span>•</span>
            <span className="text-white">{item.model}</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400 font-mono">VIN: {item.serialNumber}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg border border-slate-800 bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          
          {/* LEFT 7 COLS: Gallery & Technical Specs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Image Gallery Viewer */}
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
              <img
                src={item.images[selectedImageIndex] || item.images[0]}
                alt={item.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {isExpired ? (
                  <span className="px-3 py-1 rounded-full bg-red-600/95 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    Subasta Finalizada
                  </span>
                ) : item.status === 'auction' ? (
                  <span className="px-3 py-1 rounded-full bg-orange-600/95 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5 animate-pulse" />
                    Subasta Activa
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-600/95 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Compra Inmediata
                  </span>
                )}
                
                {item.financingAvailable && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-950 text-xs font-bold flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    Financiamiento Disponible
                  </span>
                )}
              </div>

              {/* Origin Tag */}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white text-xs font-bold">
                {item.origin === 'USA' ? '🇺🇸 EE.UU. (Houston/Miami)' : item.origin === 'China' ? '🇨🇳 China (Shanghai/Ningbo)' : '🇻🇪 Puerto Cabello'}
              </div>

              {/* Image Navigation Arrows */}
              {item.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : item.images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 border border-slate-800 text-white hover:bg-orange-600 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev < item.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 border border-slate-800 text-white hover:bg-orange-600 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Carousel Selector */}
            {item.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {item.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === idx ? 'border-orange-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Machine Specs Grid */}
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-white">
                {item.name} ({item.model})
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Año de Fabricación</span>
                  <span className="font-bold text-white flex items-center gap-1.5 mt-1">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    {item.year}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Horas de Motor</span>
                  <span className="font-bold text-white flex items-center gap-1.5 mt-1">
                    <Gauge className="w-4 h-4 text-orange-400" />
                    {item.hours.toLocaleString()} hrs
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Inspección Mecánica</span>
                  <span className="font-extrabold text-emerald-400 flex items-center gap-1.5 mt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {item.inspectionScore} / 100 PTS
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Ubicación Origen</span>
                  <span className="font-semibold text-slate-200 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    {item.location}
                  </span>
                </div>

                {/* Venezuela city badge — only shown when machine is physically in Venezuela */}
                {item.ciudadVenezuela && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-emerald-800/50 col-span-2 sm:col-span-1">
                    <span className="text-emerald-500 block text-[10px] uppercase font-bold">🇻🇪 Ciudad en Venezuela</span>
                    <span className="font-bold text-emerald-300 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {item.ciudadVenezuela}, Venezuela
                    </span>
                  </div>
                )}

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Puerto de Destino</span>
                  <span className="font-semibold text-slate-200 flex items-center gap-1 mt-1 truncate">
                    <Ship className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    {item.destinationPort || 'Puerto Cabello, VZLA'}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Tránsito Estimado</span>
                  <span className="font-semibold text-slate-200 flex items-center gap-1 mt-1 truncate">
                    <Ship className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                    {item.transitTime || '25-35 días'}
                  </span>
                </div>
              </div>

              {/* Technical Inspection Scores Breakdown */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Desglose de Inspección Técnica</span>
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-[10px] text-slate-400 font-semibold">
                  <div>
                    <span>General</span>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${item.inspeccionGeneral || item.inspectionScore || 90}%` }}></div>
                    </div>
                    <span className="block mt-1 font-mono text-white text-right">{item.inspeccionGeneral || item.inspectionScore || 90}%</span>
                  </div>

                  <div>
                    <span>Motor</span>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${item.inspeccionMotor || 90}%` }}></div>
                    </div>
                    <span className="block mt-1 font-mono text-white text-right">{item.inspeccionMotor || 90}%</span>
                  </div>

                  <div>
                    <span>Sistema Hidráulico</span>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${item.inspeccionHidraulico || 90}%` }}></div>
                    </div>
                    <span className="block mt-1 font-mono text-white text-right">{item.inspeccionHidraulico || 90}%</span>
                  </div>

                  <div>
                    <span>Transmisión</span>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${item.inspeccionTransmision || 90}%` }}></div>
                    </div>
                    <span className="block mt-1 font-mono text-white text-right">{item.inspeccionTransmision || 90}%</span>
                  </div>

                  <div>
                    <span>Cabina</span>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${item.inspeccionCabina || 90}%` }}></div>
                    </div>
                    <span className="block mt-1 font-mono text-white text-right">{item.inspeccionCabina || 90}%</span>
                  </div>

                  {item.inspeccionCauchos !== undefined && (
                    <div>
                      <span>Neumáticos</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full ${item.inspeccionCauchos >= 75 ? 'bg-emerald-500' : item.inspeccionCauchos >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${item.inspeccionCauchos}%` }}
                        ></div>
                      </div>
                      <span className="block mt-1 font-mono text-white text-right">{item.inspeccionCauchos}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Inspection PDF Report Trigger Card — Only shown if pdf_reporte_url exists */}
              {item.pdfReportUrl && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Reporte Oficial de Inspección Técnica (140+ Puntos)</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Certificado de motor, bombas hidráulicas, orugas y sistema de cabina.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPdfPreview(true)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5 text-orange-400" />
                    <span>Ver PDF</span>
                  </button>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT 5 COLS: Live Bidding & Action Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Realtime Auction Box */}
            {item.status === 'auction' || (item.auctionEndsAt && isExpired) ? (
              <div className={`bg-slate-950 border rounded-2xl p-5 space-y-5 shadow-xl relative overflow-hidden ${isExpired ? 'border-red-500/20' : 'border-orange-500/30'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Giant Live Countdown Timer */}
                <div className={`border rounded-xl p-4 text-center transition-all ${isExpired ? 'bg-red-950/20 border-red-500/30' : 'bg-slate-900/90 border-slate-800'}`}>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1 flex items-center justify-center gap-1.5">
                    <Clock className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-orange-500 animate-spin'}`} style={isExpired ? {} : { animationDuration: '6s' }} />
                    {isExpired ? 'Subasta Cerrada' : 'Tiempo Restante de Subasta'}
                  </span>
                  <span className={`text-2xl sm:text-3xl font-mono font-black tracking-widest block ${isExpired ? 'text-red-500' : 'text-amber-400'}`}>
                    {timerString}
                  </span>
                </div>

                {/* Current Bid Display */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">{isExpired ? 'Puja Final Alcanzada:' : 'Puja Actual Auditada:'}</span>
                    <span className="text-3xl font-black text-white font-mono">
                      ${currentHighestBid.toLocaleString()} USD
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Compra Directa:</span>
                    <span className="text-sm font-bold text-slate-400 font-mono">
                      ${item.price.toLocaleString()} USD
                    </span>
                  </div>
                </div>

                {/* Bidding Form */}
                <form onSubmit={handlePlaceBidSubmit} className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Monto de tu Oferta (USD):</span>
                    <span className="text-orange-400 font-bold font-mono">Mínimo: ${minRequiredBid.toLocaleString()} USD</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min={minRequiredBid}
                        step={item.minBidIncrement || 500}
                        value={bidAmount}
                        disabled={isExpired || submittingBid}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className={`w-full bg-slate-900 border rounded-xl pl-7 pr-3 py-2.5 text-white font-mono font-bold text-lg focus:outline-none focus:border-orange-500 ${isExpired ? 'border-slate-800 text-slate-500 bg-slate-950 cursor-not-allowed' : 'border-slate-700'}`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isExpired || submittingBid}
                      className={`px-5 py-3 text-white font-extrabold text-sm rounded-xl shadow-lg shrink-0 transition-all ${
                        isExpired 
                          ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-950'
                      }`}
                    >
                      {submittingBid ? 'Procesando...' : 'Pujar Ahora'}
                    </button>
                  </div>

                  {/* Quick Increment Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isExpired}
                      onClick={() => setBidAmount(currentHighestBid + 500)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                        isExpired 
                          ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      +$500 USD
                    </button>
                    <button
                      type="button"
                      disabled={isExpired}
                      onClick={() => setBidAmount(currentHighestBid + 1000)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                        isExpired 
                          ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      +$1,000 USD
                    </button>
                    <button
                      type="button"
                      disabled={isExpired}
                      onClick={() => setBidAmount(currentHighestBid + 2500)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                        isExpired 
                          ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      +$2,500 USD
                    </button>
                  </div>

                  {bidSuccessMessage && (
                    <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-bold text-center animate-in fade-in">
                      ✓ {bidSuccessMessage}
                    </div>
                  )}
                </form>

                {/* Realtime Bid History Stream */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Historial de Pujas en Vivo ({bidsLog.length})
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">Supabase Realtime</span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
                    {bidsLog.map((b, i) => (
                      <div
                        key={b.id || i}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-slate-300 font-medium block">{b.userName}</span>
                          <span className="text-[10px] text-slate-500">{b.timestamp}</span>
                        </div>
                        <span className="font-mono font-bold text-amber-400">${b.amount.toLocaleString()} USD</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (

              /* Direct Purchase Box */
              <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Precio de Compra Directa:</span>
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    ${item.price.toLocaleString()} USD
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Unidad disponible para adjudicación inmediata sin esperas de subasta. Incluye certificado de origen y logística de embarque.
                </p>

                <button
                  onClick={handleDirectPurchase}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingBag className="w-5 h-5 shrink-0" />
                  <span className="whitespace-nowrap">Solicitar Compra Inmediata</span>
                  <span className="font-mono text-xs opacity-90 whitespace-nowrap shrink-0">— ${item.price.toLocaleString()} USD</span>
                </button>

                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                  Al hacer clic, completarás un formulario breve. Luego serás redirigido a Telegram @makimportvzla para coordinar el proceso.
                </p>
              </div>
            )}

            {/* Direct Contact Options */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-slate-200 block leading-relaxed">
                ¿Dudas sobre esta maquinaria o buscas algún equipo en específico? Contáctanos directamente
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                <a
                  href={`https://t.me/makimportvzla?text=Hola%20MAKIMPORT,%20deseo%20informaci%C3%B3n%20sobre%20el%20equipo%20${encodeURIComponent(item.name)}%20(${item.model})`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-sky-600/20 hover:bg-sky-600 border border-sky-500/40 text-sky-300 hover:text-white flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Atención Telegram</span>
                </a>

                <a
                  href={`https://wa.me/584146370819?text=Hola%20MAKIMPORT%2C%20busco%20atenci%C3%B3n%20personalizada%20para%20la%20compra%2Fb%C3%BAsqueda%20de%20maquinaria.%20Me%20interesa%20el%20equipo%20${encodeURIComponent(item.name)}%20(${item.model}).`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Atención WhatsApp</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* PDF Inspection Preview Modal */}
      {showPdfPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Certificado de Inspección Técnica - MAKIMPORT VZLA</span>
              </div>
              <button onClick={() => setShowPdfPreview(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 text-xs text-slate-300 font-mono">
              <div className="flex justify-between font-bold text-orange-400 text-sm">
                <span>DOCUMENTO REGISTRADO: N° MKT-2026-8941</span>
                <span>STATUS: APROBADO 94%</span>
              </div>
              <hr className="border-slate-800" />
              <p>EQUIPO: {item.name} ({item.model})</p>
              <p>SERIE / VIN: {item.serialNumber}</p>
              <p>MOTOR: Prueba de compresión de cilindros OK. Sin emisiones inusuales.</p>
              <p>SISTEMA HIDRÁULICO: Presión de bomba principal 34.3 MPa (Estándar de fábrica).</p>
              <p>TREN DE RODAJE: Zapatas y bujes al 85% de vida útil restante.</p>
              <p>PRUEBA DE OPERACIÓN: 2 Horas continuas en banco de pruebas sin sobrecalentamiento.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {item.pdfReportUrl ? (
                <a
                  href={item.pdfReportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF Oficial</span>
                </a>
              ) : null}
              <button
                onClick={() => setShowPdfPreview(false)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Request Modal */}
      {showPurchaseModal && (
        <PurchaseRequestModal
          item={item}
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}

      {/* Award Modal */}
      {showAwardModal && winnerProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 animate-bounce">
              <Gavel className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ¡Felicidades, {winnerProfile.nombre_completo.split(' ')[0]}!
              </h2>
              <p className="text-xs text-slate-400">
                Has resultado ganador de esta subasta. El equipo te ha sido adjudicado oficialmente.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left space-y-3">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Resumen de Adjudicación</span>
              <div className="text-xs text-slate-300 space-y-1.5">
                <div className="flex justify-between">
                  <span>Maquinaria:</span>
                  <strong className="text-white">{item.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Marca / Modelo:</span>
                  <span className="text-white font-medium">{item.brand} / {item.model}</span>
                </div>
                <div className="flex justify-between">
                  <span>Número de Serie:</span>
                  <span className="text-slate-400 font-mono">{item.serialNumber}</span>
                </div>
                <hr className="border-slate-850 my-1" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-250">Precio de Cierre:</span>
                  <span className="text-lg font-mono font-black text-amber-400">${winnerProfile.amount.toLocaleString()} USD</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] text-slate-400 font-medium block leading-relaxed">
                Ponte en contacto con nuestro equipo comercial para coordinar el pago, el despacho y la nacionalización del equipo a Venezuela:
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-bold text-xs">
                <a
                  href={`https://wa.me/584146370819?text=${encodeURIComponent(
                    `¡Hola! Fui el ganador de la subasta del ${item.name} (${item.brand}/${item.model}) por un monto de $${winnerProfile.amount} USD. Deseo coordinar el pago y el despacho.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/40 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/55"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>Contactar WhatsApp</span>
                </a>

                <a
                  href={`https://t.me/makimportvzla?text=${encodeURIComponent(
                    `¡Hola! Fui el ganador de la subasta del ${item.name} (${item.brand}/${item.model}) por un monto de $${winnerProfile.amount} USD. Deseo coordinar el pago y el despacho.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 border border-sky-500/40 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-950/55"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>Contactar Telegram</span>
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowAwardModal(false)}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
