import React from 'react';
import { Home, BookOpen, Search, Sparkles, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate }) => {
  const { totalItems } = useCart();

  const items = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'catalogo', label: 'Catálogo', icon: BookOpen },
    { id: 'buscar', label: 'Buscar', icon: Search },
    { id: 'novedades', label: 'Novedades', icon: Sparkles },
    { id: 'pedido', label: 'Pedido', icon: ShoppingBag, badge: totalItems > 0 ? totalItems : null },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-t border-[#E2DFD7] px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around">
        {items.map(item => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 min-w-[58px] rounded-lg transition-colors ${
                isActive
                  ? 'text-[#1A3644] font-semibold'
                  : 'text-[#64727D] hover:text-[#1A3644]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {item.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#1A3644] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#1A3644] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
