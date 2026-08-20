import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { adminUpdateOrder } from "@/lib/api.functions";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/data/types";
import { adminOrdersQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const statusLabel = (s: OrderStatus) => ORDER_STATUSES.find((x) => x.value === s)?.label ?? s;

function AdminOrders() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>("all");
  const [term, setTerm] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    ...adminOrdersQuery(status),
    refetchInterval: 5000,
  });

  // Track new incoming orders to trigger live browser Web Notifications
  const prevCountRef = useState<number | null>(null);
  const [prevCount, setPrevCount] = prevCountRef;

  if (data && prevCount !== null && data.length > prevCount) {
    if ("Notification" in window && Notification.permission === "granted") {
      const latestOrder = data[0];
      new Notification("🔔 New Order Received!", {
        body: `Order ${latestOrder.orderNumber} placed by ${latestOrder.customerName}`,
        icon: "/logo.png",
      });
    }
  }
  if (data && prevCount !== data.length) {
    setPrevCount(data.length);
  }

  const update = useMutation({
    mutationFn: (vars: {
      id: string;
      status?: OrderStatus;
      quotedPrice?: number | null;
      estimatedDelivery?: string | null;
      adminNote?: string | null;
    }) => adminUpdateOrder({ data: vars }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Order updated");
    },
    onError: () => toast.error("Could not update this order"),
  });

  const orders = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((o) =>
      [o.orderNumber, o.customerName, o.phone, o.productName ?? "", o.whatsapp ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [data, term]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-primary sm:text-4xl">Orders Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Filter, review quotes, and update order progress status.
          </p>
        </div>
        <button
          onClick={() => {
            if ("Notification" in window) {
              Notification.requestPermission().then((perm) => {
                if (perm === "granted") {
                  toast.success("Web Notifications Enabled! You will be alerted when new orders arrive.");
                  new Notification("Mystic Loom Atelier", {
                    body: "Order Notification Alert System Enabled Successfully!",
                    icon: "/logo.png",
                  });
                } else {
                  toast.error("Notification permission denied");
                }
              });
            } else {
              toast.error("Notifications not supported in this browser");
            }
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-blush/40 px-4 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-blush"
        >
          🔔 Enable Web Notifications
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search order number, name, phone…"
            className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading orders…</p>}
      {error && <p className="text-sm text-destructive">Could not load orders.</p>}
      {!isLoading && !error && orders.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No orders match this search.
        </p>
      )}

      <ul className="space-y-3">
        {orders.map((o) => {
          const open = openId === o.id;
          return (
            <li
              key={o.id}
              className="overflow-hidden rounded-2xl border border-border/60 bg-background"
            >
              <button
                onClick={() => setOpenId(open ? null : o.id)}
                className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 p-4 text-left sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-foreground">{o.customerName}</p>
                    {o.type === "bespoke" ? (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                        Bespoke Request
                      </span>
                    ) : (
                      <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
                        Standard Order
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {o.orderNumber} · {o.productName ?? "Custom Piece"} · ×{o.quantity}
                  </p>
                </div>
                <span className="rounded-full bg-blush/60 px-3 py-1 text-xs text-primary">
                  {statusLabel(o.status)}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <div className="space-y-4 border-t border-border/60 p-4 sm:p-5">
                  <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <Field label="Phone" value={o.phone} />
                    <Field label="WhatsApp" value={o.whatsapp ?? "—"} />
                    <Field label="Type" value={o.type === "bespoke" ? "Bespoke Custom" : "Standard Product"} />
                    <Field
                      label="Placed"
                      value={new Date(o.createdAt).toLocaleDateString()}
                    />
                    <Field label="Address" value={o.address ?? "—"} />
                    <div className="min-w-0">
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">Payment Proof</dt>
                      <dd className="break-words text-sm text-foreground/85">
                        {o.paymentProofUrl ? (
                          <a
                            href={o.paymentProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-primary underline"
                          >
                            View Uploaded Receipt ↗
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not uploaded yet</span>
                        )}
                      </dd>
                    </div>
                    {o.referenceImages && o.referenceImages.length > 0 && (
                      <div className="col-span-1 min-w-0 sm:col-span-2">
                        <dt className="text-xs uppercase tracking-wider text-muted-foreground">Reference Images</dt>
                        <dd className="mt-1.5 flex flex-wrap gap-2">
                          {o.referenceImages.map((imgUrl, idx) => (
                            <a key={idx} href={imgUrl} target="_blank" rel="noreferrer">
                              <img
                                src={imgUrl}
                                alt="Reference"
                                className="h-16 w-16 rounded-lg border border-border object-cover transition-transform hover:scale-105"
                              />
                            </a>
                          ))}
                        </dd>
                      </div>
                    )}
                    {o.notes && <Field label="Notes" value={o.notes} />}
                  </dl>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Status
                      <select
                        value={o.status}
                        onChange={(e) =>
                          update.mutate({ id: o.id, status: e.target.value as OrderStatus })
                        }
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Quoted price
                      <input
                        type="number"
                        min={0}
                        defaultValue={o.quotedPrice ?? ""}
                        onBlur={(e) => {
                          const v = e.target.value === "" ? null : Number(e.target.value);
                          if (v !== (o.quotedPrice ?? null))
                            update.mutate({ id: o.id, quotedPrice: v });
                        }}
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary"
                      />
                    </label>

                    <label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Estimated delivery
                      <input
                        defaultValue={o.estimatedDelivery ?? ""}
                        placeholder="e.g. 3–4 weeks"
                        onBlur={(e) => {
                          const v = e.target.value.trim() || null;
                          if (v !== (o.estimatedDelivery ?? null))
                            update.mutate({ id: o.id, estimatedDelivery: v });
                        }}
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary"
                      />
                    </label>
                  </div>

                  <label className="block text-xs uppercase tracking-wider text-muted-foreground">
                    Internal note
                    <textarea
                      defaultValue={o.adminNote ?? ""}
                      rows={2}
                      onBlur={(e) => {
                        const v = e.target.value.trim() || null;
                        if (v !== (o.adminNote ?? null)) update.mutate({ id: o.id, adminNote: v });
                      }}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary"
                    />
                  </label>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm text-foreground/85">{value}</dd>
    </div>
  );
}