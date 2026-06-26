import { useState, type FormEvent } from "react";

type InquiryType = "Role" | "Project" | "Other";

interface ContactFormStrings {
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  company: string;
  companyPlaceholder: string;
  type: string;
  typeOptions: { value: InquiryType; label: string }[];
  details: string;
  detailsPlaceholder: Record<InquiryType, string>;
  submit: string;
  sending: string;
  success: string;
  error: string;
}

interface ContactFormProps {
  strings: ContactFormStrings;
  email: string;
  copyLabel: string;
  copiedLabel: string;
}

type Status = "idle" | "sending" | "success" | "error";

const inputClass =
  "w-full border border-border bg-surface px-3 py-2 font-mono text-sm text-fg " +
  "transition-colors placeholder:text-muted focus:border-accent focus:outline-none";
const labelClass = "flex flex-col gap-1.5 font-mono text-sm text-muted";
const copyButtonClass =
  "border border-border px-3 py-1.5 font-mono text-sm text-muted transition-colors " +
  "hover:border-accent hover:text-accent";

/**
 * Contact form island. Posts JSON to the `/api/contact` serverless function,
 * which validates with the same field shape and sends via Resend. The visible
 * fields qualify the lead (role vs project) and the textarea placeholder adapts
 * to the selected inquiry type. A hidden honeypot field traps naive bots.
 *
 * Server-side validation is authoritative; the light client checks here just
 * give fast feedback and avoid empty round-trips.
 */
export default function ContactForm({
  strings,
  email,
  copyLabel,
  copiedLabel,
}: ContactFormProps) {
  const [type, setType] = useState<InquiryType>("Role");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      type,
      details: String(data.get("details") ?? "").trim(),
      honeypot: String(data.get("company_url") ?? ""),
    };

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok: boolean; error?: string }
        | null;

      if (res.ok && body?.ok) {
        setStatus("success");
        form.reset();
        setType("Role");
        return;
      }
      setError(body?.error ?? strings.error);
      setStatus("error");
    } catch {
      setError(strings.error);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p
        role="status"
        className="border border-accent bg-surface px-4 py-3 font-mono text-sm text-accent"
      >
        {strings.success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          {strings.name}
          <input
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={80}
            placeholder={strings.namePlaceholder}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          {strings.email}
          <input
            name="email"
            type="email"
            required
            placeholder={strings.emailPlaceholder}
            className={inputClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        {strings.company}
        <input
          name="company"
          type="text"
          maxLength={120}
          placeholder={strings.companyPlaceholder}
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        {strings.type}
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as InquiryType)}
          className={inputClass}
        >
          {strings.typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        {strings.details}
        <textarea
          name="details"
          required
          minLength={10}
          maxLength={2000}
          rows={6}
          placeholder={strings.detailsPlaceholder[type]}
          className={`${inputClass} resize-y`}
        />
      </label>

      {/* Honeypot: hidden from humans, irresistible to naive bots. A real
          visitor never fills it; the server drops any submission that does. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Company URL
          <input name="company_url" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" && (
        <p role="alert" className="font-mono text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 self-start">
        <button
          type="submit"
          disabled={status === "sending"}
          className="border border-accent px-4 py-2 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-base disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? strings.sending : `${strings.submit} →`}
        </button>
        <button type="button" onClick={copyEmail} className={copyButtonClass}>
          {copied ? `✓ ${copiedLabel}` : copyLabel}
        </button>
      </div>
    </form>
  );
}
