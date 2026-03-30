import React, { useState } from 'react';
import { Transaction } from '../types';
import { format } from 'date-fns';
import { Skull, Plus, Trash2, X } from 'lucide-react';

export function Mortalidad({ store }: { store: any }) {
  const { transactions, addTransaction, deleteTransaction, getCampanas, getCampanaInfo } = store;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [productType, setProductType] = useState<'pollos_bebes' | 'pollos_vivos'>('pollos_vivos');
  const [campana, setCampana] = useState('');
  const [incubadora, setIncubadora] = useState('');
  const [galponAfectado, setGalponAfectado] = useState<'HEMBRAS' | 'MACHOS'>('HEMBRAS');
  const [cantidadMuertos, setCantidadMuertos] = useState('');
  const [causa, setCausa] = useState('');
  const [error, setError] = useState('');

  const campanas = getCampanas();
  const campanaInfo = campana ? getCampanaInfo(campana) : null;

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    if (productType === 'pollos_vivos' && !campana) {
      setError('Por favor seleccione una campaña.');
      return;
    }
    if (productType === 'pollos_bebes' && !incubadora) {
      setError('Por favor ingrese el número de incubadora.');
      return;
    }
    if (!cantidadMuertos || Number(cantidadMuertos) <= 0) {
      setError('Por favor ingrese una cantidad válida.');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date,
      type: 'MORTALIDAD',
      productType,
      ...(productType === 'pollos_vivos' && { campana }),
      ...(productType === 'pollos_bebes' && { incubadora }),
      galponAfectado,
      cantidadMuertos: Number(cantidadMuertos),
      causa: causa || 'No especificada',
      totalCosto: 0,
      totalVenta: 0,
      ganancia: 0
    };

    addTransaction(newTransaction);
    
    // Reset form
    setCantidadMuertos('');
    setCausa('');
    setIncubadora('');
    setError('');
    setIsModalOpen(false);
  };

  const mortalidadRecords = transactions.filter((t: Transaction) => t.type === 'MORTALIDAD').reverse();
  const bebesRecords = mortalidadRecords.filter((t: Transaction) => t.productType === 'pollos_bebes');
  const vivosRecords = mortalidadRecords.filter((t: Transaction) => t.productType !== 'pollos_bebes');

  const [activeTab, setActiveTab] = useState<'vivos' | 'bebes'>('vivos');

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Control de Mortalidad</h2>
          <p className="text-slate-500 font-medium mt-1">Historial de bajas y muertes por galpón</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2 uppercase tracking-widest text-sm"
        >
          <Plus size={20} />
          Registrar Baja
        </button>
      </div>

      <div className="flex gap-4 mb-6">
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                  <Skull size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  Registrar Baja
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <span className="font-bold">Error:</span> {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Ave</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="productType"
                        value="pollos_vivos"
                        checked={productType === 'pollos_vivos'}
                        onChange={(e) => setProductType(e.target.value as 'pollos_vivos' | 'pollos_bebes')}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Pollos Vivos (Granja)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="productType"
                        value="pollos_bebes"
                        checked={productType === 'pollos_bebes'}
                        onChange={(e) => setProductType(e.target.value as 'pollos_vivos' | 'pollos_bebes')}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Pollos Bebés</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50/50 text-base"
                  />
                </div>

                {productType === 'pollos_vivos' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Campaña</label>
                    <select
                      value={campana}
                      onChange={(e) => setCampana(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50/50 font-bold text-slate-700 text-base"
                    >
                      <option value="">Seleccione Campaña</option>
                      {campanas.map((c: string) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">N° Incubadora</label>
                    <input
                      type="text"
                      value={incubadora}
                      onChange={(e) => setIncubadora(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50/50 font-bold text-slate-700 text-base"
                      placeholder="Ingrese número de incubadora"
                    />
                  </div>
                )}

                {(productType === 'pollos_bebes' || campanaInfo) && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {productType === 'pollos_vivos' ? 'Galpón Afectado' : 'Sexo Afectado'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGalponAfectado('HEMBRAS')}
                        className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                          galponAfectado === 'HEMBRAS' 
                            ? 'border-red-500 bg-red-50 text-red-700' 
                            : 'border-slate-200 bg-white text-slate-500 hover:border-red-200'
                        }`}
                      >
                        HEMBRAS
                        {productType === 'pollos_vivos' && campanaInfo && (
                          <span className="block text-[10px] font-normal text-slate-400 mt-1">Galpón: {campanaInfo.galponHembras}</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalponAfectado('MACHOS')}
                        className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                          galponAfectado === 'MACHOS' 
                            ? 'border-red-500 bg-red-50 text-red-700' 
                            : 'border-slate-200 bg-white text-slate-500 hover:border-red-200'
                        }`}
                      >
                        MACHOS
                        {productType === 'pollos_vivos' && campanaInfo && (
                          <span className="block text-[10px] font-normal text-slate-400 mt-1">Galpón: {campanaInfo.galponMachos}</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cantidad de Muertos</label>
                  <input
                    type="number"
                    min="1"
                    value={cantidadMuertos}
                    onChange={(e) => setCantidadMuertos(e.target.value)}
                    onKeyDown={handleNumberKeyDown}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50/50 text-base font-bold"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Causa (Opcional)</label>
                  <input
                    type="text"
                    value={causa}
                    onChange={(e) => setCausa(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50/50 text-base"
                    placeholder="Ej: Ahogo, Enfermedad..."
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors uppercase tracking-widest text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 uppercase tracking-widest text-sm flex justify-center items-center gap-2"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">
            Registros de Mortalidad - {activeTab === 'vivos' ? 'Pollos Vivos' : 'Pollos Bebés'}
          </h3>
          <span className="text-[10px] font-black bg-red-100 text-red-700 px-3 py-1 rounded-full uppercase tracking-widest">
            {activeTab === 'vivos' ? vivosRecords.length : bebesRecords.length} Registros
          </span>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest">Fecha</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest">
                  {activeTab === 'vivos' ? 'Campaña' : 'Incubadora'}
                </th>
                <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest">
                  {activeTab === 'vivos' ? 'Galpón' : 'Sexo'}
                </th>
                <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-right">Cantidad</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest">Causa</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeTab === 'vivos' ? vivosRecords : bebesRecords).length > 0 ? (
                (activeTab === 'vivos' ? vivosRecords : bebesRecords).map((t: Transaction) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-700">
                      {format(new Date(t.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-wide">
                        {activeTab === 'vivos' ? t.campana : t.incubadora}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${
                        t.galponAfectado === 'HEMBRAS' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {t.galponAfectado}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-red-600 text-lg">
                      {t.cantidadMuertos}
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-medium">
                      {t.causa}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Eliminar Registro"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-slate-400 font-medium">
                    No hay registros de mortalidad.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {(activeTab === 'vivos' ? vivosRecords : bebesRecords).length > 0 ? (
            (activeTab === 'vivos' ? vivosRecords : bebesRecords).map((t: Transaction) => (
              <div key={t.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {format(new Date(t.date), 'dd/MM/yyyy')}
                    </div>
                    <div className="font-bold text-slate-800 text-lg">
                      {activeTab === 'vivos' ? t.campana : `Incubadora ${t.incubadora}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Cantidad</div>
                    <div className="text-xl font-black text-red-600">{t.cantidadMuertos}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 mb-4">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{activeTab === 'vivos' ? 'Galpón' : 'Sexo'}</div>
                    <span className={`inline-block mt-1 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                      t.galponAfectado === 'HEMBRAS' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {t.galponAfectado}
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Causa</div>
                    <div className="text-sm font-semibold text-slate-700 mt-1">{t.causa || '-'}</div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Eliminar Registro"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 italic">
              No hay registros de mortalidad.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
