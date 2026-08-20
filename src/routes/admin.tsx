import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Mail, Package, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { adminLogin, adminLogout } from "@/lib/api.functions";
import { adminSessionQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Mashtool — Admin Atelier" },
      { name: "description", content: "Manage Mashtool orders, statuses and commissions." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Mashtool — Admin Atelier" },
      { property: "og:description", content: "Manage Mashtool orders, statuses and commissions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: Package, exact: false },
  { to: "/admin/products", label: "Products", icon: Sparkles, exact: false },
  { to: "/admin/messages", label: "Messages", icon: Mail, exact: false },
] as const;

function AdminLayout() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(adminSessionQuery);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blush-soft text-sm text-muted-foreground">
        Unlocking the atelier…
      </div>
    );
  }

  if (!data?.isAdmin) return <LoginCard />;

  return (
    <div className="min-h-screen bg-blush-soft">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="font-serif text-xl text-primary sm:text-2xl">
            Mystic Loom
          </Link>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            Atelier
          </span>
          <nav className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:w-auto">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.exact }}
                className="flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-blush/60"
                activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
              >
                <n.icon className="h-4 w-4" strokeWidth={1.5} />
                {n.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={async () => {
              await adminLogout();
              await qc.invalidateQueries();
              toast.success("Signed out");
            }}
            className="ml-auto flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-blush/60"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}

function LoginCard() {
  const qc = useQueryClient();
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-blush-soft px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const res = await adminLogin({ data: { passcode } });
            if (res.ok) {
              await qc.invalidateQueries();
              toast.success("Welcome back to the loom");
            } else {
              toast.error("Incorrect passcode");
            }
          } finally {
            setBusy(false);
          }
        }}
        className="w-full max-w-sm rounded-3xl border border-border/60 bg-background p-6 shadow-sm sm:p-8"
      >
        <h1 className="font-serif text-2xl text-primary sm:text-3xl">Loom Atelier</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the artisan passcode to manage orders.
        </p>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          autoFocus
          className="mt-6 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy || !passcode}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {busy ? "Unlocking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}