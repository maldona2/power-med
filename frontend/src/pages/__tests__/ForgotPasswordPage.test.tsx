/**
 * Unit tests for ForgotPasswordPage
 * Feature: forgot-password, Task 10.2
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ForgotPasswordPage } from '../ForgotPasswordPage';
import api from '@/lib/api';

vi.mock('@/lib/api', () => ({
  default: { post: vi.fn(), get: vi.fn() },
}));

vi.mock('@/components/landing', () => ({
  AtriaxLogo: () => null,
}));

function renderPage() {
  return render(
    <BrowserRouter>
      <ForgotPasswordPage />
    </BrowserRouter>
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email field, submit button, and back link', () => {
    renderPage();

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /enviar enlace de recuperación/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /volver al inicio de sesión/i })
    ).toBeInTheDocument();
  });

  it('shows confirmation message after a successful submit', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'doctor@clinica.com');
    await userEvent.click(
      screen.getByRole('button', { name: /enviar enlace/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/si el email está registrado/i)
      ).toBeInTheDocument();
    });
  });

  it('shows confirmation message even when the API call fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Network error'));
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'doctor@clinica.com');
    await userEvent.click(
      screen.getByRole('button', { name: /enviar enlace/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/si el email está registrado/i)
      ).toBeInTheDocument();
    });
  });

  it('disables the submit button while the request is in flight', async () => {
    let resolvePost!: (value: unknown) => void;
    vi.mocked(api.post).mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      })
    );
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'doctor@clinica.com');

    const button = screen.getByRole('button', { name: /enviar enlace/i });
    await userEvent.click(button);

    // While the request is in-flight the button must be disabled.
    expect(button).toBeDisabled();

    resolvePost({ data: {} });

    await waitFor(() => {
      expect(
        screen.getByText(/si el email está registrado/i)
      ).toBeInTheDocument();
    });
  });
});
