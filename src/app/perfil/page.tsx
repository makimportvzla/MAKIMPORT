'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  User as UserIcon, 
  Gavel, 
  ShoppingBag, 
  Save, 
  Phone, 
  CreditCard, 
  MapPin, 
  Globe, 
  Camera, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft,
  Calendar,
  Send,
  MessageCircle,
  Star,
  Wrench,
  Clock,
  Trash2,
  Heart,
  Building2,
  HelpCircle,
  Eye,
  HardHat,
  FileText,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

export default function PerfilPage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'auctions' | 'purchases' | 'rentals' | 'postulations' | 'projectQuotes' | 'serviceApplications' | 'favorites' | 'support'>('profile');
  
  // Profile state fields
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [cedulaRif, setCedulaRif] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('Venezuela');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Subastas ganadas & compras
  const [wonAuctions, setWonAuctions] = useState<any[]>([]);
  const [loadingAuctions, setLoadingAuctions] = useState(false);
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  // Solicitudes de Alquiler & Postulaciones
  const [rentalRequests, setRentalRequests] = useState<any[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(false);
  const [postulatedEquipments, setPostulatedEquipments] = useState<any[]>([]);
  const [loadingPostulations, setLoadingPostulations] = useState(false);

  // Cotizaciones de Proyectos y Postulaciones de Servicios
  const [projectQuotes, setProjectQuotes] = useState<any[]>([]);
  const [loadingProjectQuotes, setLoadingProjectQuotes] = useState(false);
  const [serviceApplications, setServiceApplications] = useState<any[]>([]);
  const [loadingServiceApplications, setLoadingServiceApplications] = useState(false);

  // Favoritos
  const [favoriteMachineries, setFavoriteMachineries] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Initialize form fields once profile loads
  useEffect(() => {
    if (profile) {
      setNombreCompleto(profile.nombre_completo || '');
      setCedulaRif(profile.cedula_rif || '');
      setTelefono(profile.telefono || '');
      setCiudad(profile.ciudad || '');
      setPais(profile.pais || 'Venezuela');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  // Load user data depending on tabs
  useEffect(() => {
    if (user) {
      if (activeTab === 'auctions') {
        fetchWonAuctions();
      } else if (activeTab === 'purchases') {
        fetchPurchaseRequests();
      } else if (activeTab === 'rentals') {
        fetchRentalRequests();
      } else if (activeTab === 'postulations') {
        fetchPostulatedEquipments();
      } else if (activeTab === 'projectQuotes') {
        fetchProjectQuotes();
      } else if (activeTab === 'serviceApplications') {
        fetchServiceApplications();
      } else if (activeTab === 'favorites') {
        fetchFavorites();
      }
    }
  }, [user, activeTab]);

  const fetchWonAuctions = async () => {
    if (!user) return;
    setLoadingAuctions(true);
    try {
      const { data: userBidsData } = await supabase
        .from('bids')
        .select('machinery_id, amount')
        .eq('user_id', user.id);

      const bidsList = Array.isArray(userBidsData) ? userBidsData : [];
      const userMaxBids: { [key: string]: number } = {};
      bidsList.forEach((b: any) => {
        userMaxBids[b.machinery_id] = Math.max(userMaxBids[b.machinery_id] || 0, Number(b.amount || 0));
      });

      const uniqueMachineryIds = Object.keys(userMaxBids);
      if (uniqueMachineryIds.length === 0) {
        setWonAuctions([]);
        setLoadingAuctions(false);
        return;
      }

      const { data: machineryData } = await supabase
        .from('machinery')
        .select('*')
        .in('id', uniqueMachineryIds)
        .eq('es_subasta', false);

      const machList = Array.isArray(machineryData) ? machineryData : [];

      const wonList: any[] = [];
      for (const mach of machList) {
        const { data: highestBidData } = await supabase
          .from('bids')
          .select('amount, user_id')
          .eq('machinery_id', mach.id)
          .order('amount', { ascending: false })
          .limit(1);

        if (highestBidData && highestBidData.length > 0) {
          const topBid = highestBidData[0];
          if (topBid.user_id === user.id) {
            wonList.push({
              machinery: {
                id: mach.id,
                name: mach.titulo,
                brand: mach.marca,
                model: mach.modelo,
                image: Array.isArray(mach.fotos_urls) && mach.fotos_urls.length > 0 
                  ? mach.fotos_urls[0] 
                  : 'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800'
              },
              amount: Number(topBid.amount),
              closedAt: mach.fecha_fin_subasta ? new Date(mach.fecha_fin_subasta).toLocaleDateString('es-VE') : 'Recientemente'
            });
          }
        }
      }
      setWonAuctions(wonList);
    } catch (e) {
      console.error('Error loading won auctions:', e);
    } finally {
      setLoadingAuctions(false);
    }
  };

  const fetchPurchaseRequests = async () => {
    if (!user) return;
    setLoadingPurchases(true);
    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPurchaseRequests(data);
      }
    } catch (err) {
      console.warn('Error loading purchase requests:', err);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const fetchRentalRequests = async () => {
    if (!user) return;
    setLoadingRentals(true);
    try {
      const { data, error } = await supabase
        .from('rental_requests')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRentalRequests(data);
      }
    } catch (err) {
      console.warn('Error loading rental requests:', err);
    } finally {
      setLoadingRentals(false);
    }
  };

  const fetchPostulatedEquipments = async () => {
    if (!user) return;
    setLoadingPostulations(true);
    try {
      const { data, error } = await supabase
        .from('owner_machinery')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPostulatedEquipments(data);
      }
    } catch (err) {
      console.warn('Error loading postulated equipments:', err);
    } finally {
      setLoadingPostulations(false);
    }
  };

  const fetchProjectQuotes = async () => {
    if (!user) return;
    setLoadingProjectQuotes(true);
    try {
      const { data, error } = await supabase
        .from('project_quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProjectQuotes(data);
      }
    } catch (err) {
      console.warn('Error loading project quotes:', err);
    } finally {
      setLoadingProjectQuotes(false);
    }
  };

  const fetchServiceApplications = async () => {
    if (!user) return;
    setLoadingServiceApplications(true);
    try {
      const { data, error } = await supabase
        .from('services_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setServiceApplications(data);
      }
    } catch (err) {
      console.warn('Error loading service applications:', err);
    } finally {
      setLoadingServiceApplications(false);
    }
  };

  const handleDeleteProjectQuote = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta solicitud de cotización?')) return;
    try {
      const { error } = await supabase.from('project_quotes').delete().eq('id', id);
      if (!error) {
        setProjectQuotes(prev => prev.filter(q => q.id !== id));
      } else {
        alert('Error al eliminar el registro');
      }
    } catch (err) {
      console.warn('Error deleting project quote:', err);
    }
  };

  const handleDeleteServiceApplication = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta postulación de servicio?')) return;
    try {
      const { error } = await supabase.from('services_applications').delete().eq('id', id);
      if (!error) {
        setServiceApplications(prev => prev.filter(s => s.id !== id));
      } else {
        alert('Error al eliminar el registro');
      }
    } catch (err) {
      console.warn('Error deleting service application:', err);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    setLoadingFavorites(true);
    try {
      const stored = localStorage.getItem(`makimport_favorites_${user.id}`);
      const favIds = stored ? JSON.parse(stored) : [];
      if (favIds.length === 0) {
        setFavoriteMachineries([]);
        setLoadingFavorites(false);
        return;
      }
      const { data, error } = await supabase
        .from('machinery')
        .select('*')
        .in('id', favIds);
      if (!error && data) {
        setFavoriteMachineries(data);
      }
    } catch (err) {
      console.warn('Error loading favorites:', err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const removeFavorite = async (id: string) => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`makimport_favorites_${user.id}`);
      let favIds = stored ? JSON.parse(stored) : [];
      favIds = favIds.filter((x: string) => x !== id);
      localStorage.setItem(`makimport_favorites_${user.id}`, JSON.stringify(favIds));
      setFavoriteMachineries(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.warn('Error removing favorite:', err);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setProfileError('');
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${user.id}_avatar_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('machinery-photos')
        .upload(filePath, file, { upsert: true, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('machinery-photos')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        setAvatarUrl(publicUrlData.publicUrl);
      }
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setProfileError('No se pudo subir el archivo. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSavingProfile(true);
    setProfileSuccess(false);
    setProfileError('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nombre_completo: nombreCompleto,
          cedula_rif: cedulaRif,
          telefono: telefono,
          ciudad: ciudad,
          pais: pais,
          avatar_url: avatarUrl
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Error al actualizar el perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Auth Protection Check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <span className="text-sm text-slate-400 mt-3 font-semibold">Cargando Oficina Virtual...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4 text-center">
        <h1 className="text-2xl font-black text-white">Acceso no autorizado</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Debes iniciar sesión para ingresar a tu Oficina Virtual de cliente en MAKIMPORT.
        </p>
        <Link href="/" className="mt-5 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition-colors">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenAuth={() => {}} onOpenAdminPublish={() => {}} />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-28 pb-16 space-y-8">
        
        {/* Header Back Button */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </Link>
          <span className="text-xs text-slate-500 font-mono">ID Cliente: {user.id.substring(0, 10)}...</span>
        </div>

        {/* Hero Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10 w-full">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-orange-500/55 bg-slate-950 shrink-0">
              <img 
                src={avatarUrl || defaultAvatar} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-white">{nombreCompleto || 'Usuario de MAKIMPORT'}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="px-2 py-0.5 rounded bg-orange-950/70 border border-orange-800 text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                  {profile?.role === 'admin' ? 'Administrador' : 'Cliente Verificado'}
                </span>
                {ciudad && (
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-400" />
                    {ciudad}, {pais}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 gap-6 overflow-x-auto pb-1.5 text-xs sm:text-sm font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 flex items-center gap-2 transition-all relative shrink-0 ${
              activeTab === 'profile' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Mi Perfil Personal</span>
          </button>

          <button
            onClick={() => setActiveTab('auctions')}
            className={`pb-3 flex items-center gap-2 transition-all relative shrink-0 ${
              activeTab === 'auctions' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>Mis Subastas Ganadas</span>
            {wonAuctions.length > 0 && (
              <span className="bg-orange-600 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {wonAuctions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('purchases')}
            className={`pb-3 flex items-center gap-2 transition-all relative shrink-0 ${
              activeTab === 'purchases' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mis Compras Inmediatas</span>
            {purchaseRequests.length > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {purchaseRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rentals')}
            className={`pb-3 flex items-center gap-2 transition-all relative shrink-0 ${
              activeTab === 'rentals' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Mis Alquileres / Solicitudes</span>
            {rentalRequests.length > 0 && (
              <span className="bg-orange-600 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {rentalRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('postulations')}
            className={`pb-3 flex items-center gap-2 transition-all relative shrink-0 ${
              activeTab === 'postulations' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Mis Equipos Postulados</span>
            {postulatedEquipments.length > 0 && (
              <span className="bg-orange-600 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {postulatedEquipments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('projectQuotes')}
            className={`pb-3 flex items-center gap-2 transition-all relative shrink-0 ${
              activeTab === 'projectQuotes' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>Mis Cotizaciones de Proyectos</span>
            {projectQuotes.length > 0 && (
              <span className="bg-orange-600 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {projectQuotes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('serviceApplications')}
            className={`pb-3 flex items-center gap-2 transition-all relative shrink-0 ${
              activeTab === 'serviceApplications' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Mis Postulaciones de Servicios</span>
            {serviceApplications.length > 0 && (
              <span className="bg-orange-600 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {serviceApplications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 flex items-center gap-2 transition-all relative shrink-0 ${
              activeTab === 'favorites' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Favoritos</span>
            {favoriteMachineries.length > 0 && (
              <span className="bg-orange-600 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {favoriteMachineries.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`pb-3 flex items-center gap-2 transition-all relative shrink-0 ${
              activeTab === 'support' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Soporte</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="pt-2">

          {/* TAB 1: Profile Form */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg max-w-3xl">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Información del Cliente</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Fullname */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                  />
                </div>

                {/* Cedula/Rif */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                    Cédula / RIF
                  </label>
                  <input
                    type="text"
                    placeholder="V-12345678 / J-123456789"
                    value={cedulaRif}
                    onChange={(e) => setCedulaRif(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                  />
                </div>

                {/* Telefono */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+58 414-1234567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                  />
                </div>

                {/* Ciudad */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    Ciudad
                  </label>
                  <input
                    type="text"
                    placeholder="Caracas, Valencia, etc."
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                  />
                </div>

                {/* Pais */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    País
                  </label>
                  <input
                    type="text"
                    placeholder="Venezuela"
                    value={pais}
                    onChange={(e) => setPais(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                  />
                </div>

                {/* Foto / Avatar Upload */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    Imagen de Perfil (Foto / Avatar)
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-950 border border-slate-800">
                      <img src={avatarUrl || defaultAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="URL de foto..."
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 font-bold uppercase">o</span>
                        
                        <label className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-colors shrink-0">
                          {uploading ? 'Subiendo...' : 'Subir Archivo'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-slate-500">Acepta formatos JPEG, PNG. Tamaño máximo 2MB.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Status Info boxes */}
              {profileSuccess && (
                <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>✓ ¡Tus cambios de perfil se guardaron y sincronizaron exitosamente!</span>
                </div>
              )}

              {profileError && (
                <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-xl text-xs text-red-300 font-bold">
                  ✗ {profileError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-950/30 flex items-center gap-2 transition-colors cursor-pointer"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando cambios...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>

            </form>
          )}

          {/* TAB 2: Won Auctions */}
          {activeTab === 'auctions' && (
            <div className="space-y-6">
              {loadingAuctions ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  <span className="text-xs font-semibold mt-2">Consultando tus adjudicaciones...</span>
                </div>
              ) : wonAuctions.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                    <Gavel className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No tienes subastas ganadas todavía</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cuando pujes en una maquinaria en subasta y el temporizador termine siendo tu puja la más alta, verás aquí el resumen para coordinar el despacho e importación.
                  </p>
                  <Link href="/" className="inline-block mt-2 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold rounded-xl text-slate-200">
                    Explorar Subastas Activas
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wonAuctions.map((win, idx) => (
                    <div key={win.machinery.id || idx} className="bg-slate-900 border border-amber-500/30 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                      <div className="h-48 bg-slate-950 relative border-b border-slate-800">
                        <img src={win.machinery.image} alt={win.machinery.name} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-amber-500/90 text-slate-950 text-[10px] font-black rounded uppercase flex items-center gap-1 tracking-wider shadow">
                          <CheckCircle2 className="w-3 h-3 text-slate-950" />
                          Adjudicado
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            {win.machinery.brand}
                          </span>
                          <h3 className="text-lg font-black text-white">
                            {win.machinery.name}
                          </h3>
                          <p className="text-xs text-slate-400">Modelo: {win.machinery.model}</p>
                          
                          <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300 font-mono">
                            <div className="flex justify-between">
                              <span>Monto adjudicado:</span>
                              <strong className="text-amber-400">${win.amount.toLocaleString()} USD</strong>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-500">
                              <span>Fecha de Cierre:</span>
                              <span>{win.closedAt}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-400 block font-medium">Coordinar despacho e importación:</span>
                          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                            <a
                              href={`https://wa.me/584146370819?text=${encodeURIComponent(
                                `¡Hola! Fui el ganador de la subasta del ${win.machinery.name} (${win.machinery.brand}/${win.machinery.model}) por un monto de $${win.amount} USD. Deseo coordinar el pago y el despacho.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                            >
                              <MessageCircle className="w-4 h-4 shrink-0" />
                              <span>WhatsApp</span>
                            </a>

                            <a
                              href={`https://t.me/makimportvzla?text=${encodeURIComponent(
                                `¡Hola! Fui el ganador de la subasta del ${win.machinery.name} (${win.machinery.brand}/${win.machinery.model}) por un monto de $${win.amount} USD. Deseo coordinar el pago y el despacho.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 rounded-lg bg-sky-600/20 hover:bg-sky-600 border border-sky-500/30 text-sky-400 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Send className="w-4 h-4 shrink-0" />
                              <span>Telegram</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Purchase Requests */}
          {activeTab === 'purchases' && (
            <div className="space-y-6">
              {loadingPurchases ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  <span className="text-xs font-semibold mt-2">Cargando tus compras inmediatas...</span>
                </div>
              ) : purchaseRequests.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No tienes compras inmediatas</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Al solicitar la compra de un equipo sin pasar por subasta (embarque directo), las solicitudes aparecerán listadas aquí con su respectivo estatus de procesamiento comercial.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl">
                  {purchaseRequests.map((req, idx) => (
                    <div key={req.id || idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-xl bg-orange-950/40 border border-orange-900/30 flex items-center justify-center text-orange-400 shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white">{req.machinery_title || 'Maquinaria Pesada'}</h4>
                          <div className="flex flex-wrap gap-2 items-center text-[11px] text-slate-400 mt-0.5">
                            <span>Monto: <strong className="text-slate-200 font-mono">${(req.machinery_price || 0).toLocaleString()} USD</strong></span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Calendar className="w-3 h-3" />
                              {req.created_at ? new Date(req.created_at).toLocaleDateString('es-VE') : 'Recientemente'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase font-black text-right">Estatus comercial</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mt-0.5 ${
                            req.estado === 'aprobado' || req.estado === 'completado'
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40'
                              : req.estado === 'cancelado' || req.estado === 'rechazado'
                              ? 'bg-red-950/70 text-red-400 border-red-800/40'
                              : 'bg-amber-950/75 text-amber-400 border-amber-800/40 animate-pulse'
                          }`}>
                            {req.estado || 'Pendiente'}
                          </span>
                        </div>

                        <a
                          href={`https://wa.me/584146370819?text=${encodeURIComponent(
                            `Hola MAKIMPORT, deseo consultar el estatus de mi compra inmediata del equipo ${req.machinery_title} (${req.machinery_price} USD). Mi nombre es ${req.nombre} ${req.apellido}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Soporte</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Rental Requests */}
          {activeTab === 'rentals' && (
            <div className="space-y-6">
              {loadingRentals ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  <span className="text-xs font-semibold mt-2">Cargando tus solicitudes de alquiler...</span>
                </div>
              ) : rentalRequests.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No tienes solicitudes de alquiler</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Si eres un cliente buscando alquilar maquinaria pesada para tu obra o proyecto, completa el formulario y verás tus solicitudes registradas aquí.
                  </p>
                  <Link href="/alquiler" className="inline-block mt-2 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold rounded-xl text-slate-200">
                    Solicitar Alquiler de Maquinaria
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl">
                  {rentalRequests.map((req, idx) => (
                    <div key={req.id || idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white">{req.categoria_equipo}</h4>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-orange-400 font-bold">{req.marca_preferida || 'Cualquier marca'}</span>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <div><span className="text-slate-500">Obra/Ubicación:</span> {req.ciudad}, {req.estado}</div>
                          <div><span className="text-slate-500">Duración estimada:</span> {req.duracion_estimada}</div>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Creado el: {req.created_at ? new Date(req.created_at).toLocaleDateString('es-VE') : 'Recientemente'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase font-black text-right">Estatus solicitud</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mt-0.5 ${
                            req.estado_solicitud === 'cotizado'
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40'
                              : req.estado_solicitud === 'cancelado'
                              ? 'bg-red-950/70 text-red-400 border-red-800/40'
                              : 'bg-amber-950/75 text-amber-400 border-amber-800/40'
                          }`}>
                            {req.estado_solicitud || 'Pendiente'}
                          </span>
                        </div>

                        <a
                          href={`https://wa.me/584146370819?text=${encodeURIComponent(
                            `Hola MAKIMPORT, deseo consultar el estatus de mi solicitud de alquiler de un ${req.categoria_equipo}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Consultar</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Postulated Equipments */}
          {activeTab === 'postulations' && (
            <div className="space-y-6">
              {loadingPostulations ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  <span className="text-xs font-semibold mt-2">Cargando tus equipos postulados...</span>
                </div>
              ) : postulatedEquipments.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No tienes equipos postulados aún</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Si eres propietario de camiones o maquinaria pesada, puedes publicarlos en nuestra plataforma de manera gratuita para conectarte con constructoras y obras de alquiler.
                  </p>
                  <Link href="/postular-equipo" className="inline-block mt-2 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold rounded-xl text-slate-200">
                    Alquilar Mi Maquinaria Gratis
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                  {postulatedEquipments.map((owner, idx) => (
                    <div key={owner.id || idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                      <div className="h-44 bg-slate-950 relative border-b border-slate-800">
                        {owner.photos && owner.photos.length > 0 ? (
                          <img src={owner.photos[0]} alt={owner.marca} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-700">
                            <Building2 className="w-12 h-12" />
                          </div>
                        )}
                        <span className={`absolute top-3 left-3 px-2 py-0.5 text-[9px] font-black uppercase rounded tracking-wider border ${
                          owner.estado === 'disponible' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-400' : 'bg-amber-950/90 border-amber-500/40 text-amber-400'
                        }`}>
                          {owner.estado}
                        </span>
                        {owner.photos && owner.photos.length > 1 && (
                          <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/75 text-white text-[10px] rounded-md font-bold">
                            +{owner.photos.length} Fotos
                          </span>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            {owner.categoria_equipo}
                          </span>
                          <h3 className="text-base font-extrabold text-white">
                            {owner.marca} {owner.modelo || ''}
                          </h3>
                          <div className="text-xs text-slate-400 space-y-1 pt-1.5">
                            <div><span className="text-slate-500">Ubicación Base:</span> {owner.ciudad_base}, {owner.estado_base}</div>
                            {owner.tarifa_dia && <div><span className="text-slate-500">Tarifa Diaria:</span> <strong className="text-amber-400 font-mono">${owner.tarifa_dia} USD</strong></div>}
                            {owner.tarifa_hora && <div><span className="text-slate-500">Tarifa por Hora:</span> <strong className="text-amber-400 font-mono">${owner.tarifa_hora} USD</strong></div>}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Operador: {owner.incluye_operador ? 'Sí, incluido' : 'Solo Máquina'}</span>
                          <span>ID: {owner.id.substring(0,8)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Favorites */}
          {activeTab === 'favorites' && (
            <div className="space-y-6">
              {loadingFavorites ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  <span className="text-xs font-semibold mt-2">Cargando tus favoritos...</span>
                </div>
              ) : favoriteMachineries.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No tienes favoritos aún</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Navega por nuestro catálogo de maquinarias y presiona la estrella en cualquier equipo que te interese para guardarlo aquí y verlo cuando quieras.
                  </p>
                  <Link href="/" className="inline-block mt-2 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold rounded-xl text-slate-200">
                    Ver Catálogo de Maquinarias
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
                  {favoriteMachineries.map((item) => {
                    const photos = Array.isArray(item.fotos_urls) && item.fotos_urls.length > 0 ? item.fotos_urls : [];
                    const img = photos[0] || 'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&q=80&w=800';
                    return (
                      <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                        <div className="h-44 bg-slate-950 relative border-b border-slate-800">
                          <img src={img} alt={item.titulo} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeFavorite(item.id)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 border border-slate-700 flex items-center justify-center text-amber-400 hover:text-red-400 transition-colors"
                            title="Quitar de favoritos"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                              {item.marca} • {item.categoria}
                            </span>
                            <h4 className="text-base font-extrabold text-white truncate">{item.titulo}</h4>
                            <p className="text-xs text-slate-400">Modelo: {item.modelo}</p>
                          </div>

                          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-medium">Precio Ref:</span>
                              <strong className="text-amber-400 font-mono">
                                ${Number(item.precio_compra_inmediata || item.precio_inicial_subasta || 0).toLocaleString()} USD
                              </strong>
                            </div>
                            
                            <a
                              href="/"
                              onClick={(e) => {
                                e.preventDefault();
                                window.location.href = `/?search=${encodeURIComponent(item.titulo)}`;
                              }}
                              className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Ficha en Catálogo</span>
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

          {/* TAB: Project Quotes */}
          {activeTab === 'projectQuotes' && (
            <div className="space-y-6">
              {loadingProjectQuotes ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 text-orange-505 animate-spin" />
                  <span className="text-xs font-semibold mt-2">Cargando tus cotizaciones de proyectos...</span>
                </div>
              ) : projectQuotes.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                    <HardHat className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No has solicitado cotizaciones de proyectos</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Si eres una constructora y necesitas cotizar una obra, puedes registrar tus solicitudes en nuestra plataforma.
                  </p>
                  <Link href="/servicios/ejecucion-obras" className="inline-block mt-2 px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-xs font-bold rounded-xl text-slate-200">
                    Solicitar Cotización de Obra
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl">
                  {projectQuotes.map((req, idx) => (
                    <div key={req.id || idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white">{req.project_type}</h4>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-orange-400 font-bold">{req.project_location}</span>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <div><span className="text-slate-500">Duración Estimada:</span> {req.duration_and_start_date}</div>
                          <div><span className="text-slate-500">Presupuesto Estimado:</span> {req.estimated_budget || 'No indicado'}</div>
                        </div>
                        <div className="text-[10px] text-slate-505 font-mono">
                          Registrado el: {req.created_at ? new Date(req.created_at).toLocaleDateString('es-VE') : 'Recientemente'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 block uppercase font-black">Estatus comercial</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mt-0.5 ${
                            req.status === 'quoted'
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40'
                              : req.status === 'archived'
                              ? 'bg-slate-900 text-slate-400 border-slate-850'
                              : req.status === 'in_review'
                              ? 'bg-sky-950/70 text-sky-400 border-sky-800/40'
                              : 'bg-amber-950/75 text-amber-400 border-amber-800/40'
                          }`}>
                            {req.status === 'received' ? 'Recibido' : 
                             req.status === 'in_review' ? 'En Revisión' : 
                             req.status === 'quoted' ? 'Cotizado' : 'Archivado'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteProjectQuote(req.id)}
                          className="p-2 text-red-550 hover:text-red-400 bg-red-950/20 hover:bg-red-950/45 border border-red-900/30 rounded-xl transition-all self-end shrink-0"
                          title="Eliminar Cotización"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Service Applications */}
          {activeTab === 'serviceApplications' && (
            <div className="space-y-6">
              {loadingServiceApplications ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 text-orange-505 animate-spin" />
                  <span className="text-xs font-semibold mt-2">Cargando tus postulaciones...</span>
                </div>
              ) : serviceApplications.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No tienes postulaciones de servicios</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Si ofreces servicios técnicos, mecánicos, o de consultoría y deseas postularte a la red de proveedores de MAKIMPORT, registra tu perfil.
                  </p>
                  <Link href="/postulacion" className="inline-block mt-2 px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-xs font-bold rounded-xl text-slate-200">
                    Ir al Formulario de Postulación
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl">
                  {serviceApplications.map((req, idx) => (
                    <div key={req.id || idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white capitalize">{req.category_id}</h4>
                          <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 text-[9px] font-bold rounded uppercase">
                            {req.applicant_type === 'company' ? 'Empresa' : 'Independiente'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <div><span className="text-slate-500">Ubicación y Cobertura:</span> {req.state_city} ({req.coverage_radius})</div>
                          <div><span className="text-slate-500">Horario de Disponibilidad:</span> {req.work_schedule}</div>
                        </div>
                        <div className="text-[10px] text-slate-505 font-mono">
                          Postulado el: {req.created_at ? new Date(req.created_at).toLocaleDateString('es-VE') : 'Recientemente'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 block uppercase font-black">Estatus revisión</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mt-0.5 ${
                            req.status === 'approved'
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40'
                              : req.status === 'rejected'
                              ? 'bg-red-950/70 text-red-400 border-red-800/40'
                              : 'bg-amber-950/75 text-amber-400 border-amber-800/40'
                          }`}>
                            {req.status === 'pending' ? 'En Revisión' : 
                             req.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteServiceApplication(req.id)}
                          className="p-2 text-red-550 hover:text-red-400 bg-red-950/20 hover:bg-red-950/45 border border-red-900/30 rounded-xl transition-all self-end shrink-0"
                          title="Eliminar Postulación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: Support */}
          {activeTab === 'support' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl">
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white">Centro de Soporte Oficial MAKIMPORT</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ¿Tienes dudas sobre los tiempos de tránsito, comisiones de subastas, formas de pago o logística de entrega en puertos de Venezuela? Ponte en contacto con nuestro equipo comercial asignado.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Whatsapp Support Card */}
                <a
                  href="https://wa.me/584146370819?text=Hola%20MAKIMPORT%2C%20busco%20soporte%20personalizado%20desde%20mi%20Oficina%20Virtual."
                  target="_blank"
                  rel="noreferrer"
                  className="p-5 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 hover:border-emerald-500/50 rounded-2xl flex flex-col justify-between gap-4 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                      En línea
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors">Soporte por WhatsApp</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Contacto telefónico e interactivo instantáneo.</p>
                    <span className="block text-xs font-mono text-emerald-400 font-bold mt-2">+58 414-6370819</span>
                  </div>
                </a>

                {/* Email Support Card */}
                <a
                  href="mailto:makimportvzla@gmail.com"
                  className="p-5 bg-sky-950/20 hover:bg-sky-950/40 border border-sky-900/30 hover:border-sky-500/50 rounded-2xl flex flex-col justify-between gap-4 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
                      <Send className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-sky-400 font-extrabold uppercase bg-sky-950 border border-sky-800/60 px-2 py-0.5 rounded-full">
                      24/7
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white group-hover:text-sky-400 transition-colors">Soporte por Correo</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Consultas formales, reportes de inspección y pagos.</p>
                    <span className="block text-xs font-mono text-sky-400 font-bold mt-2 hover:underline">makimportvzla@gmail.com</span>
                  </div>
                </a>
              </div>
            </div>
          )}

        </div>

      </div>

      <Footer onOpenAuth={() => {}} />
    </main>
  );
}
