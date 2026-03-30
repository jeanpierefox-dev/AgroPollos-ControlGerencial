import React, { useState } from 'react';
import { Transaction } from '../types';
import { format } from 'date-fns';
import { FileText, Printer, Download, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { Logo } from './Logo';

export function Kardex({ store }: { store: any }) {
  const { transactions } = store;
  const [activeTab, setActiveTab] = useState<'vivos' | 'bebes'>('vivos');

  const getKardexData = (type: 'pollos_vivos' | 'pollos_bebes') => {
    let saldoHembras = 0;
    let saldoMachos = 0;

    const filteredTransactions = transactions.filter((t: Transaction) => {
      return t.productType === type;
    });

    const data = filteredTransactions.map((t: Transaction) => {
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
      } else if (t.type === 'MORTALIDAD') {
        if (t.galponAfectado === 'HEMBRAS') {
          salidaHembras += t.cantidadMuertos || 0;
          saldoHembras -= salidaHembras;
        }
        if (t.galponAfectado === 'MACHOS') {
          salidaMachos += t.cantidadMuertos || 0;
          saldoMachos -= salidaMachos;
        }
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
    });

    return { data: data.reverse(), saldoHembras, saldoMachos, totalMovimientos: filteredTransactions.length };
  };

  const { data: kardexData, saldoHembras, saldoMachos, totalMovimientos } = getKardexData(activeTab === 'vivos' ? 'pollos_vivos' : 'pollos_bebes');

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

      <div className="flex gap-4 mb-6 print:hidden">
        <button
          onClick={() => setActiveTab('vivos')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all ${
            activeTab === 'vivos'
              ? 'bg-slate-800 text-white shadow-lg'
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Pollos Vivos (Granja)
        </button>
        <button
          onClick={() => setActiveTab('bebes')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all ${
            activeTab === 'bebes'
              ? 'bg-slate-800 text-white shadow-lg'
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Pollos Bebés
        </button>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-4">
            <Logo className="w-12 h-12" iconSize={32} />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AGROPOLLOS</h1>
              <p className="text-slate-600">REPORTE DE KARDEX - {activeTab === 'vivos' ? 'POLLOS VIVOS' : 'POLLOS BEBÉS'}</p>
            </div>
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
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
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
              <h3 className="text-2xl font-bold text-white">{totalMovimientos}</h3>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th rowSpan={2} className="px-4 py-4 font-semibold text-slate-900 border-r border-slate-200">Fecha</th>
                <th rowSpan={2} className="px-4 py-4 font-semibold text-slate-900 border-r border-slate-200">
                  {activeTab === 'vivos' ? 'Campaña / Galpón' : 'Incubadora'}
                </th>
                <th rowSpan={2} className="px-4 py-4 font-semibold text-slate-900 border-r border-slate-200">Movimiento</th>
                <th colSpan={2} className="px-4 py-2 font-semibold text-center border-b border-r border-slate-200 bg-emerald-50/30 text-emerald-700 uppercase tracking-wider text-[10px]">Ingresos</th>
                <th colSpan={2} className="px-4 py-2 font-semibold text-center border-b border-r border-slate-200 bg-emerald-50/30 text-emerald-700 uppercase tracking-wider text-[10px]">Salidas</th>
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
                      <div className="font-medium text-slate-900">
                        {activeTab === 'vivos' ? row.campana : `Incubadora ${row.incubadora}`}
                      </div>
                      {activeTab === 'vivos' && (
                        <div className="text-[11px] text-slate-400">Galpón: {row.galpon || 'N/A'}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        {row.type === 'INGRESO' ? (
                          <TrendingUp size={14} className="text-emerald-500" />
                        ) : (
                          <TrendingDown size={14} className={row.type === 'MORTALIDAD' ? 'text-red-500' : 'text-emerald-500'} />
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          row.type === 'INGRESO' ? 'bg-emerald-100 text-emerald-700' : 
                          row.type === 'MORTALIDAD' ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {row.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center border-r border-slate-100 text-emerald-600 font-semibold">{row.ingresoHembras || '-'}</td>
                    <td className="px-3 py-4 text-center border-r border-slate-100 text-emerald-600 font-semibold">{row.ingresoMachos || '-'}</td>
                    <td className="px-3 py-4 text-center border-r border-slate-100 text-emerald-600 font-semibold">{row.salidaHembras || '-'}</td>
                    <td className="px-3 py-4 text-center border-r border-slate-100 text-emerald-600 font-semibold">{row.salidaMachos || '-'}</td>
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

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {kardexData.length > 0 ? (
            kardexData.map((row: any) => (
              <div key={row.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {format(new Date(row.date), 'dd/MM/yyyy')}
                    </div>
                    <div className="font-bold text-slate-800 text-lg">
                      {activeTab === 'vivos' ? row.campana : `Incubadora ${row.incubadora}`}
                    </div>
                    {activeTab === 'vivos' && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded uppercase tracking-wide">
                        Galpón: {row.galpon || 'N/A'}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      row.type === 'INGRESO' ? 'bg-emerald-100 text-emerald-700' : 
                      row.type === 'MORTALIDAD' ? 'bg-red-100 text-red-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {row.type}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 mb-4">
                  <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                    <div className="text-[10px] text-emerald-600 uppercase font-bold mb-1">Ingresos</div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">H: <span className="font-semibold text-slate-700">{row.ingresoHembras || '-'}</span></span>
                      <span className="text-slate-500">M: <span className="font-semibold text-slate-700">{row.ingresoMachos || '-'}</span></span>
                    </div>
                  </div>
                  <div className="bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                    <div className="text-[10px] text-red-600 uppercase font-bold mb-1">Salidas</div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">H: <span className="font-semibold text-slate-700">{row.salidaHembras || '-'}</span></span>
                      <span className="text-slate-500">M: <span className="font-semibold text-slate-700">{row.salidaMachos || '-'}</span></span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 text-center tracking-widest">Saldos Actuales</div>
                  <div className="flex justify-around text-base font-black text-slate-800">
                    <div><span className="text-xs text-slate-400 font-bold mr-1">H:</span>{row.saldoHembras}</div>
                    <div><span className="text-xs text-slate-400 font-bold mr-1">M:</span>{row.saldoMachos}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 italic">
              No hay movimientos registrados en el kardex.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-[11px] text-slate-400 text-center print:hidden">
        * El Kardex muestra el historial completo de ingresos y salidas de inventario.
      </div>
    </div>
  );
}
