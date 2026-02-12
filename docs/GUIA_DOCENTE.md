# Guía Docente: Creación Paso a Paso de una Aplicación Web Full-Stack

Esta guía docente está diseñada para estudiantes y desarrolladores que desean aprender a construir una aplicación web full-stack desde cero. Utilizaremos el proyecto proporcionado como referencia, que incluye un backend en Node.js con Express y un frontend en React con Vite. La aplicación parece ser una red social o plataforma de contenido con funcionalidades de autenticación, publicaciones, historias, relaciones entre usuarios, etc.

El proyecto utiliza tecnologías modernas como:
- **Backend**: Node.js, Express.js, MongoDB (probablemente), JWT para autenticación.
- **Frontend**: React, Vite, Vitest para pruebas.
- **Testing**: Jest y Vitest para pruebas unitarias e integradas.
- **Documentación**: Swagger para API, y archivos Markdown para guías.

## Paso 1: Preparación del Entorno de Desarrollo

### 1.1 Instalar Node.js y npm
- Descarga e instala Node.js (versión LTS recomendada, como 18.x o 20.x) desde [nodejs.org](https://nodejs.org/).
- Verifica la instalación:
  ```
  node --version
  npm --version
  ```

### 1.2 Instalar MongoDB (o tu base de datos preferida)
- Si usas MongoDB local, instala MongoDB Community Server desde [mongodb.com](https://www.mongodb.com/try/download/community).
- Alternativamente, usa MongoDB Atlas (cloud) para simplificar.

### 1.3 Instalar un editor de código
- Recomendamos Visual Studio Code (VS Code) con extensiones como:
  - ES7+ React/Redux/React-Native snippets
  - Prettier
  - ESLint
  - Thunder Client (para probar APIs)

### 1.4 Crear la estructura del proyecto
- Crea una carpeta raíz para el proyecto, por ejemplo: `ProyectoCurso2`.
- Dentro de ella, crea las carpetas principales: `client`, `src`, `config`, `docs`.

## Paso 2: Configuración del Backend (Node.js + Express)

### 2.1 Inicializar el proyecto backend
- En la carpeta raíz, ejecuta:
  ```
  npm init -y
  ```
- Esto crea un `package.json` básico.

### 2.2 Instalar dependencias del backend
- Instala las dependencias principales:
  ```
  npm install express mongoose bcryptjs jsonwebtoken cors dotenv helmet express-rate-limit
  ```
  - `express`: Framework web para Node.js.
  - `mongoose`: ODM para MongoDB.
  - `bcryptjs`: Para hashear contraseñas.
  - `jsonwebtoken`: Para tokens JWT.
  - `cors`: Para manejar CORS.
  - `dotenv`: Para variables de entorno.
  - `helmet`: Seguridad básica.
  - `express-rate-limit`: Limitar solicitudes.

- Instala dependencias de desarrollo:
  ```
  npm install --save-dev nodemon jest supertest
  ```
  - `nodemon`: Reinicio automático del servidor.
  - `jest`: Framework de pruebas.
  - `supertest`: Para pruebas de APIs.

### 2.3 Configurar la base de datos
- Crea el archivo `config/db.js`:
  ```javascript
  const mongoose = require('mongoose');

  const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB conectado');
    } catch (error) {
      console.error('Error conectando a MongoDB:', error);
      process.exit(1);
    }
  };

  module.exports = connectDB;
  ```

- Crea un archivo `.env` en la raíz:
  ```
  MONGO_URI=mongodb://localhost:27017/proyecto_curso
  JWT_SECRET=tu_secreto_jwt_aqui
  PORT=5000
  ```

### 2.4 Crear modelos de datos (Mongoose)
- Crea la carpeta `src/models/` y archivos como `User.js`, `Post.js`, etc.
- Ejemplo para `User.js`:
  ```javascript
  const mongoose = require('mongoose');

  const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Otros campos...
  });

  module.exports = mongoose.model('User', userSchema);
  ```

### 2.5 Crear controladores
- Crea la carpeta `src/controllers/` y archivos como `auth.controller.js`.
- Ejemplo básico para autenticación:
  ```javascript
  const User = require('../models/User');
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');

  exports.register = async (req, res) => {
    // Lógica de registro
  };

  exports.login = async (req, res) => {
    // Lógica de login
  };
  ```

### 2.6 Crear rutas
- Crea la carpeta `src/routes/` y archivos como `auth.route.js`.
- Ejemplo:
  ```javascript
  const express = require('express');
  const { register, login } = require('../controllers/auth.controller');

  const router = express.Router();

  router.post('/register', register);
  router.post('/login', login);

  module.exports = router;
  ```

### 2.7 Crear middlewares
- Crea `src/middlewares/verifyAuth.js` para verificar JWT.
- Ejemplo:
  ```javascript
  const jwt = require('jsonwebtoken');

  const verifyAuth = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Acceso denegado' });

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      next();
    } catch (error) {
      res.status(400).json({ message: 'Token inválido' });
    }
  };

  module.exports = verifyAuth;
  ```

### 2.8 Configurar el servidor principal
- Crea `src/server.js`:
  ```javascript
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const rateLimit = require('express-rate-limit');
  const connectDB = require('../config/db');
  require('dotenv').config();

  const app = express();

  // Conectar DB
  connectDB();

  // Middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

  // Rutas
  app.use('/api/auth', require('./routes/auth.route'));
  // Agregar otras rutas...

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  ```

- Actualiza `package.json` para scripts:
  ```json
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  }
  ```

### 2.9 Configurar Swagger para documentación de API
- Instala `swagger-jsdoc` y `swagger-ui-express`.
- Crea `src/swagger.js`:
  ```javascript
  const swaggerJSDoc = require('swagger-jsdoc');
  const swaggerUi = require('swagger-ui-express');

  const options = {
    definition: {
      openapi: '3.0.0',
      info: { title: 'API ProyectoCurso2', version: '1.0.0' },
    },
    apis: ['./src/routes/*.js'],
  };

  const specs = swaggerJSDoc(options);

  module.exports = { swaggerUi, specs };
  ```

- Integra en `server.js`:
  ```javascript
  const { swaggerUi, specs } = require('./swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  ```

## Paso 3: Configuración del Frontend (React + Vite)

### 3.1 Inicializar el proyecto frontend
- En la carpeta `client`, ejecuta:
  ```
  npm create vite@latest . -- --template react
  ```
- Instala dependencias:
  ```
  npm install axios react-router-dom
  ```
  - `axios`: Para llamadas HTTP.
  - `react-router-dom`: Para enrutamiento.

- Instala dependencias de desarrollo:
  ```
  npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
  ```

### 3.2 Configurar Vite y Vitest
- Actualiza `vite.config.js` y `vitest.config.js` según la estructura del proyecto.

### 3.3 Crear componentes y páginas
- Crea la carpeta `src/components/` y archivos como `Header.jsx`.
- Crea `src/pages/` con páginas como `Login.jsx`, `Register.jsx`, etc.
- Ejemplo de `Login.jsx`:
  ```jsx
  import { useState } from 'react';
  import axios from 'axios';

  const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await axios.post('/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        // Redirigir...
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    );
  };

  export default Login;
  ```

### 3.4 Configurar contexto de autenticación
- Crea `src/context/AuthContext.jsx` para manejar el estado de autenticación global.

### 3.5 Configurar enrutamiento
- En `src/main.jsx`, configura React Router.

## Paso 4: Integración y Testing

### 4.1 Conectar frontend y backend
- Asegúrate de que el frontend haga llamadas a `http://localhost:5000/api/...`.
- Maneja CORS en el backend.

### 4.2 Escribir pruebas
- Crea pruebas unitarias en `src/__tests__/` para controladores y componentes.
- Ejemplo con Jest:
  ```javascript
  const request = require('supertest');
  const app = require('../server');

  describe('Auth Controller', () => {
    it('should register a user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'test',
        email: 'test@example.com',
        password: 'password',
      });
      expect(res.statusCode).toEqual(201);
    });
  });
  ```

- Para el frontend, usa Vitest y Testing Library.

### 4.3 Ejecutar pruebas
- Backend: `npm test`
- Frontend: `npm run test`

## Paso 5: Documentación y Despliegue

### 5.1 Crear documentación
- Usa los archivos en `docs/` como referencia. Crea guías en Markdown para API, arquitectura, etc.
- Accede a Swagger en `http://localhost:5000/api-docs`.

### 5.2 Despliegue
- Para el backend: Usa servicios como Heroku, Vercel o AWS.
- Para el frontend: Despliega en Vercel o Netlify.
- Configura variables de entorno en producción.

## Conclusión

Esta guía cubre los fundamentos para construir una aplicación similar. Recuerda seguir buenas prácticas de seguridad (OWASP), testing y documentación. Experimenta, itera y aprende de los errores. Si tienes dudas en algún paso, consulta la documentación del proyecto o recursos en línea. ¡Éxito en tu proyecto!