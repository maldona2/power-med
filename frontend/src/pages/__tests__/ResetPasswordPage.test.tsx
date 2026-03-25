/**
 * Unit tests for ResetPasswordPage
 * Feature: forgot-password, Task 10.3
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ResetPasswordPage } from '../ResetPasswordPage';
import api from '@/lib/api';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('@/components/landing', () => ({
  AtriaxLogo: () => null,
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderWithToken(token?: string) {
  const url = token ? `/reset-password?token=${token}` : '/reset-password';
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<div>forgot-password</div>} />
        <Route path="/login" element={<div>login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /forgot-password when no token is present in the URL', async () => {
    renderWithToken();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password', {
        replace: true,
      });
    });
  });

  it('shows an error message when the token is invalid or expired', async () => {
    vi.mocked(api.get).mockRejectedValue({ response: { status: 400 } });
    renderWithToken('invalid-token');

    await waitFor(() => {
      expect(
        screen.getByText(
          /el enlace de recuperación no es válido o ha expirado/i
        )
      ).toBeInTheDocument();
    });
  });

  it('shows the password form when the token is valid', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });
    renderWithToken('valid-token');

    await waitFor(() => {
      expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
    });
  });

  it('shows success message and redirects to /login after a successful reset', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });

    vi.mocked(api.get).mockResolvedValue({ data: {} });
    vi.mocked(api.post).mockResolvedValue({ data: {} });

    renderWithToken('valid-token');

    await waitFor(() => {
      expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText('Nueva contraseña'),
      'newpassword123'
    );
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      'newpassword123'
    );
    await user.click(
      screen.getByRole('button', { name: /establecer nueva contraseña/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/contraseña actualizada correctamente/i)
      ).toBeInTheDocument();
    });

    vi.advanceTimersByTime(3000);

    expect(mockNavigate).toHaveBeenCalledWith('/login');

    vi.useRealTimers();
  }, 15_000);

  it('disables the submit button while the request is in flight', async () => {
    let resolvePost!: (value: unknown) => void;
    vi.mocked(api.get).mockResolvedValue({ data: {} });
    vi.mocked(api.post).mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      })
    );

    renderWithToken('valid-token');

    await waitFor(() => {
      expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
    });

    await userEvent.type(
      screen.getByLabelText('Nueva contraseña'),
      'password123'
    );
    await userEvent.type(
      screen.getByLabelText('Confirmar contraseña'),
      'password123'
    );

    const button = screen.getByRole('button', {
      name: /establecer nueva contraseña/i,
    });
    await userEvent.click(button);

    expect(button).toBeDisabled();

    resolvePost({ data: {} });

    await waitFor(() => {
      expect(
        screen.getByText(/contraseña actualizada correctamente/i)
      ).toBeInTheDocument();
    });
  });
});
