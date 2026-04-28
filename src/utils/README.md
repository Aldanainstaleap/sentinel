# Utils

This directory contains utility functions that can be reused across the application. These functions provide common, reusable logic for tasks like data manipulation, HTTP requests, and validation.

## Available Utilities

### `http.responses.utils.ts`

- **`ResponseHttpHandler` (class)**: A class to standardize HTTP responses.
  - **`handleSuccess(message, payload, statusCode)`**: Sends a standardized success response.
  - **`handleError(error)`**: Sends a standardized error response, mapping custom error codes to HTTP status codes using `httpResponsesMap`.
