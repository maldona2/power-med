# Frontend - API Communication

- Use `src/lib/api.ts` Axios instance for all API calls.
- Authorization header is automatically attached from localStorage.
- Handle 401 responses by redirecting to login.
- Handle 403 responses with appropriate error messages.
- Use Zod schemas from `src/schemas/` for request/response validation.
- Show user-friendly error messages, not raw API errors.
- Implement request timeouts to prevent hanging requests.
- Use proper HTTP methods (GET, POST, PUT, DELETE, PATCH).
