# 📋 Guía de Estructura y Código

Esta guía proporciona una comprensión detallada de la arquitectura, estructura de código y patrones utilizados en la aplicación de red social.

## 🏗️ Arquitectura General

### Patrón Arquitectónico
La aplicación sigue una arquitectura **cliente-servidor** con separación clara entre frontend y backend:

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   Frontend      │◄────────────────►│   Backend       │
│   (React SPA)   │                  │   (Node/Express)│
│                 │                  │                 │
│ • Componentes   │                  │ • API REST      │
│ • Servicios     │                  │ • Controladores │
│ • Context       │                  │ • Middlewares   │
│ • Rutas         │                  │ • Modelos       │
└─────────────────┘                  └─────────────────┘
                                              │
                                              ▼
                                   ┌─────────────────┐
                                   │   Base de Datos │
                                   │   (MySQL)       │
                                   └─────────────────┘
```

### Principios de Diseño
- **Separación de responsabilidades**: Cada capa tiene una función específica
- **Inyección de dependencias**: Servicios desacoplados
- **Principio de responsabilidad única**: Cada módulo hace una cosa bien
- **DRY (Don't Repeat Yourself)**: Código reutilizable
- **SOLID**: Principios de diseño orientado a objetos

## 🔧 Backend - Estructura Detallada

### 📁 `src/` - Directorio Principal

#### `server.js` - Punto de Entrada
```javascript
// Configuración básica del servidor Express
const express = require("express");
const app = express();

// Middlewares globales
app.use(express.json());        // Parseo JSON
app.use(cors());               // CORS
app.use(cookieParser());       // Cookies

// Rutas de la API
app.use("/api/v1/auth/", require("./routes/auth.route"));
app.use("/api/v1/posts/", require("./routes/posts.route"));
// ... más rutas

// Documentación Swagger
swaggerDocs(app, PORT);
```

#### `controllers/` - Lógica de Negocio
Cada controlador maneja una entidad específica:

**Estructura típica de un controlador:**
```javascript
const controller = {
  // Método GET - Obtener recursos
  async getAll(req, res) {
    try {
      const data = await Model.findAll();
      responseHandler.success(res, data);
    } catch (error) {
      responseHandler.error(res, error);
    }
  },

  // Método POST - Crear recurso
  async create(req, res) {
    try {
      const newItem = await Model.create(req.body);
      responseHandler.success(res, newItem, 201);
    } catch (error) {
      responseHandler.error(res, error);
    }
  }
};
```

**Controladores disponibles:**
- `auth.controller.js` - Autenticación y registro
- `posts.controller.js` - Gestión de publicaciones
- `users.controller.js` - Perfiles de usuario
- `stories.controller.js` - Historias temporales
- `relationships.controller.js` - Seguidores/siguiendo
- `comments.controller.js` - Comentarios en posts
- `likes.controller.js` - Sistema de likes

#### `routes/` - Definición de Endpoints
Las rutas conectan URLs con controladores:

```javascript
const express = require("express");
const router = express.Router();
const controller = require("../controllers/posts.controller");
const { verifyAuth } = require("../middlewares/verifyAuth");

// Rutas públicas
router.get("/", controller.getPosts);

// Rutas protegidas
router.post("/", verifyAuth, controller.createPost);
router.put("/:id", verifyAuth, controller.updatePost);
router.delete("/:id", verifyAuth, controller.deletePost);

module.exports = router;
```

#### `middlewares/` - Funciones Intermedias
- `verifyAuth.js` - Verificación de JWT tokens
- `validators/` - Validación de datos de entrada

**Ejemplo de middleware de autenticación:**
```javascript
const jwt = require("jsonwebtoken");

const verifyAuth = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
```

#### `helpers/` - Utilidades
- `responseHandler.js` - Formateo consistente de respuestas
- `getCurrentDate.js` - Utilidades de fecha

#### `__tests__/` - Testing
```
__tests__/
├── unit/
│   ├── controllers/     # Tests unitarios de controladores
│   ├── middlewares/     # Tests de middlewares
│   └── helpers/         # Tests de utilidades
└── integration/         # Tests de integración end-to-end
```

### 🗄️ Base de Datos - Diseño Relacional

#### Entidades Principales

**1. Users (Usuarios)**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile_pic VARCHAR(500),
  cover_pic VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2. Posts (Publicaciones)**
```sql
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  desc TEXT NOT NULL,
  img VARCHAR(500),
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**3. Relationships (Relaciones)**
```sql
CREATE TABLE relationships (
  id INT PRIMARY KEY AUTO_INCREMENT,
  follower_user_id INT NOT NULL,
  followed_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (followed_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_relationship (follower_user_id, followed_user_id)
);
```

**4. Stories (Historias)**
```sql
CREATE TABLE stories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  img VARCHAR(500) NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**5. Comments (Comentarios)**
```sql
CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  desc TEXT NOT NULL,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

**6. Likes**
```sql
CREATE TABLE likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  post_id INT,
  comment_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);
```

## 🎨 Frontend - Estructura Detallada

### 📁 `client/src/` - Directorio Principal

#### `main.jsx` - Punto de Entrada
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Montaje de la aplicación React
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### `App.jsx` - Componente Raíz
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Feed from './pages/Feed.jsx'
import Profile from './pages/Profile.jsx'
import Stories from './pages/Stories.jsx'
import Header from './components/Header.jsx'

export default function App() {
  return (
    <AuthProvider>           {/* Context de autenticación */}
      <BrowserRouter>        {/* Router de React */}
        <Header />           {/* Navegación global */}
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas */}
          <Route path="/" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/stories" element={<PrivateRoute><Stories /></PrivateRoute>} />
          <Route path="/profile/:userId" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

#### `context/AuthContext.jsx` - Estado Global
```jsx
import { createContext, useContext, useState, useEffect } from 'react'
import * as authService from '../services/auth.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)

  // Función de login
  const login = async (credentials) => {
    setLoading(true)
    try {
      const response = await authService.login(credentials)
      const { token: newToken, user: userData } = response.data

      setToken(newToken)
      setUser(userData)
      localStorage.setItem('token', newToken)

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Función de registro
  const register = async (userData) => {
    setLoading(true)
    try {
      const response = await authService.register(userData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Función de logout
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  // Verificar token al cargar la aplicación
  useEffect(() => {
    if (token) {
      // Verificar validez del token con la API
      authService.getUser()
        .then(response => setUser(response.data))
        .catch(() => logout())
    }
  }, [token])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

#### `components/` - Componentes Reutilizables

**Header.jsx - Navegación Principal**
```jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">Red Social</Link>

        {user && (
          <div className="navbar-nav ms-auto">
            <Link className="nav-link" to="/">Inicio</Link>
            <Link className="nav-link" to="/stories">Stories</Link>
            <Link className="nav-link" to={`/profile/${user.id}`}>
              Mi Perfil
            </Link>
            <button className="btn btn-outline-light ms-2" onClick={handleLogout}>
              Salir
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
```

#### `pages/` - Páginas de la Aplicación

**Estructura típica de una página:**
```jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import * as service from '../services/serviceName.js'

export default function PageName() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await service.getData()
      setData(response.data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center mt-5">Cargando...</div>
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div className="container mt-4">
      <h1>Título de la Página</h1>
      {/* Contenido de la página */}
    </div>
  )
}
```

#### `services/` - Comunicación con API

**Estructura de un servicio:**
```javascript
import http from '../api/http.js'

const service = {
  // Método GET
  async getAll(params = {}) {
    const response = await http.get('/endpoint', { params })
    return response
  },

  // Método POST
  async create(data) {
    const response = await http.post('/endpoint', data)
    return response
  },

  // Método PUT
  async update(id, data) {
    const response = await http.put(`/endpoint/${id}`, data)
    return response
  },

  // Método DELETE
  async delete(id) {
    const response = await http.delete(`/endpoint/${id}`)
    return response
  }
}

export default service
```

#### `api/http.js` - Configuración Axios
```javascript
import axios from 'axios'

// Crear instancia de Axios con configuración base
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  withCredentials: true, // Para enviar cookies
})

// Interceptor para agregar token JWT
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar errores de respuesta
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado, redirigir a login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default http
```

#### `__tests__/` - Testing del Frontend

**Configuración de tests (setup.jsx):**
```jsx
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock de axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }))
  }
}))

// Mock de react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    Link: ({ children, ...props }) => <a {...props}>{children}</a>,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: '/', search: '', hash: '', state: null })),
    useParams: vi.fn(() => ({})),
    BrowserRouter: vi.fn(({ children }) => children),
    Routes: vi.fn(({ children }) => children),
    Route: vi.fn(),
  }
})
```

**Ejemplo de test de componente:**
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Login from '../../pages/Login'

describe('Login Component', () => {
  it('debe renderizar el formulario de login', () => {
    render(<Login />)
    expect(screen.getByText(/Iniciar sesión/i)).toBeInTheDocument()
  })

  it('debe tener campos de email y password', () => {
    render(<Login />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })
})
```

## 🔄 Flujo de Datos

### Autenticación
1. **Frontend**: Usuario ingresa credenciales
2. **Servicio**: Envía datos a `/api/v1/auth/login`
3. **Controlador**: Valida credenciales, genera JWT
4. **Respuesta**: Token almacenado en localStorage
5. **Context**: Estado global actualizado

### Creación de Post
1. **Frontend**: Usuario escribe post y sube imagen
2. **Servicio**: Envía datos a `/api/v1/posts`
3. **Middleware**: Verifica autenticación JWT
4. **Controlador**: Valida datos, guarda en BD
5. **Respuesta**: Post creado, UI actualizada

### Feed de Posts
1. **Frontend**: Componente Feed se monta
2. **useEffect**: Llama a servicio getPosts
3. **Servicio**: GET `/api/v1/posts` con paginación
4. **Controlador**: Consulta BD con JOINs
5. **Respuesta**: Lista de posts con info de usuario
6. **Render**: Posts mostrados en la UI

## 🧪 Estrategia de Testing

### Backend (Jest)
- **Unit Tests**: Controladores, middlewares, helpers
- **Integration Tests**: Flujos completos end-to-end
- **Coverage**: Mínimo 80% de cobertura

### Frontend (Vitest)
- **Component Tests**: Renderizado, interacciones
- **Service Tests**: Llamadas API, manejo de errores
- **Integration Tests**: Flujos de usuario completos

## 🚀 Despliegue y DevOps

### Variables de Entorno
```env
# Backend
NODE_ENV=production
PORT=3001
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret

# Frontend
VITE_API_URL=https://your-api-domain.com/api/v1
```

### Build y Deployment
```bash
# Backend
npm run build
npm start

# Frontend
npm run build
# Servir archivos estáticos desde dist/
```

## 🔒 Seguridad

### Medidas Implementadas
- **Hashing de contraseñas**: bcryptjs
- **JWT tokens**: Autenticación stateless
- **Validación de entrada**: express-validator
- **CORS**: Control de orígenes permitidos
- **Helmet**: Headers de seguridad HTTP
- **Rate limiting**: Protección contra abuso

### Mejores Prácticas
- Nunca almacenar contraseñas en texto plano
- Usar HTTPS en producción
- Validar y sanitizar todas las entradas
- Implementar logging de seguridad
- Regularmente actualizar dependencias

## 📈 Escalabilidad

### Optimizaciones Implementadas
- **Paginación**: En listados largos
- **Índices de BD**: Para consultas frecuentes
- **Lazy loading**: Componentes cargados bajo demanda
- **Caching**: Para datos frecuentemente accedidos
- **Compresión**: Gzip para respuestas HTTP

### Estrategias Futuras
- **CDN**: Para assets estáticos
- **Redis**: Para caching de sesiones
- **Microservicios**: Separar funcionalidades
- **Load balancing**: Distribución de carga
- **Database sharding**: Para crecimiento masivo

## 🐛 Manejo de Errores

### Backend
```javascript
// Helper de respuestas consistente
const responseHandler = {
  success: (res, data, status = 200) => {
    res.status(status).json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  },

  error: (res, error, status = 500) => {
    console.error('Error:', error)
    res.status(status).json({
      success: false,
      message: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    })
  }
}
```

### Frontend
```jsx
const [error, setError] = useState('')
const [loading, setLoading] = useState(false)

try {
  setLoading(true)
  const response = await apiCall()
  // Procesar respuesta exitosa
} catch (error) {
  setError(error.response?.data?.message || 'Error desconocido')
} finally {
  setLoading(false)
}
```

## 🎯 Conclusión

Esta aplicación demuestra una arquitectura full-stack moderna con:

- **Separación clara** entre frontend y backend
- **Patrones de diseño** probados y escalables
- **Testing comprehensivo** para calidad de código
- **Documentación completa** para mantenibilidad
- **Seguridad robusta** y mejores prácticas
- **Experiencia de usuario** fluida y responsive

El código está estructurado para ser **mantenible**, **escalable** y **testeable**, siguiendo principios SOLID y mejores prácticas de desarrollo web moderno.</content>
<parameter name="filePath">/Users/svillagra/VLA/Curso Web Setiembre 2025/ProyectoCurso2/docs/GUIDE.md