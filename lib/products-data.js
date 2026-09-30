// Mock Dataset & State Repository for NIRAV Men's T-Shirts Collection

export const INITIAL_PRODUCTS = [
  {
    id: "nirav-ts-001",
    title: "NIRAV Heavyweight Acid Wash Oversized Tee",
    slug: "heavyweight-acid-wash-oversized-tee",
    category: "oversized",
    fitType: "Oversized Drop-Shoulder",
    price: 1499,
    originalPrice: 1999,
    rating: 4.9,
    reviewsCount: 148,
    badge: "BESTSELLER",
    fabric: "240 GSM 100% Bio-Washed Combed Cotton",
    description: "Signature oversized drop-shoulder graphic T-shirt featuring hand-processed acid wash texture, heavy bio-wash finish, and high-density NIRAV typography print.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Acid Charcoal", hex: "#2b2b2c" },
      { name: "Washed Crimson", hex: "#7a2222" },
      { name: "Vintage Black", hex: "#1a1a1a" }
    ],
    frontImage: "/images/products/ts-001-front.jpg",
    backImage: "/images/products/ts-001-hover.jpg",
    stock: 45,
    isFeatured: true,
    isBestseller: true
  },
  {
    id: "nirav-ts-002",
    title: "NIRAV Signature Crest Graphic Vintage Tee",
    slug: "signature-crest-graphic-vintage-tee",
    category: "graphic",
    fitType: "Relaxed Vintage Fit",
    price: 1299,
    originalPrice: 1699,
    rating: 4.8,
    reviewsCount: 96,
    badge: "NEW DROP",
    fabric: "220 GSM 100% Premium Cotton",
    description: "Retro street vintage T-shirt featuring classic NIRAV embroidered crest on chest and full-back luxury screen print.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Washed Off-White", hex: "#f5f0e6" },
      { name: "Midnight Navy", hex: "#1b2533" }
    ],
    frontImage: "/images/products/ts-002-front.jpg",
    backImage: "/images/products/ts-002-hover.jpg",
    stock: 30,
    isFeatured: true,
    isBestseller: false
  },
  {
    id: "nirav-ts-003",
    title: "NIRAV Luxury Silk-Cotton Blend Crew Tee",
    slug: "luxury-silk-cotton-blend-crew-tee",
    category: "luxury",
    fitType: "Tailored Slim Fit",
    price: 2499,
    originalPrice: 3299,
    rating: 5.0,
    reviewsCount: 62,
    badge: "COUTURE",
    fabric: "30% Mulberry Silk / 70% Extra-Long Staple Cotton",
    description: "Ultra-soft luxury t-shirt crafted from mulberry silk and organic extra-long staple cotton. Features subtle sheen and refined champagne gold stitch accent.",
    sizes: ["M", "L", "XL"],
    colors: [
      { name: "Champagne Ivory", hex: "#f0e6d2" },
      { name: "Onyx Black", hex: "#111111" }
    ],
    frontImage: "/images/products/ts-003-front.jpg",
    backImage: "/images/products/ts-003-hover.jpg",
    stock: 18,
    isFeatured: true,
    isBestseller: false
  },
  {
    id: "nirav-ts-004",
    title: "NIRAV Minimalist Organic Pique Polo Tee",
    slug: "minimalist-organic-pique-polo-tee",
    category: "polo",
    fitType: "Modern Regular Fit",
    price: 1799,
    originalPrice: 2299,
    rating: 4.7,
    reviewsCount: 84,
    badge: "ESSENTIAL",
    fabric: "230 GSM 100% Organic Pique Cotton",
    description: "Classic pique knit polo shirt featuring mother-of-pearl buttons, ribbed collar, and discrete tonal NIRAV emblem.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Obsidian Black", hex: "#141414" },
      { name: "Desert Sand", hex: "#d8c4a9" }
    ],
    frontImage: "/images/products/ts-004-front.jpg",
    backImage: "/images/products/ts-004-hover.jpg",
    stock: 50,
    isFeatured: false,
    isBestseller: true
  },
  {
    id: "nirav-ts-005",
    title: "NIRAV Raw Textured Japanese Cotton Tee",
    slug: "raw-textured-japanese-cotton-tee",
    category: "oversized",
    fitType: "Heavyweight Boxy Fit",
    price: 1899,
    originalPrice: 2499,
    rating: 4.9,
    reviewsCount: 110,
    badge: "LIMITED",
    fabric: "260 GSM Heavy Raw Slub Cotton",
    description: "Structured boxy T-shirt made from heavyweight Japanese raw slub cotton. Features chest pocket and drop-shoulder silhouette.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Raw Oatmeal", hex: "#e5ded4" },
      { name: "Charcoal Grey", hex: "#383838" }
    ],
    frontImage: "/images/products/ts-005-front.jpg",
    backImage: "/images/products/ts-005-hover.jpg",
    stock: 25,
    isFeatured: true,
    isBestseller: true
  },
  {
    id: "nirav-ts-006",
    title: "NIRAV Vintage Distressed Graphic Tee - V2",
    slug: "vintage-distressed-graphic-tee-v2",
    category: "graphic",
    fitType: "Oversized Street Fit",
    price: 1599,
    originalPrice: 2099,
    rating: 4.8,
    reviewsCount: 72,
    badge: "TRENDING",
    fabric: "240 GSM Bio-Washed Heavy Cotton",
    description: "Distressed edge detailing around collar and sleeves with vintage urban eagle artwork on back.",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Distressed Black", hex: "#1e1e1e" }
    ],
    frontImage: "/images/products/ts-006-front.jpg",
    backImage: "/images/products/ts-006-hover.jpg",
    stock: 35,
    isFeatured: false,
    isBestseller: false
  }
];

// Helper to get all products (stored in memory/session for dynamic Admin Add Product)
let currentProducts = [...INITIAL_PRODUCTS];

export function getProducts() {
  return currentProducts;
}

export function getProductBySlug(slug) {
  return currentProducts.find(p => p.slug === slug);
}

export function addProduct(productData) {
  const newProduct = {
    id: `nirav-ts-${Date.now()}`,
    slug: productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    rating: 5.0,
    reviewsCount: 1,
    badge: productData.badge || "NEW ARRIVAL",
    isFeatured: true,
    isBestseller: false,
    ...productData
  };
  currentProducts.unshift(newProduct);
  return newProduct;
}

export function updateProduct(id, updatedFields) {
  const index = currentProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    currentProducts[index] = { ...currentProducts[index], ...updatedFields };
    return currentProducts[index];
  }
  return null;
}

export function deleteProduct(id) {
  currentProducts = currentProducts.filter(p => p.id !== id);
  return true;
}
