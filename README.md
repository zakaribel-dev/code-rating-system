# Code Rating Platform

Plateforme de soumission d'exercices de programmation avec correction automatique, notation, et interface séparée pour étudiants et administrateurs.

---

## Fonctionnalités principales

- Authentification par email
- Interface étudiant : sélection du cours, exercice, langage + soumission de fichier
- Worker automatique : exécution du code, comparaison du résultat, attribution du score
- Barème de correction : 100%, 80%, 50%, 0%
- Interface admin : création d’exercices + visualisation des soumissions
- Suivi des soumissions (état, note, date)

---

## Technologies utilisées

- **Frontend** : React + TailwindCSS
- **Backend** : Node.js + Express
- **Base de données** : PostgreSQL
- **Correction** : Exécution contrôlée avec `timeout`, `gcc`, `python3`, dans un environnement temporaire simulant une sandbox légère (copie dans un dossier temporaire + suppression automatique)
- **Infrastructure** : Docker + docker-compose + Nginx

---

## Structure du projet 

```
.
├── frontend/                  → Application React (étudiant + admin)
├── infra/                    → Infrastructure Dockerisée
│   ├── nginx/                → Proxy HTTPS + SSL
│   ├── node1/                → API principale Express (soumission, auth, admin, etc.)
│   ├── node2/                → Autre service Node (scalable, split logique)
│   ├── postgres-master/      → Conteneur PostgreSQL
│   ├── worker/               → Worker qui corrige les soumissions
│   ├── docker-compose.yml    → Orchestration multi-container
│   └── README(https)         → Infos config HTTPS/SSL
│   └── .gitignore
```

---

## Lancement du projet

```bash
git clone https://github.com/zakaribel-dev/code-rating-system
```


frontend/.env  

```
REACT_APP_API_URL=https://localhost:8443  
```

infra/node1/.env  

```PORT=3000 
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=code_rating
POSTGRES_HOST=postgres-master
POSTGRES_PORT=5432
```  

>pareil pour node2

## Puis  

```bash
cd infra 
docker-compose up --build
```

> Accès web via : `http://localhost:3000`  
>  Le front tourne en local avec `npm start`, donc en HTTP.  
>  Le HTTPS est utilisé uniquement côté backend via Nginx (`https://localhost:8443`), comme demandé dans le cahier des charges.
Pour mettre en place un https côté front il aurait fallu générer un certificat ssl non auto signé mais par un autre autorité du style Lets encrypt et il faut bien sûr un hébergeur. Inutile donc ici.

---


## HTTPS local (avec Nginx)

Le reverse proxy **Nginx** sert l’application en HTTPS sur [`https://localhost:8443`](https://localhost:8443), grâce à un certificat SSL **auto-signé**.

Vous pouvez tester cet endpoint : https://localhost:8443/test

### Fichiers SSL

Les certificats sont placés dans le dossier :  
- `infra/nginx/certs/server.crt`  
- `infra/nginx/certs/server.key`

### Générer les certificats auto-signés

```bash
openssl genrsa -out server.key 2048

openssl req -new -x509 -key server.key -out server.crt -days 365 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost"
```

### Ajouter le certificat comme autorité de confiance

#### macOS
```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain server.crt
```

#### Windows (PowerShell en mode admin)
```bash
certutil -addstore "Root" server.crt
```

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

---

## Barème de correction (dans le worker)

| Cas | Score |
|-----|-------|
| Sortie exacte (`===`) | 100% |
| Sortie avec même contenu mais mauvaise casse | 80% |
| Sortie correcte mais sans `\n` | 50% |
| Mauvaise sortie | 0% |

---


## Comment fonctionne input() et scanf() ?
Lorsque l’admin crée un exercice avec un champ Input, cette valeur est automatiquement injectée dans le programme de l’étudiant au moment de son exécution.

Par exemple, si l’input est 3 4, alors l'exécution se fait ainsi :

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
    scanf("%d %d", &a, &b); # lit les deux entiers injectés
    printf("%d\n", a + b);
    return 0;
}
```

En fait ça permet de simuler un vrai comportement interactif sans hardcoder les valeurs..

---

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


## Tester le système

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
    printf("%d\n", a + b);
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

