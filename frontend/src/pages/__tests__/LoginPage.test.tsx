/**
 * Unit tests for LoginPage
 * Feature: forgot-password, Task 10.1
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('@/components/landing', () => ({
  AtriaxLogo: () => null,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    logout: vi.fn(),
    user: null,
    token: null,
    isLoading: false,
    role: null,
    tenantId: null,
    refreshUser: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  it('renders the forgot-password link', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const link = screen.getByRole('link', { name: /olvidaste tu contraseña/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/forgot-password');
  });
});
