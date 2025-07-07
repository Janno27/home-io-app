/*
  # Configuration de l'authentification et des organisations

  1. Nouvelles Tables
    - `profiles` - Profils utilisateurs étendus
      - `id` (uuid, clé primaire, référence auth.users)
      - `email` (text, unique)
      - `full_name` (text, optionnel)
      - `avatar_url` (text, optionnel)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `organizations` - Organisations créées par les utilisateurs
      - `id` (uuid, clé primaire)
      - `name` (text, nom de l'organisation)
      - `description` (text, optionnel)
      - `owner_id` (uuid, référence profiles.id)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `organization_members` - Membres des organisations
      - `id` (uuid, clé primaire)
      - `organization_id` (uuid, référence organizations.id)
      - `user_id` (uuid, référence profiles.id)
      - `role` (enum: owner, admin, member)
      - `created_at` (timestamp)

  2. Sécurité
    - Activation de RLS sur toutes les tables
    - Politiques pour que les utilisateurs ne voient que leurs propres données
    - Politiques pour la gestion des organisations selon les rôles

  3. Fonctions
    - Trigger pour créer automatiquement un profil lors de l'inscription
    - Trigger pour mettre à jour automatiquement updated_at
*/

-- Extension pour les UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des organisations
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des membres d'organisations
CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Activation de RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Politiques pour les profils
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Politiques pour les organisations
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

CREATE POLICY "Users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

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

-- Politiques pour les membres d'organisations
CREATE POLICY "Users can read organization memberships they're part of"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can manage memberships"
  ON organization_members
  FOR ALL
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

-- Fonction pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer un profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Fonction pour ajouter automatiquement le propriétaire comme membre
CREATE OR REPLACE FUNCTION handle_new_organization()
RETURNS trigger AS $$
BEGIN
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour ajouter le propriétaire comme membre
DROP TRIGGER IF EXISTS on_organization_created ON organizations;
CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION handle_new_organization();