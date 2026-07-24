# --- Etapa 1: build ---
# Compila TypeScript y genera el cliente de Prisma en un contenedor separado
# del que finalmente corre en producción, para que la imagen final no cargue
# con herramientas de desarrollo (tsc, @types/*, etc.).
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

# --- Etapa 2: producción ---
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Prisma necesita su cliente generado también en node_modules de esta etapa.
COPY prisma ./prisma
RUN npx prisma generate

COPY --from=build /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]
