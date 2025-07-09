/*
  # Système de notes avec partage

  1. Nouvelles Tables
    - `notes` - Notes principales
      - `id` (uuid, clé primaire)
      - `title` (text, titre de la note)
      - `content` (text, contenu HTML de la note)
      - `created_by` (uuid, référence profiles.id - créateur)
      - `organization_id` (uuid, référence organizations.id)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `note_shares` - Partages de notes
      - `id` (uuid, clé primaire)
      - `note_id` (uuid, référence notes.id)
      - `user_id` (uuid, référence profiles.id - utilisateur avec qui c'est partagé)
      - `can_edit` (boolean, peut modifier la note)
      - `shared_by` (uuid, référence profiles.id - qui a partagé)
      - `shared_at` (timestamp)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Créateurs peuvent voir/modifier/supprimer leurs notes
    - Utilisateurs avec partage peuvent voir et modifier selon permissions
    - Seuls les créateurs peuvent supprimer leurs notes
    - Accès limité aux membres de la même organisation
*/

-- Table des notes principales
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des partages de notes
CREATE TABLE IF NOT EXISTS note_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  can_edit boolean NOT NULL DEFAULT true,
  shared_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shared_at timestamptz DEFAULT now(),
  UNIQUE(note_id, user_id)
);

-- Activer RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_shares ENABLE ROW LEVEL SECURITY;

-- ==================== POLITIQUES POUR NOTES ====================

-- Les utilisateurs peuvent créer des notes dans leur organisation
CREATE POLICY "Users can create notes in their organization"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent lire leurs propres notes ET les notes partagées avec eux
CREATE POLICY "Users can read their notes and shared notes"
  ON notes
  FOR SELECT
  TO authenticated
  USING (
    -- Leurs propres notes
    created_by = auth.uid()
    OR
    -- Notes partagées avec eux dans la même organisation
    (
      id IN (
        SELECT note_id 
        FROM note_shares 
        WHERE user_id = auth.uid()
      )
      AND
      organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Les utilisateurs peuvent modifier leurs notes ET les notes partagées avec permission d'édition
CREATE POLICY "Users can update their notes and shared editable notes"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (
    -- Leurs propres notes
    created_by = auth.uid()
    OR
    -- Notes partagées avec permission d'édition
    (
      id IN (
        SELECT note_id 
        FROM note_shares 
        WHERE user_id = auth.uid() AND can_edit = true
      )
      AND
      organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Seuls les créateurs peuvent supprimer leurs notes
CREATE POLICY "Users can delete only their own notes"
  ON notes
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- ==================== POLITIQUES POUR NOTE_SHARES ====================

-- Les créateurs de notes peuvent créer des partages
CREATE POLICY "Note creators can share their notes"
  ON note_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (
    shared_by = auth.uid() AND
    note_id IN (
      SELECT id FROM notes WHERE created_by = auth.uid()
    ) AND
    -- L'utilisateur avec qui on partage doit être dans la même organisation
    user_id IN (
      SELECT user_id 
      FROM organization_members 
      WHERE organization_id IN (
        SELECT organization_id 
        FROM notes 
        WHERE id = note_id
      )
    )
  );

-- Les utilisateurs peuvent voir les partages de leurs notes ET leurs propres accès
CREATE POLICY "Users can read note shares they created or are part of"
  ON note_shares
  FOR SELECT
  TO authenticated
  USING (
    -- Partages qu'ils ont créés
    shared_by = auth.uid()
    OR
    -- Partages dont ils sont bénéficiaires
    user_id = auth.uid()
  );

-- Les créateurs de notes peuvent modifier les partages de leurs notes
CREATE POLICY "Note creators can update shares of their notes"
  ON note_shares
  FOR UPDATE
  TO authenticated
  USING (
    note_id IN (
      SELECT id FROM notes WHERE created_by = auth.uid()
    )
  );

-- Les créateurs de notes peuvent supprimer les partages de leurs notes
-- Les utilisateurs peuvent supprimer leur propre accès (se retirer du partage)
CREATE POLICY "Note creators can delete shares, users can remove themselves"
  ON note_shares
  FOR DELETE
  TO authenticated
  USING (
    -- Créateur de la note peut supprimer tous les partages
    note_id IN (
      SELECT id FROM notes WHERE created_by = auth.uid()
    )
    OR
    -- Utilisateur peut se retirer du partage
    user_id = auth.uid()
  );

-- ==================== TRIGGERS ====================

-- Trigger pour updated_at sur notes
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ==================== FONCTIONS UTILES ====================

-- Fonction pour obtenir les utilisateurs d'une organisation (pour le partage)
CREATE OR REPLACE FUNCTION get_organization_members(org_id uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  avatar_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.email,
    p.avatar_url
  FROM profiles p
  JOIN organization_members om ON p.id = om.user_id
  WHERE om.organization_id = org_id
  ORDER BY p.full_name NULLS LAST, p.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les collaborateurs d'une note
CREATE OR REPLACE FUNCTION get_note_collaborators(note_id_param uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  avatar_url text,
  can_edit boolean,
  is_creator boolean
) AS $$
BEGIN
  RETURN QUERY
  -- Créateur de la note
  SELECT 
    p.id,
    p.full_name,
    p.email,
    p.avatar_url,
    true as can_edit,
    true as is_creator
  FROM profiles p
  JOIN notes n ON p.id = n.created_by
  WHERE n.id = note_id_param
  
  UNION ALL
  
  -- Collaborateurs via partage
  SELECT 
    p.id,
    p.full_name,
    p.email,
    p.avatar_url,
    ns.can_edit,
    false as is_creator
  FROM profiles p
  JOIN note_shares ns ON p.id = ns.user_id
  WHERE ns.note_id = note_id_param
  
  ORDER BY is_creator DESC, full_name NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 