import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { MapPin, Mail, Instagram, ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, PrimaryButton, GhostButton } from "@/components/site/site-layout";
import { submitMessage } from "@/lib/api.functions";
import { usePublicSettings } from "@/hooks/use-settings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Bespoke & Contact — Mashtool" },
      { name: "description", content: "Reach out to the Mashtool studio. Send a missive and let us weave your vision." },
      { property: "og:title", content: "Bespoke & Contact — Mashtool" },
      { property: "og:description", content: "Send a missive to the Mashtool studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { settings, whatsapp } = usePublicSettings();
  const waLink = whatsapp();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    body: "",
  });
  const send = useServerFn(submitMessage);

  const mutation = useMutation({
    mutationFn: () =>
      send({
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject,
          body: form.body.trim(),
        },
      }),
    onSuccess: () => setSent(true),
    onError: () => toast.error("We couldn't send your missive. Please check your details."),
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:px-10 md:py-24">
        <h1 className="font-serif text-4xl leading-tight text-primary sm:text-5xl md:text-7xl">
          Reach Out to the Magic
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">
          Whether you seek a bespoke enchantment woven just for you, or have questions about our
          existing collections, we invite you to connect.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 md:px-10 md:pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="rounded-3xl bg-card p-5 shadow-sm sm:p-8 md:p-10 lg:col-span-2">
            <h2 className="font-serif text-2xl text-primary sm:text-3xl">Send a Missive</h2>
            {sent ? (
              <div className="mt-8 rounded-2xl bg-blush/70 p-6 text-center sm:p-8">
                <Sparkles className="mx-auto h-6 w-6 text-primary" />
                <div className="mt-3 font-serif text-xl text-foreground sm:text-2xl">
                  Your missive is on its way
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  We'll respond within one moon-cycle (usually 24 hours).
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (form.name.trim().length < 2 || form.body.trim().length < 5) {
                    toast.error("Please add your name and a short message.");
                    return;
                  }
                  mutation.mutate();
                }}
                className="mt-8 space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field
                    label="Your Name"
                    required
                    placeholder="Evelyn Starweaver"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <Field
                    label="Your Email"
                    type="email"
                    required
                    placeholder="evelyn@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="mt-2 w-full border-0 border-b border-border bg-transparent py-2 text-sm outline-none focus:border-primary"
                  >
                    <option>General Inquiry</option>
                    <option>Bespoke Commission</option>
                    <option>Order Status</option>
                    <option>Wholesale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground">Your Message</label>
                  <textarea
                    rows={5}
                    required
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    placeholder="Tell us about the threads of your vision…"
                    className="mt-2 w-full resize-none border-0 border-b border-border bg-transparent py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <PrimaryButton type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Sending…" : "Send Message"} <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-blush/70 p-6 sm:p-8">
              <h3 className="font-serif text-xl text-primary sm:text-2xl">Other Ways to Connect</h3>
              <div className="mt-6 space-y-4 text-sm text-foreground/80">
                {settings?.addressLine && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>{settings.addressLine}</div>
                  </div>
                )}
                {settings?.contactEmail && (
                  <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-primary" />
                    <span className="break-all">{settings.contactEmail}</span>
                  </a>
                )}
                {waLink && (
                  <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                    {settings?.whatsappDisplay || "WhatsApp"}
                  </a>
                )}
              </div>
              <div className="mt-6 flex gap-3 border-t border-primary/15 pt-6 text-primary">
                {settings?.instagramUrl && (
                  <SocialLink href={settings.instagramUrl}><Instagram className="h-4 w-4" /></SocialLink>
                )}
                {settings?.contactEmail && (
                  <SocialLink href={`mailto:${settings.contactEmail}`}><Mail className="h-4 w-4" /></SocialLink>
                )}
                {waLink && <SocialLink href={waLink}><MessageCircle className="h-4 w-4" /></SocialLink>}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-[10px] uppercase tracking-widest">
                <Sparkles className="h-3 w-3" /> Bespoke Enchantments
              </span>
              <h3 className="mt-4 font-serif text-xl sm:text-2xl">Commission a Unique Piece</h3>
              <p className="mt-3 text-sm text-primary-foreground/85">
                Let us weave your personal story into a one-of-a-kind creation.
              </p>
              <Link to="/special-order">
                <GhostButton className="mt-6 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
                  Discover Bespoke
                </GhostButton>
              </Link>
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-foreground/10 blur-2xl" />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        {...props}
        className="mt-2 w-full border-0 border-b border-border bg-transparent py-2 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function SocialLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-background/50 transition-colors hover:bg-background"
    >
      {children}
    </a>
  );
}
