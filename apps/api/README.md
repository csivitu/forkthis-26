```md
# API Service

This repository contains the backend API service for the monorepo. It is built utilizing **Express** and **TypeScript**, and uses **Bun** as the primary runtime and package manager. 

The architecture adheres to a **Module-Based** (feature-driven) design pattern. By organizing the codebase around business domains rather than technical concerns, the application maintains high scalability, cohesion, and maintainability.

---

## Directory Structure

The repository is structured to clearly separate configuration, global routing, and feature-specific logic.

*   `package.json` / `tsconfig.json`: Project dependencies, execution scripts, and TypeScript compiler configurations.
*   `src/index.ts`: The application entry point, strictly responsible for server initialization.
*   `src/app.ts`: The Express application builder, which applies global middleware and mounts the master router.
*   `src/config/`: Centralized configuration files (e.g., environment variable validation, database connection setup).
*   `src/middleware/`: Global Express middleware (e.g., authentication guards, global error handling).
*   `src/routes/`: The master routing configuration that aggregates and mounts all module-specific routes.
*   `src/modules/`: Feature-specific modules (e.g., authentication, user management). Each module independently encapsulates its respective routes, controllers, and business logic services.

---

## Prerequisites

*   **Bun (Recommended):** Utilized as the primary package manager and runtime to leverage native TypeScript support and optimized execution speeds.
*   **Node.js & npm/yarn:** Compatible alternatives, though the default `package.json` scripts are optimized for Bun.

---

## Installation

Navigate to the `apps/api` directory and install the required dependencies:

```bash
bun install

```

*(If Bun is unavailable in your environment, `npm install` or `yarn install` may be used as standard alternatives.)*

---

## Environment Configuration

The service requires specific environment variables for successful execution. Create a `.env` file in the root of the `apps/api` directory. Environment variables are strictly validated at runtime utilizing **Zod** (located in `src/config/env.config.ts`) to prevent misconfiguration errors.

Example `.env` configuration:

```env
PORT=3000
DATABASE_URL="sqlite::memory:"
JWT_SECRET=your-secure-secret-key-16chars
JWT_EXPIRES_IN=1h
AI_SERVICE_URL=http://localhost:8000/analyze
NODE_ENV=development

```

---
## Request Lifecycle

The application processes incoming HTTP requests through a standardized lifecycle:

1. **Initialization:** `src/index.ts` loads the configuration and instructs the server to listen on the designated port via `src/app.ts`.
2. **Global Middleware:** Incoming requests are intercepted by `src/app.ts` for standard pre-processing (e.g., CORS validation, JSON payload parsing).
3. **Routing Delegation:** `src/routes/index.ts` interprets the request path and delegates the request to the appropriate feature module router.
4. **Controllers:** The module-specific controller extracts and validates the incoming request parameters, passing the sanitized data to the service layer.
5. **Services:** The service layer executes the core business logic, such as database transactions or external API integrations.
6. **Response Generation:** The controller formats the data returned by the service and transmits the final HTTP response back to the client.

---

## Execution Instructions

### Development Environment

To initialize the server with hot-reloading enabled for active development, execute:

```bash
cd apps/api
bun --watch src/index.ts

```

### Production Build

For deployment environments, compile the TypeScript source code into JavaScript prior to execution to ensure maximum compatibility and performance:

```bash
cd apps/api
# 1. Compile the source code into the dist/ directory
bun build src/index.ts --outdir dist --target node

# 2. Execute the compiled JavaScript output
bun dist/index.js

```

## Troubleshooting & Development Notes

* **Type Definitions:** If the TypeScript compiler encounters errors regarding missing `bun-types`, verify that the package is properly installed as a development dependency by running: `bun add -d bun-types`.
* **Initialization Failures:** If the server fails to initialize, verify the accuracy of the `.env` configuration. The application logs the resolved path of the `.env` file during the startup sequence to assist with debugging.
* **Data Mocking:** Certain services may temporarily return mocked data to facilitate rapid interface prototyping. These components should be updated to integrate with persistent database clients (e.g., Prisma, Drizzle) prior to production deployment.

```

```