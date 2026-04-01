# Frontend - State Management

## Global State

- Use `AuthContext` for authentication state (user, token, tenantId).
- Keep global state minimal; prefer local state when possible.
- Context providers should be placed in `src/contexts/`.

## Local State

- Use `useState` for component-local state.
- Use `useReducer` for complex state logic.
- Lift state up only when multiple components need access.

## Server State

- Use custom hooks in `src/hooks/` for data fetching.
- Handle loading, error, and success states consistently.
- Cache data appropriately to reduce API calls.
- Invalidate cache when data changes (after create/update/delete).
