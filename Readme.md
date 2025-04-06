
#  Déploiement Code Rating System

Cette documentation explique comment un collègue peut **cloner le projet** et **tout lancer** en local avec :
- Les **containers PostgreSQL + frontend sur Windows**
- Les **VMs Linux (node1 + node2)** avec Nginx, les APIs, le worker, Pacemaker et le script magique `create-ressources.sh`

---

##  Prérequis

###  Côté Windows (machine hôte)
- Docker Desktop installé
- Git installé
- Les ports suivants doivent être libres : `5433` (Postgres master), `5434` (replica), `3000` (frontend)

###  Côté Linux (VMs node1 & node2)
- Ubuntu Server 20.04 ou +
- SSH activé (pour les transferts si besoin)
- `pacemaker`, `corosync`, `pcs` installés :  
  ```bash
  sudo apt install pacemaker corosync pcs -y
  ```
- Docker installé :  
  ```bash
  curl -fsSL https://get.docker.com | sh
  ```
- Projet cloné dans `/home/<user>/code-rating-system`

---

##  Étape 1 - Lancer la DB + frontend sur Windows

Depuis PowerShell à la racine du projet (`code-rating-system/infra`) :

```bash
docker compose up -d
```

Ce qui sera lancé :
- `postgres-master` (port `5433`)
- `postgres-replica` (port `5434`)
- `frontend` React (port `3000` → http://localhost:3000)

>  Vérifie que les tables sont bien créées grâce à `schema.sql` injecté au démarrage.

---

## 🔧 Étape 2 - Préparer les VMs (node1 et node2)

### A. Cloner le repo :

```bash
git clone https://github.com/zakaribel-dev/code-rating-system-bis.git
```

### B. Adapter les fichiers `.env` :

Exemple dans `infra/backend/.env` et `infra/worker/.env` :

```env
PORT=3000
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=code_rating
POSTGRES_HOST=192.168.56.1  # IP de ta machine Windows (trouve-la avec `ipconfig`)
POSTGRES_PORT=5433
```

### C. Builder les images Docker :

```bash
cd code-rating-system/infra
docker build -t code-api ./backend
docker build -t code-worker ./worker
docker build -t code-nginx ./nginx
```

---

##  Étape 3 - Lancer les ressources HA (depuis `node1`)

```bash
cd ~/code-rating-system/infra
sudo ./create-ressources.sh
```

Ce script :
- Supprime les anciennes ressources Pacemaker (API / worker / IP flottante)
- Crée les containers `api1`, `api2`, `worker1`, `nginx1`, et l'IP flottante `192.168.56.101`
- Monte les bons volumes (backend / worker / uploads)
- Attribue automatiquement une IP statique à `enp0s8` (`192.168.56.11` ou `56.12` selon la VM)
- Redémarre proprement le service SSH

---

##  Étape 4 - Tester

### Frontend :
- Accessible sur : http://localhost:3000

### Backend :
- Accessible via reverse proxy HTTPS sur : https://192.168.56.101:8443/test

### Exemple de test complet :
- Connexion avec un compte admin
- Création d’un exercice
- Envoi d’un fichier `.py` ou `.c`
- Note générée automatiquement par le worker 

---

##  Pti tips 

- Si les containers ne démarrent pas : vérifier les logs avec `sudo pcs status` ou `docker logs <container>`

- Tu veux tout restart au propre côté VM ? Voici un petit sort tout droit sorti d'harry potter :


```bash

cd ~/code-rating-system/infra
sudo ./create-ressources.sh

```
---

##  Fait avec amour par Jean & Zakaria
