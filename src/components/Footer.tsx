import React from 'react';
import { MessageCircle, MapPin, Clock, ShieldCheck, Mail, ArrowUp } from 'lucide-react';
import { CompanySettings } from '../types';

interface FooterProps {
  settings: CompanySettings;
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#15232D] text-stone-300 pt-16 pb-24 md:pb-12 border-t border-[#20313E] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Columna 1: Identidad */}
          <div className="space-y-4">
            <div>
              <span className="font-serif-luxury text-xl font-bold tracking-wider text-white">
                COSTA TEXTIL
              </span>
              <p className="font-serif-luxury italic text-xs text-[#D9B79A] mt-0.5">
                "{settings.slogan}"
              </p>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Especialistas en telas exclusivas para camisería y sastrería de alta gama. Venta mayorista y minorista con cortes a medida y envíos a todo el territorio argentino.
            </p>
            <div className="pt-1">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{settings.whatsappDisplay}</span>
              </a>
            </div>
          </div>

          {/* Columna 2: Navegación Rápida */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Navegación
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('inicio')}
                  className="hover:text-white transition-colors text-left"
                >
                  Inicio &amp; Portada
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogo')}
                  className="hover:text-white transition-colors text-left"
                >
                  Catálogo Completo
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('buscar')}
                  className="hover:text-white transition-colors text-left"
                >
                  Buscador &amp; Asistente IA
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('novedades')}
                  className="hover:text-white transition-colors text-left"
                >
                  Novedades &amp; Ingresos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pedido')}
                  className="hover:text-white transition-colors text-left"
                >
                  Armado de Pedido
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-stone-400 hover:text-stone-200 transition-colors text-left"
                >
                  Panel de Gestión Costa Textil
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Sede & Atención */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Showroom &amp; Depósito
            </h4>
            <div className="space-y-2.5 text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D9B79A] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-medium">Showroom Monserrat</span>
                  <span>{settings.address}, {settings.addressFloorOffice}</span>
                  <span className="block">Ciudad Autónoma de Buenos Aires</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#D9B79A] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-medium">Horario de Atención</span>
                  <span>{settings.businessHours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna 4: Compromiso de Calidad */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Garantía Textil
            </h4>
            <p className="text-stone-400 leading-relaxed">
              Seleccionamos cada partida de hilados priorizando estabilidad dimensional, suavidad al tacto y durabilidad tras el lavado. No inventamos disponibilidad; informamos stock real con alternativas idóneas.
            </p>
            <div className="pt-2">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 text-xs text-[#D9B79A] hover:underline"
              >
                <span>Volver arriba</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Pie Inferior */}
        <div className="pt-8 border-t border-[#20313E] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            © {new Date().getFullYear()} Costa Textil. Todos los derechos reservados.
          </div>
          <div>
            Catálogo Digital Inteligente &amp; Armado de Pedidos
          </div>
        </div>
      </div>
    </footer>
  );
};
