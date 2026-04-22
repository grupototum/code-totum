#!/bin/bash

echo "🚀 DEPLOY AUTOMÁTICO - TOTUM CODE"
echo "=================================="
echo ""

# 1. Copiar arquivos
echo "1️⃣  Copiando arquivos para nginx..."
sudo mkdir -p /var/www/code.grupototum.com/public
sudo cp -r dist/* /var/www/code.grupototum.com/public/
sudo chown -R www-data:www-data /var/www/code.grupototum.com/public/
echo "✓ Arquivos copiados"
echo ""

# 2. Desmascarar nginx
echo "2️⃣  Desmascarando nginx..."
sudo systemctl unmask nginx
echo "✓ Nginx desmascarado"
echo ""

# 3. Criar configuração nginx
echo "3️⃣  Criando configuração nginx..."
sudo tee /etc/nginx/sites-available/code.grupototum.com > /dev/null << 'EOF'
# HTTP - Redirecionar para HTTPS
server {
    listen 80;
    server_name code.grupototum.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name code.grupototum.com;

    # SSL - Configurar com Let's Encrypt depois
    # ssl_certificate /etc/letsencrypt/live/code.grupototum.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/code.grupototum.com/privkey.pem;

    # Diretório raiz
    root /var/www/code.grupototum.com/public;
    index index.html;

    # Logs
    access_log /var/log/nginx/code.grupototum.com.access.log;
    error_log /var/log/nginx/code.grupototum.com.error.log;

    # SPA routing - IMPORTANTE para React/Vue/etc
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets (JS, CSS, imagens)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Bloquear acesso a arquivos sensíveis
    location ~ /\. {
        deny all;
    }
}
EOF

echo "✓ Configuração criada em /etc/nginx/sites-available/code.grupototum.com"
echo ""

# 4. Ativar o site
echo "4️⃣  Ativando site no nginx..."
sudo ln -sf /etc/nginx/sites-available/code.grupototum.com /etc/nginx/sites-enabled/
echo "✓ Site ativado"
echo ""

# 5. Desabilitar site padrão se existir
echo "5️⃣  Desabilitando site padrão..."
sudo rm -f /etc/nginx/sites-enabled/default
echo "✓ Padrão desabilitado"
echo ""

# 6. Testar configuração nginx
echo "6️⃣  Testando configuração nginx..."
if sudo nginx -t; then
    echo "✓ Configuração válida"
else
    echo "✗ ERRO na configuração nginx!"
    exit 1
fi
echo ""

# 7. Iniciar nginx
echo "7️⃣  Iniciando nginx..."
sudo systemctl start nginx
if sudo systemctl is-active --quiet nginx; then
    echo "✓ Nginx iniciado com sucesso"
else
    echo "✗ ERRO ao iniciar nginx"
    exit 1
fi
echo ""

# 8. Verificar arquivos
echo "8️⃣  Verificando arquivos..."
FILE_COUNT=$(find /var/www/code.grupototum.com/public -type f | wc -l)
echo "✓ Total de arquivos: $FILE_COUNT"

if [ -f "/var/www/code.grupototum.com/public/index.html" ]; then
    echo "✓ index.html presente"
else
    echo "✗ index.html NÃO encontrado!"
fi
echo ""

echo "=================================="
echo "✅ DEPLOY COMPLETO!"
echo "=================================="
echo ""
echo "🌐 Acesse: https://code.grupototum.com"
echo ""
echo "📝 Próximos passos:"
echo "  1. Configure SSL com Let's Encrypt:"
echo "     sudo certbot certonly --standalone -d code.grupototum.com"
echo "  2. Edite o arquivo nginx e descomente as linhas SSL:"
echo "     sudo nano /etc/nginx/sites-available/code.grupototum.com"
echo "  3. Reinicie nginx:"
echo "     sudo systemctl restart nginx"
echo ""
