-- ============================================================
-- SCHEMA DE BASE DE DATOS SUPABASE PARA MAKIMPORT VENEZUELA
-- ============================================================

-- 1. TABLA DE PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre_completo TEXT NOT NULL,
  cedula_rif TEXT,
  telefono TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLA DE MAQUINARIA PESADA
CREATE TABLE IF NOT EXISTS public.machinery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NOT NULL,
  horas_uso INTEGER NOT NULL DEFAULT 0,
  condicion_detalles TEXT,
  precio_compra_inmediata NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  es_subasta BOOLEAN NOT NULL DEFAULT FALSE,
  precio_inicial_subasta NUMERIC(12, 2) DEFAULT 0.00,
  puja_actual NUMERIC(12, 2) DEFAULT 0.00,
  fecha_fin_subasta TIMESTAMPTZ,
  fotos_urls TEXT[] NOT NULL DEFAULT '{}',
  ubicacion_origen TEXT NOT NULL DEFAULT 'Houston, TX - EE.UU.',
  condiciones_pago TEXT DEFAULT 'Reserva 20%, Embarque 50%, Recepcion Puerto Venezuela 30%',
  creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Campos extendidos de Ficha Técnica
  categoria TEXT DEFAULT 'Excavadora',
  numero_serie TEXT,
  pdf_reporte_url TEXT,
  inspeccion_general INTEGER DEFAULT 90,
  inspeccion_motor INTEGER DEFAULT 90,
  inspeccion_hidraulico INTEGER DEFAULT 90,
  inspeccion_transmision INTEGER DEFAULT 90,
  inspeccion_cabina INTEGER DEFAULT 90,
  inspeccion_cauchos INTEGER DEFAULT NULL,  -- Puntuación de neumáticos/cauchos (0-100), NULL = no aplica
  ciudad_venezuela TEXT DEFAULT NULL,
  puerto_destino TEXT DEFAULT 'Puerto Cabello, VZLA',
  tiempo_transito TEXT DEFAULT '25-35 días',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA DE PUJAS / OFERTAS EN SUBASTA
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machinery_id UUID NOT NULL REFERENCES public.machinery(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  monto_puja NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES PARA CONSULTAS RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_machinery_es_subasta ON public.machinery(es_subasta);
CREATE INDEX IF NOT EXISTS idx_bids_machinery_id ON public.bids(machinery_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON public.bids(user_id);

-- TRIGGER PARA ACTUALIZAR AUTOMÁTICAMENTE LA PUJA ACTUAL EN LA MAQUINARIA
CREATE OR REPLACE FUNCTION public.update_machinery_latest_bid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.machinery
  SET puja_actual = NEW.monto_puja
  WHERE id = NEW.machinery_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_bid_inserted ON public.bids;
CREATE TRIGGER on_bid_inserted
  AFTER INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_machinery_latest_bid();

-- HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machinery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS PARA PROFILES
CREATE POLICY "Perfiles visibles por sus creadores o administradores" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- POLÍTICAS RLS PARA MACHINERY
CREATE POLICY "Cualquiera puede ver la maquinaria" ON public.machinery
  FOR SELECT USING (true);

CREATE POLICY "Solo administradores pueden crear o editar maquinaria" ON public.machinery
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- POLÍTICAS RLS PARA BIDS
CREATE POLICY "Cualquiera puede ver las pujas" ON public.bids
  FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden realizar pujas" ON public.bids
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- HABILITAR REPLICACIÓN REALTIME PARA PUJAS Y MAQUINARIA
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machinery;

-- TRIGGER AUTOMÁTICO PARA CREAR PROFILE CUANDO SE REGISTRA UN NUEVO USUARIO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre_completo, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. TABLA DE SOLICITUDES DE COMPRA INMEDIATA
CREATE TABLE IF NOT EXISTS public.purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machinery_id TEXT NOT NULL,
  machinery_title TEXT NOT NULL,
  machinery_price NUMERIC(12, 2) NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HABILITAR RLS PARA purchase_requests
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede insertar solicitudes de compra" ON public.purchase_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Visibilidad de solicitudes de compra" ON public.purchase_requests
  FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_requests;

-- MIGRACIÓN PARA TABLAS EXISTENTES:
-- Si ya creaste las tablas, ejecuta esto en tu Consola SQL de Supabase:
--
-- ALTER TABLE public.machinery 
--   ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'Excavadora',
--   ADD COLUMN IF NOT EXISTS numero_serie TEXT,
--   ADD COLUMN IF NOT EXISTS pdf_reporte_url TEXT,
--   ADD COLUMN IF NOT EXISTS inspeccion_general INTEGER DEFAULT 90,
--   ADD COLUMN IF NOT EXISTS inspeccion_motor INTEGER DEFAULT 90,
--   ADD COLUMN IF NOT EXISTS inspeccion_hidraulico INTEGER DEFAULT 90,
--   ADD COLUMN IF NOT EXISTS inspeccion_transmision INTEGER DEFAULT 90,
--   ADD COLUMN IF NOT EXISTS inspeccion_cabina INTEGER DEFAULT 90,
--   ADD COLUMN IF NOT EXISTS puerto_destino TEXT DEFAULT 'Puerto Cabello, VZLA',
--   ADD COLUMN IF NOT EXISTS tiempo_transito TEXT DEFAULT '25-35 días';

-- 5. TABLA DE SOLICITUDES PERSONALIZADAS (ENCARGOS)
CREATE TABLE IF NOT EXISTS public.custom_machinery_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano_minimo INTEGER NOT NULL,
  puerto_destino TEXT NOT NULL,
  presupuesto_maximo NUMERIC(12, 2) NOT NULL,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.custom_machinery_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede insertar solicitudes personalizadas" ON public.custom_machinery_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Visibilidad de solicitudes personalizadas" ON public.custom_machinery_requests
  FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_machinery_requests;

-- ============================================================
-- MIGRACIÓN: Añadir columna inspeccion_cauchos a machinery
-- Ejecutar en Supabase SQL Editor si la tabla ya existe
-- ============================================================
ALTER TABLE public.machinery
  ADD COLUMN IF NOT EXISTS inspeccion_cauchos INTEGER DEFAULT NULL;

COMMENT ON COLUMN public.machinery.inspeccion_cauchos IS
  'Puntuación técnica de neumáticos/cauchos del equipo (0-100). NULL indica que no aplica (ej. maquinaria de orugas).';

-- ============================================================
-- 6. TABLA DE POSTULACIONES DE EQUIPOS (MARKETPLACE / VENTA)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.postulaciones_equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Datos del Cliente
  nombre_cliente TEXT NOT NULL,
  apellido_cliente TEXT NOT NULL,
  cedula_rif_cliente TEXT NOT NULL,
  telefono_cliente TEXT NOT NULL,
  
  -- Datos del Equipo
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NOT NULL,
  condicion TEXT NOT NULL, -- 'Operativa' | 'Detalles'
  
  -- Especificaciones
  uso_valor INTEGER NOT NULL DEFAULT 0,
  uso_unidad TEXT NOT NULL DEFAULT 'Horas', -- 'Horas' | 'Kilómetros' | 'Millas'
  
  -- Logística y Precio
  ciudad_venezuela TEXT NOT NULL,
  precio_estimado NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  
  -- Archivos (urls de fotos en supabase storage)
  fotos_urls TEXT[] NOT NULL DEFAULT '{}',
  
  -- Admin / Control
  estado TEXT NOT NULL DEFAULT 'Pendiente de Revisión', -- 'Pendiente de Revisión' | 'Aprobado' | 'Rechazado'
  
  creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE public.postulaciones_equipos ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS
CREATE POLICY "Cualquiera puede insertar postulaciones de equipos" ON public.postulaciones_equipos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Visibilidad de postulaciones de equipos" ON public.postulaciones_equipos
  FOR SELECT USING (
    creado_por = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin puede actualizar postulaciones de equipos" ON public.postulaciones_equipos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- HABILITAR REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.postulaciones_equipos;

