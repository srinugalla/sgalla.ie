import React, { useEffect, useMemo, useState } from "react";
import { ExternalLink, Github, Linkedin, Mail, Phone } from "lucide-react";

import { cn } from "./utils/cn";
import { buildPortfolioData } from "./data/portfolio";
import { useBinaryReveal } from "./hooks/useBinaryReveal";
import { useIsMobile } from "./hooks/useIsMobile";

import Starfield from "./components/effects/Starfield";
import Globe from "./components/globe/Globe";
import Hud from "./components/ui/Hud";
import BrowseView from "./components/ui/BrowseView";
import Modal from "./components/ui/Modal";
import AboutContent from "./components/modals/AboutContent";
import DetailsModal from "./components/modals/DetailsModal";

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
    return prefersLight ? "light" : "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const isMobile = useIsMobile();

  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseMode, setBrowseMode] = useState("grid");
  const [contactOpen, setContactOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const [selected, setSelected] = useState(null);
  const [modalOrigin, setModalOrigin] = useState(null);

  const [nameAnimKey, setNameAnimKey] = useState(1);
  const nameText = useBinaryReveal("Srinivasarao Galla", nameAnimKey, { durationMs: 1250, settleMs: 160 });

  const [hasUsedBrowse, setHasUsedBrowse] = useState(() => localStorage.getItem("usedBrowse") === "1");
  const showBrowseHint = !hasUsedBrowse;

  const openBrowse = () => {
    setBrowseOpen(true);
    if (!hasUsedBrowse) {
      setHasUsedBrowse(true);
      localStorage.setItem("usedBrowse", "1");
    }
  };

  const data = useMemo(() => buildPortfolioData({ isMobile }), [isMobile]);

  const browseCards = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const c of data.browseSource) {
      const key = c.baseId || c.id;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...c, id: key });
    }
    return out;
  }, [data.browseSource]);

  const rootBg = theme === "light" ? "bg-[#f5f7fb] text-black" : "bg-black text-white";

  const resetHome = () => {
    setSelected(null);
    setContactOpen(false);
    setBrowseOpen(false);
    setAboutOpen(false);
    setModalOrigin(null);
    setNameAnimKey((k) => k + 1);
  };

  const viewCv = () => {
    // put your pdf at: public/cv.pdf
    window.open("/cv.pdf", "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("min-h-[100svh]", rootBg)}>
      <Starfield theme={theme} density={isMobile ? 220 : 620} isMobile={isMobile} />

      <Hud
        theme={theme}
        isMobile={isMobile}
        nameText={nameText}
        showBrowseHint={showBrowseHint}
        onHome={resetHome}
        onAbout={() => setAboutOpen(true)}
        onViewCv={viewCv}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        onBrowse={openBrowse}
        onContact={() => setContactOpen(true)}
      />

      {!browseOpen && (
        <Globe
          items={data.globeItems}
          theme={theme}
          isMobile={isMobile}
          onSelect={(it, pt) => {
            setModalOrigin(pt || null);
            setSelected(it);
          }}
        />
      )}

      <BrowseView
        open={browseOpen}
        onClose={() => setBrowseOpen(false)}
        mode={browseMode}
        setMode={setBrowseMode}
        cards={browseCards}
        theme={theme}
        onPick={(c) => {
          setBrowseOpen(false);
          setSelected(c);
          setModalOrigin({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.35 });
        }}
      />

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About" theme={theme} origin={{ x: window.innerWidth * 0.25, y: 120 }}>
        <AboutContent
          theme={theme}
          onOpenContact={() => {
            setAboutOpen(false);
            setContactOpen(true);
          }}
        />
      </Modal>

      <Modal open={contactOpen} onClose={() => setContactOpen(false)} title="Contact" theme={theme} origin={{ x: window.innerWidth * 0.82, y: 120 }}>
        <div className="grid gap-3">
          <div className={cn("rounded-2xl border px-4 py-3 text-sm", theme === "light" ? "border-black/10 bg-black/[0.03] text-black/75" : "border-white/10 bg-white/[0.03] text-white/75")}>
            <div className={cn("text-xs font-semibold tracking-widest", theme === "light" ? "text-black/55" : "text-white/55")}>FASTEST WAY TO REACH ME</div>
            <div className="mt-2">Email is best — I reply quickly and can share availability right away.</div>
          </div>

          {[
            { href: "mailto:srinu.galla@gmail.com", left: (<><Mail className="h-4 w-4" /> srinu.galla@gmail.com</>), ext: false },
            { href: "https://github.com/srinugalla", left: (<><Github className="h-4 w-4" /> GitHub</>), ext: true },
            { href: "https://www.linkedin.com/in/sgalla/", left: (<><Linkedin className="h-4 w-4" /> LinkedIn</>), ext: true },
            { href: "tel:+353866005678", left: (<><Phone className="h-4 w-4" /> +353 86 600 5678</>), ext: false },
          ].map((row, i) => (
            <a
              key={i}
              href={row.href}
              target={row.ext ? "_blank" : undefined}
              rel={row.ext ? "noopener noreferrer" : undefined}
              className={cn(
                "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
                theme === "light" ? "border-black/10 bg-black/[0.03] text-black/85 hover:bg-black/[0.06]" : "border-white/12 bg-white/[0.03] text-white/85 hover:bg-white/[0.06]"
              )}
            >
              <span className="flex items-center gap-2">{row.left}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          ))}
        </div>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.company ? `${selected.company}` : selected?.title || "Details"} theme={theme} origin={modalOrigin || undefined}>
        <DetailsModal selected={selected} data={data} theme={theme} />
      </Modal>

      <div className={cn("pointer-events-none fixed bottom-3 right-4 z-40 text-[11px]", theme === "light" ? "text-black/40" : "text-white/45")}>
        © {new Date().getFullYear()} Srinivasarao Galla
      </div>

      <div className="fixed inset-x-0 bottom-6 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4">
          <button
            onClick={openBrowse}
            className={cn(
              "hint-glow-soft rounded-full border backdrop-blur transition relative",
              showBrowseHint ? "hint-sparkle-5-soft" : "",
              theme === "light" ? "border-black/10 bg-white/80 text-black/65 hover:bg-white" : "border-white/12 bg-black/35 text-white/75 hover:bg-black/45",
              isMobile ? "px-3 py-1.5 text-[10px] font-semibold tracking-wide" : "px-4 py-2 text-[11px] font-semibold tracking-widest"
            )}
          >
            {isMobile ? "DRAG • TAP • OPEN BROWSE" : "TRACKPAD SWIPE • DRAG • CLICK TO OPEN BROWSE"}
          </button>
        </div>
      </div>
    </div>
  );
}
