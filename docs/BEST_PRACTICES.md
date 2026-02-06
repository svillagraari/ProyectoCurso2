# 📋 Mejores Prácticas y Convenciones

Este documento establece las mejores prácticas, convenciones de código y estándares que se siguen en este proyecto para mantener la calidad, consistencia y mantenibilidad del código.

## 🎯 Principios Generales

### SOLID Principles
- **S** - Single Responsibility: Cada módulo/clase tiene una única responsabilidad
- **O** - Open/Closed: Código abierto a extensión, cerrado a modificación
- **L** - Liskov Substitution: Subtipos deben ser sustituibles por sus tipos base
- **I** - Interface Segregation: Interfaces específicas mejor que generales
- **D** - Dependency Inversion: Depender de abstracciones, no de concretos

### DRY (Don't Repeat Yourself)
- Evitar código duplicado
- Crear funciones/utilidades reutilizables
- Usar composición sobre herencia

### KISS (Keep It Simple, Stupid)
- Mantener la simplicidad
- Soluciones simples son mejores que complejas
- Evitar over-engineering

## 📁 Estructura de Archivos y Directorios

### Backend - Convenciones de Nombres

```
src/
├── controllers/          # PascalCase para archivos
│   ├── auth.controller.js
│   ├── posts.controller.js
│   └── users.controller.js
├── routes/              # kebab-case para rutas
│   ├── auth.route.js
│   ├── posts.route.js
│   └── users.route.js
├── middlewares/         # kebab-case
│   ├── verify-auth.js
│   └── validators/
├── helpers/             # kebab-case
│   ├── response-handler.js
│   └── date-utils.js
└── __tests__/           # kebab-case
    ├── unit/
    └── integration/
```

### Frontend - Convenciones de Nombres

```
client/src/
├── components/          # PascalCase para componentes
│   ├── Header.jsx
│   ├── PostCard.jsx
│   └── UserProfile.jsx
├── pages/              # PascalCase para páginas
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Feed.jsx
├── context/            # PascalCase para contextos
│   └── AuthContext.jsx
├── services/           # camelCase para servicios
│   ├── auth.js
│   ├── posts.js
│   └── users.js
└── __tests__/          # kebab-case
    ├── components/
    ├── pages/
    └── services/
```

## 🔧 Convenciones de Código

### JavaScript/Node.js

#### Nombres de Variables y Funciones
```javascript
// ✅ Correcto
const userName = 'john_doe'
const isAuthenticated = true
const currentUser = getCurrentUser()

function getUserById(userId) {
  // ...
}

function validateUserInput(input) {
  // ...
}

// ❌ Incorrecto
const username = 'john_doe'        // No usa camelCase consistente
const isauth = true               // No descriptivo
const user = getCurrentUser()     // No descriptivo
```

#### Constantes
```javascript
// ✅ Constantes en MAYÚSCULAS con guiones bajos
const JWT_SECRET = 'your-secret-key'
const MAX_FILE_SIZE = 5 * 1024 * 1024  // 5MB
const DEFAULT_PAGE_SIZE = 10

// ✅ Constantes de objetos
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
} as const
```

#### Funciones
```javascript
// ✅ Función nombrada con parámetros descriptivos
function createUser(userData) {
  const { name, email, password } = userData

  // Validación temprana
  if (!name || !email || !password) {
    throw new Error('Missing required fields')
  }

  // Lógica principal
  const hashedPassword = hashPassword(password)
  const user = { name, email, password: hashedPassword }

  return saveUser(user)
}

// ✅ Arrow functions para callbacks simples
const users = userList.filter(user => user.isActive)
const userNames = users.map(user => user.name)

// ✅ Funciones async/await
async function getUserPosts(userId) {
  try {
    const user = await getUser(userId)
    const posts = await getPostsByUser(userId)
    return { user, posts }
  } catch (error) {
    console.error('Error fetching user posts:', error)
    throw error
  }
}
```

#### Clases y Constructores
```javascript
// ✅ Clase con constructor y métodos
class UserService {
  constructor(database) {
    this.database = database
  }

  async findById(id) {
    const user = await this.database.users.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  async create(userData) {
    // Validación
    this.validateUserData(userData)

    // Creación
    const user = {
      ...userData,
      createdAt: new Date(),
      isActive: true
    }

    return this.database.users.create(user)
  }

  validateUserData(data) {
    const required = ['name', 'email', 'password']
    const missing = required.filter(field => !data[field])

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }
  }
}
```

### React/JavaScript (Frontend)

#### Componentes
```jsx
// ✅ Componente funcional con hooks
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function UserProfile({ userId }) {
  const { user: currentUser } = useAuth()
  const [profileUser, setProfileUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUserProfile()
  }, [userId])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const response = await getUser(userId)
      setProfileUser(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!profileUser) return <div>User not found</div>

  return (
    <div className="user-profile">
      <h1>{profileUser.name}</h1>
      <p>{profileUser.email}</p>
      {/* Más contenido */}
    </div>
  )
}

// ✅ Props con destructuring y default values
function PostCard({ post, onLike, onComment, showActions = true }) {
  const { id, content, author, likes, comments } = post

  return (
    <div className="post-card">
      <div className="post-header">
        <h3>{author.name}</h3>
        <span>{formatDate(post.createdAt)}</span>
      </div>
      <div className="post-content">
        {content}
      </div>
      {showActions && (
        <div className="post-actions">
          <button onClick={() => onLike(id)}>
            Like ({likes.length})
          </button>
          <button onClick={() => onComment(id)}>
            Comment ({comments.length})
          </button>
        </div>
      )}
    </div>
  )
}
```

#### Custom Hooks
```jsx
// ✅ Custom hook para lógica reutilizable
import { useState, useEffect } from 'react'

export function usePosts(userId = null) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPosts = async () => {
    try {
      setLoading(true)
      const response = await postsService.getAll({ userId })
      setPosts(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (postData) => {
    const response = await postsService.create(postData)
    setPosts(prev => [response.data, ...prev])
    return response.data
  }

  useEffect(() => {
    loadPosts()
  }, [userId])

  return {
    posts,
    loading,
    error,
    createPost,
    refreshPosts: loadPosts
  }
}
```

### Context API
```jsx
// ✅ Context con reducer pattern
import { createContext, useContext, useReducer } from 'react'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: '' }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true
      }
    case 'LOGIN_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false
      }
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        loading: false,
        error: '',
        isAuthenticated: false
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    loading: false,
    error: '',
    isAuthenticated: false
  })

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await authService.login(credentials)
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data
      })
    } catch (error) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error.message
      })
    }
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

## 🧪 Testing Conventions

### Estructura de Tests
```javascript
// ✅ Estructura clara y descriptiva
describe('AuthService', () => {
  describe('login', () => {
    it('should return user data and token on successful login', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password' }
      const mockResponse = {
        data: { user: { id: 1, name: 'Test' }, token: 'jwt-token' }
      }
      mockedAxios.post.mockResolvedValue(mockResponse)

      // Act
      const result = await authService.login(credentials)

      // Assert
      expect(result).toEqual(mockResponse.data)
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', credentials)
    })

    it('should throw error on invalid credentials', async () => {
      // Arrange
      const credentials = { email: 'wrong@email.com', password: 'wrong' }
      const mockError = new Error('Invalid credentials')
      mockedAxios.post.mockRejectedValue(mockError)

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials')
    })
  })
})
```

### Mocks y Spies
```javascript
// ✅ Mocks claros y específicos
import { vi } from 'vitest'

const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn()
}

vi.mock('../services/auth', () => ({
  default: mockAuthService
}))

// ✅ Setup y teardown apropiados
describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call login service on form submit', async () => {
    // Test implementation
  })
})
```

## 📝 Documentación

### JSDoc Comments
```javascript
/**
 * Creates a new user in the database
 * @param {Object} userData - User information
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password (will be hashed)
 * @returns {Promise<Object>} Created user object (without password)
 * @throws {Error} If validation fails or user already exists
 */
async function createUser(userData) {
  // Implementation
}

/**
 * Custom hook for managing posts state
 * @param {number} [userId] - Optional user ID to filter posts
 * @returns {Object} Posts state and actions
 * @returns {Array} .posts - Array of post objects
 * @returns {boolean} .loading - Loading state
 * @returns {string} .error - Error message if any
 * @returns {Function} .createPost - Function to create new post
 * @returns {Function} .refreshPosts - Function to reload posts
 */
export function usePosts(userId) {
  // Implementation
}
```

### README y Documentación
```markdown
<!-- ✅ README claro y completo -->
# Mi Proyecto

Breve descripción del proyecto y su propósito.

## 🚀 Inicio Rápido

```bash
# Instalación
npm install

# Desarrollo
npm run dev

# Tests
npm test

# Producción
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── components/     # Componentes React reutilizables
├── pages/         # Páginas de la aplicación
├── services/      # Llamadas a API
├── context/       # Context API para estado global
└── utils/         # Utilidades y helpers
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run test` - Ejecuta tests
- `npm run lint` - Verifica estilo de código
```

## 🔒 Seguridad

### Validación de Entrada
```javascript
// ✅ Validación en backend
const validateUserInput = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
  })

  return schema.validate(data)
}

// ✅ Sanitización
const sanitizeInput = (input) => {
  return validator.escape(input.trim())
}
```

### Autenticación y Autorización
```javascript
// ✅ Middleware de autorización basado en roles
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    next()
  }
}

// Uso
router.post('/admin/users', authorize(['admin']), createUser)
```

## 🚀 Performance

### Optimizaciones Frontend
```jsx
// ✅ Lazy loading de componentes
const LazyProfile = lazy(() => import('./pages/Profile'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/profile" element={<LazyProfile />} />
      </Routes>
    </Suspense>
  )
}

// ✅ Memoización de componentes caros
const PostCard = memo(({ post, onLike }) => {
  return (
    <div className="post-card">
      {/* Contenido del post */}
    </div>
  )
})
```

### Optimizaciones Backend
```javascript
// ✅ Paginación para listas grandes
const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit

  const posts = await Post.findAndCountAll({
    limit,
    offset,
    include: [{ model: User, attributes: ['name', 'profilePic'] }]
  })

  res.json({
    posts: posts.rows,
    pagination: {
      page,
      limit,
      total: posts.count,
      pages: Math.ceil(posts.count / limit)
    }
  })
}

// ✅ Caching con Redis
const cache = require('redis').createClient()

const getCachedUser = async (userId) => {
  const cacheKey = `user:${userId}`

  // Intentar obtener de cache
  const cached = await cache.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Obtener de BD y cachear
  const user = await User.findById(userId)
  if (user) {
    await cache.setex(cacheKey, 3600, JSON.stringify(user)) // 1 hora
  }

  return user
}
```

## 🔄 Manejo de Errores

### Error Handling Patterns
```javascript
// ✅ Custom error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
    this.statusCode = 400
  }
}

class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
    this.statusCode = 404
  }
}

// ✅ Error middleware centralizado
const errorHandler = (err, req, res, next) => {
  console.error(err)

  // Errores personalizados
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.field && { field: err.field })
    })
  }

  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors
    })
  }

  // Error interno del servidor
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
}
```

## 📊 Logging

### Winston Logger Setup
```javascript
// ✅ Configuración de logging estructurado
const winston = require('winston')

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// En desarrollo también loggear a consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

module.exports = logger
```

### Uso del Logger
```javascript
// ✅ Logging consistente
const logger = require('../utils/logger')

// Información general
logger.info('User login attempt', { email: user.email, ip: req.ip })

// Errores
logger.error('Database connection failed', {
  error: err.message,
  stack: err.stack,
  query: sqlQuery
})

// Warnings
logger.warn('Rate limit exceeded', {
  userId: req.user.id,
  endpoint: req.path,
  attempts: attemptsCount
})
```

## 🔧 CI/CD

### GitHub Actions Workflow
```yaml
# ✅ Pipeline completo
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: echo "Deploy logic here"
```

## 📋 Checklist de Code Review

### Backend
- [ ] Funciones tienen una sola responsabilidad
- [ ] Validación de entrada implementada
- [ ] Manejo de errores apropiado
- [ ] Tests unitarios e integración incluidos
- [ ] Documentación JSDoc completa
- [ ] Logging apropiado para debugging
- [ ] No hay datos sensibles en logs
- [ ] Consultas SQL optimizadas
- [ ] Paginación implementada para listas

### Frontend
- [ ] Componentes son reutilizables
- [ ] Estado manejado eficientemente
- [ ] Loading states implementados
- [ ] Error boundaries usados
- [ ] Accesibilidad (ARIA labels, keyboard navigation)
- [ ] Responsive design
- [ ] Tests de componentes incluidos
- [ ] No hay memory leaks (cleanup en useEffect)
- [ ] Imágenes optimizadas y lazy loaded

### General
- [ ] Código sigue convenciones de nombres
- [ ] No hay código comentado innecesario
- [ ] Variables y funciones bien nombradas
- [ ] DRY principle seguido
- [ ] Security best practices implementadas
- [ ] Performance optimizada
- [ ] Documentación actualizada

Esta guía establece los estándares para mantener código de alta calidad, mantenible y escalable en el proyecto.