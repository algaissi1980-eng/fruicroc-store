-- =============================================
-- Fruicroc — Migration 4
-- Admin protection: the owner can never be removed,
-- and no admin can remove themselves.
-- Enforced at DB level (UI hiding alone is not security).
-- Run in the Supabase SQL Editor.
-- =============================================

CREATE OR REPLACE FUNCTION protect_admins_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.email = 'algaissi1980@gmail.com' THEN
    RAISE EXCEPTION 'The owner account cannot be removed';
  END IF;
  IF OLD.email = auth.jwt() ->> 'email' THEN
    RAISE EXCEPTION 'You cannot remove your own admin access';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS admins_delete_guard ON admins;
CREATE TRIGGER admins_delete_guard
  BEFORE DELETE ON admins
  FOR EACH ROW EXECUTE FUNCTION protect_admins_delete();
