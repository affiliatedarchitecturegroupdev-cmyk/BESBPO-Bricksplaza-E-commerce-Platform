import { getSql } from "@/lib/db";

function origin() {
  return (process.env.BETTER_AUTH_URL || process.env.RENDER_EXTERNAL_URL || "https://bricksplaza.onrender.com").replace(/\/$/, "");
}

export function orderUrl(id: string) {
  return `${origin()}/order/${id}`;
}

/** Writes every customer message to outbound_mail. Delivers through Resend when RESEND_API_KEY is set. */
export async function sendCustomerMail(input: { kind: string; to: string; subject: string; text: string }) {
  const to = input.to.trim().toLowerCase();
  if (!to.includes("@")) return { status: "skipped" as const };
  const sql = await getSql();
  let status = "queued";
  let error: string | null = null;
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MAIL_FROM?.trim() || "Bricksplaza <orders@bricksplaza.co.za>";
  if (key) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [to], subject: input.subject, text: input.text }),
      });
      if (!res.ok) {
        status = "failed";
        error = (await res.text()).slice(0, 400);
      } else {
        status = "sent";
      }
    } catch (err) {
      status = "failed";
      error = err instanceof Error ? err.message : "send failed";
    }
  }
  try {
    await sql`insert into outbound_mail (kind, to_email, subject, body, status, error)
      values (${input.kind}, ${to}, ${input.subject}, ${input.text}, ${status}, ${error})`;
  } catch {
    // The mail table may not exist yet on a database that has not migrated. Do not fail the order.
  }
  return { status };
}
