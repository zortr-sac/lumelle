import type { Metadata } from "next";
import { ResetForm } from "./reset-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default function ResetPage() {
  return (
    <Card className="glass-card-strong">
      <CardHeader className="space-y-1">
        <CardTitle>Nueva contraseña</CardTitle>
        <CardDescription>Elige una contraseña segura</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetForm />
      </CardContent>
    </Card>
  );
}
