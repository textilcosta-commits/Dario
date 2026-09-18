import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  ShoppingBag, 
  MessageCircle, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  Layers,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Product, CompanySettings } from '../types';
import { AvailabilityBadge } from './AvailabilityBadge';
import { useCart } from '../context/CartContext';
import { dataService } from '../services/dataService';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  settings: CompanySettings;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onSelectProduct,
  settings
}) => {
  const { addItem, hasItem, getItemMeters } = useCart();
  const [selectedMeters, setSelectedMeters] = useState<number>(3);
  const [itemNotes, setItemNotes] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  if (!product) return null;

  const isAvailable = product.availabilityStatus === 'disponible' || product.availabilityStatus === 'poco_stock';
  const isAgotado = product.availabilityStatus === 'agotado';
  const isBaja = product.availabilityStatus === 'dado_de_baja';
  const replacements = dataService.getReplacementsForProduct(product);
  const inCart = hasItem(product.id);
  const currentCartMeters = getItemMeters(product.id);

  const handleAdd = () => {
    addItem(product, selectedMeters, itemNotes);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const whatsappInquiryUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hola Costa Textil, quisiera consultar por el artículo: Art. ${product.articleCode} - ${product.name} (${product.composition}, ${product.color}).`
  )}`;

  const getReplacementTagLabel = (type: string) => {
    switch (type) {
      case 'exacto': return { label: 'Reemplazo Exacto', color: 'bg-emerald-100 text-emerald-800' };
      case 'alternativa_premium': return { label: 'Alternativa Premium', color: 'bg-amber-100 text-amber-900' };
      case 'color_similar': return { label: 'Color Similar', color: 'bg-sky-100 text-sky-800' };
      case 'misma_composicion': return { label: 'Misma Composición', color: 'bg-indigo-100 text-indigo-800' };
      case 'similar': return { label: 'Similar', color: 'bg-stone-200 text-stone-800' };
      default: return { label: 'Alternativa', color: 'bg-stone-100 text-stone-800' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        id={`product-modal-${product.id}`}
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E2DFD7] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="p-4 sm:p-5 border-b border-[#ECEAE4] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-[#1A3644] text-white rounded">
              Art. {product.articleCode}
            </span>
            <AvailabilityBadge status={product.availabilityStatus} meters={product.availableMeters} />
          </div>
          <button
            id="close-product-modal"
            onClick={onClose}
            className="p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del modal scrolleable */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Fotografía grande de la tela */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F2EFE9] border border-[#E0DCD4]">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                {product.isNew && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-[#1A3644] text-white rounded shadow-sm">
                    NUEVO INGRESO
                  </span>
                )}
              </div>

              {/* Botón rápido WhatsApp para este artículo */}
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold text-[#1A3644] bg-[#EAF2F5] hover:bg-[#D8E8EE] border border-[#BDD9E4] rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Consultar este artículo por WhatsApp</span>
              </a>
            </div>

            {/* Ficha técnica y detalles */}
            <div className="md:col-span-6 flex flex-col justify-between">
              <div>
                <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#1A2228]">
                  {product.name}
                </h2>
                <p className="text-sm text-[#5B6872] mt-1">
                  {product.category} · {product.fabricType}
                </p>

                {/* Especificaciones técnicas sartoriales */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-[#FBFBF9] p-3.5 rounded-xl border border-[#ECEAE3]">
                  <div>
                    <span className="text-stone-500 block">Composición:</span>
                    <span className="font-semibold text-stone-900">{product.composition}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Origen:</span>
                    <span className="font-semibold text-stone-900">{product.origin}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Color:</span>
                    <span className="font-semibold text-stone-900">{product.color}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Ancho:</span>
                    <span className="font-semibold text-stone-900">{product.width}</span>
                  </div>
                  {product.yarnCount && (
                    <div>
                      <span className="text-stone-500 block">Título de Hilado:</span>
                      <span className="font-semibold text-stone-900">{product.yarnCount}</span>
                    </div>
                  )}
                  {product.weightGsm && (
                    <div>
                      <span className="text-stone-500 block">Gramaje:</span>
                      <span className="font-semibold text-stone-900">{product.weightGsm}</span>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Características &amp; Usos recomendados
                  </h4>
                  <p className="mt-1 text-sm text-stone-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Etiquetas */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {product.tags.map((tag, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Selector de Metros o Alerta de No Disponible */}
              <div className="mt-6 pt-4 border-t border-stone-200">
                {isAvailable ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-800 uppercase tracking-wide">
                        Metros a solicitar:
                      </label>
                      <span className="text-xs text-stone-500">
                        {product.availableMeters ? `(Aprox. ${product.availableMeters} m disponibles)` : 'Corte a medida'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedMeters(prev => Math.max(0.5, Math.round((prev - 0.5) * 10) / 10))}
                          className="p-2 hover:bg-stone-100 text-stone-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={selectedMeters}
                          onChange={(e) => setSelectedMeters(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                          className="w-16 text-center font-bold text-stone-800 py-1.5 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedMeters(prev => Math.round((prev + 0.5) * 10) / 10)}
                          className="p-2 hover:bg-stone-100 text-stone-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <span className="text-sm font-medium text-stone-700">metros</span>

                      <button
                        id="add-to-order-btn"
                        type="button"
                        onClick={handleAdd}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold bg-[#1A3644] text-white hover:bg-[#264D60] transition-colors shadow-sm"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{inCart ? `Sumar al pedido` : `Agregar al pedido`}</span>
                      </button>
                    </div>

                    {/* Nota por artículo opcional */}
                    <div>
                      <input
                        type="text"
                        placeholder="Observación opcional (ej: para 2 camisas manga larga, corte muestra...)"
                        value={itemNotes}
                        onChange={(e) => setItemNotes(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 border border-stone-200 rounded-md bg-stone-50 focus:bg-white focus:outline-none focus:border-stone-400"
                      />
                    </div>

                    {inCart && (
                      <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ya tenés {currentCartMeters} metros de este artículo en tu solicitud de pedido.
                      </p>
                    )}

                    {addedSuccess && (
                      <div className="p-2 rounded bg-emerald-100 text-emerald-900 text-xs font-medium text-center animate-in fade-in">
                        ✓ ¡Artículo agregado a tu solicitud de pedido con éxito!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {isBaja 
                          ? 'Este artículo ha sido dado de baja de forma definitiva o por fin de lote.' 
                          : 'Este artículo actualmente no está disponible en stock.'}
                      </span>
                    </div>
                    {product.discontinuedReason && (
                      <p className="text-xs text-stone-600 italic">
                        Motivo: {product.discontinuedReason}
                      </p>
                    )}
                    <p className="text-xs text-stone-600">
                      Costa Textil no inventa disponibilidad. Para continuar tu confección sin retrasos, revisá a continuación los reemplazos técnicos y opciones recomendadas.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECCIÓN CRÍTICA DE REEMPLAZOS (Section 11 & 17) */}
          {/* ============================================================== */}
          {(isAgotado || isBaja || replacements.length > 0) && (
            <div className="pt-6 border-t border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#8C5D39]" />
                  <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-stone-900">
                    {isAgotado || isBaja 
                      ? 'Te puede servir como reemplazo' 
                      : 'Artículos relacionados y alternativas similares'}
                  </h3>
                </div>
                <span className="text-xs text-stone-500">
                  {replacements.length} {replacements.length === 1 ? 'alternativa' : 'alternativas'}
                </span>
              </div>

              {replacements.length === 0 ? (
                <div className="p-4 bg-stone-50 rounded-xl text-center text-xs text-stone-500 border border-stone-200">
                  No hay reemplazos cargados directamente. Podés consultar por WhatsApp al equipo de Costa Textil para que te asesoren con una tela a medida.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {replacements.map(({ replacementProduct: rep, replacementType: rType, reason }, index) => {
                    const tagInfo = getReplacementTagLabel(rType);
                    return (
                      <div
                        key={rep.id || index}
                        id={`modal-rep-${rep.id}`}
                        onClick={() => onSelectProduct(rep)}
                        className="group p-3 rounded-xl border border-stone-200 bg-[#FAF9F6] hover:bg-white hover:border-stone-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[11px] font-bold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                              Art. {rep.articleCode}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagInfo.color}`}>
                              {tagInfo.label}
                            </span>
                          </div>

                          <div className="flex gap-2.5">
                            <img 
                              src={rep.imageUrl} 
                              alt={rep.name}
                              className="w-14 h-14 object-cover rounded-lg shrink-0 border border-stone-200"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-[#1A3644] transition-colors">
                                {rep.name}
                              </h4>
                              <p className="text-[11px] text-stone-600 mt-0.5">
                                {rep.composition}
                              </p>
                              <div className="mt-1">
                                <AvailabilityBadge status={rep.availabilityStatus} showMeters={false} />
                              </div>
                            </div>
                          </div>

                          {/* Motivo explícito de recomendación */}
                          <div className="text-[11px] text-stone-600 bg-white p-2 rounded-md border border-stone-100 italic">
                            "{reason}"
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-stone-200/70 flex items-center justify-end text-[11px] font-semibold text-[#1A3644] group-hover:underline">
                          <span>Ver este artículo</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="p-3.5 bg-[#FAF9F6] border-t border-[#ECEAE4] flex items-center justify-between text-xs text-stone-500">
          <span>Costa Textil · Asesoramiento técnico en cortes sartoriales</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-stone-300 font-medium text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
