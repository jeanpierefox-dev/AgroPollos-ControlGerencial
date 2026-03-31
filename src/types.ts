export type TransactionType = 'INGRESO' | 'VENTA' | 'MORTALIDAD';
export type TipoPollo = 'BRASA' | 'PRESA' | 'TIPO_HEMBRA' | 'TIPO_MACHO';
export type Role = 'admin' | 'vendedor' | 'despachador';
export type ProductType = 'pollos_bebes' | 'pollos_vivos';
export type ClientType = 'pollos_bebes' | 'pollos_vivos' | 'ambos';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: Role;
  name: string;
}

export interface Client {
  id: string;
  documento: string;
  nombre: string;
  direccion: string;
  tipo: ClientType;
  fechaRegistro: string;
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

export interface DispatchOrder {
  incubadora: string;
  cajaPorAve: number;
  cantidad: number;
  sexo: string;
  cajasVacias: number;
  cajasLlenas: number;
  totalCajas: number;
}

export interface SenasaCertificateData {
  numeroCertificacion: string;
  destinoDepartamento: string;
  destinoProvincia: string;
  destinoDistrito: string;
  usoProposito: string;
  especie: string;
  producto: string;
  unidadMedida: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  campana?: string;
  productType?: ProductType; // Added for distinguishing bebes vs vivos
  
  // For INGRESO
  galpon?: string;
  galponMachos?: string;
  galponHembras?: string;
  plantel?: string;
  hembrasIn?: number;
  machosIn?: number;
  costoUnitarioIn?: number;
  ingresoType?: 'venta_directa' | 'granja' | 'san_fernando'; // For pollos bebes and san fernando
  
  // New fields for INGRESO pollos_bebes
  incubadora?: string;
  totalHI?: number;
  totalNacido?: number;
  enviadoLaboratorio?: number;
  informeDia?: string;
  saldo?: number;

  // New fields for San Fernando Purchase (Ingreso)
  pesoJabasLlenas?: number;
  pesoJabasVacias?: number;
  pesoPollosMuertos?: number;
  cantidadPollosMuertos?: number;
  cantidadJabasLlenas?: number;
  cantidadJabasVacias?: number;
  pollosPorJabaSanFernando?: number;
  netoPeso?: number;
  cantidadTotalPollos?: number;
  promedioPolloLima?: number;
  promedioPolloFinal?: number;
  promedioJaba?: number;
  promedioPolloMuerto?: number;
  
  // For VENTA
  cliente?: string;
  clientId?: string; // Reference to manual client
  direccionCliente?: string;
  vehiculo?: string;
  conductor?: string;
  items?: SaleItem[];
  jabas?: number;
  pollosPorJaba?: number;
  dispatchOrder?: DispatchOrder; // For pollos bebes
  senasaCertificate?: SenasaCertificateData;
  
  // For MORTALIDAD
  galponAfectado?: 'HEMBRAS' | 'MACHOS';
  cantidadMuertos?: number;
  causa?: string;
  
  // Calculated
  totalCosto: number;
  totalVenta: number;
  ganancia: number;
}
