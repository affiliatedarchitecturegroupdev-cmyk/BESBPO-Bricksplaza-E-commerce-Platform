import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/media/posts/$slug")({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { slug: string }; request: Request }) => {
        const slug = params?.slug || new URL(request.url).pathname.split("/").pop() || "";
        const { postImage } = await import("@/lib/posts.server");
        const image = await postImage(slug);
        if (!image) return new Response("Not found", { status: 404 });
        const raw = image.bytes instanceof Uint8Array ? image.bytes : new Uint8Array(image.bytes);
        const copy = new Uint8Array(raw.byteLength);
        copy.set(raw);
        return new Response(new Blob([copy]), {
          headers: {
            "content-type": image.type,
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
