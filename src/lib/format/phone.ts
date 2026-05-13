const PE_PREFIX = "+51";

export function normalizePhonePE(input: string): string {
  if (!input) return "";
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("51") && digits.length === 11) return `+${digits}`;
  if (digits.length === 9) return `${PE_PREFIX}${digits}`;
  if (digits.startsWith("0") && digits.length === 10)
    return `${PE_PREFIX}${digits.slice(1)}`;
  return input.startsWith("+") ? input : `+${digits}`;
}

export function formatPhonePE(phone: string | null | undefined): string {
  if (!phone) return "";
  const normalized = normalizePhonePE(phone);
  const digits = normalized.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("51")) {
    const local = digits.slice(2);
    return `+51 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return normalized;
}

export function isValidPhonePE(phone: string): boolean {
  const normalized = normalizePhonePE(phone);
  return /^\+51\d{9}$/.test(normalized);
}

export function whatsappNumber(phone: string): string {
  return normalizePhonePE(phone).replace(/\D/g, "");
}
