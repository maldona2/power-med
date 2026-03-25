/**
 * Property-based tests for ForgotPasswordPage
 * Feature: forgot-password, Property 4
 */
import { describe, it, vi, beforeEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { ForgotPasswordPage } from '../ForgotPasswordPage';
import api from '@/lib/api';

vi.mock('@/lib/api', () => ({
  default: { post: vi.fn(), get: vi.fn() },
}));

vi.mock('@/components/landing', () => ({
  AtriaxLogo: () => null,
}));

describe('ForgotPasswordPage — property-based tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Property 4: any string without "@" is rejected client-side without an API call', () => {
    // Strings matching this regex never contain "@" so they always fail the
    // email regex used by ForgotPasswordPage (isValidEmail).
    const noAtArb = fc.stringMatching(/^[a-zA-Z0-9._-]{1,40}$/);

    fc.assert(
      fc.property(noAtArb, (invalidEmail) => {
        vi.mocked(api.post).mockClear();

        const { getByLabelText, getByRole, unmount } = render(
          <MemoryRouter>
            <ForgotPasswordPage />
          </MemoryRouter>
        );

        fireEvent.change(getByLabelText('Email'), {
          target: { value: invalidEmail },
        });
        fireEvent.submit(
          getByRole('button', { name: /enviar enlace/i }).closest('form')!
        );

        // The component must not call the API for an invalid email.
        expect(vi.mocked(api.post)).not.toHaveBeenCalled();

        unmount();
        cleanup();
      }),
      { numRuns: 100 }
    );
  });
});
