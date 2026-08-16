export interface BidRecord {
  id: string;
  machineryId: string;
  userName: string;
  amount: number;
  timestamp: string;
}

export interface MachineryItem {
  id: string;
  name: string;
  model: string;
  brand: string;
  category: string;
  year: number;
  hours: number;
  origin: 'USA' | 'China' | 'En Tránsito' | 'Venezuela';
  location: string;
  destinationPort: string;
  status: 'auction' | 'direct';
  price: number; // Compra Inmediata
  currentBid?: number; // Puja actual en subasta
  minBidIncrement?: number;
  bidsCount?: number;
  auctionEndsAt?: Date;
  image?: string;
  images: string[];
  serialNumber: string;
  engineSpecs: string;
  hydraulicSpecs?: string;
  trackCondition?: string;
  inspectionScore: number;
  description: string;
  financingAvailable?: boolean;
  bidsHistory?: BidRecord[];
  
  // Extended Technical Specification & Logistics Fields
  pdfReportUrl?: string;
  inspeccionGeneral?: number;
  inspeccionMotor?: number;
  inspeccionHidraulico?: number;
  inspeccionTransmision?: number;
  inspeccionCabina?: number;
  inspeccionCauchos?: number;
  transitTime?: string;
  // Venezuela-specific location (when machinery is physically inside Venezuela)
  ciudadVenezuela?: string;
  // Unit of usage measurement
  unidadUso?: 'Horas' | 'Kilómetros' | 'Millas' | 'No aplica';
  // Private owner details (admin only)
  duenoNombre?: string;
  duenoInstagram?: string;
  duenoTelefono?: string;
  // Marketing / urgency badges (from DB columns badge_promocion, es_ultima_unidad)
  badgePromocion?: string;
  esUltimaUnidad?: boolean;
}
