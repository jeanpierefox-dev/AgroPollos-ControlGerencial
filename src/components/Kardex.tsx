import React from 'react';
import { Transaction } from '../types';
import { format } from 'date-fns';
import { FileText, Printer, Download, TrendingUp, TrendingDown, Package } from 'lucide-react';

export function Kardex({ store }: { store: any }) {
  const { transactions } = store;

  let saldoHembras = 0;
  let saldoMachos = 0;

  const kardexData = transactions.map((t: Transaction) => {
    let ingresoHembras = 0;
    let ingresoMachos = 0;
    let salidaHembras = 0;
    let salidaMachos = 0;

    if (t.type === 'INGRESO') {
      ingresoHembras = t.hembrasIn || 0;
      ingresoMachos = t.machosIn || 0;
      saldoHembras += ingresoHembras;
      saldoMachos += ingresoMachos;
    } else if (t.type === 'VENTA' && t.items) {
      t.items.forEach(item => {
        if (item.tipo === 'BRASA' || item.tipo === 'TIPO_HEMBRA') salidaHembras += item.cantidad;
        if (item.tipo === 'PRESA' || item.tipo === 'TIPO_MACHO') salidaMachos += item.cantidad;
      });
      saldoHembras -= salidaHembras;
      saldoMachos -= salidaMachos;
    }

    return {
      ...t,
      ingresoHembras,
      ingresoMachos,
      salidaHembras,
      salidaMachos,
      saldoHembras,
      saldoMachos,
    };
  }).reverse(); // Show newest first

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-emerald-500" />
            Kardex de Inventario
          </h2>
          <p className="text-slate-500 text-sm mt-1">Control de existencias y movimientos de pollos</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
          >
            <Printer size={18} />
            Imprimir Kardex
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AGROPOLLOS</h1>
            <p className="text-slate-600">REPORTE DE KARDEX GENERAL</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Fecha de Reporte: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Stock Total Hembras</p>
              <h3 className="text-2xl font-bold text-slate-900">{saldoHembras}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Stock Total Machos</p>
              <h3 className="text-2xl font-bold text-slate-900">{saldoMachos}</h3>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 text-white rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Movimientos</p>
              <h3 className="text-2xl font-bold text-white">{transactions.length}</h3>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th rowSpan={2} className="px-4 py-4 font-semibold text-slate-900 border-r border-slate-200">Fecha</th>
                <th rowSpan={2} className="px-4 py-4 font-semibold text-slate-900 border-r border-slate-200">Campaña / Galpón</th>
                <th rowSpan={2} className="px-4 py-4 font-semibold text-slate-900 border-r border-slate-200">Movimiento</th>
                <th colSpan={2} className="px-4 py-2 font-semibold text-center border-b border-r border-slate-200 bg-emerald-50/30 text-emerald-700 uppercase tracking-wider text-[10px]">Ingresos</th>
                <th colSpan={2} className="px-4 py-2 font-semibold text-center border-b border-r border-slate-200 bg-blue-50/30 text-blue-700 uppercase tracking-wider text-[10px]">Salidas</th>
                <th colSpan={2} className="px-4 py-2 font-semibold text-center border-b border-slate-200 bg-slate-100/30 text-slate-700 uppercase tracking-wider text-[10px]">Saldos</th>
              </tr>
              <tr className="bg-slate-50/50">
                <th className="px-3 py-2 font-medium text-center border-r border-slate-200 text-xs">Hem.</th>
                <th className="px-3 py-2 font-medium text-center border-r border-slate-200 text-xs">Mac.</th>
                <th className="px-3 py-2 font-medium text-center border-r border-slate-200 text-xs">Hem.</th>
                <th className="px-3 py-2 font-medium text-center border-r border-slate-200 text-xs">Mac.</th>
                <th className="px-3 py-2 font-medium text-center border-r border-slate-200 text-xs">Hem.</th>
                <th className="px-3 py-2 font-medium text-center text-xs">Mac.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kardexData.length > 0 ? (
                kardexData.map((row: any) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap border-r border-slate-100 font-mono text-[13px]">{format(new Date(row.date), 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-4 border-r border-slate-100">
                      <div className="font-medium text-slate-900">{row.campana}</div>
                      <div className="text-[11px] text-slate-400">Galpón: {row.galpon || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        {row.type === 'INGRESO' ? (
                          <TrendingUp size={14} className="text-emerald-500" />
                        ) : (
                          <TrendingDown size={14} className="text-blue-500" />
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          row.type === 'INGRESO' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {row.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center border-r border-slate-100 text-emerald-600 font-semibold">{row.ingresoHembras || '-'}</td>
                    <td className="px-3 py-4 text-center border-r border-slate-100 text-emerald-600 font-semibold">{row.ingresoMachos || '-'}</td>
                    <td className="px-3 py-4 text-center border-r border-slate-100 text-blue-600 font-semibold">{row.salidaHembras || '-'}</td>
                    <td className="px-3 py-4 text-center border-r border-slate-100 text-blue-600 font-semibold">{row.salidaMachos || '-'}</td>
                    <td className="px-3 py-4 text-center border-r border-slate-100 font-bold text-slate-900 bg-slate-50/30">{row.saldoHembras}</td>
                    <td className="px-3 py-4 text-center font-bold text-slate-900 bg-slate-50/30">{row.saldoMachos}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FileText size={48} strokeWidth={1} />
                      <p>No hay movimientos registrados en el kardex.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-[11px] text-slate-400 text-center print:hidden">
        * El Kardex muestra el historial completo de ingresos y salidas de inventario.
      </div>
    </div>
  );
}
