/*
  # Correction des politiques d'organisation

  1. Problèmes résolus
    - Récursion infinie dans les politiques RLS
    - Ajout automatique du créateur comme membre
    - Simplification des politiques

  2. Changements
    - Nouvelle fonction pour gérer la création d'organisation
    - Politiques RLS simplifiées
    - Trigger pour ajouter automatiquement le créateur
*/

-- Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "Users can read organizations they own or are members of" ON organizations;

-- Créer une politique plus simple pour la lecture
CREATE POLICY "Users can read organizations they own or are members of"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR 
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Fonction pour gérer la création d'organisation avec membre automatique
CREATE OR REPLACE FUNCTION handle_new_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- Ajouter le créateur comme membre avec le rôle 'owner'
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_organization_created ON organizations;

-- Créer le nouveau trigger
CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_organization();