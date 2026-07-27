/**
 * machineryOptions.ts
 * Fuente única de verdad para todas las Categorías, Marcas y Ciudades
 * usadas en filtros, formularios y modales de la app MAKIMPORT.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORÍAS (25+)
// ─────────────────────────────────────────────────────────────────────────────

export interface OptionItem {
  value: string; // key normalizado (lowercase, para filtrado)
  label: string; // texto visible en la UI
}

export const CATEGORIES: OptionItem[] = [
  { value: 'excavadora',           label: 'Excavadora de Oruga' },
  { value: 'retroexcavadora',      label: 'Retroexcavadora' },
  { value: 'cargador frontal',     label: 'Cargador Frontal' },
  { value: 'bulldozer',            label: 'Bulldozer / Tractor de Orugas' },
  { value: 'grúa telescópica',     label: 'Grúa Telescópica' },
  { value: 'grúa camión',          label: 'Grúa Camión (Truck Crane)' },
  { value: 'camión canasta',       label: 'Camión Canasta / Elevador Aéreo' },
  { value: 'planta eléctrica',     label: 'Planta Eléctrica / Generador' },
  { value: 'ambulancia',           label: 'Ambulancia / Vehículo de Emergencia' },
  { value: 'camión volteo',        label: 'Camión Volteo / Dumper' },
  { value: 'camión cisterna',      label: 'Camión Cisterna / Tanque' },
  { value: 'rodillo compactador',  label: 'Rodillo Compactador' },
  { value: 'minicargador',         label: 'Minicargador / Skid Steer' },
  { value: 'motoniveladora',       label: 'Motoniveladora / Grader' },
  { value: 'pavimentadora',        label: 'Pavimentadora / Finisher' },
  { value: 'mezcladora de concreto', label: 'Mezcladora de Concreto' },
  { value: 'perforadora',          label: 'Perforadora / Drill Rig' },
  { value: 'maquinaria especial',  label: 'Maquinaria Especial' },
  { value: 'montacargas',          label: 'Montacargas / Forklift' },
  { value: 'maquinaria agrícola',  label: 'Maquinaria Agrícola' },
  { value: 'tractor',              label: 'Tractor Agrícola' },
  { value: 'lowboy',               label: 'Lowboy / Remolque Plataforma' },
  { value: 'trituradora',          label: 'Trituradora / Crushers' },
  { value: 'compresor de aire',    label: 'Compresor de Aire' },
  { value: 'camión grúa',          label: 'Camión Grúa / Wrecker' },
  { value: 'bomba de concreto',    label: 'Bomba de Concreto' },
  { value: 'otros',                label: 'Otros' },
];

/**
 * Array de valores (lowercase) para la lógica de filtrado en CatalogMarketplace.
 * Compatible con la implementación existente de PREDEFINED_CATEGORIES.
 */
export const PREDEFINED_CATEGORY_VALUES: string[] = CATEGORIES
  .filter((c) => c.value !== 'otros')
  .map((c) => c.value);


// ─────────────────────────────────────────────────────────────────────────────
// MARCAS (25+)
// ─────────────────────────────────────────────────────────────────────────────

export const BRANDS: OptionItem[] = [
  { value: 'caterpillar',   label: 'Caterpillar (CAT)' },
  { value: 'komatsu',       label: 'Komatsu' },
  { value: 'volvo',         label: 'Volvo Construction' },
  { value: 'jcb',           label: 'JCB' },
  { value: 'case',          label: 'Case Construction' },
  { value: 'john deere',    label: 'John Deere' },
  { value: 'terex',         label: 'Terex' },
  { value: 'liebherr',      label: 'Liebherr' },
  { value: 'hitachi',       label: 'Hitachi Construction' },
  { value: 'bobcat',        label: 'Bobcat' },
  { value: 'sany',          label: 'SANY' },
  { value: 'xcmg',          label: 'XCMG' },
  { value: 'sdlg',          label: 'SDLG' },
  { value: 'doosan',        label: 'Doosan / Develon' },
  { value: 'hyundai',       label: 'Hyundai Heavy Industries' },
  { value: 'new holland',   label: 'New Holland Construction' },
  { value: 'manitou',       label: 'Manitou' },
  { value: 'grove',         label: 'Grove Cranes' },
  { value: 'tadano',        label: 'TADANO' },
  { value: 'international', label: 'International' },
  { value: 'freightliner',  label: 'Freightliner' },
  { value: 'mack',          label: 'Mack Trucks' },
  { value: 'kenworth',      label: 'Kenworth' },
  { value: 'isuzu',         label: 'Isuzu' },
  { value: 'zoomlion',      label: 'Zoomlion' },
  { value: 'lonking',       label: 'Lonking' },
  { value: 'shantui',       label: 'Shantui' },
  { value: 'otros',         label: 'Otra marca' },
];

/**
 * Array de valores (lowercase) para la lógica de filtrado en CatalogMarketplace.
 * Compatible con la implementación existente de PREDEFINED_BRANDS.
 */
export const PREDEFINED_BRAND_VALUES: string[] = BRANDS
  .filter((b) => b.value !== 'otros')
  .map((b) => b.value);


// ─────────────────────────────────────────────────────────────────────────────
// CIUDADES DE VENEZUELA
// ─────────────────────────────────────────────────────────────────────────────

export interface VenezuelaCityOption {
  value: string;
  label: string; // ciudad + estado
}

export const VENEZUELA_CITIES: VenezuelaCityOption[] = [
  { value: 'Maracaibo',      label: 'Maracaibo (Zulia)' },
  { value: 'Caracas',        label: 'Caracas (Distrito Capital)' },
  { value: 'Valencia',       label: 'Valencia (Carabobo)' },
  { value: 'Barquisimeto',   label: 'Barquisimeto (Lara)' },
  { value: 'Puerto Ordaz',   label: 'Puerto Ordaz / Ciudad Guayana (Bolívar)' },
  { value: 'San Cristóbal',  label: 'San Cristóbal (Táchira)' },
  { value: 'Maturín',        label: 'Maturín (Monagas)' },
  { value: 'Barcelona',      label: 'Barcelona (Anzoátegui)' },
  { value: 'Cumaná',         label: 'Cumaná (Sucre)' },
  { value: 'Barinas',        label: 'Barinas (Barinas)' },
  { value: 'Mérida',         label: 'Mérida (Mérida)' },
  { value: 'Acarigua',       label: 'Acarigua (Portuguesa)' },
  { value: 'Puerto Cabello', label: 'Puerto Cabello (Carabobo)' },
  { value: 'Los Teques',     label: 'Los Teques (Miranda)' },
  { value: 'Guarenas',       label: 'Guarenas / Guatire (Miranda)' },
  { value: 'Turmero',        label: 'Turmero / Maracay (Aragua)' },
  { value: 'Coro',           label: 'Coro (Falcón)' },
  { value: 'San Fernando',   label: 'San Fernando de Apure (Apure)' },
  { value: 'Valera',         label: 'Valera (Trujillo)' },
  { value: 'Punto Fijo',     label: 'Punto Fijo (Falcón)' },
  { value: 'Otra ciudad',    label: 'Otra ciudad' },
];
