# Testing

## Backend Testing (Jest)

- Write unit tests for services and business logic.
- Use property-based testing for complex validation logic.
- Mock external dependencies (database, APIs, email service).
- Test error handling paths, not just happy paths.
- Run tests with `npm test` from backend directory.
- Aim for high coverage on critical business logic.

## Frontend Testing (Vitest)

- Write unit tests for utility functions and hooks.
- Write integration tests for complex components.
- Mock API calls in component tests.
- Test user interactions and state changes.
- Run tests with `npm test` from frontend directory.
- Use Vitest UI for debugging: `npm run test:ui`.

## Test Organization

- Place tests in `__tests__` directories or adjacent to source files.
- Use descriptive test names that explain what is being tested.
- Follow Arrange-Act-Assert pattern.
- Keep tests independent; avoid shared state between tests.
