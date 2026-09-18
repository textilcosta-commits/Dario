import React from 'react';
import { X, MapPin, Clock, MessageCircle, Phone, Mail, ShieldCheck } from 'lucide-react';
import { CompanySettings } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  settings
}) => {
  if (!isOpen) return null;

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola Costa Textil, quisiera coordinar una visita a su showroom de Alsina 1170 o consultar stock disponible.')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div 
        id="contact-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white max-w-lg w-full rounded-2xl border border-[#ECEAE4] shadow-2xl overflow-hidden my-auto"
      >
        <div className="p-5 border-b border-[#ECEAE4] flex items-center justify-between bg-[#FAF9F6]">
          <div>
            <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
              Atención &amp; Showroom
            </h3>
            <p className="text-xs text-stone-500">
              Costa Textil · Buenos Aires, Argentina
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-stone-700">
          <div className="flex items-start gap-3 bg-[#FAF9F6] p-4 rounded-xl border border-stone-200">
            <MapPin className="w-5 h-5 text-[#1A3644] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-stone-900 text-sm block">
                Showroom y Depósito Central
              </span>
              <p className="text-stone-700">
                {settings.address}, {settings.addressFloorOffice}
              </p>
              <p className="text-stone-500">
                Barrio de Monserrat · Ciudad Autónoma de Buenos Aires
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#FAF9F6] p-4 rounded-xl border border-stone-200">
            <Clock className="w-5 h-5 text-[#8C5D39] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-stone-900 text-sm block">
                Horario de Atención
              </span>
              <p className="text-stone-700">
                {settings.businessHours}
              </p>
              <p className="text-stone-500">
                Atención personalizada para talleres, modistas y marcas de confección.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chatear por WhatsApp ({settings.whatsappDisplay})</span>
            </a>

            <p className="text-[11px] text-stone-500 text-center">
              Coordinamos citas previas para ver muestrarios y rollos completos en persona.
            </p>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-200/60 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
