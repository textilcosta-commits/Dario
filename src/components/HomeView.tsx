import React, { useState } from 'react';
import { 
  ArrowRight, 
  Search, 
  Sparkles, 
  ShoppingBag, 
  CheckCircle2, 
  RefreshCw, 
  Scissors, 
  Truck, 
  ShieldCheck, 
  Layers, 
  MapPin, 
  Calendar,
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import { Product, NewsItem, CompanySettings } from '../types';
import { ProductCard } from './ProductCard';

interface HomeViewProps {
  products: Product[];
  news: NewsItem[];
  settings: CompanySettings;
  onNavigate: (tab: string) => void;
  onSelectProduct: (product: Product) => void;
  onSearchQuery: (query: string) => void;
  onOpenReplacementFinder: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  news,
  settings,
  onNavigate,
  onSelectProduct,
  onSearchQuery,
  onOpenReplacementFinder,
}) => {
  const [quickInput, setQuickInput] = useState('');

  const featuredProducts = products.filter(p => p.isFeatured && !p.isDiscontinued).slice(0, 4);
  const newProducts = products.filter(p => p.isNew && !p.isDiscontinued).slice(0, 3);
  const recentNews = news.filter(n => n.published).slice(0, 3);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onSearchQuery(quickInput.trim());
      onNavigate('buscar');
    }
  };

  const quickSearchTags = [
    'Algodón Pima',
    'Lino Italiano',
    'Poplín 120/2',
    'Art. 17.154',
    'Oxford Celeste',
    'Lana Fría 130s',
    'Blanco Óptico'
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* ============================================================== */}
      {/* 1. HERO PRINCIPAL */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F4F1EA] via-[#F8F7F3] to-[#FBFBF9] border-b border-[#E5E2DA] pt-12 pb-16 sm:pt-16 sm:pb-24">
        {/* Patrón sutil textil en background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#1A3644 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#DBD7CE] text-xs font-semibold tracking-wider text-[#1A3644] uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#1A3644]" />
              Especialistas en Camisería &amp; Sastrería de Alta Gama
            </div>

            <h1 className="font-serif-luxury text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1A2228] leading-[1.1]">
              Costa Textil
            </h1>

            <p className="font-serif-luxury text-lg sm:text-xl md:text-2xl text-[#8C5D39] font-medium italic">
              "{settings.slogan}"
            </p>

            <p className="text-base sm:text-lg text-[#55636E] max-w-2xl mx-auto leading-relaxed">
              Telas para camisería y sastrería. Encontrá el artículo indicado para tu proyecto, consultá stock en tiempo real y armá tu solicitud de pedido.
            </p>

            {/* Botones de acción principales */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="hero-explore-catalog"
                onClick={() => onNavigate('catalogo')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white bg-[#1A3644] hover:bg-[#254A5E] shadow-sm transition-all"
              >
                <span>Explorar catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-build-order"
                onClick={() => onNavigate('pedido')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-[#1A3644] bg-white hover:bg-[#F2EFE9] border border-[#DBD7CE] shadow-xs transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-[#1A3644]" />
                <span>Armar pedido</span>
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* BUSCADOR GRANDE INTEGRADO EN HERO */}
          {/* ============================================================== */}
          <div className="mt-12 max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center shadow-md rounded-2xl bg-white border border-[#D5D0C5] overflow-hidden focus-within:border-[#1A3644] focus-within:ring-2 focus-within:ring-[#1A3644]/15 transition-all">
                <Search className="w-5 h-5 text-stone-400 ml-4 shrink-0" />
                <input
                  id="hero-search-input"
                  type="text"
                  placeholder="Buscá por artículo, color, composición, tipo de tela..."
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  className="w-full py-4 px-3 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="mr-2 px-4 py-2 bg-[#1A3644] hover:bg-[#284E62] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shrink-0"
                >
                  Buscar
                </button>
              </div>
            </form>

            {/* Accesos rápidos de búsqueda */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-stone-600">
              <span className="text-stone-500 font-medium">Búsquedas frecuentes:</span>
              {quickSearchTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    onSearchQuery(tag);
                    onNavigate('buscar');
                  }}
                  className="px-2 py-0.5 rounded-full bg-white hover:bg-[#EFECE5] border border-stone-200 text-stone-700 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. ¿NO ENCONTRÁS EL ARTÍCULO QUE BUSCÁS? (REEMPLAZOS) */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] rounded-2xl p-6 sm:p-8 border border-[#E8DFC8] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C5D39]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Herramienta exclusiva de sustitución</span>
            </div>
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-stone-900">
              ¿No encontrás el artículo que buscás?
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Si tu tela habitual está agotada o dada de baja por lote, nuestro sistema de reemplazos te sugiere alternativas de idéntica composición, caída equivalente o gramajes compatibles.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              id="home-search-replacement-btn"
              onClick={onOpenReplacementFinder}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-[#8C5D39] hover:bg-[#774C2C] shadow-xs transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Buscar reemplazo</span>
            </button>

            <button
              onClick={() => onNavigate('buscar')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 transition-colors text-sm"
            >
              <Sparkles className="w-4 h-4 text-[#1A3644]" />
              <span>Asistente Textil IA</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. ARTÍCULOS DESTACADOS */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8C5D39]">
              Selección Sartorial
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900">
              Artículos Destacados
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalogo')}
            className="text-xs sm:text-sm font-semibold text-[#1A3644] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. NOVEDADES & ÚLTIMOS INGRESOS */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF9F6] rounded-2xl border border-[#ECEAE2] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1A3644]">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Actualizaciones del Taller y Depósito</span>
              </div>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900">
                Novedades &amp; Nuevos Ingresos
              </h2>
            </div>
            <button
              onClick={() => onNavigate('novedades')}
              className="text-xs sm:text-sm font-semibold text-[#1A3644] hover:underline flex items-center gap-1"
            >
              <span>Ver todas las novedades</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentNews.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('novedades')}
                className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-stone-400 hover:shadow-sm transition-all cursor-pointer flex flex-col"
              >
                <div className="aspect-[16/9] relative overflow-hidden bg-stone-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#1A3644] text-white rounded">
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] text-stone-500 block">
                      {new Date(item.createdAt).toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    <h3 className="font-bold text-stone-900 text-sm group-hover:text-[#1A3644] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-100 text-xs font-semibold text-[#1A3644] flex items-center gap-1">
                    <span>Leer comunicado</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. VALORES Y ATRIBUTOS DE COSTA TEXTIL (Section 5 & 31) */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900">
            Tradición, Oficio y Confianza Textil
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Respaldamos a camiserías, marcas, modistas, sastres y diseñadores con asesoramiento técnico especializado en la Ciudad de Buenos Aires y envíos a toda la Argentina.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-xl bg-white border border-[#E7E5DF] text-center space-y-2 hover:border-stone-400 transition-colors">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#EAF2F5] text-[#1A3644] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Mayorista y Minorista</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Atención a grandes marcas, talleres y pedidos por metro para particulares.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E7E5DF] text-center space-y-2 hover:border-stone-400 transition-colors">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#FAF3EC] text-[#8C5D39] flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Cortes a Medida</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Fraccionamiento exacto para muestras, camisas individuales o prendas de colección.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E7E5DF] text-center space-y-2 hover:border-stone-400 transition-colors">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#EAF2F5] text-[#1A3644] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Asesoramiento Experto</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Conocimiento en caída, hilado, fusiones de cuello y rendimiento de metraje.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E7E5DF] text-center space-y-2 hover:border-stone-400 transition-colors">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#FAF3EC] text-[#8C5D39] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Variedad Exclusiva</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Algodón Pima Peruano, Lino Italiano, Poplines Suizos, Twill y Sastrería.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E7E5DF] text-center space-y-2 hover:border-stone-400 transition-colors">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#EAF2F5] text-[#1A3644] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Envíos a Todo el País</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Despachos ágiles por transporte o retiro en nuestro showroom en Monserrat.
            </p>
          </div>
        </div>

        {/* Banner de Sede Física */}
        <div className="mt-8 p-5 rounded-xl bg-[#1A3644] text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-white/10 shrink-0">
              <MapPin className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-serif-luxury text-base font-bold">
                Showroom y Depósito Central en Monserrat
              </h4>
              <p className="text-xs text-stone-300">
                {settings.address}, {settings.addressFloorOffice} · CABA · {settings.businessHours}
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola, quisiera coordinar una visita a su showroom de Alsina 1170.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wide transition-colors shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Coordinar Visita por WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
};
