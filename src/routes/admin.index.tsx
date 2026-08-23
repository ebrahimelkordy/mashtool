import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { adminStatsQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data, isLoading, error } = useQuery(adminStatsQuery);

  if (isLoading) return <p className="text-sm text-muted-foreground">Gathering threads…</p>;
  if (error || !data)
    return <p className="text-sm text-destructive">Could not load dashboard statistics.</p>;

  const cards = [
    { label: "Total orders", value: data.totalOrders, to: "/admin/orders" },
    { label: "Pending", value: data.pendingOrders, to: "/admin/orders" },
    { label: "In weaving", value: data.activeWeaves, to: "/admin/orders" },
    { label: "Delivered", value: data.deliveredOrders, to: "/admin/orders" },
    { label: "Unread messages", value: data.unreadMessages, to: "/admin/messages" },
    { label: "Products", value: data.productCount, to: "/admin/products" },
    { label: "Categories", value: data.categoryCount, to: "/admin/categories" },
  ];

  const maxDay = Math.max(1, ...data.last7Days.map((d) => d.orders));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-primary sm:text-4xl">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revenue confirmed: ${data.revenue.toLocaleString()}
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Manage orders
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-2xl border border-border/60 bg-background p-4 sm:p-5 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-serif text-3xl text-primary">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-background p-4 sm:p-6">
          <h2 className="font-serif text-xl text-primary">Orders by status</h2>
          <ul className="mt-4 space-y-2">
            {data.ordersByStatus.map((s) => (
              <li key={s.status} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground/80">{s.label}</span>
                <span className="rounded-full bg-blush/60 px-2.5 py-0.5 text-xs text-primary">
                  {s.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background p-4 sm:p-6">
          <h2 className="font-serif text-xl text-primary">Last 7 days</h2>
          <div className="mt-6 flex h-40 items-end gap-2">
            {data.last7Days.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-primary/70"
                  style={{ height: `${Math.max(4, (d.orders / maxDay) * 100)}%` }}
                  title={`${d.orders} orders`}
                />
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}