import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Ingresos } from './components/Ingresos';
import { Ventas } from './components/Ventas';
import { Kardex } from './components/Kardex';
import { Reportes } from './components/Reportes';
import { useStore } from './useStore';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const store = useStore();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard store={store} />;
      case 'ingresos':
        return <Ingresos store={store} />;
      case 'ventas':
        return <Ventas store={store} />;
      case 'kardex':
        return <Kardex store={store} />;
      case 'reportes':
        return <Reportes store={store} />;
      default:
        return <Dashboard store={store} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 print:block print:bg-white">
      <div className="print:hidden">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      </div>
      <main className="flex-1 overflow-y-auto print:overflow-visible print:block">
        {renderView()}
      </main>
    </div>
  );
}
