import { initials } from "../utils/format";
import { pickPalette } from "../utils/colors";

export function buildPortfolioData({ isMobile }) {
  const skills = {
    aws: {
      id: "aws",
      title: "AWS",
      subtitle: "EC2 • S3 • IAM • VPC",
      desc: "Secure, cost-aware cloud foundations with clear ownership and guardrails.",
      bullets: ["IAM least privilege", "Networking/VPC", "Compute + storage patterns", "Operational hygiene"],
      examples: ["Set up secure VPC + IAM boundaries", "Hardened EC2 patterns and access", "S3 policies + lifecycle + cost controls"],
    },
    jenkins: {
      id: "jenkins",
      title: "Jenkins",
      subtitle: "CI/CD Pipelines",
      desc: "Build → test → deploy automation so releases become boring (in the best way).",
      bullets: ["Pipelines", "Automation", "Release confidence"],
      examples: ["Branch + PR workflows", "Artifacts + versioning", "Rollback-friendly deployments"],
    },
    docker: {
      id: "docker",
      title: "Docker",
      subtitle: "Containers",
      desc: "Environment parity across dev/stage/prod with fast iteration and predictable builds.",
      bullets: ["Images", "Best practices", "Parity"],
      examples: ["Slim images, caching, multi-stage builds", "Dev/prod parity and reproducible builds"],
    },
    kubernetes: {
      id: "kubernetes",
      title: "Kubernetes",
      subtitle: "Deploy • Scale",
      desc: "Scalable deployments with safe rollouts, health checks, and rollback discipline.",
      bullets: ["Deployments", "Services", "Helm"],
      examples: ["Safe rollouts, probes, HPA", "Config/secrets hygiene", "Cluster operations mindset"],
    },
    terraform: {
      id: "terraform",
      title: "Terraform",
      subtitle: "Infrastructure as Code",
      desc: "Repeatable, auditable provisioning with modules and state control.",
      bullets: ["Modules", "State", "Reusable infra"],
      examples: ["Reusable modules", "State strategy + drift awareness", "Infra changes through PRs"],
    },
    prometheus: {
      id: "prometheus",
      title: "Prometheus",
      subtitle: "Metrics + Alerting",
      desc: "Signals and alerting tuned to reduce noise and improve response.",
      bullets: ["Metrics", "Alerting", "SLIs/SLOs"],
      examples: ["Actionable alert rules", "SLO-minded dashboards", "Reduce alert fatigue"],
    },
    grafana: {
      id: "grafana",
      title: "Grafana",
      subtitle: "Dashboards",
      desc: "Dashboards teams actually use during incidents and reviews.",
      bullets: ["Dashboards", "Panels", "Ops visibility"],
      examples: ["Golden signals + drilldowns", "Incident-ready boards", "Runbook links"],
    },
    git: {
      id: "git",
      title: "Git + GitHub",
      subtitle: "Collaboration",
      desc: "PR-based workflows with reviews, versioning, and clean releases.",
      bullets: ["PRs", "Reviews", "Branching"],
      examples: ["Clean branching + reviews", "Release tagging + traceability"],
    },
    collaboration: {
      id: "collaboration",
      title: "Cross-team Collaboration",
      subtitle: "Dev • Ops • Product",
      desc: "Align infra decisions with business goals and delivery timelines.",
      bullets: ["Stakeholders", "Delivery", "Execution"],
      examples: ["Translate requirements into reliable delivery", "Communicate risk + tradeoffs clearly"],
    },
    tooling: {
      id: "tooling",
      title: "Tooling",
      subtitle: "Linux • Bash • APIs",
      desc: "Practical systems fundamentals + automation to remove repetition.",
      bullets: ["Linux", "Bash", "REST APIs"],
      examples: ["Automate repetitive ops tasks", "Improve day-2 operations"],
    },
    pm: {
      id: "pm",
      title: "Project Coordination",
      subtitle: "Monday.com • Trello",
      desc: "Strong planning and communication for shipping consistently.",
      bullets: ["Planning", "Timelines", "Stakeholders"],
      examples: ["Clear milestones + ownership", "Delivery rhythm + status clarity"],
    },
  };

  const experiences = [
    {
      id: "exp-fullscale",
      type: "experience",
      title: "DevOps Engineer",
      company: "FullScale.ie",
      location: "Dublin, Ireland",
      period: "Jun 2023 – Present",
      meta: "AWS • Jenkins • Docker • Kubernetes • Terraform • Prometheus/Grafana",
      responsibilities: [
        "Built and maintained CI/CD pipelines (Jenkins) for automated build, test and deployments.",
        "Containerised services with Docker and managed Kubernetes deployments for scalable delivery.",
        "Implemented Infrastructure as Code using Terraform (repeatable provisioning, auditability).",
        "Operationalised monitoring with Prometheus + Grafana (dashboards + actionable alerts).",
        "Managed AWS infra (EC2, S3, IAM, VPC) with security-first practices.",
        "Partnered with dev + product teams to reduce friction and ship reliably.",
      ],
      relatedSkillIds: ["aws", "jenkins", "docker", "kubernetes", "terraform", "prometheus", "grafana", "git", "collaboration"],
      details: "Reliable deployments + scalable operations for a cloud marketplace.",
    },
    {
      id: "exp-chillcart",
      type: "experience",
      title: "Project Co-Ordinator",
      company: "Chillcart Ltd.",
      location: "Dublin, Ireland",
      period: "Jun 2018 – Jun 2023",
      meta: "Delivery • Coordination",
      responsibilities: [
        "Coordinated daily project delivery across partners and internal teams.",
        "Owned planning, scheduling, and risk tracking for feature releases.",
        "Managed delivery operations with Monday.com, Trello and Google Workspace.",
      ],
      relatedSkillIds: ["pm", "collaboration"],
      details: "Kept delivery predictable across platform lifecycle.",
    },
    {
      id: "exp-lyca-ire",
      type: "experience",
      title: "Product & Business Development Manager",
      company: "LycaTel (Ireland) Ltd.",
      location: "Dublin, Ireland",
      period: "May 2014 – Jun 2018",
      meta: "Product • Growth",
      responsibilities: [
        "Launched and established presence in the Irish market.",
        "Closed enterprise deals and shaped offers for profitability + growth.",
        "Supported field testing and resolution of live issues with operators.",
      ],
      relatedSkillIds: ["collaboration"],
      details: "Connected business goals with execution under real constraints.",
    },
    {
      id: "exp-lyca-uk",
      type: "experience",
      title: "Business Development Manager",
      company: "LycaTel Distribution UK Ltd.",
      location: "London, UK",
      period: "May 2012 – May 2014",
      meta: "Sales • Strategy",
      responsibilities: ["Expanded product reach and revenue across territories.", "Implemented sales & marketing strategies and improved pipeline tracking."],
      relatedSkillIds: ["collaboration"],
      details: "Partnership growth with strong execution.",
    },
  ];

  const education = [
    {
      id: "edu-mba",
      type: "education",
      title: "MBA in Marketing",
      school: "University of Wales Trinity Saint David",
      location: "London, UK",
      period: "2010 – 2011",
      details: "Master of Business Administration in Marketing.",
      relatedSkillIds: ["collaboration", "pm"],
    },
    {
      id: "edu-bsc",
      type: "education",
      title: "B.Sc (Maths, Physics, Chemistry)",
      school: "Gowtham Degree College (A.N. University)",
      location: "Vijayawada, India",
      period: "2004–2005, 2007–2009",
      details: "Analytical and problem-solving foundation.",
      relatedSkillIds: ["tooling"],
    },
    {
      id: "edu-ded",
      type: "education",
      title: "Diploma in Education (D.Ed)",
      school: "D.I.E.T, Krishna District",
      location: "India",
      period: "2005 – 2007",
      details: "Structured learning + communication.",
      relatedSkillIds: ["collaboration"],
    },
  ];

  const principles = ["Automate the boring parts.", "Prefer repeatability over heroics.", "Observability is a feature.", "Ship small changes, often."];

  const baseCards = [
    ...experiences.map((e) => ({
      id: e.id,
      baseId: e.id,
      type: "experience",
      title: e.title,
      company: e.company,
      logoText: initials(e.company),
      meta: e.meta,
      palette: pickPalette(e.company),
    })),
    ...Object.values(skills).map((s) => ({
      id: `skill-${s.id}`,
      baseId: `skill-${s.id}`,
      type: "skill",
      title: s.title,
      company: s.subtitle,
      logoText: initials(s.title),
      meta: s.desc,
      palette: pickPalette(s.title),
      skillId: s.id,
    })),
    ...education.map((e) => ({
      id: e.id,
      baseId: e.id,
      type: "education",
      title: e.title,
      company: e.school,
      logoText: initials(e.school),
      meta: e.period,
      palette: pickPalette(e.school),
    })),
  ];

  // lighter on mobile: fewer loops
  const loops = isMobile ? 2 : 3;
  const expanded = [];
  for (let i = 0; i < loops; i++) {
    for (let j = 0; j < baseCards.length; j++) expanded.push({ ...baseCards[j], id: `${baseCards[j].id}-${i}` });
  }

  const socials = [
    {
      id: "social-linkedin",
      baseId: "social-linkedin",
      type: "link",
      title: "LinkedIn",
      company: "Connect",
      logoText: "in",
      meta: "Open my LinkedIn profile",
      palette: pickPalette("LinkedIn"),
      url: "https://www.linkedin.com/in/sgalla/",
    },
    {
      id: "social-github",
      baseId: "social-github",
      type: "link",
      title: "GitHub",
      company: "Projects",
      logoText: "GH",
      meta: "Open my GitHub repositories",
      palette: pickPalette("GitHub"),
      url: "https://github.com/srinugalla",
    },
    {
      id: "social-email",
      baseId: "social-email",
      type: "link",
      title: "Email",
      company: "srinu.galla@gmail.com",
      logoText: "@",
      meta: "Send me an email",
      palette: pickPalette("Email"),
      url: "mailto:srinu.galla@gmail.com",
    },
  ];

  // reduce globe count more on mobile for perf + overlap
  const maxGlobeItems = isMobile ? 34 : 44;
  const globeItems = [...expanded.slice(0, maxGlobeItems), ...socials];

  const browseSource = [...baseCards, ...socials];

  return { globeItems, browseSource, experiences, education, skills, principles };
}
