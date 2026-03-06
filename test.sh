#!/usr/bin/env bash
set -e

# Dossier du front
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Dossier racine du TP (parent de front/)
TP_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

BACKEND_PATH="$TP_ROOT/Billeterie spectacles/Billetterie-Spectacles/Billetterie-Spectacles/Billetterie-Spectacles.Presentation"
PAYMENT_PATH="$TP_ROOT/payment/Billetterie-PaymentService"

cleanup() {
    echo ""
    echo "==> Arrêt des processus..."
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null
    [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null
    [ -n "$PAYMENT_PID" ] && kill $PAYMENT_PID 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

echo "==> Démarrage du service de paiement (.NET, profil https)..."
cd "$PAYMENT_PATH"
dotnet run --launch-profile https &
PAYMENT_PID=$!

echo "==> Démarrage du backend en mode Testing (SQLite pour Selenium)..."
cd "$BACKEND_PATH"
dotnet run --launch-profile "Testing (Selenium)" --urls "https://localhost:7035" &
BACKEND_PID=$!

echo "==> Démarrage du frontend React..."
cd "$SCRIPT_DIR"
npm start &
FRONTEND_PID=$!

echo ""
echo "=== Environnement de test lancé ==="
echo "- Frontend:                   http://localhost:3000"
echo "- Backend (Testing + SQLite): https://localhost:7035"
echo "- Payment service:            https://localhost:7049"
echo ""
echo "Lance ensuite les tests Selenium dans un autre terminal :"
echo "  cd \"$SCRIPT_DIR/selenium\""
echo "  source .venv/bin/activate   # si déjà créé"
echo "  python -m pytest"
echo ""
echo "Appuie sur Ctrl+C dans ce terminal pour tout arrêter."
wait