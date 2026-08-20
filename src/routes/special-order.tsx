import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { UploadCloud, X, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, PrimaryButton } from "@/components/site/site-layout";
import { submitOrder, uploadPaymentProof } from "@/lib/api.functions";

export const Route = createFileRoute("/special-order")({
  head: () => ({
    meta: [
      { title: "Bespoke Commission — Mashtool" },
      { name: "description", content: "Commission a one-of-a-kind woven textile. Share your vision and a reference image." },
      { property: "og:title", content: "Bespoke Commission — Mashtool" },
      { property: "og:description", content: "Commission a one-of-a-kind textile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SpecialOrder,
});

function SpecialOrder() {
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", notes: "" });
  const navigate = useNavigate();
  const create = useServerFn(submitOrder);
  const repoUploadImage = useServerFn(uploadPaymentProof);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((f) => [...f, ...Array.from(list)].slice(0, 6));
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const uploadedUrls: string[] = [];
      for (const file of files.slice(0, 6)) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = String(reader.result ?? "");
            resolve(res.includes(",") ? res.split(",")[1]! : res);
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });
        const res = await repoUploadImage({
          data: {
            fileName: file.name,
            contentType: file.type || "image/jpeg",
            base64,
          },
        });
        if (res?.url) {
          uploadedUrls.push(res.url);
        }
      }

      return create({
        data: {
          type: "bespoke" as const,
          productId: null,
          customerName: form.customerName.trim(),
          phone: form.phone.trim(),
          whatsapp: form.phone.trim(),
          address: form.address.trim() || null,
          quantity: 1,
          notes: form.notes.trim() || null,
          referenceImages: uploadedUrls,
        },
      });
    },
    onSuccess: ({ order }) =>
      navigate({ to: "/order/confirmation/$orderNumber", params: { orderNumber: order.orderNumber } }),
    onError: () => toast.error("We couldn't send your request. Please check your details."),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.customerName.trim().length < 2 || form.phone.trim().length < 6) {
      toast.error("Please add your name and a reachable phone number.");
      return;
    }
    mutation.mutate();
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-6 md:px-10 md:py-24">
        <div className="text-[10px] uppercase tracking-[0.3em] text-primary sm:text-xs">Bespoke Enchantments</div>
        <h1 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl md:text-6xl">
          Commission a Unique Piece
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Share the mood, colors, and a reference image if you have one. Our artisans will translate
          your vision into a woven object made just for you.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-7 rounded-3xl bg-card p-5 shadow-sm sm:p-8 md:mt-12 md:p-12">
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground">
              Reference images
            </label>
            <label
              htmlFor="files"
              className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-blush-soft px-4 py-10 text-center transition-colors hover:border-primary/60 sm:py-14"
            >
              <UploadCloud className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
              <div className="font-serif text-base sm:text-lg">Drop your inspiration here</div>
              <div className="text-[11px] text-muted-foreground sm:text-xs">PNG or JPG — max 6 images</div>
              <input id="files" type="file" multiple accept="image/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </label>
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-blush-soft">
                    <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/85 text-primary"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <TF
              label="Your Name"
              required
              placeholder="Evelyn Starweaver"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
            <TF
              label="Phone / WhatsApp"
              required
              placeholder="+20 100 123 4567"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <TF
            label="Delivery address (optional)"
            placeholder="Street, city"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground">Vision</label>
            <textarea
              rows={5}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Describe the piece — dimensions, colors, texture, mood…"
              className="mt-2 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
              required
            />
          </div>

          <div className="rounded-xl bg-blush-soft p-4 text-xs text-muted-foreground">
            <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
            Bespoke pieces typically take 4–8 weeks. We'll respond within 24 hours with pricing and a
            proposed timeline.
          </div>

          <PrimaryButton type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
            {mutation.isPending ? "Sending…" : "Send bespoke request"} <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        </form>
      </section>
    </SiteLayout>
  );
}

function TF({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        {...props}
        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
