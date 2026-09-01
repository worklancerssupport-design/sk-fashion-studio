export interface DesignCategory {
  id: string;
  label: string;
  desc: string;
  layout: string;
  images: string[];
  subcategories?: string[];
}

export interface DesignsData {
  categories: DesignCategory[];
  navLabels: Record<string, string>;
}

export interface Service {
  id: string;
  number: string;
  title: string;
  badge: string;
  shortDesc: string;
  image: string;
  fullDesc: string;
  whatsIncluded: string[];
  suitableOccasions: string[];
  customizationOptions: string[];
  outfitKey: string;
}

export interface ShopPhoto {
  title: string;
  tag: string;
  url: string;
}

export interface ContactData {
  address: string;
  phone: string;
  phoneDigits: string;
  email: string;
  instagram: string;
  whatsapp: string;
  mapsEmbedUrl: string;
  mapsDirectionsUrl: string;
  workingHours: string;
  workingHoursNote: string;
}

export interface EditHook<T> {
  originalData: T | null;
  editData: T | null;
  sha: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasChanges: boolean;
  refresh: () => void;
  save: () => Promise<void>;
  discard: () => void;
  updateEditData: (updater: (draft: T) => void) => void;
}
