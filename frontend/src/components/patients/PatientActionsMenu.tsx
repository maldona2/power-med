import { useState } from 'react';
import { Eye, Pencil, Trash, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/api';
import type { Patient } from '@/types';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

interface PatientActionsMenuProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onView?: (patient: Patient) => void;
  refetch: () => void;
}

export function PatientActionsMenu({
  patient,
  onEdit,
  onView,
  refetch,
}: PatientActionsMenuProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = () => {
    onView?.(patient);
  };

  const handleEdit = () => {
    onEdit(patient);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/patients/${patient.id}`);
      toast.success('Paciente eliminado exitosamente');
      setDeleteDialogOpen(false);
      // Refetch the patient list to update the UI
      refetch();
    } catch (error: any) {
      const message =
        error.response?.status === 404
          ? 'No se pudo eliminar el paciente: Paciente no encontrado'
          : error.response?.status === 403
            ? 'No tienes permisos para eliminar este paciente'
            : error.message?.includes('Network')
              ? 'Error de conexión. Por favor, intenta de nuevo'
              : 'Error del servidor. Por favor, intenta más tarde';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Abrir acciones para ${patient.first_name} ${patient.last_name}`}
          >
            <MoreVertical className="size-4" />
            <span className="sr-only">Acciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="size-4" />
            Ver
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="size-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDeleteClick} variant="destructive">
            <Trash className="size-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        patientName={`${patient.first_name} ${patient.last_name}`}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </>
  );
}
