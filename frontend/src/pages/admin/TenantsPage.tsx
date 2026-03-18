import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Tenant } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

type SubscriptionPlan = 'free' | 'pro' | 'gold';
type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

function PlanBadge({ plan }: { plan?: SubscriptionPlan }) {
  const p = plan ?? 'free';
  const styles: Record<SubscriptionPlan, string> = {
    free: 'bg-muted text-muted-foreground',
    pro: 'bg-blue-100 text-blue-700',
    gold: 'bg-amber-100 text-amber-700',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[p]}`}
    >
      {p}
    </span>
  );
}

function StatusBadge({ status }: { status?: SubscriptionStatus }) {
  const s = status ?? 'active';
  const styles: Record<SubscriptionStatus, string> = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  const labels: Record<SubscriptionStatus, string> = {
    active: 'Activo',
    paused: 'Pausado',
    cancelled: 'Cancelado',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[s]}`}
    >
      {labels[s]}
    </span>
  );
}

function EditSubscriptionDialog({
  tenant,
  onUpdated,
}: {
  tenant: Tenant;
  onUpdated: (plan: SubscriptionPlan, status: SubscriptionStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<SubscriptionPlan>(
    tenant.subscription_plan ?? 'free'
  );
  const [status, setStatus] = useState<SubscriptionStatus>(
    tenant.subscription_status ?? 'active'
  );
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) {
      setPlan(tenant.subscription_plan ?? 'free');
      setStatus(tenant.subscription_status ?? 'active');
    }
    setOpen(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/admin/tenants/${tenant.id}/subscription`, {
        plan,
        status,
      });
      toast.success('Suscripción actualizada');
      onUpdated(plan, status);
      setOpen(false);
    } catch {
      toast.error('Error al actualizar suscripción');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Editar suscripción">
          <CreditCard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar suscripción</DialogTitle>
            <DialogDescription>
              Modifica el plan y estado de suscripción de{' '}
              <strong>{tenant.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Plan</Label>
              <Select
                value={plan}
                onValueChange={(v) => setPlan(v as SubscriptionPlan)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as SubscriptionStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    email: '',
    password: '',
    fullName: '',
  });

  async function fetchTenants() {
    setLoading(true);
    try {
      const { data } = await api.get<Tenant[]>('/admin/tenants');
      setTenants(data);
    } catch (err) {
      toast.error('Error al cargar profesionales');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTenants();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/tenants', {
        name: form.name,
        slug: form.slug || undefined,
        email: form.email,
        password: form.password,
        fullName: form.fullName || undefined,
      });
      toast.success('Profesional creado correctamente');
      setDialogOpen(false);
      setForm({ name: '', slug: '', email: '', password: '', fullName: '' });
      fetchTenants();
    } catch (err: unknown) {
      const data =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response
          ? (err.response as { data?: { error?: { message?: string } } }).data
          : null;
      toast.error(data?.error?.message || 'Error al crear profesional');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubscriptionUpdated(
    tenantId: string,
    plan: SubscriptionPlan,
    status: SubscriptionStatus
  ) {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenantId
          ? { ...t, subscription_plan: plan, subscription_status: status }
          : t
      )
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profesionales</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nuevo profesional</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Crear profesional</DialogTitle>
                <DialogDescription>
                  Crea una cuenta para un nuevo profesional. Se generará un
                  tenant con su usuario.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Nombre del profesional / consultorio
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug (opcional)</Label>
                  <Input
                    id="slug"
                    placeholder="ej: dra-garcia"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    required
                    minLength={8}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Nombre completo (opcional)</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Estado sub.</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.slug}</TableCell>
                <TableCell>{t.user_email ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={t.is_active ? 'default' : 'secondary'}>
                    {t.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <PlanBadge plan={t.subscription_plan} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={t.subscription_status} />
                </TableCell>
                <TableCell>
                  <EditSubscriptionDialog
                    tenant={t}
                    onUpdated={(plan, status) =>
                      handleSubscriptionUpdated(t.id, plan, status)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
