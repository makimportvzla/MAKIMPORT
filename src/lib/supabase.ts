import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcdqzdgumvwoekboodtv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZHF6ZGd1bXZ3b2VrYm9vZHR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODA0NTgsImV4cCI6MjEwMDY1NjQ1OH0.wkoqxmdcJ_6qdCxuz9Au-LJnzR_qfopeb6yR8duv-7E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface MachineryDbRow {
  id: string;
  titulo: string;
  marca: string;
  modelo: string;
  ano: number;
  horas_uso: number;
  condicion_detalles: string;
  precio_compra_inmediata: number;
  es_subasta: boolean;
  precio_inicial_subasta?: number;
  puja_actual?: number;
  fecha_fin_subasta?: string;
  fotos_urls: string[];
  ubicacion_origen: string;
  condiciones_pago?: string;
  creado_por?: string;
  created_at?: string;
}

export interface BidDbRow {
  id: string;
  machinery_id: string;
  user_id: string;
  monto_puja: number;
  created_at: string;
}

export interface ProveedorDbRow {
  id: string;
  created_at: string;
  nombre_empresa: string;
  nombre_contacto: string | null;
  telefono: string;
  ubicacion: string | null;
  instagram: string | null;
  especialidad: string | null;
  notas: string | null;
}
