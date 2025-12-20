-- Business Directory Module Schema
-- Comprehensive schema for business marketplace/directory system

-- 1. Category Table (Hierarchical)
CREATE TABLE IF NOT EXISTS category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id UUID REFERENCES category(id) ON DELETE CASCADE,
  description TEXT,
  icon TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Business Table
CREATE TABLE IF NOT EXISTS business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo TEXT,
  description TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  website TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating_average DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. Business Category Junction Table
CREATE TABLE IF NOT EXISTS business_category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES category(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, category_id)
);

-- 4. Subscription Plan Table
CREATE TABLE IF NOT EXISTS subscription_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2) DEFAULT 0.00,
  price_yearly DECIMAL(10, 2) DEFAULT 0.00,
  product_limit INTEGER, -- NULL = unlimited
  is_featured BOOLEAN DEFAULT false,
  has_analytics BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Business Subscription Table
CREATE TABLE IF NOT EXISTS business_subscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plan(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure one active subscription per business
  UNIQUE(business_id)
);

-- 6. Payment Table
CREATE TABLE IF NOT EXISTS payment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_subscription_id UUID NOT NULL REFERENCES business_subscription(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('stripe', 'manual', 'other')),
  payment_gateway_id VARCHAR(255), -- Stripe payment intent ID
  transaction_id VARCHAR(255), -- External transaction reference
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Post Table (Posts/Products)
CREATE TABLE IF NOT EXISTS post (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  is_product BOOLEAN DEFAULT false,
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 8. Product Details Table
CREATE TABLE IF NOT EXISTS product_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES post(id) ON DELETE CASCADE UNIQUE,
  price DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  stock_quantity INTEGER, -- NULL = unlimited
  stock_status VARCHAR(20) DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'low_stock')),
  sku VARCHAR(100),
  colors TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  weight DECIMAL(10, 2),
  dimensions JSONB, -- {length, width, height, unit}
  attributes JSONB, -- Flexible key-value pairs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Business Review Table
CREATE TABLE IF NOT EXISTS business_review (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- One review per user per business
  UNIQUE(business_id, user_id)
);

-- 10. Business Media Table (Optional - for galleries)
CREATE TABLE IF NOT EXISTS business_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video')),
  is_primary BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_business_user_id ON business(user_id);
CREATE INDEX IF NOT EXISTS idx_business_lat_lng ON business(lat, lng);
CREATE INDEX IF NOT EXISTS idx_business_rating ON business(rating_average DESC, rating_count DESC);
CREATE INDEX IF NOT EXISTS idx_business_active ON business(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_business_verified ON business(is_verified) WHERE is_verified = true;

CREATE INDEX IF NOT EXISTS idx_category_parent_id ON category(parent_id);
CREATE INDEX IF NOT EXISTS idx_category_slug ON category(slug);
CREATE INDEX IF NOT EXISTS idx_category_active ON category(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_business_category_business_id ON business_category(business_id);
CREATE INDEX IF NOT EXISTS idx_business_category_category_id ON business_category(category_id);
CREATE INDEX IF NOT EXISTS idx_business_category_primary ON business_category(business_id, is_primary) WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_post_business_id ON post(business_id);
CREATE INDEX IF NOT EXISTS idx_post_is_product ON post(is_product) WHERE is_product = true;
CREATE INDEX IF NOT EXISTS idx_post_active ON post(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_post_created_at ON post(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_details_post_id ON product_details(post_id);
CREATE INDEX IF NOT EXISTS idx_product_details_stock_status ON product_details(stock_status);

CREATE INDEX IF NOT EXISTS idx_business_subscription_business_id ON business_subscription(business_id);
CREATE INDEX IF NOT EXISTS idx_business_subscription_status ON business_subscription(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_business_subscription_end_date ON business_subscription(end_date) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_payment_subscription_id ON payment(business_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status);

CREATE INDEX IF NOT EXISTS idx_business_review_business_id ON business_review(business_id);
CREATE INDEX IF NOT EXISTS idx_business_review_user_id ON business_review(user_id);
CREATE INDEX IF NOT EXISTS idx_business_review_rating ON business_review(business_id, rating);
CREATE INDEX IF NOT EXISTS idx_business_review_approved ON business_review(is_approved) WHERE is_approved = true;

CREATE INDEX IF NOT EXISTS idx_business_media_business_id ON business_media(business_id);

-- Enable Row Level Security
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE business ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE post ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_review ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Category
CREATE POLICY "Allow read access for authenticated users" ON category
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert access for authenticated users" ON category
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update access for authenticated users" ON category
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow delete access for authenticated users" ON category
  FOR DELETE TO authenticated USING (true);

-- RLS Policies for Business
CREATE POLICY "Allow read access for authenticated users" ON business
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create their own business" ON business
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business" ON business
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business" ON business
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for Business Category
CREATE POLICY "Allow read access for authenticated users" ON business_category
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Business owners can manage their categories" ON business_category
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM business 
      WHERE business.id = business_category.business_id 
      AND business.user_id = auth.uid()
    )
  );

-- RLS Policies for Subscription Plan
CREATE POLICY "Allow read access for authenticated users" ON subscription_plan
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert access for authenticated users" ON subscription_plan
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update access for authenticated users" ON subscription_plan
  FOR UPDATE TO authenticated USING (true);

-- RLS Policies for Business Subscription
CREATE POLICY "Allow read access for authenticated users" ON business_subscription
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Business owners can manage their subscriptions" ON business_subscription
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business 
      WHERE business.id = business_subscription.business_id 
      AND business.user_id = auth.uid()
    )
  );

-- RLS Policies for Payment
CREATE POLICY "Allow read access for business owners" ON payment
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_subscription bs
      JOIN business b ON b.id = bs.business_id
      WHERE bs.id = payment.business_subscription_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow insert access for authenticated users" ON payment
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update access for authenticated users" ON payment
  FOR UPDATE TO authenticated USING (true);

-- RLS Policies for Post
CREATE POLICY "Allow read access for authenticated users" ON post
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Business owners can manage their posts" ON post
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business 
      WHERE business.id = post.business_id 
      AND business.user_id = auth.uid()
    )
  );

-- RLS Policies for Product Details
CREATE POLICY "Allow read access for authenticated users" ON product_details
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Business owners can manage product details" ON product_details
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM post p
      JOIN business b ON b.id = p.business_id
      WHERE p.id = product_details.post_id
      AND b.user_id = auth.uid()
    )
  );

-- RLS Policies for Business Review
CREATE POLICY "Allow read access for authenticated users" ON business_review
  FOR SELECT TO authenticated USING (is_approved = true OR user_id = auth.uid());

CREATE POLICY "Users can create reviews" ON business_review
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON business_review
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON business_review
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for Business Media
CREATE POLICY "Allow read access for authenticated users" ON business_media
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Business owners can manage their media" ON business_media
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business 
      WHERE business.id = business_media.business_id 
      AND business.user_id = auth.uid()
    )
  );

-- Function to update business rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE business
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0.00)
      FROM business_review
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
      AND is_approved = true
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM business_review
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
      AND is_approved = true
    )
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update business rating on review changes
CREATE TRIGGER trigger_update_business_rating
  AFTER INSERT OR UPDATE OR DELETE ON business_review
  FOR EACH ROW
  EXECUTE FUNCTION update_business_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_category_updated_at BEFORE UPDATE ON category FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_updated_at BEFORE UPDATE ON business FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plan_updated_at BEFORE UPDATE ON subscription_plan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_subscription_updated_at BEFORE UPDATE ON business_subscription FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_updated_at BEFORE UPDATE ON payment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_post_updated_at BEFORE UPDATE ON post FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_details_updated_at BEFORE UPDATE ON product_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_review_updated_at BEFORE UPDATE ON business_review FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE category IS 'Hierarchical category system for business classification';
COMMENT ON TABLE business IS 'Main business entity with location and rating information';
COMMENT ON TABLE business_category IS 'Many-to-many relationship between businesses and categories';
COMMENT ON TABLE subscription_plan IS 'Available subscription plan tiers';
COMMENT ON TABLE business_subscription IS 'Active subscriptions for businesses';
COMMENT ON TABLE payment IS 'Payment records for subscriptions';
COMMENT ON TABLE post IS 'Posts and products (products have is_product=true)';
COMMENT ON TABLE product_details IS 'Additional product information for posts marked as products';
COMMENT ON TABLE business_review IS 'Reviews and ratings for businesses';
COMMENT ON TABLE business_media IS 'Additional media files for business galleries';
