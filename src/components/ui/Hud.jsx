import React from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Mail, Moon, Sparkles, Sun, FileText } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Hud({
  theme,
  onToggleTheme,
  onBrowse,
  onContact,
  onAbout,
  onHome,
  onViewCv,
  nameText,
  showBrowseHint,
  isMobile,
}) {
  const btnBase = "rounded-full border transition relative";
  const btnDark = "border-white/12 bg-white/[0.03] text-white/85 hover:bg-white/[0.06]";
  const btnLight = "border-black/10 bg-black/[0.03] text-black/75 hover:bg-black/[0.06]";
  const btn = theme === "light" ? btnLight : btnDark;

  const ico = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className="fixed inset-x-0 top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button onClick={onHome} className="flex items-center gap-3 text-left" title="Home">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl border text-xs font-extrabold tracking-wide shrink-0",
                theme === "light" ? "border-black/10 bg-black/[0.04] text-black/80" : "border-white/12 bg-white/[0.06] text-white/90"
              )}
            >
              SG
            </div>
            <div className="min-w-0">
              <div className={cn("truncate text-sm font-semibold", theme === "light" ? "text-black" : "text-white")}>{nameText}</div>
              <div className={cn("truncate text-xs", theme === "light" ? "text-black/55" : "text-white/55")}>DevOps Engineer • Dublin, Ireland</div>
            </div>
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button onClick={onAbout} className={cn(btnBase, btn, "px-4 py-2 text-xs font-semibold")}>
              About
            </button>

            <button onClick={onViewCv} className={cn(btnBase, btn, "px-4 py-2 text-xs font-semibold")} title="View CV">
              <span className="inline-flex items-center gap-2">
                <FileText className={ico} />
                View CV
              </span>
            </button>

            <button onClick={onToggleTheme} className={cn(btnBase, btn, "px-4 py-2 text-xs font-semibold")}>
              <span className="inline-flex items-center gap-2">
                {theme === "dark" ? <Sun className={ico} /> : <Moon className={ico} />}
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </button>

            <motion.button
              onClick={onBrowse}
              className={cn(btnBase, btn, "px-4 py-2 text-xs font-semibold", showBrowseHint ? "hint-glow hint-sparkle-5" : "")}
              aria-label="Browse"
              title="Browse"
              animate={showBrowseHint ? { y: [0, -2, 0] } : { y: 0 }}
              transition={showBrowseHint ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles className={cn(ico, "browse-star")} />
                <LayoutGrid className={ico} /> Browse
              </span>
            </motion.button>

            <button onClick={onContact} className={cn(btnBase, btn, "px-4 py-2 text-xs font-semibold")}>
              <span className="inline-flex items-center gap-2">
                <Mail className={ico} />
                Contact
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
