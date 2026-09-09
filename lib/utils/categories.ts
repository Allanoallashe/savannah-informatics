export interface CategoryMeta {
  image: string;
  badgeTone?: string;
}

// Fallback images from the clinic assets
const CLINIC_FALLBACK_IMAGES = [
  "/aa3c7dfc-f259-495c-b6a2-08dde64f9388.jpg",
  "/86d3c9fa-b501-43d8-8558-33cd20911216.jpg",
  "/680c13c6-b448-440d-a6d4-e184cbf782b6.jpg",
  "/0f1abb69-15e6-4ed6-bef3-9294caa38905.jpg",
  "/645633c0-4c32-40b6-9896-acad2a61b56f.jpg",
];

export function getCategoryFallbackImage(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash << 5) - hash + category.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CLINIC_FALLBACK_IMAGES.length;
  return CLINIC_FALLBACK_IMAGES[index];
}

export function formatCategoryName(slug: string): string {
  if (!slug || slug === "all") return "All categories";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
