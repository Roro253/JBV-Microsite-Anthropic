"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";

import { Section } from "@/components/Section";
import { StatPill } from "@/components/StatPill";
import { KpiTile } from "@/components/KpiTile";
import { Stepper, type StepperItem } from "@/components/Stepper";
import { ReturnSimulator } from "@/components/ReturnSimulator";
import { PortfolioFit } from "@/components/PortfolioFit";
import { CallToAction } from "@/components/CallToAction";
import { NewsFeed, type NewsItem } from "@/components/NewsFeed";
import { SourceFootnotes } from "@/components/SourceFootnotes";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useUIStore } from "@/lib/store/ui";
import { formatUSDShort } from "@/components/Format";
import { Sparkline } from "@/components/Sparkline";
import type { OpenAiData } from "@/lib/data";

interface OpenAIExperienceProps {
  data: OpenAiData;
}

export function OpenAIExperience({ data }: OpenAIExperienceProps) {
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);
  const setScenario = useUIStore((state) => state.setScenario);
  const prefersReducedMotion = useReducedMotion();
  const scenarioInitialized = useRef(false);

  useEffect(() => {
    setMode("investor");
  }, [setMode]);

  useEffect(() => {
    if (scenarioInitialized.current) return;
    scenarioInitialized.current = true;
    setScenario({
      entryValuation: 500,
      ownershipPct: 0.6,
      dilutionFollowOn: 8,
      exitValuation: 750,
      years: 4
    });
  }, [setScenario]);

  const isInvestor = mode === "investor";

  const valuationDisplay = formatUSDShort(Number(data.kpis.valuation.value));
  const revenueDisplay = formatUSDShort(Number(data.kpis.revenue_h1_2025.value));
  const computeDisplay = `${(Number(data.kpis.compute_commit.value) / 1_000_000_000).toFixed(1)} GW target`;
  const latestModelsDisplay = String(data.kpis.latest_models.value);

  const revenueSparkline = useMemo(
    () => [2.5, 3, 3.4, 3.8, 4.3].map((value) => value * 1_000_000_000),
    []
  );

  const stepperItems: StepperItem[] = [
    {
      id: "reasoning",
      eyebrow: "Reasoning",
      title: "o-series agents push deeper planning",
      summary:
        "OpenAI's o-series focuses on chain-of-thought style reasoning for math, code, and analysis—moving beyond standard chat completions.",
      bullets: [
        "o1 preview + o1-mini opened in late 2024 as the first reasoning-focused models",
        "Successor models (o2, o3) target richer multi-step planning and agent workflows",
        "Reasoning roadmap underpins enterprise copilots for complex analysis"
      ]
    },
    {
      id: "video",
      eyebrow: "Multimodal",
      title: "Sora 2 expands into world-simulative video",
      summary:
        "Sora 2 adds higher-fidelity video, audio, and world modeling—broadening OpenAI's surface beyond text/chat and into synthetic media.",
      bullets: [
        "Launches Oct 2025 with stronger world-consistency vs. original Sora",
        "Watermarking is deployed but adversarial removal remains a governance focus",
        "Targets marketing, simulation, and entertainment pipelines with partner studios"
      ]
    },
    {
      id: "distribution",
      eyebrow: "Distribution",
      title: "Microsoft alliance locks in enterprise reach",
      summary:
        "The Microsoft partnership provides global distribution (Copilot, Azure OpenAI) and shared investment in the Stargate compute program.",
      bullets: [
        "Rights through 2030 reaffirmed in Jan 2025 for Copilot and Azure integration",
        "Joint roadmap covers AI infrastructure, including Stargate hyperscale build",
        "Commercial monetization spans developer APIs, Office, Windows, GitHub"
      ]
    }
  ];

  const commentary: NewsItem[] = useMemo(
    () => [
      {
        title: "OpenAI valuation hits ~$500B via secondary",
        publisher: "Visual Capitalist",
        date: "Oct 2025",
        whyItMatters:
          "Highlights investor demand for liquidity and the implied scale of OpenAI's frontier leadership.",
        url: "https://www.visualcapitalist.com/cp/openai-500b-valuation/"
      },
      {
        title: "H1 2025 revenue reaches ~$4.3B",
        publisher: "Reuters",
        date: "Sep 30, 2025",
        whyItMatters:
          "Shows accelerated monetization ahead of Sora 2 scale-up and enterprise upsells.",
        url: "https://www.reuters.com/technology/openais-first-half-revenue-rises-16-about-43-billion-information-reports-2025-09-30/"
      },
      {
        title: "OpenAI, AMD lock in 6 GW compute roadmap",
        publisher: "The Guardian",
        date: "Oct 6, 2025",
        whyItMatters:
          "Secures multi-gigawatt GPU supply—critical for staying ahead on training throughput.",
        url: "https://www.theguardian.com/technology/2025/oct/06/openai-chipmaker-amd-deal"
      },
      {
        title: "Microsoft reaffirms OpenAI partnership through 2030",
        publisher: "Microsoft",
        date: "Jan 21, 2025",
        whyItMatters:
          "Extends IP, revenue sharing, and compute collaboration—cementing enterprise distribution.",
        url: "https://blogs.microsoft.com/blog/2025/01/21/microsoft-and-openai-evolve-partnership-to-drive-the-next-phase-of-ai/"
      },
      {
        title: "Sora 2 introduces richer world simulation",
        publisher: "OpenAI",
        date: "Oct 2025",
        whyItMatters:
          "Signals OpenAI's push into video-native models across creative, simulation, and entertainment.",
        url: "https://openai.com/index/sora-2/"
      },
      {
        title: "Watermarking challenges for AI video",
        publisher: "Axios",
        date: "Oct 12, 2025",
        whyItMatters:
          "Underscores authenticity and policy risks as generated media proliferates.",
        url: "https://www.axios.com/2025/10/12/spot-a-sora-fake"
      }
    ],
    []
  );

  return (
    <div className="flex flex-col gap-10">
      <Section
        eyebrow="Capped-profit structure (non-profit-controlled)"
        title={data.company.tagline}
        description={mode === "explorer" ? data.modes.explorer.story : data.modes.investor.thesis}
        className="overflow-hidden"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-100 via-white to-sky-100 shadow-[0_20px_40px_-32px_rgba(56,189,248,0.5)]">
              <Image src="/logos/openai.svg" alt="OpenAI logo" fill className="object-contain p-3" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-600">{data.company.structure}</p>
              <h1 className="text-3xl font-semibold text-slate-800">{data.company.name}</h1>
              <p className="text-sm text-slate-600">Founded {data.company.founded} · {data.company.mission}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <StatSummary label="Valuation (secondary)" value={valuationDisplay} asOf={data.kpis.valuation.as_of} />
            <StatSummary label="H1 revenue" value={`${revenueDisplay} (H1)`} asOf={data.kpis.revenue_h1_2025.as_of} />
            <StatSummary label="Compute roadmap" value={computeDisplay} asOf={data.kpis.compute_commit.as_of} />
            <StatSummary label="Latest models" value={latestModelsDisplay} asOf={data.kpis.latest_models.as_of} />
          </div>
        </div>
      </Section>

      {!isInvestor ? (
        <>
          <Section
            eyebrow="Pulseboard"
            title="Signals shaping OpenAI’s velocity"
            description="Key indicators across valuation, revenue, compute, and products."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <KpiTile
                title="Valuation"
                value={valuationDisplay}
                subtitle="Oct 2025 secondary"
                asOf={data.kpis.valuation.as_of}
                animate={!prefersReducedMotion}
              />
              <KpiTile
                title="Revenue (H1 2025)"
                value={revenueDisplay}
                subtitle="Reported via The Information"
                asOf={data.kpis.revenue_h1_2025.as_of}
                animate={!prefersReducedMotion}
              />
              <KpiTile
                title="Compute commitment"
                value={computeDisplay}
                subtitle="AMD partnership + Stargate"
                asOf={data.kpis.compute_commit.as_of}
              />
              <KpiTile
                title="Latest models"
                value={latestModelsDisplay}
                subtitle="Reasoning + video"
                asOf={data.kpis.latest_models.as_of}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Secondary valuations and reported revenue are directional; validate figures during diligence.
            </p>
          </Section>

          <Section
            eyebrow="Interactive thesis"
            title="How OpenAI is positioning its frontier stack"
            description="Toggle through the thesis components and expand to see supporting signals."
          >
            <Stepper steps={stepperItems} initialStep={0} animate={!prefersReducedMotion} />
          </Section>
        </>
      ) : null}

      {isInvestor ? (
        <>
          <Section
            eyebrow="Capital modeling"
            title="Illustrative return simulator"
            description="Adjust ownership, dilution, and valuation scenarios to stress-test potential outcomes."
          >
            <ReturnSimulator animate={!prefersReducedMotion} contextLabel="OpenAI" />
            <p className="text-xs text-slate-500">
              Inputs reflect market reporting (secondary transactions, compute expansion). Modify to match your underwriting assumptions.
            </p>
            <div className="mt-4 rounded-2xl border border-sky-100 bg-white/70 p-4 shadow-[0_18px_40px_-36px_rgba(15,23,42,0.25)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
                Revenue momentum (est.)
              </p>
              <Sparkline data={revenueSparkline} className="mt-2" />
              <p className="mt-2 text-xs text-slate-500">
                Directional trajectory from ~$2.5B to ~$4.3B revenue per half-year (H1 2025 reporting).
              </p>
            </div>
          </Section>

          <Section
            eyebrow="Portfolio design"
            title="Match OpenAI to your mandate"
            description="Answer three prompts to align OpenAI exposure with your allocation strategy."
          >
            <PortfolioFit
              animate={!prefersReducedMotion}
              companyName="OpenAI"
              followOnNote="Align follow-on pacing with AMD infrastructure milestones and Microsoft GTM expansion."
            />
          </Section>
        </>
      ) : null}

      {!isInvestor ? (
        <Section
          eyebrow="Contextual commentary"
          title="Stay current on OpenAI"
          description="Curated coverage across valuation, compute, partnerships, and product releases."
        >
          <NewsFeed items={commentary} />
        </Section>
      ) : null}

      {isInvestor ? (
        <Section
          eyebrow="Next steps"
          title="Engage JBV Capital"
          description="Reserve interest or book diligence time with the OpenAI coverage team."
        >
          <CallToAction
            reserveUrl={data.links.reserve_interest}
            diligenceUrl={data.links.book_diligence}
            companyName="OpenAI"
          />
        </Section>
      ) : null}

      <SourceFootnotes sources={data.sources} />
    </div>
  );
}

function StatSummary({ label, value, asOf }: { label: string; value: string; asOf?: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <StatPill label={label} value={value} animate={false} />
      {asOf ? <span className="text-xs text-slate-500">as of {asOf}</span> : null}
    </div>
  );
}
