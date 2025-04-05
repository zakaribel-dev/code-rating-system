#!/bin/bash

# Variables
NODE1_PATH="/home/zak/code-rating-system/infra/node1"
WORKER_PATH="/home/zak/code-rating-system/infra/worker"
UPLOADS_PATH="/home/zak/code-rating-system/infra/uploads"
ENV_NODE="$NODE1_PATH/.env"
ENV_WORKER="$WORKER_PATH/.env"

# Étape 1 : Suppression des anciennes ressources
echo "🧹 Suppression des anciennes ressources..."
for res in api1 api2 worker1 virtual-ip; do
  sudo pcs resource delete "$res" --force 2>/dev/null && echo "✔️ Supprimé : $res"
done

# Étape 2 : Vérifie les images Docker
echo "🔍 Vérification des images Docker..."
docker image inspect code-api >/dev/null 2>&1 || { echo "❌ Image 'code-api' introuvable."; exit 1; }
docker image inspect code-worker >/dev/null 2>&1 || { echo "❌ Image 'code-worker' introuvable."; exit 1; }
echo "✅ Images Docker OK"

# Étape 3 : Création du dossier uploads
mkdir -p "$UPLOADS_PATH"

# Étape 4 : Création des nouvelles ressources
echo "⚙️  Création des ressources Pacemaker..."

sudo pcs resource create api1 ocf:heartbeat:docker \
  image=code-api \
  run_opts="--rm -p 3000:3000 --env-file=$ENV_NODE -v $NODE1_PATH:/app -v $UPLOADS_PATH:/app/uploads" \
  op monitor interval=30s

sudo pcs resource create api2 ocf:heartbeat:docker \
  image=code-api \
  run_opts="--rm -p 3001:3000 --env-file=$ENV_NODE -v $NODE1_PATH:/app -v $UPLOADS_PATH:/app/uploads" \
  op monitor interval=30s

sudo pcs resource create worker1 ocf:heartbeat:docker \
  image=code-worker \
  run_opts="--rm --env-file=$ENV_WORKER -v $WORKER_PATH:/app -v $UPLOADS_PATH:/app/uploads" \
  op monitor interval=30s

sudo pcs resource create virtual-ip ocf:heartbeat:IPaddr2 \
  ip=192.168.56.101 cidr_netmask=24 op monitor interval=30s

# Étape 5 : Contraintes
sudo pcs constraint order start virtual-ip then start api1
sudo pcs constraint colocation add api1 with virtual-ip INFINITY

echo "✅ Tout est clean et relancé proprement !"
