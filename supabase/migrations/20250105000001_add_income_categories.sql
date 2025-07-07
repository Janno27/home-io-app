/*
  # Ajout des catégories système de revenus

  1. Catégories de revenus
    - Revenus exceptionnels
    - Revenus réguliers
    
  2. Sous-catégories système
    - Revenus exceptionnels : Cadeaux/dons, Rentes ponctuelles, Revente appart, Vinted
    - Revenus réguliers : Coverflex, Salaires
*/

-- Ajouter les catégories système de revenus pour chaque organisation
DO $$
DECLARE
  org_record RECORD;
  -- Variables pour stocker les IDs des catégories
  revenus_exceptionnels_id uuid;
  revenus_reguliers_id uuid;
BEGIN
  FOR org_record IN SELECT id FROM organizations LOOP
    
    -- ==================== CATÉGORIES DE REVENUS ====================
    
    -- Revenus exceptionnels
    INSERT INTO categories (name, type, organization_id, is_system) 
    VALUES ('Revenus exceptionnels', 'income', org_record.id, true)
    RETURNING id INTO revenus_exceptionnels_id;
    
    INSERT INTO sub_categories (name, category_id, is_system) VALUES
      ('Cadeaux, dons', revenus_exceptionnels_id, true),
      ('Rentes ponctuelles', revenus_exceptionnels_id, true),
      ('Revente appart', revenus_exceptionnels_id, true),
      ('Vinted', revenus_exceptionnels_id, true);
    
    -- Revenus réguliers
    INSERT INTO categories (name, type, organization_id, is_system) 
    VALUES ('Revenus réguliers', 'income', org_record.id, true)
    RETURNING id INTO revenus_reguliers_id;
    
    INSERT INTO sub_categories (name, category_id, is_system) VALUES
      ('Coverflex', revenus_reguliers_id, true),
      ('Salaires', revenus_reguliers_id, true);
    
  END LOOP;
END $$; 