FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN npm install -g npm@10
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application (if you have a build step)
# RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 chatapp

# Copy necessary files
COPY --from=deps --chown=chatapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=chatapp:nodejs /app/dist ./dist
COPY --from=builder --chown=chatapp:nodejs /app/prisma ./prisma
COPY --from=builder --chown=chatapp:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir logs && chown chatapp:nodejs logs

USER chatapp

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/server.js"]