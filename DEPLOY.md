# Deploy de code.grupototum.com

## Status: Build Pronto para Deploy

- **Projeto**: Code Hub (ADA + Claudio + Cráudio)
- **Build**: `/dist/` (172KB)
- **Servidor**: 187.127.4.140
- **Domínio**: code.grupototum.com

## Instruções de Deploy

### 1. No Servidor (como root)

```bash
# Criar diretório se não existir
mkdir -p /var/www/code.grupototum.com

# Copiar arquivos build
rsync -avz --delete /path/to/dist/ /var/www/code.grupototum.com/

# Ou via SCP (do seu computador):
# scp -r dist/* root@187.127.4.140:/var/www/code.grupototum.com/
```

### 2. Configurar Nginx

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name code.grupototum.com;

    root /var/www/code.grupototum.com;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Desabilitar cache para HTML
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-store, must-revalidate";
    }
}
```

### 3. Obter SSL com Certbot

```bash
# Instalar certbot se não estiver
apt-get install certbot python3-certbot-nginx

# Obter certificado
certbot --nginx -d code.grupototum.com

# Auto-renovação
systemctl enable certbot.timer
```

### 4. Verificar

```bash
# Teste local
curl -I https://code.grupototum.com

# No navegador
https://code.grupototum.com
```

## Próximos Passos

1. ✅ Build criado: `npm run build`
2. ⏳ Deploy para /var/www/code.grupototum.com
3. ⏳ Configurar Nginx
4. ⏳ Certificado SSL
5. ⏳ Expandir funcionalidades (Auth completa, Claudio, Cráudio, ADA)

## Estrutura de Arquivos

```
/var/www/code.grupototum.com/
├── index.html
└── assets/
    ├── index-XXXX.js
    └── index-XXXX.css
```
