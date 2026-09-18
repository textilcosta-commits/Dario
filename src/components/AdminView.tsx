import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Save, 
  Check, 
  AlertTriangle, 
  Settings, 
  FileText, 
  Bell, 
  Download, 
  RotateCcw,
  ExternalLink,
  Search,
  Eye
} from 'lucide-react';
import { Product, NewsItem, CompanySettings, OrderRequest, OrderItem, OrderStatus, AvailabilityStatus, FabricType, ReplacementType } from '../types';
import { dataService } from '../services/dataService';
import { AvailabilityBadge } from './AvailabilityBadge';

interface AdminViewProps {
  products: Product[];
  news: NewsItem[];
  settings: CompanySettings;
  onRefreshData: () => void;
  onSelectProduct: (product: Product) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  products,
  news,
  settings,
  onRefreshData,
  onSelectProduct,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'orders' | 'news' | 'settings'>('products');
  const [searchQuery, setSearchQuery] = useState('');

  // Estado para edición/creación de producto
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Estado para gestión de reemplazos en producto
  const [replacingProductId, setReplacingProductId] = useState<string | null>(null);
  const [selectedReplacementTarget, setSelectedReplacementTarget] = useState<string>('');
  const [replacementReason, setReplacementReason] = useState<string>('');
  const [replacementType, setReplacementType] = useState<ReplacementType>('exacto');

  // Estado para nueva novedad
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsType, setNewNewsType] = useState<string>('nuevo_ingreso');
  const [newNewsDesc, setNewNewsDesc] = useState('');
  const [newNewsImage, setNewNewsImage] = useState('https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80');

  // Estado de configuración de empresa
  const [configSettings, setConfigSettings] = useState<CompanySettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Solicitudes recibidas
  const orders: OrderRequest[] = dataService.getOrdersSync();

  // Filtrado de productos en admin
  const filteredProducts = products.filter(p => 
    p.articleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.composition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Guardar o Actualizar Producto
  const handleSaveProduct = () => {
    if (!editingProduct?.articleCode || !editingProduct?.name) {
      alert('Por favor completá al menos el código de artículo y el nombre.');
      return;
    }

    if (isCreatingProduct) {
      dataService.createProduct({
        articleCode: editingProduct.articleCode,
        name: editingProduct.name,
        category: (editingProduct.category as any) || 'Camisería',
        fabricType: (editingProduct.fabricType as FabricType) || 'Poplín',
        composition: editingProduct.composition || '100% Algodón',
        color: editingProduct.color || 'Blanco',
        colorFamily: editingProduct.colorFamily || 'Blanco / Marfil',
        width: editingProduct.width || '1.50 m',
        origin: editingProduct.origin || 'Perú',
        yarnCount: editingProduct.yarnCount || '100/2',
        weightGsm: editingProduct.weightGsm || '120 g/m²',
        availabilityStatus: (editingProduct.availabilityStatus as any) || 'disponible',
        availableMeters: Number(editingProduct.availableMeters) || 50,
        imageUrl: editingProduct.imageUrl || 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80',
        description: editingProduct.description || 'Tela de alta calidad para confección.',
        isFeatured: Boolean(editingProduct.isFeatured),
        isNew: Boolean(editingProduct.isNew),
        isDiscontinued: editingProduct.availabilityStatus === 'dado_de_baja',
        tags: editingProduct.tags || ['camisería', 'algodón'],
        replacements: [],
      });
    } else if (editingProduct.id) {
      dataService.updateProduct(editingProduct.id, {
        ...editingProduct,
        isDiscontinued: editingProduct.availabilityStatus === 'dado_de_baja',
      });
    }

    setEditingProduct(null);
    setIsCreatingProduct(false);
    onRefreshData();
  };

  // Agregar reemplazo a artículo
  const handleAddReplacement = (productId: string) => {
    if (!selectedReplacementTarget) {
      alert('Seleccioná un artículo de destino para el reemplazo.');
      return;
    }

    dataService.addReplacementRule(
      productId,
      selectedReplacementTarget,
      replacementType as any,
      replacementReason.trim() || 'Alternativa recomendada con stock disponible'
    );

    setReplacingProductId(null);
    setSelectedReplacementTarget('');
    setReplacementReason('');
    onRefreshData();
  };

  // Crear Novedad
  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsTitle.trim() || !newNewsDesc.trim()) return;

    dataService.createNewsItem({
      title: newNewsTitle.trim(),
      description: newNewsDesc.trim(),
      content: newNewsDesc.trim(),
      imageUrl: newNewsImage.trim(),
      type: newNewsType as any,
      published: true,
    });

    setNewNewsTitle('');
    setNewNewsDesc('');
    onRefreshData();
  };

  // Guardar Configuración
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.saveCompanySettings(configSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
    onRefreshData();
  };

  // Exportar Catálogo JSON (Section 28)
  const handleExportJson = () => {
    const data = {
      catalog: products,
      news: news,
      orders: orders,
      settings: settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `costa-textil-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cabecera Admin */}
      <div className="border-b border-stone-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1A3644]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Panel de Gestión Costa Textil · Modo Administrador</span>
          </div>
          <h1 className="font-serif-luxury text-3xl font-bold text-stone-900 mt-1">
            Administración de Catálogo, Reemplazos y Pedidos
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Actualizá stock en tiempo real, asigná artículos de reemplazo para telas agotadas y revisá las solicitudes de pedido de clientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors border border-stone-300"
            title="Exportar respaldo JSON para base de datos"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar JSON</span>
          </button>

          <button
            onClick={() => {
              if (confirm('¿Restaurar datos de demostración iniciales de Costa Textil?')) {
                dataService.resetToDemo();
                onRefreshData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors border border-rose-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Demo</span>
          </button>
        </div>
      </div>

      {/* Navegación por Sub-Pestañas */}
      <div className="flex border-b border-stone-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('products')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'products'
              ? 'border-[#1A3644] text-[#1A3644]'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Artículos &amp; Reemplazos ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'orders'
              ? 'border-[#1A3644] text-[#1A3644]'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Solicitudes de Pedido ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('news')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'news'
              ? 'border-[#1A3644] text-[#1A3644]'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Novedades &amp; Comunicados ({news.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'settings'
              ? 'border-[#1A3644] text-[#1A3644]'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Datos de la Empresa</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. GESTIÓN DE ARTÍCULOS Y REEMPLAZOS */}
      {/* ============================================================== */}
      {activeSubTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar artículo por código o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-[#1A3644]"
              />
            </div>

            <button
              onClick={() => {
                setIsCreatingProduct(true);
                setEditingProduct({
                  articleCode: '19.',
                  name: '',
                  category: 'Camisería',
                  fabricType: 'Poplín',
                  composition: '100% Algodón',
                  color: '',
                  colorFamily: 'Blanco / Marfil',
                  width: '1.50 m',
                  origin: 'Perú',
                  yarnCount: '100/2',
                  weightGsm: '120 g/m²',
                  availabilityStatus: 'disponible',
                  availableMeters: 50,
                  imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80',
                  description: '',
                  isFeatured: false,
                  isNew: true,
                });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A3644] text-white text-xs font-semibold rounded-xl hover:bg-[#254A5E] shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Cargar Nuevo Artículo</span>
            </button>
          </div>

          {/* Tabla de Artículos */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] border-b border-stone-200 text-stone-600 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Artículo</th>
                    <th className="p-3">Nombre &amp; Composición</th>
                    <th className="p-3">Tipo / Origen</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Stock (m)</th>
                    <th className="p-3">Reemplazos</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-stone-900 whitespace-nowrap">
                        Art. {p.articleCode}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-stone-900">{p.name}</div>
                        <div className="text-stone-500">{p.composition} · {p.color}</div>
                      </td>
                      <td className="p-3 text-stone-600">
                        <div>{p.fabricType}</div>
                        <div className="text-[11px] text-stone-400">{p.origin}</div>
                      </td>
                      <td className="p-3">
                        <AvailabilityBadge status={p.availabilityStatus} />
                      </td>
                      <td className="p-3 font-mono font-semibold text-stone-700">
                        {p.availableMeters ? `${p.availableMeters} m` : '—'}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setReplacingProductId(p.id)}
                          className="text-xs font-semibold text-[#8C5D39] hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{(p.replacements?.length || 0)} asignados</span>
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => onSelectProduct(p)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded"
                          title="Ver ficha pública"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setIsCreatingProduct(false);
                            setEditingProduct({ ...p });
                          }}
                          className="p-1.5 text-stone-600 hover:text-[#1A3644] hover:bg-stone-100 rounded"
                          title="Editar datos"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar definitivamente el artículo ${p.articleCode}?`)) {
                              dataService.deleteProduct(p.id);
                              onRefreshData();
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Eliminar artículo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL DE EDICIÓN / CREACIÓN DE PRODUCTO */}
      {/* ============================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="font-serif-luxury text-xl font-bold text-stone-900 border-b border-stone-200 pb-3">
              {isCreatingProduct ? 'Cargar Nuevo Artículo' : `Editar Art. ${editingProduct.articleCode}`}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Código de Artículo *</label>
                <input
                  type="text"
                  value={editingProduct.articleCode || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, articleCode: e.target.value }))}
                  placeholder="Ej: 17.154"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Nombre Comercial *</label>
                <input
                  type="text"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Algodón Pima Peruano"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Categoría</label>
                <select
                  value={editingProduct.category || 'Camisería'}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="Camisería">Camisería</option>
                  <option value="Sastrería">Sastrería</option>
                  <option value="Ambos">Ambos</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Tipo de Tela</label>
                <input
                  type="text"
                  value={editingProduct.fabricType || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, fabricType: e.target.value as FabricType }))}
                  placeholder="Ej: Poplín, Oxford, Twill, Lino..."
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Composición Exacta</label>
                <input
                  type="text"
                  value={editingProduct.composition || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, composition: e.target.value }))}
                  placeholder="Ej: 100% Algodón Pima"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Color / Variedad</label>
                <input
                  type="text"
                  value={editingProduct.color || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Ej: Blanco Óptico"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Gama Cromática</label>
                <select
                  value={editingProduct.colorFamily || 'Blanco / Marfil'}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, colorFamily: e.target.value }))}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="Blanco / Marfil">Blanco / Marfil</option>
                  <option value="Celeste / Azul">Celeste / Azul</option>
                  <option value="Rayados / Listados">Rayados / Listados</option>
                  <option value="Gris / Negro">Gris / Negro</option>
                  <option value="Tierra / Beige">Tierra / Beige</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Origen</label>
                <input
                  type="text"
                  value={editingProduct.origin || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="Ej: Perú, Italia, Suiza..."
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Estado de Disponibilidad</label>
                <select
                  value={editingProduct.availabilityStatus || 'disponible'}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, availabilityStatus: e.target.value as any }))}
                  className="w-full p-2 border rounded-lg bg-white font-medium"
                >
                  <option value="disponible">🟢 Disponible</option>
                  <option value="poco_stock">🟡 Poco stock</option>
                  <option value="agotado">🔴 Agotado</option>
                  <option value="dado_de_baja">⚫ Dado de baja</option>
                  <option value="consultar">⚪ Consultar</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Metros Disponibles</label>
                <input
                  type="number"
                  value={editingProduct.availableMeters || 0}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, availableMeters: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 block mb-1">URL de Imagen</label>
                <input
                  type="text"
                  value={editingProduct.imageUrl || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full p-2 border rounded-lg text-stone-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 block mb-1">Descripción y Características Sartoriales</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.isFeatured)}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  />
                  <span>Destacado en Portada</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.isNew)}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, isNew: e.target.checked }))}
                  />
                  <span>Etiqueta NUEVO</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsCreatingProduct(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveProduct}
                className="px-5 py-2 text-xs font-semibold bg-[#1A3644] text-white rounded-lg hover:bg-[#254A5E]"
              >
                Guardar Artículo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL PARA ASIGNAR REEMPLAZOS A UN ARTÍCULO (Section 11, 25) */}
      {/* ============================================================== */}
      {replacingProductId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                Asignar Reemplazo a Art. {products.find(p => p.id === replacingProductId)?.articleCode}
              </h3>
              <button onClick={() => setReplacingProductId(null)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <p className="text-xs text-stone-600">
              Seleccioná qué tela activa actuará como alternativa recomendada cuando este artículo esté agotado o dado de baja.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Tela de Reemplazo (con stock):</label>
                <select
                  value={selectedReplacementTarget}
                  onChange={(e) => setSelectedReplacementTarget(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="">-- Seleccionar artículo sustituto --</option>
                  {products
                    .filter(p => p.id !== replacingProductId && p.availabilityStatus !== 'dado_de_baja')
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        Art. {p.articleCode} - {p.name} ({p.composition}, {p.color})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Tipo de Relación:</label>
                <select
                  value={replacementType}
                  onChange={(e) => setReplacementType(e.target.value as ReplacementType)}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="exacto">Reemplazo exacto</option>
                  <option value="similar">Similar</option>
                  <option value="alternativa">Alternativa</option>
                  <option value="alternativa_premium">Alternativa premium</option>
                  <option value="color_similar">Color similar</option>
                  <option value="misma_composicion">Misma composición</option>
                  <option value="mismo_tipo">Mismo tipo</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Motivo explícito para el cliente:</label>
                <input
                  type="text"
                  placeholder="Ej: Misma textura y caída · 100% algodón disponible en stock"
                  value={replacementReason}
                  onChange={(e) => setReplacementReason(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                onClick={() => setReplacingProductId(null)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAddReplacement(replacingProductId)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#8C5D39] text-white rounded-lg hover:bg-[#774D2E]"
              >
                Vincular Reemplazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. REGISTRO DE SOLICITUDES DE PEDIDO (Section 26) */}
      {/* ============================================================== */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
              Solicitudes Recibidas ({orders.length})
            </h2>
            <span className="text-xs text-stone-500">
              Historial de pedidos enviados por clientes para cotización y corte.
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-stone-200 text-center text-xs text-stone-500">
              Aún no se han recibido solicitudes de pedido. Cuando los clientes envíen un pedido desde la web o WhatsApp, quedará registrado aquí.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                        #{ord.id}
                      </span>
                      <span className="text-sm font-bold text-stone-900 ml-2">
                        {ord.customerName}
                      </span>
                      {ord.company && (
                        <span className="text-xs text-stone-500 ml-1">
                          ({ord.company})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400">
                        {new Date(ord.createdAt).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <select
                        value={ord.status}
                        onChange={(e) => {
                          dataService.updateOrderStatus(ord.id, e.target.value as OrderStatus);
                          onRefreshData();
                        }}
                        className="text-xs font-semibold py-1 px-2 rounded border bg-stone-50"
                      >
                        <option value="nuevo">Nuevo / Pendiente</option>
                        <option value="en_revision">En Revisión</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="parcial">Parcial</option>
                        <option value="sin_disponibilidad">Sin Stock</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-stone-600">
                    <div><strong>Teléfono:</strong> {ord.phone}</div>
                    <div><strong>Localidad:</strong> {ord.location}</div>
                    <div><strong>Metraje total:</strong> {ord.items.reduce((sum: number, it: OrderItem) => sum + (it.meters || 0), 0)} m</div>
                  </div>

                  {/* Listado de telas */}
                  <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 space-y-1 text-xs">
                    <span className="font-semibold text-stone-800 block text-[11px] uppercase tracking-wider">
                      Detalle de telas solicitadas:
                    </span>
                    {ord.items.map((it: OrderItem, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-stone-700">
                        <span>• Art. {it.articleCode} - {it.name} ({it.color})</span>
                        <span className="font-mono font-bold">{it.meters} metros</span>
                      </div>
                    ))}
                  </div>

                  {ord.notes && (
                    <div className="text-xs text-stone-500 italic">
                      Observación: "{ord.notes}"
                    </div>
                  )}

                  {/* Contacto rápido WhatsApp */}
                  <div className="flex justify-end pt-1">
                    <a
                      href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hola ${ord.customerName}, te escribimos de Costa Textil con respecto a tu solicitud #${ord.id}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>Responder al cliente por WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. GESTIÓN DE NOVEDADES (Section 27) */}
      {/* ============================================================== */}
      {activeSubTab === 'news' && (
        <div className="space-y-6">
          {/* Formulario de nueva novedad */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-serif-luxury text-base font-bold text-stone-900">
              Publicar Nueva Novedad o Comunicado
            </h3>

            <form onSubmit={handleCreateNews} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Título</label>
                  <input
                    type="text"
                    placeholder="Ej: Ingreso especial de Algodón Pima 120/2..."
                    value={newNewsTitle}
                    onChange={(e) => setNewNewsTitle(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Tipo de Novedad</label>
                  <select
                    value={newNewsType}
                    onChange={(e) => setNewNewsType(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="nuevo_ingreso">🆕 Nuevo ingreso</option>
                    <option value="reposicion">🔄 Reposición</option>
                    <option value="baja">🔻 Artículo dado de baja</option>
                    <option value="comunicado">📢 Comunicado oficial</option>
                    <option value="coleccion">✨ Colección</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Descripción / Comunicado</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre el lote, características o aviso para clientes..."
                  value={newNewsDesc}
                  onChange={(e) => setNewNewsDesc(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A3644] text-white font-semibold rounded-xl hover:bg-[#254A5E]"
                >
                  Publicar Novedad
                </button>
              </div>
            </form>
          </div>

          {/* Listado de novedades */}
          <div className="space-y-3">
            {news.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-stone-200 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8C5D39] block">
                    {item.type} · {new Date(item.createdAt).toLocaleDateString('es-AR')}
                  </span>
                  <h4 className="font-bold text-stone-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-stone-500 line-clamp-1">{item.description}</p>
                </div>

                <button
                  onClick={() => {
                    dataService.deleteNews(item.id);
                    onRefreshData();
                  }}
                  className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. CONFIGURACIÓN DE EMPRESA (Section 28) */}
      {/* ============================================================== */}
      {activeSubTab === 'settings' && (
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs max-w-2xl space-y-5">
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
              Datos Institucionales &amp; Contacto de Costa Textil
            </h3>
            <p className="text-xs text-stone-500">
              Esta información se refleja en el encabezado, footer, modales y enlaces de WhatsApp.
            </p>
          </div>

          {settingsSaved && (
            <div className="p-3 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-semibold">
              ✓ ¡Datos de la empresa actualizados exitosamente!
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Nombre Comercial</label>
              <input
                type="text"
                value={configSettings.companyName}
                onChange={(e) => setConfigSettings(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Slogan Oficial</label>
              <input
                type="text"
                value={configSettings.slogan}
                onChange={(e) => setConfigSettings(prev => ({ ...prev, slogan: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">WhatsApp (formato internacional sin signos)</label>
                <input
                  type="text"
                  value={configSettings.whatsappNumber}
                  onChange={(e) => setConfigSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  placeholder="5491138401234"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">WhatsApp Visible</label>
                <input
                  type="text"
                  value={configSettings.whatsappDisplay}
                  onChange={(e) => setConfigSettings(prev => ({ ...prev, whatsappDisplay: e.target.value }))}
                  placeholder="+54 9 11 3840-1234"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Dirección Showroom</label>
                <input
                  type="text"
                  value={configSettings.address}
                  onChange={(e) => setConfigSettings(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Piso / Oficina</label>
                <input
                  type="text"
                  value={configSettings.addressFloorOffice}
                  onChange={(e) => setConfigSettings(prev => ({ ...prev, addressFloorOffice: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Horario de Atención</label>
              <input
                type="text"
                value={configSettings.businessHours}
                onChange={(e) => setConfigSettings(prev => ({ ...prev, businessHours: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1A3644] text-white font-semibold rounded-xl text-xs hover:bg-[#254A5E] shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
