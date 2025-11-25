-- Add individual contact fields to ecopoints table
-- These replace the generic 'contact' jsonb field for better querying and indexing

ALTER TABLE ecopoints
ADD COLUMN phone text,
ADD COLUMN website text,
ADD COLUMN instagram text,
ADD COLUMN facebook text;

-- Migrate existing data from contact jsonb to new columns (if any)
UPDATE ecopoints
SET
  phone = contact->>'phone',
  website = contact->>'website',
  instagram = contact->>'instagram',
  facebook = contact->>'facebook'
WHERE contact IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN ecopoints.phone IS 'Telefone de contato do ecoponto';
COMMENT ON COLUMN ecopoints.website IS 'Website/URL do ecoponto';
COMMENT ON COLUMN ecopoints.instagram IS 'Perfil do Instagram (@usuario ou URL)';
COMMENT ON COLUMN ecopoints.facebook IS 'Perfil do Facebook (nome ou URL)';

-- Optional: Drop the old contact jsonb field (uncomment if you want to remove it completely)
-- ALTER TABLE ecopoints DROP COLUMN contact;
