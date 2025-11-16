-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Ensure PostGIS types are available
ALTER DATABASE postgres SET search_path TO public, extensions;
SET search_path TO public, extensions;

-- Create custom types
CREATE TYPE ecopoint_status AS ENUM ('pending', 'validated', 'rejected');
CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'failed');

-- Categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Ecopoints table
CREATE TABLE ecopoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  email text NOT NULL, -- Email principal para validação e contato
  location geography(POINT, 4326) NOT NULL,
  category text[] NOT NULL,
  address jsonb,
  contact jsonb, -- Outros contatos: telefone, website, redes sociais
  images text[],
  status ecopoint_status DEFAULT 'pending',
  owner_id uuid REFERENCES auth.users(id),
  validated_by uuid REFERENCES auth.users(id),
  validated_at timestamp with time zone,
  imported_from text,
  imported_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create spatial index for geolocation queries
CREATE INDEX ecopoints_location_idx ON ecopoints USING GIST (location);
CREATE INDEX ecopoints_status_idx ON ecopoints (status);
CREATE INDEX ecopoints_category_idx ON ecopoints USING GIN (category);
CREATE INDEX ecopoints_email_idx ON ecopoints (email);

-- Donations table
CREATE TABLE donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecopoint_id uuid NOT NULL REFERENCES ecopoints(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  amount decimal(10,2) NOT NULL CHECK (amount >= 2),
  payment_id text,
  status donation_status DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX donations_ecopoint_idx ON donations (ecopoint_id);
CREATE INDEX donations_user_idx ON donations (user_id);
CREATE INDEX donations_status_idx ON donations (status);

-- Reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecopoint_id uuid NOT NULL REFERENCES ecopoints(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(ecopoint_id, user_id)
);

CREATE INDEX reviews_ecopoint_idx ON reviews (ecopoint_id);
CREATE INDEX reviews_user_idx ON reviews (user_id);

-- User reputation table
CREATE TABLE user_reputation (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer DEFAULT 0,
  donations_count integer DEFAULT 0,
  reviews_count integer DEFAULT 0,
  badges jsonb DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to ecopoints
CREATE TRIGGER update_ecopoints_updated_at
  BEFORE UPDATE ON ecopoints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to user_reputation
CREATE TRIGGER update_user_reputation_updated_at
  BEFORE UPDATE ON user_reputation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
