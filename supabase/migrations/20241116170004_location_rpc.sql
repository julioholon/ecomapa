-- Create RPC function to get ecopoints with location as text
CREATE OR REPLACE FUNCTION get_ecopoints_with_location()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  email text,
  category text[],
  status text,
  location_text text
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
    extensions.ST_AsText(location::extensions.geometry) as location_text
  FROM ecopoints
  WHERE status IN ('validated', 'pending')
  ORDER BY created_at DESC;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_ecopoints_with_location() TO anon;
GRANT EXECUTE ON FUNCTION get_ecopoints_with_location() TO authenticated;
