/*
  # Création des tables de comptabilité

  1. Nouvelles Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, nom de la catégorie)
      - `type` (text, 'expense' ou 'income')
      - `organization_id` (uuid, lien vers l'organisation)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `sub_categories`
      - `id` (uuid, primary key)
      - `name` (text, nom de la sous-catégorie)
      - `category_id` (uuid, lien vers la catégorie parent)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `amount` (decimal, montant de la transaction)
      - `description` (text, description optionnelle)
      - `transaction_date` (date, date de la transaction)
      - `accounting_date` (date, date comptable)
      - `category_id` (uuid, lien vers la catégorie)
      - `subcategory_id` (uuid, lien vers la sous-catégorie, optionnel)
      - `user_id` (uuid, utilisateur qui a créé la transaction)
      - `organization_id` (uuid, organisation de la transaction)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `refunds`
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, lien vers la transaction)
      - `amount` (decimal, montant du remboursement)
      - `refund_date` (date, date du remboursement)
      - `description` (text, description du remboursement)
      - `user_id` (uuid, utilisateur qui a créé le remboursement)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Vue
    - `transaction_with_refunds` (vue pour afficher les transactions avec leurs remboursements)

  3. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques pour que les membres d'organisation puissent accéder aux données de leur organisation
*/

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('expense', 'income')),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des sous-catégories
CREATE TABLE IF NOT EXISTS sub_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount decimal(12,2) NOT NULL,
  description text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  accounting_date date NOT NULL DEFAULT CURRENT_DATE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  subcategory_id uuid REFERENCES sub_categories(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des remboursements
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  amount decimal(12,2) NOT NULL,
  refund_date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Politiques pour categories
CREATE POLICY "Organization members can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- Politiques pour sub_categories
CREATE POLICY "Organization members can read sub_categories"
  ON sub_categories
  FOR SELECT
  TO authenticated
  USING (
    category_id IN (
      SELECT id FROM categories 
      WHERE organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can create sub_categories"
  ON sub_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    category_id IN (
      SELECT id FROM categories 
      WHERE organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can update sub_categories"
  ON sub_categories
  FOR UPDATE
  TO authenticated
  USING (
    category_id IN (
      SELECT id FROM categories 
      WHERE organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization owners can delete sub_categories"
  ON sub_categories
  FOR DELETE
  TO authenticated
  USING (
    category_id IN (
      SELECT id FROM categories 
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE owner_id = auth.uid()
      )
    )
  );

-- Politiques pour transactions
CREATE POLICY "Organization members can read transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    ) AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Politiques pour refunds
CREATE POLICY "Organization members can read refunds"
  ON refunds
  FOR SELECT
  TO authenticated
  USING (
    transaction_id IN (
      SELECT id FROM transactions 
      WHERE organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can create refunds"
  ON refunds
  FOR INSERT
  TO authenticated
  WITH CHECK (
    transaction_id IN (
      SELECT id FROM transactions 
      WHERE organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
      )
    ) AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own refunds"
  ON refunds
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own refunds"
  ON refunds
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Triggers pour updated_at
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER sub_categories_updated_at
  BEFORE UPDATE ON sub_categories
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER refunds_updated_at
  BEFORE UPDATE ON refunds
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Vue pour les transactions avec remboursements
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

-- Insérer quelques catégories par défaut pour chaque organisation existante
DO $$
DECLARE
  org_record RECORD;
BEGIN
  FOR org_record IN SELECT id FROM organizations LOOP
    -- Catégories de dépenses
    INSERT INTO categories (name, type, organization_id) VALUES
      ('Alimentation', 'expense', org_record.id),
      ('Transport', 'expense', org_record.id),
      ('Logement', 'expense', org_record.id),
      ('Santé', 'expense', org_record.id),
      ('Loisirs', 'expense', org_record.id),
      ('Autres dépenses', 'expense', org_record.id);
    
    -- Catégories de revenus
    INSERT INTO categories (name, type, organization_id) VALUES
      ('Salaire', 'income', org_record.id),
      ('Freelance', 'income', org_record.id),
      ('Investissements', 'income', org_record.id),
      ('Autres revenus', 'income', org_record.id);
  END LOOP;
END $$;