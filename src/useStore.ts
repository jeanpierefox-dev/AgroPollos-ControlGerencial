import { useState, useEffect } from 'react';
import { Transaction, AppConfig } from './types';

const defaultAppConfig: AppConfig = {
  appName: 'AgroPollos',
  logo: null,
};

export function useStore() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('pollos_transactions_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('pollos_app_config');
    return saved ? JSON.parse(saved) : defaultAppConfig;
  });

  useEffect(() => {
    localStorage.setItem('pollos_transactions_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pollos_app_config', JSON.stringify(appConfig));
    document.title = appConfig.appName;
    if (appConfig.logo) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = appConfig.logo;
    }
  }, [appConfig]);

  const updateAppConfig = (config: Partial<AppConfig>) => {
    setAppConfig(prev => ({ ...prev, ...config }));
  };

  const addTransaction = (t: Transaction) => {
    setTransactions(prev => [...prev, t].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const updateTransaction = (id: string, updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === id ? updated : t).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const resetStore = () => {
    setTransactions([]);
    localStorage.removeItem('pollos_transactions_v2');
  };

  const getStockByCampana = (campana: string, excludeTransactionId?: string) => {
    let hembras = 0;
    let machos = 0;
    let costoUnitario = 0;

    transactions.filter(t => t.campana === campana && t.id !== excludeTransactionId).forEach(t => {
      if (t.type === 'INGRESO') {
        hembras += t.hembrasIn || 0;
        machos += t.machosIn || 0;
        costoUnitario = t.costoUnitarioIn || 0;
      } else if (t.type === 'VENTA' && t.items) {
        t.items.forEach(item => {
          if (item.tipo === 'BRASA' || item.tipo === 'TIPO_HEMBRA') hembras -= item.cantidad;
          if (item.tipo === 'PRESA' || item.tipo === 'TIPO_MACHO') machos -= item.cantidad;
        });
      }
    });
    return { hembras, machos, costoUnitario };
  };

  const getCampanas = () => {
    const campanas = new Set<string>();
    transactions.forEach(t => {
      if (t.campana) campanas.add(t.campana);
    });
    return Array.from(campanas);
  };

  const getCampanaInfo = (campana: string) => {
    const ingreso = transactions.find(t => t.type === 'INGRESO' && t.campana === campana);
    return {
      plantel: ingreso?.plantel || 'N/A',
      galpon: ingreso?.galpon || 'N/A',
      costoUnitario: ingreso?.costoUnitarioIn || 0
    };
  };

  const getGlobalStock = () => {
    let hembras = 0;
    let machos = 0;
    transactions.forEach(t => {
      if (t.type === 'INGRESO') {
        hembras += t.hembrasIn || 0;
        machos += t.machosIn || 0;
      } else if (t.type === 'VENTA' && t.items) {
        t.items.forEach(item => {
          if (item.tipo === 'BRASA' || item.tipo === 'TIPO_HEMBRA') hembras -= item.cantidad;
          if (item.tipo === 'PRESA' || item.tipo === 'TIPO_MACHO') machos -= item.cantidad;
        });
      }
    });
    return { hembras, machos };
  };

  return { transactions, appConfig, updateAppConfig, addTransaction, updateTransaction, deleteTransaction, resetStore, getStockByCampana, getCampanas, getCampanaInfo, getGlobalStock };
}
