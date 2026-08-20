import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { z } from "zod";
import { ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, PrimaryButton } from "@/components/site/site-layout";
import { submitOrder } from "@/lib/api.functions";
import { productsQuery } from "@/lib/queries";

const searchSchema = z.object({ productId: z.string().optional() });

export const Route = createFileRoute("/order/new")({
  validateSearch: (s) => searchSchema.parse(s),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery());
  },
  head: () => ({
    meta: [
      { title: "Request a Piece — Mystic Loom" },
      { name: "description", content: "Send a request for a handcrafted Mystic Loom piece." },
      { property: "og:title", content: "Request a Piece — Mystic Loom" },
      { property: "og:description", content: "Every piece is woven to order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-sm text-destructive">We couldn't load the collection right now.</p>
      </div>
    </SiteLayout>
  ),
  component: OrderNew,
});

function OrderNew() {
  const { productId } = Route.useSearch();
  const navigate = useNavigate();
  const { data: products } = useSuspenseQuery(productsQuery());
  const product = products.find((p) => p.id === productId) ?? products[0];
  const create = useServerFn(submitOrder);

  const [choices, setChoices] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    whatsapp: "",
    address: "",
    quantity: 1,
    notes: "",
  });

  const estimate = useMemo(() => {
    if (!product) return null;
    const deltas = product.options.reduce((sum, option) => {
      const value = option.values.find((v) => v.id === choices[option.id]);
      return sum + (value?.priceDelta ?? 0);
    }, 0);
    const unit = product.priceFrom + deltas;
    return { unit, total: unit * (Number(form.quantity) || 1) };
  }, [product, choices, form.quantity]);

  const mutation = useMutation({
    mutationFn: () =>
      create({
        data: {
          type: "standard" as const,
          productId: product?.id ?? null,
          customerName: form.customerName.trim(),
          phone: form.phone.trim(),
          whatsapp: form.whatsapp.trim() || null,
          address: form.address.trim() || null,
          quantity: Number(form.quantity) || 1,
          notes: form.notes.trim() || null,
          selectedOptions: Object.entries(choices).map(([optionId, valueId]) => ({
            optionId,
            valueId,
          })),
        },
      }),
    onSuccess: ({ order }) => {
      navigate({
        to: "/order/confirmation/$orderNumber",
        params: { orderNumber: order.orderNumber },
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("MISSING_OPTION")) {
        toast.error(`Please choose: ${message.split(":")[1]}`);
      } else {
        toast.error("We couldn't send your request. Please check your details.");
      }
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    if (form.customerName.trim().length < 2 || form.phone.trim().length < 6) {
      toast.error("Please add your name and a reachable phone number.");
      return;
    }
    const missing = product.options.find((o) => o.required && !choices[o.id]);
    if (missing) {
      toast.error(`Please choose a ${missing.name.toLowerCase()}.`);
      return;
    }
    mutation.mutate();
  }

  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-6 py-24 text-center md:py-32">
          <h1 className="font-serif text-3xl text-foreground md:text-4xl">The loom is resting</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            There are no pieces published yet. You can still commission something entirely your own.
          </p>
          <Link
            to="/special-order"
            className="mt-6 inline-block text-primary underline underline-offset-4"
          >
            Request a bespoke piece
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 md:px-10 md:py-24">
        <div className="mb-8 md:mb-10">
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary sm:text-xs">
            Request a Piece
          </div>
          <h1 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl md:text-5xl">
            Send a whisper to the loom
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Share a few details and we'll respond with the final price and a hand-woven timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
          <form onSubmit={onSubmit} className="rounded-3xl bg-card p-5 shadow-sm sm:p-8 md:p-10">
            {product.options.length > 0 && (
              <div className="mb-7 space-y-5 border-b border-border pb-7">
                <div className="text-xs uppercase tracking-widest text-primary">
                  Configure your piece
                </div>
                {product.options.map((option) => (
                  <div key={option.id}>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                      {option.name}
                      {option.required && <span className="ml-1 text-primary">*</span>}
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const selected = choices[option.id] === value.id;
                        return (
                          <button
                            key={value.id}
                            type="button"
                            onClick={() =>
                              setChoices((prev) =>
                                prev[option.id] === value.id && !option.required
                                  ? Object.fromEntries(
                                      Object.entries(prev).filter(([k]) => k !== option.id),
                                    )
                                  : { ...prev, [option.id]: value.id },
                              )
                            }
                            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-foreground/75 hover:bg-blush/60"
                            }`}
                          >
                            {value.label}
                            {value.priceDelta !== 0 && (
                              <span className="ml-1.5 text-xs opacity-80">
                                {value.priceDelta > 0 ? "+" : "−"}${Math.abs(value.priceDelta)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <FormField
                label="Full Name"
                required
                placeholder="Evelyn Starweaver"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
              <FormField
                label="Phone"
                required
                placeholder="+20 100 123 4567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <FormField
                label="WhatsApp (optional)"
                placeholder="Same as phone"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
              <FormField
                label="Quantity"
                type="number"
                min={1}
                max={50}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="mt-5 sm:mt-6">
              <FormField
                label="Delivery address"
                placeholder="Street, city"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="mt-5 sm:mt-6">
              <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                Notes
              </label>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Preferred colors, sizing, delivery date, or the mood you want to weave…"
                className="mt-2 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="mt-6 rounded-xl bg-blush-soft p-4 text-xs text-muted-foreground">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
              No payment now. Your estimate is confirmed by our artisans before anything is charged.
            </div>
            <div className="mt-7">
              <PrimaryButton
                type="submit"
                disabled={mutation.isPending}
                className="w-full sm:w-auto"
              >
                {mutation.isPending ? "Sending…" : "Send request"} <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </div>
          </form>

          <aside className="order-first rounded-3xl bg-blush/60 p-5 sm:p-6 lg:order-none">
            <div className="text-xs uppercase tracking-widest text-primary/80">
              You're requesting
            </div>
            {product.images[0] && (
              <div className="mt-4 aspect-square overflow-hidden rounded-2xl">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="mt-4 font-serif text-xl text-foreground">{product.name}</div>
            <div className="mt-1 text-sm text-muted-foreground">{product.category}</div>

            {Object.keys(choices).length > 0 && (
              <ul className="mt-4 space-y-1 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                {product.options.map((option) => {
                  const value = option.values.find((v) => v.id === choices[option.id]);
                  if (!value) return null;
                  return (
                    <li key={option.id} className="flex justify-between gap-3">
                      <span>{option.name}</span>
                      <span className="text-foreground/80">{value.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            {estimate && (
              <>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estimated total</span>
                  <span className="font-serif text-xl text-primary">${estimate.total}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  ${estimate.unit} × {Number(form.quantity) || 1}. Confirmed by the atelier before
                  payment.
                </p>
              </>
            )}
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Lead time</span>
              <span>{product.leadTimeDays}</span>
            </div>
            <Link
              to="/products/$slug"
              params={{ slug: product.slug }}
              className="mt-4 block text-xs text-primary underline underline-offset-4"
            >
              View piece
            </Link>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

function FormField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <input
        {...props}
        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
