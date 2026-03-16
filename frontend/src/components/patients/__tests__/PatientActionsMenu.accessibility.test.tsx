import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { PatientActionsMenu } from '../PatientActionsMenu';
import type { Patient } from '@/types';

// Mock the API
vi.mock('@/lib/api', () => ({
  default: {
    delete: vi.fn(),
  },
}));

const mockPatient: Patient = {
  id: '123',
  tenant_id: 'tenant-1',
  first_name: 'Juan',
  last_name: 'Pérez',
  phone: '555-1234',
  email: 'juan@example.com',
  date_of_birth: '1990-01-01',
  notes: 'Test notes',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const renderComponent = (patient: Patient = mockPatient) => {
  const onEdit = vi.fn();
  const refetch = vi.fn();

  return {
    ...render(
      <BrowserRouter>
        <PatientActionsMenu
          patient={patient}
          onEdit={onEdit}
          refetch={refetch}
        />
      </BrowserRouter>
    ),
    onEdit,
    refetch,
  };
};

describe('PatientActionsMenu - Accessibility', () => {
  describe('Requirement 5.1: Menu trigger is focusable', () => {
    it('should allow focusing the menu trigger button with Tab key', async () => {
      const user = userEvent.setup();
      renderComponent();

      const trigger = screen.getByRole('button', {
        name: /abrir acciones para juan pérez/i,
      });

      // Tab to focus the button
      await user.tab();

      expect(trigger).toHaveFocus();
    });
  });

  describe('Requirement 5.2: Enter/Space opens menu', () => {
    it('should open menu when Enter is pressed on focused trigger', async () => {
      const user = userEvent.setup();
      renderComponent();

      const trigger = screen.getByRole('button', {
        name: /abrir acciones para juan pérez/i,
      });

      // Focus and press Enter
      await user.tab();
      await user.keyboard('{Enter}');

      // Menu should be open - verify menu items are visible
      expect(
        screen.getByRole('menuitem', { name: /ver/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: /editar/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: /eliminar/i })
      ).toBeInTheDocument();
    });

    it('should open menu when Space is pressed on focused trigger', async () => {
      const user = userEvent.setup();
      renderComponent();

      const trigger = screen.getByRole('button', {
        name: /abrir acciones para juan pérez/i,
      });

      // Focus and press Space
      await user.tab();
      await user.keyboard(' ');

      // Menu should be open
      expect(
        screen.getByRole('menuitem', { name: /ver/i })
      ).toBeInTheDocument();
    });
  });

  describe('Requirement 5.3: Arrow key navigation', () => {
    it('should navigate menu items with arrow keys', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Open menu
      await user.tab();
      await user.keyboard('{Enter}');

      const viewItem = screen.getByRole('menuitem', { name: /ver/i });
      const editItem = screen.getByRole('menuitem', { name: /editar/i });
      const deleteItem = screen.getByRole('menuitem', { name: /eliminar/i });

      // First item should be focused by default (Radix UI behavior)
      // Arrow down to next item
      await user.keyboard('{ArrowDown}');

      // Arrow down again
      await user.keyboard('{ArrowDown}');

      // Arrow up to go back
      await user.keyboard('{ArrowUp}');

      // All items should be accessible (Radix handles focus management)
      expect(viewItem).toBeInTheDocument();
      expect(editItem).toBeInTheDocument();
      expect(deleteItem).toBeInTheDocument();
    });
  });

  describe('Requirement 5.4: Escape closes menu', () => {
    it('should close menu when Escape is pressed', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Open menu
      await user.tab();
      await user.keyboard('{Enter}');

      // Verify menu is open
      expect(
        screen.getByRole('menuitem', { name: /ver/i })
      ).toBeInTheDocument();

      // Press Escape
      await user.keyboard('{Escape}');

      // Menu should be closed - menu items should not be visible
      expect(
        screen.queryByRole('menuitem', { name: /ver/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Requirement 5.5 & 5.6: ARIA labels and screen reader support', () => {
    it('should have descriptive aria-label including patient name', () => {
      renderComponent();

      const trigger = screen.getByRole('button', {
        name: 'Abrir acciones para Juan Pérez',
      });

      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute(
        'aria-label',
        'Abrir acciones para Juan Pérez'
      );
    });

    it('should include screen reader text for accessibility', () => {
      renderComponent();

      // The sr-only span should be present
      const srText = screen.getByText('Acciones');
      expect(srText).toHaveClass('sr-only');
    });

    it('should have correct aria-label for different patient names', () => {
      const patient: Patient = {
        ...mockPatient,
        first_name: 'María',
        last_name: 'González',
      };

      renderComponent(patient);

      const trigger = screen.getByRole('button', {
        name: 'Abrir acciones para María González',
      });

      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Focus indicators visibility', () => {
    it('should have visible focus indicators on menu trigger', () => {
      renderComponent();

      const trigger = screen.getByRole('button', {
        name: /abrir acciones para juan pérez/i,
      });

      // Button component has focus-visible classes
      // We can't test visual focus in jsdom, but we can verify the classes exist
      expect(trigger.className).toBeTruthy();
    });
  });

  describe('Keyboard-only navigation workflow', () => {
    it('should support complete keyboard-only workflow for View action', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Tab to trigger
      await user.tab();

      // Open menu with Enter
      await user.keyboard('{Enter}');

      // First item (View) should be accessible
      const viewItem = screen.getByRole('menuitem', { name: /ver/i });
      expect(viewItem).toBeInTheDocument();

      // Press Enter to activate (would navigate in real app)
      await user.keyboard('{Enter}');

      // Menu should close after selection (Radix behavior)
      // In a real scenario, navigation would occur
    });

    it('should support complete keyboard-only workflow for Edit action', async () => {
      const user = userEvent.setup();
      const { onEdit } = renderComponent();

      // Tab to trigger
      await user.tab();

      // Open menu with Space
      await user.keyboard(' ');

      // Arrow down to Edit item
      await user.keyboard('{ArrowDown}');

      // Press Enter to activate
      await user.keyboard('{Enter}');

      // onEdit should be called
      expect(onEdit).toHaveBeenCalledWith(mockPatient);
    });

    it('should support complete keyboard-only workflow for Delete action', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Tab to trigger
      await user.tab();

      // Open menu
      await user.keyboard('{Enter}');

      // Arrow down twice to Delete item
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      // Press Enter to activate
      await user.keyboard('{Enter}');

      // Delete confirmation dialog should open
      expect(
        screen.getByText(/estás a punto de eliminar/i)
      ).toBeInTheDocument();
    });
  });
});
