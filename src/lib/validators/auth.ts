import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Tu nombre completo").max(80),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(72)
    .regex(/[A-Z]/, "Una mayúscula al menos")
    .regex(/[0-9]/, "Un número al menos"),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotSchema = z.object({
  email: z.string().email(),
});

export type ForgotInput = z.infer<typeof forgotSchema>;

export const resetSchema = z.object({
  password: z.string().min(8).max(72).regex(/[A-Z]/).regex(/[0-9]/),
});

export type ResetInput = z.infer<typeof resetSchema>;
