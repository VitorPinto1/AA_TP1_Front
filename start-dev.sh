#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les erreurs
error() {
    echo -e "${RED}❌ $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${BLUE}$1${NC}"
}

success() {
    echo -e "${GREEN}$1${NC}"
}

# Vérifier les prérequis
info "🔍 Vérification des prérequis..."

# Chercher dotnet dans les emplacements communs sur macOS
DOTNET_CMD=""
if command -v dotnet &> /dev/null; then
    DOTNET_CMD="dotnet"
else
    # Chercher dans les emplacements communs sur macOS
    for path in "/usr/local/share/dotnet/dotnet" "/opt/homebrew/bin/dotnet" "$HOME/.dotnet/dotnet" "/usr/share/dotnet/dotnet"; do
        if [ -f "$path" ]; then
            DOTNET_CMD="$path"
            break
        fi
    done
    
    if [ -z "$DOTNET_CMD" ]; then
        error "dotnet n'est pas installé ou n'est pas dans le PATH"
        warning "Sur macOS, installez .NET SDK avec:"
        warning "  brew install --cask dotnet"
        warning "Ou téléchargez depuis: https://dotnet.microsoft.com/download"
        exit 1
    fi
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
    exit 1
fi

# Chemin du script (dossier frontend)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Dossier racine du TP (parent de front/)
TP_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"
# Backend Billetterie Spectacles (Billeterie spectacles avec espace)
BACKEND_PATH="$TP_ROOT/Billeterie spectacles/Billetterie-Spectacles/Billetterie-Spectacles/Billetterie-Spectacles.Presentation"
# Service de paiement
PAYMENT_PATH="$TP_ROOT/payment/Billetterie-PaymentService"

# Vérifier si node_modules existe
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    warning "Les dépendances npm ne sont pas installées"
    info "Installation des dépendances..."
    cd "$SCRIPT_DIR"
    npm install
    if [ $? -ne 0 ]; then
        error "Échec de l'installation des dépendances npm"
        exit 1
    fi
    success "✅ Dépendances installées"
fi

# Variables pour stocker les PIDs
MAILHOG_PID=""
PAYMENT_PID=""
BACKEND_PID=""
FRONTEND_PID=""

# Fonction pour nettoyer les processus à l'arrêt
cleanup() {
    echo ""
    warning "Arrêt des applications..."
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null
    [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null
    [ -n "$PAYMENT_PID" ] && kill $PAYMENT_PID 2>/dev/null
    [ -n "$MAILHOG_PID" ] && kill $MAILHOG_PID 2>/dev/null
    exit
}

# Capturer Ctrl+C pour nettoyer
trap cleanup SIGINT SIGTERM

info "🚀 Démarrage des applications..."

# 1. Démarrer MailHog (SMTP 1025, Web UI 8025)
if command -v MailHog &> /dev/null || command -v mailhog &> /dev/null; then
    success "📧 Démarrage de MailHog..."
    (MailHog 2>/dev/null || mailhog 2>/dev/null) &
    MAILHOG_PID=$!
    sleep 1
    info "   MailHog Web UI: http://localhost:8025 (emails de confirmation)"
else
    warning "MailHog non trouvé. Les emails seront envoyés vers localhost:1025."
    warning "Installation: brew install mailhog"
fi

# 2. Démarrer le service de paiement
success "💳 Démarrage du service de paiement .NET..."
if [ -d "$PAYMENT_PATH" ]; then
    cd "$PAYMENT_PATH"
    $DOTNET_CMD run --launch-profile https &
    PAYMENT_PID=$!
    cd "$SCRIPT_DIR"
    info "   Payment API: https://localhost:7049"
    sleep 3
else
    warning "Dossier payment non trouvé: $PAYMENT_PATH"
fi

# 3. Démarrer le backend Billetterie Spectacles
success "📦 Démarrage du backend Billetterie Spectacles..."
if [ ! -d "$BACKEND_PATH" ]; then
    error "Impossible de trouver le dossier backend"
    warning "Vérifiez le chemin: $BACKEND_PATH"
    exit 1
fi
cd "$BACKEND_PATH"
ASPNETCORE_ENVIRONMENT=Development $DOTNET_CMD run --urls "https://localhost:7035" &
BACKEND_PID=$!

# Attendre que le backend réponde (évite ECONNREFUSED sur le proxy)
info "⏳ Attente du démarrage du backend (https://localhost:7035)..."
BACKEND_URL="https://localhost:7035"
MAX_ATTEMPTS=15
for i in $(seq 1 $MAX_ATTEMPTS); do
    if curl -k -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" 2>/dev/null | grep -q "200\|301\|302"; then
        success "   Backend prêt."
        break
    fi
    if [ $i -eq $MAX_ATTEMPTS ]; then
        warning "Le backend ne répond pas après ${MAX_ATTEMPTS}s."
        warning "Vérifiez que SQL Server est démarré et les messages du backend ci-dessus."
        warning "Le frontend va démarrer quand même ; les appels /api renverront ECONNREFUSED tant que le backend n'est pas up."
    fi
    sleep 2
done

# 4. Démarrer le frontend
success "⚛️  Démarrage du frontend React..."
cd "$SCRIPT_DIR"
npm start &
FRONTEND_PID=$!

success "✅ Toutes les applications sont démarrées !"
info "Frontend:    http://localhost:3000"
info "Backend:     https://localhost:7035 (Swagger: https://localhost:7035)"
info "Payment:     https://localhost:7049"
info "MailHog:     http://localhost:8025 (voir les emails envoyés)"
warning "Appuyez sur Ctrl+C pour tout arrêter"

# Attendre que les processus se terminent
wait
