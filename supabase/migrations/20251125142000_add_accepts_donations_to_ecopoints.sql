-- Add accepts_donations column to ecopoints table
-- This field indicates if the ecopoint owner accepts micro-donations via PIX

ALTER TABLE ecopoints
ADD COLUMN accepts_donations boolean DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN ecopoints.accepts_donations IS 'Indicates if the ecopoint owner accepts micro-donations from visitors';
