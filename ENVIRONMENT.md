# Variables d'environnement

## Configuration Supabase

Pour faire fonctionner l'application en local, vous devez créer un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase_ici
```

## Obtenir les clés Supabase

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **API**
4. Copiez l'**URL** et l'**anon public key**

## Configuration Netlify

Les variables d'environnement sont automatiquement configurées sur Netlify lors du déploiement. Elles sont déjà définies dans le projet de production. 