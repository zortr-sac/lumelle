import type { ReactNode } from "react";
import { getSession, hasRole, type Role } from "@/lib/auth/session";

type RoleGuardProps = {
  role: Role;
  children: ReactNode;
  fallback?: ReactNode;
};

export async function RoleGuard({
  role,
  children,
  fallback = null,
}: RoleGuardProps) {
  const session = await getSession();
  if (!session || !hasRole(session.role, role)) return <>{fallback}</>;
  return <>{children}</>;
}
