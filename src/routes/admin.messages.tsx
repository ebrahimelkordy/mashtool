import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { adminDeleteMessage, adminMarkMessage } from "@/lib/api.functions";
import { adminMessagesQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

function AdminMessages() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery(adminMessagesQuery);

  const mark = useMutation({
    mutationFn: (vars: { id: string; read: boolean }) => adminMarkMessage({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteMessage({ data: { id } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Message removed");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary sm:text-4xl">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Missives sent through the contact page.</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading messages…</p>}
      {error && <p className="text-sm text-destructive">Could not load messages.</p>}
      {!isLoading && !error && (data ?? []).length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No messages yet.
        </p>
      )}

      <ul className="space-y-3">
        {(data ?? []).map((m) => (
          <li
            key={m.id}
            className={`rounded-2xl border p-4 sm:p-5 ${m.read ? "border-border/60 bg-background" : "border-primary/30 bg-blush/30"}`}
          >
            <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{m.subject}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.name} · {m.email} · {new Date(m.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => mark.mutate({ id: m.id, read: !m.read })}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground/75 hover:bg-blush/60"
              >
                {m.read ? "Mark unread" : "Mark read"}
              </button>
              <button
                onClick={() => remove.mutate(m.id)}
                className="rounded-full border border-border p-1.5 text-destructive hover:bg-destructive/10"
                aria-label="Delete message"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/85">{m.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}