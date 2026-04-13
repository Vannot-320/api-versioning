# API Versioning & Compatibilité

> Démonstration complète des stratégies de versioning d'API REST avec Node.js, Express et Docker.

---

## Table des matières

- [Présentation](#présentation)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Endpoints](#endpoints)
- [Différences v1 vs v2](#différences-v1-vs-v2)
- [Docker](#docker)
- [Tests](#tests)
- [Maintenance & Rollback](#maintenance--rollback)

---

## Présentation

Ce projet illustre comment gérer le versioning d'une API REST de manière professionnelle :

- **Versioning par URL** : `/api/v1` et `/api/v2`
- **Dépréciation progressive** : v1 retourne des headers d'avertissement (`Deprecation`, `Sunset`)
- **Compatibilité ascendante** : v1 reste fonctionnelle pendant la période de transition
- **Conteneurisation** : déploiement via Docker et Docker Compose

---

## Architecture

```
api-versioning/
├── src/
│   ├── app.js                  # Configuration Express (routes, middlewares)
│   ├── server.js               # Point d'entrée, démarrage du serveur
│   ├── middleware/
│   │   ├── deprecation.js      # Headers de dépréciation pour v1
│   │   ├── errorHandler.js     # Gestion centralisée des erreurs
│   │   └── version.js          # Détection de version
│   ├── utils/
│   │   └── store.js            # Store de données en mémoire
│   ├── v1/
│   │   ├── routes.js           # Routes de l'API v1
│   │   └── controllers/
│   │       └── users.js        # Contrôleur utilisateurs v1
│   └── v2/
│       ├── routes.js           # Routes de l'API v2
│       └── controllers/
│           └── users.js        # Contrôleur utilisateurs v2 (pagination, PATCH)
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 20.x |
| npm | 9.x |
| Docker Desktop | 3.4+ |

---

## Installation

### Option 1 — En local (développement)

```bash
# Cloner le projet
git clone https://github.com/votre-utilisateur/api-versioning.git
cd api-versioning

# Installer les dépendances
npm install

# Lancer en mode développement (rechargement automatique)
npm run dev
```

Le serveur démarre sur **http://localhost:3000**.

### Option 2 — Via Docker (recommandé)

```bash
# Construire et démarrer le conteneur
docker compose up -d

# Vérifier que le conteneur tourne
docker ps

# Voir les logs en temps réel
docker logs api-versioning -f
```

---

## Configuration

Les variables d'environnement suivantes peuvent être définies :

| Variable | Valeur par défaut | Description |
|----------|------------------|-------------|
| `PORT` | `3000` | Port d'écoute du serveur |
| `NODE_ENV` | `development` | Environnement (`development` / `production`) |

Pour personnaliser, créer un fichier `.env` à la racine :

```env
PORT=3000
NODE_ENV=production
```

---

## Utilisation

### Vérifier que le serveur fonctionne

```bash
curl http://localhost:3000/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "versions": {
    "supported": ["v1", "v2"],
    "current": "v2",
    "deprecated": [{ "version": "v1", "sunset": "2025-12-31" }]
  }
}
```

### Informations sur l'API

```bash
curl http://localhost:3000/api
```

---

## Endpoints

### Santé & Info

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | État du serveur |
| GET | `/api` | Informations générales sur l'API |

### API v1 — Dépréciée

> ⚠️ La v1 est dépréciée depuis le 31/12/2025. Migrer vers v2.

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/v1/users` | Liste tous les utilisateurs |
| GET | `/api/v1/users/:id` | Récupère un utilisateur par ID |
| POST | `/api/v1/users` | Crée un utilisateur |
| PUT | `/api/v1/users/:id` | Met à jour un utilisateur (remplacement complet) |
| DELETE | `/api/v1/users/:id` | Supprime un utilisateur |

### API v2 — Courante

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/v2/users` | Liste avec pagination (`?page=1&limit=10`) |
| GET | `/api/v2/users/:id` | Récupère un utilisateur (format enrichi) |
| POST | `/api/v2/users` | Crée un utilisateur |
| PATCH | `/api/v2/users/:id` | Met à jour partiellement un utilisateur |
| DELETE | `/api/v2/users/:id` | Supprime un utilisateur |

#### Exemples de requêtes

```bash
# Lister tous les utilisateurs (v2)
curl http://localhost:3000/api/v2/users

# Lister avec pagination
curl "http://localhost:3000/api/v2/users?page=1&limit=2"

# Récupérer un utilisateur
curl http://localhost:3000/api/v2/users/1

# Créer un utilisateur
curl -X POST http://localhost:3000/api/v2/users \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Jean", "lastName": "Dupont", "email": "jean@example.com", "age": 28}'

# Mettre à jour partiellement (PATCH)
curl -X PATCH http://localhost:3000/api/v2/users/1 \
  -H "Content-Type: application/json" \
  -d '{"age": 31}'

# Supprimer un utilisateur
curl -X DELETE http://localhost:3000/api/v2/users/1
```

---

## Différences v1 vs v2

| Aspect | v1 (dépréciée) | v2 (courante) |
|--------|---------------|--------------|
| Format réponse | `{ succès, données, compte }` | `{ data, meta }` |
| Nom utilisateur | Champ unique `nom` | `firstName` + `lastName` séparés |
| Langue des champs | Français | Anglais |
| Mise à jour | `PUT` (remplacement complet) | `PATCH` (partielle) |
| Pagination | Non | Oui (`page`, `limit`, `pages`, `total`) |
| Timestamps | Non | Oui (`createdAt`, `updatedAt`) |
| Headers dépréciation | Non | `Deprecation`, `Sunset` sur v1 |

### Format de réponse v1

```json
{
  "succès": true,
  "données": [
    { "id": 1, "nom": "Alice Dupont", "email": "alice@example.com", "âge": 30, "rôle": "admin" }
  ],
  "compte": 1
}
```

### Format de réponse v2

```json
{
  "data": [
    {
      "id": 1,
      "firstName": "Alice",
      "lastName": "Dupont",
      "email": "alice@example.com",
      "age": 30,
      "role": "admin",
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

## Docker

### Commandes essentielles

```bash
# Démarrer en arrière-plan
docker compose up -d

# Voir les logs
docker logs api-versioning -f

# Arrêter le conteneur
docker compose down

# Reconstruire après modification du code
docker compose up -d --build

# Inspecter le conteneur
docker inspect api-versioning
```

### Structure du Dockerfile

Le Dockerfile utilise un **build multi-étapes** :

1. **Stage `builder`** : installe les dépendances npm en production
2. **Stage `production`** : copie uniquement le nécessaire, crée un utilisateur non-root (`appuser`) pour la sécurité

---

## Tests

```bash
# Lancer les tests automatisés
npm test

# Lancer les tests avec couverture de code
npm run test:coverage

# Lancer les tests en mode watch (développement)
npm run test:watch
```

> La collection Postman est disponible dans le fichier `postman_collection.json` à la racine du projet. Importez-la dans Postman via **File → Import**.

---

## Maintenance & Rollback

### Mise à jour de l'application

```bash
# 1. Récupérer les dernières modifications
git pull origin main

# 2. Reconstruire et redéployer
docker compose up -d --build

# 3. Vérifier que tout fonctionne
curl http://localhost:3000/health
```

### Rollback vers une version précédente

```bash
# 1. Lister les images disponibles
docker images | grep api-versioning

# 2. Revenir à une image précédente (remplacer <TAG> par le tag souhaité)
docker compose down
docker tag api-versioning-api:<TAG> api-versioning-api:latest
docker compose up -d

# 3. Ou revenir au commit Git précédent
git log --oneline          # Identifier le commit cible
git checkout <commit-hash>
docker compose up -d --build
```

### Surveillance

```bash
# Utilisation des ressources du conteneur
docker stats api-versioning

# Logs des dernières 100 lignes
docker logs api-versioning --tail=100

# Santé de l'API
curl http://localhost:3000/health
```

---

## Stratégie de dépréciation

La v1 envoie automatiquement les headers suivants dans chaque réponse :

```
Deprecation: true
Sunset: 2025-12-31
Link: </api/v2/users>; rel="successor-version"
```

Les clients doivent migrer vers v2 avant la date de sunset. Après cette date, v1 peut être retirée sans préavis.

---

## Licence

MIT — libre d'utilisation, modification et distribution.
