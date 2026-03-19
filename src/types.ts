export type TransactionType = 'INGRESO' | 'VENTA';
export type TipoPollo = 'BRASA' | 'PRESA' | 'TIPO_HEMBRA' | 'TIPO_MACHO';

export interface SaleItem {
  id: string;
  tipo: TipoPollo;
  cantidad: number;
  pesoTotal: number;
  precioKilo: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  campana: string;
  
  // For INGRESO
  galpon?: string;
  hembrasIn?: number;
  machosIn?: number;
  costoUnitarioIn?: number;
  
  // For VENTA
  cliente?: string;
  items?: SaleItem[];
  
  // Calculated
  totalCosto: number;
  totalVenta: number;
  ganancia: number;
}
