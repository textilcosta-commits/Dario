import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  X, 
  Search, 
  SlidersHorizontal, 
  RefreshCw, 
  Sparkles, 
  Check, 
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { Product, FilterState } from '../types';
import { ProductCard } from './ProductCard';

interface CatalogViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  initialFilter?: Partial<FilterState>;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  onSelectProduct,
  initialFilter,
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: initialFilter?.searchQuery || '',
    category: initialFilter?.category || 'Todos',
    composition: initialFilter?.composition || 'Todos',
    fabricType: initialFilter?.fabricType || 'Todos',
    origin: initialFilter?.origin || 'Todos',
    availability: initialFilter?.availability || 'Todos',
    colorFamily: initialFilter?.colorFamily || 'Todos',
    onlyFeatured: initialFilter?.onlyFeatured || false,
    onlyNew: initialFilter?.onlyNew || false,
    sortBy: 'relevance',
  });

  // Extracción dinámica de opciones únicas presentes en los datos
  const categories = ['Todos', 'Camisería', 'Sastrería', 'Ambos'];
  const fabricTypes = ['Todos', 'Oxford', 'Poplín', 'Batista', 'Twill', 'Jacquard', 'Lino', 'Sastrería', 'Seersucker', 'Gabardina'];
  const origins = ['Todos', 'Perú', 'Italia', 'Suiza', 'Inglaterra', 'Brasil', 'China'];
  const compositions = ['Todos', '100% Algodón', '100% Lino', 'Algodón Pima', 'Elastano', 'Lana'];
  const availabilities = [
    { value: 'Todos', label: 'Todos los estados' },
    { value: 'disponible', label: '🟢 Solo disponibles' },
    { value: 'poco_stock', label: '🟡 Poco stock' },
    { value: 'agotado', label: '🔴 Agotados (ver reemplazos)' },
    { value: 'dado_de_baja', label: '⚫ Dados de baja' },
  ];
  const colorFamilies = ['Todos', 'Blanco / Marfil', 'Celeste / Azul', 'Rayados / Listados', 'Gris / Negro', 'Tierra / Beige'];

  // Filtrado reactivo de productos
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Búsqueda por texto (código, nombre, tipo, composición, color, origen)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const codeClean = item.articleCode.toLowerCase().replace(/[^0-9a-z]/g, '');
        const qClean = q.replace(/[^0-9a-z]/g, '');

        const matchCode = item.articleCode.toLowerCase().includes(q) || (qClean.length > 2 && codeClean.includes(qClean));
        const matchName = item.name.toLowerCase().includes(q);
        const matchComp = item.composition.toLowerCase().includes(q);
        const matchType = item.fabricType.toLowerCase().includes(q);
        const matchColor = item.color.toLowerCase().includes(q);
        const matchOrigin = item.origin.toLowerCase().includes(q);
        const matchTags = item.tags.some(t => t.toLowerCase().includes(q));

        if (!matchCode && !matchName && !matchComp && !matchType && !matchColor && !matchOrigin && !matchTags) {
          return false;
        }
      }

      // 2. Filtro Categoría
      if (filters.category !== 'Todos') {
        if (filters.category === 'Camisería' && item.category !== 'Camisería' && item.category !== 'Ambos') return false;
        if (filters.category === 'Sastrería' && item.category !== 'Sastrería' && item.category !== 'Ambos') return false;
      }

      // 3. Filtro Tipo de Tela
      if (filters.fabricType !== 'Todos' && item.fabricType !== filters.fabricType) {
        return false;
      }

      // 4. Filtro Origen
      if (filters.origin !== 'Todos' && item.origin !== filters.origin) {
        return false;
      }

      // 5. Filtro Composición
      if (filters.composition !== 'Todos') {
        if (!item.composition.toLowerCase().includes(filters.composition.toLowerCase().replace('100%', '').trim())) {
          return false;
        }
      }

      // 6. Filtro Disponibilidad
      if (filters.availability !== 'Todos' && item.availabilityStatus !== filters.availability) {
        return false;
      }

      // 7. Filtro Color
      if (filters.colorFamily !== 'Todos' && item.colorFamily !== filters.colorFamily) {
        return false;
      }

      // 8. Switches rápidos
      if (filters.onlyFeatured && !item.isFeatured) return false;
      if (filters.onlyNew && !item.isNew) return false;

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'code_asc') return a.articleCode.localeCompare(b.articleCode);
      if (filters.sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (filters.sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0; // relevancia natural
    });
  }, [products, filters]);

  const activeFiltersCount = [
    filters.category !== 'Todos',
    filters.fabricType !== 'Todos',
    filters.origin !== 'Todos',
    filters.composition !== 'Todos',
    filters.availability !== 'Todos',
    filters.colorFamily !== 'Todos',
    filters.onlyFeatured,
    filters.onlyNew,
    filters.searchQuery.length > 0,
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'Todos',
      composition: 'Todos',
      fabricType: 'Todos',
      origin: 'Todos',
      availability: 'Todos',
      colorFamily: 'Todos',
      onlyFeatured: false,
      onlyNew: false,
      sortBy: 'relevance',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Título y Cabecera del Catálogo */}
      <div className="border-b border-[#ECEAE3] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#8C5D39]">
            <span>Catálogo Completo</span>
            <span>·</span>
            <span className="text-stone-500">Costa Textil Buenos Aires</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            Telas para Camisería &amp; Sastrería
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Explorá nuestra selección de hilados nobles, algodones pima, linajes puros y paños importados. Cada artículo cuenta con especificación de ancho, título y estado de stock.
          </p>
        </div>

        {/* Barra de búsqueda y control móvil */}
        <div className="flex items-center gap-2">
          <button
            id="mobile-filter-btn"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-semibold shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#1A3644]" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#1A3644] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Ordenar */}
          <div className="flex items-center gap-2 text-xs text-stone-600 bg-white border border-stone-200 rounded-xl px-3 py-2">
            <span className="hidden sm:inline text-stone-500">Ordenar:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="relevance">Relevancia</option>
              <option value="code_asc">Código (Asc)</option>
              <option value="name_asc">Nombre (A-Z)</option>
              <option value="newest">Más recientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Activos y Buscador Superior */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF9F6] p-3 rounded-xl border border-[#ECEAE3]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="catalog-filter-search"
            type="text"
            placeholder="Filtrar por código, composición, color o nombre..."
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full text-xs sm:text-sm pl-9 pr-8 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#1A3644]"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-stone-600 shrink-0">
          <span className="font-semibold text-stone-900">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'artículo encontrado' : 'artículos encontrados'}
          </span>
          {activeFiltersCount > 0 && (
            <button
              id="clear-filters-btn"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-[#8C5D39] hover:underline font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Contenedor Principal: Sidebar Filtros Desktop + Grid de Productos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ============================================================== */}
        {/* SIDEBAR FILTROS (DESKTOP) */}
        {/* ============================================================== */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-2xl border border-[#ECEAE3] space-y-6 sticky top-28">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#1A3644]" />
              <span>Filtros Específicos</span>
            </h3>
            {activeFiltersCount > 0 && (
              <span className="text-[11px] font-semibold text-[#8C5D39]">
                {activeFiltersCount} activos
              </span>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">Categoría</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    filters.category === cat
                      ? 'bg-[#1A3644] text-white font-medium'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de Tela */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">Tipo de Tela</label>
            <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-1">
              {fabricTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilters(prev => ({ ...prev, fabricType: type }))}
                  className={`text-left text-xs px-2 py-1 rounded transition-colors truncate ${
                    filters.fabricType === type
                      ? 'bg-[#1A3644] text-white font-medium'
                      : 'hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">Disponibilidad</label>
            <div className="space-y-1">
              {availabilities.map(av => (
                <button
                  key={av.value}
                  onClick={() => setFilters(prev => ({ ...prev, availability: av.value }))}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded transition-colors flex items-center justify-between ${
                    filters.availability === av.value
                      ? 'bg-[#FAF3EC] text-[#8C5D39] font-bold border border-[#E8DFC8]'
                      : 'hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <span>{av.label}</span>
                  {filters.availability === av.value && <Check className="w-3.5 h-3.5 text-[#8C5D39]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Origen */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">Origen</label>
            <div className="flex flex-wrap gap-1.5">
              {origins.map(orig => (
                <button
                  key={orig}
                  onClick={() => setFilters(prev => ({ ...prev, origin: orig }))}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    filters.origin === orig
                      ? 'bg-[#1A3644] text-white font-medium'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {orig}
                </button>
              ))}
            </div>
          </div>

          {/* Composición Base */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">Composición</label>
            <div className="flex flex-wrap gap-1.5">
              {compositions.map(comp => (
                <button
                  key={comp}
                  onClick={() => setFilters(prev => ({ ...prev, composition: comp }))}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    filters.composition === comp
                      ? 'bg-[#1A3644] text-white font-medium'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {comp}
                </button>
              ))}
            </div>
          </div>

          {/* Gama Cromática */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">Gama de Color</label>
            <div className="space-y-1">
              {colorFamilies.map(cf => (
                <button
                  key={cf}
                  onClick={() => setFilters(prev => ({ ...prev, colorFamily: cf }))}
                  className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${
                    filters.colorFamily === cf
                      ? 'bg-[#1A3644] text-white font-semibold'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {cf}
                </button>
              ))}
            </div>
          </div>

          {/* Destacados / Nuevos Switches */}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 font-medium">
              <input
                type="checkbox"
                checked={filters.onlyFeatured}
                onChange={(e) => setFilters(prev => ({ ...prev, onlyFeatured: e.target.checked }))}
                className="rounded text-[#1A3644] focus:ring-[#1A3644]"
              />
              <span>Solo destacados</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 font-medium">
              <input
                type="checkbox"
                checked={filters.onlyNew}
                onChange={(e) => setFilters(prev => ({ ...prev, onlyNew: e.target.checked }))}
                className="rounded text-[#1A3644] focus:ring-[#1A3644]"
              />
              <span>Solo nuevos ingresos</span>
            </label>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* GRID DE PRODUCTOS */}
        {/* ============================================================== */}
        <div className="lg:col-span-9 space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 text-stone-500 flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif-luxury text-xl font-bold text-stone-800">
                No encontramos artículos con esos filtros
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                Probá ampliando los criterios de búsqueda, seleccionando "Todos" en disponibilidad o usando nuestro buscador inteligente de alternativas.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-[#1A3644] text-white text-xs font-semibold rounded-lg hover:bg-[#274B5E]"
                >
                  Restablecer todos los filtros
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}

          {/* Banner pie de catálogo */}
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAE3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
            <span>
              ¿Buscás una tela específica o asesoramiento sobre rendimientos de camisería?
            </span>
            <a
              href="https://wa.me/5491138401234?text=Hola%20Costa%20Textil,%20quisiera%20asesoramiento%20sobre%20telas%20de%20camiseria."
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#1A3644] hover:underline shrink-0"
            >
              Consultar a un asesor por WhatsApp →
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL / DRAWER DE FILTROS EN MOBILE */}
      {/* ============================================================== */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-full max-w-sm bg-white h-full overflow-y-auto p-5 space-y-6 flex flex-col justify-between animate-in slide-in-from-right">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="font-bold text-stone-900 text-base">Filtros del Catálogo</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categoría */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">Categoría</label>
                <div className="flex flex-wrap gap-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                      className={`text-xs px-2.5 py-1 rounded-md ${
                        filters.category === cat ? 'bg-[#1A3644] text-white font-medium' : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disponibilidad */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">Disponibilidad</label>
                <div className="space-y-1">
                  {availabilities.map(av => (
                    <button
                      key={av.value}
                      onClick={() => setFilters(prev => ({ ...prev, availability: av.value }))}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded flex items-center justify-between ${
                        filters.availability === av.value ? 'bg-[#FAF3EC] text-[#8C5D39] font-bold' : 'text-stone-600 bg-stone-50'
                      }`}
                    >
                      <span>{av.label}</span>
                      {filters.availability === av.value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de Tela */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">Tipo de Tela</label>
                <div className="grid grid-cols-2 gap-1">
                  {fabricTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setFilters(prev => ({ ...prev, fabricType: type }))}
                      className={`text-left text-xs px-2 py-1 rounded truncate ${
                        filters.fabricType === type ? 'bg-[#1A3644] text-white font-medium' : 'bg-stone-50 text-stone-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs"
              >
                Limpiar
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#1A3644] text-white font-semibold text-xs"
              >
                Ver {filteredProducts.length} telas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
