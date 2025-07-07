# 📧 Configuration des emails Supabase personnalisés

## 🔗 Accès à la configuration

**URL directe de configuration :**
```
https://supabase.com/dashboard/project/oswurfekgezdxvnofndb/auth/templates
```

## 📋 Templates à configurer

### 1. Confirm signup (Confirmation d'inscription)

**Utilisation :** Email envoyé lors de l'inscription d'un nouvel utilisateur

**Variables disponibles :**
- `{{ .Email }}` - Email de l'utilisateur
- `{{ .ConfirmationURL }}` - URL de confirmation
- `{{ .TokenHash }}` - Hash du token
- `{{ .Token }}` - Token de confirmation
- `{{ .SiteURL }}` - URL de votre site

**Template personnalisé :** Voir `email-templates.html`

### 2. Reset password (Réinitialisation de mot de passe)

**Variables disponibles :**
- `{{ .Email }}` - Email de l'utilisateur
- `{{ .ResetPasswordURL }}` - URL de réinitialisation
- `{{ .TokenHash }}` - Hash du token
- `{{ .Token }}` - Token de réinitialisation
- `{{ .SiteURL }}` - URL de votre site

### 3. Magic link (Connexion magique)

**Variables disponibles :**
- `{{ .Email }}` - Email de l'utilisateur
- `{{ .MagicLinkURL }}` - URL du lien magique
- `{{ .TokenHash }}` - Hash du token
- `{{ .Token }}` - Token magique
- `{{ .SiteURL }}` - URL de votre site

### 4. Change email address (Changement d'email)

**Variables disponibles :**
- `{{ .Email }}` - Nouvel email
- `{{ .ConfirmationURL }}` - URL de confirmation
- `{{ .TokenHash }}` - Hash du token
- `{{ .Token }}` - Token de confirmation
- `{{ .SiteURL }}` - URL de votre site

## 🎨 Personnalisation du design

### Couleurs utilisées (cohérentes avec l'app)
- **Gradient principal :** `#667eea → #764ba2`
- **Bouton CTA :** `#3b82f6 → #1d4ed8`
- **Texte principal :** `#1f2937`
- **Texte secondaire :** `#6b7280`
- **Arrière-plan cards :** `rgba(255, 255, 255, 0.95)`

### Éléments de design
- **Glassmorphism** avec `backdrop-filter: blur(10px)`
- **Border radius** de 24px pour la carte principale
- **Shadows** avec effet de profondeur
- **Typography** moderne avec font stack système
- **Responsive** design pour mobile

## ⚙️ Configuration étape par étape

### 1. Accéder à Supabase Dashboard
1. Rendez-vous sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet `Home.io`
3. Dans la sidebar, cliquez sur **Authentication**
4. Puis sur **Email Templates**

### 2. Configurer chaque template
1. Sélectionnez le template à modifier
2. Copiez le code HTML depuis `email-templates.html`
3. Adaptez les variables selon le type d'email
4. Testez avec l'aperçu
5. Sauvegardez

### 3. Configuration SMTP (optionnel)
Pour un meilleur deliverability, configurez votre propre SMTP :
1. Allez dans **Settings** > **Auth**
2. Section **SMTP Settings**
3. Configurez votre provider (Sendgrid, Mailgun, etc.)

## 🧪 Test des templates

### Via l'interface Supabase
1. Dans Email Templates, cliquez sur **Preview**
2. Vérifiez le rendu sur desktop et mobile
3. Testez les liens et variables

### Via l'application
1. Créez un compte de test
2. Vérifiez la réception de l'email
3. Confirmez que le design s'affiche correctement
4. Testez la fonctionnalité de confirmation

## 📱 Optimisations mobiles

Le template inclut :
- **Media queries** pour écrans < 600px
- **Boutons tactiles** optimisés
- **Texte lisible** sur petit écran
- **Espacement adaptatif**

## 🔧 Variables d'environnement importantes

Assurez-vous que ces variables sont configurées :

```env
VITE_SUPABASE_URL=https://oswurfekgezdxvnofndb.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📊 Suivi et analytics

Pour tracker l'efficacité des emails :
1. **Taux d'ouverture** via votre provider SMTP
2. **Taux de clic** sur les liens de confirmation
3. **Taux de conversion** inscription → confirmation

## 🛡️ Sécurité

- Les tokens expirent automatiquement (24h par défaut)
- URLs signées cryptographiquement
- Protection contre les attaques de phishing
- Domaine de redirection contrôlé

## 💡 Tips d'optimisation

1. **Testez sur plusieurs clients** email (Gmail, Outlook, Apple Mail)
2. **Vérifiez les spams** - testez avec [Mail Tester](https://www.mail-tester.com/)
3. **Optimisez les images** si vous en ajoutez
4. **Gardez le HTML simple** pour la compatibilité
5. **Utilisez des fallbacks** pour les propriétés CSS modernes

## 🔄 Mise à jour du template

Après modification :
1. Sauvegardez dans Supabase
2. Testez avec un compte de test
3. Vérifiez sur mobile
4. Déployez en production

---

**📍 Liens utiles :**
- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [CSS Email Compatibility](https://www.campaignmonitor.com/css/) 