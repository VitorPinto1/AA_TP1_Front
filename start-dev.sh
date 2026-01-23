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
# Chemin relatif vers le backend depuis le frontend
BACKEND_PATH="../../Billetterie-Spectacles/Billetterie-Spectacles/Billetterie-Spectacles.Presentation"

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
BACKEND_PID=""
FRONTEND_PID=""

# Fonction pour nettoyer les processus à l'arrêt
cleanup() {
    echo ""
    warning "Arrêt des applications..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit
}

# Capturer Ctrl+C pour nettoyer
trap cleanup SIGINT SIGTERM

info "🚀 Démarrage des applications..."

# Démarrer le backend
success "📦 Démarrage du backend .NET..."
cd "$BACKEND_PATH"
if [ $? -ne 0 ]; then
    error "Impossible de trouver le dossier backend"
    warning "Vérifiez le chemin: $BACKEND_PATH"
    exit 1
fi

$DOTNET_CMD run --launch-profile https &
BACKEND_PID=$!

# Attendre un peu que le backend démarre
info "⏳ Attente du démarrage du backend..."
sleep 5

# Démarrer le frontend
success "⚛️  Démarrage du frontend React..."
cd "$SCRIPT_DIR"
npm start &
FRONTEND_PID=$!

success "✅ Applications démarrées !"
info "Backend: https://localhost:7035"
info "Frontend: http://localhost:3000"
info "Swagger: https://localhost:7035"
warning "Appuyez sur Ctrl+C pour arrêter"

# Attendre que les processus se terminent
wait
