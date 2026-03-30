import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { format } from 'date-fns';
import { Pencil, Trash2, X, Plus, Printer, Egg, Bird } from 'lucide-react';
import { Logo } from './Logo';

export function Ingresos({ store }: { store: any }) {
  const { transactions, appConfig, addTransaction, updateTransaction, deleteTransaction } = store;
  
  const [activeTab, setActiveTab] = useState<'pollos_bebes' | 'pollos_vivos'>('pollos_bebes');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Common
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [costoUnitario, setCostoUnitario] = useState('');
  
  // Pollo Vivo State
  const [campana, setCampana] = useState('');
  const [ingresoType, setIngresoType] = useState<'venta_directa' | 'granja'>('granja');
  const [plantel, setPlantel] = useState('EVP-01');
  const [galponMachos, setGalponMachos] = useState('01');
  const [galponHembras, setGalponHembras] = useState('02');
  const [hembras, setHembras] = useState('');
  const [machos, setMachos] = useState('');
  
  // Pollo BB State
  const [incubadora, setIncubadora] = useState('');
  const [totalHI, setTotalHI] = useState('');
  const [totalNacido, setTotalNacido] = useState('');
  const [enviadoLaboratorio, setEnviadoLaboratorio] = useState('');
  const [informeDia, setInformeDia] = useState('');

  const [printData, setPrintData] = useState<Transaction | null>(null);

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

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
    
    let transactionData: Transaction;
    
    if (activeTab === 'pollos_vivos') {
      if (!campana || !hembras || !machos || !costoUnitario) return;
      if (ingresoType === 'granja' && !plantel) return;

      const totalCosto = (parseInt(hembras) + parseInt(machos)) * parseFloat(costoUnitario);

      transactionData = {
        id: isEditing || crypto.randomUUID(),
        date,
        type: 'INGRESO',
        productType: 'pollos_vivos',
        campana,
        ingresoType,
        plantel: ingresoType === 'granja' ? plantel : undefined,
        galponMachos: ingresoType === 'granja' ? galponMachos : undefined,
        galponHembras: ingresoType === 'granja' ? galponHembras : undefined,
        galpon: ingresoType === 'granja' ? `M:${galponMachos} | H:${galponHembras}` : 'Venta Directa',
        hembrasIn: parseInt(hembras),
        machosIn: parseInt(machos),
        costoUnitarioIn: parseFloat(costoUnitario),
        totalCosto,
        totalVenta: 0,
        ganancia: 0,
      };
    } else {
      if (!incubadora || !totalHI || !totalNacido || !enviadoLaboratorio || !costoUnitario) return;
      
      const saldo = parseInt(totalNacido) - parseInt(enviadoLaboratorio);
      const totalCosto = saldo * parseFloat(costoUnitario);

      transactionData = {
        id: isEditing || crypto.randomUUID(),
        date,
        type: 'INGRESO',
        productType: 'pollos_bebes',
        campana: '', // Not used for BB
        incubadora,
        totalHI: parseInt(totalHI),
        totalNacido: parseInt(totalNacido),
        enviadoLaboratorio: parseInt(enviadoLaboratorio),
        saldo,
        informeDia,
        costoUnitarioIn: parseFloat(costoUnitario),
        totalCosto,
        totalVenta: 0,
        ganancia: 0,
      };
    }

    if (isEditing) {
      updateTransaction(isEditing, transactionData);
    } else {
      addTransaction(transactionData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setCostoUnitario('');
    
    setCampana('');
    setIngresoType('granja');
    setPlantel('EVP-01');
    setGalponMachos('01');
    setGalponHembras('02');
    setHembras('');
    setMachos('');
    
    setIncubadora('');
    setTotalHI('');
    setTotalNacido('');
    setEnviadoLaboratorio('');
    setInformeDia('');
    
    setIsEditing(null);
    setIsModalOpen(false);
  };

  const handleEdit = (t: Transaction) => {
    setIsEditing(t.id);
    setDate(t.date);
    setCostoUnitario(t.costoUnitarioIn?.toString() || '');
    
    if (t.productType === 'pollos_vivos' || (!t.productType && t.campana)) {
      setActiveTab('pollos_vivos');
      setCampana(t.campana || '');
      setIngresoType(t.ingresoType || 'granja');
      setPlantel(t.plantel || 'EVP-01');
      setGalponMachos(t.galponMachos || '01');
      setGalponHembras(t.galponHembras || '02');
      setHembras(t.hembrasIn?.toString() || '');
      setMachos(t.machosIn?.toString() || '');
    } else {
      setActiveTab('pollos_bebes');
      setIncubadora(t.incubadora || '');
      setTotalHI(t.totalHI?.toString() || '');
      setTotalNacido(t.totalNacido?.toString() || '');
      setEnviadoLaboratorio(t.enviadoLaboratorio?.toString() || '');
      setInformeDia(t.informeDia || '');
    }
    
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
  const ingresosVivos = ingresos.filter((t: Transaction) => t.productType === 'pollos_vivos' || (!t.productType && t.campana));
  const ingresosBebes = ingresos.filter((t: Transaction) => t.productType === 'pollos_bebes');

  const currentIngresos = activeTab === 'pollos_vivos' ? ingresosVivos : ingresosBebes;

  return (
    <>
      <div className="p-4 md:p-8 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ingreso de Lotes</h2>
            <p className="text-slate-500 text-sm">Registro y control de nuevos lotes</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={20} />
            Nuevo Ingreso
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl mb-6 w-full max-w-md">
          <button
            onClick={() => setActiveTab('pollos_bebes')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'pollos_bebes' 
                ? 'bg-white text-emerald-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Egg size={18} />
            Pollos Bebés
          </button>
          <button
            onClick={() => setActiveTab('pollos_vivos')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'pollos_vivos' 
                ? 'bg-white text-emerald-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Bird size={18} />
            Pollos Vivos
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200">
                {activeTab === 'pollos_vivos' ? (
                  <tr>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Fecha</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Tipo</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Campaña</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Plantel</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Galpón H.</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Hembras</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Galpón M.</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Machos</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Costo Total</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Acciones</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Fecha</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Incubadora</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Total HI</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Nacidos</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">A Laboratorio</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Saldo</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Costo Unit.</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Costo Total</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Acciones</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentIngresos.length > 0 ? (
                  currentIngresos.map((t: Transaction) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                        {format(new Date(t.date), 'dd/MM/yyyy')}
                      </td>
                      
                      {activeTab === 'pollos_vivos' ? (
                        <>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                              t.ingresoType === 'venta_directa' 
                                ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            }`}>
                              {t.ingresoType === 'venta_directa' ? 'Venta Directa' : 'Granja'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold border border-emerald-100">
                              {t.campana}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold border border-emerald-100">
                              {t.plantel || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-pink-50 text-pink-700 rounded-md text-xs font-bold border border-pink-100">
                              {t.galponHembras || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium">{t.hembrasIn}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100">
                              {t.galponMachos || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium">{t.machosIn}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold border border-emerald-100">
                              {t.incubadora}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium">{t.totalHI}</td>
                          <td className="px-6 py-4 font-medium text-emerald-600">{t.totalNacido}</td>
                          <td className="px-6 py-4 font-medium text-amber-600">{t.enviadoLaboratorio}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{t.saldo}</td>
                          <td className="px-6 py-4 font-medium">S/ {t.costoUnitarioIn?.toFixed(2)}</td>
                        </>
                      )}
                      
                      <td className="px-6 py-4 font-bold text-slate-900">S/ {t.totalCosto.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setPrintData(t)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Imprimir Reporte">
                            <Printer size={18} />
                          </button>
                          <button onClick={() => handleEdit(t)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Editar">
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
                    <td colSpan={activeTab === 'pollos_vivos' ? 10 : 9} className="px-6 py-12 text-center text-slate-400 italic">
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
          {currentIngresos.length > 0 ? (
            currentIngresos.map((t: Transaction) => (
              <div key={t.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {format(new Date(t.date), 'dd/MM/yyyy')}
                    </div>
                    {activeTab === 'pollos_vivos' ? (
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                          t.ingresoType === 'venta_directa'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          {t.ingresoType === 'venta_directa' ? 'Venta Directa' : 'Granja'}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold border border-emerald-100 uppercase">
                          {t.campana}
                        </span>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold border border-emerald-100 uppercase">
                        Incubadora: {t.incubadora}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">Costo Total</div>
                    <div className="text-lg font-bold text-slate-900">S/ {t.totalCosto.toFixed(2)}</div>
                  </div>
                </div>
                
                {activeTab === 'pollos_vivos' ? (
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 mb-4">
                    <div className="bg-pink-50/50 p-2 rounded-lg border border-pink-100/50">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-[10px] text-pink-600 uppercase font-bold">Hembras</div>
                        <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded">G: {t.galponHembras || '-'}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-700">{t.hembrasIn}</div>
                    </div>
                    <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-[10px] text-blue-600 uppercase font-bold">Machos</div>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">G: {t.galponMachos || '-'}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-700">{t.machosIn}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 mb-4">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Nacidos</div>
                      <div className="text-sm font-semibold text-emerald-600">{t.totalNacido}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">A Laboratorio</div>
                      <div className="text-sm font-semibold text-amber-600">{t.enviadoLaboratorio}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Saldo</div>
                      <div className="text-sm font-bold text-slate-900">{t.saldo}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Costo Unit.</div>
                      <div className="text-sm font-semibold text-slate-700">S/ {t.costoUnitarioIn?.toFixed(2)}</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setPrintData(t)}
                    className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider"
                  >
                    <Printer size={16} />
                    Reporte
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(t)} className="p-2 text-emerald-500 bg-emerald-50 rounded-lg">
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
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
                <label className="block text-sm font-bold text-slate-700 mb-2">Fecha de Ingreso</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                />
              </div>

              {activeTab === 'pollos_vivos' ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Ingreso</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="ingresoType"
                          value="granja"
                          checked={ingresoType === 'granja'}
                          onChange={(e) => setIngresoType(e.target.value as 'granja' | 'venta_directa')}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700">A Granja (Crianza)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="ingresoType"
                          value="venta_directa"
                          checked={ingresoType === 'venta_directa'}
                          onChange={(e) => setIngresoType(e.target.value as 'granja' | 'venta_directa')}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700">Para Venta Directa</span>
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Campaña</label>
                      <input
                        type="text"
                        required
                        value={campana}
                        onChange={(e) => setCampana(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        placeholder="Ej. C-01"
                      />
                    </div>
                    {ingresoType === 'granja' && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Plantel</label>
                        <select
                          required
                          value={plantel}
                          onChange={(e) => setPlantel(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base bg-white"
                        >
                          <option value="EVP-01">EVP-01</option>
                          <option value="EVP-02">EVP-02</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                      <h4 className="text-sm font-bold text-pink-800 uppercase mb-4">Hembras (Brasa)</h4>
                      <div className="space-y-4">
                        {ingresoType === 'granja' && (
                          <div>
                            <label className="block text-sm font-medium text-pink-700 mb-1.5">Galpón Asignado</label>
                            <select
                              value={galponHembras}
                              onChange={(e) => setGalponHembras(e.target.value)}
                              className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-base bg-white font-semibold text-pink-900"
                            >
                              <option value="01">Galpón 01</option>
                              <option value="02">Galpón 02</option>
                              <option value="03">Galpón 03</option>
                              <option value="04">Galpón 04</option>
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-pink-700 mb-1.5">Cantidad Ingreso</label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={hembras}
                            onChange={(e) => setHembras(e.target.value)}
                            onKeyDown={handleNumberKeyDown}
                            className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg font-semibold"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <h4 className="text-sm font-bold text-emerald-800 uppercase mb-4">Machos (Presa)</h4>
                      <div className="space-y-4">
                        {ingresoType === 'granja' && (
                          <div>
                            <label className="block text-sm font-medium text-emerald-700 mb-1.5">Galpón Asignado</label>
                            <select
                              value={galponMachos}
                              onChange={(e) => setGalponMachos(e.target.value)}
                              className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base bg-white font-semibold text-emerald-900"
                            >
                              <option value="01">Galpón 01</option>
                              <option value="02">Galpón 02</option>
                              <option value="03">Galpón 03</option>
                              <option value="04">Galpón 04</option>
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-emerald-700 mb-1.5">Cantidad Ingreso</label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={machos}
                            onChange={(e) => setMachos(e.target.value)}
                            onKeyDown={handleNumberKeyDown}
                            className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-semibold"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Número de Incubadora</label>
                    <input
                      type="text"
                      required
                      value={incubadora}
                      onChange={(e) => setIncubadora(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                      placeholder="Ej. INC-01"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Total HI Ingresado</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={totalHI}
                        onChange={(e) => setTotalHI(e.target.value)}
                        onKeyDown={handleNumberKeyDown}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Total Pollo Nacido</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={totalNacido}
                        onChange={(e) => setTotalNacido(e.target.value)}
                        onKeyDown={handleNumberKeyDown}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Enviado a Laboratorio</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={enviadoLaboratorio}
                      onChange={(e) => setEnviadoLaboratorio(e.target.value)}
                      onKeyDown={handleNumberKeyDown}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                      placeholder="0"
                    />
                  </div>
                  {totalNacido && enviadoLaboratorio && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">Saldo Calculado:</span>
                        <span className="text-lg font-black text-emerald-600">
                          {parseInt(totalNacido) - parseInt(enviadoLaboratorio)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Informe del Día</label>
                    <textarea
                      value={informeDia}
                      onChange={(e) => setInformeDia(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base min-h-[80px]"
                      placeholder="Observaciones..."
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Costo Unitario (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={costoUnitario}
                  onChange={(e) => setCostoUnitario(e.target.value)}
                  onKeyDown={handleNumberKeyDown}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base font-semibold"
                  placeholder="0.00"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors mt-4 shadow-sm text-base"
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
        <div className="hidden print:block p-8 bg-white text-black min-h-screen relative">
          <div className="border-2 border-slate-800 rounded-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b-2 border-emerald-800 bg-emerald-600 text-white">
              <div className="flex items-center gap-4">
                {appConfig.logo ? (
                  <img src={appConfig.logo} alt="Logo" className="w-16 h-16 object-contain rounded bg-white p-1" />
                ) : (
                  <Logo className="w-16 h-16 text-white" iconSize={40} />
                )}
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">{appConfig.appName}</h1>
                  <p className="text-sm font-bold text-emerald-100 uppercase tracking-widest">Reporte de Ingreso de {printData.productType === 'pollos_vivos' ? 'Pollos Vivos' : 'Pollos Bebés'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="border-2 border-emerald-800 p-3 rounded-lg bg-white inline-block text-center min-w-[150px] text-slate-900">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Ingreso N°</p>
                  <p className="text-xl font-black text-slate-900">ING-{printData.id.split('-')[0].toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-0 border-b-2 border-slate-800">
              <div className="p-6 border-r-2 border-slate-800">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalles del Lote</h3>
                <div className="space-y-2">
                  {printData.productType === 'pollos_vivos' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Campaña:</span>
                        <span className="text-sm font-black text-slate-900">{printData.campana}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Plantel:</span>
                        <span className="text-sm font-black text-slate-900">{printData.plantel || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Galpón Machos:</span>
                        <span className="text-sm font-black text-slate-900">{printData.galponMachos || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Galpón Hembras:</span>
                        <span className="text-sm font-black text-slate-900">{printData.galponHembras || '-'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Incubadora:</span>
                        <span className="text-sm font-black text-slate-900">{printData.incubadora}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Total HI:</span>
                        <span className="text-sm font-black text-slate-900">{printData.totalHI}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Nacidos:</span>
                        <span className="text-sm font-black text-slate-900">{printData.totalNacido}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">A Laboratorio:</span>
                        <span className="text-sm font-black text-slate-900">{printData.enviadoLaboratorio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Saldo:</span>
                        <span className="text-sm font-black text-slate-900">{printData.saldo}</span>
                      </div>
                      {printData.informeDia && (
                        <div className="mt-4">
                          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Informe del Día:</span>
                          <p className="text-sm text-slate-700">{printData.informeDia}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalles Financieros</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Fecha de Ingreso:</span>
                    <span className="text-sm font-black text-slate-900">{format(new Date(printData.date), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Costo Unitario:</span>
                    <span className="text-sm font-black text-slate-900">S/ {printData.costoUnitarioIn?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Costo Total:</span>
                    <span className="text-sm font-black text-slate-900">S/ {printData.totalCosto.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {printData.productType === 'pollos_vivos' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-800">
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Tipo de Ave</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Galpón</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Cantidad de Ingreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-bold uppercase text-xs">Hembras (Brasa)</td>
                    <td className="px-6 py-4 font-bold uppercase text-xs text-emerald-700">{printData.galponHembras || '-'}</td>
                    <td className="px-6 py-4 text-right font-black text-sm">{printData.hembrasIn}</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-bold uppercase text-xs">Machos (Presa)</td>
                    <td className="px-6 py-4 font-bold uppercase text-xs text-emerald-700">{printData.galponMachos || '-'}</td>
                    <td className="px-6 py-4 text-right font-black text-sm">{printData.machosIn}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-800">
                    <td colSpan={2} className="px-6 py-4 text-right font-black uppercase text-xs tracking-widest">TOTAL AVES INGRESADAS:</td>
                    <td className="px-6 py-4 text-right font-black text-2xl">
                      {(printData.hembrasIn || 0) + (printData.machosIn || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}

            <div className="mt-24 mb-12 flex justify-between px-16">
              <div className="text-center">
                <div className="border-t border-slate-400 pt-2 font-bold uppercase text-[10px] tracking-widest text-slate-500">Firma Responsable</div>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-400 pt-2 font-bold uppercase text-[10px] tracking-widest text-slate-500">V° B° Gerencia</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
