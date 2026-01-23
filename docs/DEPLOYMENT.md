# Guía de Despliegue

## Descripción

Esta guía cubre las estrategias de despliegue para el proyecto de red social.

## Despliegue Local

### Prerrequisitos
- Node.js 18+
- MySQL 8.0+
- Git

### Configuración del Backend
```bash
cd src
npm install
cp ../.env.example .env
# Editar .env con configuración local
```

### Configuración del Frontend
```bash
cd client
npm install
cp .env.example .env
# Editar .env
```

### Ejecutar la Aplicación
```bash
# Terminal 1: Backend
cd src && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

## Despliegue en Producción

### Variables de Entorno
```env
NODE_ENV=production
DB_HOST=tu_db_host
DB_USER=tu_db_user
DB_PASSWORD=tu_db_password
DB_NAME=tu_db_name
JWT_SECRET=tu_jwt_secret
PORT=3001
```

### Build del Frontend
```bash
cd client
npm run build
```

## Plataformas de Despliegue

### Vercel (Frontend)
1. Conectar repositorio
2. Directorio raíz: `client/`
3. Variables: `VITE_API_BASE_URL=https://tu-api.vercel.app/api/v1`

### Railway (Full-Stack)
1. Conectar GitHub
2. Agregar MySQL service
3. Variables se configuran automáticamente

### Heroku (Backend)
1. `heroku create tu-app-name`
2. `heroku addons:create cleardb:ignite`
3. `heroku config:set JWT_SECRET=tu_jwt_secret`
4. `git push heroku main`

## Docker

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DB_HOST=db
      - DB_USER=user
      - DB_PASSWORD=password
    depends_on:
      - db
  db:
    image: mysql:8.0
    environment:
      - MYSQL_DATABASE=social_media
      - MYSQL_USER=user
      - MYSQL_PASSWORD=password
```

## Seguridad

### HTTPS
- Usar Let's Encrypt
- Configurar SSL/TLS
- Redirigir HTTP a HTTPS

### Variables de Entorno
- Nunca commitear `.env`
- Usar secrets en plataformas
- Rotar JWT_SECRET regularmente

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})
app.use(limiter)
```

## Checklist

### Pre-Despliegue
- [ ] Variables configuradas
- [ ] DB creada y migrada
- [ ] Build frontend exitoso
- [ ] Secrets configurados

### Post-Despliegue
- [ ] App accesible
- [ ] API funcionando
- [ ] DB conectada
- [ ] Logs configurados
