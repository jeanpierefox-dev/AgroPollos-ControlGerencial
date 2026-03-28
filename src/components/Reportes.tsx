import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { format, isWithinInterval, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Printer, Calendar, TrendingUp, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import { Logo } from './Logo';

export function Reportes({ store }: { store: any }) {
  const { transactions, appConfig } = store;
  
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t: Transaction) => {
      const tDate = parseISO(t.date);
      return isWithinInterval(tDate, {
        start: parseISO(startDate),
        end: parseISO(endDate)
      });
    });
  }, [transactions, startDate, endDate]);

  const campaignStats = useMemo(() => {
    const stats: any = {};
    
    filteredTransactions.forEach((t: Transaction) => {
      if (!stats[t.campana]) {
        stats[t.campana] = {
          campana: t.campana,
          galpon: t.galpon || 'N/A',
          ingresos: 0,
          ventas: 0,
          costos: 0,
          utilidad: 0,
          hembras: 0,
          machos: 0,
          brasa: 0,
          presa: 0,
          tipo: 0
        };
      }
      
      if (t.type === 'INGRESO') {
        stats[t.campana].ingresos += t.totalCosto || 0;
        stats[t.campana].hembras += t.hembrasIn || 0;
        stats[t.campana].machos += t.machosIn || 0;
      } else if (t.type === 'VENTA') {
        stats[t.campana].ventas += t.totalVenta || 0;
        stats[t.campana].costos += t.totalCosto || 0;
        stats[t.campana].utilidad += t.ganancia || 0;
        
        t.items?.forEach(item => {
          if (item.tipo === 'BRASA') stats[t.campana].brasa += item.cantidad;
          else if (item.tipo === 'PRESA') stats[t.campana].presa += item.cantidad;
          else stats[t.campana].tipo += item.cantidad;
        });
      }
    });
    
    return Object.values(stats).map((s: any) => ({
      ...s,
      label: `${s.campana} (${s.galpon})`,
      roi: s.costos > 0 ? (s.utilidad / s.costos) * 100 : 0,
      margin: s.ventas > 0 ? (s.utilidad / s.ventas) * 100 : 0
    }));
  }, [filteredTransactions]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === 'INGRESO') {
        acc.totalInversion += t.totalCosto || 0;
      } else if (t.type === 'VENTA') {
        acc.totalVentas += t.totalVenta || 0;
        acc.totalCostosVenta += t.totalCosto || 0;
        acc.totalUtilidad += t.ganancia || 0;
      }
      return acc;
    }, { totalInversion: 0, totalVentas: 0, totalCostosVenta: 0, totalUtilidad: 0 });
  }, [filteredTransactions]);

  const handlePrint = () => {
    window.print();
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const pieData = [
    { name: 'Brasa (H)', value: campaignStats.reduce((acc, s) => acc + s.brasa, 0) },
    { name: 'Presa (M)', value: campaignStats.reduce((acc, s) => acc + s.presa, 0) },
    { name: 'Tipo', value: campaignStats.reduce((acc, s) => acc + s.tipo, 0) },
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" />
            Reportes Gerenciales
          </h2>
          <p className="text-slate-500 text-sm mt-1">Análisis financiero y operativo por periodo</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 border-r border-slate-100 last:border-0">
            <Calendar size={16} className="text-slate-400" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm font-medium focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border-r border-slate-100 last:border-0">
            <span className="text-slate-300">al</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm font-medium focus:outline-none bg-transparent"
            />
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium ml-2"
          >
            <Printer size={18} />
            Imprimir Reporte
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-10 border-b-2 border-slate-900 pb-6">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-4">
            <Logo className="w-12 h-12" iconSize={32} />
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">AGROPOLLOS</h1>
              <p className="text-slate-600 font-medium uppercase tracking-widest text-xs mt-1">Reporte de Desempeño Financiero</p>
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p className="font-bold text-slate-900">Periodo: {format(parseISO(startDate), 'dd/MM/yyyy')} - {format(parseISO(endDate), 'dd/MM/yyyy')}</p>
            <p>Generado el: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ventas Totales</p>
          <h3 className="text-2xl font-black text-slate-900">S/ {totals.totalVentas.toLocaleString()}</h3>
          <div className="mt-2 flex items-center text-emerald-600 text-xs font-bold">
            <TrendingUp size={14} className="mr-1" />
            Ingreso Bruto
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Costo de Ventas</p>
          <h3 className="text-2xl font-black text-slate-900">S/ {totals.totalCostosVenta.toLocaleString()}</h3>
          <div className="mt-2 flex items-center text-slate-400 text-xs font-bold">
            <DollarSign size={14} className="mr-1" />
            Costo de Mercancía
          </div>
        </div>
        <div className="bg-emerald-500 p-6 rounded-2xl shadow-lg shadow-emerald-200/50">
          <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider mb-1">Utilidad Neta</p>
          <h3 className="text-2xl font-black text-white">S/ {totals.totalUtilidad.toLocaleString()}</h3>
          <div className="mt-2 flex items-center text-emerald-100 text-xs font-bold">
            <TrendingUp size={14} className="mr-1" />
            Ganancia Realizada
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg shadow-slate-200/50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Margen Promedio</p>
          <h3 className="text-2xl font-black text-white">
            {totals.totalVentas > 0 ? ((totals.totalUtilidad / totals.totalVentas) * 100).toFixed(1) : '0.0'}%
          </h3>
          <div className="mt-2 flex items-center text-emerald-400 text-xs font-bold">
            <TrendingUp size={14} className="mr-1" />
            Rentabilidad
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <DollarSign className="text-emerald-500" size={20} />
            Utilidad por Campaña (Galpón)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value}`} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
                  itemStyle={{ color: '#0f172a' }}
                  formatter={(value: any) => [`S/ ${value.toLocaleString()}`, 'Utilidad']}
                />
                <Bar dataKey="utilidad" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PieChartIcon className="text-emerald-500" size={20} />
            Distribución de Ventas por Tipo
          </h3>
          <div className="h-[300px] flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Resumen Detallado por Campaña</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4 border-b border-slate-100">Campaña (Galpón)</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">Ventas</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">Costos</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">Utilidad</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">ROI</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {campaignStats.map((s: any) => (
                <tr key={s.campana} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{s.campana}</div>
                    <div className="text-[10px] text-slate-400">Galpón: {s.galpon}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">S/ {s.ventas.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-slate-500">S/ {s.costos.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${s.utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      S/ {s.utilidad.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[11px]">
                      {s.roi.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[11px]">
                      {s.margin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {campaignStats.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No hay datos para el periodo seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
        <p>Este documento es un reporte financiero generado automáticamente por el sistema {appConfig.appName}.</p>
        <p className="mt-1">Confidencial - Uso Interno</p>
      </div>
    </div>
  );
}


