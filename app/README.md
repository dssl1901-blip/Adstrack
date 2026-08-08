# AdScout

Radar produit basé sur la Meta Ad Library — recherche les pubs actives en Europe (FR, DE, ES, IT, BE, NL, PT, PL, SE, IE), triées par spend estimé.

## Lancer en local

```bash
npm install
cp .env.example .env.local
# colle ton token Meta dans .env.local
npm run dev
```

Ouvre http://localhost:3000

## Déployer sur Vercel

1. Pousse ce dossier sur un repo GitHub
2. Sur vercel.com → "Add New Project" → importe le repo
3. Dans Settings > Environment Variables, ajoute `META_ACCESS_TOKEN` avec ton token
4. Deploy

## Récupérer ton token Meta

Le token doit être un **User Access Token** valide (généré via Graph API Explorer) avec accès à l'Ad Library API débloqué (vérification d'identité requise sur ton compte Meta).

Un User Access Token classique expire au bout d'1h-2h : pour un usage durable, prévois de le convertir en token longue durée (60 jours) ou de le régénérer régulièrement.

## Limites connues

- Le spend et les impressions ne sont fournis par Meta qu'en **tranches** (ex: "1000-4999"), jamais en valeur exacte.
- Ces données ne sont disponibles que pour les pubs diffusées dans l'UE (grâce au DSA) — d'où le filtre pays actuel.
