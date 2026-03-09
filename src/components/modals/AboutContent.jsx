import React from "react";
import {
  Activity,
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
  Workflow,
  Server,
  Database,
  Layers3,
  ArrowRight
} from "lucide-react";
import { cn } from "../../utils/cn";

export default function AboutContent({ theme, onOpenContact }) {

  const card =
    theme === "light"
      ? "border-black/12 bg-white/90 hover:shadow-md"
      : "border-white/12 bg-white/[0.03] hover:bg-white/[0.06]";

  const section =
    theme === "light"
      ? "border-black/10 bg-black/[0.03]"
      : "border-white/10 bg-white/[0.03]";

  const label = theme === "light" ? "text-black/55" : "text-white/55";
  const text = theme === "light" ? "text-black/92" : "text-white/92";
  const subtle = theme === "light" ? "text-black/70" : "text-white/70";

  const Proof = ({ icon: Icon, title, desc }) => (
    <div className={cn("rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1", card)}>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "grid h-9 w-9 place-items-center rounded-xl border",
            theme === "light"
              ? "border-black/12 bg-black/[0.06]"
              : "border-white/12 bg-black/35"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className={cn("text-sm font-semibold", text)}>
          {title}
        </div>
      </div>

      <div className={cn("mt-2 text-xs leading-5", subtle)}>
        {desc}
      </div>
    </div>
  );

  const StackItem = ({ name }) => (
    <div
      className={cn(
        "rounded-xl border px-3 py-2 text-xs font-medium transition hover:-translate-y-0.5",
        theme === "light"
          ? "border-black/12 bg-white"
          : "border-white/12 bg-white/[0.05]"
      )}
    >
      {name}
    </div>
  );

  const PipelineStep = ({ labelText }) => (
    <div className={cn("rounded-xl border px-4 py-3 text-xs font-semibold", card)}>
      {labelText}
    </div>
  );

  return (
    <div className="grid gap-4">

      {/* INTRO */}
      <div className={cn("rounded-3xl border p-6", section)}>
        <div className={cn("text-xs font-semibold tracking-widest", label)}>
          DEVOPS ENGINEER
        </div>

        <div className={cn("mt-3 text-[15px] leading-6", subtle)}>
          I design and operate delivery platforms that help teams ship software
          faster and more safely. My focus is building reliable infrastructure,
          CI/CD automation, Kubernetes platforms and observability systems so
          engineering teams can release confidently while maintaining strong
          operational stability.
        </div>

        <div className="mt-5 flex flex-wrap gap-2">

          <a
            href="https://www.linkedin.com/in/sgalla/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
              theme === "light"
                ? "bg-black text-white"
                : "bg-white text-black"
            )}
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </a>

          <a
            href="https://github.com/srinugalla"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold",
              theme === "light"
                ? "border-black/12 bg-white"
                : "border-white/12 bg-black/30"
            )}
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>

          <button
            onClick={onOpenContact}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold",
              theme === "light"
                ? "border-black/12 bg-white"
                : "border-white/12 bg-black/30"
            )}
          >
            <Mail className="h-4 w-4" />
            Contact
          </button>

        </div>
      </div>

      {/* CAPABILITIES */}
      <div className={cn("rounded-3xl border p-6", section)}>
        <div className={cn("text-xs font-semibold tracking-widest", label)}>
          CORE CAPABILITIES
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">

          <Proof
            icon={Cloud}
            title="Multi-Cloud Infrastructure"
            desc="Hands-on experience with AWS, Azure and Google Cloud Platform."
          />

          <Proof
            icon={Server}
            title="AWS Architecture"
            desc="EKS, ECS, EC2, S3, VPC networking, IAM and security-focused design."
          />

          <Proof
            icon={Workflow}
            title="CI/CD Automation"
            desc="GitHub Actions and Jenkins pipelines for automated delivery."
          />

          <Proof
            icon={Boxes}
            title="Infrastructure as Code"
            desc="Terraform modules and Ansible automation."
          />

          <Proof
            icon={Layers3}
            title="GitOps Delivery"
            desc="Argo CD GitOps deployment workflows."
          />

          <Proof
            icon={Database}
            title="Containers & Kubernetes"
            desc="Docker, Kubernetes clusters and Helm deployments."
          />

          <Proof
            icon={Activity}
            title="Observability"
            desc="Prometheus, Grafana and CloudWatch monitoring."
          />

          <Proof
            icon={ShieldCheck}
            title="Security Tooling"
            desc="Trivy container scanning and SonarQube code analysis."
          />

        </div>
      </div>

      {/* DEVOPS PIPELINE */}
      <div className={cn("rounded-3xl border p-6", section)}>
        <div className={cn("text-xs font-semibold tracking-widest", label)}>
          DELIVERY PIPELINE
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">

          <PipelineStep labelText="Code (GitHub)" />
          <ArrowRight size={16} />

          <PipelineStep labelText="CI Build (GitHub Actions / Jenkins)" />
          <ArrowRight size={16} />

          <PipelineStep labelText="Security Scan (Trivy / SonarQube)" />
          <ArrowRight size={16} />

          <PipelineStep labelText="Container Build (Docker)" />
          <ArrowRight size={16} />

          <PipelineStep labelText="Infrastructure (Terraform + Ansible)" />
          <ArrowRight size={16} />

          <PipelineStep labelText="GitOps Deploy (Argo CD)" />
          <ArrowRight size={16} />

          <PipelineStep labelText="Kubernetes (EKS / ECS)" />
          <ArrowRight size={16} />

          <PipelineStep labelText="Monitoring (Prometheus / Grafana)" />
          <ArrowRight size={16} />

          <PipelineStep labelText="Observability (Datadog)" />

        </div>
      </div>

      {/* TECH STACK */}
      <div className={cn("rounded-3xl border p-6", section)}>
        <div className={cn("text-xs font-semibold tracking-widest", label)}>
          TECH STACK
        </div>

        <div className="mt-4 flex flex-wrap gap-2">

          <StackItem name="AWS" />
          <StackItem name="Azure" />
          <StackItem name="GCP" />

          <StackItem name="Kubernetes" />
          <StackItem name="Docker" />
          <StackItem name="Helm" />

          <StackItem name="Terraform" />
          <StackItem name="Ansible" />

          <StackItem name="Argo CD" />
          <StackItem name="GitHub Actions" />
          <StackItem name="Jenkins" />

          <StackItem name="Prometheus" />
          <StackItem name="Grafana" />
          <StackItem name="Datadog" />

          <StackItem name="Trivy" />
          <StackItem name="SonarQube" />

          <StackItem name="EKS" />
          <StackItem name="ECS" />
          <StackItem name="EC2" />
          <StackItem name="S3" />
          <StackItem name="VPC" />

        </div>
      </div>

      {/* FIRST 30 DAYS */}
      <div className={cn("rounded-3xl border p-6", section)}>

        <div className={cn("text-xs font-semibold tracking-widest", label)}>
          FIRST 30 DAYS
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">

          <div className={cn("rounded-2xl border p-4", card)}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <div className={cn("text-sm font-semibold", text)}>
                Delivery baseline
              </div>
            </div>
            <div className={cn("mt-2 text-xs", subtle)}>
              Audit pipelines, infrastructure and secrets management.
            </div>
          </div>

          <div className={cn("rounded-2xl border p-4", card)}>
            <div className="flex items-center gap-2">
              <Timer size={16} />
              <div className={cn("text-sm font-semibold", text)}>
                Observability clarity
              </div>
            </div>
            <div className={cn("mt-2 text-xs", subtle)}>
              Improve monitoring and alerting for faster incident response.
            </div>
          </div>

          <div className={cn("rounded-2xl border p-4", card)}>
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <div className={cn("text-sm font-semibold", text)}>
                Reduce friction
              </div>
            </div>
            <div className={cn("mt-2 text-xs", subtle)}>
              Automate repetitive operational tasks and improve delivery flow.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}