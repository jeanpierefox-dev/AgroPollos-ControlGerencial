import React, { useState, useRef } from 'react';
import { Save, Upload, Trash2, AlertTriangle } from 'lucide-react';

interface ConfiguracionProps {
  store: any;
}

export function Configuracion({ store }: ConfiguracionProps) {
  const { appConfig, updateAppConfig, resetStore } = store;
  const [appName, setAppName] = useState(appConfig.appName);
  const [logoBase64, setLogoBase64] = useState<string | null>(appConfig.logo);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateAppConfig({
      appName,
      logo: logoBase64,
    });
    alert('Configuración guardada exitosamente.');
  };

  const handleReset = () => {
    if (window.confirm('¿Está absolutamente seguro de que desea restablecer todo el sistema? Esta acción eliminará todos los ingresos y ventas de forma permanente.')) {
      resetStore();
      setShowResetConfirm(false);
      alert('El sistema ha sido restablecido a sus valores de fábrica.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Configuración del Sistema</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Personalización de la Aplicación</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre de la Aplicación
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: AgroPollos"
              />
              <p className="text-sm text-slate-500 mt-1">
                Este nombre aparecerá en la pestaña del navegador y en el menú principal.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Logo Corporativo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {logoBase64 ? (
                    <img src={logoBase64} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-slate-400 text-sm">Sin logo</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Upload size={18} />
                    Subir Logo
                  </button>
                  {logoBase64 && (
                    <button
                      onClick={() => setLogoBase64(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} />
                      Eliminar Logo
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Se recomienda una imagen cuadrada (PNG o JPG). También se usará como favicon.
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Save size={20} />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-red-700">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-semibold">Zona de Peligro</h3>
          </div>
          <p className="text-slate-700 mb-4">
            Restablecer el sistema a sus valores de fábrica eliminará permanentemente todos los registros de ingresos y ventas. Esta acción no se puede deshacer.
          </p>
          
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Restablecer a Fábrica
            </button>
          ) : (
            <div className="bg-white p-4 rounded-lg border border-red-200 flex items-center justify-between">
              <span className="font-medium text-red-700">¿Estás seguro?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Sí, eliminar todo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
