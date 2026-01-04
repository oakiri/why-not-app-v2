#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   WHY NOT Hamburguesería - Script de Configuración  ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Inicialización de Git y subida a GitHub
echo -e "\n${YELLOW}[1/3] Configurando GitHub...${NC}"
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✔ Repositorio Git inicializado.${NC}"
fi

# Añadir todos los archivos
git add .
git commit -m "feat: implementación completa de funcionalidades v2.0 (cliente, backoffice, TPV)"

# Preguntar por el nombre del repo si no existe el remoto
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo -e "${YELLOW}Introduce la URL de tu repositorio de GitHub (ej: https://github.com/usuario/repo.git):${NC}"
    read REPO_URL
    git remote add origin $REPO_URL
    git branch -M main
    echo -e "${GREEN}✔ Remoto añadido.${NC}"
fi

echo -e "${BLUE}Subiendo código a GitHub...${NC}"
git push -u origin main
echo -e "${GREEN}✔ Código subido con éxito.${NC}"

# 2. Configuración de Firebase CLI
echo -e "\n${YELLOW}[2/3] Configurando Firebase...${NC}"
echo -e "Asegúrate de haber creado el proyecto en https://console.firebase.google.com/"

# Verificar si firebase-tools está instalado
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}Instalando Firebase Tools...${NC}"
    npm install -g firebase-tools
fi

# Login e inicialización
echo -e "${BLUE}Por favor, sigue las instrucciones para vincular tu proyecto de Firebase:${NC}"
firebase login
firebase use --add

# Desplegar reglas de seguridad
echo -e "${BLUE}Desplegando reglas de seguridad (Firestore y Storage)...${NC}"
firebase deploy --only firestore:rules,storage:rules
echo -e "${GREEN}✔ Reglas desplegadas.${NC}"

# 3. Preparación de entorno
echo -e "\n${YELLOW}[3/3] Preparando entorno local...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✔ Archivo .env creado. POR FAVOR, RELLENA TUS CREDENCIALES EN .env${NC}"
fi

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}   ¡CONFIGURACIÓN COMPLETADA CON ÉXITO!             ${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "${BLUE}Próximos pasos:${NC}"
echo -e "1. Rellena el archivo .env con tus claves de Firebase."
echo -e "2. Ejecuta 'npm install' para instalar dependencias."
echo -e "3. Ejecuta 'npx expo start' para probar la app."
echo -e "4. Consulta DEPLOYMENT_GUIDE.md para publicar en tiendas."
