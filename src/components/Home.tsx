import React from 'react';
import { PieChart, Package, ShoppingCart, Skull, FileText, TrendingUp, Users, Settings } from 'lucide-react';
import { User } from '../types';

export function Home({ setActiveTab, currentUser }: { setActiveTab: (tab: string) => void, currentUser: User | null }) {
  const modules = [
    { id: 'dashboard', title: 'Resumen Gerencial', desc: 'Indicadores y KPIs', icon: PieChart, color: 'text-blue-600', bg: 'bg-blue-50', roles: ['admin', 'vendedor'] },
    { id: 'ingresos', title: 'Ingreso de Lotes', desc: 'Registro de pollos bebés', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50', roles: ['admin'] },
    { id: 'ventas', title: 'Ventas y Despachos', desc: 'Facturación y guías', icon: ShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-50', roles: ['admin', 'vendedor', 'despachador'] },
    { id: 'mortalidad', title: 'Control de Mortalidad', desc: 'Registro de bajas', icon: Skull, color: 'text-red-600', bg: 'bg-red-50', roles: ['admin'] },
    { id: 'kardex', title: 'Kardex de Inventario', desc: 'Control de existencias', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', roles: ['admin'] },
    { id: 'reportes', title: 'Reportes Financieros', desc: 'Análisis de rentabilidad', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', roles: ['admin'] },
    { id: 'usuarios', title: 'Usuarios', desc: 'Gestión de accesos', icon: Users, color: 'text-slate-600', bg: 'bg-slate-100', roles: ['admin'] },
    { id: 'configuracion', title: 'Configuración', desc: 'Ajustes del sistema', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100', roles: ['admin'] },
  ];

  const visibleModules = modules.filter(m => !currentUser || m.roles.includes(currentUser.role));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Menú Principal</h1>
        <p className="text-slate-500 mt-2 font-medium tracking-wide">Seleccione un módulo para comenzar a operar</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleModules.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveTab(m.id)}
            className="flex items-center gap-6 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all text-left group"
          >
            <div className={`p-5 rounded-2xl ${m.bg} ${m.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
              <m.icon size={36} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight">{m.title}</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
