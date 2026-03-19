import React from 'react';
import { Transaction } from '../types';
import { format } from 'date-fns';

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

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Kardex General de Inventario</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th rowSpan={2} className="px-6 py-3 font-medium align-middle border-r border-slate-100">Fecha</th>
                <th rowSpan={2} className="px-6 py-3 font-medium align-middle border-r border-slate-100">Campaña</th>
                <th rowSpan={2} className="px-6 py-3 font-medium align-middle border-r border-slate-100">Movimiento</th>
                <th colSpan={2} className="px-6 py-2 font-medium text-center border-b border-r border-slate-100 bg-emerald-50/50">Ingresos</th>
                <th colSpan={2} className="px-6 py-2 font-medium text-center border-b border-r border-slate-100 bg-blue-50/50">Salidas</th>
                <th colSpan={2} className="px-6 py-2 font-medium text-center border-b border-slate-100 bg-slate-100/50">Saldos</th>
              </tr>
              <tr>
                <th className="px-4 py-2 font-medium text-center border-r border-slate-100 bg-emerald-50/50">Hembras</th>
                <th className="px-4 py-2 font-medium text-center border-r border-slate-100 bg-emerald-50/50">Machos</th>
                <th className="px-4 py-2 font-medium text-center border-r border-slate-100 bg-blue-50/50">Hembras</th>
                <th className="px-4 py-2 font-medium text-center border-r border-slate-100 bg-blue-50/50">Machos</th>
                <th className="px-4 py-2 font-medium text-center border-r border-slate-100 bg-slate-100/50">Hembras</th>
                <th className="px-4 py-2 font-medium text-center bg-slate-100/50">Machos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kardexData.length > 0 ? (
                kardexData.map((row: any) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap border-r border-slate-100">{format(new Date(row.date), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4 border-r border-slate-100 font-medium text-slate-700">{row.campana}</td>
                    <td className="px-6 py-4 border-r border-slate-100">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        row.type === 'INGRESO' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center border-r border-slate-100 text-emerald-600 font-medium">{row.ingresoHembras || '-'}</td>
                    <td className="px-4 py-4 text-center border-r border-slate-100 text-emerald-600 font-medium">{row.ingresoMachos || '-'}</td>
                    <td className="px-4 py-4 text-center border-r border-slate-100 text-blue-600 font-medium">{row.salidaHembras || '-'}</td>
                    <td className="px-4 py-4 text-center border-r border-slate-100 text-blue-600 font-medium">{row.salidaMachos || '-'}</td>
                    <td className="px-4 py-4 text-center border-r border-slate-100 font-bold text-slate-800">{row.saldoHembras}</td>
                    <td className="px-4 py-4 text-center font-bold text-slate-800">{row.saldoMachos}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                    No hay movimientos registrados en el kardex.
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
