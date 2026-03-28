import React, { useState } from 'react';
import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, FileText, BarChart3, RotateCcw, AlertTriangle, Settings, Users } from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  store?: any;
}

export function Sidebar({ currentView, setCurrentView, store }: SidebarProps) {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const appConfig = store?.appConfig || { appName: 'AgroPollos', logo: null };
  const currentUser = store?.currentUser;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'vendedor'] },
    { id: 'ingresos', label: 'Ingreso Crianza', icon: ArrowDownToLine, roles: ['admin'] },
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

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="p-6 border-b border-slate-800 hidden md:block">
        <h1 className="text-xl font-bold text-white flex items-center gap-3">
          {appConfig.logo ? (
            <img src={appConfig.logo} alt="Logo" className="w-8 h-8 object-contain rounded" />
          ) : (
            <Logo className="w-8 h-8" iconSize={20} />
          )}
          {appConfig.appName}
        </h1>
        <p className="text-xs text-slate-500 mt-1">Control Gerencial</p>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-medium'
                      : 'hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {currentUser?.role === 'admin' && (
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-lg transition-colors text-sm font-medium mb-4"
          >
            <RotateCcw size={16} />
            Restablecer Sistema
          </button>
          <div className="text-xs text-slate-500 text-center">
            &copy; 2026 AgroPollos System
          </div>
        </div>
      )}

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
    </div>
  );
}
