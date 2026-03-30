import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { Dashboard } from './components/Dashboard';
import { Ingresos } from './components/Ingresos';
import { Mortalidad } from './components/Mortalidad';
import { Ventas } from './components/Ventas';
import { Kardex } from './components/Kardex';
import { Reportes } from './components/Reportes';
import { Configuracion } from './components/Configuracion';
import { Usuarios } from './components/Usuarios';
import { Clientes } from './components/Clientes';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { useStore } from './useStore';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const store = useStore();
  const { currentUser } = store;

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'despachador') {
        setCurrentView('ventas');
      } else {
        setCurrentView('home');
      }
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Login store={store} />;
  }

  const renderView = () => {
    // Basic route protection
    if (currentUser.role === 'despachador' && currentView !== 'ventas') {
      return <div className="p-8 text-center text-slate-500">No tienes permisos para acceder a esta sección.</div>;
    }
    if (currentUser.role === 'vendedor' && !['dashboard', 'ventas', 'clientes'].includes(currentView)) {
      return <div className="p-8 text-center text-slate-500">No tienes permisos para acceder a esta sección.</div>;
    }

    switch (currentView) {
      case 'home':
        return <Home setActiveTab={setCurrentView} currentUser={currentUser} />;
      case 'dashboard':
        return <Dashboard store={store} />;
      case 'clientes':
        return <Clientes />;
      case 'ingresos':
        return <Ingresos store={store} />;
      case 'mortalidad':
        return <Mortalidad store={store} />;
      case 'ventas':
        return <Ventas store={store} />;
      case 'kardex':
        return <Kardex store={store} />;
      case 'reportes':
        return <Reportes store={store} />;
      case 'configuracion':
        return <Configuracion store={store} />;
      case 'usuarios':
        return <Usuarios store={store} />;
      default:
        return <Home setActiveTab={setCurrentView} currentUser={currentUser} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 print:block print:bg-white">
      <TopNav 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        store={store}
      />
      <main className="flex-1 overflow-y-auto print:overflow-visible print:block max-w-7xl mx-auto w-full">
        {renderView()}
      </main>
    </div>
  );
}
