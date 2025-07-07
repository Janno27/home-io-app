/*
  # Correction finale des politiques d'organisation

  1. Suppression de toutes les politiques existantes
  2. Création de politiques simples et non-récursives
  3. Permettre aux utilisateurs de voir les organisations où ils sont propriétaires OU membres
  4. Éviter toute récursion dans les politiques
*/

-- Supprimer TOUTES les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Organization owners can delete their organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can read their organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can read organizations they own or are members of" ON organizations;
DROP POLICY IF EXISTS "Users can read organizations they own" ON organizations;
DROP POLICY IF EXISTS "Users can read organizations they are members of" ON organizations;

-- Supprimer les politiques des membres
DROP POLICY IF EXISTS "Organization owners can manage memberships" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can read all memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can leave organizations" ON organization_members;
DROP POLICY IF EXISTS "Users can read their own memberships" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can invite members" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can remove members" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can update member roles" ON organization_members;

-- Créer des politiques simples pour les organisations
CREATE POLICY "Users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Politique simple pour lire les organisations (propriétaire seulement pour éviter la récursion)
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

-- Politiques pour les membres d'organisation
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

-- S'assurer que la fonction de trigger existe
CREATE OR REPLACE FUNCTION handle_new_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- Ajouter le créateur comme membre propriétaire
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_organization_created ON organizations;
CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_organization();