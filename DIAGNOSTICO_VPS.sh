#!/bin/bash

echo "🔍 DIAGNÓSTICO COMPLETO DO DEPLOY NO VPS"
echo "=========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar se nginx está rodando
echo "1️⃣  NGINX STATUS:"
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx está rodando${NC}"
else
    echo -e "${RED}✗ Nginx NÃO está rodando${NC}"
    echo "   Solução: sudo systemctl start nginx"
fi
echo ""

# 2. Verificar se arquivos existem
echo "2️⃣  ARQUIVOS:"
if [ -d "/var/www/code.grupototum.com/public" ]; then
    echo -e "${GREEN}✓ Diretório existe: /var/www/code.grupototum.com/public${NC}"

    # Contar arquivos
    FILE_COUNT=$(find /var/www/code.grupototum.com/public -type f | wc -l)
    echo "   Número de arquivos: $FILE_COUNT"

    if [ $FILE_COUNT -eq 0 ]; then
        echo -e "${RED}✗ PROBLEMA: Nenhum arquivo encontrado!${NC}"
        echo "   Solução: npm run build && sudo cp -r dist/* /var/www/code.grupototum.com/public/"
    else
        echo -e "${GREEN}✓ Arquivos encontrados${NC}"
    fi

    # Verificar se index.html existe
    if [ -f "/var/www/code.grupototum.com/public/index.html" ]; then
        echo -e "${GREEN}✓ index.html existe${NC}"
    else
        echo -e "${RED}✗ index.html NÃO encontrado!${NC}"
    fi
else
    echo -e "${RED}✗ Diretório NÃO existe: /var/www/code.grupototum.com/public${NC}"
    echo "   Solução: sudo mkdir -p /var/www/code.grupototum.com/public"
fi
echo ""

# 3. Verificar permissões
echo "3️⃣  PERMISSÕES:"
if [ -d "/var/www/code.grupototum.com/public" ]; then
    OWNER=$(ls -ld /var/www/code.grupototum.com/public | awk '{print $3":"$4}')
    echo "   Proprietário: $OWNER"

    if [ "$OWNER" = "www-data:www-data" ] || [ "$OWNER" = "root:root" ]; then
        echo -e "${GREEN}✓ Permissões OK${NC}"
    else
        echo -e "${YELLOW}⚠ Permissões podem estar erradas${NC}"
        echo "   Solução: sudo chown -R www-data:www-data /var/www/code.grupototum.com/public/"
    fi
fi
echo ""

# 4. Verificar configuração do nginx
echo "4️⃣  CONFIGURAÇÃO NGINX:"
if [ -f "/etc/nginx/sites-enabled/code.grupototum.com" ]; then
    echo -e "${GREEN}✓ Arquivo de configuração existe${NC}"

    # Verificar se tem try_files para SPA routing
    if sudo grep -q "try_files.*index.html" /etc/nginx/sites-enabled/code.grupototum.com; then
        echo -e "${GREEN}✓ SPA routing configurado (try_files)${NC}"
    else
        echo -e "${RED}✗ SPA routing NÃO encontrado!${NC}"
        echo "   Falta: try_files \$uri \$uri/ /index.html;"
    fi

    # Verificar root path
    ROOT_PATH=$(sudo grep "root" /etc/nginx/sites-enabled/code.grupototum.com | grep -v "^#" | head -1)
    echo "   Root path: $ROOT_PATH"

else
    echo -e "${RED}✗ Arquivo de configuração NÃO existe${NC}"
    echo "   Path esperado: /etc/nginx/sites-enabled/code.grupototum.com"
fi
echo ""

# 5. Verificar se nginx.conf é válido
echo "5️⃣  VALIDAÇÃO NGINX:"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓ Configuração nginx é válida${NC}"
else
    echo -e "${RED}✗ Configuração nginx inválida${NC}"
    echo "   Solução: sudo nginx -t (para ver detalhes do erro)"
fi
echo ""

# 6. Testar acesso HTTP
echo "6️⃣  TESTE HTTP:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://code.grupototum.com/ 2>/dev/null || echo "erro")

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo -e "${GREEN}✓ Resposta HTTP: $HTTP_STATUS${NC}"
else
    echo -e "${RED}✗ Erro HTTP: $HTTP_STATUS${NC}"
    echo "   Verifique se o DNS está apontado corretamente"
fi
echo ""

# 7. Logs de erro
echo "7️⃣  ÚLTIMOS ERROS (nginx):"
echo "   (Últimas 5 linhas)"
if [ -f "/var/log/nginx/code.grupototum.com.error.log" ]; then
    sudo tail -5 /var/log/nginx/code.grupototum.com.error.log | sed 's/^/   /'
else
    echo "   Arquivo de log não encontrado"
fi
echo ""

# 8. Verificar se o arquivo dist existe localmente
echo "8️⃣  DIRETÓRIO DIST (Local):"
if [ -d "./dist" ]; then
    DIST_COUNT=$(find ./dist -type f | wc -l)
    echo -e "${GREEN}✓ ./dist existe com $DIST_COUNT arquivos${NC}"
else
    echo -e "${YELLOW}⚠ ./dist não encontrado (execute: npm run build)${NC}"
fi
echo ""

echo "=========================================="
echo "🎯 RESUMO:"
echo ""
echo "Se receber 404, verifique nesta ordem:"
echo "  1. Arquivos copiados? (item 2)"
echo "  2. SPA routing configurado? (item 4)"
echo "  3. Nginx reiniciado? (execute: sudo systemctl restart nginx)"
echo "  4. Logs de erro? (item 7)"
echo ""
