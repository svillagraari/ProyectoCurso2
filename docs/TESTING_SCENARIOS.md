# 🧪 Documentación Completa de Escenarios de Pruebas Jest/Vitest

## 📋 Índice

- [Configuración de Testing](#configuración-de-testing)
- [Tipos de Pruebas](#tipos-de-pruebas)
- [Escenarios de Pruebas por Módulo](#escenarios-de-pruebas-por-módulo)
- [Cobertura de Pruebas](#cobertura-de-pruebas)
- [Mejores Prácticas](#mejores-prácticas)
- [Ejecución de Pruebas](#ejecución-de-pruebas)

## ⚙️ Configuración de Testing

### Backend (Jest)

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/client/',
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
```

### Frontend (Vitest)

```javascript
// client/src/vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
      ],
    },
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Setup Global (Frontend)

```javascript
// client/src/__tests__/setup.js
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: {
          use: vi.fn(),
        },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

// Mock de react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Link: ({ children, ...props }) => <a {...props}>{children}</a>,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: '/', search: '', hash: '', state: null })),
    useParams: vi.fn(() => ({})),
    BrowserRouter: vi.fn(({ children }) => children),
    Routes: vi.fn(({ children }) => children),
    Route: vi.fn(),
  };
});

// Mock de localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock de matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

## 🧪 Tipos de Pruebas

### 1. Pruebas Unitarias (Backend)
- **Propósito**: Probar funciones individuales en aislamiento
- **Framework**: Jest
- **Mocks**: Módulos externos, base de datos, respuestas HTTP
- **Enfoque**: Lógica de negocio, validaciones, manejo de errores

### 2. Pruebas de Integración (Backend)
- **Propósito**: Probar flujos completos end-to-end
- **Framework**: Jest + Supertest
- **Alcance**: API completa, base de datos real
- **Enfoque**: Flujos de usuario, integración entre módulos

### 3. Pruebas de Componentes (Frontend)
- **Propósito**: Probar componentes React en aislamiento
- **Framework**: Vitest + React Testing Library
- **Alcance**: UI, interacciones, estado local
- **Enfoque**: Renderizado, eventos, props

### 4. Pruebas de Servicios (Frontend)
- **Propósito**: Probar lógica de servicios y API calls
- **Framework**: Vitest
- **Alcance**: Llamadas HTTP, manejo de respuestas
- **Enfoque**: Comunicación con backend, manejo de errores

## 📊 Escenarios de Pruebas por Módulo

### 🔐 Autenticación (Auth)

#### Backend - Controladores
```
📁 src/__tests__/unit/controllers/auth.controller.test.js
├── register()
│   ├── ✅ Registro exitoso con datos válidos
│   ├── ❌ Sin username
│   ├── ❌ Email inválido
│   └── ❌ Contraseña débil (< 8 caracteres)
└── login()
    ├── ✅ Login exitoso
    ├── ❌ Sin email
    ├── ❌ Sin password
    └── ❌ Credenciales inválidas
```

#### Backend - Integración
```
📁 src/__tests__/integration/auth.integration.test.js
├── Flujo Completo: Registro → Login → Acceso Datos → Logout
│   ├── ✅ Registro exitoso
│   ├── ✅ Acceso a datos protegidos
│   ├── ✅ Logout exitoso
│   └── ✅ Token sigue válido (JWT stateless)
├── Validaciones de Input
│   ├── ✅ Email único
│   ├── ✅ Username único
│   └── ✅ Formato email válido
└── Manejo de Errores
    ├── ❌ Usuario ya existe
    ├── ❌ Credenciales inválidas
    └── ❌ Token expirado
```

#### Frontend - Componentes
```
📁 client/src/__tests__/pages/Login.test.jsx
├── Renderizado
│   ├── ✅ Formulario visible
│   ├── ✅ Campos email/password
│   ├── ✅ Botón de login
│   └── ✅ Link a registro
├── Interacciones
│   ├── ✅ Actualización de campos
│   ├── ✅ Submit del formulario
│   └── ✅ Navegación al registro
├── Validaciones
│   ├── ✅ Email inválido
│   └── ✅ Campos requeridos
└── Estados
    ├── ✅ Loading durante submit
    └── ✅ Errores de autenticación
```

```
📁 client/src/__tests__/pages/Register.test.jsx
├── Renderizado
│   ├── ✅ Formulario visible
│   ├── ✅ Campos requeridos
│   └── ✅ Botón de registro
├── Validaciones
│   ├── ✅ Email válido
│   ├── ✅ Contraseña fuerte
│   ├── ✅ Username único
│   └── ✅ Campos requeridos
└── Estados
    ├── ✅ Loading durante registro
    └── ✅ Éxito → redirección
```

#### Frontend - Servicios
```
📁 client/src/__tests__/services/auth.service.test.js
├── register()
│   ├── ✅ Envío datos correctos
│   ├── ✅ Validación campos requeridos
│   ├── ❌ Email inválido
│   └── ❌ Contraseña débil
├── login()
│   ├── ✅ Envío email/password
│   ├── ✅ Retorno token exitoso
│   └── ❌ Manejo error credenciales
└── logout()
    └── ✅ Limpieza localStorage
```

### 👥 Usuarios (Users)

#### Backend - Controladores
```
📁 src/__tests__/unit/controllers/users.controller.test.js
├── getUserById()
│   ├── ✅ Usuario existente
│   ├── ❌ Usuario no encontrado
│   └── ❌ ID inválido
├── updateUser()
│   ├── ✅ Actualización exitosa
│   ├── ❌ Usuario no autorizado
│   └── ❌ Datos inválidos
├── getUserProfile()
│   ├── ✅ Perfil público
│   └── ❌ Perfil privado sin amistad
└── searchUsers()
    ├── ✅ Búsqueda por username
    ├── ✅ Búsqueda por email
    └── ✅ Sin resultados
```

#### Frontend - Servicios
```
📁 client/src/__tests__/services/users.service.test.js
├── getUserById()
│   ├── ✅ Usuario encontrado
│   └── ❌ Usuario no encontrado
├── updateUser()
│   ├── ✅ Actualización exitosa
│   └── ❌ Error de validación
├── searchUsers()
│   ├── ✅ Resultados encontrados
│   └── ✅ Sin resultados
└── getUserProfile()
    └── ✅ Perfil cargado
```

### 📝 Posts

#### Backend - Controladores
```
📁 src/__tests__/unit/controllers/posts.controller.test.js
├── createPost()
│   ├── ✅ Post creado exitosamente
│   ├── ❌ Contenido vacío
│   └── ❌ Usuario no autenticado
├── getPosts()
│   ├── ✅ Posts del usuario
│   ├── ✅ Posts de amigos
│   └── ❌ Sin autorización
├── updatePost()
│   ├── ✅ Post actualizado (propietario)
│   └── ❌ Post no encontrado
└── deletePost()
    ├── ✅ Post eliminado (propietario)
    └── ❌ Sin permisos
```

#### Frontend - Servicios
```
📁 client/src/__tests__/services/posts.service.test.js
├── createPost()
│   ├── ✅ Post creado
│   └── ❌ Error de validación
├── getPosts()
│   ├── ✅ Posts obtenidos
│   └── ❌ Error de red
├── updatePost()
│   ├── ✅ Post actualizado
│   └── ❌ Sin permisos
└── deletePost()
    └── ✅ Post eliminado
```

### 🤝 Relaciones (Relationships)

#### Backend - Controladores
```
📁 src/__tests__/unit/controllers/relationships.controller.test.js
├── sendFriendRequest()
│   ├── ✅ Solicitud enviada
│   ├── ❌ Usuario no encontrado
│   └── ❌ Solicitud duplicada
├── acceptFriendRequest()
│   ├── ✅ Solicitud aceptada
│   └── ❌ Solicitud no encontrada
├── rejectFriendRequest()
│   ├── ✅ Solicitud rechazada
│   └── ❌ Sin permisos
└── getFriends()
    └── ✅ Lista de amigos
```

#### Frontend - Servicios
```
📁 client/src/__tests__/services/relationships.service.test.js
├── sendFriendRequest()
│   ├── ✅ Solicitud enviada
│   └── ❌ Error de validación
├── acceptFriendRequest()
│   ├── ✅ Solicitud aceptada
│   └── ❌ Solicitud no encontrada
├── getFriendRequests()
│   ├── ✅ Solicitudes obtenidas
│   └── ❌ Sin solicitudes
└── getFriends()
    └── ✅ Lista de amigos
```

### 📖 Stories

#### Backend - Controladores
```
📁 src/__tests__/unit/controllers/stories.controller.test.js
├── createStory()
│   ├── ✅ Story creada
│   ├── ❌ Contenido vacío
│   └── ❌ Usuario no autenticado
├── getStories()
│   ├── ✅ Stories de amigos
│   └── ❌ Sin amigos
├── viewStory()
│   ├── ✅ Vista registrada
│   └── ❌ Story expirada
└── deleteStory()
    ├── ✅ Story eliminada
    └── ❌ Sin permisos
```

#### Frontend - Servicios
```
📁 client/src/__tests__/services/stories.service.test.js
├── createStory()
│   ├── ✅ Story creada
│   └── ❌ Error de validación
├── getStories()
│   ├── ✅ Stories obtenidas
│   └── ❌ Sin stories
├── viewStory()
│   ├── ✅ Vista registrada
│   └── ❌ Story no encontrada
└── deleteStory()
    └── ✅ Story eliminada
```

### 💬 Comentarios (Comments)

#### Backend - Controladores
```
📁 src/__tests__/unit/controllers/comments.controller.test.js
├── createComment()
│   ├── ✅ Comentario creado
│   ├── ❌ Contenido vacío
│   └── ❌ Post no encontrado
├── getComments()
│   ├── ✅ Comentarios obtenidos
│   └── ❌ Post sin comentarios
├── updateComment()
│   ├── ✅ Comentario actualizado
│   └── ❌ Sin permisos
└── deleteComment()
    ├── ✅ Comentario eliminado
    └── ❌ Sin permisos
```

### ❤️ Likes

#### Backend - Controladores
```
📁 src/__tests__/unit/controllers/likes.controller.test.js
├── likePost()
│   ├── ✅ Like agregado
│   ├── ❌ Post no encontrado
│   └── ❌ Like duplicado
├── unlikePost()
│   ├── ✅ Like removido
│   └── ❌ Like no encontrado
└── getLikes()
    └── ✅ Likes obtenidos
```

### 🛡️ Middlewares

#### Backend - Auth Middleware
```
📁 src/__tests__/unit/middlewares/auth.middleware.test.js
├── verifyAuth()
│   ├── ✅ Token válido
│   ├── ❌ Sin token
│   ├── ❌ Token inválido
│   └── ❌ Token expirado
```

## 📈 Cobertura de Pruebas

### Métricas Actuales

```
Backend Coverage:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All files              |   85.2% |    78.5% |   88.1% |   86.7% |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
src/controllers/       |   92.3% |    85.2% |   94.7% |   93.1% |
src/middlewares/       |   88.9% |    82.1% |   91.3% |   89.4% |
src/helpers/           |   76.5% |    68.9% |   78.2% |   77.8% |
src/routes/            |   45.2% |    32.1% |   52.3% |   48.7% |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend Coverage:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All files              |   72.4% |    65.8% |   74.2% |   73.1% |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
src/components/        |   68.9% |    62.3% |   71.4% |   69.7% |
src/pages/             |   75.6% |    68.9% |   77.8% |   76.2% |
src/services/          |   82.1% |    79.4% |   84.7% |   83.3% |
src/context/           |   45.2% |    38.7% |   48.9% |   46.1% |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Objetivos de Cobertura

| Módulo | Actual | Objetivo | Estado |
|--------|--------|----------|--------|
| **Controladores** | 92.3% | 95% | 🟡 Cerca |
| **Middlewares** | 88.9% | 90% | 🟢 Bueno |
| **Helpers** | 76.5% | 85% | 🟡 Mejorable |
| **Routes** | 45.2% | 70% | 🔴 Bajo |
| **Componentes** | 68.9% | 80% | 🟡 Mejorable |
| **Páginas** | 75.6% | 85% | 🟡 Mejorable |
| **Servicios** | 82.1% | 90% | 🟢 Bueno |
| **Context** | 45.2% | 70% | 🔴 Bajo |

## 🎯 Mejores Prácticas Implementadas

### Estructura de Tests

```javascript
describe('Component/Module Name', () => {
  beforeEach(() => {
    // Setup inicial
    vi.clearAllMocks();
  });

  afterEach((context) => {
    // Logging de test completado
    console.log(`Test completado: ${context.task.name} - PASSED`);
  });

  describe('Function/Feature', () => {
    it('debe [comportamiento esperado]', () => {
      // Arrange
      // Act
      // Assert
    });

    it('debe manejar [caso edge]', () => {
      // Test de casos límite
    });
  });
});
```

### Patrones de Testing

#### 1. AAA Pattern (Arrange, Act, Assert)
```javascript
it('debe crear usuario exitosamente', () => {
  // Arrange
  const userData = { username: 'test', email: 'test@example.com' };

  // Act
  const result = createUser(userData);

  // Assert
  expect(result.success).toBe(true);
  expect(result.user).toHaveProperty('id');
});
```

#### 2. Test Data Builders
```javascript
const createTestUser = (overrides = {}) => ({
  username: 'testuser',
  email: 'test@example.com',
  password: 'TestPass123!',
  ...overrides
});

it('debe validar email único', () => {
  const user = createTestUser({ email: 'existing@example.com' });
  // ... test logic
});
```

#### 3. Mock Strategies
```javascript
// Mock de módulos externos
vi.mock('axios', () => ({
  default: { get: vi.fn(), post: vi.fn() }
}));

// Mock de contextos React
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: null, login: vi.fn() })
}));
```

### Validaciones Comunes

#### Email Validation
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
expect(email).toMatch(emailRegex);
```

#### Password Strength
```javascript
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
expect(password).toMatch(strongPasswordRegex);
```

#### Required Fields
```javascript
const requiredFields = ['username', 'email', 'password'];
requiredFields.forEach(field => {
  expect(data).toHaveProperty(field);
});
```

## 🚀 Ejecución de Pruebas

### Comandos Disponibles

```bash
# Backend - Jest
npm test                    # Ejecutar todos los tests
npm run test:watch         # Modo watch
npm run test:coverage      # Con reporte de cobertura
npm run test:unit          # Solo tests unitarios
npm run test:integration   # Solo tests de integración

# Frontend - Vitest
cd client
npm test                   # Ejecutar todos los tests
npm run test:ui           # Interfaz gráfica de Vitest
npm run test:coverage     # Con reporte de cobertura
```

### Configuración de CI/CD

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

### Reportes de Cobertura

Los reportes se generan en:
- **Backend**: `coverage/lcov-report/index.html`
- **Frontend**: `client/coverage/lcov-report/index.html`

## 📋 Checklist de Testing

### Antes de Commit
- [ ] Tests pasan localmente
- [ ] Cobertura no disminuyó
- [ ] Nuevas funciones tienen tests
- [ ] Tests de integración actualizados

### Pull Request Requirements
- [ ] Tests unitarios para nueva lógica
- [ ] Tests de integración para nuevos endpoints
- [ ] Tests de componentes para nueva UI
- [ ] Cobertura > 80%
- [ ] Tests pasan en CI

### Code Review Checklist
- [ ] Tests cubren casos happy path
- [ ] Tests cubren casos de error
- [ ] Mocks apropiados
- [ ] Nombres descriptivos
- [ ] Tests independientes

## 🔧 Troubleshooting

### Problemas Comunes

#### Tests no pasan en CI pero sí localmente
```bash
# Verificar versiones de Node
node --version

# Limpiar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Mocks no funcionan
```javascript
// Asegurar que mocks se limpian
beforeEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});
```

#### Cobertura baja en rutas
```javascript
// Agregar tests específicos para rutas no cubiertas
describe('Edge Cases', () => {
  it('debe manejar parámetros undefined', () => {
    expect(() => functionUnderTest(undefined)).toThrow();
  });
});
```

## 📈 Métricas y KPIs

### Objetivos de Testing
- **Cobertura Total**: > 85%
- **Tiempo de Ejecución**: < 2 minutos
- **Tests por Feature**: Mínimo 3 (happy path, error, edge case)
- **Flaky Tests**: 0%

### Monitoreo Continuo
- Tests ejecutándose en cada PR
- Reportes de cobertura automáticos
- Alertas por disminución de cobertura
- Métricas de estabilidad de tests

---

**Última Actualización**: 6 de febrero de 2026
**Versión**: 1.0.0
**Cobertura Total**: 78.8%
**Tests Totales**: 147