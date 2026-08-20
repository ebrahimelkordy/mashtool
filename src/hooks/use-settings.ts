import { useQuery } from "@tanstack/react-query";

import { publicSettingsQuery } from "@/lib/queries";
import { buildWhatsappLink } from "@/lib/site-config";

/** Public business settings (WhatsApp, contact, payment handles) from the API. */
export function usePublicSettings() {
  const query = useQuery(publicSettingsQuery);
  const settings = query.data ?? null;
  return {
    ...query,
    settings,
    whatsapp: (message?: string) =>
      settings ? buildWhatsappLink(settings.whatsappNumber, message) : null,
  };
}
