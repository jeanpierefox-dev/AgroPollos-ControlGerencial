import React, { useState, useEffect } from 'react';
import { Transaction, SaleItem, TipoPollo } from '../types';
import { format } from 'date-fns';
import { Plus, Trash2, ReceiptText, Printer } from 'lucide-react';
import { Logo } from './Logo';

export function Ventas({ store }: { store: any }) {
  const { transactions, addTransaction, getCampanas, getStockByCampana } = store;
  
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [cliente, setCliente] = useState('');
  const [campana, setCampana] = useState('');
  
  const [items, setItems] = useState<SaleItem[]>([]);
  
  const [tipo, setTipo] = useState<TipoPollo>('BRASA');
  const [cantidad, setCantidad] = useState('');
  const [pesoTotal, setPesoTotal] = useState('');
  const [precioKilo, setPrecioKilo] = useState('');
  
  const [error, setError] = useState('');
  
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

  const campanas = getCampanas();
  const stock = campana ? getStockByCampana(campana) : null;

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
      subtotal
    }]);

    setCantidad('');
    setPesoTotal('');
    setPrecioKilo('');
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
    const costoUnitario = stock!.costoUnitario;
    const totalCosto = totalPollos * costoUnitario;
    const ganancia = totalVenta - totalCosto;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date,
      type: 'VENTA',
      campana,
      cliente,
      items,
      totalCosto,
      totalVenta,
      ganancia,
    };

    addTransaction(newTransaction);
    
    // Reset
    setItems([]);
    setCliente('');
    setError('');
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
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <ReceiptText size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Nueva Venta</h3>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-center gap-2">
                  <span className="font-bold">Error:</span> {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Campaña</label>
                  <select
                    value={campana}
                    onChange={(e) => { setCampana(e.target.value); setItems([]); }}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-bold text-blue-700"
                  >
                    <option value="">Seleccione Campaña</option>
                    {campanas.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cliente (Opcional)</label>
                  <input
                    type="text"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    placeholder="Nombre del cliente o Razón Social"
                  />
                </div>
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
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Costo Pollo</div>
                    <div className="text-lg font-bold text-blue-400">S/ {stock.costoUnitario.toFixed(2)}</div>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-200 mb-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Agregar Ítem a Boleta</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Tipo</label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as TipoPollo)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold bg-white"
                    >
                      <option value="BRASA">Brasa (H)</option>
                      <option value="PRESA">Presa (M)</option>
                      <option value="TIPO_HEMBRA">Tipo (H)</option>
                      <option value="TIPO_MACHO">Tipo (M)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Cant.</label>
                    <input
                      type="number"
                      min="1"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Peso (Kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pesoTotal}
                      onChange={(e) => setPesoTotal(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">P. x Kg</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={precioKilo}
                      onChange={(e) => setPrecioKilo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700 flex justify-center items-center transition-colors shadow-sm"
                    >
                      <Plus size={20} />
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
                        <td className="px-4 py-4 text-right font-black text-blue-600 text-xl">S/ {totalBoleta.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <button
                onClick={handleSaveVenta}
                disabled={items.length === 0}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none uppercase tracking-widest text-sm"
              >
                Emitir Boleta de Venta
              </button>
            </div>
          </div>

          {/* HISTORIAL */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Últimas Ventas</h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">Recientes</span>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-250px)] p-4 space-y-4">
                {ventas.length > 0 ? (
                  ventas.map((t: Transaction) => {
                    const totalPollos = t.items?.reduce((acc, i) => acc + i.cantidad, 0) || 0;
                    const totalPeso = t.items?.reduce((acc, i) => acc + i.pesoTotal, 0) || 0;
                    return (
                      <div key={t.id} className="border border-slate-100 bg-slate-50/30 rounded-2xl p-4 hover:border-blue-200 hover:bg-white transition-all group relative">
                        <button 
                          onClick={() => setPrintData(t)}
                          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Imprimir Boleta"
                        >
                          <Printer size={18} />
                        </button>
                        <div className="flex justify-between items-start mb-3 pr-10">
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{format(new Date(t.date), 'dd MMM yyyy')}</div>
                            <h4 className="font-bold text-slate-800 leading-tight">{t.cliente || 'Cliente General'}</h4>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">{t.campana}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-slate-900">S/ {t.totalVenta.toFixed(2)}</div>
                            <div className="text-[10px] font-bold text-emerald-600 uppercase">G: S/ {t.ganancia.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-tighter pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
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

      {/* PRINT VIEW */}
      {printData && (
        <div className="hidden print:block p-12 bg-white text-black min-h-screen font-sans">
          <div className="flex justify-between items-start mb-12 border-b-4 border-slate-900 pb-8">
            <div className="flex items-center gap-4">
              <Logo className="w-16 h-16" iconSize={40} />
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1 uppercase">AgroPollos</h1>
                <p className="text-lg font-bold text-slate-600 uppercase tracking-widest">Comprobante de Venta</p>
                <div className="mt-4 text-sm text-slate-500 font-medium">
                  <p>Granja de Crianza y Venta de Aves</p>
                  <p>Dirección: Sector Las Praderas S/N</p>
                  <p>Tel: 987 654 321</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="border-4 border-slate-900 p-4 inline-block">
                <p className="text-xs font-black uppercase tracking-widest mb-1">Boleta de Venta</p>
                <p className="text-2xl font-black">N° {printData.id.split('-')[0].toUpperCase()}</p>
              </div>
              <div className="mt-4 text-sm font-bold uppercase tracking-wider">
                <p><strong>Fecha:</strong> {format(new Date(printData.date), 'dd/MM/yyyy')}</p>
              </div>
            </div>
          </div>

          <div className="mb-12 grid grid-cols-2 gap-12">
            <div className="border-l-4 border-slate-200 pl-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Datos del Adquiriente</h3>
              <p className="text-xl font-black text-slate-900 mb-1">{printData.cliente || 'CLIENTE GENERAL'}</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Campaña: {printData.campana}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse mb-12">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-6 py-4 font-black uppercase text-xs tracking-widest">Cant.</th>
                <th className="px-6 py-4 font-black uppercase text-xs tracking-widest">Descripción del Producto</th>
                <th className="px-6 py-4 font-black uppercase text-xs tracking-widest text-right">Peso (Kg)</th>
                <th className="px-6 py-4 font-black uppercase text-xs tracking-widest text-right">Precio Unit.</th>
                <th className="px-6 py-4 font-black uppercase text-xs tracking-widest text-right">Importe Total</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {printData.items?.map((item, index) => (
                <tr key={index} className="bg-white">
                  <td className="px-6 py-5 text-center font-bold text-lg">{item.cantidad}</td>
                  <td className="px-6 py-5 font-bold uppercase text-sm">Pollo {item.tipo.replace('_', ' ')}</td>
                  <td className="px-6 py-5 text-right font-medium">{item.pesoTotal.toFixed(2)}</td>
                  <td className="px-6 py-5 text-right font-medium">S/ {item.precioKilo.toFixed(2)}</td>
                  <td className="px-6 py-5 text-right font-black text-lg">S/ {item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-4 border-slate-900">
                <td colSpan={3} className="px-6 py-6"></td>
                <td className="px-6 py-6 text-right font-black uppercase text-sm tracking-widest bg-slate-50">TOTAL S/:</td>
                <td className="px-6 py-6 text-right font-black text-3xl bg-slate-50">
                  {printData.totalVenta.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-32 grid grid-cols-2 gap-24 px-12">
            <div className="text-center">
              <div className="border-t-2 border-slate-900 pt-4 font-black uppercase text-xs tracking-widest">Firma del Cliente</div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-slate-900 pt-4 font-black uppercase text-xs tracking-widest">Firma Autorizada</div>
            </div>
          </div>
          
          <div className="mt-24 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Gracias por su preferencia - AgroPollos</p>
          </div>
        </div>
      )}
    </>
  );
}
