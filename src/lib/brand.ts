export const BRAND = {
  name: "Lumelle",
  domain: "lumelle.site",
  appUrl: "https://lumelle.site",
  supportEmail: "hola@lumelle.site",
  tagline:
    "Agenda, caja y reservas con una experiencia luminosa para salones premium.",
} as const;

export function publicBusinessUrl(slug?: string | null) {
  return `${BRAND.domain}/b/${slug ?? "tu-salon"}`;
}
