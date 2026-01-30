import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  button_balance: number;
  total_buttons_earned: number;
  total_buttons_spent: number;
  created_at: string;
  updated_at: string;
};

export type Clothes = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  image_url: string;
  minimum_button_price: number;
  current_highest_bid: number;
  highest_bidder_id: string | null;
  status: 'active' | 'sold' | 'delisted';
  bidding_ends_at: string;
  created_at: string;
  updated_at: string;
};

export type ClothingBid = {
  id: string;
  clothes_id: string;
  bidder_id: string;
  amount: number;
  status: 'active' | 'outbid' | 'won' | 'cancelled';
  created_at: string;
};

export type ButtonTransaction = {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'purchase_platform' | 'purchase_user' | 'earned_sale' | 'spent_bid' | 'refund' | 'initial_grant';
  related_id: string | null;
  description: string;
  created_at: string;
};

export type ButtonResaleListing = {
  id: string;
  seller_id: string;
  button_amount: number;
  minimum_price_usd: number;
  current_highest_bid_usd: number;
  highest_bidder_id: string | null;
  status: 'active' | 'sold' | 'cancelled';
  bidding_ends_at: string;
  created_at: string;
  updated_at: string;
};

export type ButtonResaleBid = {
  id: string;
  listing_id: string;
  bidder_id: string;
  amount_usd: number;
  status: 'active' | 'outbid' | 'won' | 'cancelled';
  created_at: string;
};
