import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Printer } from 'lucide-react';
import { Logo } from './Logo';

export function Dashboard({ store }: { store: any }) {
  const { transactions, getGlobalStock, getCampanas, getCampanaInfo } = store;
  const stock = getGlobalStock();
  const campanas = getCampanas();

  const totalVentas = transactions.filter((t: any) => t.type === 'VENTA').reduce((acc: number, t: any) => acc + t.totalVenta, 0);
  const totalCostos = transactions.filter((t: any) => t.type === 'INGRESO').reduce((acc: number, t: any) => acc + t.totalCosto, 0);
  const totalMortalidad = transactions.filter((t: any) => t.type === 'MORTALIDAD').reduce((acc: number, t: any) => acc + (t.cantidadMuertos || 0), 0);
  const totalGanancia = totalVentas - totalCostos;
  
  const margenUtilidad = totalVentas > 0 ? (totalGanancia / totalVentas) * 100 : 0;
  const roi = totalCostos > 0 ? (totalGanancia / totalCostos) * 100 : 0;

  // Prepare chart data (last 7 days of sales)
  const salesByDate = transactions
    .filter((t: any) => t.type === 'VENTA')
    .reduce((acc: any, t: any) => {
      const date = format(new Date(t.date), 'dd MMM', { locale: es });
      if (!acc[date]) {
        acc[date] = { date, ventas: 0, ganancia: 0 };
      }
      acc[date].ventas += t.totalVenta;
      acc[date].ganancia += t.ganancia;
      return acc;
    }, {});

  const chartData = Object.values(salesByDate).slice(-7);

  // Campaign Performance Data
  const campanaPerformance = campanas.map((campana: string) => {
    const campanaTx = transactions.filter((t: any) => t.campana === campana);
    const info = getCampanaInfo(campana);
    
    let ingresos = 0;
    let costos = 0;
    
    campanaTx.forEach((t: any) => {
      if (t.type === 'INGRESO') costos += t.totalCosto;
      if (t.type === 'VENTA') ingresos += t.totalVenta;
    });
    
    const utilidad = ingresos - costos;
    const roiCampana = costos > 0 ? (utilidad / costos) * 100 : 0;
    
    return {
      campana,
      galpon: info?.galpon || 'N/A',
      ingresos,
      costos,
      utilidad,
      roi: roiCampana
    };
  }).sort((a: any, b: any) => b.utilidad - a.utilidad).slice(0, 5); // Top 5

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-full font-sans print:bg-white print:p-0">
      <div className="hidden print:flex items-center gap-4 mb-8 border-b-2 border-slate-900 pb-4">
        <Logo className="w-12 h-12" iconSize={32} />
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">AGROPOLLOS</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Resumen Gerencial</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-200 pb-6 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Resumen Gerencial</h2>
          <p className="text-slate-500 mt-1 text-xs font-bold uppercase tracking-[0.2em]">Indicadores de Rendimiento y Salud Financiera</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm print:hidden"
        >
          <Printer size={18} />
          Exportar PDF
        </button>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Ingresos Brutos</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-300">S/</span>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{totalVentas.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Costos Totales</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-300">S/</span>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{totalCostos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Mortalidad Total</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-red-600 tracking-tight">{totalMortalidad}</p>
            <span className="text-sm font-bold text-red-400">aves</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Utilidad Neta</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-emerald-400">S/</span>
            <p className="text-2xl font-black text-white tracking-tight">{totalGanancia.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Margen Bruto</p>
          <div className="flex items-baseline gap-1">
            <p className={`text-2xl font-black tracking-tight ${margenUtilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {margenUtilidad.toFixed(1)}
            </p>
            <span className="text-sm font-bold text-slate-300">%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">ROI Global</p>
          <div className="flex items-baseline gap-1">
            <p className={`text-2xl font-black tracking-tight ${roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {roi.toFixed(1)}
            </p>
            <span className="text-sm font-bold text-slate-300">%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-[400px] print:h-[300px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Flujo de Caja (Ventas vs Utilidad)</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Ventas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Utilidad</span>
              </div>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickFormatter={(value) => `S/${value}`} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}
                  itemStyle={{ color: '#0f172a' }}
                  formatter={(value: number) => [`S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, '']}
                />
                <Line type="monotone" dataKey="ventas" stroke="#0f172a" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="ganancia" stroke="#10b981" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
              Datos insuficientes para graficar el flujo.
            </div>
          )}
        </div>

        {/* Stock Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-xs font-black text-slate-800 mb-8 uppercase tracking-widest">Inventario en Granja</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hembras (Brasa/Tipo)</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{stock.hembras.toLocaleString()}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-black text-xl shadow-sm">H</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Machos (Presa/Tipo)</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{stock.machos.toLocaleString()}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl shadow-sm">M</div>
            </div>
            <div className="pt-6 border-t-2 border-dashed border-slate-100 flex justify-between items-end">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Población</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{(stock.hembras + stock.machos).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Campaigns Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Rendimiento por Campaña (Top 5)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Campaña</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Galpón</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">Ingresos</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">Costos</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">Utilidad</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {campanaPerformance.length > 0 ? (
                campanaPerformance.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{row.campana}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                        {row.galpon}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-600">S/ {row.ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-600">S/ {row.costos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right font-black text-emerald-600">S/ {row.utilidad.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${row.roi >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {row.roi.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    No hay campañas registradas para mostrar rendimiento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

