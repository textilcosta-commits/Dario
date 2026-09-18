import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { CatalogView } from './components/CatalogView';
import { SearchView } from './components/SearchView';
import { NewsView } from './components/NewsView';
import { OrderView } from './components/OrderView';
import { AdminView } from './components/AdminView';
import { ProductModal } from './components/ProductModal';
import { ContactModal } from './components/ContactModal';
import { dataService } from './services/dataService';
import { Product, NewsItem, CompanySettings, FilterState } from './types';
import { MessageCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('inicio');
  const [products, setProducts] = useState<Product[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(dataService.getCompanySettings());
  
  // Modales
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);

  // Estados compartidos de búsqueda
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMode, setSearchMode] = useState<'search' | 'replacement' | 'assistant'>('search');
  const [catalogFilter, setCatalogFilter] = useState<Partial<FilterState>>({});

  // Carga inicial y reactiva de datos
  const refreshData = () => {
    setProducts(dataService.getProductsSync());
    setNews(dataService.getNewsSync());
    setSettings(dataService.getCompanySettings());
  };

  useEffect(() => {
    refreshData();
    // Suscribirse a cambios en storage
    window.addEventListener('storage', refreshData);
    return () => window.removeEventListener('storage', refreshData);
  }, []);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroSearch = (query: string) => {
    setSearchQuery(query);
    setSearchMode('search');
    setCurrentTab('buscar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReplacementFinder = () => {
    setSearchMode('replacement');
    setCurrentTab('buscar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProductById = (productId: string) => {
    const found = products.find(p => p.id === productId);
    if (found) {
      setSelectedProduct(found);
    }
  };

  const whatsappDirectUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola Costa Textil, quisiera hacer una consulta sobre telas y pedidos.')}`;

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#1A2228] font-sans antialiased selection:bg-[#1A3644] selection:text-white">
        {/* Cabecera Principal */}
        <Header
          currentTab={currentTab}
          onNavigate={handleNavigate}
          settings={settings}
          onOpenContact={() => setIsContactOpen(true)}
          onOpenAdmin={() => handleNavigate('admin')}
        />

        {/* Contenido Principal según Pestaña Activa */}
        <main className="flex-1">
          {currentTab === 'inicio' && (
            <HomeView
              products={products}
              news={news}
              settings={settings}
              onNavigate={handleNavigate}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onSearchQuery={handleHeroSearch}
              onOpenReplacementFinder={handleOpenReplacementFinder}
            />
          )}

          {currentTab === 'catalogo' && (
            <CatalogView
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              initialFilter={catalogFilter}
            />
          )}

          {currentTab === 'buscar' && (
            <SearchView
              products={products}
              settings={settings}
              onSelectProduct={(p) => setSelectedProduct(p)}
              initialQuery={searchQuery}
              initialMode={searchMode}
            />
          )}

          {currentTab === 'novedades' && (
            <NewsView
              news={news}
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
            />
          )}

          {currentTab === 'pedido' && (
            <OrderView
              settings={settings}
              onNavigate={handleNavigate}
              onSelectProductById={handleSelectProductById}
            />
          )}

          {currentTab === 'admin' && (
            <AdminView
              products={products}
              news={news}
              settings={settings}
              onRefreshData={refreshData}
              onSelectProduct={(p) => setSelectedProduct(p)}
            />
          )}
        </main>

        {/* Modal de Ficha Técnica de Artículo & Sistema de Reemplazos */}
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={(p) => setSelectedProduct(p)}
          settings={settings}
        />

        {/* Modal de Contacto y Showroom */}
        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          settings={settings}
        />

        {/* Botón flotante directo WhatsApp */}
        <a
          id="floating-whatsapp-btn"
          href={whatsappDirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 lg:bottom-8 right-5 z-40 p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center group"
          title="Consultar por WhatsApp con Costa Textil"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out px-0 group-hover:px-2 text-xs font-bold">
            WhatsApp Costa Textil
          </span>
        </a>

        {/* Navegación Inferior Mobile */}
        <BottomNav
          currentTab={currentTab}
          onNavigate={handleNavigate}
        />

        {/* Pie de Página */}
        <Footer
          settings={settings}
          onNavigate={handleNavigate}
        />
      </div>
    </CartProvider>
  );
}
