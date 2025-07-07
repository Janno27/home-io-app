/*
  # Fix infinite recursion and organization policies

  1. Security
    - Drop all existing problematic policies
    - Create simple, non-recursive policies
    - Ensure proper member management

  2. Changes
    - Simple owner-based access for organizations
    - Separate member-based access without recursion
    - Proper trigger for auto-adding owner as member
*/

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Organization owners can delete their organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can read their organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can read organizations they own or are members of" ON organizations;
DROP POLICY IF EXISTS "Users can read organizations they own" ON organizations;
DROP POLICY IF EXISTS "Users can read organizations they are members of" ON organizations;

-- Drop member policies
DROP POLICY IF EXISTS "Organization owners can manage memberships" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can read all memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can leave organizations" ON organization_members;
DROP POLICY IF EXISTS "Users can read their own memberships" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can invite members" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can remove members" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can update member roles" ON organization_members;

-- Create simple, non-recursive policies for organizations
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

-- Create policies for organization_members
CREATE POLICY "Users can read their own memberships"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organization owners can manage memberships"
  ON organization_members
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- Ensure the trigger function exists and works properly
CREATE OR REPLACE FUNCTION handle_new_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the creator as owner member
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_organization_created ON organizations;
CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_organization();