/**
 * Costa Textil — Definiciones de tipos del sistema
 * Diseñado para fácil conexión con Firestore / Cloud SQL
 */

export type AvailabilityStatus = 
  | 'disponible' 
  | 'poco_stock' 
  | 'agotado' 
  | 'dado_de_baja' 
  | 'consultar';

export type CategoryType = 'Camisería' | 'Sastrería' | 'Ambos';

export type FabricType = 
  | 'Oxford' 
  | 'Poplín' 
  | 'Batista' 
  | 'Twill' 
  | 'Jacquard' 
  | 'Lino' 
  | 'Sastrería' 
  | 'Seersucker'
  | 'Gabardina'
  | 'Otro';

export type ReplacementType = 
  | 'exacto' 
  | 'similar' 
  | 'alternativa' 
  | 'alternativa_premium' 
  | 'color_similar' 
  | 'misma_composicion' 
  | 'mismo_tipo';

export interface ProductReplacement {
  id: string;
  replacementProductId: string;
  replacementType: ReplacementType;
  reason: string;
  priority?: number;
}

export interface Product {
  id: string;
  articleCode: string; // ej: "17.154"
  name: string; // ej: "Algodón Pima Peruano"
  description: string;
  category: CategoryType;
  fabricType: FabricType;
  composition: string; // ej: "100% Algodón", "100% Lino"
  origin: string; // ej: "Perú", "Italia", "Suiza"
  color: string; // ej: "Blanco Óptico", "Celeste Cielo"
  colorFamily: string; // ej: "Blanco / Marfil", "Celeste / Azul"
  width: string; // ej: "1.50 m"
  weightGsm?: string; // ej: "115 g/m²"
  yarnCount?: string; // ej: "80/2", "100/2", "120/2"
  availableMeters: number | null; // Metros reales o null si es a consultar
  availabilityStatus: AvailabilityStatus;
  imageUrl: string;
  gallery?: string[];
  isNew: boolean;
  isFeatured: boolean;
  isDiscontinued: boolean;
  discontinuedReason?: string;
  tags: string[];
  replacements: ProductReplacement[];
  createdAt: string;
  updatedAt: string;
}

export type NewsType = 
  | 'nuevo_ingreso' 
  | 'reposicion' 
  | 'baja' 
  | 'comunicado' 
  | 'coleccion';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  imageUrl: string;
  type: NewsType;
  relatedProductIds: string[];
  published: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  articleCode: string;
  name: string;
  composition: string;
  color: string;
  imageUrl: string;
  meters: number;
  availabilityStatus: AvailabilityStatus;
  notes?: string;
}

export type OrderStatus = 
  | 'nuevo' 
  | 'en_revision' 
  | 'confirmado' 
  | 'parcial' 
  | 'sin_disponibilidad' 
  | 'finalizado';

export interface OrderRequest {
  id: string;
  customerName: string;
  company?: string;
  phone: string;
  email?: string;
  location: string;
  items: OrderItem[];
  notes?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  slogan: string;
  whatsappNumber: string; // Para links: "5491155551234"
  whatsappDisplay: string; // "+54 9 11 5555-1234"
  email: string;
  phone: string;
  address: string;
  addressFloorOffice: string;
  neighborhood: string;
  city: string;
  businessHours: string;
  instagramHandle: string;
  instagramUrl: string;
  commercialNotice: string;
  minimumOrderText: string;
  newBadgeDays: number;
  adminPin: string; // Clave de acceso al panel de administración (default "costa2026")
}

export interface FilterState {
  searchQuery: string;
  category: string;
  composition: string;
  fabricType: string;
  origin: string;
  availability: string;
  colorFamily: string;
  onlyFeatured: boolean;
  onlyNew: boolean;
  sortBy: 'relevance' | 'code_asc' | 'name_asc' | 'newest';
}
