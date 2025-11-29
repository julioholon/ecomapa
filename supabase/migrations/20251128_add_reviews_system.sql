-- Add visited field to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS visited boolean DEFAULT false;

-- Add rating fields to ecopoints table
ALTER TABLE ecopoints ADD COLUMN IF NOT EXISTS rating_avg decimal(2,1) DEFAULT 0.0 CHECK (rating_avg >= 0 AND rating_avg <= 5);
ALTER TABLE ecopoints ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0 CHECK (rating_count >= 0);

-- Create index for faster rating queries
CREATE INDEX IF NOT EXISTS ecopoints_rating_idx ON ecopoints (rating_avg DESC);

-- Function to update ecopoint rating
CREATE OR REPLACE FUNCTION update_ecopoint_rating(p_ecopoint_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_avg decimal(2,1);
  v_count integer;
BEGIN
  -- Calculate average rating and count
  SELECT
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0),
    COUNT(*)
  INTO v_avg, v_count
  FROM reviews
  WHERE ecopoint_id = p_ecopoint_id;

  -- Update ecopoint
  UPDATE ecopoints
  SET
    rating_avg = v_avg,
    rating_count = v_count,
    updated_at = now()
  WHERE id = p_ecopoint_id;
END;
$$;

-- Trigger to update rating when review is inserted/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_ecopoint_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_ecopoint_rating(OLD.ecopoint_id);
    RETURN OLD;
  ELSE
    PERFORM update_ecopoint_rating(NEW.ecopoint_id);
    RETURN NEW;
  END IF;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS reviews_update_rating ON reviews;
CREATE TRIGGER reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_ecopoint_rating();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_ecopoint_rating TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_update_ecopoint_rating TO authenticated;

-- Add comments
COMMENT ON COLUMN reviews.visited IS 'Whether the user actually visited this ecopoint';
COMMENT ON COLUMN ecopoints.rating_avg IS 'Average rating from all reviews (0-5, 1 decimal)';
COMMENT ON COLUMN ecopoints.rating_count IS 'Total number of reviews';
COMMENT ON FUNCTION update_ecopoint_rating IS 'Recalculates and updates the average rating for an ecopoint';
