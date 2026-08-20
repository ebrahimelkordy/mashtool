import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, Circle, Loader2, Sparkles, ArrowRight, MessageCircle } from "lucide-react";
import { SiteLayout, PrimaryButton } from "@/components/site/site-layout";
import { trackOrder } from "@/lib/api.functions";
import { ORDER_STATUSES, type Order } from "@/lib/data/types";
import { usePublicSettings } from "@/hooks/use-settings";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Loom — Mashtool" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Track the status of your Mashtool order." },
    ],
  }),
  component: TrackPage,
});

const TIMELINE = ORDER_STATUSES.filter((s) => s.value !== "cancelled");

function TrackPage() {
  const { whatsapp } = usePublicSettings();
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const track = useServerFn(trackOrder);

  const mutation = useMutation({
    mutationFn: () => track({ data: { orderNumber: orderNumber.trim() } }),
    onSuccess: (res) => {
      setOrder(res);
      setNotFound(!res);
    },
    onError: () => setNotFound(true),
  });

  const currentIndex = order ? TIMELINE.findIndex((s) => s.value === order.status) : -1;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-6 md:px-10 md:py-24">
        <div className="text-[10px] uppercase tracking-[0.3em] text-primary sm:text-xs">Loomings</div>
        <h1 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl md:text-5xl">
          Track your piece
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Enter your order number and we'll show you exactly where your piece is on its journey.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (orderNumber.trim().length < 3) return;
            mutation.mutate();
          }}
          className="mt-8 grid grid-cols-1 gap-3 rounded-3xl bg-card p-5 shadow-sm sm:p-6 md:mt-10 md:grid-cols-[1fr_auto] md:gap-4 md:p-8"
        >
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Order number (ML-…)"
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <PrimaryButton type="submit" disabled={mutation.isPending} className="justify-center">
            {mutation.isPending ? "Searching…" : "Track"} <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        </form>

        {notFound && !order && (
          <div className="mt-8 rounded-3xl border border-primary/20 bg-blush-soft p-6 text-sm text-muted-foreground">
            We couldn't find that order number. Please check it and try again, or{" "}
            {whatsapp("Hello, I need help tracking my order") ? (
              <a href={whatsapp("Hello, I need help tracking my order") ?? undefined} className="text-primary underline underline-offset-4" target="_blank" rel="noreferrer">
                message us on WhatsApp
              </a>
            ) : (
              <span>contact us</span>
            )}
            .
          </div>
        )}

        {order && (
          <div className="mt-10 rounded-3xl bg-blush/60 p-5 sm:p-8 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Order</div>
                <div className="mt-1 font-serif text-xl text-primary sm:text-2xl">{order.orderNumber}</div>
                {order.productName && (
                  <div className="mt-1 text-sm text-muted-foreground">{order.productName}</div>
                )}
              </div>
              <div className="rounded-full bg-primary/10 px-4 py-1.5 text-[10px] uppercase tracking-widest text-primary sm:text-xs">
                {ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status}
              </div>
            </div>

            {order.status === "cancelled" ? (
              <p className="mt-8 text-sm text-muted-foreground">
                This request was cancelled. Reach out if this was a mistake.
              </p>
            ) : (
              <ol className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
                {TIMELINE.map((s, i) => {
                  const done = i < currentIndex;
                  const active = i === currentIndex;
                  return (
                    <li key={s.value} className="flex gap-4">
                      <div className="mt-0.5">
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-primary sm:h-6 sm:w-6" strokeWidth={1.75} />
                        ) : active ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary sm:h-6 sm:w-6" strokeWidth={1.75} />
                        ) : (
                          <Circle className="h-5 w-5 text-primary/30 sm:h-6 sm:w-6" strokeWidth={1.5} />
                        )}
                      </div>
                      <div>
                        <div className={`font-serif text-base sm:text-lg ${done || active ? "text-foreground" : "text-muted-foreground"}`}>
                          {s.label}
                        </div>
                        <div className="text-xs text-muted-foreground sm:text-sm">{s.hint}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-8 grid gap-3 border-t border-primary/15 pt-6 text-sm sm:flex sm:flex-wrap sm:items-center">
              {order.quotedPrice != null && (
                <span className="text-foreground/80">
                  <Sparkles className="mr-1.5 inline h-4 w-4 text-primary" />
                  Final price: ${order.quotedPrice}
                </span>
              )}
              {order.estimatedDelivery && (
                <span className="text-foreground/80">Estimated delivery: {order.estimatedDelivery}</span>
              )}
              <div className="flex flex-wrap gap-4 sm:ml-auto">
                {whatsapp(`Hello, my order number is ${order.orderNumber}`) && (
                  <a
                    href={whatsapp(`Hello, my order number is ${order.orderNumber}`) ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary underline underline-offset-4"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
                {["quoted", "awaiting_payment"].includes(order.status) && (
                  <Link
                    to="/order/$orderNumber/payment"
                    params={{ orderNumber: order.orderNumber }}
                    className="text-primary underline underline-offset-4"
                  >
                    Upload payment
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
