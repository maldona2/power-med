import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { PatientActionsMenu } from '../PatientActionsMenu';
import type { Patient } from '@/types';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/api', () => ({
  default: {
    delete: vi.fn(),
  },
}));

const mockPatient: Patient = {
  id: 'patient-123',
  tenant_id: 'tenant-1',
  first_name: 'John',
  last_name: 'Doe',
  phone: '555-1234',
  email: 'john.doe@example.com',
  date_of_birth: '1990-01-15',
  notes: 'Test patient',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('PatientActionsMenu - Task 3: Edit Action', () => {
  it('should call onEdit callback with patient when Edit menu item is clicked', async () => {
    const user = userEvent.setup();
    const onEditMock = vi.fn();
    const refetchMock = vi.fn();

    render(
      <BrowserRouter>
        <PatientActionsMenu
          patient={mockPatient}
          onEdit={onEditMock}
          refetch={refetchMock}
        />
      </BrowserRouter>
    );

    // Open the dropdown menu
    const menuTrigger = screen.getByRole('button', {
      name: /abrir acciones para john doe/i,
    });
    await user.click(menuTrigger);

    // Click the Edit menu item
    const editMenuItem = screen.getByRole('menuitem', { name: /editar/i });
    await user.click(editMenuItem);

    // Verify onEdit was called with the correct patient
    expect(onEditMock).toHaveBeenCalledTimes(1);
    expect(onEditMock).toHaveBeenCalledWith(mockPatient);
  });

  it('should display Edit menu item with Pencil icon as second option', async () => {
    const user = userEvent.setup();
    const onEditMock = vi.fn();
    const refetchMock = vi.fn();

    render(
      <BrowserRouter>
        <PatientActionsMenu
          patient={mockPatient}
          onEdit={onEditMock}
          refetch={refetchMock}
        />
      </BrowserRouter>
    );

    // Open the dropdown menu
    const menuTrigger = screen.getByRole('button', {
      name: /abrir acciones para john doe/i,
    });
    await user.click(menuTrigger);

    // Get all menu items
    const menuItems = screen.getAllByRole('menuitem');

    // Verify Edit is the second option (index 1)
    expect(menuItems).toHaveLength(3);
    expect(menuItems[1]).toHaveTextContent('Editar');
  });

  it('should close menu after Edit action is clicked', async () => {
    const user = userEvent.setup();
    const onEditMock = vi.fn();
    const refetchMock = vi.fn();

    render(
      <BrowserRouter>
        <PatientActionsMenu
          patient={mockPatient}
          onEdit={onEditMock}
          refetch={refetchMock}
        />
      </BrowserRouter>
    );

    // Open the dropdown menu
    const menuTrigger = screen.getByRole('button', {
      name: /abrir acciones para john doe/i,
    });
    await user.click(menuTrigger);

    // Verify menu is open
    expect(
      screen.getByRole('menuitem', { name: /editar/i })
    ).toBeInTheDocument();

    // Click the Edit menu item
    const editMenuItem = screen.getByRole('menuitem', { name: /editar/i });
    await user.click(editMenuItem);

    // Verify menu is closed (menu items should not be visible)
    expect(
      screen.queryByRole('menuitem', { name: /editar/i })
    ).not.toBeInTheDocument();
  });
});
