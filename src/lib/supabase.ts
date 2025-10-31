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
  description: string | null;
  category: string | null;
  has_variants: boolean;
  price: number;
  quantity: number;
  is_visible: boolean;
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
