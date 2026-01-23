# Documentación del Frontend

## Descripción

El frontend está desarrollado con **React 19.2.0** y **Vite** como bundler, utilizando **Bootstrap 5** para el diseño y **React Router** para la navegación.

## Arquitectura

### Estructura de Carpetas

```
client/src/
├── components/          # Componentes reutilizables
│   └── Header.jsx      # Navegación principal
├── pages/              # Páginas de la aplicación
│   ├── Login.jsx       # Página de inicio de sesión
│   ├── Register.jsx    # Página de registro
│   ├── Feed.jsx        # Feed principal de posts
│   ├── Profile.jsx     # Perfil de usuario
│   └── Stories.jsx     # Visualización de stories
├── context/            # Context API de React
│   └── AuthContext.jsx # Estado de autenticación global
├── services/           # Servicios para comunicación con API
│   ├── auth.js         # Autenticación
│   ├── posts.js        # Gestión de posts
│   ├── users.js        # Gestión de usuarios
│   ├── stories.js      # Gestión de stories
│   └── relationships.js # Relaciones entre usuarios
├── api/                # Configuración HTTP
│   └── http.js         # Configuración de Axios
├── App.jsx             # Componente principal
├── App.css             # Estilos personalizados
├── index.css           # Estilos globales
└── main.jsx            # Punto de entrada
```

## Rutas

### Configuración de Rutas

```jsx
// App.jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/" element={<PrivateRoute><Feed /></PrivateRoute>} />
  <Route path="/stories" element={<PrivateRoute><Stories /></PrivateRoute>} />
  <Route path="/profile/:userId" element={<PrivateRoute><Profile /></PrivateRoute>} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### Rutas Protegidas

Las rutas principales están protegidas por el componente `PrivateRoute`:

```jsx
function PrivateRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}
```

## Estado Global - AuthContext

### Contexto de Autenticación

```jsx
// AuthContext.jsx
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(token) || )
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(user)
    return raw ? JSON.parse(raw) : null
  })
  
  // Métodos: login, register, logout
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error(useAuth