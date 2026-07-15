/**
 * Categorías principales de contratistas disponibles en la plataforma.
 * Se usan en el perfil profesional y en filtros de búsqueda.
 */
export const CONTRACTOR_CATEGORIES = [
  "Albañilería",
  "Electricidad",
  "Plomería",
  "Pintura",
  "Gypsum",
  "Carpintería",
  "Aire Acondicionado",
  "Impermeabilización",
  "Pisos y Cerámicas",
  "Techado",
  "Cielo Raso",
  "Herrería / Metálica",
  "Muebles y MDF",
  "Sistemas Eléctricos Especiales",
  "Paisajismo",
  "Demolición",
  "General",
] as const;

export type ContractorCategory = (typeof CONTRACTOR_CATEGORIES)[number];
