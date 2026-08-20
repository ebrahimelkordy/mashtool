import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getEnvVar(key: string): string {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] || "";
  }
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
    return (import.meta.env[key] as string) || "";
  }
  return "";
}

const supabaseUrl =
  getEnvVar("SUPABASE_URL") ||
  getEnvVar("VITE_SUPABASE_URL") ||
  "https://bwyowbsecdqaaonkallp.supabase.co";

const supabaseKey =
  getEnvVar("SUPABASE_SERVICE_ROLE_KEY") ||
  getEnvVar("SUPABASE_ANON_KEY") ||
  getEnvVar("VITE_SUPABASE_ANON_KEY") ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eW93YnNlY2RxYWFvbmthbGxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjU0NzQ2NiwiZXhwIjoyMTAyMTIzNDY2fQ.Vn87rE0fHfXASxf6cUeZ2nbQ0yh1L207JE7qrnfc2S4";

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!clientInstance) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseKey);
    } catch (err) {
      console.warn("Supabase client init fallback notice:", err);
      clientInstance = null;
    }
  }
  return clientInstance;
}

export const supabase = {
  from(table: string) {
    const client = getSupabaseClient();
    if (!client) {
      return {
        select: () => Promise.resolve({ data: null, error: new Error("Supabase client not initialized") }),
        insert: () => Promise.resolve({ data: null, error: new Error("Supabase client not initialized") }),
        upsert: () => Promise.resolve({ data: null, error: new Error("Supabase client not initialized") }),
        update: () => Promise.resolve({ data: null, error: new Error("Supabase client not initialized") }),
        delete: () => Promise.resolve({ data: null, error: new Error("Supabase client not initialized") }),
      } as any;
    }
    return client.from(table);
  },
  get storage() {
    const client = getSupabaseClient();
    if (!client) {
      return {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error("Supabase storage not initialized") }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      } as any;
    }
    return client.storage;
  },
};
