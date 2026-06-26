/*
  Typed UI string dictionary.

  All visible UI strings live here, never hardcoded in markup. `en` is the
  source of truth and the only authored locale in v1; `pt` is a reserved slot
  for a future Brazilian Portuguese version (see astro.config i18n).
*/

export type Locale = "en" | "pt";

export const defaultLocale: Locale = "en";

export interface UIStrings {
  brand: string;
  role: string;
  nav: {
    home: string;
    projects: string;
    contact: string;
  };
  cta: {
    talk: string;
    downloadCv: string;
  };
  home: {
    hero: {
      promptWhoami: string;
      promptContact: string;
    };
    about: {
      heading: string;
      body: string[];
      stats: { value: string; label: string }[];
      status: string[];
      badges: string[];
    };
    featured: {
      heading: string;
      viewAll: string;
    };
    contact: {
      heading: string;
      lead: string;
      email: string;
      copyEmail: string;
      copied: string;
      form: {
        name: string;
        namePlaceholder: string;
        email: string;
        emailPlaceholder: string;
        company: string;
        companyPlaceholder: string;
        type: string;
        typeOptions: { value: "Role" | "Project" | "Other"; label: string }[];
        details: string;
        detailsPlaceholder: Record<"Role" | "Project" | "Other", string>;
        submit: string;
        sending: string;
        success: string;
        error: string;
      };
    };
  };
  socials: {
    linkedin: string;
    github: string;
  };
  projects: {
    title: string;
    intro: string;
    viewCode: string;
    viewLive: string;
    comingSoon: string;
    back: string;
    filter: {
      label: string;
      all: string;
      systems: string;
      frontend: string;
    };
  };
  footer: {
    builtWith: string;
    rights: string;
  };
}

const en: UIStrings = {
  brand: "Luis Felipe Da Rocha",
  role: "Full Stack Developer / AI Engineer",
  nav: {
    home: "home",
    projects: "projects",
    contact: "contact",
  },
  cta: {
    talk: "open to roles & projects — let's talk",
    downloadCv: "Download CV (PDF)",
  },
  home: {
    hero: {
      promptWhoami: "whoami",
      promptContact: "./open-to-work --roles --projects",
    },
    about: {
      heading: "about",
      body: [
        "Full Stack / AI Engineer who builds production systems where the architecture decision is the business outcome. At Naranja Labs I own end-to-end solutions for US-market clients — including the platform that runs a studio's 3D-rendering pipeline from proposal through stage-based production to delivery and billing, backed by a read-only audit harness that verifies every financial KPI against production data to the cent.",
        "I led the evolution of a single-provider content tool into a multi-model RAG orchestrator routed across LLM providers behind decoupled microservices, and shipped the financial dashboard that became leadership's single source of truth. Independently, I architect complete multi-tenant SaaS products — from CRMs to real-time chat-as-a-service — built to sell, with billing, auth, and per-tenant data isolation.",
        "I pair strong fundamentals (TDD, type-safe APIs, clean architecture) with a disciplined AI-augmented workflow — spec-driven development, agentic looping, and custom skills and sub-agents across Cursor and Claude Code — treating AI as an instrument under engineering control, not autopilot, and reviewing every output to keep changes in scope.",
      ],
      stats: [
        { value: "~68%", label: "verified profit margin" },
        { value: "66%", label: "lower AI latency & cost" },
        { value: "300+", label: "projects in pipeline" },
        { value: "6 mo", label: "Junior → Mid-Level" },
      ],
      status: ["open to work", "remote"],
      badges: [
        "RAG",
        "Multi-LLM Orchestration",
        "AI Agents",
        "SaaS Architecture",
        "TDD",
      ],
    },
    featured: {
      heading: "featured work",
      viewAll: "view all projects",
    },
    contact: {
      heading: "contact",
      lead: "Open to full-time, contract, and freelance work. Tell me about a role or a project below — or reach me directly through any channel.",
      email: "luisrochacruzalves@gmail.com",
      copyEmail: "Copy email",
      copied: "Copied!",
      form: {
        name: "Name",
        namePlaceholder: "Jane Doe",
        email: "Email",
        emailPlaceholder: "jane@company.com",
        company: "Company / Organization",
        companyPlaceholder: "Acme Inc (optional)",
        type: "What's this about?",
        typeOptions: [
          { value: "Role", label: "A role" },
          { value: "Project", label: "A project" },
          { value: "Other", label: "Something else" },
        ],
        details: "Details",
        detailsPlaceholder: {
          Role: "Tell me about the role — team, stack, seniority, location / remote, and what you're hiring for.",
          Project: "Tell me about the project — goals, scope, rough timeline, and budget range if you have one.",
          Other: "What's on your mind?",
        },
        submit: "Send message",
        sending: "Sending…",
        success: "Thanks — your message is on its way. I'll reply by email soon.",
        error: "Something went wrong sending your message. Please email me directly.",
      },
    },
  },
  socials: {
    linkedin: "https://www.linkedin.com/in/luisfelipedarocha/",
    github: "https://github.com/luisrca-tech",
  },
  projects: {
    title: "projects",
    intro: "Selected work — a representative slice, not an exhaustive list.",
    viewCode: "View Code",
    viewLive: "View Live",
    comingSoon: "Coming soon",
    back: "back to projects",
    filter: {
      label: "filter",
      all: "all",
      systems: "systems",
      frontend: "frontend",
    },
  },
  footer: {
    builtWith: "Built with Astro, React & Tailwind",
    rights: "All rights reserved.",
  },
};

// Brazilian Portuguese. Mirrors `en` exactly in meaning — no information added
// or dropped. Per pt-BR convention, the em-dash (—) sentence pattern from the
// English copy is rephrased with commas/colons. Job titles and established
// technical terms (RAG, TDD, Full Stack, RAG, type-safe, etc.) are kept as the
// industry uses them in Brazil.
const pt: UIStrings = {
  brand: "Luis Felipe Da Rocha",
  role: "Desenvolvedor Full Stack / Engenheiro de IA",
  nav: {
    home: "início",
    projects: "projetos",
    contact: "contato",
  },
  cta: {
    talk: "aberto a vagas e projetos, vamos conversar",
    downloadCv: "Baixar CV (PDF)",
  },
  home: {
    hero: {
      promptWhoami: "whoami",
      promptContact: "./aberto-para-trabalhar --vagas --projetos",
    },
    about: {
      heading: "sobre",
      body: [
        "Desenvolvedor Full Stack / Engenheiro de IA que constrói sistemas em produção onde a decisão de arquitetura é o resultado de negócio. Na Naranja Labs sou responsável por soluções de ponta a ponta para clientes do mercado dos EUA, incluindo a plataforma que opera o pipeline de renderização 3D de um estúdio, da proposta à produção em etapas até a entrega e a cobrança, apoiada por um harness de auditoria somente leitura que verifica cada KPI financeiro contra os dados de produção até o último centavo.",
        "Liderei a evolução de uma ferramenta de conteúdo de provedor único para um orquestrador RAG multi-modelo roteado entre provedores de LLM por trás de microsserviços desacoplados, e entreguei o dashboard financeiro que se tornou a fonte única de verdade da liderança. De forma independente, arquiteto produtos SaaS multi-tenant completos, de CRMs a chat-as-a-service em tempo real, feitos para vender, com cobrança, autenticação e isolamento de dados por tenant.",
        "Combino fundamentos sólidos (TDD, APIs type-safe, arquitetura limpa) com um fluxo de trabalho disciplinado e potencializado por IA: desenvolvimento orientado a especificação, looping agêntico e skills e sub-agentes customizados no Cursor e no Claude Code, tratando a IA como um instrumento sob controle de engenharia, não como piloto automático, e revisando cada resultado para manter as mudanças dentro do escopo.",
      ],
      stats: [
        { value: "~68%", label: "margem de lucro verificada" },
        { value: "66%", label: "menor latência e custo de IA" },
        { value: "300+", label: "projetos no pipeline" },
        { value: "6 meses", label: "Júnior → Pleno" },
      ],
      status: ["aberto a oportunidades", "remoto"],
      badges: [
        "RAG",
        "Orquestração Multi-LLM",
        "Agentes de IA",
        "Arquitetura SaaS",
        "TDD",
      ],
    },
    featured: {
      heading: "trabalhos em destaque",
      viewAll: "ver todos os projetos",
    },
    contact: {
      heading: "contato",
      lead: "Aberto a trabalho full-time, por contrato e freelance. Conte sobre uma vaga ou um projeto abaixo, ou fale comigo diretamente por qualquer canal.",
      email: "luisrochacruzalves@gmail.com",
      copyEmail: "Copiar e-mail",
      copied: "Copiado!",
      form: {
        name: "Nome",
        namePlaceholder: "João da Silva",
        email: "E-mail",
        emailPlaceholder: "joao@empresa.com",
        company: "Empresa / Organização",
        companyPlaceholder: "Acme Ltda (opcional)",
        type: "Sobre o que é?",
        typeOptions: [
          { value: "Role", label: "Uma vaga" },
          { value: "Project", label: "Um projeto" },
          { value: "Other", label: "Outro assunto" },
        ],
        details: "Detalhes",
        detailsPlaceholder: {
          Role: "Conte sobre a vaga: time, stack, senioridade, local / remoto e para o que está contratando.",
          Project: "Conte sobre o projeto: objetivos, escopo, prazo aproximado e faixa de orçamento, se tiver uma.",
          Other: "O que você tem em mente?",
        },
        submit: "Enviar mensagem",
        sending: "Enviando…",
        success: "Obrigado, sua mensagem está a caminho. Responderei por e-mail em breve.",
        error: "Algo deu errado ao enviar sua mensagem. Por favor, envie um e-mail diretamente.",
      },
    },
  },
  socials: {
    linkedin: "https://www.linkedin.com/in/luisfelipedarocha/",
    github: "https://github.com/luisrca-tech",
  },
  projects: {
    title: "projetos",
    intro: "Trabalhos selecionados: uma amostra representativa, não uma lista exaustiva.",
    viewCode: "Ver código",
    viewLive: "Ver online",
    comingSoon: "Em breve",
    back: "voltar aos projetos",
    filter: {
      label: "filtrar",
      all: "todos",
      systems: "sistemas",
      frontend: "frontend",
    },
  },
  footer: {
    builtWith: "Feito com Astro, React e Tailwind",
    rights: "Todos os direitos reservados.",
  },
};

const dictionaries: Record<Locale, Partial<UIStrings>> = { en, pt };

/** Resolve the string table for a locale, falling back to English. */
export function useStrings(locale: Locale = defaultLocale): UIStrings {
  return { ...en, ...dictionaries[locale] };
}
