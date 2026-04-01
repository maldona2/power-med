# Backend - Express.js

- Register all routes in `src/app.ts`.
- `errorHandler` middleware must remain the last middleware in the chain.
- Use async/await for all asynchronous operations.
- Always handle errors with try-catch blocks in route handlers.
- Return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500).
- Use Express Router for modular route organization.
- Validate request bodies before processing.
- Never expose internal error details to clients in production.
