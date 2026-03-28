import React, { useState, useEffect } from 'react';
import { Transaction, SaleItem, TipoPollo } from '../types';
import { format } from 'date-fns';
import { Plus, Trash2, ReceiptText, Printer, Pencil, Download } from 'lucide-react';
import { Logo } from './Logo';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export function Ventas({ store }: { store: any }) {
  const { transactions, appConfig, addTransaction, updateTransaction, deleteTransaction, getCampanas, getStockByCampana, getCampanaInfo } = store;
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [cliente, setCliente] = useState('');
  const [campana, setCampana] = useState('');
  
  const [items, setItems] = useState<SaleItem[]>([]);
  
  const [tipo, setTipo] = useState<TipoPollo>('BRASA');
  const [cantidad, setCantidad] = useState('');
  const [pesoTotal, setPesoTotal] = useState('');
  const [precioKilo, setPrecioKilo] = useState('');
  const [itemJabas, setItemJabas] = useState('');
  const [itemPollosPorJaba, setItemPollosPorJaba] = useState('');
  const [costoUnitarioVenta, setCostoUnitarioVenta] = useState('');
  
  const [error, setError] = useState('');
  
  const [printData, setPrintData] = useState<Transaction | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (printData && !isDownloading) {
      window.print();
    }
  }, [printData, isDownloading]);

  useEffect(() => {
    const handleAfterPrint = () => setPrintData(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handleDownloadPDF = (t: Transaction) => {
    setPrintData(t);
    setIsDownloading(true);
    
    setTimeout(() => {
      const element = document.getElementById('print-container');
      if (element) {
        const opt = {
          margin:       0.5,
          filename:     `Documentos-Venta-${t.id.split('-')[0].toUpperCase()}.pdf`,
          image:        { type: 'jpeg' as const, quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const }
        };
        
        html2pdf().set(opt).from(element).save().then(() => {
          setPrintData(null);
          setIsDownloading(false);
        });
      } else {
        setPrintData(null);
        setIsDownloading(false);
      }
    }, 500);
  };

  const campanas = getCampanas();
  const stock = campana ? getStockByCampana(campana, isEditing || undefined) : null;
  const printCampanaInfo = printData ? getCampanaInfo(printData.campana || '') : null;

  useEffect(() => {
    if (campana && !isEditing) {
      const currentStock = getStockByCampana(campana);
      if (currentStock) {
        setCostoUnitarioVenta(currentStock.costoUnitario.toFixed(2));
      }
    }
  }, [campana, isEditing, getStockByCampana]);

  const handleAddItem = () => {
    if (!campana) {
      setError('Seleccione una campaña primero.');
      return;
    }
    if (!cantidad || !pesoTotal || !precioKilo) {
      setError('Complete todos los campos del ítem.');
      return;
    }

    const qty = parseInt(cantidad);
    
    // Check stock
    const isHembra = tipo === 'BRASA' || tipo === 'TIPO_HEMBRA';
    const isMacho = tipo === 'PRESA' || tipo === 'TIPO_MACHO';
    
    let currentHembrasInCart = items.filter(i => i.tipo === 'BRASA' || i.tipo === 'TIPO_HEMBRA').reduce((acc, i) => acc + i.cantidad, 0);
    let currentMachosInCart = items.filter(i => i.tipo === 'PRESA' || i.tipo === 'TIPO_MACHO').reduce((acc, i) => acc + i.cantidad, 0);

    if (isHembra && (currentHembrasInCart + qty > stock!.hembras)) {
      setError(`Stock insuficiente de hembras en esta campaña. Disponible: ${stock!.hembras - currentHembrasInCart}`);
      return;
    }
    if (isMacho && (currentMachosInCart + qty > stock!.machos)) {
      setError(`Stock insuficiente de machos en esta campaña. Disponible: ${stock!.machos - currentMachosInCart}`);
      return;
    }

    const subtotal = parseFloat(pesoTotal) * parseFloat(precioKilo);
    
    setItems([...items, {
      id: crypto.randomUUID(),
      tipo,
      cantidad: qty,
      pesoTotal: parseFloat(pesoTotal),
      precioKilo: parseFloat(precioKilo),
      subtotal,
      jabas: parseInt(itemJabas) || 0,
      pollosPorJaba: parseInt(itemPollosPorJaba) || 0
    }]);

    setCantidad('');
    setPesoTotal('');
    setPrecioKilo('');
    setItemJabas('');
    setItemPollosPorJaba('');
    setError('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSaveVenta = () => {
    if (items.length === 0) {
      setError('Agregue al menos un ítem a la boleta.');
      return;
    }
    if (!campana) {
      setError('Seleccione una campaña.');
      return;
    }

    const totalVenta = items.reduce((acc, item) => acc + item.subtotal, 0);
    const totalPollos = items.reduce((acc, item) => acc + item.cantidad, 0);
    const costoUnitario = parseFloat(costoUnitarioVenta) || (stock ? stock.costoUnitario : 0);
    const totalCosto = totalPollos * costoUnitario;
    const ganancia = totalVenta - totalCosto;

    const transactionData: Transaction = {
      id: isEditing || crypto.randomUUID(),
      date,
      type: 'VENTA',
      campana,
      cliente,
      items,
      totalCosto,
      totalVenta,
      ganancia,
      jabas: items.reduce((acc, item) => acc + (item.jabas || 0), 0),
      pollosPorJaba: items.length > 0 ? items[0].pollosPorJaba : 0, // Keep for backward compatibility or general info
    };

    if (isEditing) {
      updateTransaction(isEditing, transactionData);
      setIsEditing(null);
    } else {
      addTransaction(transactionData);
    }
    
    // Reset
    setItems([]);
    setCliente('');
    setCostoUnitarioVenta('');
    setError('');
  };

  const handleEditVenta = (t: Transaction) => {
    setIsEditing(t.id);
    setDate(t.date);
    setCampana(t.campana || '');
    setCliente(t.cliente || '');
    setItems(t.items || []);
    const totalPollos = t.items?.reduce((acc, i) => acc + i.cantidad, 0) || 1;
    setCostoUnitarioVenta((t.totalCosto / totalPollos).toFixed(2));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteVenta = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteTransaction(itemToDelete);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      if (isEditing === itemToDelete) {
        setIsEditing(null);
        setItems([]);
        setCliente('');
      }
    }
  };

  const ventas = transactions.filter((t: Transaction) => t.type === 'VENTA').reverse();
  const totalBoleta = items.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <>
      <div className="p-4 md:p-8 print:hidden">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Boleta de Venta</h2>
          <p className="text-slate-500 text-sm">Gestión de ventas y emisión de comprobantes</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* BOLETA FORM */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ReceiptText size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                  {isEditing ? 'Editar Venta' : 'Nueva Venta'}
                </h3>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-center gap-2">
                  <span className="font-bold">Error:</span> {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Campaña</label>
                  <select
                    value={campana}
                    onChange={(e) => { setCampana(e.target.value); setItems([]); }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-bold text-emerald-700 text-base"
                  >
                    <option value="">Seleccione Campaña</option>
                    {campanas.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cliente (Opcional)</label>
                  <input
                    type="text"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-base"
                    placeholder="Nombre del cliente o Razón Social"
                  />
                </div>
                {campana && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Precio Costo (S/)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={costoUnitarioVenta}
                      onChange={(e) => setCostoUnitarioVenta(e.target.value)}
                      onKeyDown={handleNumberKeyDown}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-bold text-emerald-600 text-base"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>

              {campana && stock && (
                <div className="bg-slate-900 text-white p-4 rounded-2xl mb-6 grid grid-cols-3 gap-4 shadow-inner">
                  <div className="text-center border-r border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Stock Hembras</div>
                    <div className="text-lg font-bold text-emerald-400">{stock.hembras}</div>
                  </div>
                  <div className="text-center border-r border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Stock Machos</div>
                    <div className="text-lg font-bold text-emerald-400">{stock.machos}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Costo Promedio</div>
                    <div className="text-lg font-bold text-emerald-400">S/ {stock.costoUnitario.toFixed(2)}</div>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 mb-6">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">Agregar Ítem a Boleta</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo</label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as TipoPollo)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-base font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="BRASA">Brasa (H)</option>
                      <option value="PRESA">Presa (M)</option>
                      <option value="TIPO_HEMBRA">Tipo (H)</option>
                      <option value="TIPO_MACHO">Tipo (M)</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cant.</label>
                    <input
                      type="number"
                      min="1"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      onKeyDown={handleNumberKeyDown}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-base font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Peso (Kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pesoTotal}
                      onChange={(e) => setPesoTotal(e.target.value)}
                      onKeyDown={handleNumberKeyDown}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-base font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">P. x Kg</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={precioKilo}
                      onChange={(e) => setPrecioKilo(e.target.value)}
                      onKeyDown={handleNumberKeyDown}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-base font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">N° Jabas</label>
                    <input
                      type="number"
                      min="0"
                      value={itemJabas}
                      onChange={(e) => setItemJabas(e.target.value)}
                      onKeyDown={handleNumberKeyDown}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-base font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pollos x Jaba</label>
                    <input
                      type="number"
                      min="0"
                      value={itemPollosPorJaba}
                      onChange={(e) => setItemPollosPorJaba(e.target.value)}
                      onKeyDown={handleNumberKeyDown}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-base font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-4 mt-2">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full bg-slate-800 text-white py-3.5 rounded-xl hover:bg-slate-700 flex justify-center items-center gap-2 transition-colors shadow-sm"
                    >
                      <Plus size={20} />
                      <span className="text-base font-bold">Agregar Ítem</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Tipo</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest text-right">Cant.</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest text-right">Peso (Kg)</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest text-right">Jabas</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest text-right">P/Jaba</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest text-right">Precio/Kg</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest text-right">Subtotal</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.length > 0 ? items.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-700">{item.tipo}</td>
                          <td className="px-4 py-3 text-right font-semibold">{item.cantidad}</td>
                          <td className="px-4 py-3 text-right">{item.pesoTotal.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">{item.jabas || 0}</td>
                          <td className="px-4 py-3 text-right">{item.pollosPorJaba || 0}</td>
                          <td className="px-4 py-3 text-right text-slate-500">S/ {item.precioKilo.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">S/ {item.subtotal.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => removeItem(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-slate-400 italic">Sin ítems en la boleta</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50/80">
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-right font-bold text-slate-500 uppercase tracking-widest text-xs">TOTAL A PAGAR:</td>
                        <td className="px-4 py-4 text-right font-black text-emerald-600 text-xl">S/ {totalBoleta.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex gap-4">
                {isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(null);
                      setItems([]);
                      setCliente('');
                      setCampana('');
                      setItemJabas('');
                      setItemPollosPorJaba('');
                      setDate(format(new Date(), 'yyyy-MM-dd'));
                      setError('');
                    }}
                    className="w-1/3 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-sm"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={handleSaveVenta}
                  disabled={items.length === 0}
                  className={`${isEditing ? 'w-2/3' : 'w-full'} bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none uppercase tracking-widest text-sm`}
                >
                  {isEditing ? 'Guardar Cambios' : 'Emitir Boleta de Venta'}
                </button>
              </div>
            </div>
          </div>

          {/* HISTORIAL */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Últimas Ventas</h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Recientes</span>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-250px)] p-4 space-y-4">
                {ventas.length > 0 ? (
                  ventas.map((t: Transaction) => {
                    const totalPollos = t.items?.reduce((acc, i) => acc + i.cantidad, 0) || 0;
                    const totalPeso = t.items?.reduce((acc, i) => acc + i.pesoTotal, 0) || 0;
                    return (
                      <div key={t.id} className="border border-slate-100 bg-slate-50/30 rounded-2xl p-4 hover:border-emerald-200 hover:bg-white transition-all group relative">
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => handleDownloadPDF(t)}
                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                            title="Descargar PDF"
                          >
                            <Download size={18} />
                          </button>
                          <button 
                            onClick={() => setPrintData(t)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Imprimir Boleta"
                          >
                            <Printer size={18} />
                          </button>
                          {store.currentUser?.role !== 'despachador' && (
                            <button 
                              onClick={() => handleEditVenta(t)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                              title="Editar Venta"
                            >
                              <Pencil size={18} />
                            </button>
                          )}
                          {store.currentUser?.role === 'admin' && (
                            <button 
                              onClick={() => handleDeleteVenta(t.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Eliminar Venta"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                        <div className="flex justify-between items-start mb-3 pr-24">
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{format(new Date(t.date), 'dd MMM yyyy')}</div>
                            <h4 className="font-bold text-slate-800 leading-tight">{t.cliente || 'Cliente General'}</h4>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">{t.campana}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-slate-900">S/ {t.totalVenta.toFixed(2)}</div>
                            <div className="text-[10px] font-bold text-emerald-600 uppercase">G: S/ {t.ganancia.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-tighter pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {totalPollos} pollos
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {totalPeso.toFixed(2)} Kg total
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-slate-400 py-12 italic">
                    No hay ventas registradas.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 text-red-600 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Eliminar Venta</h3>
            </div>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar este registro de venta? 
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
        <div 
          id="print-container" 
          className={`${isDownloading ? 'block absolute top-0 left-0 w-[800px] z-[-1000] bg-white' : 'hidden print:block'} text-black font-sans`}
        >
          
          {/* 1. ORDEN DE DESPACHO */}
          <div className="p-8 min-h-screen relative" style={{ pageBreakAfter: 'always' }}>
            <div className="border-2 border-slate-800 rounded-xl overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b-2 border-slate-800 bg-slate-50">
                <div className="flex items-center gap-4">
                  {appConfig.logo ? (
                    <img src={appConfig.logo} alt="Logo" className="w-16 h-16 object-contain rounded" />
                  ) : (
                    <Logo className="w-16 h-16" iconSize={40} />
                  )}
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{appConfig.appName}</h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Orden de Despacho</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="border-2 border-slate-800 p-3 rounded-lg bg-white inline-block text-center min-w-[150px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">N° Orden</p>
                    <p className="text-xl font-black text-slate-900">{printData.id.split('-')[0].toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0 border-b-2 border-slate-800">
                <div className="p-6 border-r-2 border-slate-800">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Datos de Origen</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Plantel:</span>
                      <span className="text-sm font-black text-slate-900">{printCampanaInfo?.plantel || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Galpón:</span>
                      <span className="text-sm font-black text-slate-900">{printCampanaInfo?.galpon || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Campaña:</span>
                      <span className="text-sm font-black text-slate-900">{printData.campana}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Fecha:</span>
                      <span className="text-sm font-black text-slate-900">{format(new Date(printData.date), 'dd/MM/yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Datos de Destino</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Cliente:</span>
                      <span className="text-sm font-black text-slate-900">{printData.cliente || 'CLIENTE GENERAL'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Total Jabas:</span>
                      <span className="text-sm font-black text-slate-900">{printData.items?.reduce((acc, item) => acc + (item.jabas || 0), 0) || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-800">
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Cant.</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Tipo de Pollo</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Sexo</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Jabas</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">P/Jaba</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Peso Prom. (Kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printData.items?.map((item, index) => {
                    const sexo = (item.tipo === 'BRASA' || item.tipo === 'TIPO_HEMBRA') ? 'Hembra' : 'Macho';
                    const pesoPromedio = item.cantidad > 0 ? (item.pesoTotal / item.cantidad).toFixed(2) : '0.00';
                    return (
                      <tr key={index} className="bg-white">
                        <td className="px-6 py-4 text-center font-bold text-sm">{item.cantidad}</td>
                        <td className="px-6 py-4 font-bold uppercase text-xs">{item.tipo.replace('_', ' ')}</td>
                        <td className="px-6 py-4 font-bold uppercase text-xs">{sexo}</td>
                        <td className="px-6 py-4 text-right font-bold text-sm">{item.jabas || 0}</td>
                        <td className="px-6 py-4 text-right font-bold text-sm">{item.pollosPorJaba || 0}</td>
                        <td className="px-6 py-4 text-right font-black text-sm">{pesoPromedio}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-24 grid grid-cols-2 gap-16 px-16">
              <div className="text-center">
                <div className="border-t border-slate-400 pt-2 font-bold uppercase text-[10px] tracking-widest text-slate-500">Firma Despachador</div>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-400 pt-2 font-bold uppercase text-[10px] tracking-widest text-slate-500">Firma Transportista</div>
              </div>
            </div>
          </div>

          {/* 2. GUÍA DE REMISIÓN */}
          <div className="p-8 min-h-screen relative" style={{ pageBreakAfter: 'always' }}>
            <div className="border-2 border-slate-800 rounded-xl overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b-2 border-slate-800 bg-slate-50">
                <div className="flex items-center gap-4">
                  {appConfig.logo ? (
                    <img src={appConfig.logo} alt="Logo" className="w-16 h-16 object-contain rounded" />
                  ) : (
                    <Logo className="w-16 h-16" iconSize={40} />
                  )}
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{appConfig.appName}</h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Guía de Remisión Remitente</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="border-2 border-slate-800 p-3 rounded-lg bg-white inline-block text-center min-w-[150px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Guía N°</p>
                    <p className="text-xl font-black text-slate-900">T001-{printData.id.split('-')[0].toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0 border-b-2 border-slate-800">
                <div className="p-6 border-r-2 border-slate-800">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Punto de Partida</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Origen:</span>
                      <span className="text-sm font-black text-slate-900">Granja {appConfig.appName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Plantel:</span>
                      <span className="text-sm font-black text-slate-900">{printCampanaInfo?.plantel || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Galpón:</span>
                      <span className="text-sm font-black text-slate-900">{printCampanaInfo?.galpon || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Fecha Traslado:</span>
                      <span className="text-sm font-black text-slate-900">{format(new Date(printData.date), 'dd/MM/yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Punto de Llegada</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Destinatario:</span>
                      <span className="text-sm font-black text-slate-900">{printData.cliente || 'CLIENTE GENERAL'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-800">
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Cant.</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Descripción</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Peso Total (Kg)</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Peso Prom. (Kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printData.items?.map((item, index) => {
                    const pesoPromedio = item.cantidad > 0 ? (item.pesoTotal / item.cantidad).toFixed(2) : '0.00';
                    return (
                      <tr key={index} className="bg-white">
                        <td className="px-6 py-4 text-center font-bold text-sm">{item.cantidad}</td>
                        <td className="px-6 py-4 font-bold uppercase text-xs">Pollo Vivo - {item.tipo.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-right font-bold text-sm">{item.pesoTotal.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-black text-sm">{pesoPromedio}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-800">
                    <td colSpan={2} className="px-6 py-4 text-right font-black uppercase text-xs tracking-widest">Peso Bruto Total:</td>
                    <td className="px-6 py-4 text-right font-black text-lg">{printData.items?.reduce((acc, item) => acc + item.pesoTotal, 0).toFixed(2)} Kg</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-24 grid grid-cols-2 gap-16 px-16">
              <div className="text-center">
                <div className="border-t border-slate-400 pt-2 font-bold uppercase text-[10px] tracking-widest text-slate-500">Firma Remitente</div>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-400 pt-2 font-bold uppercase text-[10px] tracking-widest text-slate-500">Firma Destinatario</div>
              </div>
            </div>
          </div>

          {/* 3. BOLETA DE VENTA */}
          <div className="p-8 min-h-screen relative">
            <div className="border-2 border-slate-800 rounded-xl overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b-2 border-slate-800 bg-slate-50">
                <div className="flex items-center gap-4">
                  {appConfig.logo ? (
                    <img src={appConfig.logo} alt="Logo" className="w-16 h-16 object-contain rounded" />
                  ) : (
                    <Logo className="w-16 h-16" iconSize={40} />
                  )}
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{appConfig.appName}</h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Comprobante de Venta</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="border-2 border-slate-800 p-3 rounded-lg bg-white inline-block text-center min-w-[150px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Boleta N°</p>
                    <p className="text-xl font-black text-slate-900">B001-{printData.id.split('-')[0].toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0 border-b-2 border-slate-800">
                <div className="p-6 border-r-2 border-slate-800">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Datos del Emisor</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Empresa:</span>
                      <span className="text-sm font-black text-slate-900">Granja {appConfig.appName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Dirección:</span>
                      <span className="text-sm font-black text-slate-900">Sector Las Praderas S/N</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Teléfono:</span>
                      <span className="text-sm font-black text-slate-900">987 654 321</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Datos del Adquiriente</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Cliente:</span>
                      <span className="text-sm font-black text-slate-900">{printData.cliente || 'CLIENTE GENERAL'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Campaña:</span>
                      <span className="text-sm font-black text-slate-900">{printData.campana}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Fecha:</span>
                      <span className="text-sm font-black text-slate-900">{format(new Date(printData.date), 'dd/MM/yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-800">
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Cant.</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Descripción</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Peso Prom.</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Peso Total</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Precio Unit.</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Importe Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printData.items?.map((item, index) => {
                    const pesoPromedio = item.cantidad > 0 ? (item.pesoTotal / item.cantidad).toFixed(2) : '0.00';
                    return (
                      <tr key={index} className="bg-white">
                        <td className="px-6 py-4 text-center font-bold text-sm">{item.cantidad}</td>
                        <td className="px-6 py-4 font-bold uppercase text-xs">Pollo {item.tipo.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-right font-medium text-sm">{pesoPromedio} Kg</td>
                        <td className="px-6 py-4 text-right font-medium text-sm">{item.pesoTotal.toFixed(2)} Kg</td>
                        <td className="px-6 py-4 text-right font-medium text-sm">S/ {item.precioKilo.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-black text-sm">S/ {item.subtotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-800">
                    <td colSpan={4} className="px-6 py-4"></td>
                    <td className="px-6 py-4 text-right font-black uppercase text-xs tracking-widest">Total a Pagar:</td>
                    <td className="px-6 py-4 text-right font-black text-2xl">
                      S/ {printData.totalVenta.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gracias por su preferencia - {appConfig.appName}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
