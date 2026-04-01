# Security

## Authentication & Authorization

- Never store passwords in plain text; always hash with bcrypt.
- Validate JWT tokens on every protected route.
- Implement rate limiting on authentication endpoints.
- Use HTTPS in production for all communications.
- Rotate JWT secrets periodically.

## Data Protection

- Always filter by `tenantId` to prevent data leakage.
- Sanitize user inputs to prevent SQL injection.
- Validate and sanitize all data before database operations.
- Never expose sensitive data in error messages.
- Encrypt sensitive data at rest (e.g., Google Calendar tokens).

## API Security

- Implement CORS with specific allowed origins.
- Use helmet.js for security headers.
- Validate request payloads against schemas.
- Implement request size limits.
- Log security-relevant events (failed logins, unauthorized access attempts).

## Environment Variables

- Never commit `.env` files to version control.
- Use `.env.example` to document required variables.
- Validate required environment variables on startup.
- Use different credentials for development and production.
