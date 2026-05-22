# Yet Another Tron 🏍️

Jeu multijoueur Tron en ligne — jouable dans le navigateur, aucune installation requise pour les joueurs.

## Jouer en ligne

Une fois déployé, partage simplement l'URL à tes amis. C'est tout.

---

## Déployer gratuitement en 5 minutes

### Option 1 — Railway (recommandé, gratuit)

1. Va sur [railway.app](https://railway.app) et connecte-toi avec GitHub
2. Clique **"New Project" → "Deploy from GitHub repo"**
3. Sélectionne ce dépôt
4. Railway détecte le `Dockerfile` automatiquement
5. Clique **Deploy** — l'URL publique apparaît en quelques minutes

### Option 2 — Render (gratuit)

1. Va sur [render.com](https://render.com) → **"New Web Service"**
2. Connecte ton dépôt GitHub
3. Paramètres :
   - **Environment** : Docker
   - **Build Command** : *(vide — Dockerfile utilisé)*
   - **Start Command** : *(vide — défini dans Dockerfile)*
4. Clique **Create Web Service**

### Option 3 — Local (pour tester)

```bash
cd server
npm install
npm start
```

Ouvre http://localhost:8080 dans ton navigateur.

---

## Structure du projet

```
├── client/
│   └── index.html       # Jeu complet en HTML5/Canvas (aucune dépendance)
├── server/
│   ├── index.mjs        # Serveur Node.js WebSocket
│   └── package.json
├── Dockerfile           # Pour déploiement cloud
└── README.md
```

## Contrôles

| Action | Clavier | Mobile |
|--------|---------|--------|
| Haut   | ↑ ou Z/W | Bouton ▲ |
| Bas    | ↓ ou S | Bouton ▼ |
| Gauche | ← ou Q/A | Bouton ◀ |
| Droite | → ou D | Bouton ▶ |

## Comment ça marche

- Le serveur tourne un **game loop à 150ms** par tick
- À chaque tick, chaque joueur avance d'une case dans sa direction
- Si un joueur touche un mur ou une traîne → il respawn aléatoirement
- La carte est une grille **100×60** cases partagée entre tous les joueurs
- Communication en **WebSocket** (JSON) entre client et serveur

## Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `PORT` | `8080` | Port d'écoute du serveur |
