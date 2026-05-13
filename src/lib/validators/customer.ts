import { z } from "zod";
import { phonePE } from "./common";

export const customerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: phonePE,
  email: z.string().email().optional().or(z.literal("")),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  district: z.string().trim().max(80).optional().or(z.literal("")),
  instagram: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  allergies: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;
