/**
 * Static brand identity only. Every contact / payment / WhatsApp value is
 * business configuration and lives in the admin settings (see
 * `publicSettingsQuery`) — never hardcoded here.
 */
export const siteConfig = {
  name: "Mashtool",
  tagline: "Your Quality & Trust Market",
} as const;

export function buildWhatsappLink(number: string, message = "Hello Mashtool") {
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
