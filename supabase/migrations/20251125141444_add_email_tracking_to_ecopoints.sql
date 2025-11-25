-- Add email tracking fields to ecopoints table
ALTER TABLE ecopoints
ADD COLUMN validation_email_sent boolean DEFAULT false,
ADD COLUMN validation_email_sent_at timestamp with time zone;

-- Create index for querying ecopoints that need email
CREATE INDEX ecopoints_validation_email_sent_idx ON ecopoints (validation_email_sent);

-- Add comment
COMMENT ON COLUMN ecopoints.validation_email_sent IS 'Indica se o email de validacao foi enviado';
COMMENT ON COLUMN ecopoints.validation_email_sent_at IS 'Data e hora do envio do email de validacao';
