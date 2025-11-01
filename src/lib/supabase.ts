import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  category: string | null;
  has_variants: boolean;
  price: number | null;
  quantity: number | null;
  is_visible: boolean;
  last_updated: string | null;
  updated_by: string | null;
  item_variants: ItemVariant[];
}

export interface ItemVariant {
  id: string;
  item_id: string;
  sku: string;
  variant_type: 'weight' | 'pcs' | 'price' | 'flavor' | 'size';
  variant_value: string;
  price: number;
  quantity: number;
  last_updated: string;
  updated_by: string | null;
}

export interface StoreStatus {
  id: string;
  is_open: boolean;
  updated_at: string | null;
  updated_by: string | null;
}
