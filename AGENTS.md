# Agent Development Guide

This guide provides the guidelines and standards for contributing to the project. **Any PR that violates these principles will be rejected in review.**

- When in doubt, ask. Never assume business requirements.
- All code and documentation must be written in **English**.

## 1. Task Execution Order

When implementing any new feature or fix, you must strictly follow this lifecycle:

0. Before writing any code, analyze the request, output a brief step-by-step implementation plan in the chat, and **WAIT** for the human developer to approve it.
1. Create/open the **test file first**. Write a test that describes the expected behavior.
2. Run `npm run test`. Confirm the new test **FAILS** (red phase).
3. Only then create/modify the implementation file with the minimum code to pass.
4. Run `npm run test`. Confirm all tests **PASS** (green phase).
5. Refactor if needed. Run tests again to confirm they still pass.
6. Run `npm run lint`. Confirm zero errors.

For bug fixes: reproduce the bug with a failing test BEFORE touching the implementation.

## 2. Security Boundaries

### NEVER (Hard Constraints — zero tolerance)

- Write secrets, API keys, tokens, or passwords in source code. Use `process.env` via `configService.getConfig()`.
- Commit `.env`, `.env.local`, or any file containing credentials.
- Use `eval()`, `Function()`, or `child_process.exec()` with unsanitized inputs.
- Interpolate user input into raw SQL strings. **Always** use parameterized queries (`$1`, `$2`).
- Execute Terraform commands (`init`, `plan`, `apply`, `destroy`).
- Delete or skip failing tests to make the build pass. Fix the code, not the test.
- Modify CI/CD files (`buildspec.yml`) without explicit instruction.
- Push directly to `development`. Always create a branch and open a Pull Request.
- Add or install dependencies autonomously. If a new dependency is needed, state the package name, the justification, and stop. Do not run `npm install <package>`.
- Write code for "future use cases" (YAGNI violation).
- Do not use any to type anything

### ASK FIRST (Human-in-the-Loop — requires developer confirmation)

- Modify `.tf` files. If requested to generate a plan, ask for human confirmation before executing any command that alters file state.
- Create or modify database migrations.
- Add new API endpoints (especially public/unauthenticated ones).
- Modify authentication or authorization logic (guards, middlewares).
- Change the `GlobalConfiguration` interface or `globalConfigurationSchema` (triggers cascade — see Section 8).
- Change the startup flow in `src/loaders/` or error handling chain (see `errorHandlingMiddleware.ts`).
- Any file creation, deletion, or renaming.
- **Failing Test Loop**: If a test fails more than 3 times consecutively during implementation, STOP. Do not attempt another fix. Output the error log, analyze what might be fundamentally wrong, and ask the human developer for guidance.

### ALWAYS (Mandatory on every task)

- Run `npm run test` before presenting changes. Ensure **95%+ coverage** for new code.
- Run `npm run lint` before presenting changes. Zero errors.
- Follow **TDD**: write the failing test first, then implement.
- Validate Interface-Schema synchronization when modifying any interface used for validation.
- Update `test/mocks/env.mock.ts` when modifying environment variable interfaces.
- Use explicit return types on all public functions and methods.
- All imports must be arranged alphabetically
- All variables and constants must be explicitly typed and never imply the type.
- Use parameterized queries for all database operations.
- Extend `BaseController`, `BaseModel`, or `BaseManager` as appropriate for new components (see Section 7 - Core Utilities).
- Extend any new service using `createSingleton` pattern (see Section 7 - Core Utilities).
- Include TSDoc with `@param`, `@returns`, and `@example` on all public methods.
- Use Conventional Commits format: `type: message`. Keep commit message short and concise with a maximun of 88 characters. Avoid mentioning co-authoring.

## 3. Fundamental Development Principles

This project is strictly governed by the following principles.

- **TDD - Test-Driven Development**: **Tests must always be written first.** The workflow must be:

  1.  **Red**: Write an automated test that fails because the functionality does not yet exist.
  2.  **Green**: Write the minimum amount of code necessary for the test to pass.
  3.  **Refactor**: Improve the implementation code while ensuring all tests continue to pass.

  For bug fixes: **reproduce the bug with a failing test before attempting to fix the code.**

- **KISS (Keep It Simple, Stupid)**: It advocates for simplicity, avoiding unnecessary complexity in code and design. Avoid overengineering.

- **SOLID**: Any proposal, discussion, or modification related to the project architecture must be mandatorily based on SOLID design principles. Any architectural proposal that does not align will be rejected until it conforms.

- **YAGNI (You Aren't Gonna Need It)**: Do not write code for "future use cases". Implement only what is necessary for current requirements.

- **DRY (Don't Repeat Yourself) with Nuances**: Centralize repetitive logic (utilities, validations, DB connections) in `src/utils` or in base classes (`BaseController`, `BaseModel`, `BaseManager`).

## 4. Style Rules and Conventions

### Naming Conventions

| Element                     | Convention   | Example                                  | Notes                                                              |
| :-------------------------- | :----------- | :--------------------------------------- | :----------------------------------------------------------------- |
| **Variables and Functions** | `camelCase`  | `exampleMethod`, `getUserInfo`           | Verbs for functions, nouns for variables.                          |
| **Classes and Interfaces**  | `PascalCase` | `PostgresService`, `GlobalConfiguration` | Interfaces usually describe the shape of the data.                 |
| **Files**                   | `kebab-case` | `api-server.load.ts`, `user.model.ts`    | Use dots to separate the type (e.g. `.controller.ts`, `.test.ts`). |
| **Folders**                 | `kebab-case` | `src/api/routes/`, `users/`              | Flat and descriptive structure.                                    |
| **Endpoints (API)**         | `kebab-case` | `/create-client`, `/users/:id`           | Always lowercase.                                                  |
| **SQL Tables**              | `snake_case` | `role`, `role_permission`                | **Strictly singular**.                                             |

### Typing

The project uses TypeScript strictly. `any` is prohibited unless technically unavoidable (and must be justified with a comment). Interfaces define the data "contracts" and are centrally located to keep the code DRY. **Base Path**: `src/interfaces/`.

| Scenario                           | Recommended Action                                                        | Example                                                                                              |
| :--------------------------------- | :------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------- |
| **New Business Entity**            | Create a new file with the domain name.                                   | If implementing "Payments", create `src/interfaces/payment.interfaces.ts`.                           |
| **Input/Output Structures (DTOs)** | Group in the interfaces file of the domain they belong to.                | The `UserCreationPayload` interface (API input) should go inside `src/interfaces/user.interfaces.ts` |
| **Add field to entity**            | Modify the existing interface.                                            | Add `phone: string` to `UserInfo` in `user.interfaces.ts`.                                           |
| **Data subset**                    | Use `Pick<T>`, `Omit<T>` or `Partial<T>` instead of rewriting properties. | `const userSummary: Pick<IUserInfo, 'id' \| 'email'>`.                                               |

#### Interface-Schema Synchronization

In this project, static typing (TS) and runtime validation (AJV) are decoupled but must be kept manually synchronized.

> **CRITICAL**: If you modify an Interface that validates inputs (API Body, Configuration), you **MUST** modify its corresponding Schema.

| Concept       | Location          | Purpose                                                           | Example                            |
| :------------ | :---------------- | :---------------------------------------------------------------- | :--------------------------------- |
| **Interface** | `src/interfaces/` | Contract at **compile** time. Helps the developer (IntelliSense). | `interface IUser { name: string }` |
| **Schema**    | `src/schemas/`    | Validation at **runtime**. Protects the system from corrupt data. | `required: ['name']`               |

### Import/Export Structure

Use ES6 modules (`import`/`export`). Imports must be sorted (extension `miclo.sort-typescript-imports` recommended).

### Comments and Documentation (ALWAYS IN ENGLISH)

The project is migrating from JSDoc to **TSDoc**. **New code MUST use TSDoc.** When modifying an existing file, update its JSDoc to TSDoc.

| Element         | TSDoc Tag  | Correct Usage and Convention                                                                                     |
| :-------------- | :--------- | :--------------------------------------------------------------------------------------------------------------- |
| **Description** | (No tag)   | What it does and why. Do not explain the "how".                                                                  |
| **Parameters**  | `@param`   | Must include an inline example using `E.g.,` (with comma). <br>Format: `@param name - Description. E.g., 'John'` |
| **Return**      | `@returns` | Must include an example of the returned structure. <br>Format: `@returns Description. E.g., { id: '123' }`       |
| **Examples**    | `@example` | **Mandatory**. Executable and realistic code block.                                                              |
| **Properties**  | (Direct)   | Comment directly on the interface property. **Do not use `@field`**.                                             |
| **API Docs**    | `@swagger` | **Exclusive to routes (`src/api/routes/`)**. Generates the OpenAPI.                                              |

**Note**: Tags must follow this order: 1. Summary/Description. 2. `@param`. 3. `@returns`. 4. `@example`. 5. Modifiers (`@deprecated`, etc.)

**Correct Implementation Example:**

````typescript
/**
 * Retrieves user information by their email address.
 *
 * @param email - The user's email to search for. E.g., 'john.doe@example.com'
 * @param includeActive - If true, filters only active users. E.g., true
 * @returns A promise resolving to the user model found. E.g., UserModel {
 *  id: '9f0b7450-b293-404a-a048-cb0cfd7a2c2e',
 *  email: 'john.doe@example.com',
 *  isActive: true
 * }
 *
 * @example
 * ```typescript
 * const userController: UserController = new UserController()
 * const user: UserModel = await userController.findUserByEmail('test@demo.com', true)
 * const userId: string = user.id
 * ```
 */
public async findUserByEmail(email: string, includeActive: boolean): Promise<UserModel> {
  // ...
}
````

### Inline Comments (Strict Restriction)

Do NOT add comments explaining "what" the code is doing. We assume the reader knows TypeScript.

- ❌ FORBIDDEN: `const total = price * quantity; // Calculate total price`
- ❌ FORBIDDEN: `if (user) { // Check if user exists`
- ✅ ALLOWED: `// 5ms buffer to account for clock skew in legacy systems`

Rule: Only comment to explain **WHY** a specific, non-obvious decision was taken or to explain complex algorithms / edge cases. If the code is hard to read, refactor it instead of commenting it.

### Conditional Logic

For conditional logic with 3+ branches, prefer lookup Maps or switch statements over if-else chains. For 2 branches, if-else is acceptable.

### Code Format

**Prettier** and **ESLint** are used to validate code style. The configuration is found in `.prettierrc.json` and `eslint.config.mjs`. It is mandatory that all generated code strictly adheres to these rules from its creation. Pre-commit hooks with Husky and `lint-staged` act as a final safeguard to ensure consistency, not as a primary correction tool.

## 5. Testing Strategy

### Configuration

| Concept       | Rule / Standard                                                                                                                                   |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Framework** | **[Vitest](https://vitest.dev/)**. Compatible with Jest API.                                                                                      |
| **Coverage**  | A minimum of **95%** code coverage is expected for new functionality. Must be validated with `npm run test`.                                      |
| **Location**  | `test/` directory. Must **mirror** the structure of `src/`. <br>_(E.g.: `src/services/user.service.ts` -> `test/services/user.service.test.ts`)_. |
| **Files**     | Test files must end in: `*.test.ts`. <br> Mock files must end in: `*.mocks.ts`.                                                                   |

### Test Types

| Type            | Description                                           | Dependencies                                               | Example                                              |
| --------------- | ----------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| **Unit**        | Tests isolated logic with all dependencies mocked     | All mocked                                                 | Service methods, pure functions, utilities           |
| **Component**   | Tests a unit using real code of specific dependencies | Some real (e.g., `validateJSONSchema`, `isolated-vm`, AJV) | Schema validation, sandbox execution                 |
| **Integration** | Tests that require infrastructure services            | Containers or mocked infra (DB, Redis, SQS)                | Database queries, cache operations, queue processing |

### Mock Management

- **Global mocks**: `test/mocks/` (e.g., `env.mock.ts`, `general.mock.ts`).
- **Module-specific mocks**: Inside each test module directory (e.g., `test/services/mocks/secrets.mocks.ts`, `test/controllers/mocks/`).
- **Documentation**: Each mock file must start with a TSDoc comment explaining **what it simulates and why**.

### Implementation Examples

**Unit Test** — All dependencies mocked:

```typescript
// test/services/user.service.test.ts
describe('UserService', () => {
  const userService: UserService = new UserService()

  test('should return user info when name is valid', () => {
    const name: string = 'John'
    const user: User = userService.getUserByName(name)
    expect(user).toBeDefined()
    expect(user.firstName).toBe(name)
  })
})
```

**Component Test** — Uses real AJV/schema validation:

```typescript
// test/schemas/block.schema.test.ts
import { validateJSONSchema } from '@mercadoni/instaleap-utils'
import { blockDefinitionSchema } from '../../src/schemas/block.schemas'

describe('BlockDefinitionSchema', () => {
  test('should validate a correct block definition', () => {
    const validBlock: BlockDefinition = { name: 'TestBlock', type: 'HTTP' }
    const result: BlockDefinition = validateJSONSchema(
      blockDefinitionSchema,
      validBlock
    )
    expect(result).toEqual(validBlock)
  })
})
```

**Integration Test** — Requires infrastructure (e.g., Postgres container):

```typescript
// test/integration/managers/user.manager.test.ts
import { PostgresService } from '../../../src/services/postgres.service'

describe('UserManager Integration', () => {
  beforeAll(async () => {
    await PostgresService.getInstance().connect() // Real DB container
  })

  afterAll(async () => {
    await PostgresService.getInstance().disconnect()
  })

  test('should persist and retrieve a user', async () => {
    const manager: UserManager = UserManager.getInstance()
    const created: User = await manager.create({
      name: 'John',
      email: 'john@test.com'
    })
    const found: User = await manager.findById(created.id)
    expect(found.email).toBe('john@test.com')
  })
})
```

## 6. Project Structure

```
.
├── scripts/                  # Automation and setup scripts
├── src/
│   ├── api/
│   │   ├── routes/           # Express route definitions. Maps URL + method → middleware
│   │   └── middlewares/      # Request interception: AJV validation, auth, HTTP response
│   ├── controllers/          # Business logic. Extends BaseController. Orchestrates Models or Services
│   ├── errors/               # Custom error classes extending BaseError
│   ├── interfaces/           # TypeScript interfaces and types. Central contract location
│   ├── loaders/              # App initialization: services.loader.ts, api-server.load.ts
│   ├── persistence/
│   │   ├── models/           # Active Record pattern. Extends BaseModel
│   │   ├── managers/         # Pure Data Access Layer. Raw SQL queries. Extends BaseManager
│   │   └── schemas/          # DB-level validation schemas
│   ├── schemas/              # AJV validation schemas for API inputs and configuration
│   ├── services/             # Singletons for external integrations (AWS, Firebase, Postgres)
│   └── utils/                # Reusable utility functions
├── terraform/                # Infrastructure as code (agent CANNOT execute terraform commands)
└── test/                     # Tests (mirrors the structure of src/)
    └── mocks/                # Centralized mocks (env, general)
```

**Startup Flow:** The entry point is `src/app.ts`. This file invokes the loaders (`src/loaders/`) which first initialize all services (`services.loader.ts`) and then start the Express server (`api-server.load.ts`). The `services` variable is a global constant exported from `src/app.ts` that provides access to all initialized singleton services.

## 7. Architecture and Request Lifecycle

To develop effectively in this project, it is crucial to understand how an HTTP request flows from when it reaches the server until a response is sent. The architecture follows a clear and decoupled pattern.

> **Note:** The Model/Manager layer is the target architecture. Services predating this pattern may route Controller → Service → PostgresService directly. **All new features MUST implement the Model/Manager pattern.**

**General Flow:**

**A. Flow with Persistence**: When the request queries internal infrastructure, such as databases.

`HTTP Request` → `Router` → `Middleware(s)` → `Controller` → `Model(s)` → `Manager(s)` → `PostgresService` → `HTTP Response`

**B. Flow with External Services**: When the request uses external services without querying internal DB.

`HTTP Request` → `Router` → `Middleware(s)` → `Controller` → `Service(s)` → `SDK / External API` → `HTTP Response`

---

### Core Utilities (`@mercadoni/instaleap-utils`)

**CRITICAL**: Base classes and shared utilities come from `@mercadoni/instaleap-utils`. Do not create your own base classes. Before implementing any utility, check if it already exists in this library.

- **If it exists in the library** → use it. Do not reimplement it locally.
- **If it does not exist** → create it in `src/utils/`. If it could benefit other projects, flag it as a candidate to contribute upstream.
- **Never override or wrap** a library utility just to rename it.

| Import                       | Purpose                                                                | Usage Rule                                                             |
| ---------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `createSingleton`            | Enforces Singleton pattern on classes                                  | Mandatory for all Services and Managers                                |
| `validateJSONSchema`         | Validates objects against AJV schemas                                  | Mandatory in Middlewares and Config loading                            |
| `BaseModel`                  | Abstract class: Active Record pattern, AJV validation                  | All domain entities must extend this                                   |
| `BaseManager`                | Abstract class: provides `this.db` access (requires `DatabaseService`) | All data access managers must extend this                              |
| `BaseController`             | Abstract class: provides `this.services` and `this.getConfig()`        | All controllers must extend this                                       |
| `IManager<T>`                | Interface: standard CRUD contract                                      | Managers performing CRUD must implement this                           |
| `DatabaseService`            | Interface contract for DB services                                     | All database services must implement this                              |
| `BaseError`, `ErrorCategory` | Base class for custom errors                                           | All custom errors must extend `BaseError`                              |
| `HttpHandler`                | Wrapper for HTTP calls with retries                                    | Use for all external API calls. Do not use `fetch` or `axios` directly |
| `ResponseHttpHandler`        | Standardizes HTTP responses                                            | Use in middlewares for `handleSuccess()`                               |
| `RedisService`               | Redis connection and caching                                           | Use for caching and session management                                 |

**Discovery Protocol**: Since you cannot browse `node_modules`, run `grep -r "UtilityName" src/` (or the relevant utility) to find existing usage patterns in the codebase. Mimic those patterns.

### Components

#### Routers (`src/api/routes/`)

Map an endpoint (URL and HTTP method) to an initial handler, which is always a middleware.

```Typescript
// src/api/routes/example.route.ts
import { exampleMiddleware } from '../middlewares/example.middleware'

router.post('/example', exampleMiddleware)
```

#### Middleware (`src/api/middlewares/`)

Intercept the request before it reaches the main business logic and perform Validation (AJV), Auth, and standard HTTP response (ResponseHttpHandler) steps.

```Typescript
// src/api/middlewares/example.middleware.ts
import { validateJSONSchema } from '@mercadoni/instaleap-utils'
import { exampleRequestSchema } from '../../schemas/example.schemas'
import { ExampleController } from '../../controllers/example.controller'
import { ResponseHttpHandler } from '../../utils/http.responses.utils'

export const exampleMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const httpResponse: ResponseHttpHandler = new ResponseHttpHandler(res)
  try {
    const validatedName: ExampleInterface = validateJSONSchema<ExampleInterface>(
      exampleRequestSchema,
      req.body
    )
    const exampleController: ExampleController = new ExampleController()
    const userInfo: UserInfo = await exampleController.retrieveUserData(validatedName.name)
    httpResponse.handleSuccess(
      'The query has been successfully resolved',
      userInfo
    )
  } catch (error) {
    next(error)
  }
}
```

#### Controllers (`src/controllers/`)

Contains the business logic. Controllers must extend `BaseController` (from `@mercadoni/instaleap-utils`), which provides:

- `this.services` — Access to all initialized singleton services.
- `this.getConfig()` — Type-safe access to pre-loaded configuration.

Controller methods orchestrate the logic through one of these operation modes (or both):

1. _Model Orchestration_: To manipulate business and persistence entities (e.g. Users, Blocks).
2. _Direct Service Usage_: To interact with external infrastructure when persistence or complex data modeling is not required.

```TypeScript
// src/controllers/example.controller.ts
import { BaseController } from '@mercadoni/instaleap-utils'

export class ExampleController extends BaseController {

  // CASE A: Business Logic with Persistence (Uses Models)
  public async createUser(newUserInfo: IUserInfo): Promise<UserModel> {
    const createdUser: UserModel = await UserModel.create(newUserInfo)
    const builderRole: RoleModel = await RoleModel.find('builder', 'name')
    await builderRole.assignToUser(createdUser.id)
    return createdUser
  }

  // CASE B: Business Logic with Pure Infrastructure (Uses Services)
  public async getRawConfig(): Promise<T> {
    const config: ConfigInterface = await this.services.firestoreService.getDocument('configs/main')
    if (!config.isActive) {
        throw new BusinessError('Config is disabled')
    }
    return config
  }
}
```

#### Model (`src/persistence/models/`)

Implements the Active Record pattern. Represents a data entity and provides methods to interact with its own state and its relationships. Extends `BaseModel` (from `@mercadoni/instaleap-utils`) and internally uses a Manager to execute operations.

- **Note**: Does NOT contain complex business logic. Only persistence and relationship logic.
- You must implement `_setManager` and `_setSchema`. Do not override `save`, `update`, or `delete` unless necessary; they are inherited.

```TypeScript
// src/persistence/models/example.model.ts
import { BaseModel, IManager } from '@mercadoni/instaleap-utils'
import { ExampleManager } from '../managers/example.manager'
import { exampleSchema } from '../schemas/example.schema'

export class ExampleModel extends BaseModel<ExampleInterface> {
  public name!: string
  public status!: string

  private constructor(data: ExampleInterface) {
    super(data)
    Object.assign(this, data)
  }

  protected static _setManager(): IManager<ExampleInterface> {
    return ExampleManager.getInstance()
  }

  protected static _setSchema(): JSONSchemaType<ExampleInterface> {
    return exampleSchema
  }
}
```

#### Manager (`src/persistence/managers/`)

Pure data access (Data Access Layer). Executes raw SQL queries. **Must not contain business logic**. Extends `BaseManager` (from `@mercadoni/instaleap-utils`). You must inject the concrete `PostgresService` into the `BaseManager` constructor.

```TypeScript
// src/persistence/managers/example.manager.ts
import { BaseManager, IManager } from '@mercadoni/instaleap-utils'
import { PostgresService } from '../../services/postgres.service'

export class ExampleManager extends BaseManager<PostgresService> implements IManager<ExampleInterface> {
  private static instance: ExampleManager

  private constructor() {
    super(services.postgresService)
  }

  public static getInstance(): ExampleManager {
    if (!ExampleManager.instance) {
      ExampleManager.instance = new ExampleManager()
    }
    return ExampleManager.instance
  }

  public async create(data: ExampleInterface): Promise<ExampleInterface> {
    try {
      const query: string = `
        INSERT INTO examples (name, status)
        VALUES ($1, $2)
        RETURNING *
      `
      const result: ExampleInterface = await this.db.queryOne(query, [data.name, data.status])
      return result
    } catch (error) {
      if (error.code === '23505') {
        throw new DuplicateResourceError('Example already exists', error)
      }
      throw new PostgresError('Error creating example', error)
    }
  }
}
```

#### Services (`src/services/`)

Components capable of interacting with external APIs or that interact with data sources (Firebase, AWS, Postgres).

```TypeScript
// src/services/example.service.ts
import { createSingleton } from '@mercadoni/instaleap-utils'

export class ExampleServices extends createSingleton<ExampleServices>() {
  private readonly users: UserInfo[] = [
    { firstName: 'John', lastName: 'Doe', phone: '123456789' }
  ]

  public getUserInfoByName(name: string): UserInfo {
    const user: UserInfo = this.users.find(u => u.firstName.toLowerCase() === name.toLowerCase())
    if (!user) {
      throw new Error(`No user found with the name: ${name}`)
    }
    return user
  }
}
```

## 8. Environment Variables

Due to strict validation and typing, adding a new environment variable requires updating several files to maintain consistency and prevent runtime and test errors.

### Configuration and Access

- **Local**: For local development, create a `.env` file in the project root, copying the structure from `.env.example` and filling in the values.
- **Codespaces**: Variables are automatically injected from GitHub's "Codespaces secrets". The `scripts/setup-env.sh` script handles generating the `.env` file from these secrets when starting the container.
- **Naming Convention**: Variables are in `UPPER_SNAKE_CASE` (e.g., `DB_CONFIG`, `AUTH_CONFIG`).
- **Access in Code**: Import the `services` global constant from `src/app.ts` and use `services.configService.getConfig()`. This singleton ensures configuration is loaded and validated only once, providing type-safe access to all environment variables.

### Process for Adding a New Environment Variable

Follow these mandatory steps. Missing any step causes runtime or test failures.

- [ ] **Interface** — Add property to `GlobalConfiguration` in `src/interfaces/configurations.interfaces.ts`. If it is an object, create its own interface.
- [ ] **Schema** — Add AJV schema in `src/schemas/config.schemas.ts`. Include `x-source` to specify origin:

  - `x-source: "secrets"` — For sensitive values (AWS Secrets Manager)
  - `x-source: "ssm"` — For non-sensitive values (AWS SSM Parameter Store)
  - `x-source: "environment"` — For static environment variables

  And register it in `globalConfigurationSchema`. This is **crucial** for the application to start.

- [ ] **Test Mocks** — Add mock value to `mockGlobalConfig` in `test/mocks/env.mock.ts`. Vital so tests do not fail.
- [ ] **Example File** — Add to `.env.example` with placeholder values. **Never real secrets.**
- [ ] **Infrastructure** — Configure in Terraform files (as `terraform/xandar/main.tf` and `terraform/us-east-1/production/main.tf`).

<details>
<summary>Expand: Full code examples for each step</summary>

**Step 1 — Configuration Interface** (`src/interfaces/configurations.interfaces.ts`):

```typescript
export interface GlobalConfiguration {
  // ... other properties
  readonly NEW_SERVICE_CONFIG: NewServiceConfig
}

export interface NewServiceConfig {
  apiUrl: string
  timeout: number
}
```

**Step 2 — Schema** (`src/schemas/config.schemas.ts`):

```typescript
export const newServiceConfigSchema: JSONSchemaType<NewServiceConfig> = {
  type: 'object',
  'x-source': 'secrets', // or 'ssm' for non-sensitive, 'environment' for static
  properties: {
    apiUrl: { type: 'string' },
    timeout: { type: 'number' }
  },
  required: ['apiUrl', 'timeout']
}

export const globalConfigurationSchema: JSONSchemaType<GlobalConfiguration> = {
  type: 'object',
  properties: {
    // ... other properties
    NEW_SERVICE_CONFIG: newServiceConfigSchema
  }
}
```

**Step 3 — Test Mocks** (`test/mocks/env.mock.ts`):

```typescript
export const mockNewServiceConfig: NewServiceConfig = {
  apiUrl: 'http://test.service.com',
  timeout: 5000
}

export const mockGlobalConfig: GlobalConfiguration = {
  // ... other properties
  NEW_SERVICE_CONFIG: mockNewServiceConfig
}
```

**Step 4 — Example File** (`.env.example`):

```env
NEW_SERVICE_CONFIG='{"apiUrl":"https://api.service.com","timeout":10000}'
```

**Step 5 — Terraform** (`terraform/xandar/main.tf`):

```terraform
secrets = {
  AUTH_CONFIG        = "xandar/sentinel/auth_config"
  DB_CONFIG          = "xandar/sentinel/rds/users/app"
  NEW_SERVICE_CONFIG = "xandar/sentinel/new-service"  # Sensitive: goes in secrets
}

environment = {
  PORT        = "80"
  ENVIRONMENT = "xandar"
}
# Note: SSM parameters are loaded automatically via data.aws_ssm_parameters_by_path
```

</details>

## 9. Code Patterns

### Singleton Pattern

Services and managers are singletons to ensure a single instance. When possible, the `createSingleton` utility from `@mercadoni/instaleap-utils` is used.

```TypeScript
// src/services/secrets.service.ts
import { createSingleton } from '@mercadoni/instaleap-utils'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

export class SecretsService extends createSingleton<SecretsService>() {
  private readonly secretsManagerSDK: SecretsManagerClient

  private constructor() {
    super()
    // ... initialization
  }
}

// Usage:
const secretsService: SecretsService = SecretsService.getInstance()
```

### Data Validation with Schemas (AJV)

`validateJSONSchema` is used to validate the structure of `req.body` in middlewares and environment variables. Schemas are defined in `src/schemas/`.

```TypeScript
const validatedBody = validateJSONSchema<ExampleInterface>(
  exampleRequestSchema,
  req.body
)
```

### Database Interaction (PostgresService)

PostgresService has advanced logic for robustness and convenience:

- **Automatic Credential Refresh:** If a query fails due to an authentication error (`28P01`, etc.), the service will attempt to obtain new credentials from AWS Secrets Manager and retry the query once.
- **Conversion to camelCase**: Query results (with `snake_case` columns) are automatically converted to objects with `camelCase` keys.

```TypeScript
// src/services/postgres.service.ts
export class PostgresService extends createSingleton<PostgresService>() implements DatabaseService {
  private pool!: Pool

  public async connect(): Promise<void> {
    // Initialize connection pool
  }

  public async disconnect(): Promise<void> {
    await this.pool.end()
  }

  public isConnected(): boolean {
    return this.pool?.ended === false
  }

  public async query(sql: string, params?: unknown[]): Promise<unknown[]> {
    try {
      return await this.executeRawQuery(sql, params)
    } catch (error) {
      if (connectionFailuresSet.has((error as NodeJS.ErrnoException).code)) {
        await this.refreshConnection()
        return await this.executeRawQuery(sql, params)
      }
      throw error
    }
  }
}
```

### Custom Error Handling

Custom errors extend `BaseError` (from `@mercadoni/instaleap-utils`). A global middleware catches them and formats them into a standardized HTTP response.

**1. Define the error class** (`src/errors/`):

```TypeScript
export class ResourceNotFoundError extends BaseError {
  constructor(message: string, details: DetailsErrors) {
    super(ErrorCategory.NOT_FOUND, message, 5, details)
  }
}
```

**2. Throw domain errors** (never throw generic `Error`):

```TypeScript
// In a service or controller
if (error.httpStatusCode?.status === 400) {
  throw new ResourceNotFoundError(`User ${id} not found`, { userId: id })
}
```

**3. Global error handler middleware** catches and formats the response:

```TypeScript
// src/api/middlewares/error-handler.middleware.ts
export const errorHandlerMiddleware = (
  err: Error | BaseError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof BaseError) {
    const httpMapping: HttpErrorMapping = httpErrorMapping[err.category]
    res.status(httpMapping.statusCode).json({
      category: err.category,
      message: err.message,
      code: err.code
    })
  } else {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
```

## 10. Git and Pull Requests

- `development`: Integration branch. Pull Requests are made against this branch.
- **No direct commits** to `development`. Always create a new branch from the updated version of `development`.
- Branch names and PR titles are derived from the associated Jira ticket name.
- **Commit Conventions**: `type: message` (max 88 chars).
- Every modification must have developer approval before merging.
- One PR = one logical change. Do not mix features with refactors.
- PR must pass: tests (95%+), lint, build.
- **CI/CD**: The project uses AWS CodeBuild (`buildspec.yml`). Do not modify CI/CD files unless explicitly instructed.

## 11. Memory Protocol (Continuous Learning)

To avoid repeating mistakes and to learn project-specific nuances:

- If we solve a complex architectural issue, a tricky bug, or establish a new micro-pattern during our chat, you must summarize the core lesson.
- Ask me if you should add this lesson to `MEMORY.md` in the project root.
- ALWAYS read `MEMORY.md` (if it exists) at the beginning of a new task to load previous context and rules.
