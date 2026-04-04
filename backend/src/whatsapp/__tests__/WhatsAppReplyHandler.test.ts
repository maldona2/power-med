/**
 * Unit tests for WhatsAppReplyHandler
 */

// ─── DB mock ──────────────────────────────────────────────────────────────────

const mockSelect = jest.fn();
const mockFrom = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();

jest.mock('../../db/client.js', () => ({
  db: {
    select: mockSelect,
  },
  appointments: {
    id: 'appointments.id',
    tenantId: 'appointments.tenantId',
    patientId: 'appointments.patientId',
    status: 'appointments.status',
    scheduledAt: 'appointments.scheduledAt',
  },
  patients: {
    id: 'patients.id',
    tenantId: 'patients.tenantId',
    phone: 'patients.phone',
    firstName: 'patients.firstName',
  },
  users: {
    id: 'users.id',
    tenantId: 'users.tenantId',
    fullName: 'users.fullName',
  },
}));

// ─── appointmentService mock ──────────────────────────────────────────────────

const mockUpdateAppointment = jest.fn();
jest.mock('../../services/appointmentService.js', () => ({
  update: mockUpdateAppointment,
}));

// ─── drizzle-orm mock ─────────────────────────────────────────────────────────

jest.mock('drizzle-orm', () => ({
  and: (...args: unknown[]) => ({ and: args }),
  desc: (col: unknown) => ({ desc: col }),
  eq: (a: unknown, b: unknown) => ({ eq: [a, b] }),
  or: (...args: unknown[]) => ({ or: args }),
}));

// ─── imports ──────────────────────────────────────────────────────────────────

import { WhatsAppReplyHandler } from '../services/WhatsAppReplyHandler.js';
import type { MetaAPIClient } from '../services/MetaAPIClient.js';

function makeClient(): jest.Mocked<Pick<MetaAPIClient, 'sendTextMessage'>> {
  return {
    sendTextMessage: jest
      .fn()
      .mockResolvedValue({ success: true, messageId: 'mid-1' }),
  };
}

function setupDbChain(results: unknown[]) {
  // Each call to db.select().from().where()...limit() resolves to the next result
  let callIdx = 0;
  const chain = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest
      .fn()
      .mockImplementation(() => Promise.resolve(results[callIdx++] ?? [])),
  };
  mockSelect.mockReturnValue(chain);
  return chain;
}

describe('WhatsAppReplyHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateAppointment.mockResolvedValue({
      id: 'appt-1',
      status: 'confirmed',
    });
  });

  it('confirms appointment on SI reply', async () => {
    setupDbChain([
      [{ id: 'patient-1', firstName: 'María' }], // patient lookup
      [{ id: 'appt-1' }], // appointment lookup
      [{ fullName: 'Dr. Juan Pérez' }], // professional lookup
    ]);
    const client = makeClient();
    const handler = new WhatsAppReplyHandler(
      client as unknown as MetaAPIClient
    );
    await handler.handle('tenant-1', '5491112345678', 'SI');

    expect(mockUpdateAppointment).toHaveBeenCalledWith('tenant-1', 'appt-1', {
      status: 'confirmed',
    });
    expect(client.sendTextMessage).toHaveBeenCalledTimes(1);
    const [, text] = (client.sendTextMessage as jest.Mock).mock.calls[0]!;
    expect(text).toContain('confirmado');
  });

  it('cancels appointment on CANCELAR reply', async () => {
    setupDbChain([
      [{ id: 'patient-1', firstName: 'María' }],
      [{ id: 'appt-1' }],
      [{ fullName: 'Dr. Juan Pérez' }],
    ]);
    const client = makeClient();
    const handler = new WhatsAppReplyHandler(
      client as unknown as MetaAPIClient
    );
    await handler.handle('tenant-1', '5491112345678', 'CANCELAR');

    expect(mockUpdateAppointment).toHaveBeenCalledWith('tenant-1', 'appt-1', {
      status: 'cancelled',
    });
    const [, text] = (client.sendTextMessage as jest.Mock).mock.calls[0]!;
    expect(text).toContain('cancelado');
  });

  it('accepts CONFIRMAR as synonym for SI', async () => {
    setupDbChain([
      [{ id: 'patient-1', firstName: 'María' }],
      [{ id: 'appt-1' }],
      [{ fullName: 'Dr. Juan' }],
    ]);
    const client = makeClient();
    const handler = new WhatsAppReplyHandler(
      client as unknown as MetaAPIClient
    );
    await handler.handle('tenant-1', '5491112345678', 'CONFIRMAR');
    expect(mockUpdateAppointment).toHaveBeenCalledWith('tenant-1', 'appt-1', {
      status: 'confirmed',
    });
  });

  it('accepts NO as synonym for CANCELAR', async () => {
    setupDbChain([
      [{ id: 'patient-1', firstName: 'María' }],
      [{ id: 'appt-1' }],
      [{ fullName: 'Dr. Juan' }],
    ]);
    const client = makeClient();
    const handler = new WhatsAppReplyHandler(
      client as unknown as MetaAPIClient
    );
    await handler.handle('tenant-1', '5491112345678', 'no');
    expect(mockUpdateAppointment).toHaveBeenCalledWith('tenant-1', 'appt-1', {
      status: 'cancelled',
    });
  });

  it('ignores unrecognised keywords', async () => {
    const client = makeClient();
    const handler = new WhatsAppReplyHandler(
      client as unknown as MetaAPIClient
    );
    await handler.handle('tenant-1', '5491112345678', 'Hola, ¿cómo están?');
    expect(mockSelect).not.toHaveBeenCalled();
    expect(mockUpdateAppointment).not.toHaveBeenCalled();
  });

  it('does nothing when patient is not found', async () => {
    setupDbChain([
      [], // patient not found
    ]);
    const client = makeClient();
    const handler = new WhatsAppReplyHandler(
      client as unknown as MetaAPIClient
    );
    await handler.handle('tenant-1', '5491112345678', 'SI');
    expect(mockUpdateAppointment).not.toHaveBeenCalled();
    expect(client.sendTextMessage).not.toHaveBeenCalled();
  });

  it('does nothing when no pending appointment is found', async () => {
    setupDbChain([
      [{ id: 'patient-1', firstName: 'María' }],
      [], // no pending appointment
    ]);
    const client = makeClient();
    const handler = new WhatsAppReplyHandler(
      client as unknown as MetaAPIClient
    );
    await handler.handle('tenant-1', '5491112345678', 'SI');
    expect(mockUpdateAppointment).not.toHaveBeenCalled();
  });

  it('does not throw when updateAppointment fails', async () => {
    setupDbChain([
      [{ id: 'patient-1', firstName: 'María' }],
      [{ id: 'appt-1' }],
      [{ fullName: 'Dr. Juan' }],
    ]);
    mockUpdateAppointment.mockRejectedValue(new Error('DB error'));
    const client = makeClient();
    const handler = new WhatsAppReplyHandler(
      client as unknown as MetaAPIClient
    );
    await expect(
      handler.handle('tenant-1', '5491112345678', 'SI')
    ).resolves.not.toThrow();
    expect(client.sendTextMessage).not.toHaveBeenCalled();
  });
});
