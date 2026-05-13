import { z } from "zod";
import { isValidSlug } from "@/lib/tenant/slug";
import { optionalPhonePE } from "./common";

export const businessSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Mínimo 3 caracteres")
    .max(40)
    .refine(isValidSlug, "Slug inválido o reservado"),
  district: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  whatsappPhone: optionalPhonePE,
  instagram: z.string().trim().max(40).optional().or(z.literal("")),
  bookingPolicy: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type BusinessInput = z.infer<typeof businessSchema>;

export const businessHoursSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  opensAt: z.string().regex(/^\d{2}:\d{2}$/),
  closesAt: z.string().regex(/^\d{2}:\d{2}$/),
  isClosed: z.boolean(),
});

export type BusinessHoursInput = z.infer<typeof businessHoursSchema>;
