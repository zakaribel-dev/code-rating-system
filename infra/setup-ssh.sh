#!/bin/bash

# script pour faire en sorte que les ip soient reachable par ma machine locale via ssh.. (Je préfère powershell) 
# PS : à faire sur les deux VM !

NODE1_IP="192.168.56.11"
NODE2_IP="192.168.56.12"
INTERFACE="enp0s8"

echo "Nettoyage IPs sur $INTERFACE..."
sudo ip addr flush dev $INTERFACE

NODE_NAME=$(hostname)

if [[ "$NODE_NAME" == "node1" ]]; then
    echo "[+] Attribution IP pour node1..."
    sudo ip addr add ${NODE1_IP}/24 dev $INTERFACE
elif [[ "$NODE_NAME" == "node2" ]]; then
    echo "[+] Attribution IP pour node2..."
    sudo ip addr add ${NODE2_IP}/24 dev $INTERFACE
else
    echo "Nom de noeud inconnu : $NODE_NAME"
    exit 1
fi

echo "[+] Vérification de l'état de l'interface..."
sudo ip link set $INTERFACE up

echo "[+] Redémarrage SSH..."
sudo systemctl restart ssh

echo "IP configurée et SSH redémarré sur $NODE_NAME"