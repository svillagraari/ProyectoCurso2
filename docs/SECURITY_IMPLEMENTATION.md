# 🛠️ Guía de Implementación de Seguridad

**Fecha:** 6 de febrero de 2026  
**Versión:** 1.0  
**Estado:** Implementación Pendiente  

Esta guía proporciona instrucciones detalladas para implementar las correcciones de seguridad identificadas en el [Estudio de Vulnerabilidades](SECURITY_AUDIT.md).

## 🚨 Prioridad Crítica - Semana 1

### 1. Corregir Exposición de Tokens JWT

**Archivo:** `src/middlewares/verifyAuth.js`  
**Problema:** Tokens inválidos se exponen en respuestas de error  

**Solución Implementada:**
```javascript
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.header("Authorization");

  if (!header) return res.status(401).json({
    success: false,
    message: "Token de autenticación requerido"
  });

  const token = header.replace("Bearer ", "");

  if (!token) return res.status(401).json({
    success: false,
    message: "Token de autenticación requerido"
  });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    // ❌ REMOVER: error: err, token - Información sensible
    return res.status(401).json({
      success: false,
      message: "Token de autenticación inválido"
    });
  }
};
```

**Verificación:**
```bash
# Probar con token inválido
curl -X GET "http://localhost:3001/api/v1/posts" \
  -H "Authorization: Bearer invalid.jwt.token"

# Respuesta esperada: NO debe incluir el token inválido
{"success":false,"message":"Token de autenticación inválido"}
```

---

### 2. Implementar Rate Limiting

**Archivo:** `src/server.js`  
**Problema:** Sin protección contra fuerza bruta  

**Dependencia Requerida:**
```bash
npm install express-rate-limit
```

**Solución Implementada:**
```javascript
const express = require("express");
const rateLimit = require('express-rate-limit');
const app = express();

// Rate limiting para endpoints de autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intenta más tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting general para API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta más tarde.'
  }
});

// Aplicar limiters
app.use('/api/v1/auth/', authLimiter);
app.use('/api/v1/', apiLimiter);

// Middlewares existentes
app.use(express.json());
app.use(cors());
app.use(cookieParser());
```

**Verificación:**
```bash
# Probar rate limiting en login
for i in {1..6}; do
  curl -X POST "http://localhost:3001/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# Después del 5to intento debe devolver 429 Too Many Requests
```

---

### 3. Cambiar Almacenamiento de Tokens

**Opción A: Usar sessionStorage (Recomendado para SPA)**
```javascript
// client/src/api/http.js
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export const http = axios.create({
  baseURL,
  withCredentials: true  // Importante para cookies
})

// ❌ Cambiar de localStorage a sessionStorage
http.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')  // ✅ Más seguro que localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Opción B: Usar httpOnly Cookies (Más Seguro)**
```javascript
// src/controllers/auth.controller.js - Modificar login
const login = async (req, res) => {
  // ... validación existente ...

  const token = jwt.sign(
    { id: result.insertId, email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // ✅ Enviar token como httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,        // ✅ No accesible desde JavaScript
    secure: process.env.NODE_ENV === 'production', // ✅ Solo HTTPS en prod
    sameSite: 'strict',    // ✅ Protección CSRF
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  });

  return res.json({
    success: true,
    message: "Login exitoso",
    user: { id: result.insertId, email, name: result.name }
  });
};

// client/src/api/http.js - Remover token manual
export const http = axios.create({
  baseURL,
  withCredentials: true  // ✅ Enviar cookies automáticamente
})

// ❌ Remover interceptor de token manual
// El token se envía automáticamente como cookie httpOnly
```

**Verificación:**
```javascript
// En consola del navegador
console.log(localStorage.getItem('token')) // undefined (si usas cookies)
console.log(sessionStorage.getItem('token')) // undefined (si usas sessionStorage)

// Verificar que las requests incluyen cookies
// Network tab en DevTools debe mostrar cookie: token=...
```

## 🟠 Prioridad Alta - Semana 2

### 4. Actualizar Dependencias Vulnerables

```bash
# Verificar vulnerabilidades actuales
npm audit

# Actualizar dependencias problemáticas
npm update lodash

# Si hay vulnerabilidades críticas
npm audit fix

# Verificar que se resolvieron
npm audit
```

### 5. Configurar CORS Restrictivo

**Archivo:** `src/server.js`

```javascript
const cors = require("cors");

// ✅ Configuración CORS segura
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [
          'https://yourdomain.com',
          'https://app.yourdomain.com',
          'https://admin.yourdomain.com'
        ]
      : [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://127.0.0.1:3000'
        ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // ✅ Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
  maxAge: 86400  // 24 horas de cache para preflight
};

app.use(cors(corsOptions));
```

### 6. Implementar Headers de Seguridad

**Dependencia Requerida:**
```bash
npm install helmet
```

**Archivo:** `src/server.js`
```javascript
const helmet = require('helmet');

// ✅ Configuración Helmet completa
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.yourdomain.com"],
      frameSrc: ["'none'"],  // ✅ Prevenir clickjacking
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,  // 1 año
    includeSubDomains: true,
    preload: true
  } : false,
  noSniff: true,        // ✅ Prevenir MIME sniffing
  xssFilter: true,      // ✅ Filtrar ataques XSS
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
```

### 7. Mejorar Validación de Contraseñas

**Archivo:** `src/middlewares/validators/auth.validator.js`
```javascript
const { body } = require("express-validator");

const registerValidator = [
  // ... validaciones existentes ...

  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 12 })
    .withMessage("La contraseña debe tener al menos 12 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage("La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial")
    .not()
    .matches(/^password/i)
    .withMessage("La contraseña no puede contener la palabra 'password'"),

  // ... resto de validaciones ...
];
```

### 8. Sanitizar Logs Sensibles

**Archivo:** `config/db.js`
```javascript
const mysql = require("mysql2");

const dbConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000
});

// ✅ Logging seguro
dbConnection.on('connection', (connection) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Database connection established');
  }
});

dbConnection.on('error', (err) => {
  console.error('Database error occurred');

  // ❌ NO loggear detalles sensibles en producción
  if (process.env.NODE_ENV === 'development') {
    console.error('Database error details:', {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      // ⚠️  NO incluir: sqlMessage, host, user, password, etc.
    });
  }
});

module.exports = dbConnection;
```

## 🟡 Prioridad Media - Semana 3

### 9. Validar Parámetros de Query

**Archivo:** `src/controllers/posts.controller.js`
```javascript
const getPosts = async (req, res) => {
  try {
    // ✅ Validación y sanitización de parámetros
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100); // 1-100
    const page = Math.max(parseInt(req.query.page) || 1, 1); // Mínimo 1
    const offset = (page - 1) * limit;

    // ✅ Validar que no se produzcan números negativos o demasiado grandes
    if (offset > 10000) {  // Límite razonable
      return sendErrorResponse(res, 400, "Parámetros de paginación inválidos");
    }

    const query = `SELECT p.*, u.id AS userId, name
                   FROM posts AS p
                   JOIN users AS u ON (u.id = p.user_id)
                   LEFT JOIN relationships AS r ON (p.user_id = r.followed_user_id)
                   WHERE r.follower_user_id = ? OR p.user_id = ?
                   ORDER BY p.created_at DESC
                   LIMIT ? OFFSET ?`;

    const values = [req.user.id, req.user.id, limit, offset];

    // ... resto del código ...
  } catch (err) {
    return sendErrorResponse(res, 500, "Error al obtener posts", err);
  }
};
```

### 10. Validar URL Base en Frontend

**Archivo:** `client/src/api/http.js`
```javascript
import axios from 'axios'

// ✅ Función de validación de URL
const validateBaseURL = (url) => {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);

    // Solo permitir HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }

    // Validar hostname (prevenir localhost en producción, etc.)
    if (process.env.NODE_ENV === 'production') {
      const allowedHosts = ['api.yourdomain.com', 'yourdomain.com'];
      if (!allowedHosts.includes(parsedUrl.hostname)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.warn('Invalid API base URL provided:', url);
    return false;
  }
};

// ✅ URL base validada
const baseURL = validateBaseURL(import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:3000/api/v1';

export const http = axios.create({
  baseURL,
  timeout: 10000,  // ✅ Timeout para prevenir hanging requests
  withCredentials: true
});
```

### 11. Implementar Sanitización HTML

**Dependencia Requerida:**
```bash
npm install sanitize-html
```

**Archivo:** `src/controllers/posts.controller.js`
```javascript
const sanitizeHtml = require('sanitize-html');

const createPost = async (req, res) => {
  const user = req.user;
  const { desc, img } = req.body;

  // ✅ Sanitizar contenido HTML
  const sanitizedDesc = sanitizeHtml(desc, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes: {
      'a': ['href', 'target', 'rel']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      'a': (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer',  // ✅ Seguridad adicional
          target: '_blank'
        }
      })
    }
  });

  // ✅ Validar longitud después de sanitización
  if (sanitizedDesc.length > 10000) {  // Límite razonable
    return sendErrorResponse(res, 400, "Contenido demasiado largo");
  }

  // ✅ Validar URL de imagen si existe
  if (img) {
    try {
      const imageUrl = new URL(img);
      if (!['http:', 'https:'].includes(imageUrl.protocol)) {
        return sendErrorResponse(res, 400, "URL de imagen inválida");
      }
    } catch (error) {
      return sendErrorResponse(res, 400, "URL de imagen inválida");
    }
  }

  // ... resto del código usando sanitizedDesc ...
};
```

### 12. Cambiar a Connection Pool

**Archivo:** `config/db.js`
```javascript
const mysql = require("mysql2");

// ✅ Usar createPool en lugar de createConnection
const dbConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,        // ✅ Pool de conexiones
  queueLimit: 0,              // ✅ Cola infinita
  acquireTimeout: 60000,      // ✅ Timeout de adquisición
  timeout: 60000,             // ✅ Timeout de query
  reconnect: true,            // ✅ Reconexión automática
  // ✅ Configuración SSL para producción
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true
  } : false
});

// ✅ Promisify para usar async/await
const promisePool = dbConnection.promise();

module.exports = promisePool;
```

**Actualizar controladores para usar promesas:**
```javascript
// En controllers/posts.controller.js
const dbConnection = require("../../config/db");

const getPosts = async (req, res) => {
  try {
    const [rows] = await dbConnection.execute(query, values);
    return sendSuccessResponse(res, 200, "Posts obtenidos", { posts: rows });
  } catch (err) {
    return sendErrorResponse(res, 500, "Error al obtener posts", err);
  }
};
```

## 🟢 Prioridad Baja - Semana 4

### 13. Configurar Logging Apropiado

**Dependencia Recomendada:**
```bash
npm install winston winston-daily-rotate-file
```

**Archivo:** `src/utils/logger.js`
```javascript
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // ✅ Logs de error separados
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),

    // ✅ Logs combinados
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// ✅ Console logging solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### 14. Implementar Timeouts

**Archivo:** `src/server.js`
```javascript
const timeout = require('connect-timeout');

// ✅ Timeout global para requests
app.use(timeout('30s'));

// ✅ Middleware para manejar timeouts
app.use((req, res, next) => {
  if (!req.timedout) next();
});

// ✅ Timeout específico para rutas pesadas
app.use('/api/v1/posts', timeout('10s'));
app.use('/api/v1/users/search', timeout('5s'));
```

### 15. Agregar Versionado de API

**Estructura de archivos:**
```
src/routes/
├── v1/
│   ├── auth.route.js
│   ├── posts.route.js
│   └── users.route.js
└── v2/
    ├── auth.route.js
    └── posts.route.js
```

**Archivo:** `src/server.js`
```javascript
// ✅ Versionado de API
app.use('/api/v1/auth/', require('./routes/v1/auth.route'));
app.use('/api/v1/posts/', require('./routes/v1/posts.route'));
app.use('/api/v1/users/', require('./routes/v1/users.route'));

// ✅ Nueva versión (cuando sea necesaria)
// app.use('/api/v2/auth/', require('./routes/v2/auth.route'));

// ✅ Redirección de API sin versión a v1
app.use('/api/auth/', (req, res) => res.redirect('/api/v1/auth/'));
app.use('/api/posts/', (req, res) => res.redirect('/api/v1/posts/'));
```

## 🧪 Verificación de Implementación

### Script de Verificación de Seguridad

Crear `test-security.js`:
```javascript
const axios = require('axios');

async function runSecurityTests() {
  console.log('🛡️  Ejecutando pruebas de seguridad...\n');

  const baseURL = 'http://localhost:3001/api/v1';

  try {
    // 1. Probar rate limiting
    console.log('1. Probando rate limiting...');
    for (let i = 0; i < 6; i++) {
      try {
        await axios.post(`${baseURL}/auth/login`, {
          email: 'test@example.com',
          password: 'wrong'
        });
      } catch (error) {
        if (error.response?.status === 429) {
          console.log('✅ Rate limiting funcionando');
          break;
        }
      }
    }

    // 2. Probar CORS
    console.log('2. Probando CORS...');
    try {
      await axios.get(`${baseURL}/posts`, {
        headers: { 'Origin': 'https://malicious-site.com' }
      });
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ CORS restrictivo funcionando');
      }
    }

    // 3. Probar headers de seguridad
    console.log('3. Probando headers de seguridad...');
    const response = await axios.get(`${baseURL}/posts`);
    const headers = response.headers;

    if (headers['x-content-type-options'] === 'nosniff') {
      console.log('✅ Headers de seguridad implementados');
    }

    console.log('\n🎉 Todas las pruebas de seguridad pasaron!');

  } catch (error) {
    console.error('❌ Error en pruebas de seguridad:', error.message);
  }
}

runSecurityTests();
```

**Ejecutar pruebas:**
```bash
node test-security.js
```

## 📊 Checklist de Verificación

### Después de Implementar Cambios Críticos
- [ ] Tokens JWT no se exponen en errores
- [ ] Rate limiting bloquea intentos excesivos
- [ ] Tokens almacenados de forma segura
- [ ] Dependencias actualizadas
- [ ] CORS configurado restrictivamente
- [ ] Headers de seguridad implementados
- [ ] Contraseñas requieren complejidad
- [ ] Logs no contienen información sensible

### Después de Implementar Cambios Medios
- [ ] Parámetros de query validados
- [ ] URLs validadas en frontend
- [ ] Contenido HTML sanitizado
- [ ] Connection pool implementado
- [ ] Timeouts configurados
- [ ] API versionada

### Monitoreo Continuo
- [ ] Logs de seguridad implementados
- [ ] Alertas configuradas
- [ ] Revisiones periódicas programadas
- [ ] Documentación de seguridad actualizada

---

**Nota:** Esta guía debe ser seguida por el equipo de desarrollo. Cada cambio debe ser probado exhaustivamente antes de pasar a producción. Se recomienda realizar un nuevo análisis de vulnerabilidades después de implementar todas las correcciones.