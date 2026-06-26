import { useState } from "react";

interface ContactChannelsProps {
  email: string;
  copyLabel: string;
  copiedLabel: string;
  linkedinUrl: string;
  githubUrl: string;
}

const channelClass =
  "border border-border px-3 py-1.5 font-mono text-sm text-muted transition-colors " +
  "hover:border-accent hover:text-accent";

/**
 * Secondary contact channels: one-click copy-email (with a transient "copied"
 * confirmation), plus mailto, LinkedIn, and GitHub links. Sits alongside the
 * form so visitors who prefer their own client or a DM aren't forced through it.
 */
export default function ContactChannels({
  email,
  copyLabel,
  copiedLabel,
  linkedinUrl,
  githubUrl,
}: ContactChannelsProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context / permissions): fall back to the
      // mailto link, which is always present next to this button.
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={copy} className={channelClass}>
        {copied ? `✓ ${copiedLabel}` : copyLabel}
      </button>
      <a href={`mailto:${email}`} className={channelClass}>
        {email}
      </a>
      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className={channelClass}>
        LinkedIn ↗
      </a>
      <a href={githubUrl} target="_blank" rel="noopener noreferrer" className={channelClass}>
        GitHub ↗
      </a>
    </div>
  );
}
