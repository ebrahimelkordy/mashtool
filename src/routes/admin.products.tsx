import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { adminDeleteProduct, adminSaveProduct, adminUploadImage } from "@/lib/api.functions";
import type { Product, ProductOption } from "@/lib/data/types";
import { compressImageFile } from "@/lib/images";
import { adminProductsQuery, categoriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type Draft = {
  id?: string | null;
  name: string;
  categorySlug: string;
  priceFrom: number;
  leadTimeDays: string;
  shortDescription: string;
  description: string;
  images: string[];
  options: ProductOption[];
  featured: boolean;
  badge: string;
  active: boolean;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const emptyDraft = (categorySlug: string): Draft => ({
  id: null,
  name: "",
  categorySlug,
  priceFrom: 0,
  leadTimeDays: "2–3 weeks",
  shortDescription: "",
  description: "",
  images: [],
  options: [],
  featured: false,
  badge: "",
  active: true,
});

const toDraft = (p: Product): Draft => ({
  id: p.id,
  name: p.name,
  categorySlug: p.categorySlug,
  priceFrom: p.priceFrom,
  leadTimeDays: p.leadTimeDays,
  shortDescription: p.shortDescription,
  description: p.description,
  images: [...p.images],
  options: p.options.map((o) => ({ ...o, values: o.values.map((v) => ({ ...v })) })),
  featured: p.featured,
  badge: p.badge ?? "",
  active: p.active,
});

const input =
  "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
const label = "block text-xs uppercase tracking-wider text-muted-foreground";

function readAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

function AdminProducts() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery(adminProductsQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const [term, setTerm] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);

  const save = useMutation({
    mutationFn: (d: Draft) =>
      adminSaveProduct({
        data: {
          id: d.id ?? null,
          name: d.name,
          categorySlug: d.categorySlug,
          priceFrom: Number(d.priceFrom) || 0,
          leadTimeDays: d.leadTimeDays,
          shortDescription: d.shortDescription,
          description: d.description,
          images: d.images,
          options: d.options
            .filter((o) => o.name.trim() && o.values.length > 0)
            .map((o) => ({
              ...o,
              name: o.name.trim(),
              values: o.values
                .filter((v) => v.label.trim())
                .map((v) => ({ ...v, label: v.label.trim(), priceDelta: Number(v.priceDelta) || 0 })),
            })),
          featured: d.featured,
          badge: d.badge.trim() || null,
          active: d.active,
        },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries();
      setDraft(null);
      toast.success("Product saved");
    },
    onError: () => toast.error("Could not save this product"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteProduct({ data: { id } }),
    onSuccess: async () => {
      await qc.invalidateQueries();
      toast.success("Product removed");
    },
    onError: () => toast.error("Could not remove this product"),
  });

  const products = useMemo(() => {
    const q = term.trim().toLowerCase();
    return (data ?? []).filter((p) =>
      q ? `${p.name} ${p.category}`.toLowerCase().includes(q) : true,
    );
  }, [data, term]);

  const firstCategory = categories?.[0]?.slug ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-primary sm:text-4xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit or retire the pieces shown in the collections.
          </p>
        </div>
        <button
          onClick={() => setDraft(emptyDraft(firstCategory))}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} /> New product
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading products…</p>}
      {error && <p className="text-sm text-destructive">Could not load products.</p>}
      {!isLoading && !error && products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No products yet. Create your first piece to fill the collections.
        </div>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {products.map((p) => (
          <li
            key={p.id}
            className="flex gap-3 rounded-2xl border border-border/60 bg-background p-3 sm:p-4"
          >
            {p.images[0] ? (
              <img
                src={p.images[0]}
                alt={p.name}
                loading="lazy"
                className="h-20 w-20 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-blush/60 text-muted-foreground">
                <ImagePlus className="h-5 w-5" strokeWidth={1.5} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{p.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {p.category} · from ${p.priceFrom}
                {p.featured ? " · featured" : ""}
                {p.active ? "" : " · hidden"}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setDraft(toDraft(p))}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-foreground/75 hover:bg-blush/60"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} /> Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove “${p.name}”?`)) remove.mutate(p.id);
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(draft);
            }}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border/60 bg-background p-5 sm:rounded-3xl sm:p-7"
          >
            <h2 className="font-serif text-2xl text-primary">
              {draft.id ? "Edit product" : "New product"}
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className={label}>
                Name
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className={input}
                />
              </label>
              <label className={label}>
                Category
                <select
                  value={draft.categorySlug}
                  onChange={(e) => setDraft({ ...draft, categorySlug: e.target.value })}
                  className={input}
                >
                  {(categories ?? []).map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={label}>
                Base price
                <input
                  type="number"
                  min={0}
                  value={draft.priceFrom}
                  onChange={(e) => setDraft({ ...draft, priceFrom: Number(e.target.value) })}
                  className={input}
                />
              </label>
              <label className={label}>
                Lead time
                <input
                  value={draft.leadTimeDays}
                  onChange={(e) => setDraft({ ...draft, leadTimeDays: e.target.value })}
                  className={input}
                />
              </label>
              <label className={label}>
                Badge
                <input
                  value={draft.badge}
                  placeholder="e.g. New"
                  onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
                  className={input}
                />
              </label>
              <div className="flex items-end gap-4 pb-1">
                <label className="flex items-center gap-2 text-sm text-foreground/80">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground/80">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
            </div>

            <label className={`${label} mt-4`}>
              Short description
              <input
                value={draft.shortDescription}
                onChange={(e) => setDraft({ ...draft, shortDescription: e.target.value })}
                className={input}
              />
            </label>
            <label className={`${label} mt-4`}>
              Description
              <textarea
                rows={4}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className={input}
              />
            </label>

            <ImageManager
              images={draft.images}
              onChange={(images) => setDraft({ ...draft, images })}
            />

            <OptionsEditor
              options={draft.options}
              onChange={(options) => setDraft({ ...draft, options })}
            />

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-xl border border-border px-4 py-3 text-sm text-foreground/75"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={save.isPending}
                className="rounded-xl bg-primary px-5 py-3 text-sm text-primary-foreground disabled:opacity-50"
              >
                {save.isPending ? "Saving…" : "Save product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ImageManager({
  images,
  onChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (file.size > 15_000_000) {
          toast.error(`${file.name} is larger than 15MB`);
          continue;
        }
        const { base64, contentType } = await compressImageFile(file, 900, 0.75);
        const res = await adminUploadImage({
          data: { fileName: file.name, contentType, base64 },
        });
        uploaded.push(res.url);
      }
      if (uploaded.length) {
        onChange([...images, ...uploaded]);
        toast.success(`${uploaded.length} image(s) uploaded`);
      }
    } catch {
      toast.error("Upload failed. Please use PNG, JPG or WebP under 5MB.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function move(index: number, delta: number) {
    const next = [...images];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const current = next[index]!;
    next[index] = next[target]!;
    next[target] = current;
    onChange(next);
  }

  return (
    <div className="mt-5 rounded-2xl border border-border/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={label}>Images</span>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-50"
        >
          <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.5} />
          {uploading ? "Uploading…" : "Upload images"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          No images yet. The first image is used as the cover.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <li key={`${src}-${i}`} className="group relative overflow-hidden rounded-xl border border-border/60">
              <img src={src} alt={`Product image ${i + 1}`} className="aspect-square w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-background/85 p-1">
                <button
                  type="button"
                  aria-label="Move left"
                  onClick={() => move(i, -1)}
                  className="rounded p-1 text-foreground/70 hover:text-primary"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                  className="rounded p-1 text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move right"
                  onClick={() => move(i, 1)}
                  className="rounded p-1 text-foreground/70 hover:text-primary"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="…or paste an image URL"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => {
            if (!url.trim()) return;
            onChange([...images, url.trim()]);
            setUrl("");
          }}
          className="shrink-0 rounded-xl border border-border px-3 text-sm text-foreground/75"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: ProductOption[];
  onChange: (next: ProductOption[]) => void;
}) {
  function patch(id: string, next: Partial<ProductOption>) {
    onChange(options.map((o) => (o.id === id ? { ...o, ...next } : o)));
  }

  return (
    <div className="mt-5 rounded-2xl border border-border/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={label}>Options (size, colour…)</span>
        <button
          type="button"
          onClick={() =>
            onChange([...options, { id: uid(), name: "", required: true, values: [] }])
          }
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-foreground/75"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Add option
        </button>
      </div>

      {options.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Optional. Values can add to the base price.
        </p>
      )}

      <div className="mt-3 space-y-4">
        {options.map((option) => (
          <div key={option.id} className="rounded-xl bg-blush/40 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={option.name}
                placeholder="Option name"
                onChange={(e) => patch(option.id, { name: e.target.value })}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <label className="flex items-center gap-1.5 text-xs text-foreground/75">
                <input
                  type="checkbox"
                  checked={option.required}
                  onChange={(e) => patch(option.id, { required: e.target.checked })}
                />
                Required
              </label>
              <button
                type="button"
                aria-label="Remove option"
                onClick={() => onChange(options.filter((o) => o.id !== option.id))}
                className="rounded p-1.5 text-destructive"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="mt-2 space-y-2">
              {option.values.map((value) => (
                <div key={value.id} className="flex items-center gap-2">
                  <input
                    value={value.label}
                    placeholder="Value"
                    onChange={(e) =>
                      patch(option.id, {
                        values: option.values.map((v) =>
                          v.id === value.id ? { ...v, label: e.target.value } : v,
                        ),
                      })
                    }
                    className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    value={value.priceDelta}
                    aria-label="Price change"
                    onChange={(e) =>
                      patch(option.id, {
                        values: option.values.map((v) =>
                          v.id === value.id ? { ...v, priceDelta: Number(e.target.value) } : v,
                        ),
                      })
                    }
                    className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    aria-label="Remove value"
                    onClick={() =>
                      patch(option.id, { values: option.values.filter((v) => v.id !== value.id) })
                    }
                    className="rounded p-1.5 text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  patch(option.id, {
                    values: [...option.values, { id: uid(), label: "", priceDelta: 0 }],
                  })
                }
                className="text-xs text-primary underline underline-offset-4"
              >
                Add value
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
