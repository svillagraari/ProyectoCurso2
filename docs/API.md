# Documentación de la API

Esta documentación describe los endpoints disponibles en la API REST de la aplicación de red social.

## Base URL
```
http://localhost:3001/api/v1
```

## Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Incluye el token en el header de autorización:

```
Authorization: Bearer <tu_token_jwt>
```

## Endpoints

### 🔐 Autenticación (`/auth`)

#### Registrar Usuario
```http
POST /auth/register
```

**Body:**
```json
{
  "username": "string",
  "name": "string", 
  "email": "string",
  "password": "string"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "usuario123",
      "name": "Juan Pérez",
      "email": "juan@example.com"
    }
  }
}
```

#### Iniciar Sesión
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "usuario123",
      "name": "Juan Pérez",
      "email": "juan@example.com"
    }
  }
}
```

### 👥 Usuarios (`/users`)

#### Obtener Usuario
```http
GET /users/:userId
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "usuario123",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "profile_pic": "url_imagen",
      "cover_pic": "url_portada"
    }
  }
}
```

#### Actualizar Usuario
```http
PUT /users
```
*Requiere autenticación*

**Body:**
```json
{
  "name": "string (opcional)",
  "username": "string (opcional)",
  "email": "string (opcional)",
  "profile_pic": "string (opcional)",
  "cover_pic": "string (opcional)"
}
```

#### Buscar Usuarios
```http
GET /users?search=nombre_o_usuario
```
*Requiere autenticación*

**Query Parameters:**
- `search`: Término de búsqueda
- `page`: Número de página (opcional, default: 1)
- `limit`: Límite por página (opcional, default: 5)

### 📝 Posts (`/posts`)

#### Obtener Posts del Feed
```http
GET /posts
```
*Requiere autenticación*

**Query Parameters:**
- `page`: Número de página (opcional, default: 1)
- `limit`: Límite por página (opcional, default: 5)

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Posts fetched successfully",
  "data": {
    "posts": [
      {
        "id": 1,
        "desc": "Descripción del post",
        "img": "url_imagen",
        "created_at": "2024-01-15 10:30:00",
        "user_id": 1,
        "name": "Juan Pérez"
      }
    ]
  }
}
```

#### Crear Post
```http
POST /posts
```
*Requiere autenticación*

**Body:**
```json
{
  "desc": "string",
  "img": "string"
}
```

#### Eliminar Post
```http
DELETE /posts/:postId
```
*Requiere autenticación*

### 💬 Comentarios (`/posts/:postId/comments`)

#### Obtener Comentarios
```http
GET /posts/:postId/comments
```
*Requiere autenticación*

#### Crear Comentario
```http
POST /posts/:postId/comments
```
*Requiere autenticación*

**Body:**
```json
{
  "desc": "string"
}
```

#### Eliminar Comentario
```http
DELETE /posts/:postId/comments/:commentId
```
*Requiere autenticación*

### ❤️ Likes (`/posts/:postId/likes`)

#### Obtener Likes
```http
GET /posts/:postId/likes
```
*Requiere autenticación*

#### Toggle Like
```http
POST /posts/:postId/likes
```
*Requiere autenticación*

### 📖 Stories (`/stories`)

#### Obtener Stories
```http
GET /stories
```
*Requiere autenticación*

#### Crear Story
```http
POST /stories
```
*Requiere autenticación*

**Body:**
```json
{
  "img": "string"
}
```

#### Eliminar Story
```http
DELETE /stories/:storyId
```
*Requiere autenticación*

### 🤝 Relaciones (`/relationships`)

#### Obtener Seguidores
```http
GET /relationships?userId=:userId
```
*Requiere autenticación*

#### Seguir Usuario
```http
POST /relationships
```
*Requiere autenticación*

**Body:**
```json
{
  "followedUserId": "number"
}
```

#### Dejar de Seguir
```http
DELETE /relationships/:userId
```
*Requiere autenticación*

## Códigos de Estado

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Validación

Todos los endpoints implementan validación usando `express-validator`. Los errores de validación retornan código 400 con detalles del error.

## Paginación

Los endpoints que soportan paginación utilizan:
- `page`: Número de página (empezando en 1)
- `limit`: Número de elementos por página

## Swagger UI

Para explorar la API de forma interactiva, visita:
```
http://localhost:3001/api-docs
```
