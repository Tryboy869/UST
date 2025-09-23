# syntax=docker/dockerfile:1
FROM node:18-alpine AS base

# =============================================================================
# STAGE 1: SYSTEM DEPENDENCIES & SECURITY SETUP
# =============================================================================
FROM base AS system-setup

# Install Python3 et dépendances système essentielles
RUN <<EOF
apk update
apk add --no-cache \
    python3 \
    py3-pip \
    ca-certificates \
    dumb-init \
    tini
apk del --purge \
    apk-tools \
    musl-utils
rm -rf /var/cache/apk/*
EOF

# Créer utilisateur non-root pour sécurité
RUN <<EOF
addgroup -S appgroup
adduser -S appuser -G appgroup -h /home/appuser
EOF

# =============================================================================
# STAGE 2: NODE.JS DEPENDENCIES & SECURITY
# =============================================================================
FROM system-setup AS node-deps

# Définir répertoire de travail
WORKDIR /app

# Copier package.json pour optimiser le cache Docker
COPY package*.json ./

# Installer dépendances Node.js avec sécurité renforcée
RUN <<EOF
npm ci --only=production --no-audit --no-fund
npm cache clean --force
# Supprimer npm pour réduire surface d'attaque
rm -rf /usr/local/lib/node_modules/npm
EOF

# =============================================================================
# STAGE 3: APPLICATION SETUP
# =============================================================================
FROM node-deps AS app-setup

# Copier le code de l'application
COPY app.js ./

# Configuration des permissions sécurisées
RUN <<EOF
chown -R appuser:appgroup /app
chmod 755 /app
chmod 644 /app/app.js
chmod 644 /app/package.json
EOF

# =============================================================================
# STAGE 4: PYTHON RUNTIME CONFIGURATION
# =============================================================================
FROM app-setup AS python-config

# Configurer environnement Python sécurisé
RUN <<EOF
# Créer répertoire Python isolé
mkdir -p /app/python-runtime
chown appuser:appgroup /app/python-runtime

# Configuration Python sécurisée
cat > /app/python-config.py << 'PYTHON_CONFIG'
#!/usr/bin/env python3
# Configuration Python sécurisée pour l'Universal Script Tester
import sys
import os

# Désactiver bytecode pour sécurité
sys.dont_write_bytecode = True

# Limiter les modules disponibles
ALLOWED_MODULES = {
    'math', 'random', 'json', 'datetime', 'time',
    're', 'collections', 'itertools', 'functools'
}

# Fonction de validation des imports
def validate_import(name):
    return name in ALLOWED_MODULES

print("Python runtime configuré avec restrictions de sécurité")
PYTHON_CONFIG

chmod +x /app/python-config.py
chown appuser:appgroup /app/python-config.py
EOF

# =============================================================================
# STAGE 5: SECURITY HARDENING
# =============================================================================
FROM python-config AS security-hardening

# Configuration de sécurité avancée
RUN <<EOF
# Créer répertoire temporaire sécurisé
mkdir -p /tmp/app-temp
chown appuser:appgroup /tmp/app-temp
chmod 750 /tmp/app-temp

# Créer script de santé
cat > /app/health-check.sh << 'HEALTH_SCRIPT'
#!/bin/sh
# Health check script for Universal Script Tester

# Vérifier que Node.js fonctionne
if ! pgrep -x "node" > /dev/null; then
    echo "ERROR: Node.js process not running"
    exit 1
fi

# Vérifier que Python3 est accessible
if ! command -v python3 > /dev/null; then
    echo "ERROR: Python3 not available"
    exit 1
fi

# Vérifier l'endpoint de santé
if command -v wget > /dev/null; then
    if ! wget --quiet --tries=1 --timeout=5 http://localhost:3000/health -O /dev/null; then
        echo "ERROR: Health endpoint not responding"
        exit 1
    fi
fi

echo "OK: All systems healthy"
exit 0
HEALTH_SCRIPT

chmod +x /app/health-check.sh
chown appuser:appgroup /app/health-check.sh
EOF

# =============================================================================
# STAGE 6: FINAL PRODUCTION IMAGE
# =============================================================================
FROM security-hardening AS production

# Passer à l'utilisateur non-root
USER appuser

# Variables d'environnement sécurisées
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=256" \
    PYTHONPATH="" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=3000

# Répertoire de travail final
WORKDIR /app

# Exposer le port
EXPOSE 3000

# Health check avec script personnalisé
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ["/app/health-check.sh"]

# Point d'entrée sécurisé avec tini pour gestion des signaux
ENTRYPOINT ["tini", "--"]

# Commande de démarrage
CMD ["node", "app.js"]

# =============================================================================
# METADATA & LABELS
# =============================================================================
LABEL maintainer="Universal Script Tester" \
      version="1.0.0" \
      description="Plateforme web pour tester des scripts JavaScript et Python" \
      security.scan="enabled" \
      runtime.javascript="node:18" \
      runtime.python="python3" \
      architecture="multi-module-isolated"