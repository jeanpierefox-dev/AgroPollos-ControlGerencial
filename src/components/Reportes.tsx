import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';

export function Reportes({ store }: { store: any }) {
  const { transactions, getCampanas, getCampanaInfo } = store;
  const campanas = getCampanas();

  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (isPrinting) {
      window.print();
      setIsPrinting(false);
    }
  }, [isPrinting]);

  const reportData = campanas.map((campana: string) => {
    const campanaTx = transactions.filter((t: Transaction) => t.campana === campana);
    const info = getCampanaInfo(campana);
    
    let pollosIngresados = 0;
    let costoCrianza = 0;
    let pollosVendidos = 0;
    let ingresoVentas = 0;
    
    // Breakdown by type
    let brasa = 0;
    let presa = 0;
    let tipoHembra = 0;
    let tipoMacho = 0;

    campanaTx.forEach((t: Transaction) => {
      if (t.type === 'INGRESO') {
        pollosIngresados += (t.hembrasIn || 0) + (t.machosIn || 0);
        costoCrianza += t.totalCosto;
      } else if (t.type === 'VENTA' && t.items) {
        pollosVendidos += t.items.reduce((acc, item) => acc + item.cantidad, 0);
        ingresoVentas += t.totalVenta;
        
        t.items.forEach(item => {
          if (item.tipo === 'BRASA') brasa += item.cantidad;
          if (item.tipo === 'PRESA') presa += item.cantidad;
          if (item.tipo === 'TIPO_HEMBRA') tipoHembra += item.cantidad;
          if (item.tipo === 'TIPO_MACHO') tipoMacho += item.cantidad;
        });
      }
    });

    const utilidad = ingresoVentas - costoCrianza;
    const galpon = info?.galpon || 'N/A';

    return {
      campana,
      galpon,
      label: `${campana} (${galpon})`,
      pollosIngresados,
      costoCrianza,
      pollosVendidos,
      ingresoVentas,
      utilidad,
      brasa,
      presa,
      tipoHembra,
      tipoMacho
    };
  });

  const totalUtilidad = reportData.reduce((acc: number, row: any) => acc + row.utilidad, 0);
  const totalIngresos = reportData.reduce((acc: number, row: any) => acc + row.ingresoVentas, 0);
  const totalCostos = reportData.reduce((acc: number, row: any) => acc + row.costoCrianza, 0);

  return (
    <>
      <div className="p-8 bg-[#f5f5f5] min-h-full font-sans print:hidden">
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-3xl font-light text-slate-900 tracking-tight">Reportes Financieros</h2>
            <p className="text-slate-500 mt-1 text-sm uppercase tracking-widest">Análisis por Campaña y Galpón</p>
          </div>
          <button 
            onClick={() => setIsPrinting(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <Printer size={18} />
            Descargar Reporte
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Modelo Financiero Detallado</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Campaña</th>
                  <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Galpón</th>
                  <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Pollos Ingresados</th>
                  <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Costo Crianza</th>
                  <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Pollos Vendidos</th>
                  <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Ingreso Ventas</th>
                  <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Utilidad Neta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.length > 0 ? (
                  reportData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{row.campana}</td>
                      <td className="px-6 py-4 text-slate-600">{row.galpon}</td>
                      <td className="px-6 py-4 text-right">{row.pollosIngresados.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-slate-600">S/ {row.costoCrianza.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-right">{row.pollosVendidos.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-slate-600">S/ {row.ingresoVentas.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                      <td className={`px-6 py-4 text-right font-medium ${row.utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        S/ {row.utilidad.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No hay campañas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 h-[400px]">
            <h3 className="text-sm font-semibold text-slate-800 mb-6 uppercase tracking-wider">Utilidad por Campaña y Galpón</h3>
            {reportData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(value) => `S/${value}`} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    formatter={(value: number) => [`S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, 'Utilidad Neta']}
                  />
                  <Bar dataKey="utilidad" name="Utilidad Neta" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {
                      reportData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.utilidad >= 0 ? '#10b981' : '#ef4444'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Datos insuficientes.
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 h-[400px]">
            <h3 className="text-sm font-semibold text-slate-800 mb-6 uppercase tracking-wider">Ventas por Tipo de Pollo (Cantidades)</h3>
            {reportData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="brasa" name="Brasa (H)" stackId="a" fill="#f59e0b" maxBarSize={50} />
                  <Bar dataKey="presa" name="Presa (M)" stackId="a" fill="#3b82f6" maxBarSize={50} />
                  <Bar dataKey="tipoHembra" name="Tipo (H)" stackId="a" fill="#ec4899" maxBarSize={50} />
                  <Bar dataKey="tipoMacho" name="Tipo (M)" stackId="a" fill="#8b5cf6" maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Datos insuficientes.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINT VIEW */}
      <div className="hidden print:block p-8 bg-white text-black min-h-screen font-sans">
        <div className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AgroPollos</h1>
            <p className="text-slate-600 uppercase tracking-widest text-sm mt-1">Reporte Gerencial Financiero</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p><strong>Fecha de Emisión:</strong> {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ingresos Totales</h3>
            <p className="text-2xl font-light text-slate-900">S/ {totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Costos Totales</h3>
            <p className="text-2xl font-light text-slate-900">S/ {totalCostos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Utilidad Neta Global</h3>
            <p className={`text-2xl font-light ${totalUtilidad >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              S/ {totalUtilidad.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Resumen por Campaña</h3>
        <table className="w-full text-left border-collapse mb-10 text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="border border-slate-200 px-4 py-3 font-semibold">Campaña</th>
              <th className="border border-slate-200 px-4 py-3 font-semibold">Galpón</th>
              <th className="border border-slate-200 px-4 py-3 font-semibold text-right">P. In.</th>
              <th className="border border-slate-200 px-4 py-3 font-semibold text-right">P. Ven.</th>
              <th className="border border-slate-200 px-4 py-3 font-semibold text-right">Costos</th>
              <th className="border border-slate-200 px-4 py-3 font-semibold text-right">Ventas</th>
              <th className="border border-slate-200 px-4 py-3 font-semibold text-right">Utilidad</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row: any, idx: number) => (
              <tr key={idx}>
                <td className="border border-slate-200 px-4 py-3 font-medium text-slate-900">{row.campana}</td>
                <td className="border border-slate-200 px-4 py-3 text-slate-700">{row.galpon}</td>
                <td className="border border-slate-200 px-4 py-3 text-right">{row.pollosIngresados.toLocaleString()}</td>
                <td className="border border-slate-200 px-4 py-3 text-right">{row.pollosVendidos.toLocaleString()}</td>
                <td className="border border-slate-200 px-4 py-3 text-right text-slate-700">S/ {row.costoCrianza.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                <td className="border border-slate-200 px-4 py-3 text-right text-slate-700">S/ {row.ingresoVentas.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                <td className={`border border-slate-200 px-4 py-3 text-right font-medium ${row.utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  S/ {row.utilidad.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Desglose de Ventas por Tipo (Cantidades)</h3>
        <table className="w-full text-left border-collapse mb-8 text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="border border-slate-200 px-4 py-3 font-semibold">Campaña</th>
              <th className="border border-slate-200 px-4 py-3 font-semibold">Galpón</th>
              <th className="border border-slate-200 px-4 py-3 font-semibold text-right">Brasa (H)</th>
              <th className="border border-slate-200 px-4 py-3 font-semibold text-right">Presa (M)</th>
              <th className="border border-slate-200 px-4 py-3 font-semibold text-right">Tipo (H)</th>
              <th className="border border-slate-200 px-4 py-3 font-semibold text-right">Tipo (M)</th>
              <th className="border border-slate-200 px-4 py-3 font-semibold text-right">Total Vendidos</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row: any, idx: number) => (
              <tr key={idx}>
                <td className="border border-slate-200 px-4 py-3 font-medium text-slate-900">{row.campana}</td>
                <td className="border border-slate-200 px-4 py-3 text-slate-700">{row.galpon}</td>
                <td className="border border-slate-200 px-4 py-3 text-right">{row.brasa.toLocaleString()}</td>
                <td className="border border-slate-200 px-4 py-3 text-right">{row.presa.toLocaleString()}</td>
                <td className="border border-slate-200 px-4 py-3 text-right">{row.tipoHembra.toLocaleString()}</td>
                <td className="border border-slate-200 px-4 py-3 text-right">{row.tipoMacho.toLocaleString()}</td>
                <td className="border border-slate-200 px-4 py-3 text-right font-medium text-slate-900">{row.pollosVendidos.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-24 text-center text-xs text-slate-500 uppercase tracking-widest">
          <p>Documento generado automáticamente por el sistema AgroPollos</p>
        </div>
      </div>
    </>
  );
}


