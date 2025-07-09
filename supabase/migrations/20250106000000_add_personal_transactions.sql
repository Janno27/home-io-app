/*
  # Ajout des transactions personnelles vs communes

  1. Modifications
    - Ajouter un champ `is_personal` (boolean) à la table `transactions`
    - Modifier les politiques RLS pour gérer les transactions personnelles
    - Mettre à jour la vue `transaction_with_refunds`

  2. Logique des transactions
    - `is_personal = false` : Transaction commune (visible par tous les membres de l'organisation)
    - `is_personal = true` : Transaction personnelle (visible uniquement par l'utilisateur qui l'a créée)
*/

-- Ajouter le champ is_personal à la table transactions
ALTER TABLE transactions 
ADD COLUMN is_personal boolean DEFAULT false NOT NULL;

-- Mettre à jour les politiques RLS existantes pour les transactions
DROP POLICY IF EXISTS "Organization members can read transactions" ON transactions;
DROP POLICY IF EXISTS "Organization members can create transactions" ON transactions;

-- Nouvelle politique de lecture : les membres peuvent voir les transactions communes + leurs propres transactions personnelles
CREATE POLICY "Members can read organization and personal transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    -- Transactions communes de l'organisation
    (is_personal = false AND organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    ))
    OR
    -- Ses propres transactions personnelles
    (is_personal = true AND user_id = auth.uid())
  );

-- Nouvelle politique de création : les membres peuvent créer des transactions communes ou personnelles
CREATE POLICY "Members can create organization and personal transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Vérifier que l'utilisateur appartient à l'organisation
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    ) 
    AND user_id = auth.uid()
  );

-- Mettre à jour la vue transaction_with_refunds pour inclure le champ is_personal
DROP VIEW IF EXISTS transaction_with_refunds;

CREATE OR REPLACE VIEW transaction_with_refunds AS
SELECT 
  t.*,
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
) r ON t.id = r.transaction_id;

-- Ajouter un index sur is_personal pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_transactions_is_personal ON transactions(is_personal);
CREATE INDEX IF NOT EXISTS idx_transactions_personal_user ON transactions(user_id, is_personal); 