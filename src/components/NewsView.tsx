import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  ArrowRight, 
  AlertTriangle, 
  Bell, 
  Layers, 
  Tag,
  Calendar
} from 'lucide-react';
import { NewsItem, NewsType, Product } from '../types';

interface NewsViewProps {
  news: NewsItem[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({
  news,
  products,
  onSelectProduct,
}) => {
  const [selectedType, setSelectedType] = useState<string>('todos');

  const categories: { type: string; label: string; icon: any }[] = [
    { type: 'todos', label: 'Todas las novedades', icon: Sparkles },
    { type: 'nuevo_ingreso', label: '🆕 Nuevos ingresos', icon: Tag },
    { type: 'reposicion', label: '🔄 Reposiciones', icon: RefreshCw },
    { type: 'baja', label: '🔻 Dados de baja', icon: AlertTriangle },
    { type: 'comunicado', label: '📢 Comunicados', icon: Bell },
    { type: 'coleccion', label: '✨ Colecciones', icon: Layers },
  ];

  const filteredNews = news
    .filter(n => n.published)
    .filter(n => selectedType === 'todos' || n.type === selectedType);

  const getTypeBadge = (type: NewsType) => {
    switch (type) {
      case 'nuevo_ingreso':
        return { label: 'Nuevo Ingreso', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'reposicion':
        return { label: 'Reposición de Stock', color: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'baja':
        return { label: 'Artículo Dado de Baja', color: 'bg-stone-200 text-stone-800 border-stone-300' };
      case 'comunicado':
        return { label: 'Comunicado Oficial', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'coleccion':
        return { label: 'Colección Sartorial', color: 'bg-purple-100 text-purple-900 border-purple-300' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cabecera */}
      <div className="border-b border-stone-200 pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C5D39]">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Información en tiempo real</span>
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          Novedades &amp; Comunicados
        </h1>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl">
          Conocé los nuevos ingresos de telas importadas, reabastecimiento de partidas agotadas, avisos de bajas definitivas y comunicados comerciales de Costa Textil.
        </p>

        {/* Pestañas de categorías */}
        <div className="flex flex-wrap gap-1.5 pt-6">
          {categories.map((cat) => (
            <button
              key={cat.type}
              onClick={() => setSelectedType(cat.type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedType === cat.type
                  ? 'bg-[#1A3644] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listado de Novedades */}
      {filteredNews.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-2">
          <p className="text-sm text-stone-500">
            No hay novedades publicadas en esta categoría por el momento.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredNews.map((item) => {
            const badge = getTypeBadge(item.type);
            const relatedProducts = products.filter(p => item.relatedProductIds?.includes(p.id));

            return (
              <article
                key={item.id}
                id={`news-item-${item.id}`}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-stone-400 transition-all p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
              >
                {/* Imagen */}
                <div className="md:col-span-4 aspect-[16/10] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Contenido */}
                <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-stone-900">
                      {item.title}
                    </h2>

                    <p className="text-sm text-stone-700 leading-relaxed font-medium">
                      {item.description}
                    </p>

                    {item.content && item.content !== item.description && (
                      <p className="text-xs text-stone-600 leading-relaxed pt-1">
                        {item.content}
                      </p>
                    )}
                  </div>

                  {/* Artículos Vinculados */}
                  {relatedProducts.length > 0 && (
                    <div className="pt-3 border-t border-stone-100 space-y-2">
                      <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                        Telas relacionadas en esta novedad:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {relatedProducts.map(prod => (
                          <button
                            key={prod.id}
                            onClick={() => onSelectProduct(prod)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-medium text-stone-800 transition-colors"
                          >
                            <span className="font-mono font-bold text-[#1A3644]">
                              Art. {prod.articleCode}
                            </span>
                            <span>{prod.name}</span>
                            <ArrowRight className="w-3 h-3 text-stone-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
