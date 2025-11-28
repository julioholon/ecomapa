-- Migration: Withdrawal System for Donations
-- Description: Allows ecopoint owners to request withdrawals of received donations
--              with 10% platform fee. Admin processes manually via email notification.

-- Create enum for withdrawal status
CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'rejected');

-- Create withdrawals table
CREATE TABLE withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecopoint_id uuid NOT NULL REFERENCES ecopoints(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Financial data
  amount_gross decimal(10,2) NOT NULL CHECK (amount_gross >= 10.00),  -- Minimum R$ 10.00
  platform_fee decimal(10,2) NOT NULL CHECK (platform_fee >= 0),      -- 10% fee
  amount_net decimal(10,2) NOT NULL CHECK (amount_net > 0),           -- Amount to transfer

  -- PIX information
  pix_key text NOT NULL,
  pix_key_type text NOT NULL CHECK (pix_key_type IN ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM')),

  -- Status and processing
  status withdrawal_status DEFAULT 'pending' NOT NULL,
  admin_notes text,
  processed_by uuid REFERENCES auth.users(id),
  processed_at timestamp with time zone,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT valid_amounts CHECK (amount_gross = amount_net + platform_fee)
);

-- Create indexes
CREATE INDEX idx_withdrawals_ecopoint_id ON withdrawals(ecopoint_id);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at DESC);

-- Enable RLS
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Owners can view their own withdrawal requests
CREATE POLICY "Users can view their own withdrawal requests"
  ON withdrawals FOR SELECT
  USING (user_id = auth.uid());

-- Owners can create withdrawal requests for their ecopoints
CREATE POLICY "Owners can create withdrawal requests"
  ON withdrawals FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM ecopoints
      WHERE id = ecopoint_id
      AND owner_id = auth.uid()
    )
  );

-- Owners can update their pending requests (to cancel or modify PIX key)
CREATE POLICY "Owners can update pending withdrawals"
  ON withdrawals FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

-- Create function to get available balance for an ecopoint
CREATE OR REPLACE FUNCTION get_available_balance(p_ecopoint_id uuid)
RETURNS decimal(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_received decimal(10,2);
  v_total_withdrawn decimal(10,2);
  v_available_balance decimal(10,2);
BEGIN
  -- Sum all completed donations
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_received
  FROM donations
  WHERE ecopoint_id = p_ecopoint_id
    AND status = 'completed';

  -- Sum all completed withdrawals (amount_net only, since that's what was actually withdrawn)
  SELECT COALESCE(SUM(amount_net), 0)
  INTO v_total_withdrawn
  FROM withdrawals
  WHERE ecopoint_id = p_ecopoint_id
    AND status = 'completed';

  -- Calculate available balance
  v_available_balance := v_total_received - v_total_withdrawn;

  RETURN GREATEST(v_available_balance, 0);
END;
$$;

-- Create function to check if user can request withdrawal
CREATE OR REPLACE FUNCTION can_request_withdrawal(p_ecopoint_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_owner boolean;
  v_has_pending boolean;
BEGIN
  -- Check if user is the owner
  SELECT EXISTS (
    SELECT 1 FROM ecopoints
    WHERE id = p_ecopoint_id
      AND owner_id = p_user_id
  ) INTO v_is_owner;

  IF NOT v_is_owner THEN
    RETURN false;
  END IF;

  -- Check if there's already a pending withdrawal
  SELECT EXISTS (
    SELECT 1 FROM withdrawals
    WHERE ecopoint_id = p_ecopoint_id
      AND status IN ('pending', 'processing')
  ) INTO v_has_pending;

  RETURN NOT v_has_pending;
END;
$$;

-- Create function to validate PIX key format
CREATE OR REPLACE FUNCTION validate_pix_key(p_pix_key text, p_pix_key_type text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  CASE p_pix_key_type
    WHEN 'CPF' THEN
      -- CPF: 11 digits
      RETURN p_pix_key ~ '^\d{11}$';

    WHEN 'CNPJ' THEN
      -- CNPJ: 14 digits
      RETURN p_pix_key ~ '^\d{14}$';

    WHEN 'EMAIL' THEN
      -- Email: basic validation
      RETURN p_pix_key ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$';

    WHEN 'PHONE' THEN
      -- Phone: 10-11 digits (with DDD)
      RETURN p_pix_key ~ '^\d{10,11}$';

    WHEN 'RANDOM' THEN
      -- Random key: UUID format
      RETURN p_pix_key ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_withdrawals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER withdrawals_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_withdrawals_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON withdrawals TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_balance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_request_withdrawal(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_pix_key(text, text) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE withdrawals IS 'Withdrawal requests from ecopoint owners to receive their donations';
COMMENT ON COLUMN withdrawals.amount_gross IS 'Total amount requested (100%)';
COMMENT ON COLUMN withdrawals.platform_fee IS 'Platform fee (10% of gross)';
COMMENT ON COLUMN withdrawals.amount_net IS 'Net amount to be transferred to owner (90%)';
COMMENT ON COLUMN withdrawals.pix_key IS 'PIX key for receiving the transfer';
COMMENT ON COLUMN withdrawals.pix_key_type IS 'Type of PIX key: CPF, CNPJ, EMAIL, PHONE, or RANDOM';

COMMENT ON FUNCTION get_available_balance(uuid) IS 'Returns available balance for withdrawal for a given ecopoint';
COMMENT ON FUNCTION can_request_withdrawal(uuid, uuid) IS 'Checks if user can request a withdrawal for the ecopoint';
COMMENT ON FUNCTION validate_pix_key(text, text) IS 'Validates PIX key format based on key type';
