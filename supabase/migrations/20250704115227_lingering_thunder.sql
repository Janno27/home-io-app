/*
  # Fix infinite recursion in organizations RLS policy

  1. Policy Changes
    - Drop the existing problematic SELECT policy on organizations table
    - Create a new SELECT policy that avoids circular references
    - Use a direct EXISTS subquery instead of IN clause to prevent recursion

  2. Security
    - Maintains the same access control: users can read organizations they own or are members of
    - Fixes the infinite recursion issue by using proper EXISTS syntax
*/

-- Drop the existing problematic SELECT policy
DROP POLICY IF EXISTS "Users can read organizations they own or are members of" ON organizations;

-- Create a new SELECT policy that avoids infinite recursion
CREATE POLICY "Users can read organizations they own or are members of"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = owner_id) 
    OR 
    (EXISTS (
      SELECT 1 
      FROM organization_members 
      WHERE organization_members.organization_id = organizations.id 
        AND organization_members.user_id = auth.uid()
    ))
  );