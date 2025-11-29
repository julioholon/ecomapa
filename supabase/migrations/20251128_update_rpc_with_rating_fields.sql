-- Drop and recreate RPC function with rating fields
DROP FUNCTION IF EXISTS get_ecopoints_with_location();

CREATE FUNCTION get_ecopoints_with_location()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  email text,
  category text[],
  status text,
  location_text text,
  accepts_donations boolean,
  phone text,
  website text,
  instagram text,
  facebook text,
  address text,
  rating_avg numeric,
  rating_count integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    id,
    name,
    description,
    email,
    category,
    status::text,
    extensions.ST_AsText(location::extensions.geometry) as location_text,
    accepts_donations,
    phone,
    website,
    instagram,
    facebook,
    address,
    rating_avg,
    rating_count
  FROM ecopoints
  WHERE status IN ('validated', 'pending')
  ORDER BY created_at DESC;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_ecopoints_with_location TO authenticated, anon;
