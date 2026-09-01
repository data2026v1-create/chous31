/** Modèles de données — StepStore */

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string; // id de catégorie
  price: number;
  oldPrice?: number;
  description: string;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  popular: boolean;
  stock: number;
  rating: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  emoji: string;
}

export interface Settings {
  storeName: string;
  storeNameAr: string;
  logoUrl: string;
  primaryColor: string;
  bgColor: string;
  textColor: string;
  surfaceColor: string;
  heroBadge: string;
  heroBadgeAr: string;
  heroTitle: string;
  heroTitleAr: string;
  heroSubtitle: string;
  heroSubtitleAr: string;
  sectionCategories: string;
  sectionCategoriesAr: string;
  sectionPopular: string;
  sectionPopularAr: string;
  promoMessage: string;
  promoMessageAr: string;
  promoTitle: string;
  promoTitleAr: string;
  promoText: string;
  promoTextAr: string;
  heroImage: string;
  promoImage: string;
  footerText: string;
  footerTextAr: string;
  freeShippingFrom: number;
  adminPassword: string;
  whatsappNumber: string;
}

export interface CartItem {
  id: string;
  productId: string;
  size: string;
  color: string;
  qty: number;
}

export interface ToastMsg {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export type DataMode = "demo" | "sheets";

/** Réponse standard de l'API Google Apps Script */
export interface SheetsResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SheetsAllData {
  products: Product[];
  categories: Category[];
  settings: Settings;
}
