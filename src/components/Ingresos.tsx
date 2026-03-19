import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { format } from 'date-fns';
import { Pencil, Trash2, X, Plus, Printer } from 'lucide-react';

export function Ingresos({ store }: { store: any }) {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = store;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [campana, setCampana] = useState('');
  const [galpon, setGalpon] = useState('');
  const [hembras, setHembras] = useState('');
  const [machos, setMachos] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('');
  
  const [printData, setPrintData] = useState<Transaction | null>(null);

  useEffect(() => {
    if (printData) {
      window.print();
    }
  }, [printData]);

  useEffect(() => {
    const handleAfterPrint = () => setPrintData(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campana || !galpon || !hembras || !machos || !costoUnitario) return;

    const totalCosto = (parseInt(hembras) + parseInt(machos)) * parseFloat(costoUnitario);

    const transactionData: Transaction = {
      id: isEditing || crypto.randomUUID(),
      date,
      type: 'INGRESO',
      campana,
      galpon,
      hembrasIn: parseInt(hembras),
      machosIn: parseInt(machos),
      costoUnitarioIn: parseFloat(costoUnitario),
      totalCosto,
      totalVenta: 0,
      ganancia: 0,
    };

    if (isEditing) {
      updateTransaction(isEditing, transactionData);
    } else {
      addTransaction(transactionData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setCampana('');
    setGalpon('');
    setHembras('');
    setMachos('');
    setCostoUnitario('');
    setIsEditing(null);
    setIsModalOpen(false);
  };

  const handleEdit = (t: Transaction) => {
    setIsEditing(t.id);
    setDate(t.date);
    setCampana(t.campana);
    setGalpon(t.galpon || '');
    setHembras(t.hembrasIn?.toString() || '');
    setMachos(t.machosIn?.toString() || '');
    setCostoUnitario(t.costoUnitarioIn?.toString() || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este registro?')) {
      deleteTransaction(id);
    }
  };

  const ingresos = transactions.filter((t: Transaction) => t.type === 'INGRESO').reverse();

  return (
    <>
      <div className="p-8 print:hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">Ingreso de Pollos Bebés</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo Ingreso
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-medium">Fecha</th>
                  <th className="px-6 py-3 font-medium">Campaña</th>
                  <th className="px-6 py-3 font-medium">Galpón</th>
                  <th className="px-6 py-3 font-medium">Hembras</th>
                  <th className="px-6 py-3 font-medium">Machos</th>
                  <th className="px-6 py-3 font-medium">Costo Unit.</th>
                  <th className="px-6 py-3 font-medium">Costo Total</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ingresos.length > 0 ? (
                  ingresos.map((t: Transaction) => {
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 whitespace-nowrap">{format(new Date(t.date), 'dd/MM/yyyy')}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">{t.campana}</td>
                        <td className="px-6 py-4">{t.galpon || '-'}</td>
                        <td className="px-6 py-4">{t.hembrasIn}</td>
                        <td className="px-6 py-4">{t.machosIn}</td>
                        <td className="px-6 py-4">S/ {t.costoUnitarioIn?.toFixed(2)}</td>
                        <td className="px-6 py-4 font-medium">S/ {t.totalCosto.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setPrintData(t)} className="text-slate-500 hover:text-slate-700 p-1" title="Imprimir Reporte">
                            <Printer size={16} />
                          </button>
                          <button onClick={() => handleEdit(t)} className="text-blue-500 hover:text-blue-700 p-1 ml-2" title="Editar">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 p-1 ml-2" title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                      No hay ingresos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL FORMULARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 print:hidden p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">
                {isEditing ? 'Editar Lote' : 'Registrar Nuevo Lote'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Ingreso</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Campaña</label>
                  <input
                    type="text"
                    required
                    value={campana}
                    onChange={(e) => setCampana(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej. C-01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Galpón</label>
                  <input
                    type="text"
                    required
                    value={galpon}
                    onChange={(e) => setGalpon(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej. G-01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cant. Hembras</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={hembras}
                    onChange={(e) => setHembras(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cant. Machos</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={machos}
                    onChange={(e) => setMachos(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Costo Unitario (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={costoUnitario}
                  onChange={(e) => setCostoUnitario(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-700 transition-colors mt-2"
              >
                {isEditing ? 'Guardar Cambios' : 'Registrar Ingreso'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRINT VIEW */}
      {printData && (
        <div className="hidden print:block p-8 bg-white text-black min-h-screen">
          <div className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AgroPollos</h1>
              <p className="text-slate-500">Reporte de Ingreso de Crianza</p>
            </div>
            <div className="text-right text-sm">
              <p><strong>Fecha de Emisión:</strong> {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
              <p><strong>ID Transacción:</strong> {printData.id.split('-')[0].toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Detalles de Campaña</h3>
              <p className="mb-1"><strong>Campaña:</strong> {printData.campana}</p>
              <p className="mb-1"><strong>Galpón:</strong> {printData.galpon}</p>
              <p><strong>Fecha de Ingreso:</strong> {format(new Date(printData.date), 'dd/MM/yyyy')}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Detalles Financieros</h3>
              <p className="mb-1"><strong>Costo Unitario:</strong> S/ {printData.costoUnitarioIn?.toFixed(2)}</p>
              <p className="mb-1"><strong>Costo Total:</strong> S/ {printData.totalCosto.toFixed(2)}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Desglose de Aves</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-4 py-2">Tipo</th>
                <th className="border border-slate-300 px-4 py-2 text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 px-4 py-2">Hembras</td>
                <td className="border border-slate-300 px-4 py-2 text-right">{printData.hembrasIn}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-2">Machos</td>
                <td className="border border-slate-300 px-4 py-2 text-right">{printData.machosIn}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold">
                <td className="border border-slate-300 px-4 py-2 text-right">TOTAL AVES:</td>
                <td className="border border-slate-300 px-4 py-2 text-right">
                  {(printData.hembrasIn || 0) + (printData.machosIn || 0)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-24 flex justify-between px-16">
            <div className="text-center">
              <div className="border-t border-slate-400 w-48 mx-auto pt-2">Firma Responsable</div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-400 w-48 mx-auto pt-2">V° B° Gerencia</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
