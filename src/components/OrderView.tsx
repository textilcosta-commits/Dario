import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Send, 
  Copy, 
  Check, 
  MessageCircle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  ArrowLeft,
  FileText,
  MapPin,
  Building,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CompanySettings, OrderRequest } from '../types';
import { dataService } from '../services/dataService';

interface OrderViewProps {
  settings: CompanySettings;
  onNavigate: (tab: string) => void;
  onSelectProductById: (productId: string) => void;
}

export const OrderView: React.FC<OrderViewProps> = ({
  settings,
  onNavigate,
  onSelectProductById,
}) => {
  const { items, updateMeters, updateNotes, removeItem, clearCart, totalMeters, totalItems } = useCart();

  // Formulario de datos del cliente
  const [customerName, setCustomerName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');

  const [submittedOrder, setSubmittedOrder] = useState<OrderRequest | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Generación del resumen de texto formateado según Section 13
  const generateOrderMessage = (orderId?: string) => {
    const itemsList = items
      .map(item => `• Art. ${item.articleCode} — ${item.name} (${item.color}) : ${item.meters} m${item.notes ? ` [Nota: ${item.notes}]` : ''}`)
      .join('\n');

    return `SOLICITUD DE PEDIDO — COSTA TEXTIL
${orderId ? `Identificador: ${orderId}\n` : ''}
Cliente: ${customerName.trim() || 'No especificado'}
${company.trim() ? `Empresa / Marca: ${company.trim()}\n` : ''}Teléfono / WhatsApp: ${phone.trim() || 'No especificado'}
${email.trim() ? `Email: ${email.trim()}\n` : ''}Localidad: ${location.trim() || 'Buenos Aires'}

Metros totales solicitados: ${totalMeters} m

Artículos:
${itemsList}

Observaciones generales:
${generalNotes.trim() || 'Sin observaciones adicionales.'}

---
*Solicitud enviada a través del Catálogo Digital de Costa Textil. Sujeta a confirmación de stock y metraje.*`;
  };

  const handleCopySummary = () => {
    const text = generateOrderMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitOrder = async (openWhatsApp: boolean = false) => {
    if (!customerName.trim()) {
      setErrorMsg('Por favor indicá tu Nombre y Apellido.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Por favor indicá tu Teléfono o WhatsApp para contactarte.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Por favor indicá tu Localidad o Provincia.');
      return;
    }

    setErrorMsg('');

    try {
      const order = await dataService.submitOrder({
        customerName: customerName.trim(),
        company: company.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        location: location.trim(),
        items,
        notes: generalNotes.trim() || undefined,
      });

      setSubmittedOrder(order);

      if (openWhatsApp) {
        const text = generateOrderMessage(order.id);
        const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
        const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
      }

      clearCart();
    } catch (err) {
      console.error('Error enviando solicitud:', err);
      setErrorMsg('Hubo un error al registrar la solicitud. Podés copiar el texto y enviarlo por WhatsApp directamente.');
    }
  };

  if (submittedOrder) {
    const summaryText = generateOrderMessage(submittedOrder.id);
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(summaryText)}`;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-stone-200 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-stone-100 text-stone-800 rounded">
              Solicitud #{submittedOrder.id}
            </span>
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 mt-3">
              ¡Solicitud de Pedido Registrada!
            </h1>
            <p className="text-sm text-stone-600 max-w-lg mx-auto mt-2">
              Muchas gracias, <strong>{submittedOrder.customerName}</strong>. Tu pedido ha sido guardado. Nuestro equipo revisará el metraje exacto y te contactará para confirmar disponibilidad y condiciones.
            </p>
          </div>

          {/* Resumen del pedido */}
          <div className="text-left bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs font-mono text-stone-800 whitespace-pre-line max-h-60 overflow-y-auto">
            {summaryText}
          </div>

          {/* Acciones posteriores */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              id="confirm-whatsapp-btn"
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar por WhatsApp a Costa Textil</span>
            </a>

            <button
              onClick={handleCopySummary}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 transition-colors text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado' : 'Copiar Resumen'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-stone-200">
            <button
              onClick={() => {
                setSubmittedOrder(null);
                onNavigate('catalogo');
              }}
              className="text-xs text-[#1A3644] font-semibold hover:underline"
            >
              ← Volver a explorar el catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif-luxury text-2xl font-bold text-stone-900">
          Tu solicitud de pedido está vacía
        </h2>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Aún no agregaste telas a tu solicitud. Podés explorar nuestro catálogo, seleccionar artículos e indicar la cantidad de metros que necesitás para tu confección.
        </p>
        <div className="pt-4">
          <button
            id="empty-cart-explore-btn"
            onClick={() => onNavigate('catalogo')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A3644] text-white font-semibold rounded-xl text-sm hover:bg-[#25495D] shadow-sm transition-colors"
          >
            <span>Explorar telas disponibles</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Título */}
      <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-serif-luxury text-3xl font-bold text-stone-900">
            Armado de Solicitud de Pedido
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Revisá los artículos y metrajes solicitados antes de enviar la solicitud a Costa Textil.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-800 font-medium self-start sm:self-auto"
        >
          Vaciar solicitud
        </button>
      </div>

      {/* Aclaración fundamental: SOLICITUD DE PEDIDO (Section 12) */}
      <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFC8] flex items-start gap-3 text-xs text-stone-700">
        <Info className="w-5 h-5 text-[#8C5D39] shrink-0 mt-0.5" />
        <div>
          <strong className="text-stone-900 block font-semibold mb-0.5">
            Información sobre tu Solicitud de Pedido:
          </strong>
          Esta acción no confirma automáticamente una compra ni requiere pago online. El pedido se considera una <strong>SOLICITUD DE PEDIDO</strong> hasta que Costa Textil verifique el metraje disponible en depósito y confirme condiciones de corte y entrega.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ============================================================== */}
        {/* LISTADO DE TELAS EN EL PEDIDO */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider px-1">
            <span>Artículos ({totalItems})</span>
            <span>Total: {totalMeters} metros</span>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                id={`cart-item-${item.productId}`}
                className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Imagen y descripción */}
                <div 
                  onClick={() => onSelectProductById(item.productId)}
                  className="flex items-center gap-3.5 cursor-pointer group flex-1 min-w-0"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border border-stone-200 shrink-0 group-hover:opacity-90"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded">
                        Art. {item.articleCode}
                      </span>
                      <span className="text-[11px] text-stone-500 truncate">
                        {item.color}
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm mt-1 truncate group-hover:text-[#1A3644] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-500 truncate">
                      {item.composition}
                    </p>
                  </div>
                </div>

                {/* Control de Metros */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateMeters(item.productId, item.meters - 0.5)}
                      className="p-1.5 hover:bg-stone-200 text-stone-600 transition-colors"
                      title="Disminuir 0.5m"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="px-3 py-1 font-bold text-xs text-stone-900 bg-white min-w-[50px] text-center">
                      {item.meters} m
                    </div>
                    <button
                      type="button"
                      onClick={() => updateMeters(item.productId, item.meters + 0.5)}
                      className="p-1.5 hover:bg-stone-200 text-stone-600 transition-colors"
                      title="Aumentar 0.5m"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-stone-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-stone-100"
                    title="Quitar artículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white rounded-xl border border-stone-200 flex items-center justify-between font-bold text-sm text-stone-900">
            <span>Metraje Total Solicitado</span>
            <span className="font-mono text-base text-[#1A3644]">{totalMeters} metros</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* FORMULARIO DE DATOS DE CONTACTO (Section 13) */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="font-serif-luxury text-lg font-bold text-stone-900">
              Datos para la Solicitud
            </h2>
            <p className="text-xs text-stone-500">
              Completá tus datos para que Costa Textil te envíe la cotización y confirmación.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            {/* Nombre */}
            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Nombre y Apellido <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="order-name-input"
                  type="text"
                  placeholder="Ej: Mariano Castiglione"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#1A3644]"
                />
              </div>
            </div>

            {/* Empresa / Marca */}
            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Empresa, Taller o Marca <span className="text-stone-400 font-normal">(Opcional)</span>
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="order-company-input"
                  type="text"
                  placeholder="Ej: Sastrería Castiglione / Modista independiente"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#1A3644]"
                />
              </div>
            </div>

            {/* Teléfono / WhatsApp */}
            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Teléfono / WhatsApp <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="order-phone-input"
                  type="tel"
                  placeholder="Ej: +54 9 11 4455-8899"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#1A3644]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Correo Electrónico <span className="text-stone-400 font-normal">(Opcional)</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="order-email-input"
                  type="email"
                  placeholder="Ej: cliente@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#1A3644]"
                />
              </div>
            </div>

            {/* Localidad */}
            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Localidad y Provincia <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="order-location-input"
                  type="text"
                  placeholder="Ej: CABA / Rosario, Santa Fe / Córdoba"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#1A3644]"
                />
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Observaciones Generales <span className="text-stone-400 font-normal">(Opcional)</span>
              </label>
              <textarea
                id="order-notes-textarea"
                rows={2}
                placeholder="Ej: Preferimos retiro presencial en Alsina 1170 el viernes..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-[#1A3644]"
              />
            </div>
          </div>

          {/* Botones de Envío */}
          <div className="pt-3 space-y-2">
            <button
              id="submit-order-whatsapp-btn"
              type="button"
              onClick={() => handleSubmitOrder(true)}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar Solicitud por WhatsApp</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="submit-order-register-btn"
                type="button"
                onClick={() => handleSubmitOrder(false)}
                className="py-2.5 px-3 rounded-xl font-semibold text-xs text-[#1A3644] bg-[#EAF2F5] hover:bg-[#D8E8EE] border border-[#BDD9E4] transition-colors"
              >
                Registrar Solicitud
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="py-2.5 px-3 rounded-xl font-semibold text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 flex items-center justify-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 text-center leading-tight">
            Al enviar, tus datos se transmitirán exclusivamente a Costa Textil para preparar tu presupuesto.
          </p>
        </div>
      </div>
    </div>
  );
};
