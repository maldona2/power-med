/**
 * Property-based tests for ResetPasswordPage
 * Feature: forgot-password, Properties 10 and 11
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as fc from 'fast-check';
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

describe('ResetPasswordPage — property-based tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Property 10: password shorter than 8 characters is rejected client-side without an API call', async () => {
    const shortPasswordArb = fc.string({ maxLength: 7 });

    await fc.assert(
      fc.asyncProperty(shortPasswordArb, async (shortPassword) => {
        vi.mocked(api.post).mockClear();
        vi.mocked(api.get).mockResolvedValue({ data: {} });

        const { getByLabelText, getByRole, unmount } = render(
          <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
            <Routes>
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/forgot-password" element={<div />} />
            </Routes>
          </MemoryRouter>
        );

        // Wait for the token validation to resolve and the form to appear.
        await waitFor(() =>
          expect(getByLabelText('Nueva contraseña')).toBeInTheDocument()
        );

        fireEvent.change(getByLabelText('Nueva contraseña'), {
          target: { value: shortPassword },
        });
        fireEvent.change(getByLabelText('Confirmar contraseña'), {
          target: { value: shortPassword },
        });
        fireEvent.click(
          getByRole('button', { name: /establecer nueva contraseña/i })
        );

        // The component must not call the reset API for a short password.
        expect(vi.mocked(api.post)).not.toHaveBeenCalled();

        unmount();
        cleanup();
      }),
      { numRuns: 50 }
    );
  }, 30_000);

  it('Property 11: two distinct passwords >= 8 chars show mismatch error without an API call', async () => {
    const distinctPasswordsArb = fc
      .tuple(
        fc.string({ minLength: 8, maxLength: 20 }),
        fc.string({ minLength: 8, maxLength: 20 })
      )
      .filter(([p1, p2]) => p1 !== p2);

    await fc.assert(
      fc.asyncProperty(
        distinctPasswordsArb,
        async ([password, confirmPassword]) => {
          vi.mocked(api.post).mockClear();
          vi.mocked(api.get).mockResolvedValue({ data: {} });

          const { getByLabelText, getByRole, unmount } = render(
            <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
              <Routes>
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/forgot-password" element={<div />} />
              </Routes>
            </MemoryRouter>
          );

          await waitFor(() =>
            expect(getByLabelText('Nueva contraseña')).toBeInTheDocument()
          );

          fireEvent.change(getByLabelText('Nueva contraseña'), {
            target: { value: password },
          });
          fireEvent.change(getByLabelText('Confirmar contraseña'), {
            target: { value: confirmPassword },
          });
          fireEvent.click(
            getByRole('button', { name: /establecer nueva contraseña/i })
          );

          expect(vi.mocked(api.post)).not.toHaveBeenCalled();
          expect(
            screen.getByText('Las contraseñas no coinciden')
          ).toBeInTheDocument();

          unmount();
          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  }, 30_000);
});
