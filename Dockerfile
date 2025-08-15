# 1. Dépendances
FROM node:20-alpine AS deps
WORKDIR /app

# Installez libc6-compat si nécessaire pour certaines dépendances natives
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile

# 2. Construction
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# 3. Exécution
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Crée un utilisateur et un groupe dédiés pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copie les fichiers de l'application depuis la phase de construction
COPY --from=builder /app/public ./public

# Copie les fichiers de sortie "standalone" optimisés
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Change l'utilisateur pour des raisons de sécurité
USER nextjs

EXPOSE 3000

ENV PORT 3000

# Lance le serveur Next.js
CMD ["node", "server.js"]
