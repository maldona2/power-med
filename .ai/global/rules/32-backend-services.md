# Backend - Service Layer

- All business logic must live in `src/services/`.
- Services should be stateless and reusable.
- Services should not directly access request/response objects.
- Pass only necessary data to services (not entire req/res objects).
- Services should throw errors; let route handlers catch and respond.
- Keep services focused on a single domain (patients, appointments, payments, etc.).
- Use dependency injection for testability when appropriate.
- Document complex business logic with comments.
