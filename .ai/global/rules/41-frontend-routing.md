# Frontend - React Router

- All routes defined in `src/App.tsx`.
- Use `ProtectedRoute` wrapper for authenticated routes.
- Use `PublicRoute` wrapper for unauthenticated routes (login, register).
- Redirect to login page when authentication fails.
- Use route parameters for dynamic segments (e.g., `/patients/:id`).
- Implement 404 page for unmatched routes.
- Use `useNavigate` hook for programmatic navigation.
- Avoid inline route definitions; keep route structure clear and organized.
