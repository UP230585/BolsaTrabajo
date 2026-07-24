#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Aprovisionamiento de recursos de Azure — Bolsa de Trabajo UPA
# Épica 1 (Infraestructura), feature/azure-deployment. Responsable: Axel.
#
# Este script NO se ejecuta en GitHub Actions: se corre UNA VEZ, de forma
# manual, desde tu computadora (o la de quien tenga la cuenta de Azure for
# Students), para crear los recursos antes de que el pipeline pueda desplegar
# algo en ellos.
#
# Requisitos previos:
#   1. Tener instalado Azure CLI (az) y haber hecho "az login".
#   2. Ajustar las variables de abajo (nombres, región, etc.) si hace falta.
#
# Uso:
#   chmod +x infra/azure-setup.sh
#   ./infra/azure-setup.sh
# ---------------------------------------------------------------------------
set -euo pipefail

RESOURCE_GROUP="rg-bolsa-trabajo-upa"
LOCATION="mexicocentral"          # si no está disponible en tu suscripción, usa "eastus2" o "southcentralus"
APP_SERVICE_PLAN="plan-bolsa-trabajo-upa"
BACKEND_APP_NAME="bolsa-trabajo-upa-api"     # debe ser único a nivel global en Azure
STATIC_WEB_APP_NAME="bolsa-trabajo-upa-web"
MYSQL_SERVER_NAME="mysql-bolsa-trabajo-upa"  # debe ser único a nivel global en Azure
MYSQL_ADMIN_USER="upaadmin"
MYSQL_ADMIN_PASSWORD="CAMBIA-ESTA-CONTRASENA-2026!"
MYSQL_DB_NAME="bolsa_trabajo_upa"

echo "==> Creando grupo de recursos: $RESOURCE_GROUP"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

echo "==> Creando App Service Plan (Linux, capa gratuita/F1 para desarrollo)"
az appservice plan create \
  --name "$APP_SERVICE_PLAN" \
  --resource-group "$RESOURCE_GROUP" \
  --is-linux \
  --sku F1

echo "==> Creando Azure App Service para el backend (Node 20)"
az webapp create \
  --name "$BACKEND_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$APP_SERVICE_PLAN" \
  --runtime "NODE:20-lts"

echo "==> Configurando variables de entorno del backend en Azure"
az webapp config appsettings set \
  --name "$BACKEND_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    JWT_SECRET="CAMBIA-ESTE-SECRETO-EN-PRODUCCION" \
    JWT_EXPIRES_IN="7d" \
    CORS_ORIGIN="https://${STATIC_WEB_APP_NAME}.azurestaticapps.net"

echo "==> Creando Azure Database for MySQL - Flexible Server"
az mysql flexible-server create \
  --name "$MYSQL_SERVER_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --admin-user "$MYSQL_ADMIN_USER" \
  --admin-password "$MYSQL_ADMIN_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 8.0 \
  --database-name "$MYSQL_DB_NAME"

echo "==> Permitiendo que servicios de Azure (App Service) se conecten a MySQL"
az mysql flexible-server firewall-rule create \
  --name "AllowAzureServices" \
  --resource-group "$RESOURCE_GROUP" \
  --server-name "$MYSQL_SERVER_NAME" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

DATABASE_URL="mysql://${MYSQL_ADMIN_USER}:${MYSQL_ADMIN_PASSWORD}@${MYSQL_SERVER_NAME}.mysql.database.azure.com:3306/${MYSQL_DB_NAME}?ssl-mode=REQUIRED"

echo "==> Guardando DATABASE_URL en las variables de entorno del backend"
az webapp config appsettings set \
  --name "$BACKEND_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings DATABASE_URL="$DATABASE_URL"

echo "==> Creando Azure Static Web App para el frontend"
echo "    (esta parte normalmente se hace desde el portal, ligada a tu repo de"
echo "     GitHub, porque el asistente te pide autorizar el repositorio; si"
echo "     prefieres CLI, usa 'az staticwebapp create' con --source apuntando a tu repo)"
az staticwebapp create \
  --name "$STATIC_WEB_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Free

echo ""
echo "======================================================================="
echo " Aprovisionamiento completado. Pasos manuales que faltan:"
echo " 1. En el portal de Azure, App Service > Deployment Center: descarga el"
echo "    'Publish Profile' y guárdalo en GitHub como el secret"
echo "    AZURE_WEBAPP_PUBLISH_PROFILE (Settings > Secrets and variables > Actions)."
echo " 2. En Static Web Apps > Overview: copia el 'Deployment token' y guárdalo"
echo "    como el secret AZURE_STATIC_WEB_APPS_API_TOKEN."
echo " 3. Corre 'npm run prisma:deploy' apuntando a este DATABASE_URL para crear"
echo "    las tablas, y luego 'npm run seed' para los datos de prueba."
echo " 4. Cadena de conexión generada (guárdala, no la subas a GitHub):"
echo "    $DATABASE_URL"
echo "======================================================================="
