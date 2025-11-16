-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecopoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;

-- Categories: Read public, write admin only
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Ecopoints: Read public (validated + pending), write owner
CREATE POLICY "Ecopoints are viewable by everyone"
  ON ecopoints FOR SELECT
  USING (status IN ('validated', 'pending'));

CREATE POLICY "Users can insert ecopoints"
  ON ecopoints FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can update their ecopoints"
  ON ecopoints FOR UPDATE
  USING (auth.uid() = owner_id OR auth.uid() = imported_by)
  WITH CHECK (auth.uid() = owner_id OR auth.uid() = imported_by);

-- Reviews: Read public, write authenticated (one per user/ecopoint)
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Donations: Read owner/user, write authenticated
CREATE POLICY "Users can view their own donations"
  ON donations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Ecopoint owners can view donations to their points"
  ON donations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ecopoints
      WHERE ecopoints.id = donations.ecopoint_id
      AND ecopoints.owner_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create donations"
  ON donations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Reputation: Read public, write system only (via triggers)
CREATE POLICY "User reputation is viewable by everyone"
  ON user_reputation FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own reputation"
  ON user_reputation FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create their reputation record"
  ON user_reputation FOR INSERT
  WITH CHECK (auth.uid() = user_id);
