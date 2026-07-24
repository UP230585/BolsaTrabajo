# --- Etapa 1: build ---
# Compila el sitio estático de Next.js (output: "export" en next.config.ts).
FROM node:22-alpine AS build
WORKDIR /app

# La URL del backend se "hornea" dentro del código en tiempo de build,
# porque las variables NEXT_PUBLIC_* de Next.js no se leen en tiempo de
# ejecución. Se pasa como --build-arg al construir la imagen.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Etapa 2: servir con nginx ---
FROM nginx:alpine AS production
COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
