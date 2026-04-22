# 📘 Guia Completo de Deploy no VPS

## ⚠️ IMPORTANTE: Executar os comandos no diretório CORRETO

Os comandos precisam ser executados **dentro do diretório do projeto**, não na raiz.

---

## 🚀 Opção 1: Deploy Completo do GitHub (RECOMENDADO)

### Passo 1: No seu VPS, navegue até `/var/www` ou onde você quer servir a app:

```bash
cd /var/www
# ou
cd /home/seu-usuario/aplicacoes
```

### Passo 2: Clone o repositório GitHub:

```bash
git clone https://github.com/grupototum/Apps_totum_Oficial.git
cd Apps_totum_Oficial/code.grupototum.com
```

### Passo 3: Instale as dependências:

```bash
npm install
```

### Passo 4: Configure as variáveis de ambiente:

```bash
cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:3000
VITE_CLAUDE_API_KEY=sk-ant-...sua-chave...
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=mistral
EOF
```

**Obs:** Substitua os valores reais das chaves!

### Passo 5: Faça o build:

```bash
npm run build
```

### Passo 6: Copie a pasta `dist/` para o local de servir (nginx):

```bash
sudo mkdir -p /var/www/code.grupototum.com/public
sudo cp -r dist/* /var/www/code.grupototum.com/public/
sudo chown -R www-data:www-data /var/www/code.grupototum.com/public/
```

---

## 🌐 Passo 7: Configurar Nginx

### Criar arquivo de configuração do nginx:

```bash
sudo nano /etc/nginx/sites-available/code.grupototum.com
```

### Copiar esta configuração:

```nginx
server {
    listen 80;
    server_name code.grupototum.com;
    
    # Redirect HTTP para HTTPS (opcional, se tiver SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name code.grupototum.com;
    
    # Certificado SSL (gerar com Let's Encrypt)
    # sudo certbot certonly --standalone -d code.grupototum.com
    ssl_certificate /etc/letsencrypt/live/code.grupototum.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/code.grupototum.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Diretório raiz
    root /var/www/code.grupototum.com/public;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/code.grupototum.com.access.log;
    error_log /var/log/nginx/code.grupototum.com.error.log;
    
    # SPA routing - redirecionar 404s para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache de assets (JS, CSS, imagens)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Desabilitar acesso a arquivos sensíveis
    location ~ /\. {
        deny all;
    }
}
```

### Ativar o site no nginx:

```bash
sudo ln -s /etc/nginx/sites-available/code.grupototum.com /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Se tudo OK, reiniciar
sudo systemctl restart nginx
```

---

## 🔒 Passo 8: Certificado SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx -y

# Gerar certificado gratuito
sudo certbot certonly --standalone -d code.grupototum.com

# Renovação automática
sudo systemctl enable certbot.timer
```

---

## ✅ Passo 9: Verificar se está funcionando

### No seu navegador:
```
https://code.grupototum.com
```

### Via terminal:
```bash
curl -I https://code.grupototum.com/
# Deveria retornar: HTTP/2 200 OK
```

---

## 🐳 Alternativa: Deploy com Docker (Ainda Mais Fácil)

### Passo 1: Instalar Docker no VPS:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Passo 2: Criar Dockerfile na raiz do projeto:

```bash
cat > Dockerfile << 'EOF'
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app

RUN npm install -g serve

COPY --from=0 /app/dist ./dist

EXPOSE 3000

ENV VITE_API_URL=http://localhost:3000
ENV VITE_OLLAMA_URL=http://localhost:11434

CMD ["serve", "-s", "dist", "-l", "3000"]
EOF
```

### Passo 3: Build da imagem Docker:

```bash
docker build -t totum-code:latest .
```

### Passo 4: Rodando o container:

```bash
docker run -d \
  --name totum-code \
  -p 3000:3000 \
  -e VITE_API_URL=http://localhost:3000 \
  -e VITE_OLLAMA_URL=http://localhost:11434 \
  --restart unless-stopped \
  totum-code:latest
```

### Passo 5: Acessar via nginx (proxy):

```bash
sudo nano /etc/nginx/sites-available/code.grupototum.com
```

```nginx
server {
    listen 443 ssl http2;
    server_name code.grupototum.com;
    
    ssl_certificate /etc/letsencrypt/live/code.grupototum.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/code.grupototum.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🆘 Troubleshooting

### Erro 404 ao acessar subdomain:

1. Verificar se nginx está rodando:
   ```bash
   sudo systemctl status nginx
   ```

2. Verificar se os arquivos estão no lugar certo:
   ```bash
   ls -la /var/www/code.grupototum.com/public/
   ```

3. Verificar logs:
   ```bash
   sudo tail -f /var/log/nginx/code.grupototum.com.error.log
   ```

### Erro de permissões:

```bash
sudo chown -R www-data:www-data /var/www/code.grupototum.com/
sudo chmod -R 755 /var/www/code.grupototum.com/
```

### DNS não resolvendo:

1. Verificar se o DNS está apontado certo:
   ```bash
   nslookup code.grupototum.com
   dig code.grupototum.com
   ```

2. Aguardar propagação (até 48h)

---

## 📋 Checklist Final

- [ ] Repositório clonado
- [ ] `npm install` executado
- [ ] `.env.local` configurado
- [ ] `npm run build` sucesso
- [ ] Arquivos em `/var/www/code.grupototum.com/public/`
- [ ] Nginx configurado
- [ ] SSL certificado gerado
- [ ] Nginx reiniciado
- [ ] `curl -I https://code.grupototum.com/` retorna 200
- [ ] Acessar no navegador funciona

---

## 🎯 Resumo Rápido (TL;DR)

```bash
# 1. Clonar
git clone https://github.com/grupototum/Apps_totum_Oficial.git
cd Apps_totum_Oficial/code.grupototum.com

# 2. Instalar e configurar
npm install
echo "VITE_API_URL=http://localhost:3000" > .env.local
npm run build

# 3. Deploy
sudo mkdir -p /var/www/code.grupototum.com/public
sudo cp -r dist/* /var/www/code.grupototum.com/public/

# 4. Nginx (use a configuração acima)
sudo nano /etc/nginx/sites-available/code.grupototum.com
sudo systemctl restart nginx

# 5. SSL (Let's Encrypt)
sudo certbot certonly --standalone -d code.grupototum.com

# ✅ Pronto!
```

---

**Precisa de ajuda?** Verifique os logs:
```bash
sudo journalctl -u nginx -f
cat ~/.npm/_logs/*.log
```
