/*
  # Ajout du champ is_system pour identifier les catégories système

  1. Modifications
    - Ajouter le champ `is_system` aux tables `categories` et `sub_categories`
    - Marquer les catégories existantes comme système
    - Créer des sous-catégories système pour l'alimentation

  2. Données système
    - Sous-catégories pour Alimentation : Boulot, Drinks, Fast Food, Restaurant, Supermarché
*/

-- Ajouter le champ is_system aux catégories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false;

-- Ajouter le champ is_system aux sous-catégories  
ALTER TABLE sub_categories 
ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false;

-- Marquer toutes les catégories existantes comme système
UPDATE categories SET is_system = true;

-- Insérer des sous-catégories système pour Alimentation
DO $$
DECLARE
  org_record RECORD;
  alimentation_id uuid;
BEGIN
  FOR org_record IN SELECT id FROM organizations LOOP
    -- Trouver l'ID de la catégorie Alimentation pour cette organisation
    SELECT id INTO alimentation_id 
    FROM categories 
    WHERE name = 'Alimentation' 
      AND type = 'expense' 
      AND organization_id = org_record.id;
    
    -- Si la catégorie Alimentation existe, ajouter les sous-catégories
    IF alimentation_id IS NOT NULL THEN
      INSERT INTO sub_categories (name, category_id, is_system) VALUES
        ('Boulot', alimentation_id, true),
        ('Drinks', alimentation_id, true),
        ('Fast Food', alimentation_id, true),
        ('Restaurant', alimentation_id, true),
        ('Supermarché', alimentation_id, true);
    END IF;
  END LOOP;
END $$; 