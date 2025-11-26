-- Create or replace function to increment user reputation
-- This function atomically updates reputation points and counts

CREATE OR REPLACE FUNCTION increment_user_reputation(
  p_user_id uuid,
  p_points integer DEFAULT 0,
  p_donation_increment integer DEFAULT 0,
  p_review_increment integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update user reputation record
  INSERT INTO user_reputation (
    user_id,
    points,
    donations_count,
    reviews_count,
    updated_at
  )
  VALUES (
    p_user_id,
    p_points,
    p_donation_increment,
    p_review_increment,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    points = user_reputation.points + EXCLUDED.points,
    donations_count = user_reputation.donations_count + EXCLUDED.donations_count,
    reviews_count = user_reputation.reviews_count + EXCLUDED.reviews_count,
    updated_at = now();

  -- Check and award badges based on new counts
  PERFORM update_user_badges(p_user_id);
END;
$$;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION update_user_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_donations_count integer;
  v_reviews_count integer;
  v_current_badges jsonb;
  v_new_badges jsonb := '[]'::jsonb;
BEGIN
  -- Get current stats
  SELECT donations_count, reviews_count, COALESCE(badges, '[]'::jsonb)
  INTO v_donations_count, v_reviews_count, v_current_badges
  FROM user_reputation
  WHERE user_id = p_user_id;

  -- Check donation badges
  IF v_donations_count >= 25 THEN
    v_new_badges := v_new_badges || jsonb_build_object('id', 'gold_supporter', 'name', 'Apoiador Ouro', 'icon', '🥇', 'earned_at', now());
  ELSIF v_donations_count >= 10 THEN
    v_new_badges := v_new_badges || jsonb_build_object('id', 'silver_supporter', 'name', 'Apoiador Prata', 'icon', '🥈', 'earned_at', now());
  ELSIF v_donations_count >= 3 THEN
    v_new_badges := v_new_badges || jsonb_build_object('id', 'bronze_supporter', 'name', 'Apoiador Bronze', 'icon', '🥉', 'earned_at', now());
  END IF;

  -- Check review badges
  IF v_reviews_count >= 5 THEN
    v_new_badges := v_new_badges || jsonb_build_object('id', 'explorer', 'name', 'Explorador', 'icon', '🔍', 'earned_at', now());
  END IF;

  -- Only update if badges changed (to avoid unnecessary updates)
  IF v_new_badges != v_current_badges THEN
    UPDATE user_reputation
    SET badges = v_new_badges, updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Add comments
COMMENT ON FUNCTION increment_user_reputation IS 'Atomically increments user reputation points and counts, then updates badges';
COMMENT ON FUNCTION update_user_badges IS 'Checks user stats and awards appropriate badges';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_user_reputation TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_badges TO authenticated;
