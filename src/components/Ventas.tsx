import React, { useState, useEffect } from 'react';
import { Transaction, SaleItem, TipoPollo } from '../types';
import { format } from 'date-fns';
import { Plus, Trash2, ReceiptText, Printer } from 'lucide-react';

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
      <div className="p-8 print:hidden">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Boleta de Venta</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* BOLETA FORM */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <ReceiptText className="text-blue-600" size={24} />
                <h3 className="text-lg font-medium text-slate-800">Nueva Venta</h3>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Campaña</label>
                  <select
                    value={campana}
                    onChange={(e) => { setCampana(e.target.value); setItems([]); }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione Campaña</option>
                    {campanas.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente (Opcional)</label>
                  <input
                    type="text"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del cliente"
                  />
                </div>
              </div>

              {campana && stock && (
                <div className="bg-blue-50 p-3 rounded-lg mb-6 flex gap-6 text-sm">
                  <span className="text-blue-800"><strong>Stock Hembras:</strong> {stock.hembras}</span>
                  <span className="text-blue-800"><strong>Stock Machos:</strong> {stock.machos}</span>
                  <span className="text-blue-800"><strong>Costo Unit.:</strong> S/ {stock.costoUnitario.toFixed(2)}</span>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                <h4 className="text-sm font-semibold text-slate-800 mb-3">Agregar Ítem</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Tipo</label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as TipoPollo)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                    >
                      <option value="BRASA">Brasa (H)</option>
                      <option value="PRESA">Presa (M)</option>
                      <option value="TIPO_HEMBRA">Tipo (H)</option>
                      <option value="TIPO_MACHO">Tipo (M)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Peso (Kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pesoTotal}
                      onChange={(e) => setPesoTotal(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Precio x Kg</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={precioKilo}
                      onChange={(e) => setPrecioKilo(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full bg-slate-800 text-white p-1.5 rounded hover:bg-slate-700 flex justify-center items-center"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="px-4 py-2 font-medium">Tipo</th>
                      <th className="px-4 py-2 font-medium text-right">Cant.</th>
                      <th className="px-4 py-2 font-medium text-right">Peso (Kg)</th>
                      <th className="px-4 py-2 font-medium text-right">Precio/Kg</th>
                      <th className="px-4 py-2 font-medium text-right">Subtotal</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.length > 0 ? items.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-2">{item.tipo}</td>
                        <td className="px-4 py-2 text-right">{item.cantidad}</td>
                        <td className="px-4 py-2 text-right">{item.pesoTotal.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">S/ {item.precioKilo.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-medium">S/ {item.subtotal.toFixed(2)}</td>
                        <td className="px-4 py-2 text-center">
                          <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-400">Sin ítems en la boleta</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-bold text-slate-700">TOTAL A PAGAR:</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600 text-lg">S/ {totalBoleta.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <button
                onClick={handleSaveVenta}
                disabled={items.length === 0}
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Emitir Boleta de Venta
              </button>
            </div>
          </div>

          {/* HISTORIAL */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-lg font-medium text-slate-800">Últimas Ventas</h3>
              </div>
              <div className="overflow-y-auto max-h-[600px] p-4 space-y-4">
                {ventas.length > 0 ? (
                  ventas.map((t: Transaction) => {
                    const totalPollos = t.items?.reduce((acc, i) => acc + i.cantidad, 0) || 0;
                    const totalPeso = t.items?.reduce((acc, i) => acc + i.pesoTotal, 0) || 0;
                    return (
                      <div key={t.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors relative group">
                        <button 
                          onClick={() => setPrintData(t)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Imprimir Boleta"
                        >
                          <Printer size={18} />
                        </button>
                        <div className="flex justify-between items-start mb-2 pr-8">
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{format(new Date(t.date), 'dd MMM yyyy')}</span>
                            <h4 className="font-medium text-slate-800">{t.cliente || 'Cliente General'}</h4>
                            <p className="text-xs text-slate-500">{t.campana}</p>
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-blue-600">S/ {t.totalVenta.toFixed(2)}</span>
                            <span className="text-xs text-emerald-600">Ganancia: S/ {t.ganancia.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded p-2 text-xs text-slate-600 flex justify-between">
                          <span>{totalPollos} pollos</span>
                          <span>{totalPeso.toFixed(2)} Kg total</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-slate-400 py-8">
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
        <div className="hidden print:block p-8 bg-white text-black min-h-screen">
          <div className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AgroPollos</h1>
              <p className="text-slate-500">Boleta de Venta Electrónica</p>
            </div>
            <div className="text-right text-sm">
              <p><strong>Fecha de Emisión:</strong> {format(new Date(printData.date), 'dd/MM/yyyy')}</p>
              <p><strong>N° Boleta:</strong> {printData.id.split('-')[0].toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Datos del Cliente</h3>
              <p className="mb-1"><strong>Señor(es):</strong> {printData.cliente || 'Cliente General'}</p>
              <p><strong>Campaña:</strong> {printData.campana}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-4 py-2">Cant.</th>
                <th className="border border-slate-300 px-4 py-2">Descripción</th>
                <th className="border border-slate-300 px-4 py-2 text-right">Peso (Kg)</th>
                <th className="border border-slate-300 px-4 py-2 text-right">P. Unit.</th>
                <th className="border border-slate-300 px-4 py-2 text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {printData.items?.map((item, index) => (
                <tr key={index}>
                  <td className="border border-slate-300 px-4 py-2 text-center">{item.cantidad}</td>
                  <td className="border border-slate-300 px-4 py-2">Pollo {item.tipo.replace('_', ' ')}</td>
                  <td className="border border-slate-300 px-4 py-2 text-right">{item.pesoTotal.toFixed(2)}</td>
                  <td className="border border-slate-300 px-4 py-2 text-right">S/ {item.precioKilo.toFixed(2)}</td>
                  <td className="border border-slate-300 px-4 py-2 text-right">S/ {item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="border-none"></td>
                <td className="border border-slate-300 px-4 py-2 text-right font-bold bg-slate-50">TOTAL:</td>
                <td className="border border-slate-300 px-4 py-2 text-right font-bold bg-slate-50">
                  S/ {printData.totalVenta.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-24 flex justify-between px-16">
            <div className="text-center">
              <div className="border-t border-slate-400 w-48 mx-auto pt-2">Firma Cliente</div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-400 w-48 mx-auto pt-2">Firma Vendedor</div>
            </div>
          </div>
          
          <div className="mt-12 text-center text-sm text-slate-500">
            <p>Gracias por su compra.</p>
          </div>
        </div>
      )}
    </>
  );
}
