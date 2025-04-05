#  Déploiement Code Rating System

Cette documentation explique comment un collègue peut **cloner le projet** et **tout lancer** en local avec :
- Les **containers PostgreSQL et frontend côté Windows**
- Les **VMs Linux (node1 + node2)** avec Nginx, les APIs, le worker, le script `create-ressources.sh` et la configuration Pacemaker.

---

## Pré-requis

### Côté Windows (hôte)

- Docker Desktop installé
- Git installé
- Port 5433 (master), 5434 (replica) et 3000 (frontend) ouverts

### Côté Linux (VMs node1 / node2)

- Ubuntu Server 20.04 ou supérieur
- SSH actif pour transfert de fichiers
- Pacemaker / Corosync installés (`sudo apt install pacemaker corosync pcs`)
- Docker installé (`curl -fsSL https://get.docker.com | sh`)
- Clonage du repo dans `/home/<user>/code-rating-system`

---

## 1 Côté Windows : lancer la base de données + frontend

Depuis PowerShell à la racine du projet (`code-rating-system/infra`) :

```bash
docker compose up -d
```

 Cela démarre :
- `postgres-master` sur le port `5433`
- `postgres-replica` sur le port `5434`
- Le `frontend` React sur `http://localhost:3000`

Vérifie que les tables ont bien été créées (contenu de `postgres-master/schema.sql` est bien injecté).

---

## 2 Côté Linux (VM node1 et node2)

### A. Cloner le repo

```bash
git clone https://github.com/zakaribel-dev/code-rating-system-bis.git
```

### B. Vérifier les fichiers `.env`

Exemple de `.env` dans `infra/backend/.env` et `infra/worker/.env` :

```env
PORT=3000
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=code_rating
POSTGRES_HOST=<IP de la machine Windows>  #  exemple : 192.168.56.1 (faites un ipconfig sur un powershell pour connaitre votre ip)
POSTGRES_PORT=5433
```

> Fais bien attention à adapter l'`IP` de `POSTGRES_HOST` à celle de l'hôte Windows (via `ipconfig`).

### C. Build des images

```bash
cd code-rating-system/infra
docker build -t code-api ./backend
docker build -t code-worker ./worker
docker build -t code-nginx ./nginx
```

---

## 3️ Lancer les ressources HA (sur node1)

```bash
sudo ./create-ressources.sh
```

Ce script :
- Supprime les anciennes ressources Pacemaker
- Crée `api1`, `api2`, `worker1`, `nginx1`, `virtual-ip`
- Monte les bons volumes (`/infra/backend:/app`, `/infra/worker:/app`, etc.)
- Définit les contraintes (ordre de démarrage + colocation avec IP flottante)

---

## 4️ Tester

### Accès web :
- Frontend : http://localhost:3000
- Backend : https://192.168.56.101:8443/test

### Test de soumission :
- Connectez-vous avec un compte admin
- Créez un exercice
- Soumettez un fichier `.py` ou `.c`
- Le worker attribuera une note automatiquement

---

## pti tips

- Si les containers ne démarrent pas : vérifier les logs avec `sudo pcs status` ou `docker logs <container>`
- Tu veux tout restart au propre côté VM ? Voici un petit sortilège :


```bash

cd ~/code-rating-system/infra
sudo ./create-ressources.sh

```
---

##  Fait avec amour par Jean et Zakaria