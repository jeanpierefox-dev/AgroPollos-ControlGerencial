import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, FileText, BarChart3 } from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ingresos', label: 'Ingreso Crianza', icon: ArrowDownToLine },
    { id: 'ventas', label: 'Venta de Pollos', icon: ArrowUpFromLine },
    { id: 'kardex', label: 'Kardex', icon: FileText },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="p-6 border-b border-slate-800 hidden md:block">
        <h1 className="text-xl font-bold text-white flex items-center gap-3">
          <Logo className="w-8 h-8" iconSize={20} />
          AgroPollos
        </h1>
        <p className="text-xs text-slate-500 mt-1">Control Gerencial</p>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
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
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        &copy; 2026 AgroPollos System
      </div>
    </div>
  );
}
