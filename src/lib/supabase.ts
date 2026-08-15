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
  dueno_nombre?: string | null;
  dueno_instagram?: string | null;
  dueno_telefono?: string | null;
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

export interface RentalRequestDbRow {
  id: string;
  created_at: string;
  nombre_completo: string;
  telefono: string;
  email: string;
  estado: string;
  ciudad: string;
  industria: string;
  categoria_equipo: string;
  marca_preferida: string | null;
  modelo_especificacion: string | null;
  ano_deseado: number | null;
  horas_maximas: number | null;
  duracion_estimada: string;
  incluye_operador: boolean;
  modalidad_gastos: string;
  presupuesto_estimado: number | null;
  notas_adicionales: string | null;
  estado_solicitud: 'pendiente' | 'en_proceso' | 'cotizado';
}

export interface OwnerMachineryDbRow {
  id: string;
  created_at: string;
  // Owner/contact
  nombre_propietario: string;
  telefono: string;
  email: string | null;
  instagram: string | null;
  // Location
  estado_base: string;
  ciudad_base: string;
  // Equipment
  categoria_equipo: string;
  marca: string;
  modelo: string | null;
  ano: number | null;
  horas_uso: number | null;
  capacidad: string | null;
  // Rental terms
  tarifa_hora: number | null;
  tarifa_dia: number | null;
  incluye_operador: boolean;
  modalidad_disponible: string;   // 'dias' | 'semanas' | 'meses' | 'largo_plazo'
  disponible_desde: string | null;
  // Admin
  notas: string | null;
  estado: 'disponible' | 'ocupado' | 'mantenimiento';
}

export interface ServicesApplicationDbRow {
  id: string;
  created_at: string;
  category_id: string;
  applicant_type: 'personal' | 'company';
  full_name_or_company: string;
  id_document_number: string;
  id_document_url: string | null;
  state_city: string;
  coverage_radius: string;
  specialization_details: string;
  work_schedule: string;
  portfolio_urls: string[] | null;
  status: 'pending' | 'approved' | 'rejected';
  user_id: string | null;
}

export interface ProjectQuoteDbRow {
  id: string;
  created_at: string;
  client_name_or_company: string;
  id_document: string;
  phone_contact: string;
  project_location: string;
  project_type: string;
  scope: string[];
  requires_site_visit: boolean;
  duration_and_start_date: string;
  estimated_budget: string | null;
  project_description: string;
  attachments_urls: string[] | null;
  status: 'received' | 'in_review' | 'quoted' | 'archived';
  user_id: string | null;
}

export interface PostulacionEquipoDbRow {
  id: string;
  created_at: string;
  nombre_cliente: string;
  apellido_cliente: string;
  cedula_rif_cliente: string;
  telefono_cliente: string;
  marca: string;
  modelo: string;
  ano: number;
  condicion: string;
  uso_valor: number;
  uso_unidad: string;
  ciudad_venezuela: string;
  precio_estimado: number;
  fotos_urls: string[];
  estado: string;
  creado_por: string | null;
}

