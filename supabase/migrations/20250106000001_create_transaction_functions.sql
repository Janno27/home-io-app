/*
  # Création des fonctions pour la gestion des transactions avec filtrage

  1. Fonctions créées
    - get_organization_transactions : Récupère les transactions avec filtrage (all, common, personal)
    - get_transaction_statistics : Statistiques des transactions par filtre pour une organisation
*/

-- Fonction pour récupérer les transactions avec filtrage
CREATE OR REPLACE FUNCTION get_organization_transactions(
  org_id uuid,
  filter_type text DEFAULT 'all',
  current_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  amount decimal,
  description text,
  transaction_date date,
  accounting_date date,
  category_id uuid,
  subcategory_id uuid,
  user_id uuid,
  organization_id uuid,
  is_personal boolean,
  created_at timestamptz,
  updated_at timestamptz,
  total_refunded decimal,
  net_amount decimal,
  category_name text,
  category_type text,
  subcategory_name text,
  user_name text,
  user_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Utiliser l'ID utilisateur fourni ou auth.uid()
  IF current_user_id IS NULL THEN
    current_user_id := auth.uid();
  END IF;

  -- Vérifier que l'utilisateur appartient à l'organisation
  IF NOT EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = org_id AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Utilisateur non autorisé pour cette organisation';
  END IF;

  RETURN QUERY
  SELECT 
    t.id,
    t.amount,
    t.description,
    t.transaction_date,
    t.accounting_date,
    t.category_id,
    t.subcategory_id,
    t.user_id,
    t.organization_id,
    t.is_personal,
    t.created_at,
    t.updated_at,
    COALESCE(r.total_refunded, 0) as total_refunded,
    (t.amount - COALESCE(r.total_refunded, 0)) as net_amount,
    c.name as category_name,
    c.type as category_type,
    sc.name as subcategory_name,
    p.full_name as user_name,
    p.email as user_email
  FROM transactions t
  LEFT JOIN categories c ON t.category_id = c.id
  LEFT JOIN sub_categories sc ON t.subcategory_id = sc.id
  LEFT JOIN profiles p ON t.user_id = p.id
  LEFT JOIN (
    SELECT 
      transaction_id,
      SUM(amount) as total_refunded
    FROM refunds
    GROUP BY transaction_id
  ) r ON t.id = r.transaction_id
  WHERE t.organization_id = org_id
    AND (
      CASE filter_type
        WHEN 'all' THEN 
          -- Toutes les transactions : communes + personnelles de l'utilisateur actuel
          (t.is_personal = false OR (t.is_personal = true AND t.user_id = current_user_id))
        WHEN 'common' THEN 
          -- Seulement les transactions communes
          t.is_personal = false
        WHEN 'personal' THEN 
          -- Seulement les transactions personnelles de l'utilisateur actuel
          (t.is_personal = true AND t.user_id = current_user_id)
        ELSE 
          -- Par défaut, toutes les transactions accessibles
          (t.is_personal = false OR (t.is_personal = true AND t.user_id = current_user_id))
      END
    )
  ORDER BY t.accounting_date DESC, t.created_at DESC;
END;
$$;

-- Fonction pour obtenir les statistiques de transactions par filtre
CREATE OR REPLACE FUNCTION get_transaction_statistics(
  org_id uuid,
  current_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  all_count integer,
  common_count integer,
  personal_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Utiliser l'ID utilisateur fourni ou auth.uid()
  IF current_user_id IS NULL THEN
    current_user_id := auth.uid();
  END IF;

  -- Vérifier que l'utilisateur appartient à l'organisation
  IF NOT EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = org_id AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Utilisateur non autorisé pour cette organisation';
  END IF;

  RETURN QUERY
  SELECT 
    -- Toutes les transactions accessibles (communes + personnelles de l'utilisateur)
    (SELECT COUNT(*)::integer 
     FROM transactions t 
     WHERE t.organization_id = org_id 
       AND (t.is_personal = false OR (t.is_personal = true AND t.user_id = current_user_id))
    ) as all_count,
    
    -- Transactions communes seulement
    (SELECT COUNT(*)::integer 
     FROM transactions t 
     WHERE t.organization_id = org_id 
       AND t.is_personal = false
    ) as common_count,
    
    -- Transactions personnelles de l'utilisateur seulement
    (SELECT COUNT(*)::integer 
     FROM transactions t 
     WHERE t.organization_id = org_id 
       AND t.is_personal = true 
       AND t.user_id = current_user_id
    ) as personal_count;
END;
$$;

-- Accorder les permissions sur les fonctions
GRANT EXECUTE ON FUNCTION get_organization_transactions(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_transaction_statistics(uuid, uuid) TO authenticated; 