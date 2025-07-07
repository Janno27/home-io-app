/*
  # Nouvelle structure des catégories système

  1. Suppression des données existantes
    - Supprimer toutes les sous-catégories existantes
    - Supprimer toutes les catégories existantes

  2. Insertion des nouvelles catégories système de dépenses
    - Alimentation, Habitat, Loisirs, Personnel, Santé, Services, Transport
    
  3. Insertion des sous-catégories système
    - Basées sur les captures d'écran fournies
*/

-- Supprimer toutes les sous-catégories existantes
DELETE FROM sub_categories;

-- Supprimer toutes les catégories existantes  
DELETE FROM categories;

-- Insérer les nouvelles catégories système pour chaque organisation
DO $$
DECLARE
  org_record RECORD;
  -- Variables pour stocker les IDs des catégories
  alimentation_id uuid;
  habitat_id uuid;
  loisirs_id uuid;
  personnel_id uuid;
  sante_id uuid;
  services_id uuid;
  transport_id uuid;
BEGIN
  FOR org_record IN SELECT id FROM organizations LOOP
    
    -- ==================== CATÉGORIES DE DÉPENSES ====================
    
    -- Alimentation
    INSERT INTO categories (name, type, organization_id, is_system) 
    VALUES ('Alimentation', 'expense', org_record.id, true)
    RETURNING id INTO alimentation_id;
    
    INSERT INTO sub_categories (name, category_id, is_system) VALUES
      ('Boulot', alimentation_id, true),
      ('Drinks', alimentation_id, true),
      ('Fast Food', alimentation_id, true),
      ('Restaurant', alimentation_id, true),
      ('Supermarché', alimentation_id, true);
    
    -- Habitat
    INSERT INTO categories (name, type, organization_id, is_system) 
    VALUES ('Habitat', 'expense', org_record.id, true)
    RETURNING id INTO habitat_id;
    
    INSERT INTO sub_categories (name, category_id, is_system) VALUES
      ('Eau', habitat_id, true),
      ('Électricité', habitat_id, true),
      ('Gaz', habitat_id, true),
      ('Internet', habitat_id, true),
      ('Loyer', habitat_id, true),
      ('Maison', habitat_id, true),
      ('Ménage', habitat_id, true),
      ('Terrain', habitat_id, true),
      ('Van', habitat_id, true);
    
    -- Loisirs
    INSERT INTO categories (name, type, organization_id, is_system) 
    VALUES ('Loisirs', 'expense', org_record.id, true)
    RETURNING id INTO loisirs_id;
    
    INSERT INTO sub_categories (name, category_id, is_system) VALUES
      ('Loisirs et sorties', loisirs_id, true),
      ('Multimedia/divers', loisirs_id, true),
      ('Sport', loisirs_id, true),
      ('Weekends/Vacances', loisirs_id, true);
    
    -- Personnel
    INSERT INTO categories (name, type, organization_id, is_system) 
    VALUES ('Personnel', 'expense', org_record.id, true)
    RETURNING id INTO personnel_id;
    
    INSERT INTO sub_categories (name, category_id, is_system) VALUES
      ('Cadeaux', personnel_id, true),
      ('Coiffeur', personnel_id, true),
      ('Cosmétique', personnel_id, true),
      ('Esthétique', personnel_id, true),
      ('Shopping', personnel_id, true),
      ('Tabac', personnel_id, true);
    
    -- Santé
    INSERT INTO categories (name, type, organization_id, is_system) 
    VALUES ('Santé', 'expense', org_record.id, true)
    RETURNING id INTO sante_id;
    
    INSERT INTO sub_categories (name, category_id, is_system) VALUES
      ('Médecin', sante_id, true),
      ('Mutuelle', sante_id, true),
      ('Pharmacie', sante_id, true);
    
    -- Services
    INSERT INTO categories (name, type, organization_id, is_system) 
    VALUES ('Services', 'expense', org_record.id, true)
    RETURNING id INTO services_id;
    
    INSERT INTO sub_categories (name, category_id, is_system) VALUES
      ('Abonnements', services_id, true),
      ('Assurance habitation', services_id, true),
      ('Services bancaires', services_id, true);
    
    -- Transport
    INSERT INTO categories (name, type, organization_id, is_system) 
    VALUES ('Transport', 'expense', org_record.id, true)
    RETURNING id INTO transport_id;
    
    INSERT INTO sub_categories (name, category_id, is_system) VALUES
      ('Essence', transport_id, true),
      ('Péage', transport_id, true),
      ('Taxis', transport_id, true),
      ('Transport en commun', transport_id, true);
    
    -- ==================== CATÉGORIES DE REVENUS ====================
    -- (Vous pouvez ajouter des catégories de revenus si nécessaire)
    
  END LOOP;
END $$; 