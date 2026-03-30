import React, { useState, useEffect } from 'react';
import { User as UserType, Role } from '../types';
import { UserPlus, Trash2, Pencil, Shield, User, Truck, AlertTriangle, CheckCircle, X } from 'lucide-react';

export function Usuarios({ store }: { store: any }) {
  const { users, addUser, updateUser, deleteUser, currentUser } = store;
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('vendedor');
  const [error, setError] = useState('');
  
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !name || (!password && !isEditing)) {
      setError('Complete todos los campos requeridos');
      return;
    }

    if (!isEditing && users.some((u: UserType) => u.username === username)) {
      setError('El nombre de usuario ya existe');
      return;
    }

    const userData: UserType = {
      id: isEditing || crypto.randomUUID(),
      username,
      name,
      role,
      passwordHash: password || (users.find((u: UserType) => u.id === isEditing)?.passwordHash || ''),
    };

    if (isEditing) {
      updateUser(isEditing, userData);
      setIsEditing(null);
      setNotification({ message: 'Usuario actualizado exitosamente', type: 'success' });
    } else {
      addUser(userData);
      setNotification({ message: 'Usuario creado exitosamente', type: 'success' });
    }

    setUsername('');
    setPassword('');
    setName('');
    setRole('vendedor');
    setError('');
    setIsModalOpen(false);
  };

  const handleEdit = (user: UserType) => {
    setIsEditing(user.id);
    setUsername(user.username);
    setName(user.name);
    setRole(user.role);
    setPassword(''); // Don't show password, only update if typed
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(null);
    setUsername('');
    setPassword('');
    setName('');
    setRole('vendedor');
    setError('');
  };

  const handleDeleteClick = (id: string) => {
    if (id === currentUser.id) {
      setNotification({ message: 'No puedes eliminar tu propio usuario', type: 'error' });
      return;
    }
    setUserToDelete(id);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setUserToDelete(null);
      setNotification({ message: 'Usuario eliminado exitosamente', type: 'success' });
    }
  };

  const getRoleIcon = (r: Role) => {
    switch (r) {
      case 'admin': return <Shield size={16} className="text-purple-600" />;
      case 'vendedor': return <User size={16} className="text-emerald-600" />;
      case 'despachador': return <Truck size={16} className="text-emerald-600" />;
    }
  };

  const getRoleLabel = (r: Role) => {
    switch (r) {
      case 'admin': return 'Administrador';
      case 'vendedor': return 'Vendedor';
      case 'despachador': return 'Despachador';
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-slate-500">
        No tienes permisos para acceder a esta sección.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 relative">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-4 fade-in duration-300 ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 text-red-600 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Eliminar Usuario</h3>
            </div>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar este usuario? 
              <strong className="block mt-2 text-red-600">Esta acción no se puede deshacer.</strong>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
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

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Usuarios</h2>
          <p className="text-slate-500 text-sm">Gestión de accesos y roles del sistema</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2 uppercase tracking-widest text-xs"
        >
          <UserPlus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {/* USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <UserPlus size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                  {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSave} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Usuario (Login)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                    placeholder="Ej. jperez"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Contraseña {isEditing && <span className="text-slate-400 font-normal">(Dejar en blanco para mantener)</span>}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                    placeholder="********"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rol</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-bold text-slate-700"
                  >
                    <option value="vendedor">Vendedor (Solo Ventas)</option>
                    <option value="despachador">Despachador (Ver Ventas)</option>
                    <option value="admin">Administrador (Acceso Total)</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-1/3 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 uppercase tracking-widest text-xs"
                  >
                    {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Lista de Usuarios</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u: UserType) => (
              <div key={u.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-emerald-300 transition-colors bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                    {getRoleIcon(u.role)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{u.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">@{u.username}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                        {getRoleLabel(u.role)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(u)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(u.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                    disabled={u.id === currentUser.id}
                  >
                    <Trash2 size={18} className={u.id === currentUser.id ? 'opacity-50' : ''} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
