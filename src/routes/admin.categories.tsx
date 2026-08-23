import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FolderPlus, ImagePlus, Pencil, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { adminDeleteCategory, adminSaveCategory, adminUploadImage } from "@/lib/api.functions";
import type { Category } from "@/lib/data/types";
import { compressImageFile } from "@/lib/images";
import { categoriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

type CategoryDraft = {
  id?: string | null;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
  featured?: boolean;
};

const emptyCategoryDraft: CategoryDraft = {
  id: null,
  name: "",
  slug: "",
  tagline: "",
  description: "",
  image: "",
  featured: false,
};

function readAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
const labelClass = "block text-xs uppercase tracking-wider text-muted-foreground";

function AdminCategories() {
  const qc = useQueryClient();
  const { data: categories, isLoading, error } = useQuery(categoriesQuery);
  const [term, setTerm] = useState("");
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: (d: CategoryDraft) =>
      adminSaveCategory({
        data: {
          id: d.id ?? null,
          name: d.name.trim(),
          slug: d.slug.trim() || undefined,
          tagline: d.tagline.trim(),
          description: d.description.trim(),
          image: d.image.trim(),
          featured: d.featured ?? false,
        },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries();
      setDraft(null);
      toast.success("Category saved successfully");
    },
    onError: () => toast.error("Could not save category"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteCategory({ data: { id } }),
    onSuccess: async () => {
      await qc.invalidateQueries();
      toast.success("Category deleted");
    },
    onError: () => toast.error("Could not delete category"),
  });

  const filteredCategories = useMemo(() => {
    const q = term.trim().toLowerCase();
    return (categories ?? []).filter(
      (c) => !q || `${c.name} ${c.tagline} ${c.description}`.toLowerCase().includes(q),
    );
  }, [categories, term]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !draft) return;
    if (file.size > 15_000_000) {
      toast.error("Image file size should be less than 15MB");
      return;
    }
    setUploading(true);
    try {
      const { base64, contentType } = await compressImageFile(file, 900, 0.75);
      const res = await adminUploadImage({
        data: { fileName: file.name, contentType, base64 },
      });
      setDraft({ ...draft, image: res.url });
      toast.success("Category image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-primary sm:text-4xl">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your store collections and product sections.
          </p>
        </div>
        <button
          onClick={() => setDraft({ ...emptyCategoryDraft })}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition-transform active:scale-95"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} /> New Category
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search categories…"
          className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading categories…</p>}
      {error && <p className="text-sm text-destructive">Could not load categories.</p>}

      {!isLoading && !error && filteredCategories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No categories found. Create your first collection above.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredCategories.map((c) => (
          <div
            key={c.id}
            className="flex gap-4 rounded-2xl border border-border/60 bg-background p-4 shadow-sm transition-all hover:border-primary/40"
          >
            {c.image ? (
              <img
                src={c.image}
                alt={c.name}
                className="h-24 w-24 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-blush/60 text-muted-foreground">
                <FolderPlus className="h-6 w-6" strokeWidth={1.5} />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-block rounded-full bg-blush px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                    {c.tagline || c.slug}
                  </span>
                  {c.featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      <Sparkles className="h-3 w-3" /> Home Page
                    </span>
                  )}
                </div>
                <h3 className="mt-1 truncate font-serif text-lg text-foreground">{c.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setDraft({ ...c })}
                  className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-foreground/75 hover:bg-blush/60"
                >
                  <Pencil className="h-3 w-3" strokeWidth={1.5} /> Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove category “${c.name}”?`)) remove.mutate(c.id);
                  }}
                  className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" strokeWidth={1.5} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(draft);
            }}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border/60 bg-background p-6 sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-primary">
                {draft.id ? "Edit Category" : "New Category"}
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className={labelClass}>
                Category Name
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Crochet Flower Bouquets"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Slug (URL)
                <input
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  placeholder="e.g. crochet-bouquets"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Tagline
                <input
                  value={draft.tagline}
                  onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                  placeholder="e.g. Everlasting Knitted Blooms"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Description
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Short description for collection cards..."
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Cover Image URL
                <div className="mt-1 flex gap-2">
                  <input
                    value={draft.image}
                    onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  <label className="flex cursor-pointer items-center gap-1 rounded-xl border border-border bg-accent px-3 py-2.5 text-xs text-foreground hover:bg-blush">
                    <ImagePlus className="h-4 w-4" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </label>

              <label className="flex items-center gap-2 pt-1 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={draft.featured ?? false}
                  onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Show on Home Page (Featured Category)
                </span>
              </label>

              {draft.image && (
                <div className="mt-2 aspect-video overflow-hidden rounded-xl bg-muted">
                  <img src={draft.image} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

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
                disabled={save.isPending || uploading}
                className="rounded-xl bg-primary px-5 py-3 text-sm text-primary-foreground disabled:opacity-50"
              >
                {save.isPending ? "Saving…" : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
