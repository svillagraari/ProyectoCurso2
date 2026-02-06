# 🏛️ Arquitectura de la Aplicación

Este documento detalla la arquitectura técnica completa de la aplicación de red social, incluyendo diagramas de flujo de datos, estructura de componentes y patrones de diseño implementados.

## 📊 Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "Frontend (React SPA)"
        A[React Components]
        B[Context API]
        C[Services Layer]
        D[HTTP Client]
    end

    subgraph "Backend (Node.js/Express)"
        E[Routes]
        F[Middleware]
        G[Controllers]
        H[Services]
        I[Database Models]
    end

    subgraph "Database (MySQL)"
        J[(Users)]
        K[(Posts)]
        L[(Relationships)]
        M[(Stories)]
        N[(Comments)]
        O[(Likes)]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    I --> K
    I --> L
    I --> M
    I --> N
    I --> O

    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style J fill:#e8f5e8
```

## 🔄 Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant A as Auth Service
    participant C as Auth Controller
    participant DB as Database
    participant J as JWT

    U->>F: Ingresa credenciales
    F->>A: login(credentials)
    A->>C: POST /api/v1/auth/login
    C->>DB: Validar usuario
    DB-->>C: Usuario encontrado
    C->>C: Generar hash password
    C->>J: Crear JWT token
    J-->>C: Token generado
    C-->>A: {token, user}
    A-->>F: Respuesta exitosa
    F->>F: Guardar token en localStorage
    F->>F: Actualizar AuthContext
    F-->>U: Redirigir a Feed
```

## 📱 Flujo de Creación de Posts

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant P as Posts Service
    participant C as Posts Controller
    participant M as Middleware
    participant DB as Database

    U->>F: Escribe post + imagen
    F->>P: createPost(postData)
    P->>C: POST /api/v1/posts
    C->>M: verifyAuth(token)
    M-->>C: Usuario autenticado
    C->>C: Validar datos
    C->>DB: INSERT INTO posts
    DB-->>C: Post creado (ID)
    C-->>P: Post data
    P-->>F: Respuesta exitosa
    F->>F: Actualizar UI
    F-->>U: Post visible en feed
```

## 🗂️ Estructura de Componentes Frontend

```mermaid
graph TD
    A[App.jsx] --> B[AuthProvider]
    A --> C[BrowserRouter]
    C --> D[Header]
    C --> E[Routes]

    E --> F[Login]
    E --> G[Register]
    E --> H[PrivateRoute]
    H --> I[Feed]
    H --> J[Profile]
    H --> K[Stories]

    B --> L[AuthContext]
    L --> M[useAuth Hook]

    I --> N[Posts Service]
    J --> O[Users Service]
    K --> P[Stories Service]

    N --> Q[HTTP Client]
    O --> Q
    P --> Q

    style A fill:#bbdefb
    style B fill:#c8e6c9
    style D fill:#ffcdd2
    style F fill:#fff3e0
    style I fill:#f3e5f5
```

## 🛠️ Arquitectura de Backend

```mermaid
graph TD
    A[server.js] --> B[Express App]
    B --> C[CORS]
    B --> D[Cookie Parser]
    B --> E[JSON Parser]
    B --> F[Routes]

    F --> G[Auth Routes]
    F --> H[Posts Routes]
    F --> I[Users Routes]
    F --> J[Stories Routes]
    F --> K[Relationships Routes]

    G --> L[Auth Controller]
    H --> M[Posts Controller]
    I --> N[Users Controller]
    J --> O[Stories Controller]
    K --> P[Relationships Controller]

    L --> Q[Auth Service]
    M --> R[Posts Service]
    N --> S[Users Service]
    O --> T[Stories Service]
    P --> U[Relationships Service]

    Q --> V[Database]
    R --> V
    S --> V
    T --> V
    U --> V

    B --> W[Swagger Docs]
    B --> X[Error Handler]

    style A fill:#e3f2fd
    style L fill:#f3e5f5
    style Q fill:#e8f5e8
    style V fill:#fff3e0
```

## 💾 Modelo de Datos Relacional

```mermaid
erDiagram
    USERS ||--o{ POSTS : creates
    USERS ||--o{ STORIES : creates
    USERS ||--o{ COMMENTS : writes
    USERS ||--o{ LIKES : gives
    USERS ||--o{ RELATIONSHIPS : "follows/unfollows"

    POSTS ||--o{ COMMENTS : has
    POSTS ||--o{ LIKES : receives

    COMMENTS ||--o{ LIKES : receives

    RELATIONSHIPS {
        int id PK
        int follower_user_id FK
        int followed_user_id FK
        datetime created_at
    }

    USERS {
        int id PK
        string username UK
        string name
        string email UK
        string password
        string profile_pic
        string cover_pic
        datetime created_at
    }

    POSTS {
        int id PK
        text desc
        string img
        int user_id FK
        datetime created_at
    }

    STORIES {
        int id PK
        string img
        int user_id FK
        datetime created_at
        datetime expires_at
    }

    COMMENTS {
        int id PK
        text desc
        int user_id FK
        int post_id FK
        datetime created_at
    }

    LIKES {
        int id PK
        int user_id FK
        int post_id FK
        int comment_id FK
        datetime created_at
    }
```

## 🔐 Arquitectura de Seguridad

```mermaid
graph TD
    A[Cliente] --> B[HTTPS]
    B --> C[CORS Policy]
    C --> D[JWT Verification]
    D --> E[Input Validation]
    E --> F[Rate Limiting]
    F --> G[Database Query]
    G --> H[Response]

    D --> I[Invalid Token]
    I --> J[401 Unauthorized]

    E --> K[Invalid Input]
    K --> L[400 Bad Request]

    F --> M[Rate Limit Exceeded]
    M --> N[429 Too Many Requests]

    style A fill:#e8f5e8
    style D fill:#fff3e0
    style I fill:#ffcdd2
    style K fill:#ffcdd2
    style M fill:#ffcdd2
```

## 🧪 Arquitectura de Testing

```mermaid
graph TD
    subgraph "Backend Tests (Jest)"
        A[Unit Tests] --> B[Controllers]
        A --> C[Middlewares]
        A --> D[Helpers]

        E[Integration Tests] --> F[API Endpoints]
        E --> G[Database Operations]
    end

    subgraph "Frontend Tests (Vitest)"
        H[Component Tests] --> I[UI Components]
        H --> J[Hooks]

        K[Service Tests] --> L[API Calls]
        K --> M[Error Handling]

        N[Integration Tests] --> O[User Flows]
    end

    P[Test Runner] --> A
    P --> E
    P --> H
    P --> K
    P --> N

    Q[Coverage Report] --> P

    style A fill:#e3f2fd
    style H fill:#f3e5f5
    style P fill:#fff3e0
```

## 🚀 Arquitectura de Despliegue

```mermaid
graph TD
    subgraph "Production Environment"
        A[Load Balancer] --> B[App Server 1]
        A --> C[App Server 2]
        A --> D[App Server N]

        B --> E[Database Primary]
        C --> E
        D --> E

        E --> F[Database Replica 1]
        E --> G[Database Replica 2]

        H[CDN] --> I[Static Assets]
    end

    subgraph "Development Environment"
        J[Local Development] --> K[Hot Reload]
        K --> L[Frontend Dev Server]
        K --> M[Backend Dev Server]
        M --> N[Local Database]
    end

    subgraph "CI/CD Pipeline"
        O[Git Push] --> P[Build]
        P --> Q[Test]
        Q --> R[Deploy to Staging]
        R --> S[Integration Test]
        S --> T[Deploy to Production]
    end

    style A fill:#e8f5e8
    style J fill:#e3f2fd
    style O fill:#fff3e0
```

## 📡 API Endpoints Architecture

```mermaid
graph LR
    subgraph "Authentication API"
        A1[POST /auth/login]
        A2[POST /auth/register]
        A3[POST /auth/logout]
        A4[GET /auth/me]
    end

    subgraph "Posts API"
        P1[GET /posts]
        P2[POST /posts]
        P3[PUT /posts/:id]
        P4[DELETE /posts/:id]
        P5[GET /posts/:id]
    end

    subgraph "Users API"
        U1[GET /users]
        U2[GET /users/:id]
        U3[PUT /users/:id]
        U4[DELETE /users/:id]
        U5[GET /users/search]
    end

    subgraph "Relationships API"
        R1[POST /relationships]
        R2[DELETE /relationships]
        R3[GET /relationships/followers/:id]
        R4[GET /relationships/following/:id]
    end

    subgraph "Stories API"
        S1[GET /stories]
        S2[POST /stories]
        S3[DELETE /stories/:id]
    end

    subgraph "Comments API"
        C1[GET /comments/:postId]
        C2[POST /comments]
        C3[DELETE /comments/:id]
    end

    subgraph "Likes API"
        L1[POST /likes]
        L2[DELETE /likes]
        L3[GET /likes/:postId]
    end

    API[API Gateway] --> A1
    API --> P1
    API --> U1
    API --> R1
    API --> S1
    API --> C1
    API --> L1

    style API fill:#bbdefb
```

## 🔄 Data Flow Patterns

### Patrón Repository
```mermaid
graph TD
    A[Controller] --> B[Service]
    B --> C[Repository]
    C --> D[Database Model]
    D --> E[(Database)]

    C --> F[Query Builder]
    F --> G[SQL Query]
    G --> E

    E --> H[Result Set]
    H --> I[DTO Mapper]
    I --> J[Domain Object]
    J --> B

    style C fill:#e3f2fd
    style F fill:#fff3e0
```

### Patrón Observer (Context API)
```mermaid
graph TD
    A[AuthContext] --> B[Login Action]
    A --> C[Logout Action]
    A --> D[Token Update]

    B --> E[Update State]
    C --> E
    D --> E

    E --> F[Notify Subscribers]
    F --> G[Header Component]
    F --> H[Protected Routes]
    F --> I[API Service]

    G --> J[Show User Menu]
    H --> K[Render/Redirect]
    I --> L[Add Auth Headers]

    style A fill:#bbdefb
    style E fill:#ffcdd2
```

## 📈 Escalabilidad Considerations

```mermaid
graph TD
    subgraph "Horizontal Scaling"
        A[Load Balancer] --> B[App Server 1]
        A --> C[App Server 2]
        A --> D[App Server N]
    end

    subgraph "Database Scaling"
        E[Primary DB] --> F[Replica 1]
        E --> G[Replica 2]
        F --> H[Read Queries]
        G --> H
    end

    subgraph "Caching Layer"
        I[Redis Cache] --> J[Session Store]
        I --> K[API Responses]
        I --> L[User Data]
    end

    subgraph "CDN & Assets"
        M[CDN] --> N[Static Files]
        M --> O[Images]
        M --> P[JS/CSS Bundles]
    end

    B --> I
    C --> I
    D --> I

    B --> E
    C --> E
    D --> E

    style A fill:#e8f5e8
    style I fill:#fff3e0
    style M fill:#f3e5f5
```

## 🔧 Development Workflow

```mermaid
graph LR
    A[Feature Request] --> B[Create Branch]
    B --> C[Write Tests]
    C --> D[Implement Code]
    D --> E[Run Tests]
    E --> F{Coverage > 80%?}
    F -->|No| C
    F -->|Yes| G[Code Review]
    G --> H[Merge to Main]
    H --> I[CI/CD Pipeline]
    I --> J[Deploy to Staging]
    J --> K[Integration Tests]
    K --> L[Deploy to Production]
    L --> M[Monitor & Alert]

    style C fill:#e3f2fd
    style I fill:#fff3e0
    style M fill:#ffcdd2
```

Esta arquitectura proporciona una base sólida y escalable para la aplicación de red social, siguiendo mejores prácticas de desarrollo moderno y patrones de diseño probados.