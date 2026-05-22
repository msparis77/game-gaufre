# 🎮 GAME & GAUFRE — GUIDE DE DÉPLOIEMENT COMPLET
## De zéro à une vraie application en ligne en 30 minutes

---

## AVANT DE COMMENCER

Vous aurez besoin de :
- Un ordinateur ou téléphone avec accès internet
- Une adresse email Google (Gmail)
- Ce dossier de fichiers

Coût total : **0 FCFA / mois**

---

## ÉTAPE 1 — CRÉER LE COMPTE FIREBASE (5 min)
*Firebase = où vos données seront sauvegardées (serveurs Google)*

1. Allez sur **https://console.firebase.google.com**
2. Connectez-vous avec votre compte Gmail
3. Cliquez sur **"Créer un projet"**
4. Nom du projet : `game-gaufre` → Continuer
5. Désactivez Google Analytics (pas nécessaire) → Créer le projet
6. Attendez 30 secondes que le projet se crée

**Créer la base de données :**
1. Dans le menu gauche → **Firestore Database**
2. Cliquez **Créer une base de données**
3. Choisissez **Mode test** (pour commencer)
4. Région : `europe-west1` (Paris, plus proche de Dakar) → Activer

**Récupérer vos clés Firebase :**
1. Cliquez sur l'engrenage ⚙️ → **Paramètres du projet**
2. Descendez jusqu'à **"Vos applications"**
3. Cliquez sur l'icône `</>` (Web)
4. Nom de l'app : `game-gaufre-web` → Enregistrer
5. **COPIEZ** tout le bloc `firebaseConfig = { ... }` qui apparaît
6. Gardez cette page ouverte

---

## ÉTAPE 2 — CONFIGURER VOS CLÉS (3 min)

1. Ouvrez le fichier `src/firebase.js` dans un éditeur de texte
   - Sur Windows : clic droit → Ouvrir avec → Bloc-notes
   - Sur Mac : clic droit → Ouvrir avec → TextEdit

2. Remplacez les valeurs entre guillemets :
```
"REMPLACEZ_PAR_VOTRE_API_KEY"  →  copiez votre vraie valeur
"REMPLACEZ_PAR_VOTRE_AUTH_DOMAIN"  →  copiez votre vraie valeur
etc.
```

3. Sauvegardez le fichier (Ctrl+S)

**Exemple de ce que ça doit ressembler :**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "game-gaufre-12345.firebaseapp.com",
  projectId: "game-gaufre-12345",
  storageBucket: "game-gaufre-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

---

## ÉTAPE 3 — CRÉER LE COMPTE GITHUB (5 min)
*GitHub = où votre code sera stocké pour le déploiement*

1. Allez sur **https://github.com**
2. Cliquez **Sign up** → Créez un compte gratuit
3. Vérifiez votre email

**Créer un nouveau dépôt :**
1. Cliquez sur **"New repository"** (bouton vert)
2. Nom : `game-gaufre`
3. Cochez **"Public"**
4. Cliquez **"Create repository"**

**Uploader vos fichiers :**
1. Sur la page du dépôt → cliquez **"uploading an existing file"**
2. Glissez-déposez TOUS les fichiers de ce dossier
   ⚠️ Important : uploadez aussi le dossier `src/` et `public/`
3. Cliquez **"Commit changes"** → **"Commit directly to main"**

---

## ÉTAPE 4 — DÉPLOYER SUR VERCEL (5 min)
*Vercel = le service qui met votre app en ligne gratuitement*

1. Allez sur **https://vercel.com**
2. Cliquez **"Sign up"** → Choisissez **"Continue with GitHub"**
3. Autorisez Vercel à accéder à GitHub

**Déployer le projet :**
1. Cliquez **"Add New Project"**
2. Vous verrez votre dépôt `game-gaufre` → Cliquez **"Import"**
3. Laissez tous les paramètres par défaut
4. Cliquez **"Deploy"**
5. Attendez 2-3 minutes...

**🎉 C'est en ligne !**
Vercel vous donnera une URL comme :
`https://game-gaufre-xxx.vercel.app`

---

## ÉTAPE 5 — PERSONNALISER L'URL (optionnel, 2 min)

1. Dans Vercel → votre projet → **Settings → Domains**
2. Vous pouvez obtenir une URL personnalisée comme :
   `game-gaufre-dakar.vercel.app`

---

## ÉTAPE 6 — INSTALLER COMME APPLICATION SUR TÉLÉPHONE

**Sur Android (Chrome) :**
1. Ouvrez l'URL dans Chrome
2. Menu ⋮ → **"Ajouter à l'écran d'accueil"**
3. L'app apparaît comme une vraie application !

**Sur iPhone (Safari) :**
1. Ouvrez l'URL dans Safari
2. Bouton partager 📤 → **"Sur l'écran d'accueil"**
3. Nommez-la "Game & Gaufre"

---

## RÈGLES DE SÉCURITÉ FIREBASE (IMPORTANT !)

Après 30 jours, le mode test expire. Pour sécuriser :

1. Firebase Console → Firestore → **Règles**
2. Remplacez le contenu par :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gameGaufre/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Cliquez **Publier**

---

## 🆘 EN CAS DE PROBLÈME

**L'app ne se charge pas :**
→ Vérifiez que les clés Firebase dans `src/firebase.js` sont correctes

**"Permission denied" sur Firebase :**
→ Vérifiez les règles Firestore (Étape sécurité ci-dessus)

**Les données ne se sauvegardent pas :**
→ Vérifiez votre connexion internet
→ Vérifiez que Firestore est activé dans Firebase

**Besoin d'aide :**
→ Retournez dans Claude et décrivez le problème exact

---

## 📱 PARTAGER AVEC VOS EMPLOYÉS

Une fois déployé, envoyez simplement l'URL par WhatsApp :
```
🎮 Game & Gaufre — Système de caisse
Lien : https://game-gaufre-xxx.vercel.app
Votre PIN : [donnez leur PIN individuellement]
```

---

## 💰 RÉCAPITULATIF DES COÛTS

| Service | Coût mensuel |
|---------|-------------|
| Vercel (hébergement) | 0 FCFA |
| Firebase (base de données) | 0 FCFA |
| Domaine .vercel.app | 0 FCFA |
| **TOTAL** | **0 FCFA** |

*Restera gratuit même avec plusieurs boutiques et employés*

---

## 🔄 COMMENT METTRE À JOUR L'APPLICATION

Quand vous voudrez améliorer l'app (nouvelles fonctions, corrections) :
1. Modifiez le fichier `src/App.jsx`
2. Uploadez le nouveau fichier sur GitHub
3. Vercel redéploie automatiquement en 2 minutes ✅

---

*Développé avec ❤️ pour Game & Gaufre — Limamoulaye, Guédiawaye, Dakar*
