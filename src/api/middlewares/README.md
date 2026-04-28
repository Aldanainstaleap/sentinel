# Middlewares

This directory contains custom middleware functions used in the Express application. Middleware functions are used to intercept and process requests before they reach their final destination.

## Available Middleware

### `example.middleware.ts`

This is an example middleware that demonstrates how to validate a request body against a JSON schema and then pass the data to a controller.

**Functionality:**

1.  **Validation:** It uses `validateJSONSchema` to validate the request body (`req.body`) against `exampleRequestSchema`.
2.  **Controller Interaction:** It creates an instance of `ExampleController` and calls a method on it (`retrieveUserData`) with the validated data.
3.  **Response Handling:** It uses `ResponseHttpHandler` to send a success or error response to the client.

**Example Usage:**

This middleware can be used in a route to process POST requests:

```typescript
router.post('/', exampleMiddleware)
```

### `oauth.middleware.ts`

This middleware configures and validates JSON Web Tokens (JWT) for OAuth 2.0 authentication.

**Functionality:**

- **JWT Validation:** It uses the `express-jwt` library to create a middleware that validates incoming JWTs.
- **JWKS (JSON Web Key Set):** It fetches the public keys from the JWKS endpoint of the OAuth provider to verify the token's signature. The JWKS URI is constructed from the `domain` specified in the auth configuration.
- **Configuration:** It reads the `domain` and `audience` from the global application configuration (`getGlobalConfig()`).
- **Security:** It enforces the `RS256` algorithm for token verification.

**Usage:**

This middleware is applied globally in `index.routes.ts` if OAuth 2.0 is enabled:

```typescript
// in index.routes.ts
if (getGlobalConfig().AUTH_CONFIG.authType === 'OAUTH2.0') {
  router.use(checkJwtMiddleware)
  // ...
}
```

### `oauth-error-handling.middleware.ts`

This middleware handles errors that occur during the OAuth 2.0 authentication process.

**Functionality:**

- **Error Interception:** It's an Express error-handling middleware (it has four parameters: `err`, `req`, `res`, `next`).
- **Error Transformation:** It checks if the error is an `UnauthorizedError` (a common error from `express-jwt`). If so, it wraps it in a custom `AccessNotPermittedError` to provide more context.
- **Standardized Response:** It uses `ResponseHttpHandler` to send a standardized error response to the client.

**Usage:**

This middleware is applied globally in `index.routes.ts` immediately after the `checkJwtMiddleware`:

```typescript
if (getGlobalConfig().AUTH_CONFIG.authType === 'OAUTH2.0') {
  router.use(checkJwtMiddleware)
  router.use(oauthErrorHandlerMiddleware)
}
```
