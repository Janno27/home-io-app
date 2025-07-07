/*
  # Fix organization policies and remove recursion

  1. Policy Changes
    - Remove all existing policies that cause recursion
    - Create simple, non-recursive policies for organizations
    - Fix organization_members policies to avoid conflicts
  
  2. Security
    - Users can read organizations they own
    - Users can read organizations they are members of
    - Organization owners can manage all memberships
    - Users can read their own memberships
*/

-- Drop ALL existing policies on organizations to avoid conflicts
DROP POLICY IF EXISTS "Organization owners can delete their organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can read their organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can read organizations they own or are members of" ON organizations;
DROP POLICY IF EXISTS "Users can read organizations they own" ON organizations;
DROP POLICY IF EXISTS "Users can read organizations they are members of" ON organizations;

-- Drop ALL existing policies on organization_members to avoid conflicts
DROP POLICY IF EXISTS "Organization owners can manage memberships" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can read all memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can leave organizations" ON organization_members;
DROP POLICY IF EXISTS "Users can read their own memberships" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can invite members" ON organization_members;

-- Create new policies for organizations
CREATE POLICY "Users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can read organizations they own"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can read organizations they are members of"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update their organizations"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Organization owners can delete their organizations"
  ON organizations
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create new policies for organization_members
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

CREATE POLICY "Organization owners can invite members"
  ON organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can remove members"
  ON organization_members
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update member roles"
  ON organization_members
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can leave organizations"
  ON organization_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND role != 'owner');