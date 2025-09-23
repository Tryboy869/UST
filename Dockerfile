# syntax=docker/dockerfile:1
FROM node:18-alpine

# Install Python3 et dépendances système
RUN apk add --no-cache \
    python3 \
    ca-certificates \
    tini

# Créer utilisateur non-root
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

# Définir répertoire de travail
WORKDIR /app

# Copier package.json et installer dépendances
COPY package*.json ./
RUN npm ci --only=production --no-audit

# Copier le code de l'application
COPY app.js ./

# Configuration des permissions
RUN chown -R appuser:appgroup /app

# Créer script de health check
RUN cat > /app/health-check.sh << 'EOF' && \
    chmod +x /app/health-check.sh && \
    chown appuser:appgroup /app/health-check.sh
#!/bin/sh
curl -f http://localhost:3000/health || exit 1
EOF

# Passer à l'utilisateur non-root
USER appuser

# Variables d'environnement
ENV NODE_ENV=production \
    PORT=3000 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Exposer le port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ["/app/health-check.sh"]

# Commande de démarrage
ENTRYPOINT ["tini", "--"]
CMD ["node", "app.js"]