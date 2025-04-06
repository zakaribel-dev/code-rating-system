
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


---

## 🔧 Étape 2 - Préparer les VMs (node1 et node2)

### A. Cloner le repo :

```bash
git clone https://github.com/zakaribel-dev/code-rating-system.git
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
- Accessible via reverse proxy HTTPS sur : https://192.168.56.101:8443  

Vous pouvez test cet endpoint  : https://192.168.56.101:8443/test 

---
## Base de données

### Tables principales (se référer à `postgres-master/schema.sql`) :

- `users(email, role)`
- `sessions(user_id, token)`
- `exercises(title, course, language, expected_output, ...)`
- `submissions(user_id, exercise, filename, score, status)`

### Utilisateurs admin par défaut

```sql
INSERT INTO users (email, role)
VALUES 
  ('zak@hotmail.fr', 'admin'),
  ('jean@hotmail.fr', 'admin');
```


## Barème de correction (dans le worker)

| Cas | Score |
|-----|-------|
| Sortie exacte (`===`) | 100% |
| Sortie avec même contenu mais mauvaise casse | 80% |
| Sortie correcte mais sans `
` | 50% |
| Mauvaise sortie | 0% |

---


## Comment fonctionne input() et scanf() ?
Lorsque l’admin crée un exercice avec un champ Input, cette valeur est automatiquement injectée dans le programme de l’étudiant au moment de son exécution.

Par exemple, si l'input est 3 4, alors l'exécution se fait ainsi :

```bash
echo "3 4" | python3 student_file.py
```

## Dans ce cas, le code de l’étudiant doit utiliser input() :

```bash
a, b = map(int, input().split())  # split() sépare l'entrée "3 4" en ['3', '4'] puis map convertit en int..
print(a + b)
```

## Pour un fichier C 
```bash
echo "3 4" | ./a.out
```

## Dans ce cas, le code de l’étudiant doit utiliser scanf() :

```bash
#include <stdio.h>
int main() {
    int a, b;
    scanf("%d %d", &a, &b); # lit les deux int injectés
    printf("%d
", a + b);
    return 0;
}
```

En fait ça permet de simuler un vrai comportement interactif sans hardcoder les valeurs..

---


## Tester le système
 
## Ajouter un exercice (admin)

Accessible via `/ExerciseBuilder` et en étant rôle admin  
Champs :
- **Titre**
- **Cours**
- **Langage** (Python / C)
- **Description**
- **Input (optionnel)** : standard input simulé
- **Résultat attendu (Expected Output)**

---


### Exemple 1 : Hello World

**Admin**
```bash
Titre       : Hello World
Cours       : Cours Python
Langage     : Python
Description : Affichez "Hello World"
Input       : (laisser vide car pas besoin de faire lire avec stdin ou scanf..) 
Expected    : Hello World
```

**Soumission (100%)**
```python
print("Hello World")
```

**Soumission (80%)**
```python
print("hello world")
```

---

### Exemple 2 : Addition en C

**Admin**
```bash
Titre       : Addition simple
Cours       : Cours C
Langage     : C
Description : Additionnez deux entiers a et b depuis l'entrée standard.
Input       : 3 4
Expected    : 7
```

**Soumission C (100%)**
```c
#include <stdio.h>
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d
", a + b);
    return 0;
}
```

**Soumission C (50%)**
```c
#include <stdio.h>
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", a + b); // manque le \n

    return 0;
}
```

---

### Exemple 3 : Multiplication Python

**Admin**
```bash
Titre       : Multiplication
Cours       : Cours Python
Langage     : Python
Description : Multipliez deux entiers
Input       : 5 4
Expected    : 20
```

**Soumission Python**
```python
a, b = map(int, input().split())
print(a * b)
```

---

##  Parcours étudiant

1. Connexion avec un email
2. Sélection du langage, cours, exercice
3. Soumission d'un fichier `.py` ou `.c`
4. Attente de correction automatique
5. Visualisation du statut et du score dans `/my-submissions`


---


## Respect du cahier des charges

-  HTTPS ready (via Nginx + SSL)
-  Auth par email
-  File d'attente + correction auto par worker
-  Résultats affichés à l’étudiant
-  Interface admin dédiée  
-  Haute disponibilité avec :
  - 2 serveurs web load balancés (Node1 / Node2 via Nginx)
  - 1 base de données PostgreSQL master + 1 réplica


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
