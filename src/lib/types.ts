// Tipos de la base de datos Mejía Travel

export type ListingMode = 'businesses' | 'professionals' | 'cooperatives' | 'custom';

export type Category = {
  id: string;
  parent_id: string | null;
  slug: string;
  name_es: string;
  name_en: string | null;
  icon: string | null;
  color: string | null;
  cover_image: string | null;
  description: string | null;
  listing_mode: ListingMode;
  sort_order: number;
  created_at: string;
};

export type Professional = {
  id: string;
  category_id: string;
  full_name: string;
  profession: string | null;
  bio: string | null;
  photo: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  website: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

export type TransportCooperative = {
  id: string;
  slug: string;
  name: string;
  type: 'bus' | 'taxi' | 'camioneta' | 'escolar' | 'turismo';
  description: string | null;
  founded_year: number | null;
  logo: string | null;
  cover_image: string | null;
  color: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  schedule_general: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

export type TransportRoute = {
  id: string;
  cooperative_id: string;
  origin: string;
  destination: string;
  schedule_start: string | null;
  schedule_end: string | null;
  frequency: string | null;
  fare: number | null;
  notes: string | null;
  sort_order: number;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  is_active: boolean;
  sort_order: number;
  starts_at: string;
  ends_at: string | null;
};

export type GalleryItem = {
  image_url: string;
  title?: string;
  description?: string;
};

export type Business = {
  id: string;
  owner_id: string | null;
  category_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  short_description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  address: string | null;
  address_branch_1: string | null;
  address_branch_2: string | null;
  owner_name: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_image: string | null;
  gallery: GalleryItem[];
  catalog_pdf: string | null;
  logo: string | null;
  schedule: Record<string, { open: string; close: string }>;
  is_published: boolean;
  is_featured: boolean;
  is_verified: boolean;
  plan: 'free' | 'premium';
  premium_until: string | null;
  views_count: number;
  calls_count: number;
  whatsapp_count: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  organizer: string | null;
  contact_phone: string | null;
  category: string | null;
  is_published: boolean;
  created_at: string;
};

export type MarketplaceItem = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  category: string | null;
  condition: 'nuevo' | 'usado' | 'seminuevo' | null;
  images: string[];
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  is_featured: boolean;
  featured_until: string | null;
  expires_at: string;
  is_sold: boolean;
  views_count: number;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'user' | 'owner' | 'admin';
  created_at: string;
};

// Tipo mínimo para Supabase client
type Tbl<T> = { Row: T; Insert: Partial<T>; Update: Partial<T>; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      profiles: Tbl<Profile>;
      categories: Tbl<Category>;
      businesses: Tbl<Business>;
      reviews: Tbl<Review>;
      events: Tbl<Event>;
      marketplace_items: Tbl<MarketplaceItem>;
      professionals: Tbl<Professional>;
      transport_cooperatives: Tbl<TransportCooperative>;
      transport_routes: Tbl<TransportRoute>;
      banners: Tbl<Banner>;
      app_settings: Tbl<{ key: string; value: any; updated_at: string }>;
      favorites: Tbl<{ user_id: string; entity_type: string; entity_id: string; created_at: string }>;
      promotions: Tbl<{ id: string; business_id: string; title: string; description: string | null; image: string | null; starts_at: string; ends_at: string | null; is_active: boolean; created_at: string }>;
      business_hours: Tbl<{ id: string; business_id: string; day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean }>;
      business_analytics: Tbl<{ id: string; business_id: string; event_type: string; created_at: string }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
