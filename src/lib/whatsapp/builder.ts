import { whatsappNumber } from "@/lib/format/phone";

export type WhatsAppLinkInput = {
  phone: string;
  message: string;
};

export function buildWhatsAppLink({
  phone,
  message,
}: WhatsAppLinkInput): string {
  const number = whatsappNumber(phone);
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}

export function fillTemplate(
  template: string,
  vars: Record<string, string | number | undefined | null>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key];
    return v == null ? "" : String(v);
  });
}
