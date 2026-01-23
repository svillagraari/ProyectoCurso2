# Esquema de Base de Datos

## Descripción

La aplicación utiliza MySQL como sistema de gestión de base de datos. A continuación se describe el esquema de las tablas principales.

## Tablas

### 👤 users
Almacena la información de los usuarios registrados.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile_pic VARCHAR(500) DEFAULT NULL,
  cover_pic VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único del usuario
- `username`: Nombre de usuario único
- `name`: Nombre completo del usuario
- `email`: Correo electrónico único
- `password`: Contraseña hasheada con bcrypt
- `profile_pic`: URL de la foto de perfil (opcional)
- `cover_pic`: URL de la foto de portada (opcional)
- `created_at`: Fecha de registro

### 📝 posts
Almacena las publicaciones de los usuarios.

```sql
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  desc TEXT NOT NULL,
  img VARCHAR(500) DEFAULT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Campos:**
- `id`: Identificador único del post
- `desc`: Descripción o contenido del post
- `img`: URL de imagen asociada (opcional)
- `user_id`: ID del usuario que creó el post
- `created_at`: Fecha de creación

### 💬 comments
Almacena los comentarios en los posts.

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

**Campos:**
- `id`: Identificador único del comentario
- `desc`: Contenido del comentario
- `user_id`: ID del usuario que comentó
- `post_id`: ID del post comentado
- `created_at`: Fecha de creación

### ❤️ likes
Almacena los "me gusta" de los posts.

```sql
CREATE TABLE likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_like (user_id, post_id)
);
```

**Campos:**
- `id`: Identificador único del like
- `user_id`: ID del usuario que dio like
- `post_id`: ID del post que recibió like
- `created_at`: Fecha de creación
- **Constraint**: Un usuario solo puede dar like una vez por post

### 📖 stories
Almacena las historias temporales de los usuarios.

```sql
CREATE TABLE stories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  img VARCHAR(500) NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Campos:**
- `id`: Identificador único de la historia
- `img`: URL de la imagen de la historia
- `user_id`: ID del usuario que creó la historia
- `created_at`: Fecha de creación

### 🤝 relationships
Almacena las relaciones de seguimiento entre usuarios.

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

**Campos:**
- `id`: Identificador único de la relación
- `follower_user_id`: ID del usuario que sigue
- `followed_user_id`: ID del usuario seguido
- `created_at`: Fecha de creación
- **Constraint**: Un usuario no puede seguir al mismo usuario más de una vez

## Relaciones

### Diagrama de Relaciones

```
users (1) -----> (N) posts
users (1) -----> (N) comments
users (1) -----> (N) likes
users (1) -----> (N) stories
users (N) -----> (N) relationships

posts (1) -----> (N) comments
posts (1) -----> (N) likes
```

### Descripciones de Relaciones

1. **users → posts**: Un usuario puede crear múltiples posts
2. **users → comments**: Un usuario puede crear múltiples comentarios
3. **users → likes**: Un usuario puede dar multiple likes (a diferentes posts)
4. **users → stories**: Un usuario puede crear múltiples historias
5. **users → relationships**: Relación muchos-a-muchos para seguimientos
6. **posts → comments**: Un post puede tener múltiples comentarios
7. **posts → likes**: Un post puede tener múltiples likes

## Índices Recomendados

```sql
-- Índices para optimizar consultas frecuentes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_relationships_follower ON relationships(follower_user_id);
CREATE INDEX idx_relationships_followed ON relationships(followed_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

## Script de Inicialización

```sql
-- Crear base de datos
CREATE DATABASE red_social_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE red_social_db;

-- Crear tablas (ejecutar en orden)
-- 1. users (tabla principal)
-- 2. posts, stories, relationships
-- 3. comments, likes

-- Datos de ejemplo (opcional)
INSERT INTO users (username, name, email, password) VALUES 
(admin, Administrador, admin@example.com, a);
```

## Consideraciones de Rendimiento

1. **Índices**: Implementados en campos de búsqueda frecuente
2. **Cascadas**: `ON DELETE CASCADE` para mantener integridad
3. **Paginación**: Implementada en consultas que retornan múltiples registros
4. **Constraints**: Evitan datos duplicados en relaciones únicas

## Migración y Versionado

Para futuras actualizaciones, crear scripts de migración numerados:
- `001_initial_schema.sql`
- `002_add_profile_pics.sql`
- etc.
