import { getCategoryFallbackImage } from "../utils/categories";

export interface DummyJsonProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: Array<{
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }>;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  meta?: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  images: string[];
  thumbnail: string;
}

export interface DummyJsonProductsResponse {
  products: DummyJsonProduct[];
  total: number;
  skip: number;
  limit: number;
}

export interface DummyJsonCategory {
  slug: string;
  name: string;
  url: string;
}

export interface DummyJsonAuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface StockItem {
  id: string; // Display SKU or ID string
  productId: number; // Raw integer ID for API routes
  name: string;
  category: string;
  price: number;
  stock: number;
  location: string;
  description: string;
  thumbnail: string;
  images: string[];
  brand?: string;
  sku: string;
}

export function toStockItem(product: DummyJsonProduct, overrideStock?: number): StockItem {
  const displaySku = product.sku || `SKU-${String(product.id).padStart(4, "0")}`;
  const bayNumber = (product.id % 12) + 1;
  const storeLetter = String.fromCharCode(65 + (product.id % 4));

  return {
    id: displaySku,
    productId: product.id,
    name: product.title,
    category: product.category,
    price: product.price,
    stock: typeof overrideStock === "number" ? overrideStock : product.stock,
    location: `Store ${storeLetter} · Bay ${bayNumber}`,
    description: product.description,
    thumbnail: product.thumbnail || getCategoryFallbackImage(product.category),
    images: product.images && product.images.length > 0 ? product.images : [product.thumbnail],
    brand: product.brand,
    sku: displaySku,
  };
}
