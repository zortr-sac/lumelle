import { z } from "zod";
import { isValidPhonePE } from "@/lib/format/phone";

export const phonePE = z
  .string()
  .trim()
  .refine(isValidPhonePE, { message: "Teléfono peruano inválido" });

export const optionalPhonePE = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || isValidPhonePE(v), {
    message: "Teléfono peruano inválido",
  });

export const moneyCents = z.number().int().min(0).max(99_999_999);

export const positiveMinutes = z
  .number()
  .int()
  .min(5)
  .max(8 * 60);

export const nonEmptyString = z.string().trim().min(1);

export const safeText = z.string().trim().max(2000);

export const isoDateTime = z.string().datetime();

export const uuid = z.string().uuid();
