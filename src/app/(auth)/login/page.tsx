import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  return (
    <Card className="glass-card-strong">
      <CardHeader className="space-y-1">
        <CardTitle>Vuelve a tu salón</CardTitle>
        <CardDescription>Ingresa con tu email y contraseña.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm searchParams={searchParams} />
        <div className="mt-6 text-center text-sm">
          <Link
            href="/forgot"
            className="text-muted-foreground hover:text-primary"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="mt-2 text-center text-sm">
          ¿Aún no tienes cuenta?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Crear una
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
