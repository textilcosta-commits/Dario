import React from 'react';
import { Plus, ArrowRight, RefreshCw, Eye } from 'lucide-react';
import { Product } from '../types';
import { AvailabilityBadge } from './AvailabilityBadge';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onSelectReplacements?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onSelectReplacements
}) => {
  const { addItem, hasItem } = useCart();
  const isAvailable = product.availabilityStatus === 'disponible' || product.availabilityStatus === 'poco_stock';
  const isUnavailable = product.availabilityStatus === 'agotado' || product.availabilityStatus === 'dado_de_baja';
  const inCart = hasItem(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 2);
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="group bg-white rounded-xl border border-[#E7E5DF] overflow-hidden hover:border-[#CBD5E1] hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Contenedor de Imagen */}
      <div className="relative aspect-[4/3] bg-[#F4F2EC] overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={`${product.articleCode} - ${product.name}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Overlay sutil para telas claras */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Badges superiores */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {product.isNew && (
            <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#1A3644] text-white rounded shadow-sm">
              NUEVO
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide bg-[#FDFBF7] text-[#8C5D39] border border-[#E4D5C7] rounded shadow-xs">
              Destacado
            </span>
          )}
        </div>

        {/* Código en la imagen para lectura instantánea */}
        <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-xs font-mono font-medium px-2 py-0.5 rounded">
          Art. {product.articleCode}
        </div>

        {/* Categoría o Tipo de tela */}
        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-[#2A3742] text-[11px] font-medium px-2 py-0.5 rounded border border-white/50">
          {product.fabricType}
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Título y especificaciones principales */}
          <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-[#1A2228] line-clamp-1 group-hover:text-[#1A3644] transition-colors">
            {product.name}
          </h3>

          <div className="mt-1 flex items-center gap-2 text-xs text-[#52606B]">
            <span className="font-medium text-[#2C3842]">{product.composition}</span>
            <span>·</span>
            <span>{product.origin}</span>
          </div>

          <div className="mt-1 text-xs text-[#6B7882] line-clamp-1">
            Color: <span className="text-[#36434D]">{product.color}</span> · Ancho: {product.width}
          </div>

          {/* Estado de Disponibilidad */}
          <div className="mt-3">
            <AvailabilityBadge status={product.availabilityStatus} meters={product.availableMeters} />
          </div>
        </div>

        {/* Acciones inferiores */}
        <div className="mt-4 pt-3 border-t border-[#F0EEEA] flex items-center justify-between gap-2">
          <button
            id={`view-btn-${product.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="text-xs font-medium text-[#3A4954] hover:text-[#1A3644] flex items-center gap-1 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#73828E]" />
            <span>Ver ficha</span>
          </button>

          {isAvailable ? (
            <button
              id={`quick-add-${product.id}`}
              type="button"
              onClick={handleQuickAdd}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                inCart
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-[#1A3644] text-white hover:bg-[#274B5E] shadow-xs'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{inCart ? 'Agregado (+2m)' : '+ Pedido'}</span>
            </button>
          ) : (
            <button
              id={`replacement-btn-${product.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectReplacements) {
                  onSelectReplacements(product);
                } else {
                  onSelect(product);
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F5F2EC] text-[#634932] hover:bg-[#ECE6DC] border border-[#E0D5C5] transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-[#8C5D39]" />
              <span>Ver reemplazos</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
