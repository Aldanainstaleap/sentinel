# Interfaces

This directory contains TypeScript interfaces that define data structures and contracts within the application. Using interfaces helps to enforce type safety and improve code readability.

## Available Interfaces

### `commons.interfaces.ts`

This file contains common interfaces used across different parts of the application.

- **`ValidationError`**: Defines the structure for a validation error object, including the expected format and the supplied object that failed validation.
- **`CSVReadingDeteiledErrors`**: Describes the structure for errors that occur while reading a CSV file, including an error message and the row number.
- **`Service`**: A simple contract for services, ensuring that they have a `getInstance` method.

### `configurations.interfaces.ts`

This file defines the interfaces for the application's configuration.

- **`GlobalConfiguration`**: The main interface for the global configuration, which includes settings for the port, database, authentication, and CORS.
- **`DatabaseConfig`**: Defines the structure for the database configuration, including the engine, host, username, password, and port.
- **`AuthConfig`**: Defines the configuration for authentication, including the auth type, OAuth settings, and users for API documentation.
- **`OauthConfig`**: Specifies the configuration for OAuth 2.0, such as the client ID, domain, and audience.
- **`ApidocsUsers`**: A simple key-value interface for storing usernames and passwords for API documentation access.
- **`CorsConfig`**: Defines the configuration for CORS, including a whitelist of allowed domains.

### `error.interfaces.ts`

This file contains interfaces related to error handling.

- **`ErrorDetails`**: Defines the structure for detailed error information, including a code, message, and optional user-facing message and details.

### `example.interfaces.ts`

This file contains interfaces related to the example feature.

- **`ExampleInterface`**: A simple interface that defines the expected structure for an example object, which has a `name` property of type `string`.

### `http.interfaces.ts`

This file defines interfaces related to HTTP requests and responses.

- **`BulkResponse`**: Defines the structure for a bulk operation response, with arrays for fulfilled and rejected promises.
- **`ResponseData`**: Describes the data for a single HTTP response, including the status code, response data, response time, and the original request data.
- **`RequestData`**: Defines the structure for an HTTP request, including the URL, method, headers, and body.
- **`StandardResponse`**: Defines the standard structure for all API responses, including a process ID, a message, an error code, error details, and a payload. This ensures consistency across all endpoints.
