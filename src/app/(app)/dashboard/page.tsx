import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageTransition } from "@/components/motion/page-transition";
import { requireSession } from "@/lib/auth/session";
import {
  DashboardHeader,
  DashboardStats,
  PendingBookings,
  TodayAppointments,
  UpcomingBirthdays,
} from "./_components/sections";
import {
  AppointmentsSkeleton,
  PendingSkeleton,
  StatsSkeleton,
} from "./_components/skeletons";

export default async function DashboardPage() {
  const session = await requireSession();
  if (!session.businessId) redirect("/onboarding");

  return (
    <PageTransition>
      <div className="space-y-6">
        <DashboardHeader
          fullName={session.fullName ?? "tu"}
          businessId={session.businessId}
        />

        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats businessId={session.businessId} />
        </Suspense>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<AppointmentsSkeleton />}>
              <TodayAppointments businessId={session.businessId} />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<PendingSkeleton />}>
              <PendingBookings businessId={session.businessId} />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={null}>
          <UpcomingBirthdays businessId={session.businessId} />
        </Suspense>
      </div>
    </PageTransition>
  );
}
