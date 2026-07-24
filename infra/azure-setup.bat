@echo off
REM ===========================================================================
REM  Aprovisionamiento de Azure - Bolsa de Trabajo UPA
REM  Epica 1 (Infraestructura). Responsable: Axel.
REM
REM  Este script se corre UNA SOLA VEZ, manualmente, desde cmd de Windows.
REM  NO se ejecuta en GitHub Actions.
REM
REM  Requisitos previos:
REM    1. Tener instalado Azure CLI (az --version debe funcionar)
REM    2. Haber hecho "az login" con la cuenta de Azure for Students
REM    3. EDITAR las variables de abajo (los nombres marcados deben ser
REM       unicos a nivel MUNDIAL en Azure, no solo en tu cuenta)
REM
REM  Uso:  infra\azure-setup.bat
REM ===========================================================================

REM --- EDITA ESTAS VARIABLES ANTES DE CORRER ---------------------------------
set SUFIJO=isc08c
set RESOURCE_GROUP=rg-bolsa-trabajo-upa
set RG_LOCATION=eastus2
set LOCATION=eastus
set APP_SERVICE_PLAN=plan-bolsa-trabajo-upa-eus
set BACKEND_APP_NAME=bolsa-trabajo-upa-api-%SUFIJO%
set STATIC_WEB_APP_NAME=bolsa-trabajo-upa-web-%SUFIJO%
set MYSQL_SERVER_NAME=mysql-bolsa-upa-isc08c-1
set STORAGE_ACCOUNT=stbolsaupaisc08c
set MYSQL_ADMIN_USER=upaadmin
set MYSQL_ADMIN_PASSWORD=*Ohlqsltc24*
set MYSQL_DB_NAME=bolsa_trabajo_upa
REM ---------------------------------------------------------------------------

echo.
echo ==========================================================
echo  1/7 Creando grupo de recursos: %RESOURCE_GROUP%
echo ==========================================================
call az group create --name %RESOURCE_GROUP% --location %RG_LOCATION%
if errorlevel 1 goto :error

echo.
echo ==========================================================
echo  2/7 Creando App Service Plan (Linux, capa Basic B1)
echo ==========================================================
call az appservice plan create --name %APP_SERVICE_PLAN% --resource-group %RESOURCE_GROUP% --location %LOCATION% --is-linux --sku B1
if errorlevel 1 goto :error

echo.
echo ==========================================================
echo  3/7 Creando App Service para el backend (Node 22)
echo ==========================================================
call az webapp create --name %BACKEND_APP_NAME% --resource-group %RESOURCE_GROUP% --plan %APP_SERVICE_PLAN% --runtime "NODE:22-lts"
if errorlevel 1 goto :error

echo.
echo ==========================================================
echo  4/7 MySQL ya fue creado manualmente (mysql-bolsa-upa-isc08c-1)
echo      Saltando este paso.
echo ==========================================================
REM Este servidor ya se creo a mano el 23/jul/2026 porque eastus2 no
REM soportaba MySQL para esta suscripcion. Si necesitas recrearlo desde
REM cero, descomenta las 2 lineas de abajo:
REM call az mysql flexible-server create --name %MYSQL_SERVER_NAME% --resource-group %RESOURCE_GROUP% --location %LOCATION% --admin-user %MYSQL_ADMIN_USER% --admin-password %MYSQL_ADMIN_PASSWORD% --sku-name Standard_B1ms --tier Burstable --version 8.0.21 --database-name %MYSQL_DB_NAME% --public-access 0.0.0.0 --yes
REM if errorlevel 1 goto :error

echo.
echo ==========================================================
echo  5/7 Creando cuenta de Storage para los CVs en PDF
echo ==========================================================
call az storage account create --name %STORAGE_ACCOUNT% --resource-group %RESOURCE_GROUP% --location %LOCATION% --sku Standard_LRS --kind StorageV2
if errorlevel 1 goto :error

echo.
echo Obteniendo cadena de conexion del Storage...
for /f "delims=" %%i in ('az storage account show-connection-string --name %STORAGE_ACCOUNT% --resource-group %RESOURCE_GROUP% --query connectionString -o tsv') do set STORAGE_CONN=%%i

echo.
echo ==========================================================
echo  6/7 Configurando variables de entorno del backend
echo ==========================================================
set DB_URL=mysql://%MYSQL_ADMIN_USER%:%MYSQL_ADMIN_PASSWORD%@%MYSQL_SERVER_NAME%.mysql.database.azure.com:3306/%MYSQL_DB_NAME%?ssl-mode=REQUIRED

call az webapp config appsettings set --name %BACKEND_APP_NAME% --resource-group %RESOURCE_GROUP% --settings NODE_ENV=production PORT=8080 JWT_SECRET=CambiaEsteSecretoEnProduccion2026 JWT_EXPIRES_IN=7d CORS_ORIGIN=https://%STATIC_WEB_APP_NAME%.azurestaticapps.net DATABASE_URL="%DB_URL%" AZURE_STORAGE_CONNECTION_STRING="%STORAGE_CONN%" AZURE_STORAGE_CONTAINER=cvs
if errorlevel 1 goto :error

echo.
echo ==========================================================
echo  7/7 Creando Static Web App para el frontend
echo ==========================================================
call az staticwebapp create --name %STATIC_WEB_APP_NAME% --resource-group %RESOURCE_GROUP% --location %LOCATION% --sku Free
if errorlevel 1 goto :error

echo.
echo ===========================================================================
echo  LISTO. Recursos creados correctamente.
echo ===========================================================================
echo.
echo  GUARDA ESTA CADENA DE CONEXION (la necesitas para las migraciones):
echo.
echo  %DB_URL%
echo.
echo  PASOS MANUALES QUE FALTAN (ver la guia en Word):
echo    1. Portal de Azure ^> App Service ^> Deployment Center ^>
echo       "Manage publish profile" ^> Download.
echo       Guardar su contenido en GitHub como el secret
echo       AZURE_WEBAPP_PUBLISH_PROFILE
echo.
echo    2. Portal de Azure ^> Static Web App ^> Overview ^>
echo       "Manage deployment token" ^> copiar.
echo       Guardar en GitHub como el secret
echo       AZURE_STATIC_WEB_APPS_API_TOKEN
echo.
echo    3. Correr las migraciones apuntando a la base de datos de Azure
echo       (ver capitulo 4 de la guia).
echo.
goto :fin

:error
echo.
echo ***************************************************************************
echo  ERROR: fallo el comando anterior.
echo  Causas comunes:
echo    - El nombre ya esta ocupado por otra persona en Azure (cambia SUFIJO)
echo    - No hiciste "az login"
echo    - Tu suscripcion no permite esa region (westus2 SI funciona para ti;
echo ***************************************************************************

:fin
pause