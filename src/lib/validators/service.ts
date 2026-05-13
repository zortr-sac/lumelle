import { z } from "zod";
import { moneyCents, positiveMinutes, uuid } from "./common";

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.string().trim().max(40).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  priceCents: moneyCents,
  durationMinutes: positiveMinutes,
  bufferMinutes: z.number().int().min(0).max(60).default(0),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  requiresStaffSelection: z.boolean().default(false),
  staffIds: z.array(uuid).default([]),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
