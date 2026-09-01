import type { Category, Product, Settings } from "./types";

/* Images Pexels (libres de droits) utilisées pour la démo */

const img = (id: number, ext: "jpeg" | "png" = "jpeg") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`;

export const defaultSettings: Settings = {
  storeName: "StepStore",
  storeNameAr: "ستيب ستور",
  logoUrl: "",
  primaryColor: "#FF5C1A",
  bgColor: "#FFFFFF",
  textColor: "#0F0F0F",
  surfaceColor: "#F6F3EF",
  heroBadge: "Nouvelle collection 2026",
  heroBadgeAr: "تشكيلة جديدة 2026",
  heroTitle: "Des sneakers qui font vibrer la rue",
  heroTitleAr: "أحذية رياضية تهزّ الشارع",
  heroSubtitle:
    "Du terrain à la rue : notre sélection de chaussures tendance, sélectionnées pour le style et la performance. Qualité premium, prix imbattables.",
  heroSubtitleAr:
    "من المضمار إلى الشارع: تشكيلة أحذية عصرية مختارة بعناية بين الأناقة والأداء. جودة ممتازة وأسعار لا تُنافس.",
  sectionCategories: "Nos catégories",
  sectionCategoriesAr: "فئاتنا",
  sectionPopular: "Les plus populaires",
  sectionPopularAr: "الأكثر رواجاً",
  promoMessage:
    "Livraison offerte dès 7000 DA · Retours gratuits 30 jours · -30% sur la collection Running",
  promoMessageAr:
    "توصيل مجاني ابتداءً من 7000 دج · إرجاع مجاني خلال 30 يوماً · خصم 30% على مجموعة الجري",
  promoTitle: "Mega Promo Running",
  promoTitleAr: "عرض ضخم على الجري",
  promoText:
    "Toute la collection Running à -30% cette semaine. Vite, l'offre se termine dimanche !",
  promoTextAr:
    "مجموعة الجري كاملة بخصم 30% هذا الأسبوع. سارع، العرض ينتهي يوم الأحد!",
  heroImage: img(28645957),
  promoImage: img(29798037),
  footerText:
    "Le spécialiste des sneakers en ligne depuis 2018. Authentiques, toujours.",
  footerTextAr:
    "متخصصون في الأحذية الرياضية عبر الإنترنت منذ 2018. أصلي دائماً.",
  freeShippingFrom: 7000,
  adminPassword: "admin123",
  whatsappNumber: "",
};

export const demoCategories: Category[] = [
  { id: "running", name: "Running", emoji: "🏃", image: img(17931250) },
  { id: "basketball", name: "Basketball", emoji: "🏀", image: img(17918935) },
  { id: "lifestyle", name: "Lifestyle", emoji: "👟", image: img(28645956) },
  { id: "skate", name: "Skate", emoji: "🛹", image: img(28144050) },
  { id: "training", name: "Training", emoji: "💪", image: img(11324518) },
  { id: "limited", name: "Édition limitée", emoji: "🔥", image: img(14447345) },
];

export const demoProducts: Product[] = [
  {
    id: "runner-flux-2",
    name: "Runner Flux 2.0",
    brand: "Nike",
    category: "running",
    price: 12990,
    oldPrice: 15990,
    description:
      "La Runner Flux 2.0 combine une mousse ultra-réactive et un mesh aéré pour des kilomètres sans effort. Semelle extérieure en caoutchouc haute adhérence, idéale pour le bitume comme pour les sentiers légers.",
    images: [img(26852035), img(11962357)],
    colors: [
      { name: "Gris", hex: "#9AA0A6" },
      { name: "Noir", hex: "#1F1F1F" },
      { name: "Blanc", hex: "#F5F5F5" },
    ],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    popular: true,
    stock: 24,
    rating: 4.8,
  },
  {
    id: "court-vision-pro",
    name: "Court Vision Pro",
    brand: "Nike",
    category: "basketball",
    price: 14990,
    description:
      "Taillée pour le terrain, la Court Vision Pro offre un maintien latéral renforcé, un amorti Air au talon et une traction multidirectionnelle pour des changements de direction explosifs.",
    images: [img(17918935), img(18946639)],
    colors: [
      { name: "Noir", hex: "#1A1A1A" },
      { name: "Rouge", hex: "#D92B2B" },
      { name: "Blanc", hex: "#F1F1F1" },
    ],
    sizes: ["40", "41", "42", "43", "44", "45", "46"],
    popular: true,
    stock: 16,
    rating: 4.7,
  },
  {
    id: "street-classic",
    name: "Street Classic",
    brand: "Vans",
    category: "skate",
    price: 7990,
    oldPrice: 9490,
    description:
      "La Street Classic est le symbole du skate depuis des décennies. Toile robuste, semelle gaufrée iconique et col rembourré : le classique indémodable, à l'aise partout.",
    images: [img(11324548), img(29798037)],
    colors: [
      { name: "Blanc", hex: "#F4F4F4" },
      { name: "Rouge", hex: "#C62F2F" },
    ],
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
    popular: true,
    stock: 38,
    rating: 4.6,
  },
  {
    id: "neon-runner",
    name: "Neon Runner",
    brand: "Adidas",
    category: "running",
    price: 13990,
    description:
      "Branchez-vous sur la ville avec la Neon Runner : amorti Boost, tige Primeknit respirante et détails réfléchissants pour courir en toute sécurité, de jour comme de nuit.",
    images: [img(29541463), img(10396605)],
    colors: [
      { name: "Néon", hex: "#39FF88" },
      { name: "Violet", hex: "#7B2FD6" },
      { name: "Noir", hex: "#111111" },
    ],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    popular: true,
    stock: 12,
    rating: 4.9,
  },
  {
    id: "aero-trainer",
    name: "Aero Trainer",
    brand: "New Balance",
    category: "training",
    price: 11990,
    description:
      "Stabilité et confort : l'Aero Trainer est pensée pour les séances intensives en salle. Tige en mesh technique, semelle à double densité et renforts au talon pour un appui parfait.",
    images: [img(8473456), img(1750045)],
    colors: [
      { name: "Gris", hex: "#8E8E93" },
      { name: "Blanc", hex: "#F2F2F2" },
    ],
    sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
    popular: false,
    stock: 21,
    rating: 4.5,
  },
  {
    id: "canvas-high",
    name: "Canvas High",
    brand: "Converse",
    category: "lifestyle",
    price: 7490,
    description:
      "L'icône intemporelle en montante. Toile de coton épaisse, semelle en gomme et silhouette reconnaissable entre toutes : la Canvas High se porte avec tout, partout, toujours.",
    images: [img(4271694), img(11827631)],
    colors: [
      { name: "Noir", hex: "#181818" },
      { name: "Rose", hex: "#F0A6C4" },
      { name: "Blanc", hex: "#F7F7F7" },
    ],
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    popular: true,
    stock: 30,
    rating: 4.7,
  },
  {
    id: "cloud-ride",
    name: "Cloud Ride",
    brand: "Adidas",
    category: "running",
    price: 10990,
    oldPrice: 13990,
    description:
      "Une sensation d'apesanteur à chaque foulée. La Cloud Ride offre un amorti souple et un drop équilibré qui accompagnent les coureurs réguliers sur route comme sur piste.",
    images: [img(1750045), img(26852035)],
    colors: [
      { name: "Gris", hex: "#A8ADB5" },
      { name: "Rose", hex: "#F5B8C9" },
    ],
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    popular: false,
    stock: 18,
    rating: 4.4,
  },
  {
    id: "urban-low",
    name: "Urban Low",
    brand: "Puma",
    category: "lifestyle",
    price: 8990,
    description:
      "Un design épuré inspiré des archives Puma, revisité pour la ville. Cuir synthétique premium, confort quotidien et détails rétro : la Urban Low accompagne tous vos looks.",
    images: [img(28645956), img(1631786)],
    colors: [
      { name: "Beige", hex: "#D9C7A7" },
      { name: "Blanc", hex: "#F0F0F0" },
      { name: "Noir", hex: "#141414" },
    ],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    popular: false,
    stock: 26,
    rating: 4.5,
  },
  {
    id: "retro-bounce",
    name: "Retro Bounce",
    brand: "Nike",
    category: "limited",
    price: 19990,
    description:
      "Édition limitée — seulement 500 paires produites. La Retro Bounce réinvente un modèle culte avec un amorti modernisé et une palette audacieuse. Numérotée et livrée en boîte collector.",
    images: [img(14447345), img(28144050)],
    colors: [
      { name: "Rouge", hex: "#D92B2B" },
      { name: "Orange", hex: "#F26A1B" },
    ],
    sizes: ["40", "41", "42", "43", "44"],
    popular: true,
    stock: 5,
    rating: 4.9,
  },
  {
    id: "vector-speed",
    name: "Vector Speed",
    brand: "Puma",
    category: "running",
    price: 9990,
    oldPrice: 12490,
    description:
      "Légèreté maximale et propulsion optimisée : la Vector Speed est conçue pour battre vos records personnels. Plaque de propulsion et mousse Nitro pour un retour d'énergie incomparable.",
    images: [img(17931250), img(9117612)],
    colors: [
      { name: "Bleu", hex: "#2E5FD0" },
      { name: "Blanc", hex: "#F3F3F3" },
    ],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    popular: true,
    stock: 20,
    rating: 4.6,
  },
  {
    id: "daily-canvas",
    name: "Daily Canvas",
    brand: "Converse",
    category: "lifestyle",
    price: 6990,
    description:
      "La basse essentielle du quotidien. Toile respirante, semelle amortie améliorée et couleurs faciles à porter : la Daily Canvas devient vite votre paire préférée.",
    images: [img(4271700), img(18946639)],
    colors: [
      { name: "Noir", hex: "#1C1C1C" },
      { name: "Gris", hex: "#9FA5AB" },
    ],
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
    popular: false,
    stock: 33,
    rating: 4.4,
  },
  {
    id: "strike-court",
    name: "Strike Court",
    brand: "Adidas",
    category: "basketball",
    price: 13490,
    description:
      "Dominez la raquette : la Strike Court allie tige renforcée, amorti Bounce et semelle enveloppante pour un confort et un grip exceptionnels sur tous les terrains.",
    images: [img(14525668), img(11324518)],
    colors: [
      { name: "Bleu", hex: "#1F4FD8" },
      { name: "Rouge", hex: "#C62F2F" },
      { name: "Noir", hex: "#101010" },
    ],
    sizes: ["40", "41", "42", "43", "44", "45", "46"],
    popular: false,
    stock: 15,
    rating: 4.6,
  },
];
