import React from "react";
import {
  Activity,
  BadgeCheck,
  Boxes,
  CheckCircle2,
  Cloud,
  GitBranch,
  Github,
  Linkedin,
  Mail,
  ShieldCheck,
  Sparkles,
  Timer,
  Wrench,
} from "lucide-react";
import { cn } from "../../utils/cn";

export default function AboutContent({ theme, onOpenContact }) {
  const card = theme === "light" ? "border-black/12 bg-white/88" : "border-white/12 bg-white/[0.03]";
  const section = theme === "light" ? "border-black/10 bg-black/[0.03]" : "border-white/10 bg-white/[0.03]";
  const label = theme === "light" ? "text-black/55" : "text-white/55";
  const text = theme === "light" ? "text-black/92" : "text-white/92";
  const subtle = theme === "light" ? "text-black/70" : "text-white/72";

  const Proof = ({ icon: Icon, title, desc }) => (
    <div className={cn("rounded-2xl border p-4", card)}>
      <div className="flex items-center gap-2">
        <div className={cn("grid h-9 w-9 place-items-center rounded-xl border", theme === "light" ? "border-black/12 bg-black/[0.06] text-black/90" : "border-white/12 bg-black/35 text-white/90")}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={cn("text-sm font-semibold", text)}>{title}</div>
      </div>
      <div className={cn("mt-2 text-xs leading-5", subtle)}>{desc}</div>
    </div>
  );

  return (
    <div className="grid gap-4">
      <div className={cn("rounded-3xl border p-5", section)}>
        <div className={cn("text-xs font-semibold tracking-widest", label)}>HIRE-READY DEVOPS</div>
        <div className={cn("mt-3 text-[15px] leading-6", subtle)}>
          I help teams ship faster <span className={cn("font-semibold", text)}>without breaking production</span>. I build the delivery backbone — CI/CD, Kubernetes, IaC, and monitoring — so releases become predictable, incident response becomes calm, and operations becomes scalable.
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className={cn("rounded-2xl border p-4", card)}>
            <div className={cn("text-xs font-semibold", label)}>YOU GET</div>
            <div className={cn("mt-2 text-sm font-semibold", text)}>Release confidence</div>
            <div className={cn("mt-1 text-xs", subtle)}>Automated pipelines + safe deployment habits + rollback discipline.</div>
          </div>
          <div className={cn("rounded-2xl border p-4", card)}>
            <div className={cn("text-xs font-semibold", label)}>YOU GET</div>
            <div className={cn("mt-2 text-sm font-semibold", text)}>Operational clarity</div>
            <div className={cn("mt-1 text-xs", subtle)}>Dashboards and alerts that are actionable (not noisy).</div>
          </div>
          <div className={cn("rounded-2xl border p-4", card)}>
            <div className={cn("text-xs font-semibold", label)}>YOU GET</div>
            <div className={cn("mt-2 text-sm font-semibold", text)}>Secure defaults</div>
            <div className={cn("mt-1 text-xs", subtle)}>Least privilege, sensible guardrails, and change safety.</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="https://www.linkedin.com/in/sgalla/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold", theme === "light" ? "bg-black text-white" : "bg-white text-black")}
          >
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
          <a
            href="https://github.com/srinugalla"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold",
              theme === "light" ? "border-black/12 bg-white text-black" : "border-white/15 bg-black/30 text-white"
            )}
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
          <button
            onClick={onOpenContact}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold border",
              theme === "light" ? "border-black/12 bg-white text-black" : "border-white/15 bg-black/30 text-white"
            )}
          >
            <Mail className="h-4 w-4" /> Contact
          </button>
        </div>
      </div>

      <div className={cn("rounded-3xl border p-5", section)}>
        <div className={cn("text-xs font-semibold tracking-widest", label)}>WHAT I DO WELL</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Proof icon={Cloud} title="AWS foundations" desc="IAM/VPC/networking, security-first defaults, cost awareness and clean ownership." />
          <Proof icon={GitBranch} title="CI/CD delivery" desc="Jenkins pipelines teams trust — predictable, debuggable, rollback-friendly." />
          <Proof icon={Boxes} title="Kubernetes & containers" desc="Safe rollouts, scaling, consistency across environments, operational hygiene." />
          <Proof icon={Activity} title="Observability" desc="Prometheus + Grafana for signals that reduce noise and speed response." />
          <Proof icon={ShieldCheck} title="Security & reliability mindset" desc="Guardrails, secrets hygiene, safe change management." />
          <Proof icon={Wrench} title="Automation & tooling" desc="Remove toil. Make ops boring. Improve day-2 operations." />
        </div>
      </div>

      <div className={cn("rounded-3xl border p-5", section)}>
        <div className={cn("text-xs font-semibold tracking-widest", label)}>FIRST 30 DAYS (REALISTIC)</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className={cn("rounded-2xl border p-4", card)}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <div className={cn("text-sm font-semibold", text)}>Delivery baseline</div>
            </div>
            <div className={cn("mt-2 text-xs", subtle)}>Clear pipeline stages, environments, versioning and rollback playbooks.</div>
          </div>
          <div className={cn("rounded-2xl border p-4", card)}>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <div className={cn("text-sm font-semibold", text)}>Incident clarity</div>
            </div>
            <div className={cn("mt-2 text-xs", subtle)}>Dashboards + alerts tuned for action, faster triage, fewer false alarms.</div>
          </div>
          <div className={cn("rounded-2xl border p-4", card)}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <div className={cn("text-sm font-semibold", text)}>Less friction</div>
            </div>
            <div className={cn("mt-2 text-xs", subtle)}>Automation and guardrails that improve flow without slowing teams down.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
