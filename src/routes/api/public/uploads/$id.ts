import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/uploads/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { getFile } = await import("@/lib/data/repository.server");
        const file = await getFile(params.id);
        if (!file) return new Response("Not found", { status: 404 });

        const binary = Uint8Array.from(atob(file.base64), (c) => c.charCodeAt(0));
        return new Response(binary, {
          headers: {
            "content-type": file.contentType,
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
