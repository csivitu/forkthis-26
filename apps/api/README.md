# API Service

This repository contains the backend API service for the monorepo. It is built using **Express** and **TypeScript**, with **Bun** as the primary runtime and package manager.

The API follows a **Module-Based (feature-driven)** architecture. Feature-specific code is organized under `modules`, while shared configuration, middleware, routing, and utility functionality are kept in their respective directories.

---

## Directory Structure

The API is structured to clearly separate application configuration, global middleware, routing, reusable utilities, and feature-specific logic.

```text
src
├── app.ts                         # Express app setup and middleware registration
├── index.ts                       # Server entry point and listener
│
├── config/                        # Application configuration
│   ├── db.config.ts               # Database configuration
│   └── env.config.ts              # Environment variable configuration
│
├── middleware/                    # Global Express middleware
│   ├── auth.middleware.ts          # Authentication middleware
│   └── error.middleware.ts        # Global error handling middleware
│
├── modules/                       # Feature-specific modules
│   └── module/
│       ├── module.controller.ts   # Handles HTTP requests and responses
│       ├── module.routes.ts       # Defines module-specific API routes
│       ├── module.service.ts      # Contains module business logic
│       └── module.types.ts        # TypeScript types for the module
│
├── routes/                        # Master routing configuration
│   └── index.ts                   # Aggregates and mounts module routes
│
└── utils/                         # Shared utility functions
    ├── api-error.ts               # Shared API error class
    ├── api-response.ts             # Standardized API response helpers
    └── logger.util.ts              # Application logging utilities
```

---

## What Goes Where

* `src/app.ts`: Creates and configures the Express application. Global middleware and the master router are registered here.

* `src/index.ts`: Application entry point. Responsible only for starting the HTTP server and listening on the configured port.

* `src/config/`: Contains centralized application configuration, including environment variables and database configuration.

* `src/middleware/`: Contains middleware that is shared across multiple modules, such as authentication and global error handling.

* `src/modules/<feature>/`: Contains all code specific to a particular business feature. Each feature module encapsulates its routes, controllers, services, and types.

* `src/routes/index.ts`: Acts as the master router. It imports module-specific routers and mounts them under their respective API paths.

* `src/utils/`: Contains reusable utilities shared across the application, such as API error handling, response formatting, and logging.

---

## Module Structure

Each feature should follow the same internal structure:

```text
modules/
└── <feature>/
    ├── <feature>.controller.ts
    ├── <feature>.routes.ts
    ├── <feature>.service.ts
    └── <feature>.types.ts
```

### Controller

The controller handles the HTTP layer.

Responsibilities include:

* Reading request parameters, body, and query data.
* Calling the appropriate service function.
* Returning the HTTP response.
* Handling request-level errors.

### Service

The service contains the business logic for the feature.

Responsibilities include:

* Processing application logic.
* Communicating with the database or external services when required.
* Returning results to the controller.

### Routes

The routes file defines the API endpoints belonging to the feature and connects them to their corresponding controllers.

### Types

The types file contains TypeScript interfaces and types specific to the feature.

---


## Routing

All feature routes are registered through the master router:

```text
src/routes/index.ts
```

For example:

```text
/api/module
```

can be mounted from:

```text
src/modules/module/module.routes.ts
```

This allows additional features to be added without placing their controllers or route definitions directly inside global directories.

---

## Error Handling

Errors that occur during request processing should be handled consistently through the application's error-handling mechanism.

The shared error utilities are located in:

```text
src/utils/api-error.ts
```

and the global Express error middleware is located in:

```text
src/middleware/error.middleware.ts
```

This keeps error handling consistent across different feature modules.

---

## Response Handling

Standard API response helpers are located in:

```text
src/utils/api-response.ts
```

These utilities should be used to maintain a consistent response structure across API endpoints.

---

## Authentication

Authentication-related middleware is located in:

```text
src/middleware/auth.middleware.ts
```

Authentication logic that is specific to a particular feature should remain inside that feature's module rather than being placed in the global middleware directory.

---

## Configuration

Environment-specific configuration is handled through:

```text
src/config/env.config.ts
```

Database configuration is handled through:

```text
src/config/db.config.ts
```

Sensitive values such as credentials, API keys, and database URLs should be stored in environment variables rather than committed directly to the repository.

---

## Design Principles

The API follows these principles:

1. **Feature-driven organization**
   Related feature code stays together inside a module.

2. **Separation of concerns**
   Routes, controllers, services, and configuration have distinct responsibilities.

3. **Reusable shared utilities**
   Common functionality is placed in `middleware`, `utils`, or `config` instead of being duplicated across modules.

4. **Scalability**
   New features can be added as independent modules without restructuring the existing application.

5. **Maintainability**
   Developers can locate feature-specific logic without searching through global controller or route directories.
