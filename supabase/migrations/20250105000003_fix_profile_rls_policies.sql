/*
  # Correction des politiques RLS pour les profils

  1. Problème identifié
    - Les utilisateurs ne peuvent voir que leur propre profil
    - Cela empêche la récupération des membres de l'organisation
    - Les fonctions get_organization_members et get_note_collaborators ne fonctionnent pas

  2. Solution
    - Ajouter une politique pour permettre aux membres d'organisation de voir les profils des autres membres
    - Conserver la sécurité en limitant l'accès aux membres de la même organisation

  3. Nouvelles politiques
    - Les utilisateurs peuvent voir leur propre profil
    - Les membres d'organisation peuvent voir les profils des autres membres de la même organisation
*/

-- Supprimer l'ancienne politique restrictive
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Créer de nouvelles politiques plus flexibles

-- 1. Les utilisateurs peuvent toujours voir leur propre profil
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. Les membres d'organisation peuvent voir les profils des autres membres de la même organisation
CREATE POLICY "Organization members can read other members profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT om1.user_id
      FROM organization_members om1
      JOIN organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om2.user_id = auth.uid()
    )
  );

-- Recréer les fonctions avec SECURITY DEFINER pour s'assurer qu'elles fonctionnent correctement

-- Fonction pour obtenir les utilisateurs d'une organisation (version améliorée)
CREATE OR REPLACE FUNCTION get_organization_members(org_id uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  avatar_url text
) AS $$
BEGIN
  -- Vérifier que l'utilisateur actuel est membre de cette organisation
  IF NOT EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = org_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not a member of this organization';
  END IF;

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

-- Fonction pour obtenir les collaborateurs d'une note (version améliorée)
CREATE OR REPLACE FUNCTION get_note_collaborators(note_id_param uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  avatar_url text,
  can_edit boolean,
  is_creator boolean
) AS $$
DECLARE
  note_org_id uuid;
BEGIN
  -- Récupérer l'organisation de la note
  SELECT organization_id INTO note_org_id
  FROM notes
  WHERE id = note_id_param;

  -- Vérifier que l'utilisateur actuel a accès à cette note
  IF NOT EXISTS (
    SELECT 1 FROM notes 
    WHERE id = note_id_param 
    AND (
      created_by = auth.uid() 
      OR id IN (
        SELECT note_id FROM note_shares WHERE user_id = auth.uid()
      )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: User does not have access to this note';
  END IF;

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

-- Fonction utilitaire pour obtenir les membres d'organisation que l'utilisateur peut voir
CREATE OR REPLACE FUNCTION get_my_organization_members()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  avatar_url text,
  organization_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.email,
    p.avatar_url,
    om.organization_id
  FROM profiles p
  JOIN organization_members om ON p.id = om.user_id
  WHERE om.organization_id IN (
    -- Organisations dont l'utilisateur actuel est membre
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
  ORDER BY om.organization_id, p.full_name NULLS LAST, p.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 