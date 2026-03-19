import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Dashboard({ store }: { store: any }) {
  const { transactions, getGlobalStock, getCampanas, getCampanaInfo } = store;
  const stock = getGlobalStock();
  const campanas = getCampanas();

  const totalVentas = transactions.filter((t: any) => t.type === 'VENTA').reduce((acc: number, t: any) => acc + t.totalVenta, 0);
  const totalCostos = transactions.filter((t: any) => t.type === 'INGRESO').reduce((acc: number, t: any) => acc + t.totalCosto, 0);
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
    <div className="p-8 bg-[#f5f5f5] min-h-full font-sans">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-light text-slate-900 tracking-tight">Resumen Gerencial</h2>
        <p className="text-slate-500 mt-1 text-sm uppercase tracking-widest">Indicadores Financieros y Operativos</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Ingresos Brutos</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-slate-400">S/</span>
            <p className="text-2xl font-light text-slate-900">{totalVentas.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Costos Totales</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-slate-400">S/</span>
            <p className="text-2xl font-light text-slate-900">{totalCostos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-800 relative overflow-hidden">
          <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Utilidad Neta</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-emerald-400">S/</span>
            <p className="text-2xl font-light text-white">{totalGanancia.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Margen de Utilidad</p>
          <div className="flex items-baseline gap-1">
            <p className={`text-2xl font-light ${margenUtilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {margenUtilidad.toFixed(1)}
            </p>
            <span className="text-sm text-slate-400">%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">ROI Global</p>
          <div className="flex items-baseline gap-1">
            <p className={`text-2xl font-light ${roi >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {roi.toFixed(1)}
            </p>
            <span className="text-sm text-slate-400">%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200 h-[400px]">
          <h3 className="text-sm font-semibold text-slate-800 mb-6 uppercase tracking-wider">Flujo de Ingresos (Últimos Días)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(value) => `S/${value}`} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  formatter={(value: number) => [`S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="ventas" name="Ingreso Bruto" stroke="#0f172a" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="ganancia" name="Utilidad Neta" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Datos insuficientes para graficar.
            </div>
          )}
        </div>

        {/* Stock Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-800 mb-6 uppercase tracking-wider">Inventario Vivo</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Hembras</p>
                <p className="text-3xl font-light text-slate-800">{stock.hembras.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">H</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Machos</p>
                <p className="text-3xl font-light text-slate-800">{stock.machos.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">M</div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Aves</p>
              <p className="text-xl font-medium text-slate-900">{(stock.hembras + stock.machos).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Campaigns Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Top Campañas por Utilidad</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Campaña</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Galpón</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Ingresos</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Costos</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Utilidad</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campanaPerformance.length > 0 ? (
                campanaPerformance.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.campana}</td>
                    <td className="px-6 py-4 text-slate-600">{row.galpon}</td>
                    <td className="px-6 py-4 text-right text-slate-600">S/ {row.ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right text-slate-600">S/ {row.costos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">S/ {row.utilidad.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${row.roi >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {row.roi.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No hay campañas registradas.
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

