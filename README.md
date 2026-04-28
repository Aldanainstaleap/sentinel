<p align="center">
  <img src="assets/Marvel-Sentinel.png" alt="Sentinel" width="180">
</p>

<h1 align="center">🛡️ Sentinel</h1>

<p align="center">
  <b>API Gateway</b> — La guardia de hierro entre el mundo y tus microservicios.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-≥18-339933?logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Vitest-Testing-6E9F18?logo=vitest&logoColor=white" alt="Vitest">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker">
</p>

<p align="center">
  <a href="#español">🇪🇸 Español</a> •
  <a href="#english">🇺🇸 English</a>
</p>

---

<a name="español"></a>
## 🇪🇸 Sentinel — Gateway API

> *"Ninguna petición pasa sin ser vigilada."*

**Sentinel** es un microservicio **API Gateway** diseñado para ser el único punto de entrada a tu ecosistema de servicios. Basado en la plantilla **Skrull** y con la lógica de enrutamiento heredada de **Coulson**, Sentinel combina arquitectura limpia con funcionalidad probada en producción.

### ✨ Características

- 🔀 **Proxy dinámico** — Enruta peticiones a cualquier microservicio vía `/gateway/:service`
- 🔐 **Autenticación inteligente** — Tres estrategias:
  - `REBUILD_JWT` — Reconstruye JWT para servicios como Nexus, Lola, Kingpin
  - `PASSTHROUGH` — Pasa el token original a Tesseract, Antman, Deadpool, Cerberus
  - `SERVICE_TOKEN` — Inyecta tokens de servicio obtenidos de Auth0 o AWS Secrets
- 🗝️ **Gestión de secretos** — Integración nativa con AWS Secrets Manager
- ⚡ **Caché de tokens** — 30 minutos de caché para evitar llamadas repetidas
- 📚 **Documentación OpenAPI** — Swagger UI integrado
- 🧪 **Testing completo** — Vitest con cobertura v8
- 🐳 **Docker + DevContainer** — Listo para desarrollo local o Codespaces
- 🏗️ **Infraestructura como código** — Terraform para AWS ECS

### 🚀 Inicio rápido

```bash
# 1. Clonar
git clone https://github.com/Aldanainstaleap/sentinel.git
cd sentinel

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Iniciar en desarrollo
npm run start:dev
```

O con Docker:

```bash
docker-compose up
```

### 🗺️ Servicios soportados

| Servicio | Estrategia | Auth |
|----------|-----------|------|
| **Nexus** | `REBUILD_JWT` | Auth0 M2M |
| **Lola** | `REBUILD_JWT` | Auth0 M2M |
| **Kingpin** | `REBUILD_JWT` | Auth0 M2M |
| **Tesseract** | `PASSTHROUGH` | Token del cliente |
| **Antman** | `PASSTHROUGH` | Token del cliente |
| **Deadpool** | `PASSTHROUGH` | Token del cliente |
| **Cerberus** | `PASSTHROUGH` | Token del cliente |
| **Redbook** | `SERVICE_TOKEN` | API Tenants |
| **Bifrost** | `SERVICE_TOKEN` | AWS Secrets |
| **Nebula** | `SERVICE_TOKEN` | AWS Secrets |
| **Dormammu** | `SERVICE_TOKEN` | Token estático |
| **Hawkeye** | `SERVICE_TOKEN` | AWS Secrets |

### 🏛️ Arquitectura

```
Cliente → /gateway/:service
        → OAuth Middleware (JWT)
        → GatewayController
        → GatewayService
          1. Valida configuración
          2. Aplica estrategia de auth
          3. Limpia headers sensibles
          4. HttpHandler.request(baseUrl, url, method, headers, body)
        → Responde con status + body del downstream
```

### 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Con cobertura
npm run test -- --coverage
```

### 📝 Licencia

ISC © Aldanainstaleap

---

<a name="english"></a>
## 🇺🇸 Sentinel — API Gateway

> *"No request goes unwatched."*

**Sentinel** is an **API Gateway** microservice designed to be the single entry point to your service ecosystem. Built on the **Skrull** template and carrying the routing logic inherited from **Coulson**, Sentinel combines clean architecture with battle-tested production functionality.

### ✨ Features

- 🔀 **Dynamic proxy** — Routes requests to any microservice via `/gateway/:service`
- 🔐 **Smart authentication** — Three strategies:
  - `REBUILD_JWT` — Rebuilds JWT for services like Nexus, Lola, Kingpin
  - `PASSTHROUGH` — Passes original token to Tesseract, Antman, Deadpool, Cerberus
  - `SERVICE_TOKEN` — Injects service tokens from Auth0 or AWS Secrets
- 🗝️ **Secrets management** — Native AWS Secrets Manager integration
- ⚡ **Token caching** — 30-minute cache to avoid repeated calls
- 📚 **OpenAPI documentation** — Integrated Swagger UI
- 🧪 **Full testing** — Vitest with v8 coverage
- 🐳 **Docker + DevContainer** — Ready for local development or Codespaces
- 🏗️ **Infrastructure as code** — Terraform for AWS ECS

### 🚀 Quick start

```bash
# 1. Clone
git clone https://github.com/Aldanainstaleap/sentinel.git
cd sentinel

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 4. Start development
npm run start:dev
```

Or with Docker:

```bash
docker-compose up
```

### 🗺️ Supported services

| Service | Strategy | Auth |
|---------|----------|------|
| **Nexus** | `REBUILD_JWT` | Auth0 M2M |
| **Lola** | `REBUILD_JWT` | Auth0 M2M |
| **Kingpin** | `REBUILD_JWT` | Auth0 M2M |
| **Tesseract** | `PASSTHROUGH` | Client token |
| **Antman** | `PASSTHROUGH` | Client token |
| **Deadpool** | `PASSTHROUGH` | Client token |
| **Cerberus** | `PASSTHROUGH` | Client token |
| **Redbook** | `SERVICE_TOKEN` | API Tenants |
| **Bifrost** | `SERVICE_TOKEN` | AWS Secrets |
| **Nebula** | `SERVICE_TOKEN` | AWS Secrets |
| **Dormammu** | `SERVICE_TOKEN` | Static token |
| **Hawkeye** | `SERVICE_TOKEN` | AWS Secrets |

### 🏛️ Architecture

```
Client → /gateway/:service
       → OAuth Middleware (JWT)
       → GatewayController
       → GatewayService
         1. Validates configuration
         2. Applies auth strategy
         3. Cleans sensitive headers
         4. HttpHandler.request(baseUrl, url, method, headers, body)
       → Responds with downstream status + body
```

### 🧪 Testing

```bash
# Run all tests
npm test

# With coverage
npm run test -- --coverage
```

### 📝 License

ISC © Aldanainstaleap

---

<p align="center">
  <sub>Built with 🦾 by the Aldanainstaleap team</sub>
</p>
