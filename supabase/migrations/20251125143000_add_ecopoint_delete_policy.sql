-- Add DELETE policy for ecopoints
-- Allows owners and importers to delete their own ecopoints

CREATE POLICY "Owners can delete their ecopoints"
  ON ecopoints FOR DELETE
  USING (auth.uid() = owner_id OR auth.uid() = imported_by);

-- Add comment for documentation
COMMENT ON POLICY "Owners can delete their ecopoints" ON ecopoints IS
  'Permite que donos (owner_id) e importadores (imported_by) excluam seus próprios ecopontos';
