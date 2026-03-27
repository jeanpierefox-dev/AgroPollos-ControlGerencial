import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { format } from 'date-fns';
import { Pencil, Trash2, X, Plus, Printer } from 'lucide-react';
import { Logo } from './Logo';

export function Ingresos({ store }: { store: any }) {
  const { transactions, appConfig, addTransaction, updateTransaction, deleteTransaction } = store;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [campana, setCampana] = useState('');
  const [plantel, setPlantel] = useState('');
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
    if (!campana || !plantel || !galpon || !hembras || !machos || !costoUnitario) return;

    const totalCosto = (parseInt(hembras) + parseInt(machos)) * parseFloat(costoUnitario);

    const transactionData: Transaction = {
      id: isEditing || crypto.randomUUID(),
      date,
      type: 'INGRESO',
      campana,
      plantel,
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
    setPlantel('');
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
    setCampana(t.campana || '');
    setPlantel(t.plantel || '');
    setGalpon(t.galpon || '');
    setHembras(t.hembrasIn?.toString() || '');
    setMachos(t.machosIn?.toString() || '');
    setCostoUnitario(t.costoUnitarioIn?.toString() || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteTransaction(itemToDelete);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const ingresos = transactions.filter((t: Transaction) => t.type === 'INGRESO').reverse();

  return (
    <>
      <div className="p-4 md:p-8 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ingreso de Pollos Bebés</h2>
            <p className="text-slate-500 text-sm">Registro y control de nuevos lotes de crianza</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={20} />
            Nuevo Ingreso
          </button>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Fecha</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Campaña</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Plantel</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Galpón</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Hembras</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Machos</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Costo Unit.</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Costo Total</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ingresos.length > 0 ? (
                  ingresos.map((t: Transaction) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                        {format(new Date(t.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100">
                          {t.campana}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-bold border border-purple-100">
                          {t.plantel || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-bold border border-amber-100">
                          {t.galpon || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{t.hembrasIn}</td>
                      <td className="px-6 py-4 font-medium">{t.machosIn}</td>
                      <td className="px-6 py-4 text-slate-500">S/ {t.costoUnitarioIn?.toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">S/ {t.totalCosto.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setPrintData(t)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Imprimir Reporte">
                            <Printer size={18} />
                          </button>
                          <button onClick={() => handleEdit(t)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic">
                      No hay ingresos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {ingresos.length > 0 ? (
            ingresos.map((t: Transaction) => (
              <div key={t.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {format(new Date(t.date), 'dd/MM/yyyy')}
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100 uppercase">
                        {t.campana}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-bold border border-purple-100 uppercase">
                        {t.plantel || '-'}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold border border-amber-100 uppercase">
                        {t.galpon || '-'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">Costo Total</div>
                    <div className="text-lg font-bold text-slate-900">S/ {t.totalCosto.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 mb-4">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Hembras</div>
                    <div className="text-sm font-semibold text-slate-700">{t.hembrasIn}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Machos</div>
                    <div className="text-sm font-semibold text-slate-700">{t.machosIn}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Costo Unit.</div>
                    <div className="text-sm font-semibold text-slate-700">S/ {t.costoUnitarioIn?.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Aves</div>
                    <div className="text-sm font-semibold text-slate-700">{(t.hembrasIn || 0) + (t.machosIn || 0)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setPrintData(t)}
                    className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider"
                  >
                    <Printer size={16} />
                    Reporte
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(t)} className="p-2 text-blue-500 bg-blue-50 rounded-lg">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 text-red-500 bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 italic">
              No hay ingresos registrados.
            </div>
          )}
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
              <div className="grid grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plantel</label>
                  <input
                    type="text"
                    required
                    value={plantel}
                    onChange={(e) => setPlantel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej. P-01"
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

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 text-red-600 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Eliminar Ingreso</h3>
            </div>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar este registro de ingreso? 
              <strong className="block mt-2 text-red-600">Esta acción no se puede deshacer.</strong>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT VIEW */}
      {printData && (
        <div className="hidden print:block p-8 bg-white text-black min-h-screen">
          <div className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
            <div className="flex items-center gap-4">
              {appConfig.logo ? (
                <img src={appConfig.logo} alt="Logo" className="w-12 h-12 object-contain rounded" />
              ) : (
                <Logo className="w-12 h-12" iconSize={32} />
              )}
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{appConfig.appName}</h1>
                <p className="text-slate-500">Reporte de Ingreso de Crianza</p>
              </div>
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
              <p className="mb-1"><strong>Plantel:</strong> {printData.plantel || '-'}</p>
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
