# arena-commande

Site de commande en ligne Arena Café (mobile, accessible par QR code).
Preact + Vite + Firebase (Firestore + connexion anonyme). Relié à la caisse
(dossier racine du dépôt, onglet 🌐 « Commandes en ligne »).

- `src/shared/` : menu de départ, calcul des prix, créneaux, envoi de commande.
  Ces fichiers sont aussi utilisés par la caisse.
- `../firebase/firestore.rules` : règles de sécurité (testées avec
  `cd ../firebase && npm install && npm test`, émulateur Firebase + Java).

## Déploiement Vercel

Nouveau projet Vercel sur ce dépôt, **Root Directory = `arena-commande`**,
avec les variables de `.env.example` (clés Firebase Web, non secrètes).

## Tester en local

```
cd ../firebase && npx firebase emulators:start --only firestore,auth --project demo-arena-commande
VITE_FB_EMULATEUR=1 VITE_FB_PROJECT_ID=demo-arena-commande npm run dev
```
