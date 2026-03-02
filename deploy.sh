#!/bin/bash

# ==============================================================================
# DISPARADOR AI - AntiGravity Automation
# Script de Deploy e Configuração Automática para VPS Ubuntu 20.04/22.04 LTS
# ==============================================================================

# Cores para logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=================================================================${NC}"
echo -e "${GREEN}🚀 INICIANDO SETUP AUTOMÁTICO DO DISPARADOR AI NO UBUNTU... 🚀${NC}"
echo -e "${GREEN}=================================================================${NC}"

# Verifica se é root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Erro: Este script precisa ser executado como root (sudo).${NC}"
  echo -e "Tente: sudo bash deploy.sh"
  exit 1
fi

echo -e "\n${YELLOW}[1/6] Atualizando pacotes do sistema...${NC}"
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git build-essential ufw screen

echo -e "\n${YELLOW}[2/6] Instalando Node.js (LTS - v20)...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
echo -e "Node version: $(node -v)"
echo -e "NPM version: $(npm -v)"

echo -e "\n${YELLOW}[3/6] Instalando PM2 (Process Manager)...${NC}"
npm install -g pm2
pm2 startup systemd -u root --hp /root

echo -e "\n${YELLOW}[4/6] Instalando Nginx e Certbot (Para SSL/HTTPS Dinâmico via nip.io)...${NC}"
apt-get install -y nginx certbot python3-certbot-nginx

# Permite as portas no Firewall
ufw allow 'Nginx Full'
ufw allow 22/tcp
ufw allow 3001/tcp
yes | ufw enable

echo -e "\n${YELLOW}[5/6] Instalando dependências críticas do Google Chrome/Puppeteer...${NC}"
# Essas dependências são OBRIGATÓRIAS para o Headless Chrome rodar em servidores Linux (VPS) sem interface gráfica
apt-get install -y \
  fonts-liberation \
  gconf-service \
  libappindicator1 \
  libasound2 \
  libatk1.0-0 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  xdg-utils \
  xvfb

echo -e "\n${YELLOW}[6/6] Build do Projeto Backend no diretório atual...${NC}"

# Detecta a pasta do backend e roda o build
if [ -d "./backend" ]; then
    cd ./backend
    echo -e "Instalando dependências do backend via npm..."
    npm install
    
    echo -e "Instalando o npx puppeteer browsers localmente..."
    npx puppeteer browsers install chrome
    
    # Se não tiver .env configurado avisa o usuário
    if [ ! -f ".env" ]; then
        echo -e "${RED}⚠️ ATENÇÃO: Arquivo .env não encontrado. Copiando .env.example para .env${NC}"
        cp ../.env.example .env
        echo -e "${YELLOW}>> LEMBRE-SE DE EDITAR O .env COM SUAS CHAVES (GEMINI_API_KEY, STITCH, EVOLUTION) DPS!${NC}"
    fi

    # Inicia e salva o processo no PM2
    echo -e "${GREEN}Iniciando Motor do Disparador via PM2...${NC}"
    pm2 start src/server.ts --name "disparador-backend" --interpreter ./node_modules/.bin/ts-node
    pm2 save
else
    echo -e "${RED}Pasta /backend não encontrada! Tem certeza que está rodando este script da raiz do projeto?${NC}"
    exit 1
fi

echo -e "\n${GREEN}=================================================================${NC}"
echo -e "${GREEN}✅ SETUP CONCLUÍDO COM SUCESSO! ✅${NC}"
echo -e "${GREEN}=================================================================${NC}"
echo -e " "
echo -e "Opcionalmente: Para usar Vercel sem bloqueios de Localhost CORS, configure o NGINX usando o IP da máquina:"
echo -e "Descubra o IP desta VPS digitando: \033[1;36mcurl ifconfig.me\033[0m"
echo -e "Exemplo rápido de SSL Dinâmico sem precisar de registrar domínio (substituir IP_AQUI):"
echo -e "\033[1;36msudo certbot --nginx -d IP_AQUI.nip.io -m suporte@exemplo.com --agree-tos\033[0m\n"
echo -e "O backend Node.js está rodando (via porta 3001 e com firewall aberto nela indiretamente se for usar Nginx proxy)."
echo -e "Para ver os logs das automações e erros: \033[1;36mpm2 logs disparador-backend\033[0m"
echo -e "Para reiniciar a automação a qualquer momento: \033[1;36mpm2 restart disparador-backend\033[0m"
