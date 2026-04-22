# 🔍 Diagnóstico: Subdomínio code.grupototum.com

## ❌ Problema Identificado
**Status:** `404 page not found`

O subdomínio `code.grupototum.com` está resolvendo para um servidor web (provavelmente nginx ou Apache), mas nenhuma aplicação está configurada para servir a partir deste caminho.

---

## 🔧 Possíveis Causas

### 1. **Aplicação Não Deployada**
A aplicação TOTUM CODE não foi deployada no servidor que hospeda `code.grupototum.com`.

**Solução:** 
- Fazer build da aplicação: `npm run build`
- Deploy do diretório `dist/` para o servidor

### 2. **Configuração de Servidor Web Incorreta**
O nginx/Apache não está configurado para servir a aplicação.

**Configuração Necessária (nginx):**
```nginx
server {
    listen 80;
    server_name code.grupototum.com;
    
    # Redirect HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name code.grupototum.com;
    
    ssl_certificate /caminho/para/certificado.crt;
    ssl_certificate_key /caminho/para/chave.key;
    
    # Servir arquivos estáticos
    root /var/www/code.grupototum.com/dist;
    index index.html;
    
    # SPA routing - redirecionar 404s para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache de assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. **DNS Apontando para o Servidor Errado**
O DNS pode estar apontando para um servidor que não tem a aplicação.

**Verificar:** 
```bash
nslookup code.grupototum.com
dig code.grupototum.com
```

### 4. **Variáveis de Ambiente Não Configuradas**
A aplicação precisa de variáveis de ambiente para funcionar.

**Necessário:**
- `.env` ou `.env.local` com:
  - `VITE_API_URL` - URL da API backend
  - `VITE_CLAUDE_API_KEY` - Chave Claude
  - `VITE_OLLAMA_URL` - URL do Ollama

---

## ✅ Checklist de Resolução

### Opção 1: Deploy Manual

1. **Build da aplicação:**
   ```bash
   cd /Users/israellemos/Documents/Totum\ Dev/code.grupototum.com
   npm run build
   ```

2. **Verificar saída:**
   ```bash
   ls -la dist/
   ```

3. **Copiar para servidor:**
   ```bash
   scp -r dist/* usuario@seu-servidor:/var/www/code.grupototum.com/
   ```

4. **Configurar nginx** (ver configuração acima)

5. **Restart nginx:**
   ```bash
   sudo systemctl restart nginx
   ```

### Opção 2: Deploy com Vercel/Netlify

1. **Conectar repositório GitHub:** https://github.com/grupototum/Apps_totum_Oficial

2. **Configurar domínio customizado**
   - Apontar DNS para o serviço de hosting
   - Usar CNAME: `code.grupototum.com`

3. **Variáveis de ambiente**
   - Configurar no dashboard do serviço

### Opção 3: Deploy com Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine
WORKDIR /app

RUN npm install -g serve

COPY --from=0 /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Build e run:**
```bash
docker build -t totum-code .
docker run -p 3000:3000 totum-code
```

---

## 📊 Status Atual

| Item | Status | Detalhes |
|------|--------|----------|
| **Código** | ✅ Completo | Todas as 4 páginas funcionais |
| **GitHub** | ✅ Publicado | https://github.com/grupototum/Apps_totum_Oficial |
| **Build Local** | ✅ Funciona | `npm run dev` - localhost:5176 |
| **Subdomínio** | ❌ 404 | Servidor não está servindo a aplicação |
| **Deploy** | ⏳ Pendente | Precisa fazer build e deploy |

---

## 🎯 Próximos Passos Recomendados

1. **Verificar qual é o servidor** que hospeda `grupototum.com`
   - Verificar painel de controle de DNS
   - Confirmar IP/CNAME do subdomínio

2. **Acessar o servidor** e verificar:
   - Se nginx/Apache está rodando
   - Onde estão os arquivos servidos
   - Logs de erro

3. **Fazer o build:**
   ```bash
   npm run build
   ```

4. **Copiar `dist/` para o servidor** no caminho correto

5. **Testar:**
   ```bash
   curl -I https://code.grupototum.com/
   # Deveria retornar 200 OK
   ```

---

## 📞 Informações de Contato para Suporte

Se precisar de ajuda com o deploy:
- Verificar painel de controle do seu hosting
- Documentação do nginx: https://nginx.org/en/docs/
- Documentação do Vercel: https://vercel.com/docs

---

**Última atualização:** 2026-04-12
**Aplicação:** TOTUM CODE v1.0
**GitHub:** https://github.com/grupototum/Apps_totum_Oficial
