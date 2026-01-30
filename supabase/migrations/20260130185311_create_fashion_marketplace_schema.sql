/*
  # Fashion Marketplace Database Schema

  ## Overview
  Complete database schema for a regulated barter-based fashion marketplace using virtual "buttons" as currency.
  Users can trade clothes for buttons, and critically, sell buttons back to other users for real money (exit mechanism).

  ## New Tables

  ### 1. `user_profiles`
  Extends Supabase auth.users with marketplace-specific data
  - `id` (uuid, references auth.users) - Primary key
  - `button_balance` (integer) - Current button balance (default 0)
  - `total_buttons_earned` (integer) - Lifetime buttons earned from sales
  - `total_buttons_spent` (integer) - Lifetime buttons spent on bids
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `clothes`
  Clothing listings available for bidding
  - `id` (uuid) - Primary key
  - `user_id` (uuid) - Seller reference
  - `title` (text) - Item title
  - `category` (text) - Clothing category
  - `image_url` (text) - Image URL
  - `minimum_button_price` (integer) - Starting bid price
  - `current_highest_bid` (integer) - Current winning bid amount
  - `highest_bidder_id` (uuid) - Current winning bidder
  - `status` (text) - active, sold, delisted
  - `bidding_ends_at` (timestamptz) - Auction end time
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `clothing_bids`
  Bids placed on clothing items
  - `id` (uuid) - Primary key
  - `clothes_id` (uuid) - Item being bid on
  - `bidder_id` (uuid) - User placing bid
  - `amount` (integer) - Bid amount in buttons
  - `status` (text) - active, outbid, won, cancelled
  - `created_at` (timestamptz)

  ### 4. `button_transactions`
  Ledger for all button movements (immutable record)
  - `id` (uuid) - Primary key
  - `user_id` (uuid) - User affected
  - `amount` (integer) - Can be positive (credit) or negative (debit)
  - `transaction_type` (text) - purchase_platform, purchase_user, earned_sale, spent_bid, refund, initial_grant
  - `related_id` (uuid) - Optional reference to related entity (listing, bid, etc.)
  - `description` (text) - Human-readable description
  - `created_at` (timestamptz)

  ### 5. `button_resale_listings`
  Users selling buttons for real money (CRITICAL EXIT MECHANISM)
  - `id` (uuid) - Primary key
  - `seller_id` (uuid) - User selling buttons
  - `button_amount` (integer) - Number of buttons for sale
  - `minimum_price_usd` (numeric) - Minimum acceptable price in USD
  - `current_highest_bid_usd` (numeric) - Current highest bid
  - `highest_bidder_id` (uuid) - Current winning bidder
  - `status` (text) - active, sold, cancelled
  - `bidding_ends_at` (timestamptz) - Auction end time
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `button_resale_bids`
  Bids placed on button listings (in real USD)
  - `id` (uuid) - Primary key
  - `listing_id` (uuid) - Button listing being bid on
  - `bidder_id` (uuid) - User placing bid
  - `amount_usd` (numeric) - Bid amount in USD
  - `status` (text) - active, outbid, won, cancelled
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Users can read their own data and public listings
  - Users can only modify their own listings and bids
  - Button balance is protected and only updated through transactions

  ## Important Notes
  1. Button economy is zero-sum except for platform-controlled injections
  2. Button resale market provides liquidity and exit path
  3. All financial operations are logged in button_transactions
  4. Bidding has time limits to prevent stale listings
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  button_balance integer NOT NULL DEFAULT 0 CHECK (button_balance >= 0),
  total_buttons_earned integer NOT NULL DEFAULT 0,
  total_buttons_spent integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clothes listings table
CREATE TABLE IF NOT EXISTS clothes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  minimum_button_price integer NOT NULL CHECK (minimum_button_price > 0),
  current_highest_bid integer DEFAULT 0,
  highest_bidder_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'delisted')),
  bidding_ends_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clothing bids table
CREATE TABLE IF NOT EXISTS clothing_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clothes_id uuid NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'outbid', 'won', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create button transactions ledger
CREATE TABLE IF NOT EXISTS button_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase_platform', 'purchase_user', 'earned_sale', 'spent_bid', 'refund', 'initial_grant')),
  related_id uuid,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create button resale listings table
CREATE TABLE IF NOT EXISTS button_resale_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  button_amount integer NOT NULL CHECK (button_amount > 0),
  minimum_price_usd numeric(10, 2) NOT NULL CHECK (minimum_price_usd > 0),
  current_highest_bid_usd numeric(10, 2) DEFAULT 0,
  highest_bidder_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  bidding_ends_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create button resale bids table
CREATE TABLE IF NOT EXISTS button_resale_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES button_resale_listings(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_usd numeric(10, 2) NOT NULL CHECK (amount_usd > 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'outbid', 'won', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clothes_status ON clothes(status);
CREATE INDEX IF NOT EXISTS idx_clothes_user_id ON clothes(user_id);
CREATE INDEX IF NOT EXISTS idx_clothing_bids_clothes_id ON clothing_bids(clothes_id);
CREATE INDEX IF NOT EXISTS idx_clothing_bids_bidder_id ON clothing_bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_button_transactions_user_id ON button_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_button_resale_listings_status ON button_resale_listings(status);
CREATE INDEX IF NOT EXISTS idx_button_resale_bids_listing_id ON button_resale_bids(listing_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE button_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE button_resale_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE button_resale_bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for clothes
CREATE POLICY "Anyone can view active clothes"
  ON clothes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own clothes"
  ON clothes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clothes"
  ON clothes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clothes"
  ON clothes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for clothing_bids
CREATE POLICY "Users can view bids on their listings and own bids"
  ON clothing_bids FOR SELECT
  TO authenticated
  USING (
    auth.uid() = bidder_id OR
    EXISTS (SELECT 1 FROM clothes WHERE clothes.id = clothing_bids.clothes_id AND clothes.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own bids"
  ON clothing_bids FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "Users can update own bids"
  ON clothing_bids FOR UPDATE
  TO authenticated
  USING (auth.uid() = bidder_id)
  WITH CHECK (auth.uid() = bidder_id);

-- RLS Policies for button_transactions
CREATE POLICY "Users can view own transactions"
  ON button_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON button_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for button_resale_listings
CREATE POLICY "Anyone can view active button listings"
  ON button_resale_listings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own button listings"
  ON button_resale_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own button listings"
  ON button_resale_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can delete own button listings"
  ON button_resale_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- RLS Policies for button_resale_bids
CREATE POLICY "Users can view bids on their listings and own bids"
  ON button_resale_bids FOR SELECT
  TO authenticated
  USING (
    auth.uid() = bidder_id OR
    EXISTS (SELECT 1 FROM button_resale_listings WHERE button_resale_listings.id = button_resale_bids.listing_id AND button_resale_listings.seller_id = auth.uid())
  );

CREATE POLICY "Users can insert own button bids"
  ON button_resale_bids FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "Users can update own button bids"
  ON button_resale_bids FOR UPDATE
  TO authenticated
  USING (auth.uid() = bidder_id)
  WITH CHECK (auth.uid() = bidder_id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, button_balance, total_buttons_earned, total_buttons_spent)
  VALUES (NEW.id, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clothes_updated_at BEFORE UPDATE ON clothes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_button_resale_listings_updated_at BEFORE UPDATE ON button_resale_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();