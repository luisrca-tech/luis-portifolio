interface ContactChannelsProps {
  email: string;
  linkedinUrl: string;
  githubUrl: string;
}

const channelClass =
  "border border-border px-3 py-1.5 font-mono text-sm text-muted transition-colors " +
  "hover:border-accent hover:text-accent";

/**
 * Secondary contact channels: mailto, LinkedIn, and GitHub links. Sits below
 * the form so visitors who prefer their own client or a DM aren't forced through it.
 */
export default function ContactChannels({
  email,
  linkedinUrl,
  githubUrl,
}: ContactChannelsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
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
