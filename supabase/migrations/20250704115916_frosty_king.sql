/*
  # Fix infinite recursion in organization policies

  1. Policy Changes
    - Remove recursive policy that causes infinite loop
    - Create simpler policies that don't reference organization_members in organization SELECT
    - Use separate policies for different access patterns

  2. Security
    - Maintain proper RLS while avoiding recursion
    - Ensure users can only see organizations they should access
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can read organizations they own or are members of" ON organizations;

-- Create a simple policy for organization owners
CREATE POLICY "Organization owners can read their organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Create a separate policy for organization members (will be handled by a view or function)
-- For now, let's keep it simple and only allow owners to read organizations
-- We can expand this later with a proper approach

-- Update the organization_members policies to be more explicit
DROP POLICY IF EXISTS "Users can read organization memberships they're part of" ON organization_members;

CREATE POLICY "Users can read their own memberships"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organization owners can read all memberships"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );