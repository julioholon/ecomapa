-- Drop old function first
DROP FUNCTION IF EXISTS get_ecopoints_with_location();

-- Recreate RPC function with new fields
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
  address text
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
    address
  FROM ecopoints
  WHERE status IN ('validated', 'pending')
  ORDER BY created_at DESC;
$$;
