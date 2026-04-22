# 🔍 Diagnóstico: Qual Servidor Web está Rodando?

## ⚠️ Problema Detectado

```
Address already in use on port 80 and 443
```

Há **outro servidor web** já usando essas portas no seu VPS.

---

## 🔧 Executar NO SEU VPS:

```bash
# Ver qual processo está na porta 80
sudo lsof -i :80

# Ver qual processo está na porta 443
sudo lsof -i :443

# Alternativa se lsof não funcionar:
sudo netstat -tlnp | grep -E ":80|:443"

# Ver serviços web rodando:
sudo systemctl list-units --type=service | grep -E "apache|nginx|httpd"

# Ver se Apache está rodando:
sudo systemctl status apache2

# Ver se algum nginx está rodando:
sudo systemctl status nginx

# Listar todos os serviços ativos:
sudo systemctl list-units --state=running --type=service
```

---

## 📋 Resultado Esperado

Você vai ver algo como:

```
COMMAND     PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
apache2    1234    www-data  3u  IPv4 12345      0t0  TCP *:80 (LISTEN)
apache2    5678    www-data  3u  IPv4 12346      0t0  TCP *:443 (LISTEN)
```

Ou:

```
nginx      1234    root  17u  IPv4 12345      0t0  TCP *:80 (LISTEN)
nginx      5678    root  18u  IPv4 12346      0t0  TCP *:443 (LISTEN)
```

---

## 🛠️ Soluções por Tipo de Servidor

### Se for **Apache** (`apache2` ou `httpd`):

```bash
# Parar Apache
sudo systemctl stop apache2

# Desabilitar para não iniciar automaticamente
sudo systemctl disable apache2

# Iniciar nginx
sudo systemctl start nginx
```

### Se for **Outro Nginx**:

```bash
# Ver arquivos de configuração
ls -la /etc/nginx/sites-enabled/

# Se houver sites já configurados, eles estão conflitando
# Remova ou renomeie o arquivo de configuração anterior

# Depois restart
sudo systemctl restart nginx
```

### Se for **cPanel/WHM**:

```bash
# cPanel geralmente tem seu próprio painel
# Você precisa configurar o nginx através do cPanel
# OU parar o Apache do cPanel e usar nginx standalone

sudo /scripts/restartsrv httpd
# Ou via cPanel: WHM > Home > Service Manager > Apache
```

---

## ✅ Depois de Identificar e Resolver:

```bash
# 1. Criar diretórios nginx (se não existirem)
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# 2. Criar configuração
sudo nano /etc/nginx/sites-available/code.grupototum.com

# 3. Cole esta configuração:
```

```nginx
server {
    listen 80;
    server_name code.grupototum.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name code.grupototum.com;
    
    # Certificado (será gerado depois)
    # ssl_certificate /etc/letsencrypt/live/code.grupototum.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/code.grupototum.com/privkey.pem;
    
    root /var/www/code.grupototum.com/public;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|gif|svg)$ {
        expires 1y;
    }
}
```

```bash
# 4. Ativar site
sudo ln -sf /etc/nginx/sites-available/code.grupototum.com /etc/nginx/sites-enabled/

# 5. Testar
sudo nginx -t

# 6. Restart
sudo systemctl restart nginx

# 7. Verificar status
sudo systemctl status nginx
```

---

## 🆘 Se Tudo Falhar

Se o servidor é **cPanel/WHM**, você pode usar uma **porta alternativa**:

```nginx
server {
    listen 8080;  # Porta alternativa
    server_name code.grupototum.com;
    
    # resto da configuração...
}
```

Depois acesse via: `https://code.grupototum.com:8080`

---

## 📝 Checklist

- [ ] Identifiquei qual servidor web está rodando
- [ ] Parei o servidor conflitante (se necessário)
- [ ] Criei a configuração nginx
- [ ] Arquivo está em `/etc/nginx/sites-available/code.grupototum.com`
- [ ] Link simbólico criado em `/etc/nginx/sites-enabled/`
- [ ] `sudo nginx -t` passou
- [ ] `sudo systemctl restart nginx` funcionou
- [ ] Site está acessível

---

**Faça o diagnóstico e me diz o resultado!** 🚀
