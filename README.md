# Disparador Inteligente de WhatsApp com IA & Google Stitch MCP

![Stitch AI Automations](https://img.shields.io/badge/Stitch%20Agent-Automation-blue) ![Puppeteer](https://img.shields.io/badge/Browser-Puppeteer-green) ![Evolution API](https://img.shields.io/badge/Whatsapp-Evolution%20API-darkgreen)

Versão `v1.0.0` focada em Automação B2B (Business-to-Business) autônoma.
Este repositório contém o Motor Geral (Backend) e a Interface Apple/Clean Desktop (Frontend) do sistema anti-banimento do AntiGravity Disparador.

## Arquitetura Resumida
1. **Frontend (Vercel)**: Aplicação React Vite. Serve como "Painel de Comando" gerencial de onde partem os arrays de listas de prospectos e o texto "Base". Não faz processamento pesado. Pode ser espelhado através da nuvem tranquilamente.
2. **Backend (VPS Ubuntu)**: Cérebro do projeto (Node/Express). Recebe o array, roteia via AI Gemini gerando copies persuasivas e distintas a cada passo, comanda um browser interno via Google Maps e Stitch MCP localmente consumindo URLs virtuais de portfólio. Ao final empacota o tiro e passa a ordem pra Evolution API disparar o WHATSAPP via webhook ou endpoint local da instância Evolution.

---

## Como rodar e hospedar de forma PROFISSIONAL (Na sua própria VPS Ubuntu 20+)

O Frontend pode e **deve** ficar hospedado gratuitamente e rápido pela conta da [Vercel](https://vercel.com).
Mas o **Backend exige processamento dedicado** devido ao motor Chromium que o `Puppeteer` levanta a cada requisição de site. Siga os passos:

### 1. Preparando o Ubuntu (Deploy Automático de 1-Click)
Adquira uma VPS barata (DigitalOcean, Hetzner, AWS) com o **Ubuntu 20.04 ou superior** limpo.
Acesse ela via SSH `ssh root@SEU_IP` e cole o comando abaixo:

```bash
# Baixa e Roda o Instalador AntiGravity Puppeteer & PM2
curl -sL https://raw.githubusercontent.com/SEU-GITHUB/disparador-ai/master/deploy.sh | sudo bash
```
*(Certifique-se de que o script `deploy.sh` está na sua master remota. Se não, apenas rasteje/sftp/clona o repo pra dentro do servidor e dê permissão de execução `chmod +x deploy.sh` e o execute `./deploy.sh`)*.

### 2. O que aquele "Install Magic" fez pela minha VPS?
- Resolveu a maior dor de cabeça de servidores Linux: **Dependências do Chrome Headless**. Instalou as misteriosas bibliotecas libnss3, libatk, libgbm e NSPR.
- Instalou o NodeJS 20 e o NPM nativo.
- Instalou o Nginx e Certbot para garantir Criptografia Segura (Necessária para a Vercel não chiar).
- Criou o Serviço persistente 24H no `PM2`.

### 3. Configurando Domínio Dinâmico (Evitando Bloqueios CORS da VERCEL)
Depois que a VPS reiniciar, o Backend vai estar rodando na porta fechada HTTP/3001. A Vercel (que impõe HTTPS nos seus clientes) vai negar essa conexão se não habilitarmos SSl (HTTPS) e um domínio.

Use o `nip.io` que é mágico se você não quiser comprar e apontar Dns do registro.br usando seu próprio IP:
```bash
sudo certbot --nginx -d 172.93.xxx.xx.nip.io -m eu@gmail.com --agree-tos --no-eff-email
```
> *(Substitua "172.93..."" pelo seu IP de verdade!)*

O Certbot vai gerar o NGINX e associar. O `nip.io` converte automaticamente o DNS pro seu IP.

1. Teste se está vivo através do navegador pelo celular: `https://172.93.xxx.xx.nip.io/api/health`
2. No painel de `Settings > Environment Variables` da sua Vercel do **Frontend**, crie/modifique:
   - Chave: `VITE_API_URL`
   - Valor: `https://172.93.xxx.xx.nip.io/api`
3. Vá no "Deployments" da Vercel e clique em **Redeploy**.

### 4. Cadê os Arquivos Sensíveis? (.env Backend)
Acesse a pasta dentro da VPS:
```bash
cd /root/disparador-ai/backend
nano .env
```
Preencha lá as chaves cruciais:
```env
# Seu robô de Whats
EVOLUTION_BASE_URL="http://IP_DA_SUA_API_EVO:8080"
EVOLUTION_GLOBAL_API_KEY="xxx"
EVOLUTION_INSTANCE_NAME="adriano_biz"
GEMINI_API_KEY="AIza..."

# Seus Portfólios Locais da Stitch (Você deve rodar o MCP Stitch server em outra porta no Linux e colocar a URL dele aqui em baixo)
STITCH_API_URL="http://127.0.0.1:4005"
PORT=3001
```

Em seguida, chame `pm2 restart disparador-backend`.

Pronto, Frontend Vercel na nuvem consumindo Motor pesado Linux no Subterrâneo, operando WhatsApp ininterrupto.

## Comandos Úteis do Backend Hospedado
- Ver os logs correndo ao vivo fora da Vercel (se bater uma neura): `pm2 logs disparador-backend`
- Matar a aplicação: `pm2 stop disparador-backend`
- Liberar memória ou reiniciar pós-atualização de git clone: `pm2 restart disparador-backend`
