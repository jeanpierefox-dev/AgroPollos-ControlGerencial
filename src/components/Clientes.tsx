import React, { useState } from 'react';
import { useStore } from '../useStore';
import { Client, ClientType } from '../types';
import { Plus, Edit2, Trash2, Search, Users } from 'lucide-react';

export function Clientes() {
  const { clients, addClient, updateClient, deleteClient } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Client>>({
    documento: '',
    nombre: '',
    direccion: '',
    tipo: 'ambos'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateClient(editingId, { ...formData, id: editingId } as Client);
      setEditingId(null);
    } else {
      addClient({
        ...formData,
        id: Date.now().toString(),
        fechaRegistro: new Date().toISOString()
      } as Client);
    }
    setIsAdding(false);
    setFormData({ documento: '', nombre: '', direccion: '', tipo: 'ambos' });
  };

  const handleEdit = (client: Client) => {
    setFormData(client);
    setEditingId(client.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      deleteClient(id);
    }
  };

  const filteredClients = clients.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.documento.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Gestión de Clientes
        </h2>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ documento: '', nombre: '', direccion: '', tipo: 'ambos' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DNI / RUC</label>
                <input
                  type="text"
                  required
                  value={formData.documento}
                  onChange={e => setFormData({ ...formData, documento: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de documento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón Social</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre completo o Razón Social"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Dirección del cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente</label>
                <select
                  required
                  value={formData.tipo}
                  onChange={e => setFormData({ ...formData, tipo: e.target.value as ClientType })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ambos">Ambos (Bebés y Vivos)</option>
                  <option value="pollos_bebes">Solo Pollos Bebés</option>
                  <option value="pollos_vivos">Solo Pollos Vivos</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente por nombre o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Documento</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Nombre / Razón Social</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Dirección</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Tipo</th>
                <th className="text-right p-4 text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-800">{client.documento}</td>
                  <td className="p-4 text-gray-800 font-medium">{client.nombre}</td>
                  <td className="p-4 text-gray-600">{client.direccion || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.tipo === 'pollos_bebes' ? 'bg-yellow-100 text-yellow-800' :
                      client.tipo === 'pollos_vivos' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {client.tipo === 'pollos_bebes' ? 'Pollos Bebés' :
                       client.tipo === 'pollos_vivos' ? 'Pollos Vivos' : 'Ambos'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No se encontraron clientes.
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
