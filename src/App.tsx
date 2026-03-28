import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Ingresos } from './components/Ingresos';
import { Ventas } from './components/Ventas';
import { Kardex } from './components/Kardex';
import { Reportes } from './components/Reportes';
import { Configuracion } from './components/Configuracion';
import { Usuarios } from './components/Usuarios';
import { Login } from './components/Login';
import { useStore } from './useStore';
import { Menu, X, LogOut } from 'lucide-react';
import { Logo } from './components/Logo';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const store = useStore();
  const { appConfig, currentUser, logout } = store;

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'despachador') {
        setCurrentView('ventas');
      } else {
        setCurrentView('dashboard');
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
    if (currentUser.role === 'vendedor' && !['dashboard', 'ventas'].includes(currentView)) {
      return <div className="p-8 text-center text-slate-500">No tienes permisos para acceder a esta sección.</div>;
    }

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
      case 'configuracion':
        return <Configuracion store={store} />;
      case 'usuarios':
        return <Usuarios store={store} />;
      default:
        return <Dashboard store={store} />;
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-900 print:block print:bg-white">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 print:hidden">
        <h1 className="text-lg font-bold flex items-center gap-3">
          {appConfig.logo ? (
            <img src={appConfig.logo} alt="Logo" className="w-7 h-7 object-contain rounded" />
          ) : (
            <Logo className="w-7 h-7" iconSize={18} />
          )}
          {appConfig.appName}
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={logout} className="p-2 text-slate-300 hover:text-white">
            <LogOut size={20} />
          </button>
          <button onClick={toggleSidebar} className="p-2 text-slate-300 hover:text-white">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out bg-slate-900 md:relative md:translate-x-0 print:hidden flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex-1 overflow-y-auto">
          <Sidebar 
            currentView={currentView} 
            setCurrentView={(view) => {
              setCurrentView(view);
              setIsSidebarOpen(false);
            }}
            store={store}
          />
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <div className="text-xs">
              <span className="block font-bold text-slate-300">{currentUser.name}</span>
              <span className="uppercase tracking-widest">{currentUser.role}</span>
            </div>
            <button onClick={logout} className="p-2 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Cerrar Sesión">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto print:overflow-visible print:block">
        {renderView()}
      </main>
    </div>
  );
}
