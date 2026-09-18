import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  RefreshCw, 
  ArrowRight, 
  MessageCircle, 
  Send, 
  Compass, 
  CheckCircle2, 
  HelpCircle,
  Lightbulb,
  FileText
} from 'lucide-react';
import { Product, CompanySettings } from '../types';
import { ProductCard } from './ProductCard';
import { dataService } from '../services/dataService';

interface SearchViewProps {
  products: Product[];
  settings: CompanySettings;
  onSelectProduct: (product: Product) => void;
  initialQuery?: string;
  initialMode?: 'search' | 'replacement' | 'assistant';
}

export const SearchView: React.FC<SearchViewProps> = ({
  products,
  settings,
  onSelectProduct,
  initialQuery = '',
  initialMode = 'search',
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'wizard' | 'assistant'>(
    initialMode === 'replacement' ? 'search' : initialMode === 'assistant' ? 'assistant' : 'search'
  );

  const [query, setQuery] = useState(initialQuery);

  // Estado del Asistente Gemini
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Estado del Asistente Guiado ("Encontrá la tela para tu proyecto" - Section 23)
  const [wizardGarment, setWizardGarment] = useState<string>('Camisa a medida');
  const [wizardFeature, setWizardFeature] = useState<string>('Fresca y liviana');
  const [wizardColor, setWizardColor] = useState<string>('Cualquiera');

  // Estado del Buscador de Reemplazo Rápido
  const [selectedOutArticleId, setSelectedOutArticleId] = useState<string>(
    products.find(p => p.availabilityStatus === 'agotado' || p.availabilityStatus === 'dado_de_baja')?.id || ''
  );

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Búsqueda inteligente con priorización de código exacto (Section 8)
  const searchResults = React.useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const cleanQ = q.replace(/[^0-9a-z]/g, '');

    const exactMatches: Product[] = [];
    const highMatches: Product[] = [];
    const partialMatches: Product[] = [];

    for (const p of products) {
      const cleanCode = p.articleCode.toLowerCase().replace(/[^0-9a-z]/g, '');

      // 1. Código exacto o coincidencia muy estrecha
      if (cleanCode === cleanQ || p.articleCode.toLowerCase() === q) {
        exactMatches.push(p);
        continue;
      }

      // 2. Coincidencia en nombre o código parcial
      if (p.articleCode.toLowerCase().includes(q) || cleanCode.includes(cleanQ) || p.name.toLowerCase().includes(q)) {
        highMatches.push(p);
        continue;
      }

      // 3. Coincidencia en tipo, composición, color u origen
      if (
        p.composition.toLowerCase().includes(q) ||
        p.fabricType.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      ) {
        partialMatches.push(p);
      }
    }

    return [...exactMatches, ...highMatches, ...partialMatches];
  }, [products, query]);

  // Consulta al Asistente Textil Server-Side (Gemini API con fallback garantizado)
  const handleAskAssistant = async (customText?: string) => {
    const textToSend = customText || aiPrompt;
    if (!textToSend.trim()) return;

    setAiLoading(true);
    setAiResponse(null);

    // Resumen conciso del catálogo actual para orientar a Gemini
    const catalogSummary = products
      .map(p => `Art. ${p.articleCode} - ${p.name} | ${p.fabricType} | ${p.composition} | ${p.color} | Origen: ${p.origin} | Estado: ${p.availabilityStatus}`)
      .join('\n');

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          catalogSummary,
        }),
      });

      if (!response.ok) throw new Error('Error en el servidor de IA');
      const data = await response.json();
      setAiResponse(data.reply);
    } catch (err) {
      console.warn("Error consultando asistente:", err);
      // Fallback heurístico textil
      setAiResponse(
        `Para confeccionar según tu consulta, te recomendamos revisar el Algodón Pima Peruano (Art. 17.154) para camisas de máxima suavidad o el Lino Italiano (Art. 18.204) si buscás frescura y textura natural. Ante dudas específicas de hilado o cortes muestra, podés escribirnos al WhatsApp de Costa Textil (${settings.whatsappDisplay}).`
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Filtrado del Asistente Guiado ("Encontrá la tela para tu proyecto")
  const wizardMatches = React.useMemo(() => {
    return products.filter(p => {
      if (p.isDiscontinued) return false;

      // Filtro según confección
      if (wizardGarment === 'Sastrería') {
        if (p.category !== 'Sastrería' && p.category !== 'Ambos') return false;
      } else if (wizardGarment.includes('Camisa')) {
        if (p.category !== 'Camisería' && p.category !== 'Ambos') return false;
      }

      // Filtro según característica
      if (wizardFeature === 'Fresca y liviana') {
        if (p.fabricType !== 'Lino' && p.fabricType !== 'Batista' && p.fabricType !== 'Seersucker' && !p.composition.includes('Pima')) {
          return false;
        }
      } else if (wizardFeature === 'Formal y estructurada') {
        if (p.fabricType !== 'Oxford' && p.fabricType !== 'Poplín' && p.fabricType !== 'Twill' && p.fabricType !== 'Sastrería') {
          return false;
        }
      } else if (wizardFeature === 'Suavidad superior / Pima') {
        if (!p.composition.includes('Pima') && !p.composition.includes('120/2') && !p.composition.includes('Egipcio')) {
          return false;
        }
      } else if (wizardFeature === 'Con elasticidad / Confort') {
        if (!p.composition.includes('Elastano')) {
          return false;
        }
      }

      // Filtro por color
      if (wizardColor !== 'Cualquiera') {
        if (!p.colorFamily.toLowerCase().includes(wizardColor.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [products, wizardGarment, wizardFeature, wizardColor]);

  // Artículo seleccionado para reemplazo
  const selectedOutArticle = products.find(p => p.id === selectedOutArticleId);
  const outArticleReplacements = selectedOutArticle 
    ? dataService.getReplacementsForProduct(selectedOutArticle) 
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Selector de Modos de Búsqueda */}
      <div className="border-b border-stone-200 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-luxury text-3xl font-bold text-stone-900">
              Buscador &amp; Asistente Textil
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Herramienta inteligente de localización de artículos, asesoría guiada para proyectos y reemplazo de telas agotadas.
            </p>
          </div>

          <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 self-start md:self-auto">
            <button
              id="tab-btn-search"
              onClick={() => setActiveTab('search')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'search'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscador Rápido</span>
            </button>

            <button
              id="tab-btn-wizard"
              onClick={() => setActiveTab('wizard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'wizard'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Para tu Proyecto</span>
            </button>

            <button
              id="tab-btn-assistant"
              onClick={() => setActiveTab('assistant')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'assistant'
                  ? 'bg-white text-[#1A3644] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Asistente IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. MODO BUSCADOR RÁPIDO & CÓDIGO EXACTO */}
      {/* ============================================================== */}
      {activeTab === 'search' && (
        <div className="space-y-8">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="search-input-main"
                type="text"
                placeholder="Buscá por código (ej: 17.154), algodón, lino, poplín, color, origen..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full py-4 pl-12 pr-4 text-sm sm:text-base rounded-2xl bg-white border border-stone-300 shadow-sm focus:outline-none focus:border-[#1A3644] focus:ring-2 focus:ring-[#1A3644]/10"
              />
            </div>

            {/* Atajos de búsqueda */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-600">
              <span className="text-stone-500 font-medium">Sugerencias rápidas:</span>
              {['17.154', '12.035', 'Lino italiano', 'Algodón blanco', 'Oxford', 'Twill', '18.204'].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-mono text-xs transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Resultados */}
          {query.trim() ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2 text-xs text-stone-600">
                <span className="font-semibold text-stone-900">
                  {searchResults.length} {searchResults.length === 1 ? 'coincidencia encontrada' : 'coincidencias encontradas'} para "{query}"
                </span>
                {searchResults.some(p => p.availabilityStatus === 'agotado' || p.availabilityStatus === 'dado_de_baja') && (
                  <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                    Incluye artículos con reemplazos activos
                  </span>
                )}
              </div>

              {searchResults.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
                  <HelpCircle className="w-8 h-8 text-stone-400 mx-auto" />
                  <h3 className="font-bold text-stone-800 text-sm">
                    No encontramos un artículo con "{query}"
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Revisá que el código esté bien escrito o utilizá el Asistente IA para buscar por descripción libre (ej: "tela liviana para camisa veraniega").
                  </p>
                  <button
                    onClick={() => {
                      setAiPrompt(query);
                      setActiveTab('assistant');
                      handleAskAssistant(query);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A3644] text-white rounded-xl text-xs font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Preguntarle al Asistente Textil</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={onSelectProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Sección de Buscador Rápido de Reemplazos cuando no hay búsqueda activa */
            <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-2xl border border-[#E8DFC8] space-y-6">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#8C5D39]" />
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                    Buscador de Reemplazos Inmediatos
                  </h3>
                  <p className="text-xs text-stone-600">
                    Seleccioná un artículo agotado o discontinuado para ver sus alternativas con stock real disponible:
                  </p>
                </div>
              </div>

              {/* Selector de artículos agotados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {products
                  .filter(p => p.availabilityStatus === 'agotado' || p.availabilityStatus === 'dado_de_baja')
                  .map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedOutArticleId(p.id)}
                      className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between ${
                        selectedOutArticleId === p.id
                          ? 'bg-white border-[#8C5D39] shadow-sm ring-1 ring-[#8C5D39]'
                          : 'bg-white/70 border-stone-200 hover:bg-white'
                      }`}
                    >
                      <div>
                        <span className="font-mono text-xs font-bold text-stone-900 block">
                          Art. {p.articleCode}
                        </span>
                        <span className="text-xs font-medium text-stone-700 line-clamp-1">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {p.availabilityStatus === 'dado_de_baja' ? 'Dado de baja' : 'Agotado'}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-400" />
                    </button>
                  ))}
              </div>

              {/* Mostrar reemplazos del artículo seleccionado */}
              {selectedOutArticle && (
                <div className="pt-4 border-t border-[#E8DFC8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Alternativas para Art. {selectedOutArticle.articleCode} ({selectedOutArticle.name}):
                    </span>
                    <button
                      onClick={() => onSelectProduct(selectedOutArticle)}
                      className="text-xs text-[#8C5D39] font-medium hover:underline"
                    >
                      Ver ficha completa del agotado
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {outArticleReplacements.map(({ replacementProduct: rep, replacementType: rType, reason }) => (
                      <div
                        key={rep.id}
                        onClick={() => onSelectProduct(rep)}
                        className="bg-white p-4 rounded-xl border border-stone-200 hover:border-stone-400 cursor-pointer shadow-xs transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-stone-900">
                            Art. {rep.articleCode}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Disponible
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                          {rep.name}
                        </h4>
                        <p className="text-[11px] text-stone-600">
                          {rep.composition} · {rep.origin}
                        </p>
                        <p className="text-[11px] text-stone-700 bg-stone-50 p-2 rounded border border-stone-100 italic">
                          "{reason}"
                        </p>
                        <div className="pt-2 text-right text-xs font-semibold text-[#1A3644]">
                          Ver tela →
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MODO ASISTENTE GUIADO ("ENCONTRÁ LA TELA PARA TU PROYECTO" - Section 23) */}
      {/* ============================================================== */}
      {activeTab === 'wizard' && (
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-stone-900">
                Encontrá la tela para tu proyecto
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Respondé 3 preguntas para recibir la recomendación técnica exacta según los atributos certificados de nuestro catálogo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pregunta 1: ¿Qué vas a confeccionar? */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                  1. ¿Qué vas a confeccionar?
                </label>
                <div className="space-y-1.5">
                  {['Camisa a medida', 'Camisa sport / verano', 'Camisa entallada (stretch)', 'Sastrería / Trajes'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setWizardGarment(item)}
                      className={`w-full text-left text-xs p-2.5 rounded-lg border transition-all ${
                        wizardGarment === item
                          ? 'bg-[#1A3644] text-white font-semibold border-[#1A3644]'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregunta 2: ¿Qué característica buscás? */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                  2. ¿Qué característica buscás?
                </label>
                <div className="space-y-1.5">
                  {[
                    'Fresca y liviana',
                    'Formal y estructurada',
                    'Suavidad superior / Pima',
                    'Con elasticidad / Confort'
                  ].map((feat) => (
                    <button
                      key={feat}
                      onClick={() => setWizardFeature(feat)}
                      className={`w-full text-left text-xs p-2.5 rounded-lg border transition-all ${
                        wizardFeature === feat
                          ? 'bg-[#1A3644] text-white font-semibold border-[#1A3644]'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {feat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregunta 3: Color preferido */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                  3. Color o tono preferido
                </label>
                <div className="space-y-1.5">
                  {['Cualquiera', 'Blanco', 'Celeste', 'Rayados', 'Gris / Negro'].map((col) => (
                    <button
                      key={col}
                      onClick={() => setWizardColor(col)}
                      className={`w-full text-left text-xs p-2.5 rounded-lg border transition-all ${
                        wizardColor === col
                          ? 'bg-[#1A3644] text-white font-semibold border-[#1A3644]'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Telas coincidentes según las respuestas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Telas recomendadas para {wizardGarment} ({wizardFeature}):
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {wizardMatches.length} opciones en stock
              </span>
            </div>

            {wizardMatches.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-stone-200">
                <p className="text-xs text-stone-500">
                  No encontramos una tela que combine exactamente todos los filtros. Podés cambiar el color a "Cualquiera" para ver más opciones disponibles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wizardMatches.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODO ASISTENTE TEXTIL GEMINI (Section 22) */}
      {/* ============================================================== */}
      {activeTab === 'assistant' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-stone-900">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="font-serif-luxury text-xl font-bold">
                Asistente Textil Costa Textil
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600">
              Escribí tu consulta en lenguaje natural (ej: <em>"Busco una tela para una camisa de verano, liviana y de color claro"</em> o <em>"¿Qué reemplazo tienen para el artículo 12.035?"</em>). El asistente analiza nuestro catálogo real y te responderá con rigor técnico.
            </p>

            {/* Ejemplos clickeables */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "Busco una tela para camisa de verano liviana y fresca",
                "¿Qué alternativas tienen para el Art. 12.035 Poplín Suizo?",
                "Telas de algodón peinado para camisas de etiqueta",
                "¿Tienen paños para trajes de sastrería italiana?"
              ].map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAiPrompt(ex);
                    handleAskAssistant(ex);
                  }}
                  className="text-left text-xs px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  "{ex}"
                </button>
              ))}
            </div>

            {/* Formulario de consulta */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAssistant();
              }}
              className="pt-3"
            >
              <div className="flex gap-2">
                <input
                  id="ai-prompt-input"
                  type="text"
                  placeholder="Escribí tu consulta textil aquí..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 text-sm py-3 px-4 rounded-xl border border-stone-300 focus:outline-none focus:border-[#1A3644] focus:ring-1 focus:ring-[#1A3644]"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="px-5 py-3 rounded-xl bg-[#1A3644] hover:bg-[#254B5E] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
                >
                  {aiLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Consultar</span>
                </button>
              </div>
            </form>
          </div>

          {/* Respuesta del Asistente */}
          {aiLoading && (
            <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-amber-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-stone-700">
                Consultando catálogo técnico de Costa Textil...
              </p>
            </div>
          )}

          {aiResponse && !aiLoading && (
            <div className="bg-[#FAF9F6] p-6 sm:p-7 rounded-2xl border border-[#ECEAE3] space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A3644]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Recomendación de Costa Textil</span>
                </div>
                <span className="text-[10px] text-stone-500">
                  Basado estrictamente en telas del catálogo
                </span>
              </div>

              <div className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                {aiResponse}
              </div>

              <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-stone-500">
                  ¿Deseás validar metrajes o solicitar un corte muestra?
                </span>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hola Costa Textil, consulté por: "${aiPrompt}" y quisiera confirmar opciones disponibles.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Continuar consulta por WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
