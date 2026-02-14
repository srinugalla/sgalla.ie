import React from "react";
import { LayoutGrid, List as ListIcon, ArrowUpRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { pickPalette, rgba } from "../../utils/colors";
import { initials } from "../../utils/format";
import Modal from "./Modal";

export default function BrowseView({ open, onClose, mode, setMode, cards, onPick, theme }) {
  const pillBase = "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition";
  const active = theme === "light" ? "border-black/10 bg-black text-white" : "border-white/15 bg-white text-black";
  const idle =
    theme === "light"
      ? "border-black/10 bg-black/[0.03] text-black/70 hover:bg-black/[0.06]"
      : "border-white/12 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]";
  const wrap = "mt-4 max-h-[64svh] overflow-y-auto pr-1";

  const fx =
    theme === "light"
      ? "hover:shadow-[0_18px_70px_rgba(0,0,0,0.10)] hover:-translate-y-[1px] hover:brightness-[1.02]"
      : "hover:shadow-[0_22px_85px_rgba(0,0,0,0.55)] hover:-translate-y-[1px] hover:brightness-[1.05]";

  return (
    <Modal open={open} onClose={onClose} title={mode === "grid" ? "Browse (Grid)" : "Browse (List)"} theme={theme}>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setMode("grid")} className={cn(pillBase, mode === "grid" ? active : idle)}>
          <LayoutGrid className="h-4 w-4" /> Grid
        </button>
        <button onClick={() => setMode("list")} className={cn(pillBase, mode === "list" ? active : idle)}>
          <ListIcon className="h-4 w-4" /> List
        </button>
      </div>

      {mode === "grid" ? (
        <div className={wrap}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cards.map((c) => {
              const pal = c.palette ?? pickPalette(c.company || c.title || c.id);
              const a = theme === "dark" ? rgba(pal.a, 0.20) : rgba(pal.a, 0.18);
              const b = theme === "dark" ? rgba(pal.b, 0.16) : rgba(pal.b, 0.14);

              return (
                <button
                  key={c.id}
                  onClick={() => onPick(c)}
                  className={cn(
                    "browse-card group relative overflow-hidden rounded-2xl border p-3 text-left transition",
                    fx,
                    theme === "light" ? "border-black/12 bg-black/[0.03] hover:bg-black/[0.06]" : "border-white/12 bg-white/[0.03] hover:bg-white/[0.06]"
                  )}
                  style={{
                    background: `radial-gradient(circle at 24% 20%, ${a}, rgba(255,255,255,0.10) 30%, rgba(0,0,0,0) 62%),
                                 linear-gradient(135deg, ${a}, ${b} 55%, rgba(0,0,0,0))`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-xl border text-xs font-extrabold",
                          theme === "light" ? "border-black/12 bg-white/85 text-black/80" : "border-white/12 bg-black/30 text-white/85"
                        )}
                      >
                        {c.logoText ? c.logoText : initials(c.company || c.title)}
                      </div>
                      <div className="min-w-0">
                        <div className={cn("truncate text-xs font-semibold", theme === "light" ? "text-black/85" : "text-white/85")}>
                          {c.company || c.title}
                        </div>
                        <div className={cn("mt-0.5 line-clamp-1 text-[12px]", theme === "light" ? "text-black/60" : "text-white/60")}>{c.title}</div>
                      </div>
                    </div>
                    <ArrowUpRight className={cn("h-4 w-4 shrink-0 transition", theme === "light" ? "text-black/55 group-hover:text-black/80" : "text-white/55 group-hover:text-white/80")} />
                  </div>

                  {c.meta && <div className={cn("mt-2 line-clamp-2 text-[12px] leading-4", theme === "light" ? "text-black/60" : "text-white/60")}>{c.meta}</div>}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={wrap}>
          <div className="grid gap-2">
            {cards.map((c) => {
              const pal = c.palette ?? pickPalette(c.company || c.title || c.id);
              const a = theme === "dark" ? rgba(pal.a, 0.16) : rgba(pal.a, 0.14);
              const b = theme === "dark" ? rgba(pal.b, 0.14) : rgba(pal.b, 0.12);

              return (
                <button
                  key={c.id}
                  onClick={() => onPick(c)}
                  className={cn(
                    "browse-card group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                    fx,
                    theme === "light" ? "border-black/12 bg-black/[0.03] hover:bg-black/[0.06]" : "border-white/12 bg-white/[0.03] hover:bg-white/[0.06]"
                  )}
                  style={{
                    background: `radial-gradient(circle at 22% 20%, ${a}, rgba(255,255,255,0.08) 32%, rgba(0,0,0,0) 62%),
                                 linear-gradient(135deg, ${a}, ${b} 55%, rgba(0,0,0,0))`,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-xl border text-xs font-extrabold",
                        theme === "light" ? "border-black/12 bg-white/85 text-black/80" : "border-white/12 bg-black/30 text-white/85"
                      )}
                    >
                      {c.logoText ? c.logoText : initials(c.company || c.title)}
                    </div>
                    <div className="min-w-0">
                      <div className={cn("truncate text-sm font-semibold", theme === "light" ? "text-black/90" : "text-white/90")}>{c.title}</div>
                      <div className={cn("truncate text-xs", theme === "light" ? "text-black/60" : "text-white/55")}>{c.company || c.meta || ""}</div>
                    </div>
                  </div>
                  <ArrowUpRight className={cn("h-4 w-4 transition", theme === "light" ? "text-black/55 group-hover:text-black/80" : "text-white/55 group-hover:text-white/80")} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
