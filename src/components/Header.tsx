import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  ShoppingBag, 
  Search, 
  Sparkles, 
  BookOpen, 
  Home, 
  Phone, 
  Lock, 
  MessageCircle 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CompanySettings } from '../types';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  settings: CompanySettings;
  onOpenContact: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  settings,
  onOpenContact,
  onOpenAdmin,
}) => {
  const { totalItems, totalMeters } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'catalogo', label: 'Catálogo', icon: BookOpen },
    { id: 'buscar', label: 'Buscar & Asistente', icon: Search },
    { id: 'novedades', label: 'Novedades', icon: Sparkles },
    { id: 'pedido', label: 'Solicitud de Pedido', icon: ShoppingBag, badge: totalItems > 0 ? totalItems : null },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola Costa Textil, quisiera realizar una consulta sobre telas para camisería y sastrería.')}`;

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-[#E7E5DF] transition-all">
      {/* Barra superior de anuncios y atención */}
      <div className="bg-[#1A3644] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium tracking-wide">
              Showroom Alsina 1170, 3° 304 (Monserrat) · Lun a Vie 8 a 16 hs
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-stone-300">
            <span>Cortes a medida y piezas cerradas</span>
            <span className="text-stone-500">|</span>
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors flex items-center gap-1.5 font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              WhatsApp: {settings.whatsappDisplay}
            </a>
          </div>
        </div>
      </div>

      {/* Cabecera Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo e Identidad */}
          <div 
            id="brand-logo"
            onClick={() => handleNavClick('inicio')}
            className="cursor-pointer group flex flex-col justify-center"
          >
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-wider text-[#1A2228] group-hover:text-[#1A3644] transition-colors">
                COSTA TEXTIL
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] uppercase font-semibold tracking-widest bg-[#EFECE6] text-[#55636E] rounded">
                Camisería & Sastrería
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#6E7B85] tracking-wide font-normal">
              {settings.slogan}
            </p>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#1A3644] text-white shadow-sm'
                      : 'text-[#3E4C56] hover:text-[#1A3644] hover:bg-[#EFECE6]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6E7B85]'}`} />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-[#1A3644]' : 'bg-[#1A3644] text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Acciones Rápidas (Desktop & Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón WhatsApp directo */}
            <a
              id="header-whatsapp-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1A3644] bg-[#EAF2F5] hover:bg-[#D9E9EF] rounded-md transition-colors border border-[#BDD9E4]"
              title="Consultar por WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Consultar</span>
            </a>

            {/* Carrito de Pedido resumen */}
            <button
              id="header-cart-btn"
              onClick={() => onNavigate('pedido')}
              className="relative p-2.5 rounded-md text-[#1A3644] hover:bg-[#EFECE6] transition-colors border border-[#E0DCD3] flex items-center gap-2"
              title="Ver Solicitud de Pedido"
            >
              <ShoppingBag className="w-5 h-5 text-[#1A3644]" />
              {totalItems > 0 && (
                <div className="flex items-center gap-1 text-xs font-bold text-[#1A3644]">
                  <span className="hidden sm:inline">{totalMeters}m</span>
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold text-white bg-[#1A3644] rounded-full">
                    {totalItems}
                  </span>
                </div>
              )}
            </button>

            {/* Contacto modal */}
            <button
              id="header-contact-btn"
              onClick={onOpenContact}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#4B5863] hover:text-[#1A3644] hover:bg-[#EFECE6] rounded-md transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#6E7B85]" />
              <span>Contacto</span>
            </button>

            {/* Acceso Admin */}
            <button
              id="header-admin-btn"
              onClick={onOpenAdmin}
              className="p-2 text-[#7C8B95] hover:text-[#1A3644] hover:bg-[#EFECE6] rounded-md transition-colors"
              title="Panel Administrativo"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Botón Menú Mobile */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-[#1A2228] hover:bg-[#EFECE6] transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Mobile Desplegable */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7E5DF] bg-[#FBFBF9] px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          <div className="px-2 py-1 text-xs text-[#7A8892] uppercase font-semibold tracking-wider">
            Navegación
          </div>
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1A3644] text-white'
                    : 'text-[#303B42] hover:bg-[#EFECE6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-[#1A3644]' : 'bg-[#1A3644] text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-[#E7E5DF] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-md text-sm font-medium text-[#404D56] hover:bg-[#EFECE6]"
            >
              <Phone className="w-4 h-4 text-[#6E7B85]" />
              <span>Ver Ubicación, Horarios y Contacto</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-white bg-[#1A3644] hover:bg-[#254657] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
