import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "./signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function SignupPage() {
  return (
    <Card className="glass-card-strong">
      <CardHeader className="space-y-1">
        <CardTitle>Crea tu cuenta</CardTitle>
        <CardDescription>14 días gratis. Sin tarjeta.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
        <div className="mt-6 text-center text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Iniciar sesión
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Al continuar aceptas los{" "}
          <Link href="/terms" className="underline">
            términos
          </Link>{" "}
          y la{" "}
          <Link href="/privacy" className="underline">
            política de privacidad
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
