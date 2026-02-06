# 📱 Red Social Full-Stack

Una aplicación web completa de red social construida con React, Node.js, Express y MySQL. Incluye funcionalidades como posts, stories, likes, comentarios, seguimiento de usuarios y más.

> 📋 **[Resumen Ejecutivo](docs/EXECUTIVE_SUMMARY.md)** - Overview completo del proyecto para stakeholders y desarrolladores

## 🚀 Características Principales

- ✅ **Autenticación JWT** - Login y registro seguro
- ✅ **Gestión de Posts** - Crear, editar, eliminar y dar like a publicaciones
- ✅ **Sistema de Stories** - Historias temporales de usuarios
- ✅ **Interacciones Sociales** - Likes, comentarios, seguidores
- ✅ **Perfiles de Usuario** - Personalización y gestión de perfiles
- ✅ **API RESTful** - Backend robusto con documentación Swagger
- ✅ **Responsive Design** - Interfaz adaptativa con Bootstrap
- ✅ **Testing Completo** - Cobertura de tests unitarios e integración

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación de tokens
- **bcryptjs** - Hashing de contraseñas
- **Jest** - Testing framework

### Frontend
- **React 19** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP
- **Bootstrap 5** - Framework CSS
- **Vitest** - Testing framework

## 📁 Estructura del Proyecto

```
proyecto-curso-2/
├── client/                 # Frontend React
│   ├── public/            # Assets estáticos
│   ├── src/
│   │   ├── __tests__/     # Tests del frontend
│   │   ├── api/           # Configuración HTTP
│   │   ├── components/    # Componentes reutilizables
│   │   ├── context/       # Context API (Auth)
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── services/      # Servicios API
│   │   └── assets/        # Recursos estáticos
│   ├── package.json
│   └── vite.config.js
├── src/                   # Backend Node.js
│   ├── __tests__/         # Tests del backend
│   ├── controllers/       # Controladores de rutas
│   ├── helpers/           # Utilidades
│   ├── middlewares/       # Middlewares personalizados
│   ├── routes/            # Definición de rutas
│   ├── server.js          # Punto de entrada
│   └── swagger.js         # Configuración Swagger
├── config/                # Configuración de BD
├── docs/                  # Documentación
├── package.json
└── README.md
```

## 🏁 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- MySQL 8.0+
- Git

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd proyecto-curso-2
   ```

2. **Configurar la base de datos**
   ```sql
   CREATE DATABASE social_network;
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Instalar dependencias del backend**
   ```bash
   npm install
   ```

5. **Instalar dependencias del frontend**
   ```bash
   cd client
   npm install
   cd ..
   ```

6. **Ejecutar la aplicación**
   ```bash
   # Terminal 1: Backend
   npm run dev

   # Terminal 2: Frontend
   cd client && npm run dev
   ```

## 📚 Documentación

- [📖 Guía de API](docs/API.md) - Documentación completa de endpoints
- [🗄️ Esquema de Base de Datos](docs/DATABASE.md) - Estructura y relaciones
- [🎨 Documentación del Frontend](docs/FRONTEND.md) - Arquitectura y componentes
- [🚀 Guía de Despliegue](docs/DEPLOYMENT.md) - Estrategias de deployment

## 🧪 Testing

### Ejecutar todos los tests
```bash
# Tests del backend
npm test

# Tests del frontend
cd client && npm test
```

### Cobertura de tests
```bash
# Backend
npm run test:coverage

# Frontend
cd client && npm run test:coverage
```

## 🔧 Scripts Disponibles

### Backend
- `npm start` - Inicia el servidor en producción
- `npm run dev` - Inicia el servidor en modo desarrollo
- `npm test` - Ejecuta todos los tests
- `npm run test:unit` - Tests unitarios
- `npm run test:integration` - Tests de integración

### Frontend
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa del build
- `npm test` - Ejecuta los tests
- `npm run test:ui` - Interfaz de testing

## 🌐 API Endpoints

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Inicio de sesión
- `POST /api/v1/auth/logout` - Cierre de sesión

### Posts
- `GET /api/v1/posts` - Obtener posts del feed
- `POST /api/v1/posts` - Crear nuevo post
- `PUT /api/v1/posts/:id` - Actualizar post
- `DELETE /api/v1/posts/:id` - Eliminar post

### Usuarios
- `GET /api/v1/users/:id` - Obtener perfil de usuario
- `PUT /api/v1/users/:id` - Actualizar perfil
- `GET /api/v1/users/search` - Buscar usuarios

### Stories
- `GET /api/v1/stories` - Obtener stories
- `POST /api/v1/stories` - Crear story
- `DELETE /api/v1/stories/:id` - Eliminar story

### Relaciones
- `POST /api/v1/relationships` - Seguir usuario
- `DELETE /api/v1/relationships/:id` - Dejar de seguir
- `GET /api/v1/relationships/followers/:id` - Obtener seguidores

## 🔐 Variables de Entorno

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=social_network
JWT_SECRET=tu_jwt_secret_muy_seguro
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api/v1
```

## 📚 Documentación

> 🗂️ **[Índice de Documentación](docs/INDEX.md)** - Mapa completo de toda la documentación disponible

La documentación completa del proyecto está organizada en varios archivos especializados:

### 📖 Guías Principales
- **[📋 Guía de Estructura y Código](docs/GUIDE.md)** - Arquitectura detallada, patrones de diseño, flujo de datos y mejores prácticas de código
- **[🏛️ Arquitectura del Sistema](docs/ARCHITECTURE.md)** - Diagramas de arquitectura, flujo de datos, modelos de datos y diagramas de despliegue
- **[✨ Mejores Prácticas](docs/BEST_PRACTICES.md)** - Convenciones de código, estándares de desarrollo, seguridad y performance

### 📋 Documentación Específica
- **[🔌 API Documentation](docs/API.md)** - Endpoints, parámetros, respuestas y ejemplos de uso
- **[💾 Base de Datos](docs/DATABASE.md)** - Esquema de BD, relaciones, migraciones y queries
- **[🎨 Frontend Guide](docs/FRONTEND.md)** - Componentes, estado, routing y mejores prácticas React
- **[🚀 Guía de Despliegue](docs/DEPLOYMENT.md)** - Configuración de producción, CI/CD y monitoreo- **[🔒 Seguridad](docs/SECURITY_AUDIT.md)** - Análisis completo de vulnerabilidades y medidas de seguridad
- **[🛡️ OWASP Top 10](docs/OWASP_ANALYSIS.md)** - Evaluación contra estándares de seguridad OWASP
- **[🛠️ Implementación de Seguridad](docs/SECURITY_IMPLEMENTATION.md)** - Guía paso a paso para corregir vulnerabilidades
### 🧪 Testing
- **Backend**: Jest con tests unitarios e integración
- **Frontend**: Vitest con tests de componentes y servicios
- **Cobertura**: Mínimo 80% en todas las capas

### 🔒 Seguridad
- Autenticación JWT con refresh tokens
- Hashing bcrypt para contraseñas
- Validación de entrada con express-validator
- CORS configurado
- Rate limiting implementado

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.

## 👥 Autor

**Samuel Villagra** - *Desarrollador Full-Stack*

## 🙏 Agradecimientos

- React y Node.js communities
- Bootstrap por el framework CSS
- MySQL por la base de datos
- Todos los contribuidores de paquetes open source utilizados</content>
<parameter name="filePath">/Users/svillagra/VLA/Curso Web Setiembre 2025/ProyectoCurso2/README.md