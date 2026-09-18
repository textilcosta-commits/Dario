/**
 * Costa Textil — Capa de Servicios y Abstracción de Datos
 * 
 * PUNTO DE INTEGRACIÓN DE BASE DE DATOS:
 * Este servicio centraliza todas las consultas y mutaciones de datos.
 * Actualmente implementa persistencia reactiva en memoria / localStorage
 * y sincronización con endpoints del backend (/api/*).
 * 
 * Para conectar Firebase Firestore o PostgreSQL / Cloud SQL:
 * Solo es necesario reemplazar las funciones de este archivo con llamadas
 * a `collection(db, 'products')`, etc. La interfaz hacia los componentes UI
 * permanecerá 100% idéntica.
 */

import { Product, NewsItem, CompanySettings, OrderRequest, ProductReplacement, ReplacementType, OrderStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_NEWS, INITIAL_SETTINGS, INITIAL_ORDERS } from '../data/mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'costa_textil_products_v1',
  NEWS: 'costa_textil_news_v1',
  SETTINGS: 'costa_textil_settings_v1',
  ORDERS: 'costa_textil_orders_v1',
};

// Carga segura desde localStorage o datos demo por defecto
function loadInitial<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.warn(`Error leyendo ${key} desde localStorage:`, err);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error guardando ${key} en localStorage:`, err);
  }
}

class DataService {
  private products: Product[] = [];
  private news: NewsItem[] = [];
  private settings: CompanySettings = INITIAL_SETTINGS;
  private orders: OrderRequest[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    this.products = loadInitial<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.news = loadInitial<NewsItem[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    this.settings = loadInitial<CompanySettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    this.orders = loadInitial<OrderRequest[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  public subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // ==========================================
  // ARTÍCULOS / PRODUCTOS
  // ==========================================

  public async getProducts(): Promise<Product[]> {
    return [...this.products];
  }

  public getProductsSync(): Product[] {
    return [...this.products];
  }

  public async getProductById(id: string): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }

  public async getProductByCode(code: string): Promise<Product | undefined> {
    const cleanCode = code.trim().toLowerCase().replace(/[^0-9a-z]/g, '');
    return this.products.find(p => 
      p.articleCode.toLowerCase().replace(/[^0-9a-z]/g, '') === cleanCode
    );
  }

  public async saveProduct(product: Partial<Product> & { articleCode: string; name: string }): Promise<Product> {
    const now = new Date().toISOString();
    let updatedProduct: Product;

    if (product.id) {
      // Editar existente
      const index = this.products.findIndex(p => p.id === product.id);
      if (index !== -1) {
        updatedProduct = {
          ...this.products[index],
          ...product,
          updatedAt: now,
        };
        this.products[index] = updatedProduct;
      } else {
        throw new Error("Artículo no encontrado");
      }
    } else {
      // Crear nuevo
      const id = `prod-${Date.now()}`;
      updatedProduct = {
        id,
        articleCode: product.articleCode,
        name: product.name,
        description: product.description || '',
        category: product.category || 'Camisería',
        fabricType: product.fabricType || 'Poplín',
        composition: product.composition || '100% Algodón',
        origin: product.origin || 'Perú',
        color: product.color || 'Blanco',
        colorFamily: product.colorFamily || 'Blanco / Marfil',
        width: product.width || '1.50 m',
        weightGsm: product.weightGsm || '',
        yarnCount: product.yarnCount || '',
        availableMeters: product.availableMeters !== undefined ? product.availableMeters : 100,
        availabilityStatus: product.availabilityStatus || 'disponible',
        imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
        isNew: product.isNew !== undefined ? product.isNew : true,
        isFeatured: product.isFeatured || false,
        isDiscontinued: product.isDiscontinued || false,
        tags: product.tags || [],
        replacements: product.replacements || [],
        createdAt: now,
        updatedAt: now,
      };
      this.products.unshift(updatedProduct);
    }

    saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
    return updatedProduct;
  }

  public async createProduct(product: Partial<Product> & { articleCode: string; name: string }): Promise<Product> {
    return this.saveProduct(product);
  }

  public async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const existing = this.products.find(p => p.id === id);
    if (!existing) throw new Error("Artículo no encontrado");
    return this.saveProduct({ ...existing, ...product, id });
  }

  public async deleteProduct(id: string): Promise<void> {
    this.products = this.products.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
  }

  public async addReplacementRule(
    productId: string, 
    targetId: string, 
    type: ReplacementType, 
    reason: string
  ): Promise<void> {
    const p = this.products.find(item => item.id === productId);
    if (!p) return;
    if (!p.replacements) p.replacements = [];
    p.replacements.push({
      id: `rep-${Date.now()}`,
      replacementProductId: targetId,
      replacementType: type,
      reason: reason,
      priority: p.replacements.length + 1
    });
    saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
  }

  public async discontinueProduct(id: string, reason?: string, replacementIds: string[] = []): Promise<Product> {
    const product = this.products.find(p => p.id === id);
    if (!product) throw new Error("Artículo no encontrado");

    // Construir lista de reemplazos si se especifican
    const newReplacements: ProductReplacement[] = replacementIds.map((rId, idx) => ({
      id: `rep-${Date.now()}-${idx}`,
      replacementProductId: rId,
      replacementType: idx === 0 ? 'similar' : 'alternativa',
      reason: "Alternativa sugerida por el equipo de Costa Textil tras baja de stock",
      priority: idx + 1
    }));

    product.isDiscontinued = true;
    product.availabilityStatus = 'dado_de_baja';
    product.availableMeters = 0;
    product.discontinuedReason = reason || "Artículo discontinuado por finalización de lote del fabricante.";
    if (newReplacements.length > 0) {
      product.replacements = newReplacements;
    }
    product.updatedAt = new Date().toISOString();

    // Crear automáticamente una novedad si corresponde
    await this.saveNews({
      title: `Aviso de Discontinuación: Art. ${product.articleCode} ${product.name}`,
      description: `El artículo ${product.articleCode} ha sido dado de baja. Conocé los reemplazos y alternativas disponibles.`,
      content: `Informamos que el artículo ${product.articleCode} (${product.name}) ha sido dado de baja. Recomendamos consultar los artículos sustitutos vinculados en el catálogo.`,
      imageUrl: product.imageUrl,
      type: 'baja',
      relatedProductIds: [product.id, ...replacementIds],
      published: true,
    });

    saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
    return product;
  }

  public async reactivateProduct(id: string, meters: number = 50): Promise<Product> {
    const product = this.products.find(p => p.id === id);
    if (!product) throw new Error("Artículo no encontrado");

    product.isDiscontinued = false;
    product.availabilityStatus = 'disponible';
    product.availableMeters = meters;
    product.updatedAt = new Date().toISOString();

    // Crear automáticamente novedad de reposición
    await this.saveNews({
      title: `Artículo Nuevamente Disponible: Art. ${product.articleCode} ${product.name}`,
      description: `Reingresó al catálogo el artículo ${product.articleCode} (${product.composition}) listo para corte inmediato.`,
      content: `Confirmamos la reposición de stock del artículo ${product.articleCode}. Ya podés consultar disponiblidad y solicitar metros para tu confección.`,
      imageUrl: product.imageUrl,
      type: 'reposicion',
      relatedProductIds: [product.id],
      published: true,
    });

    saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
    return product;
  }

  // ==========================================
  // SISTEMA DE REEMPLAZOS INTELIGENTE
  // ==========================================

  public getReplacementsForProduct(product: Product): {
    replacementProduct: Product;
    replacementType: string;
    reason: string;
  }[] {
    const results: { replacementProduct: Product; replacementType: string; reason: string }[] = [];
    const seenIds = new Set<string>();

    // 1. Reemplazos explícitos asignados por Costa Textil en la ficha
    if (product.replacements && product.replacements.length > 0) {
      for (const rep of product.replacements) {
        const repProd = this.products.find(p => p.id === rep.replacementProductId);
        if (repProd && !seenIds.has(repProd.id) && !repProd.isDiscontinued) {
          results.push({
            replacementProduct: repProd,
            replacementType: rep.replacementType,
            reason: rep.reason,
          });
          seenIds.add(repProd.id);
        }
      }
    }

    // 2. Si no hay suficientes reemplazos manuales, motor asistido de reemplazo:
    // Busca automáticamente telas activas con misma composición, color o tipo
    if (results.length < 3) {
      const candidates = this.products.filter(p => 
        p.id !== product.id && 
        !p.isDiscontinued && 
        !seenIds.has(p.id) &&
        p.availabilityStatus !== 'agotado'
      );

      // Prioridad a) Misma composición y mismo tipo
      for (const cand of candidates) {
        if (results.length >= 3) break;
        if (cand.composition === product.composition && cand.fabricType === product.fabricType) {
          results.push({
            replacementProduct: cand,
            replacementType: 'similar',
            reason: `${cand.composition} · mismo tipo (${cand.fabricType}) y caída equivalente`
          });
          seenIds.add(cand.id);
        }
      }

      // Prioridad b) Misma categoría y gama de color
      for (const cand of candidates) {
        if (results.length >= 3) break;
        if (!seenIds.has(cand.id) && cand.colorFamily === product.colorFamily && cand.category === product.category) {
          results.push({
            replacementProduct: cand,
            replacementType: 'color_similar',
            reason: `Gama cromática afín (${cand.color}) · disponible en stock`
          });
          seenIds.add(cand.id);
        }
      }

      // Prioridad c) Misma composición básica
      for (const cand of candidates) {
        if (results.length >= 3) break;
        if (!seenIds.has(cand.id) && cand.composition.includes('Algodón') && product.composition.includes('Algodón')) {
          results.push({
            replacementProduct: cand,
            replacementType: 'misma_composicion',
            reason: `Base 100% fibra natural · disponible para confección`
          });
          seenIds.add(cand.id);
        }
      }
    }

    return results;
  }

  // ==========================================
  // NOVEDADES
  // ==========================================

  public async getNews(): Promise<NewsItem[]> {
    return [...this.news].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getNewsSync(): NewsItem[] {
    return [...this.news].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async saveNews(item: Partial<NewsItem> & { title: string; description: string }): Promise<NewsItem> {
    const now = new Date().toISOString();
    let updatedNews: NewsItem;

    if (item.id) {
      const index = this.news.findIndex(n => n.id === item.id);
      if (index !== -1) {
        updatedNews = { ...this.news[index], ...item };
        this.news[index] = updatedNews;
      } else {
        throw new Error("Novedad no encontrada");
      }
    } else {
      updatedNews = {
        id: `news-${Date.now()}`,
        title: item.title,
        description: item.description,
        content: item.content || item.description,
        imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
        type: item.type || 'nuevo_ingreso',
        relatedProductIds: item.relatedProductIds || [],
        published: item.published !== undefined ? item.published : true,
        createdAt: now,
      };
      this.news.unshift(updatedNews);
    }

    saveToStorage(STORAGE_KEYS.NEWS, this.news);
    this.notify();
    return updatedNews;
  }

  public async createNewsItem(item: Partial<NewsItem> & { title: string; description: string }): Promise<NewsItem> {
    return this.saveNews(item);
  }

  public async deleteNews(id: string): Promise<void> {
    this.news = this.news.filter(n => n.id !== id);
    saveToStorage(STORAGE_KEYS.NEWS, this.news);
    this.notify();
  }

  public async deleteNewsItem(id: string): Promise<void> {
    return this.deleteNews(id);
  }

  // ==========================================
  // SOLICITUDES DE PEDIDO
  // ==========================================

  public async getOrders(): Promise<OrderRequest[]> {
    return [...this.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrdersSync(): OrderRequest[] {
    return [...this.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async submitOrder(orderData: Omit<OrderRequest, 'id' | 'createdAt' | 'status'>): Promise<OrderRequest> {
    const newOrder: OrderRequest = {
      ...orderData,
      id: `ord-${Date.now().toString().slice(-4)}`,
      status: 'nuevo',
      createdAt: new Date().toISOString()
    };

    this.orders.unshift(newOrder);
    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();

    // Intentar sincronizar con backend si está activo
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      }).catch(() => {});
    } catch {
      // Operación en cliente garantizada
    }

    return newOrder;
  }

  public async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderRequest> {
    const order = this.orders.find(o => o.id === id);
    if (!order) throw new Error("Pedido no encontrado");

    order.status = status;
    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();
    return order;
  }

  // ==========================================
  // CONFIGURACIÓN DE LA EMPRESA
  // ==========================================

  public async getSettings(): Promise<CompanySettings> {
    return { ...this.settings };
  }

  public getCompanySettings(): CompanySettings {
    return { ...this.settings };
  }

  public async saveSettings(newSettings: Partial<CompanySettings>): Promise<CompanySettings> {
    this.settings = { ...this.settings, ...newSettings };
    saveToStorage(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify();
    return { ...this.settings };
  }

  public async saveCompanySettings(newSettings: CompanySettings): Promise<CompanySettings> {
    return this.saveSettings(newSettings);
  }

  // Reset a valores iniciales de DEMO (para pruebas en panel admin)
  public async resetDemoData(): Promise<void> {
    this.products = [...INITIAL_PRODUCTS];
    this.news = [...INITIAL_NEWS];
    this.settings = { ...INITIAL_SETTINGS };
    this.orders = [...INITIAL_ORDERS];
    saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
    saveToStorage(STORAGE_KEYS.NEWS, this.news);
    saveToStorage(STORAGE_KEYS.SETTINGS, this.settings);
    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();
  }

  public resetToDemo(): void {
    this.resetDemoData();
  }
}

export const dataService = new DataService();
