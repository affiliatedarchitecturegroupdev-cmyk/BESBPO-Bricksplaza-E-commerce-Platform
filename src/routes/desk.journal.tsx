import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listDeskPosts, savePost } from "@/lib/posts";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/journal")({ component: Journal });

type Draft = {
  id: number;
  slug: string;
  title: string;
  tag: string;
  excerpt: string;
  body: string;
  skus: string;
  status: "draft" | "published";
  image: string;
};

const empty: Draft = { id: 0, slug: "", title: "", tag: "Specification", excerpt: "", body: "", skus: "", status: "draft", image: "" };

function Journal() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listDeskPosts>>>([]);
  const [draft, setDraft] = useState<Draft>(empty);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setRows(await listDeskPosts());
  }
  useEffect(() => {
    refresh().catch((err) => toast.error(err instanceof Error ? err.message : "Journal unavailable"));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl">Journal</h1>
      <p className="mt-1 max-w-2xl text-sm text-dim">
        Yard notes. A picture is required. Publish sends it to the storefront. Only this desk can save one.
      </p>
      <form
        className="mt-6 space-y-3 rounded-xl bg-kiln-2 p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await savePost({ data: draft });
            toast.success(draft.status === "published" ? "Published" : "Draft saved");
            setDraft(empty);
            await refresh();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not save");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-bisque">Title</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
          </div>
          <div>
            <Label className="text-bisque">Slug</Label>
            <Input value={draft.slug} placeholder="left blank, taken from the title" onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
          </div>
          <div>
            <Label className="text-bisque">Tag</Label>
            <Input value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value })} required />
          </div>
          <div>
            <Label className="text-bisque">Status</Label>
            <select
              className="mt-1 h-10 w-full rounded-md bg-kiln px-2 text-sm text-bisque"
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as Draft["status"] })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div>
          <Label className="text-bisque">Excerpt</Label>
          <Textarea value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} required />
        </div>
        <div>
          <Label className="text-bisque">Note</Label>
          <Textarea rows={8} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} required />
        </div>
        <div>
          <Label className="text-bisque">Related SKUs</Label>
          <Input value={draft.skus} placeholder="BP-ENB-0001, optional" onChange={(e) => setDraft({ ...draft, skus: e.target.value })} />
        </div>
        <div>
          <Label className="text-bisque">{draft.id ? "Replace picture" : "Picture"}</Label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1 block text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setDraft((d) => ({ ...d, image: String(reader.result ?? "") }));
              reader.readAsDataURL(file);
            }}
          />
        </div>
        <Button type="submit" disabled={busy}>
          {draft.id ? "Update note" : "Save note"}
        </Button>
      </form>
      <ul className="mt-8 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-kiln-2 p-4">
            <div>
              <p className="font-medium">{row.title}</p>
              <p className="text-xs text-dim">
                {row.status} · {row.tag} · {row.date || "unpublished"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                setDraft({
                  id: row.id,
                  slug: row.slug,
                  title: row.title,
                  tag: row.tag,
                  excerpt: row.excerpt,
                  body: row.body,
                  skus: row.skus,
                  status: row.status,
                  image: "",
                })
              }
            >
              Edit
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
