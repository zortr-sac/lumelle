import { z } from "zod";
import { phonePE, uuid } from "./common";

export const publicBookingSchema = z.object({
  slug: z.string().trim().toLowerCase().min(3).max(40),
  serviceId: uuid,
  staffId: uuid.optional(),
  startsAt: z.string().datetime(),
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    phone: phonePE,
    email: z.string().email().optional().or(z.literal("")),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
  }),
  acceptedPolicies: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar las políticas" }),
  }),
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
