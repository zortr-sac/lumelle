"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Calendar,
  ChevronDown,
  Clock,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  Sparkles,
  UserCircle,
  Users,
  Users2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import type { SessionContext } from "@/lib/auth/session";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/clientas", label: "Clientas", icon: Users },
  { href: "/dashboard/servicios", label: "Servicios", icon: Sparkles },
  { href: "/dashboard/caja", label: "Caja", icon: CreditCard },
];

const SETTINGS_ITEMS = [
  { href: "/dashboard/ajustes/negocio", label: "Mi negocio", icon: Building2 },
  { href: "/dashboard/ajustes/horarios", label: "Horarios", icon: Clock },
  { href: "/dashboard/ajustes/equipo", label: "Equipo", icon: Users2 },
  { href: "/dashboard/ajustes/perfil", label: "Mi perfil", icon: UserCircle },
] as const;

export function AppShell({
  children,
  session,
}: {
  children: ReactNode;
  session: SessionContext;
}) {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith("/dashboard/ajustes"),
  );

  if (pathname.startsWith("/onboarding")) {
    return <>{children}</>;
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const inSettings = pathname.startsWith("/dashboard/ajustes");

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,249,245,.96),rgba(247,241,236,.92))]" />
        <div className="absolute inset-x-0 top-0 h-56 bg-grad-hero opacity-70" />
      </div>

      <motion.aside
        initial={false}
        animate={mobileOpen ? "open" : "closed"}
        variants={{ open: { x: 0 }, closed: { x: "-100%" } }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-white/60 bg-white/72 shadow-soft backdrop-blur-2xl",
          "lg:!translate-x-0",
        )}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <Link href="/dashboard" className="group flex items-center gap-2">
            <motion.span
              whileHover={{ rotate: -4, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="lumelle-mark size-9"
            >
              <Sparkles className="size-4 text-white" />
            </motion.span>
            <span className="text-lg font-semibold tracking-[-0.04em]">
              {BRAND.name}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-4 pb-3">
          <div className="rounded-2xl border border-white/70 bg-white/65 p-3 shadow-inset backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Activo
            </p>
            <p className="truncate font-medium">
              {session.businessId ? "Mi salón" : "Sin negocio"}
            </p>
            <Badge variant="soft" className="mt-1 text-[10px]">
              {session.role ?? "Sin rol"}
            </Badge>
          </div>
        </div>

        <nav
          className="overflow-y-auto px-4 pt-1"
          style={{ maxHeight: "calc(100vh - 12rem)" }}
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                      active
                        ? "text-white"
                        : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-2xl bg-grad-button shadow-soft"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <item.icon className="relative size-4" />
                    <span className="relative">{item.label}</span>
                  </Link>
                </li>
              );
            })}

            <li>
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                  inSettings
                    ? "text-white"
                    : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
                )}
              >
                {inSettings &&
                  !NAV_ITEMS.some((i) => isActive(i.href, i.exact)) && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-2xl bg-grad-button shadow-soft"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                <Settings className="relative size-4" />
                <span className="relative flex-1 text-left">Ajustes</span>
                <motion.span
                  animate={{ rotate: settingsOpen ? 180 : 0 }}
                  className="relative"
                >
                  <ChevronDown className="size-3" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {settingsOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 mt-1 space-y-0.5 overflow-hidden border-l border-border/70 pl-3"
                  >
                    {SETTINGS_ITEMS.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                              active
                                ? "bg-brand-ink/10 text-brand-ink"
                                : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
                            )}
                          >
                            <item.icon className="size-3.5" />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          </ul>
        </nav>

        <div className="absolute inset-x-4 bottom-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </div>
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-brand-ink/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/60 bg-white/65 shadow-inset backdrop-blur-2xl">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex-1" />
            <Button asChild size="sm">
              <Link href="/dashboard/agenda/nueva">
                <Plus className="size-4" /> Nueva cita
              </Link>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1480px] px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/85 shadow-soft backdrop-blur-2xl lg:hidden">
          <ul className="grid grid-cols-5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex flex-col items-center gap-1 py-3 text-xs",
                      active ? "text-brand-ink" : "text-muted-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="bottom-nav-active"
                        className="absolute left-1/2 top-0 h-1 w-12 -translate-x-1/2 rounded-full bg-grad-button"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <item.icon className="size-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="h-20 lg:hidden" />
      </div>
    </div>
  );
}
