# Mappings

This directory contains files responsible for mapping data from one format or structure to another. This is particularly useful for transforming error objects or other data structures into a consistent format.

## `error.maps.ts`

This file provides a function to map different types of errors to a standardized `ErrorDetails` object.

**Functionality:**

- **`mapErrorToErrorDetails`**: This function takes an `unknown` error object and converts it into an `ErrorDetails` object.
  - If the error is an instance of `BaseError`, it extracts the relevant properties (`code`, `message`, `userMessage`, `userDetails`).
  - If the error is a standard `Error`, it creates an `ErrorDetails` object with a default code (`-1`) and uses the error's message.
  - For any other type of error, it returns a generic `ErrorDetails` object for an unknown error.

## `postgres-error.map.ts`

This file maps PostgreSQL error codes to more specific, custom error classes.

**Functionality:**

- **`postgresErrorMap`**: A `Map` that associates PostgreSQL error codes with corresponding custom error classes from the `errors` directory.
- **`mapPostgresError`**: This function takes a PostgreSQL error object, checks its code against the `postgresErrorMap`, and returns an instance of the appropriate custom error class. If no mapping is found, it returns a generic `PostgresError`.
