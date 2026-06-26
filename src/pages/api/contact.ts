import type { APIRoute } from "astro";
import { z } from "zod";
import { Resend } from "resend";
import {
  RESEND_API_KEY,
  CONTACT_TO_EMAIL,
  CONTACT_FROM_EMAIL,
} from "astro:env/server";

// On-demand route: opts this single endpoint out of static prerendering so the
// Vercel adapter ships it as a serverless function. Every page stays static.
export const prerender = false;

/**
 * Contact submission shape. Mirrors the form island (ContactForm.tsx) and is the
 * single source of truth for what the server accepts. `honeypot` must be empty —
 * bots that auto-fill every field trip it and get a silent 200.
 */
const ContactSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.email("Enter a valid email").trim(),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  type: z.enum(["Role", "Project", "Other"]),
  details: z.string().trim().min(10, "Tell me a little more").max(2000),
  // Accept any value here — a non-empty honeypot is handled in the route as a
  // silent success, NOT a validation error (which would tip off the bot).
  honeypot: z.string().optional(),
});

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * Best-effort, in-memory rate limit keyed by client IP. Resets on every cold
 * start, which is fine for a portfolio contact form — it's a speed bump for
 * abuse, not a security boundary. The honeypot + Zod validation do the rest.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request body." }, 400);
  }

  const parsed = ContactSchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid input.";
    return json({ ok: false, error: firstIssue }, 422);
  }

  const { name, email, company, type, details, honeypot } = parsed.data;

  // Honeypot tripped: pretend success so bots don't learn they were caught.
  if (honeypot) return json({ ok: true }, 200);

  // clientAddress can be unavailable in some runtimes; fall back to a constant
  // bucket rather than throwing.
  const ip = clientAddress ?? "unknown";
  if (isRateLimited(ip)) {
    return json(
      { ok: false, error: "Too many messages — please try again shortly." },
      429,
    );
  }

  const resend = new Resend(RESEND_API_KEY);
  const companyLine = company ? company : "—";

  const { error } = await resend.emails.send({
    from: CONTACT_FROM_EMAIL,
    to: CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `[${type}] New contact from ${name}${company ? ` — ${company}` : ""}`,
    text: [
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Company: ${companyLine}`,
      `Type:    ${type}`,
      "",
      "Details:",
      details,
    ].join("\n"),
  });

  if (error) {
    // Log server-side for debugging; never leak provider internals to the client.
    console.error("Resend send failed:", error);
    return json(
      { ok: false, error: "Could not send your message right now." },
      502,
    );
  }

  return json({ ok: true }, 200);
};
