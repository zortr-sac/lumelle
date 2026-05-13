import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "./onboarding-wizard";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Bienvenida" };

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.businessId) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grad-hero opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(92,67,93,.10),transparent_32rem)]" />
      </div>
      <main className="container flex min-h-screen items-center justify-center py-10">
        <OnboardingWizard userName={session.fullName ?? ""} />
      </main>
    </div>
  );
}
