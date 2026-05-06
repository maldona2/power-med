import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppointments } from './useAppointments';

/**
 * Hook that monitors today's appointments and displays toast notifications
 * when appointment times arrive. Notifications include patient information
 * and a quick action button to navigate to the patient's detail page.
 *
 * Requirements: 1.1, 1.4, 1.5, 6.1
 */
export function useAppointmentNotifications(): void {
  // Track which appointments have already triggered notifications to prevent duplicates
  const notifiedAppointmentIds = useRef<Set<string>>(new Set());

  // Track the current date to detect day changes and reset notification state
  const currentDate = useRef<string>(new Date().toISOString().slice(0, 10));

  const navigate = useNavigate();

  // Fetch today's appointments
  const { appointments, setDate, refetch } = useAppointments();

  // Set the date filter to today on mount
  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, [setDate]);

  // Refetch appointments every 30 seconds to pick up new appointments
  useEffect(() => {
    const refetchInterval = setInterval(() => {
      refetch({ silent: true });
    }, 30000); // Refetch every 30 seconds

    return () => clearInterval(refetchInterval);
  }, [refetch]);

  // Pre-mark past appointments as notified so stale ones don't fire on mount
  useEffect(() => {
    const now = new Date();
    appointments.forEach((appointment) => {
      try {
        const appointmentTime = new Date(appointment.scheduled_at);
        if (!isNaN(appointmentTime.getTime()) && appointmentTime < now) {
          notifiedAppointmentIds.current.add(appointment.id);
        }
      } catch {
        // ignore
      }
    });
  }, [appointments]);

  useEffect(() => {
    const checkAppointments = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const today = now.toISOString().slice(0, 10);
      if (today !== currentDate.current) {
        notifiedAppointmentIds.current.clear();
        currentDate.current = today;
      }

      const relevantAppointments = appointments.filter(
        (appointment) =>
          appointment.status === 'pending' ||
          appointment.status === 'confirmed'
      );

      relevantAppointments.forEach((appointment) => {
        if (notifiedAppointmentIds.current.has(appointment.id)) {
          return;
        }

        try {
          const appointmentTime = new Date(appointment.scheduled_at);

          if (isNaN(appointmentTime.getTime())) {
            console.error(
              `Invalid scheduled_at for appointment ${appointment.id}`
            );
            return;
          }

          const appointmentHour = appointmentTime.getHours();
          const appointmentMinute = appointmentTime.getMinutes();

          const isTimeMatch =
            currentHour === appointmentHour &&
            currentMinute === appointmentMinute;

          if (isTimeMatch) {
            notifiedAppointmentIds.current.add(appointment.id);

            const patientName =
              [appointment.patient_first_name, appointment.patient_last_name]
                .filter(Boolean)
                .join(' ') || 'Paciente';

            const formattedTime = appointmentTime.toLocaleTimeString('es-AR', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: false,
            });

            const toastOptions: any = {
              id: 'appointment-reminder',
              description: `${patientName} - ${formattedTime}`,
              duration: 60000,
              cancel: {
                label: 'Cerrar',
                onClick: () => {},
              },
            };

            if (appointment.patient_id) {
              toastOptions.action = {
                label: 'Ver paciente',
                onClick: () =>
                  navigate(`/app/patients/${appointment.patient_id}`),
              };
            }

            toast('Turno ahora', toastOptions);
          }
        } catch (error) {
          console.error(
            `Error parsing scheduled_at for appointment ${appointment.id}:`,
            error
          );
        }
      });
    };

    checkAppointments();
    const intervalId = setInterval(checkAppointments, 60000);

    return () => clearInterval(intervalId);
  }, [appointments, navigate]);
}
