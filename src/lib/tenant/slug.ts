// Pure functions for slug validation. Safe for client and server.

export const RESERVED_SLUGS = new Set([
  "app",
  "api",
  "admin",
  "dashboard",
  "login",
  "signup",
  "logout",
  "forgot",
  "reset",
  "onboarding",
  "pricing",
  "about",
  "blog",
  "contact",
  "b",
  "_next",
  "static",
  "public",
  "terms",
  "privacy",
  "help",
  "support",
  "settings",
  "ajustes",
  "agenda",
  "clientas",
  "servicios",
  "caja",
  "reportes",
  "equipo",
]);

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,40}[a-z0-9])?$/;

export function isValidSlug(slug: string): boolean {
  if (!slug) return false;
  if (RESERVED_SLUGS.has(slug.toLowerCase())) return false;
  if (slug.includes("--")) return false;
  return SLUG_REGEX.test(slug);
}

export function suggestSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
