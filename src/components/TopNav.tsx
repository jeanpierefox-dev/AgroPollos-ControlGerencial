import React, { useState } from 'react';
import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, FileText, BarChart3, RotateCcw, AlertTriangle, Settings, Users, Skull, LogOut, Menu, X, Home } from 'lucide-react';
import { Logo } from './Logo';

interface TopNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  store?: any;
}

export function TopNav({ currentView, setCurrentView, store }: TopNavProps) {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const appConfig = store?.appConfig || { appName: 'AgroPollos', logo: null };
  const currentUser = store?.currentUser;

  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home, roles: ['admin', 'vendedor'] },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'vendedor'] },
    { id: 'ingresos', label: 'Ingreso Crianza', icon: ArrowDownToLine, roles: ['admin'] },
    { id: 'mortalidad', label: 'Mortalidad', icon: Skull, roles: ['admin'] },
    { id: 'ventas', label: 'Venta de Pollos', icon: ArrowUpFromLine, roles: ['admin', 'vendedor', 'despachador'] },
    { id: 'kardex', label: 'Kardex', icon: FileText, roles: ['admin'] },
    { id: 'reportes', label: 'Reportes', icon: BarChart3, roles: ['admin'] },
    { id: 'usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
    { id: 'configuracion', label: 'Configuración', icon: Settings, roles: ['admin'] },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    !currentUser || item.roles.includes(currentUser.role)
  );

  const handleReset = () => {
    if (store && store.resetStore) {
      store.resetStore();
      setIsResetModalOpen(false);
      setCurrentView('dashboard');
    }
  };

  const handleNavClick = (id: string) => {
    setCurrentView(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button onClick={() => handleNavClick('home')} className="flex-shrink-0 flex items-center gap-3 hover:opacity-80 transition-opacity">
              {appConfig.logo ? (
                <img src={appConfig.logo} alt="Logo" className="w-8 h-8 object-contain rounded bg-white p-0.5" />
              ) : (
                <Logo className="w-8 h-8 text-emerald-400" iconSize={24} />
              )}
              <span className="font-bold text-xl tracking-tight">{appConfig.appName}</span>
            </button>

            {/* User & Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-white">{currentUser?.name}</div>
                <div className="text-[10px] uppercase tracking-widest text-emerald-400">{currentUser?.role}</div>
              </div>
              <button onClick={store?.logout} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors flex items-center gap-2" title="Cerrar Sesión">
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline-block">Salir</span>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 text-red-600 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Restablecer Sistema</h3>
            </div>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas restablecer todo el sistema a los valores de fábrica? 
              <strong className="block mt-2 text-red-600">Esta acción eliminará TODOS los ingresos, ventas y reportes. No se puede deshacer.</strong>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Sí, Restablecer Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
