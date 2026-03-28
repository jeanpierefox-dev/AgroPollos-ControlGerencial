export type TransactionType = 'INGRESO' | 'VENTA';
export type TipoPollo = 'BRASA' | 'PRESA' | 'TIPO_HEMBRA' | 'TIPO_MACHO';
export type Role = 'admin' | 'vendedor' | 'despachador';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: Role;
  name: string;
}

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
  galponMachos?: string;
  galponHembras?: string;
  plantel?: string;
  hembrasIn?: number;
  machosIn?: number;
  muertesHembras?: number;
  muertesMachos?: number;
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
