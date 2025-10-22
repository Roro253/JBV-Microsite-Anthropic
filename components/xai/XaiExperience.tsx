"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { Section } from "@/components/Section";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StatPill } from "@/components/StatPill";
import { KpiTile } from "@/components/KpiTile";
import { Stepper, type StepperItem } from "@/components/Stepper";
import { CallToAction } from "@/components/CallToAction";
import { NewsFeed, type NewsItem } from "@/components/NewsFeed";
import { SourceFootnotes } from "@/components/SourceFootnotes";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { MicrositeModeTransition } from "@/components/MicrositeModeTransition";
import { ReturnSimulator } from "@/components/ReturnSimulator";
import { useUIStore, type ExplorerInvestorMode } from "@/lib/store/ui";
import { type XaiData } from "@/lib/data";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import type { XFundModel } from "@/lib/xaiFundModel";
import XAIInvestmentDashboard from "@/components/XAIInvestmentDashboard";
import { ExplorerBackdrop } from "@/components/ExplorerBackdrop";
import { MicrositeIntelligenceView } from "@/components/intelligence/MicrositeIntelligenceView";
import type { IntelligenceFeedEntry } from "@/lib/intelligence";

const MODE_PRIMER_STORAGE_KEY = "jbv:mode-primer:v1";

interface XaiExperienceProps {
  data: XaiData;
  fundModel: XFundModel | null;
  intelligence?: IntelligenceFeedEntry | null;
}

export function XaiExperience({ data, fundModel, intelligence }: XaiExperienceProps) {
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);
  const prefersReducedMotion = useReducedMotion();
  const [showModePrimerDetails, setShowModePrimerDetails] = useState(false);
  const [modePrimerHydrated, setModePrimerHydrated] = useState(false);

  useEffect(() => {
    if (!mode) setMode("investor");
  }, [mode, setMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seenPrimer = window.localStorage.getItem(MODE_PRIMER_STORAGE_KEY);
    if (!seenPrimer) {
      setShowModePrimerDetails(true);
    }
    setModePrimerHydrated(true);
  }, []);

  const handleDismissModePrimer = () => {
    setShowModePrimerDetails(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MODE_PRIMER_STORAGE_KEY, "seen");
    }
  };

  const handleRevealModePrimer = () => {
    setShowModePrimerDetails(true);
  };

  const commentary: NewsItem[] = useMemo(
    () => [
      {
        title: "Grok 4 launches with real-time tool use",
        publisher: "xAI",
        date: "Jul 9, 2025",
        whyItMatters:
          "Newest Grok model adds native tool orchestration and real-time search, underscoring xAI's differentiation in live intelligence.",
        url: "https://x.ai/news/grok-4"
      },
      {
        title: "Inside Colossus: xAI's rapid-build supercomputer",
        publisher: "xAI",
        date: "Jun 2025",
        whyItMatters:
          "Colossus' 150K+ GPUs and 122-day build cycle highlight the compute velocity xAI is chasing as it scales Grok training.",
        url: "https://x.ai/colossus"
      },
      {
        title: "xAI seeks up to $20B to finance Colossus 2",
        publisher: "Reuters",
        date: "Oct 7, 2025",
        whyItMatters:
          "Reported deal mix (equity + debt) signals continued capital intensity—and Nvidia's potential $2B commitment.",
        url: "https://www.reuters.com/business/musks-xai-nears-20-billion-capital-raise-tied-nvidia-chips-bloomberg-news-2025-10-07/"
      },
      {
        title: "Global coverage echoes $20B target",
        publisher: "El País",
        date: "Oct 8, 2025",
        whyItMatters:
          "International reporting frames a potential ~$200B valuation and additional capital partners for xAI's raise.",
        url: "https://elpais.com/economia/2025-10-08/elon-musk-responde-a-openai-su-start-up-xai-captara-20000-millones-de-dolares-con-el-respaldo-de-nvidia.html"
      },
      {
        title: "xAI eyes world-model demos by 2026",
        publisher: "Financial Times",
        date: "Aug 2025",
        whyItMatters:
          "The roadmap toward embodied experiences (including an AI-generated game) indicates ambitions beyond chat assistants.",
        url: "https://www.ft.com/content/ac566346-53dd-4490-8d4c-5269906c64ee"
      },
      {
        title: "Grok usage estimates cross 35M MAUs",
        publisher: "Exploding Topics",
        date: "Sep 30, 2025",
        whyItMatters:
          "Third-party telemetry suggests meaningful user adoption inside X's subscriber base—though official disclosures remain limited.",
        url: "https://explodingtopics.com/blog/grok-users"
      }
    ],
    []
  );

  const intelligenceSummary =
    intelligence?.summary ??
    "A real-time intelligence stream blending narrative moments, KPI sparks, and predictive signals.";
  const intelligenceTagline =
    intelligence?.aiNarrative ??
    "AI narration synthesizes the company’s latest momentum, investor engagement, and forward-looking catalysts.";

  const heroCopy = mode === "explorer" ? data.modes.explorer.story : data.modes.investor.thesis;

  const stepperItems: StepperItem[] = [
    {
      id: "realtime",
      eyebrow: "Product",
      title: "Real-time intelligence + native tools",
      summary:
        "Grok 4 fuses live search, tool execution, and API access to stay current on breaking events and execute tasks inside X.",
      bullets: [
        "Tool API lets Grok call functions for research, summarization, and code",
        "Real-time search layer prevents stale answers during event spikes",
        "Premium+ / SuperGrok bundles create an immediate revenue surface"
      ]
    },
    {
      id: "compute",
      eyebrow: "Compute",
      title: "Colossus-as-a-moat",
      summary:
        "xAI is vertically integrating compute with Colossus—built in 122 days with 150K+ GPUs and targeted to double in months.",
      bullets: [
        "Ownership hedges against hyperscaler queue times",
        "Colossus 2 financing aims to accelerate model refresh cadence",
        "GPU fleet co-optimized for both Grok training and X workloads"
      ]
    },
    {
      id: "distribution",
      eyebrow: "Distribution",
      title: "X-native reach & data feedback",
      summary:
        "Integration with X subscriptions unlocks millions of users, a constant data firehose, and rapid A/B testing cycles.",
      bullets: [
        "MAU estimates ~35M (3P) through X channels",
        "Creator ecosystem primes Grok for real-time content synthesis",
        "Data feedback loops aim to strengthen world-model ambitions"
      ]
    }
  ];

  const fundraiseDisplay = `$${(Number(data.kpis.fundraise_in_market.value) / 1_000_000_000)
    .toFixed(1)
    .replace(/\.0$/, "")}B target`;
  const gpuDisplay = `${Number(data.kpis.gpu_scale.value).toLocaleString()} GPUs`;
  const modelDisplay = String(data.kpis.model_release.value);
  const isInvestor = mode === "investor";

  const investorExplorerContent = (
    <div className="flex flex-col gap-10">
      <Section
        eyebrow="Privately held"
        title={data.company.tagline}
        description={heroCopy}
        className="overflow-hidden"
      >
        <div className="relative">
          <ExplorerBackdrop active={mode === "explorer"} brand="xai" />
        </div>
        <ModePrimer
          mode={mode}
          showDetails={showModePrimerDetails}
          hydrated={modePrimerHydrated}
          onDismiss={handleDismissModePrimer}
          onReveal={handleRevealModePrimer}
          onSetMode={setMode}
        />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-100/80 via-white to-sky-100 shadow-[0_20px_40px_-30px_rgba(56,189,248,0.55)]">
              <Image src="/logos/xai.svg" alt="xAI logo" fill className="object-contain p-3" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-600">Private</p>
              <h1 className="text-3xl font-semibold text-slate-800">{data.company.name}</h1>
              <p className="text-sm text-slate-600">Founded {data.company.founded} · {data.company.mission}</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-4">
            <div className="relative hidden h-12 w-12 overflow-hidden rounded-2xl border border-sky-200 bg-white/70 shadow-sm lg:block">
              <Image src="/logos/xai.svg" alt="xAI logo" fill className="object-contain p-2" />
            </div>
            <div className="flex flex-wrap gap-4">
              <StatGroup
                label="Fundraise (reported)"
                value={fundraiseDisplay}
                asOf={data.kpis.fundraise_in_market.as_of}
              />
              <StatGroup label="Compute scale" value={gpuDisplay} asOf={data.kpis.gpu_scale.as_of} />
              <StatGroup label="Model release" value={modelDisplay} asOf={data.kpis.model_release.as_of} />
            </div>
          </div>
        </div>
      </Section>
      {!isInvestor ? (
        <>
          <Section
            eyebrow="Pulseboard"
            title="Signals shaping xAI’s flywheel"
            description="Key product, compute, and distribution proof points."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <KpiTile
                title="Fundraise in market"
                value={fundraiseDisplay}
                subtitle="Reported target mix of equity + debt"
                asOf={data.kpis.fundraise_in_market.as_of}
                animate={!prefersReducedMotion}
              />
              <KpiTile
                title="Compute scale"
                value={gpuDisplay}
                subtitle="Colossus live GPU count"
                asOf={data.kpis.gpu_scale.as_of}
                animate={!prefersReducedMotion}
              />
              <KpiTile
                title="Model release"
                value={modelDisplay}
                subtitle="Current flagship models"
                asOf={data.kpis.model_release.as_of}
              />
              <KpiTile
                title="Users (est.)"
                value={`${Number(data.kpis.users_estimated.value).toLocaleString()} MAUs`}
                subtitle="Third-party telemetry"
                asOf={data.kpis.users_estimated.as_of}
              />
            </div>
          </Section>
          <Section
            eyebrow="Narrative"
            title="Why xAI resonates right now"
            description="Product velocity, compute ambition, and distribution reach create the thesis."
          >
            <Stepper steps={stepperItems} animate={!prefersReducedMotion} />
          </Section>
        </>
      ) : (
        <Section
          eyebrow="Investment tooling"
          title="Model outcomes with xAI's return simulator"
          description="Adjust valuation, ownership, dilution, and exit to see return scenarios."
        >
          <TooltipProvider>
            <ReturnSimulator />
          </TooltipProvider>
        </Section>
      )}

      {isInvestor ? (
        <Section
          eyebrow="Financial dashboard"
          title="xAI capital stack & runway"
          description="Modeled capital requirements, fee structure, and blended return outcomes."
        >
          <XAIInvestmentDashboard fundModel={fundModel} />
        </Section>
      ) : null}

      {!isInvestor ? (
        <Section
          eyebrow="Contextual commentary"
          title="Stay current on xAI"
          description="Curated coverage across product releases, compute, and financing."
        >
          <NewsFeed items={commentary} />
        </Section>
      ) : null}

      {isInvestor ? (
        <Section
          eyebrow="Next steps"
          title="Engage JBV Capital"
          description="Reserve interest or book diligence time with the xAI coverage team."
        >
          <CallToAction reserveUrl={data.links.reserve_interest} companyName="xAI" />
        </Section>
      ) : null}

      <SourceFootnotes sources={data.sources} />
    </div>
  );

  const intelligenceContent = (
    <div className="flex flex-col gap-8">
      <ModePrimer
        mode={mode}
        showDetails={showModePrimerDetails}
        hydrated={modePrimerHydrated}
        onDismiss={handleDismissModePrimer}
        onReveal={handleRevealModePrimer}
        onSetMode={setMode}
      />
      <MicrositeIntelligenceView
        companyName={data.company.name}
        companySlug="xai"
        tagline={intelligenceTagline}
        heroDescription={intelligenceSummary}
        feed={intelligence ?? null}
        sources={data.sources}
      />
    </div>
  );

  return (
    <TooltipProvider>
      <MicrositeModeTransition mode={mode}>
        {mode === "intelligence" ? intelligenceContent : investorExplorerContent}
      </MicrositeModeTransition>
    </TooltipProvider>
  );
}

interface ModePrimerProps {
  mode: ExplorerInvestorMode;
  showDetails: boolean;
  hydrated: boolean;
  onDismiss: () => void;
  onReveal: () => void;
  onSetMode: (mode: ExplorerInvestorMode) => void;
}

function ModePrimer({
  mode,
  showDetails,
  hydrated,
  onDismiss,
  onReveal,
  onSetMode
}: ModePrimerProps) {
  const activeLabelMap: Record<ExplorerInvestorMode, string> = {
    explorer: "Explorer",
    investor: "Investor",
    intelligence: "Intelligence Feed"
  };
  const activeLabel = activeLabelMap[mode];

  return (
    <section
      className="mt-4 flex flex-col gap-3 rounded-3xl border border-sky-200/70 bg-white/85 p-4 text-slate-700 shadow-[0_26px_60px_-48px_rgba(15,23,42,0.35)]"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
            Choose your lens
          </p>
          <p className="text-sm text-slate-600">
            You&apos;re viewing the {" "}
            <span className="font-semibold text-slate-800">{activeLabel}</span>{" "}
            perspective. Switch anytime to reframe the story.
          </p>
        </div>
        <ModeToggle className="self-start shadow-none sm:self-auto" />
      </div>
      {showDetails ? (
        <div className="space-y-3 rounded-2xl border border-sky-100 bg-white/90 p-4 text-sm text-slate-600">
          <p>
            Explorer mode foregrounds narrative, roadmap, and public signals. Investor mode unlocks diligence tooling, modeling, and personalized fees. Intelligence Feed turns the microsite into a living stream of milestones, AI signals, and investor engagement data.
          </p>
          <div className="grid gap-3 text-xs text-slate-500 md:grid-cols-3">
            <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3">
              <p className="font-semibold text-slate-700">Explorer focuses on:</p>
              <ul className="mt-2 space-y-1">
                <li>• Story-driven thesis and product milestones</li>
                <li>• Real-time commentary, newsfeed, and signals</li>
              </ul>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3">
              <p className="font-semibold text-slate-700">Investor unlocks:</p>
              <ul className="mt-2 space-y-1">
                <li>• Scenario dashboards &amp; return simulator</li>
                <li>• Custom fee pulls plus diligence actions</li>
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
              <p className="font-semibold text-slate-700">Intelligence feed delivers:</p>
              <ul className="mt-2 space-y-1">
                <li>• Live insight stream of cards &amp; predictions</li>
                <li>• Engagement analytics + concierge chatbot</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button variant="subtle" size="sm" onClick={onDismiss}>
              Got it
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSetMode("explorer")}
              disabled={mode === "explorer"}
            >
              View Explorer insights
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSetMode("investor")}
              disabled={mode === "investor"}
            >
              View Investor modeling
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSetMode("intelligence")}
              disabled={mode === "intelligence"}
            >
              View Intelligence feed
            </Button>
          </div>
        </div>
      ) : hydrated ? (
        <button
          type="button"
          onClick={onReveal}
          className="w-fit text-xs font-semibold text-sky-600 transition hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Why three modes?
        </button>
      ) : null}
    </section>
  );
}

function StatGroup({ label, value, asOf }: { label: string; value: string; asOf?: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <StatPill label={label} value={value} />
      {asOf ? <span className="text-xs text-slate-500">as of {asOf}</span> : null}
    </div>
  );
}
