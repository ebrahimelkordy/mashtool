import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { UploadCloud, Copy, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, PrimaryButton } from "@/components/site/site-layout";
import { trackOrder, uploadPaymentProof } from "@/lib/api.functions";
import { usePublicSettings } from "@/hooks/use-settings";

export const Route = createFileRoute("/order/$orderNumber/payment")({
  head: ({ params }) => ({
    meta: [
      { title: `Payment — ${params.orderNumber} — Mashtool` },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Upload your transfer receipt to complete your Mashtool order." },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const { orderNumber } = Route.useParams();
  const [file, setFile] = useState<File | null>(null);
  const [method, setMethod] = useState<"instapay" | "vodafone">("instapay");
  const qc = useQueryClient();
  const { settings } = usePublicSettings();

  const track = useServerFn(trackOrder);
  const upload = useServerFn(uploadPaymentProof);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => track({ data: { orderNumber } }),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = String(reader.result ?? "");
          resolve(res.includes(",") ? res.split(",")[1]! : res);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      return upload({
        data: {
          orderNumber,
          fileName: file.name,
          contentType: file.type || "image/jpeg",
          base64,
        },
      });
    },
    onSuccess: (res) => {
      if (!res) return toast.error("Order not found.");
      qc.setQueryData(["order", orderNumber], res);
      toast.success("Receipt received — we're verifying it now.");
    },
    onError: () => toast.error("Upload failed. Please try again."),
  });

  const sent = Boolean(order?.paymentProofUrl);

  const methods = [
    { id: "instapay" as const, label: "InstaPay", value: settings?.instapayHandle ?? "" },
    { id: "vodafone" as const, label: "Vodafone Cash", value: settings?.vodafoneCashNumber ?? "" },
  ].filter((m) => m.value.length > 0);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-6 md:px-10 md:py-24">
        <div className="text-[10px] uppercase tracking-[0.3em] text-primary sm:text-xs">Complete Payment</div>
        <h1 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl md:text-5xl">
          Order {orderNumber}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Transfer the final amount, then upload the receipt below. We'll verify within a few hours.
        </p>

        {!isLoading && !order && (
          <div className="mt-8 rounded-3xl border border-primary/20 bg-blush-soft p-6 text-sm text-muted-foreground">
            We couldn't find this order number.
          </div>
        )}

        {order && (
          <>
            <div className="mt-8 rounded-3xl bg-blush/60 p-5 sm:p-8 md:mt-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Final price</div>
                  <div className="mt-1 font-serif text-2xl text-primary sm:text-3xl">
                    {order.quotedPrice != null ? `$${order.quotedPrice}` : "Awaiting quote"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Delivery</div>
                  <div className="mt-1 text-sm">{order.estimatedDelivery ?? "To be confirmed"}</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {methods.map((m) => (
                  <div
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setMethod(m.id)}
                    onKeyDown={(e) => e.key === "Enter" && setMethod(m.id)}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors ${
                      method === m.id ? "border-primary bg-background" : "border-transparent bg-background/50"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.label}</div>
                      <div className="mt-1 truncate font-mono text-sm text-foreground">{m.value}</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(m.value);
                        toast.success("Copied");
                      }}
                      className="rounded-full p-2 text-primary hover:bg-primary/5"
                      aria-label={`Copy ${m.label}`}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {sent ? (
              <div className="mt-8 rounded-3xl bg-card p-8 text-center shadow-sm sm:p-10">
                <Sparkles className="mx-auto h-6 w-6 text-primary" />
                <h2 className="mt-3 font-serif text-xl text-foreground sm:text-2xl">Receipt received</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We're verifying your transfer. You'll receive a WhatsApp confirmation shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!file) {
                    toast.error("Please attach your transfer receipt.");
                    return;
                  }
                  mutation.mutate();
                }}
                className="mt-8 space-y-6 rounded-3xl bg-card p-5 shadow-sm sm:p-8 md:p-10"
              >
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                    Transfer receipt
                  </label>
                  <label
                    htmlFor="receipt"
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-blush-soft px-4 py-10 text-center transition-colors hover:border-primary/60"
                  >
                    <UploadCloud className="h-7 w-7 text-primary" />
                    <div className="text-sm">{file ? file.name : "Upload screenshot of transfer"}</div>
                    <input
                      id="receipt"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Your receipt is only used to verify your transfer.
                </div>
                <PrimaryButton type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
                  {mutation.isPending ? "Sending…" : "Submit receipt"}
                </PrimaryButton>
              </form>
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
}
