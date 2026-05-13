import { notFound } from "next/navigation";
import { resolveBusinessBySlug } from "@/lib/tenant/resolve";

export const dynamic = "force-static";
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await resolveBusinessBySlug(slug);
  if (!business) return {};
  return {
    title: business.name,
    description: `Reserva tu cita en ${business.name}${
      business.district ? ` · ${business.district}` : ""
    }`,
    openGraph: {
      title: business.name,
      images: business.coverUrl ? [business.coverUrl] : undefined,
    },
  };
}

export default async function PublicBusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await resolveBusinessBySlug(slug);
  if (!business) notFound();

  return <div className="min-h-screen">{children}</div>;
}
