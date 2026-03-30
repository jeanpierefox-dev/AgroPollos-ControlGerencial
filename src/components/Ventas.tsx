import React, { useState, useEffect } from 'react';
import { Transaction, SaleItem, TipoPollo } from '../types';
import { format } from 'date-fns';
import { Plus, Trash2, ReceiptText, Printer, Pencil, Search, Loader2, X } from 'lucide-react';
import { Logo } from './Logo';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export function Ventas({ store }: { store: any }) {
  const { transactions, appConfig, addTransaction, updateTransaction, deleteTransaction, getCampanas, getStockByCampana, getCampanaInfo } = store;
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [cliente, setCliente] = useState('');
  const [documentoCliente, setDocumentoCliente] = useState('');
  const [direccionCliente, setDireccionCliente] = useState('');
  const [isSearchingClient, setIsSearchingClient] = useState(false);
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

  const handleSearchClient = async () => {
    if (!documentoCliente) {
      setError('Ingrese un DNI o RUC para buscar.');
      return;
    }
    
    setIsSearchingClient(true);
    setError('');
    
    try {
      const type = documentoCliente.length === 8 ? 'dni' : 'ruc';
      
      if (type !== 'dni' && type !== 'ruc' && documentoCliente.length !== 11) {
        throw new Error('El documento debe tener 8 (DNI) o 11 (RUC) dígitos.');
      }

      let data = null;
      
      // Intento 1: API primaria directa (apis.net.pe)
      try {
        const response = await fetch(`https://api.apis.net.pe/v1/${type}?numero=${documentoCliente}`);
        if (response.ok) {
          data = await response.json();
        }
      } catch (e) {
        console.warn('API primaria directa falló', e);
      }

      // Intento 2: API primaria a través de proxy CORS (allorigins)
      if (!data) {
        try {
          const url = encodeURIComponent(`https://api.apis.net.pe/v1/${type}?numero=${documentoCliente}&_t=${Date.now()}`);
          const response = await fetch(`https://api.allorigins.win/get?url=${url}`);
          if (response.ok) {
            const proxyData = await response.json();
            if (proxyData.contents) {
              const parsed = JSON.parse(proxyData.contents);
              // apis.net.pe devuelve un objeto con "message" o "error" cuando no encuentra el documento
              if (!parsed.message && !parsed.error && (parsed.numeroDocumento || parsed.dni || parsed.nombres || parsed.nombre)) {
                data = parsed;
              }
            }
          }
        } catch (e) {
          console.warn('API primaria via proxy falló', e);
        }
      }

      // Intento 3: API secundaria (facturacion.vip) como respaldo
      if (!data) {
        try {
          const response = await fetch(`https://api.facturacion.vip/api/v1/${type}/${documentoCliente}`);
          if (response.ok) {
            const resData = await response.json();
            if (type === 'dni') {
              data = {
                nombres: resData.nombres,
                apellidoPaterno: resData.apellidoPaterno,
                apellidoMaterno: resData.apellidoMaterno
              };
            } else {
              data = {
                nombre: resData.razonSocial,
                direccion: resData.direccion
              };
            }
          }
        } catch (e) {
          console.warn('API secundaria falló', e);
        }
      }

      if (!data) {
        throw new Error('No se pudo conectar con SUNAT/RENIEC o el documento no existe.');
      }
      
      if (type === 'dni') {
        setCliente(`${data.nombres || ''} ${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`.trim());
        setDireccionCliente('');
      } else {
        setCliente(data.nombre || data.razonSocial || '');
        setDireccionCliente(data.direccion || '');
      }
    } catch (err: any) {
      console.error('Error fetching client:', err);
      setError(err.message || 'Error al conectar con SUNAT/RENIEC. Intente ingresarlo manualmente.');
    } finally {
      setIsSearchingClient(false);
    }
  };
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
      cliente: documentoCliente ? `${documentoCliente} - ${cliente}` : cliente,
      direccionCliente,
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
    setDocumentoCliente('');
    setDireccionCliente('');
    setCostoUnitarioVenta('');
    setError('');
    setIsModalOpen(false);
  };

  const handleEditVenta = (t: Transaction) => {
    setIsEditing(t.id);
    setDate(t.date);
    setCampana(t.campana || '');
    
    // Extraer documento si existe en el formato "DOCUMENTO - Nombre"
    if (t.cliente && t.cliente.includes(' - ')) {
      const parts = t.cliente.split(' - ');
      setDocumentoCliente(parts[0]);
      setCliente(parts.slice(1).join(' - '));
    } else {
      setDocumentoCliente('');
      setCliente(t.cliente || '');
    }
    
    setDireccionCliente(t.direccionCliente || '');
    setItems(t.items || []);
    const totalPollos = t.items?.reduce((acc, i) => acc + i.cantidad, 0) || 1;
    setCostoUnitarioVenta((t.totalCosto / totalPollos).toFixed(2));
    setError('');
    setIsModalOpen(true);
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
      <div className="p-4 md:p-8 animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Ventas y Despachos</h2>
            <p className="text-slate-500 font-medium mt-1">Gestión de facturación y guías de remisión</p>
          </div>
          <button
            onClick={() => {
              setIsEditing(null);
              setItems([]);
              setCliente('');
              setDocumentoCliente('');
              setCampana('');
              setIsModalOpen(true);
            }}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 uppercase tracking-widest text-sm"
          >
            <Plus size={20} />
            Nueva Venta
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <ReceiptText size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    {isEditing ? 'Editar Venta' : 'Nueva Venta'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-center gap-2">
                    <span className="font-bold">Error:</span> {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
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
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">DNI / RUC Cliente</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={documentoCliente}
                          onChange={(e) => setDocumentoCliente(e.target.value.replace(/\D/g, '').slice(0, 11))}
                          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-base"
                          placeholder="Ingrese DNI o RUC"
                        />
                        <button
                          type="button"
                          onClick={handleSearchClient}
                          disabled={isSearchingClient || !documentoCliente}
                          title="Buscar en SUNAT/RENIEC"
                          className="bg-slate-800 text-white px-4 py-3 rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[56px]"
                        >
                          {isSearchingClient ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre / Razón Social</label>
                      <input
                        type="text"
                        value={cliente}
                        onChange={(e) => setCliente(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-base font-bold"
                        placeholder="Nombre del cliente"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dirección (Opcional)</label>
                      <input
                        type="text"
                        value={direccionCliente}
                        onChange={(e) => setDireccionCliente(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-base"
                        placeholder="Dirección del cliente"
                      />
                    </div>
                  </div>
                </div>

                {campana && stock && (
                  <div className="bg-slate-900 text-white p-4 rounded-2xl mb-8 grid grid-cols-3 gap-4 shadow-inner">
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

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Agregar Ítem</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Pollo</label>
                      <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as TipoPollo)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-bold text-slate-700"
                      >
                        <option value="BRASA">Brasa (Hembra)</option>
                        <option value="PRESA">Presa (Macho)</option>
                        <option value="TIPO_HEMBRA">Tipo Hembra</option>
                        <option value="TIPO_MACHO">Tipo Macho</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cantidad (Aves)</label>
                      <input
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        onKeyDown={handleNumberKeyDown}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-bold"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Peso Total (Kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={pesoTotal}
                        onChange={(e) => setPesoTotal(e.target.value)}
                        onKeyDown={handleNumberKeyDown}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-bold"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Precio por Kg (S/)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={precioKilo}
                        onChange={(e) => setPrecioKilo(e.target.value)}
                        onKeyDown={handleNumberKeyDown}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-bold text-emerald-700"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">N° Jabas (Opcional)</label>
                      <input
                        type="number"
                        min="0"
                        value={itemJabas}
                        onChange={(e) => setItemJabas(e.target.value)}
                        onKeyDown={handleNumberKeyDown}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pollos/Jaba (Opcional)</label>
                      <input
                        type="number"
                        min="0"
                        value={itemPollosPorJaba}
                        onChange={(e) => setItemPollosPorJaba(e.target.value)}
                        onKeyDown={handleNumberKeyDown}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAddItem}
                        className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-colors uppercase tracking-widest text-sm flex justify-center items-center gap-2"
                      >
                        <Plus size={18} />
                        Añadir Ítem
                      </button>
                    </div>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3">Detalle de Venta</h4>
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{item.tipo.replace('_', ' ')}</p>
                            <p className="text-xs text-slate-500">{item.cantidad} aves | {item.pesoTotal.toFixed(2)} kg | S/ {item.precioKilo.toFixed(2)}/kg</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-black text-emerald-600">S/ {item.subtotal.toFixed(2)}</span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="font-bold text-emerald-900 uppercase tracking-widest text-xs">Total Venta:</span>
                      <span className="font-black text-emerald-700 text-xl">
                        S/ {items.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors uppercase tracking-widest text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveVenta}
                  disabled={items.length === 0 || !campana}
                  className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isEditing ? 'Actualizar Venta' : 'Guardar Venta'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HISTORIAL */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">Historial de Ventas</h3>
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest">{ventas.length} Registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest">Fecha</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest">Cliente</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest">Campaña</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-right">Aves</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-right">Peso Total</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-right">Total</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ventas.length > 0 ? (
                  ventas.map((t: Transaction) => {
                    const totalAves = t.items?.reduce((acc, item) => acc + item.cantidad, 0) || 0;
                    const totalPeso = t.items?.reduce((acc, item) => acc + item.pesoTotal, 0) || 0;
                    
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 font-bold text-slate-700">
                          {format(new Date(t.date), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-8 py-5 font-bold text-slate-800">
                          {t.cliente || 'Cliente General'}
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-wide">
                            {t.campana}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right font-medium">
                          {totalAves}
                        </td>
                        <td className="px-8 py-5 text-right font-medium">
                          {totalPeso.toFixed(2)} kg
                        </td>
                        <td className="px-8 py-5 text-right font-black text-emerald-600 text-lg">
                          S/ {t.totalVenta.toFixed(2)}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setPrintData(t);
                                setTimeout(() => window.print(), 100);
                              }}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                              title="Imprimir Documentos"
                            >
                              <Printer size={20} />
                            </button>
                            {store.currentUser?.role !== 'despachador' && (
                              <button
                                onClick={() => handleEditVenta(t)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                title="Editar Venta"
                              >
                                <Pencil size={20} />
                              </button>
                            )}
                            {store.currentUser?.role === 'admin' && (
                              <button
                                onClick={() => {
                                  setItemToDelete(t.id);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="Eliminar Venta"
                              >
                                <Trash2 size={20} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-16 text-center text-slate-400 font-medium">
                      No hay registros de ventas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
              <div className="flex justify-between items-center p-6 border-b-2 border-emerald-800 bg-emerald-600 text-white">
                <div className="flex items-center gap-4">
                  {appConfig.logo ? (
                    <img src={appConfig.logo} alt="Logo" className="w-16 h-16 object-contain rounded bg-white p-1" />
                  ) : (
                    <Logo className="w-16 h-16 text-white" iconSize={40} />
                  )}
                  <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">{appConfig.appName}</h1>
                    <p className="text-sm font-bold text-emerald-100 uppercase tracking-widest">Orden de Despacho</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="border-2 border-emerald-800 p-3 rounded-lg bg-white inline-block text-center min-w-[150px] text-slate-900">
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
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Galpón</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Jabas</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">P/Jaba</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Peso Prom. (Kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printData.items?.map((item, index) => {
                    const sexo = (item.tipo === 'BRASA' || item.tipo === 'TIPO_HEMBRA') ? 'Hembra' : 'Macho';
                    const pesoPromedio = item.cantidad > 0 ? (item.pesoTotal / item.cantidad).toFixed(2) : '0.00';
                    
                    // Extraer galpón específico si está disponible en la info de la campaña
                    let galponEspecifico = '-';
                    if (printCampanaInfo?.galpon) {
                      const galpones = printCampanaInfo.galpon.split(' | ');
                      if (sexo === 'Hembra' && galpones.find(g => g.startsWith('H:'))) {
                        galponEspecifico = galpones.find(g => g.startsWith('H:'))?.replace('H:', '') || '-';
                      } else if (sexo === 'Macho' && galpones.find(g => g.startsWith('M:'))) {
                        galponEspecifico = galpones.find(g => g.startsWith('M:'))?.replace('M:', '') || '-';
                      } else {
                        galponEspecifico = printCampanaInfo.galpon;
                      }
                    }

                    return (
                      <tr key={index} className="bg-white">
                        <td className="px-6 py-4 text-center font-bold text-sm">{item.cantidad}</td>
                        <td className="px-6 py-4 font-bold uppercase text-xs">{item.tipo.replace('_', ' ')}</td>
                        <td className="px-6 py-4 font-bold uppercase text-xs">{sexo}</td>
                        <td className="px-6 py-4 font-bold uppercase text-xs text-emerald-700">{galponEspecifico}</td>
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
              <div className="flex justify-between items-center p-6 border-b-2 border-emerald-800 bg-emerald-600 text-white">
                <div className="flex items-center gap-4">
                  {appConfig.logo ? (
                    <img src={appConfig.logo} alt="Logo" className="w-16 h-16 object-contain rounded bg-white p-1" />
                  ) : (
                    <Logo className="w-16 h-16 text-white" iconSize={40} />
                  )}
                  <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">{appConfig.appName}</h1>
                    <p className="text-sm font-bold text-emerald-100 uppercase tracking-widest">Guía de Remisión Remitente</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="border-2 border-emerald-800 p-3 rounded-lg bg-white inline-block text-center min-w-[150px] text-slate-900">
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
                    {printData.direccionCliente && (
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Dirección:</span>
                        <span className="text-sm font-black text-slate-900 text-right max-w-[200px] truncate">{printData.direccionCliente}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-800">
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Cant.</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Descripción</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Galpón</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Peso Total (Kg)</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Peso Prom. (Kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printData.items?.map((item, index) => {
                    const sexo = (item.tipo === 'BRASA' || item.tipo === 'TIPO_HEMBRA') ? 'Hembra' : 'Macho';
                    const pesoPromedio = item.cantidad > 0 ? (item.pesoTotal / item.cantidad).toFixed(2) : '0.00';
                    
                    // Extraer galpón específico si está disponible en la info de la campaña
                    let galponEspecifico = '-';
                    if (printCampanaInfo?.galpon) {
                      const galpones = printCampanaInfo.galpon.split(' | ');
                      if (sexo === 'Hembra' && galpones.find(g => g.startsWith('H:'))) {
                        galponEspecifico = galpones.find(g => g.startsWith('H:'))?.replace('H:', '') || '-';
                      } else if (sexo === 'Macho' && galpones.find(g => g.startsWith('M:'))) {
                        galponEspecifico = galpones.find(g => g.startsWith('M:'))?.replace('M:', '') || '-';
                      } else {
                        galponEspecifico = printCampanaInfo.galpon;
                      }
                    }

                    return (
                      <tr key={index} className="bg-white">
                        <td className="px-6 py-4 text-center font-bold text-sm">{item.cantidad}</td>
                        <td className="px-6 py-4 font-bold uppercase text-xs">Pollo Vivo - {item.tipo.replace('_', ' ')}</td>
                        <td className="px-6 py-4 font-bold uppercase text-xs text-emerald-700">{galponEspecifico}</td>
                        <td className="px-6 py-4 text-right font-bold text-sm">{item.pesoTotal.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-black text-sm">{pesoPromedio}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-800">
                    <td colSpan={3} className="px-6 py-4 text-right font-black uppercase text-xs tracking-widest">Peso Bruto Total:</td>
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
              <div className="flex justify-between items-center p-6 border-b-2 border-emerald-800 bg-emerald-600 text-white">
                <div className="flex items-center gap-4">
                  {appConfig.logo ? (
                    <img src={appConfig.logo} alt="Logo" className="w-16 h-16 object-contain rounded bg-white p-1" />
                  ) : (
                    <Logo className="w-16 h-16 text-white" iconSize={40} />
                  )}
                  <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">{appConfig.appName}</h1>
                    <p className="text-sm font-bold text-emerald-100 uppercase tracking-widest">Comprobante de Venta</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="border-2 border-emerald-800 p-3 rounded-lg bg-white inline-block text-center min-w-[150px] text-slate-900">
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
                    {printData.direccionCliente && (
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Dirección:</span>
                        <span className="text-sm font-black text-slate-900 text-right max-w-[200px] truncate">{printData.direccionCliente}</span>
                      </div>
                    )}
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
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600">Galpón</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Peso Prom.</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Peso Total</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Precio Unit.</th>
                    <th className="px-6 py-3 font-black uppercase text-[10px] tracking-widest text-slate-600 text-right">Importe Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printData.items?.map((item, index) => {
                    const sexo = (item.tipo === 'BRASA' || item.tipo === 'TIPO_HEMBRA') ? 'Hembra' : 'Macho';
                    const pesoPromedio = item.cantidad > 0 ? (item.pesoTotal / item.cantidad).toFixed(2) : '0.00';
                    
                    // Extraer galpón específico si está disponible en la info de la campaña
                    let galponEspecifico = '-';
                    if (printCampanaInfo?.galpon) {
                      const galpones = printCampanaInfo.galpon.split(' | ');
                      if (sexo === 'Hembra' && galpones.find(g => g.startsWith('H:'))) {
                        galponEspecifico = galpones.find(g => g.startsWith('H:'))?.replace('H:', '') || '-';
                      } else if (sexo === 'Macho' && galpones.find(g => g.startsWith('M:'))) {
                        galponEspecifico = galpones.find(g => g.startsWith('M:'))?.replace('M:', '') || '-';
                      } else {
                        galponEspecifico = printCampanaInfo.galpon;
                      }
                    }

                    return (
                      <tr key={index} className="bg-white">
                        <td className="px-6 py-4 text-center font-bold text-sm">{item.cantidad}</td>
                        <td className="px-6 py-4 font-bold uppercase text-xs">Pollo {item.tipo.replace('_', ' ')}</td>
                        <td className="px-6 py-4 font-bold uppercase text-xs text-emerald-700">{galponEspecifico}</td>
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
                    <td colSpan={5} className="px-6 py-4"></td>
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
