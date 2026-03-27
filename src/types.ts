export type TransactionType = 'INGRESO' | 'VENTA';
export type TipoPollo = 'BRASA' | 'PRESA' | 'TIPO_HEMBRA' | 'TIPO_MACHO';

export interface SaleItem {
  id: string;
  tipo: TipoPollo;
  cantidad: number;
  pesoTotal: number;
  precioKilo: number;
  subtotal: number;
  jabas?: number;
  pollosPorJaba?: number;
}

export interface AppConfig {
  appName: string;
  logo: string | null;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  campana: string;
  
  // For INGRESO
  galpon?: string;
  plantel?: string;
  hembrasIn?: number;
  machosIn?: number;
  costoUnitarioIn?: number;
  
  // For VENTA
  cliente?: string;
  items?: SaleItem[];
  jabas?: number;
  pollosPorJaba?: number;
  
  // Calculated
  totalCosto: number;
  totalVenta: number;
  ganancia: number;
}
