# Errors

This directory contains custom error classes used throughout the application. Using custom errors allows for more specific error handling and provides more context than generic `Error` objects.

## Base Error (`base.error.ts`)

The `BaseError` class is the foundation for all custom errors in the application. It extends the built-in `Error` class and adds several useful features.

**Features:**

- **`message`**: A detailed, developer-facing error message.
- **`name`**: The name of the error class. I.e, `ValidationSchemaError`
- **`code`**: A unique numeric code for the error, making it easy to identify programmatically.
- **`details`**: An optional property to hold any additional data related to the error.
- **`userMessage`**: An optional, user-friendly message that can be safely displayed to the end-user.
- **`userDetails`**: Optional, user-facing details.
- **Automatic Logging**: The constructor automatically calls a `log` method to print the error details to the console, ensuring that all custom errors are logged by default.

## Specific Error Classes

This directory contains several classes that extend `BaseError` for different scenarios:

- **`auth.errors.ts`**:

  - `AccessNotPermittedError`: Thrown when an authentication attempt fails. It can include details about the request and the token used.

- **`configuration.errors.ts`**:

  - `ConfigurationError`: Thrown for general configuration-related errors.
  - `MissingEnvironmentVariablesError`: Thrown when required environment variables are not set.

- **`dependency.errors.ts`**:

  - `DependencyError`: A generic error for dependency-related issues.
  - `DependencyNotLoadedError`: Thrown when a required service or dependency fails to load.

- **`not-found.error.ts`**:
  - `NotFoundError`: A generic error for resources that cannot be found.
  - `APINotFoundError`: Thrown when an API endpoint is not found.

### Example Usage

```typescript
import { ConfigurationError } from './configuration.errors'

if (configIsInvalid) {
  throw new ConfigurationError('Invalid configuration setting', {
    setting: 'value'
  })
}
```
