import React from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Github,
  GitBranch,
  Linkedin,
  Mail,
  ServerCog,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { cn } from "../../utils/cn";

function resolvePopupData(sel, data) {
  if (!sel) return null;
  const keyId = sel.baseId || sel.id;

  if (sel.type === "experience") {
    const exp = data.experiences.find((e) => e.id === keyId || e.id === sel.id);
    const relatedSkills = (exp?.relatedSkillIds || []).map((id) => data.skills[id]).filter(Boolean);
    return { kind: "experience", exp, relatedSkills, principles: data.principles };
  }

  if (sel.type === "skill") {
    const sid = sel.skillId || String(keyId).replace(/^skill-/, "");
    const skill = data.skills[sid];
    const usedIn = data.experiences
      .filter((e) => (e.relatedSkillIds || []).includes(sid))
      .map((e) => ({ id: e.id, company: e.company, role: e.title, period: e.period, meta: e.meta }));
    return { kind: "skill", skill, usedIn, principles: data.principles };
  }

  if (sel.type === "education") {
    const edu = data.education.find((e) => e.id === keyId || e.id === sel.id);
    const relatedSkills = (edu?.relatedSkillIds || []).map((id) => data.skills[id]).filter(Boolean);
    return { kind: "education", edu, relatedSkills, principles: data.principles };
  }

  if (sel.type === "link") {
    return { kind: "link", title: sel.title, company: sel.company, url: sel.url, meta: sel.meta, principles: data.principles };
  }

  return null;
}

export default function DetailsModal({ selected, data, theme }) {
  const d = resolvePopupData(selected, data);
  if (!d) return null;

  const sectionBase = theme === "light" ? "border-black/10 bg-black/[0.03]" : "border-white/10 bg-white/[0.03]";
  const label = theme === "light" ? "text-black/55" : "text-white/55";
  const text = theme === "light" ? "text-black/90" : "text-white/90";
  const subtle = theme === "light" ? "text-black/65" : "text-white/70";

  const Section = ({ title, icon: Icon, children }) => (
    <div className={cn("rounded-2xl border p-4", sectionBase)}>
      <div className="flex items-center justify-between">
        <div className={cn("text-xs font-semibold tracking-widest", label)}>{title}</div>
        {Icon ? <Icon className={cn("h-4 w-4", theme === "light" ? "text-black/45" : "text-white/45")} /> : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );

  const Pill = ({ children }) => (
    <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", theme === "light" ? "border-black/10 bg-white/75 text-black/75" : "border-white/12 bg-black/30 text-white/75")}>
      {children}
    </span>
  );

  const SkillPills = ({ list }) => (
    <div className="flex flex-wrap gap-2">
      {list.map((s) => (
        <Pill key={s.id}>
          {s.title}
          {s.subtitle ? <span className={cn("ml-2", theme === "light" ? "text-black/50" : "text-white/50")}>• {s.subtitle}</span> : null}
        </Pill>
      ))}
    </div>
  );

  if (d.kind === "link") {
    const Icon = d.title === "GitHub" ? Github : d.title === "LinkedIn" ? Linkedin : Mail;
    const isHttp = String(d.url || "").startsWith("http");
    return (
      <div className="space-y-4">
        <Section title="CONNECT" icon={Zap}>
          <div className={cn("flex items-center gap-2 text-base font-semibold", text)}>
            <Icon className="h-5 w-5" /> {d.title}
          </div>
          {d.company && <div className={cn("mt-1 text-sm", subtle)}>{d.company}</div>}
          {d.meta && <div className={cn("mt-2 text-sm", subtle)}>{d.meta}</div>}
          <a
            href={d.url}
            target={isHttp ? "_blank" : undefined}
            rel={isHttp ? "noopener noreferrer" : undefined}
            className={cn("mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold", theme === "light" ? "bg-black text-white" : "bg-white text-black")}
          >
            Open <ArrowUpRight className="h-4 w-4" />
          </a>
        </Section>

        <Section title="WORKING STYLE" icon={BadgeCheck}>
          <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>{d.principles?.map((p, idx) => <li key={idx}>{p}</li>)}</ul>
        </Section>
      </div>
    );
  }

  if (d.kind === "experience") {
    const exp = d.exp;
    if (!exp) return null;

    return (
      <div className="space-y-4">
        <Section title="ROLE" icon={ServerCog}>
          <div className={cn("text-base font-semibold", text)}>{exp.title}</div>
          <div className={cn("mt-1 text-sm", subtle)}>
            {exp.company} • {exp.location}
          </div>
          <div className={cn("mt-1 text-xs", label)}>{exp.period}</div>

          {exp.meta ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {String(exp.meta)
                .split("•")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((t, i) => (
                  <Pill key={i}>{t}</Pill>
                ))}
            </div>
          ) : null}

          {exp.details && <div className={cn("mt-3 text-sm", subtle)}>{exp.details}</div>}
        </Section>

        <Section title="IMPACT / RESPONSIBILITIES" icon={CheckCircle2}>
          <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>{exp.responsibilities.map((r, idx) => <li key={idx}>{r}</li>)}</ul>
        </Section>

        {d.relatedSkills?.length ? (
          <Section title="SKILLS USED" icon={Wrench}>
            <SkillPills list={d.relatedSkills} />
          </Section>
        ) : null}

        <Section title="WORKING STYLE" icon={BadgeCheck}>
          <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>{d.principles?.map((p, idx) => <li key={idx}>{p}</li>)}</ul>
        </Section>
      </div>
    );
  }

  if (d.kind === "skill") {
    const s = d.skill;
    if (!s) return null;

    return (
      <div className="space-y-4">
        <Section title="SKILL" icon={Sparkles}>
          <div className={cn("text-base font-semibold", text)}>{s.title}</div>
          {s.subtitle && <div className={cn("mt-1 text-sm", subtle)}>{s.subtitle}</div>}
          {s.desc && <div className={cn("mt-3 text-sm", subtle)}>{s.desc}</div>}

          {Array.isArray(s.bullets) && s.bullets.length > 0 && (
            <div className="mt-3">
              <div className={cn("text-xs font-semibold tracking-widest", label)}>FOCUS AREAS</div>
              <ul className={cn("mt-2 list-disc space-y-1 pl-5 text-sm", subtle)}>{s.bullets.map((b, idx) => <li key={idx}>{b}</li>)}</ul>
            </div>
          )}

          {Array.isArray(s.examples) && s.examples.length > 0 && (
            <div className="mt-4">
              <div className={cn("text-xs font-semibold tracking-widest", label)}>TYPICAL OUTCOMES</div>
              <ul className={cn("mt-2 list-disc space-y-1 pl-5 text-sm", subtle)}>{s.examples.map((b, idx) => <li key={idx}>{b}</li>)}</ul>
            </div>
          )}
        </Section>

        {d.usedIn?.length ? (
          <Section title="WHERE IT SHOWS UP" icon={GitBranch}>
            <div className="grid gap-2">
              {d.usedIn.map((u) => (
                <div key={u.id} className={cn("flex items-center justify-between rounded-xl border px-3 py-2", theme === "light" ? "border-black/10 bg-white/75" : "border-white/10 bg-black/25")}>
                  <div className="min-w-0">
                    <div className={cn("text-sm font-semibold", text)}>{u.company}</div>
                    <div className={cn("text-xs", label)}>
                      {u.role} • {u.period}
                    </div>
                    {u.meta ? <div className={cn("mt-0.5 text-[11px] line-clamp-1", subtle)}>{u.meta}</div> : null}
                  </div>
                  <ArrowUpRight className={cn("h-4 w-4 shrink-0", theme === "light" ? "text-black/55" : "text-white/60")} />
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        <Section title="WORKING STYLE" icon={BadgeCheck}>
          <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>{d.principles?.map((p, idx) => <li key={idx}>{p}</li>)}</ul>
        </Section>
      </div>
    );
  }

  if (d.kind === "education") {
    const edu = d.edu;
    if (!edu) return null;

    return (
      <div className="space-y-4">
        <Section title="EDUCATION" icon={BadgeCheck}>
          <div className={cn("text-base font-semibold", text)}>{edu.title}</div>
          <div className={cn("mt-1 text-sm", subtle)}>
            {edu.school} • {edu.location}
          </div>
          <div className={cn("mt-1 text-xs", label)}>{edu.period}</div>
          {edu.details && <div className={cn("mt-3 text-sm", subtle)}>{edu.details}</div>}
        </Section>

        {d.relatedSkills?.length ? (
          <Section title="RELATED SKILLS" icon={Wrench}>
            <SkillPills list={d.relatedSkills} />
          </Section>
        ) : null}

        <Section title="WORKING STYLE" icon={BadgeCheck}>
          <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>{d.principles?.map((p, idx) => <li key={idx}>{p}</li>)}</ul>
        </Section>
      </div>
    );
  }

  return null;
}
