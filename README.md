# 🏠 Home.io

Application de gestion financière moderne avec React, TypeScript et Supabase.

## ✨ Fonctionnalités

- 🔐 **Authentification complète** avec Supabase Auth
- 💰 **Gestion des transactions** (dépenses et revenus)
- 📊 **Visualisations graphiques** avec évolution temporelle
- 🏢 **Gestion d'organisations** multi-utilisateurs
- 📱 **Interface responsive** avec design moderne
- 🎯 **Catégories système et personnalisées**
- 📈 **Tableaux de bord interactifs**

## 🚀 Déploiement

L'application est automatiquement déployée sur Netlify : [https://browser-home-io.netlify.app](https://browser-home-io.netlify.app)

## 🛠️ Technologies

- **Frontend :** React 18, TypeScript, Vite
- **UI :** Tailwind CSS, Shadcn/ui
- **Backend :** Supabase (Auth, Database, RLS)
- **Graphiques :** Recharts
- **Déploiement :** Netlify
- **Linting :** ESLint avec configuration stricte

## 📦 Installation locale

```bash
# Cloner le repository
git clone https://github.com/votre-username/home-io-app.git
cd home-io-app

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Remplir avec vos clés Supabase

# Démarrer en développement
npm run dev
```

## 🔧 Variables d'environnement

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

## 📊 Structure de la base de données

- `profiles` - Profils utilisateurs
- `organizations` - Organisations/Équipes
- `organization_members` - Membres des organisations
- `categories` - Catégories de transactions
- `sub_categories` - Sous-catégories
- `transactions` - Transactions financières

## 🏗️ Architecture

```
src/
├── components/           # Composants React réutilisables
│   ├── auth/            # Authentification
│   ├── accounting/      # Gestion financière
│   ├── layout/          # Mise en page
│   └── ui/              # Composants UI de base
├── hooks/               # React hooks personnalisés
├── lib/                 # Utilitaires et configuration
└── main.tsx             # Point d'entrée
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -m 'feat: ajouter nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🎯 Roadmap

- [ ] Application mobile React Native
- [ ] Export PDF des rapports
- [ ] Notifications push
- [ ] API publique
- [ ] Intégration bancaire

---

Développé avec ❤️ par Jean Rosset 