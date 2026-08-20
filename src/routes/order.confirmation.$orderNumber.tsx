import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { SiteLayout, PrimaryButton, GhostButton } from "@/components/site/site-layout";
import { trackOrder } from "@/lib/api.functions";
import { usePublicSettings } from "@/hooks/use-settings";

export const Route = createFileRoute("/order/confirmation/$orderNumber")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.orderNumber} — Mashtool` },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Your request has been received. We'll respond within one day." },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const { whatsapp } = usePublicSettings();
  const { orderNumber } = Route.useParams();
  const waLink = whatsapp(`Hello, my order number is ${orderNumber}`);
  const [copied, setCopied] = useState(false);
  const track = useServerFn(trackOrder);
  const { data: order } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => track({ data: { orderNumber } }),
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-6 md:px-10 md:py-32">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blush">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-6 font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
          Your missive is on its way
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          Thank you for trusting us with your vision. We'll review your request personally and reply
          within 24 hours with pricing and a proposed timeline.
        </p>

        <div className="mt-10 rounded-2xl border border-primary/20 bg-blush-soft p-5 sm:p-6">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">Order number</div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="font-serif text-2xl text-primary sm:text-3xl">{orderNumber}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(orderNumber);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-full border border-primary/30 p-2 text-primary transition-colors hover:bg-primary/5"
              aria-label="Copy order number"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 text-xs text-primary">
            {copied ? "Copied ✓" : "Save this — you'll need it to track your order."}
          </div>
          {order?.productName && (
            <div className="mt-4 border-t border-primary/15 pt-4 text-sm text-muted-foreground">
              {order.productName} · quantity {order.quantity}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {waLink && (
            <a href={waLink} target="_blank" rel="noreferrer">
              <PrimaryButton>
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </PrimaryButton>
            </a>
          )}
          <Link to="/track">
            <GhostButton>Track this order</GhostButton>
          </Link>
        </div>

        <div className="mt-12 text-left">
          <h2 className="font-serif text-xl text-foreground sm:text-2xl">What happens next</h2>
          <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><span className="mr-2 text-primary">01.</span> Our team reviews your request and confirms final pricing.</li>
            <li><span className="mr-2 text-primary">02.</span> You'll receive a link to complete payment via secure transfer.</li>
            <li><span className="mr-2 text-primary">03.</span> Once payment clears, we begin weaving your piece.</li>
            <li><span className="mr-2 text-primary">04.</span> Your finished piece is packaged with care and shipped.</li>
          </ol>
        </div>
      </section>
    </SiteLayout>
  );
}
