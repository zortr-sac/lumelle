"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Trash2, Mail, Instagram } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  createStaff,
  deleteStaff,
  inviteStaffByEmail,
} from "@/server/actions/staff";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Staff = {
  id: string;
  display_name: string;
  role_label: string | null;
  color: string | null;
  instagram: string | null;
  is_bookable: boolean;
  photo_url: string | null;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
};

const PRESET_COLORS = [
  "#5C435D",
  "#E9B7B8",
  "#D8C7D9",
  "#E9B7B8",
  "#6F8F82",
  "#E8D3BD",
];

export function TeamManager({
  staff,
  invitations,
}: {
  staff: Staff[];
  invitations: Invitation[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [inviting, setInviting] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="glass-card-strong">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg">Técnicas</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="glass"
                onClick={() => setInviting(true)}
              >
                <Mail className="size-4" /> Invitar por email
              </Button>
              <Button size="sm" onClick={() => setAdding(true)}>
                <Plus className="size-4" /> Agregar técnica
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {adding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <AddStaffForm
                  onCancel={() => setAdding(false)}
                  onCreated={() => {
                    setAdding(false);
                    router.refresh();
                  }}
                />
              </motion.div>
            )}
            {inviting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <InviteForm
                  onCancel={() => setInviting(false)}
                  onSent={() => {
                    setInviting(false);
                    router.refresh();
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {staff.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aún no tienes técnicas. Agrega la primera para empezar a asignar
              citas.
            </p>
          ) : (
            <ul className="space-y-2">
              {staff.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 rounded-2xl bg-white/60 p-3"
                >
                  <Avatar className="size-12">
                    <AvatarFallback
                      style={{
                        background: s.color ?? "#5C435D",
                        color: "#fff",
                      }}
                    >
                      {s.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{s.display_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {s.role_label && <span>{s.role_label}</span>}
                      {s.instagram && (
                        <span className="inline-flex items-center gap-0.5">
                          <Instagram className="size-3" />@{s.instagram}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={s.is_bookable ? "success" : "soft"}>
                    {s.is_bookable ? "Activa" : "Pausada"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (!confirm(`¿Eliminar a ${s.display_name}?`)) return;
                      startTransition(async () => {
                        const r = await deleteStaff(s.id);
                        if (!r.ok) toast.error(r.error);
                        else {
                          toast.success("Técnica eliminada");
                          router.refresh();
                        }
                      });
                    }}
                    disabled={isPending}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card className="glass-card">
          <CardContent className="p-5">
            <h2 className="mb-3 text-lg">Invitaciones pendientes</h2>
            <ul className="space-y-2">
              {invitations.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between rounded-2xl bg-white/60 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Rol: {inv.role} · Vence:{" "}
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="warning">Pendiente</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AddStaffForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]!);
  const [instagram, setInstagram] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await createStaff({
        displayName: name,
        roleLabel: role || undefined,
        color,
        instagram: instagram || undefined,
        isBookable: true,
      });
      if (!r.ok) toast.error(r.error);
      else {
        toast.success(`${name} agregada âœ¨`);
        onCreated();
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="mb-4 space-y-3 rounded-2xl bg-grad-soft p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="staff-name">Nombre</Label>
          <Input
            id="staff-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Karla Pérez"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="staff-role">Rol (opcional)</Label>
          <Input
            id="staff-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Nail artist"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Color de identificación</Label>
        <div className="flex gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`size-8 rounded-full transition-transform ${color === c ? "scale-110 ring-2 ring-brand-lavender ring-offset-2" : "hover:scale-105"}`}
              style={{ background: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="staff-ig">Instagram (opcional)</Label>
        <div className="flex items-center rounded-2xl border-2 border-input bg-white/80 px-4">
          <span className="text-sm text-muted-foreground">@</span>
          <input
            id="staff-ig"
            className="flex-1 bg-transparent py-3 text-sm focus:outline-none"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : "Agregar"}
        </Button>
      </div>
    </form>
  );
}

function InviteForm({
  onCancel,
  onSent,
}: {
  onCancel: () => void;
  onSent: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "receptionist">("staff");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await inviteStaffByEmail({ email, role });
      if (!r.ok) toast.error(r.error);
      else {
        toast.success(`Invitación enviada a ${email}`);
        onSent();
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="mb-4 space-y-3 rounded-2xl bg-grad-soft p-4"
    >
      <div className="space-y-2">
        <Label htmlFor="inv-email">Email</Label>
        <Input
          id="inv-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="karla@email.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Rol</Label>
        <div className="flex gap-2">
          {(["staff", "receptionist"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 rounded-2xl border-2 p-3 text-sm transition-colors ${
                role === r
                  ? "border-brand-lavender bg-brand-lila/10"
                  : "border-transparent bg-white/60"
              }`}
            >
              <p className="font-medium">
                {r === "staff" ? "Técnica" : "Recepcionista"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {r === "staff" ? "Solo sus citas" : "Agenda + caja"}
              </p>
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Enviar invitación"
          )}
        </Button>
      </div>
    </form>
  );
}
