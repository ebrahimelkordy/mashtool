import { Link } from "@tanstack/react-router";
import { Menu, MessageCircle, Package, Search, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { usePublicSettings } from "@/hooks/use-settings";
import { siteConfig } from "@/lib/site-config";

const NAV = [
  { to: "/products", label: "Collections" },
  { to: "/our-story", label: "Our Story" },
  { to: "/track", label: "Track Order" },
  { to: "/contact", label: "Bespoke & Contact" },
] as const;

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 md:h-20 md:px-10">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 font-serif text-xl tracking-tight text-primary sm:text-2xl md:text-3xl"
        >
          <img src="/logo.png" alt="Mashtool" className="h-9 w-auto object-contain md:h-11" />
          <span className="truncate">{siteConfig.name}</span>
        </Link>
        <nav className="hidden items-center justify-center gap-8 md:flex lg:gap-10">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="whitespace-nowrap text-sm text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary underline underline-offset-8 decoration-1" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1 text-primary sm:gap-3">
          <Link
            to="/products"
            aria-label="Browse collections"
            className="hidden rounded-full p-2 transition-colors hover:bg-blush/60 sm:inline-flex"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <Link
            to="/track"
            aria-label="Track an order"
            className="rounded-full p-2 transition-colors hover:bg-blush/60"
          >
            <Package className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 transition-colors hover:bg-blush/60 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border/60 bg-background px-4 pb-4 pt-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-base text-foreground/80 transition-colors hover:bg-blush/50 hover:text-primary"
              activeProps={{ className: "bg-blush/60 text-primary" }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/special-order"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-xl bg-primary px-3 py-3 text-center text-sm font-medium text-primary-foreground"
          >
            Commission a piece
          </Link>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const { settings } = usePublicSettings();
  return (
    <footer className="mt-20 bg-blush/60 py-12 md:mt-24 md:py-16">
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-6 md:px-10">
        <div className="font-serif text-2xl text-primary md:text-3xl">{siteConfig.name}</div>
        <nav className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-foreground/75 sm:gap-x-8">
          <Link to="/products" className="hover:text-primary">Collections</Link>
          <Link to="/track" className="hover:text-primary">Track Order</Link>
          <Link to="/our-story" className="hover:text-primary">Our Story</Link>
          <Link to="/contact" className="hover:text-primary">Contact Us</Link>
        </nav>
        {settings && (settings.whatsappDisplay || settings.contactEmail) && (
          <p className="mt-6 text-sm text-foreground/70">
            {[
              settings.whatsappDisplay ? `WhatsApp ${settings.whatsappDisplay}` : null,
              settings.contactEmail,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        <p className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. Woven with Magic.
        </p>
      </div>
    </footer>
  );
}

function WhatsAppFab() {
  const { whatsapp } = usePublicSettings();
  const href = whatsapp();
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 md:bottom-6 md:right-6 md:h-14 md:w-14"
    >
      <MessageCircle className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.75} />
    </a>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <div className="mb-3 text-[10px] uppercase tracking-[0.25em] text-primary/80 sm:text-xs">
          {eyebrow}
        </div>
      )}
      <h2 className="font-serif text-3xl text-foreground sm:text-4xl md:text-5xl">{title}</h2>
      {description && (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:opacity-60 sm:px-7 " +
        className
      }
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-transparent px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5 sm:px-7 " +
        className
      }
    >
      {children}
    </button>
  );
}