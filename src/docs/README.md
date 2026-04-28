# Documentation

This directory contains files related to project documentation, specifically for generating API documentation using Swagger.

## Swagger Setup (`swagger.ts`)

This file configures and initializes `swagger-jsdoc` to generate an OpenAPI 3.0 specification for the API.

### Configuration (`swaggerDefinition`)

- **`openapi`**: Specifies the OpenAPI version (`3.0.3`).
- **`info`**: Contains basic information about the API.
  - **`title`**: The title of the API, which is "Skrull".
  - **`version`**: The version of the API, "1.0.0".
- **`servers`**: An array of servers where the API is hosted. In this case, it's configured for a local development server at `http://localhost:3000`.
- **`components`**: A section for defining reusable components, such as schemas.
  - **`schemas`**: It registers the `exampleRequestSchema` under the name `ExampleSchema`, making it available for use in the Swagger documentation. I.e, with `$ref: "#/components/schemas/ExampleSchema"`.

### Options (`swaggerOptions`)

- **`swaggerDefinition`**: The configuration object defined above.
- **`apis`**: An array of file paths where `swagger-jsdoc` should look for route definitions and annotations. It dynamically checks for `.ts` or `.js` files in the `src/api/routes` directory, making it compatible with both TypeScript and compiled JavaScript environments.

### Export

The file exports the result of `swaggerJSDoc(swaggerOptions)`, which is the complete OpenAPI specification in JSON format. This specification is then used by `swagger-ui-express` to render the interactive API documentation.

## How It Works

1.  **Annotations:** Developers add JSDoc comments with Swagger annotations to the route files in `src/api/routes`. I.e, `@swagger`, `@param`, `@returns`
2.  **Generation:** `swagger-jsdoc` parses these comments and generates a JSON object that conforms to the OpenAPI specification.
3.  **Serving:** The generated specification is served by `swagger-ui-express` at the `/docs` endpoint, providing an interactive UI for exploring and testing the API.
