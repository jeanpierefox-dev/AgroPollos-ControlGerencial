import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction, AppConfig, User, Client } from './types';

interface StoreState {
  transactions: Transaction[];
  clients: Client[];
  appConfig: AppConfig;
  users: User[];
  currentUser: User | null;
  
  // Auth actions
  login: (username: string, passwordHash: string) => boolean;
  logout: () => void;
  
  // User actions
  addUser: (user: User) => void;
  updateUser: (id: string, updated: User) => void;
  deleteUser: (id: string) => void;
  
  // Client actions
  addClient: (client: Client) => void;
  updateClient: (id: string, updated: Client) => void;
  deleteClient: (id: string) => void;
  
  // Config actions
  updateAppConfig: (config: Partial<AppConfig>) => void;
  
  // Transaction actions
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, updated: Transaction) => void;
  deleteTransaction: (id: string) => void;
  resetStore: () => void;
  
  // Selectors/Calculations
  getStockByCampana: (campana: string, excludeTransactionId?: string) => { hembras: number; machos: number; costoUnitario: number };
  getCampanas: () => string[];
  getCampanaInfo: (campana: string) => { plantel: string; galpon: string; galponHembras: string; galponMachos: string; costoUnitario: number };
  getStockByType: (type: 'pollos_bebes' | 'pollos_vivos') => { hembras: number; machos: number };
  getGlobalStock: () => { hembras: number; machos: number };
}

const defaultAppConfig: AppConfig = {
  appName: 'AgroPollos',
  logo: null,
};

const defaultAdmin: User = {
  id: 'admin-1',
  username: 'admin',
  passwordHash: '1234',
  role: 'admin',
  name: 'Administrador'
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      transactions: [],
      clients: [],
      appConfig: defaultAppConfig,
      users: [defaultAdmin],
      currentUser: null,

      login: (username, passwordHash) => {
        const { users } = get();
        const user = users.find(u => u.username === username && u.passwordHash === passwordHash);
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },

      logout: () => set({ currentUser: null }),

      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      
      updateUser: (id, updated) => set((state) => ({
        users: state.users.map(u => u.id === id ? updated : u)
      })),

      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      })),

      addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),

      updateClient: (id, updated) => set((state) => ({
        clients: state.clients.map(c => c.id === id ? updated : c)
      })),

      deleteClient: (id) => set((state) => ({
        clients: state.clients.filter(c => c.id !== id)
      })),

      updateAppConfig: (config) => set((state) => ({
        appConfig: { ...state.appConfig, ...config }
      })),

      addTransaction: (t) => set((state) => ({
        transactions: [...state.transactions, t].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      })),

      updateTransaction: (id, updated) => set((state) => ({
        transactions: state.transactions.map(t => t.id === id ? updated : t).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      })),

      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),

      resetStore: () => set({ transactions: [] }),

      getStockByCampana: (campana, excludeTransactionId) => {
        const { transactions } = get();
        let hembras = 0;
        let machos = 0;
        let costoUnitario = 0;

        transactions.filter(t => t.campana === campana && t.id !== excludeTransactionId).forEach(t => {
          if (t.type === 'INGRESO') {
            hembras += (t.hembrasIn || 0);
            machos += (t.machosIn || 0);
            costoUnitario = t.costoUnitarioIn || 0;
          } else if (t.type === 'VENTA' && t.items) {
            t.items.forEach(item => {
              if (item.tipo === 'BRASA' || item.tipo === 'TIPO_HEMBRA') hembras -= item.cantidad;
              if (item.tipo === 'PRESA' || item.tipo === 'TIPO_MACHO') machos -= item.cantidad;
            });
          } else if (t.type === 'MORTALIDAD') {
            if (t.galponAfectado === 'HEMBRAS') hembras -= (t.cantidadMuertos || 0);
            if (t.galponAfectado === 'MACHOS') machos -= (t.cantidadMuertos || 0);
          }
        });
        return { hembras, machos, costoUnitario };
      },

      getCampanas: () => {
        const { transactions } = get();
        const campanas = new Set<string>();
        transactions.forEach(t => {
          if (t.campana) campanas.add(t.campana);
        });
        return Array.from(campanas);
      },

      getCampanaInfo: (campana) => {
        const { transactions } = get();
        const ingreso = transactions.find(t => t.type === 'INGRESO' && t.campana === campana);
        return {
          plantel: ingreso?.plantel || 'N/A',
          galpon: ingreso?.galpon || 'N/A',
          galponHembras: ingreso?.galponHembras || 'N/A',
          galponMachos: ingreso?.galponMachos || 'N/A',
          costoUnitario: ingreso?.costoUnitarioIn || 0
        };
      },

      getStockByType: (type) => {
        const { transactions } = get();
        let hembras = 0;
        let machos = 0;
        
        transactions.forEach(t => {
          if (t.type === 'INGRESO') {
            const isMatch = (type === 'pollos_bebes' && t.ingresoType === 'venta_directa') || 
                            (type === 'pollos_vivos' && (t.ingresoType === 'granja' || t.ingresoType === 'san_fernando'));
            if (isMatch) {
              hembras += (t.hembrasIn || 0);
              machos += (t.machosIn || 0);
            }
          } 
          else if (t.type === 'VENTA' && t.productType === type && t.items) {
            t.items.forEach(item => {
              if (item.tipo === 'BRASA' || item.tipo === 'TIPO_HEMBRA') hembras -= item.cantidad;
              if (item.tipo === 'PRESA' || item.tipo === 'TIPO_MACHO') machos -= item.cantidad;
            });
          } else if (t.type === 'MORTALIDAD' && t.productType === type) {
            if (t.galponAfectado === 'HEMBRAS') hembras -= (t.cantidadMuertos || 0);
            if (t.galponAfectado === 'MACHOS') machos -= (t.cantidadMuertos || 0);
          }
        });
        
        return { hembras, machos };
      },

      getGlobalStock: () => {
        const { transactions } = get();
        let hembras = 0;
        let machos = 0;
        transactions.forEach(t => {
          if (t.type === 'INGRESO') {
            hembras += (t.hembrasIn || 0);
            machos += (t.machosIn || 0);
          } else if (t.type === 'VENTA' && t.items) {
            t.items.forEach(item => {
              if (item.tipo === 'BRASA' || item.tipo === 'TIPO_HEMBRA') hembras -= item.cantidad;
              if (item.tipo === 'PRESA' || item.tipo === 'TIPO_MACHO') machos -= item.cantidad;
            });
          } else if (t.type === 'MORTALIDAD') {
            if (t.galponAfectado === 'HEMBRAS') hembras -= (t.cantidadMuertos || 0);
            if (t.galponAfectado === 'MACHOS') machos -= (t.cantidadMuertos || 0);
          }
        });
        return { hembras, machos };
      },
    }),
    {
      name: 'pollos-store-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

