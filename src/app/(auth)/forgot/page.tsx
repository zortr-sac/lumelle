import Link from "next/link";
import type { Metadata } from "next";
import { ForgotForm } from "./forgot-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
};

export default function ForgotPage() {
  return (
    <Card className="glass-card-strong">
      <CardHeader className="space-y-1">
        <CardTitle>Recuperar contraseña</CardTitle>
        <CardDescription>
          Te enviaremos un link para restablecerla
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotForm />
        <div className="mt-6 text-center text-sm">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-primary"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
