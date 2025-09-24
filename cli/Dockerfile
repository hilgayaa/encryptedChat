# ------------------------
# Base image
# ------------------------
FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=development

# ------------------------
# Install dependencies
# ------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm install  

# ------------------------
# Development runner
# ------------------------
FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
