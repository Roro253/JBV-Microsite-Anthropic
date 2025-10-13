"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";

import { Section } from "@/components/Section";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StatPill } from "@/components/StatPill";
import { KpiTile } from "@/components/KpiTile";
import { Stepper, type StepperItem } from "@/components/Stepper";
import { PortfolioFit } from "@/components/PortfolioFit";
import { CallToAction } from "@/components/CallToAction";
import { NewsFeed, type NewsItem } from "@/components/NewsFeed";
import { SourceFootnotes } from "@/components/SourceFootnotes";
import { useUIStore } from "@/lib/store/ui";
import { type XaiData } from "@/lib/data";
import { formatUSDShort } from "@/components/Format";
import type { XFundModel } from "@/lib/xaiFundModel";
import XAIInvestmentDashboard from "@/components/XAIInvestmentDashboard";

interface XaiExperienceProps {
  data: XaiData;
  fundModel: XFundModel | null;
}

export function XaiExperience({ data, fundModel }: XaiExperienceProps) {
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);
  useEffect(() => {
    setMode("investor");
  }, [setMode]);

  const heroCopy = mode === "explorer" ? data.modes.explorer.story : data.modes.investor.thesis;

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

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-10">
      <Section
        eyebrow="Privately held"
        title={data.company.tagline}
        description={heroCopy}
        className="overflow-hidden"
      >
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
          <div className="flex flex-wrap gap-4">
            <StatGroup
              label="Fundraise (reported)"
              value={fundraiseDisplay}
              asOf={data.kpis.fundraise_in_market.as_of}
            />
            <StatGroup
              label="Compute scale"
              value={gpuDisplay}
              asOf={data.kpis.gpu_scale.as_of}
            />
            <StatGroup
              label="Latest model"
              value={modelDisplay}
              asOf={data.kpis.model_release.as_of}
            />
          </div>
        </div>
      </Section>

      {!isInvestor ? (
        <>
          <Section
            eyebrow="Pulseboard"
            title="Signals shaping xAI’s velocity"
            description="Key indicators across compute, capital, users, and distribution."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <KpiTile
                title="Compute scale"
                value={`${Number(data.kpis.gpu_scale.value).toLocaleString()} GPUs`}
                subtitle="Colossus live fleet"
                asOf={data.kpis.gpu_scale.as_of}
                animate
              />
              <KpiTile
                title="Fundraise in market"
                value={formatUSDShort(Number(data.kpis.fundraise_in_market.value))}
                subtitle="Reported (mix of equity + debt)"
                asOf={data.kpis.fundraise_in_market.as_of}
                animate
              />
              <KpiTile
                title="Users (est.)"
                value={`${(Number(data.kpis.users_estimated.value) / 1_000_000)
                  .toFixed(1)
                  .replace(/\.0$/, "")}M`}
                subtitle="Third-party MAU estimate (unofficial)"
                asOf={data.kpis.users_estimated.as_of}
              />
              <KpiTile
                title="Distribution"
                value="X Premium+ & SuperGrok integrations"
                subtitle="Native consumer funnel + API"
              />
            </div>
            <p className="text-xs text-slate-500">
              Reported and estimated metrics are directional only; confirm figures via diligence disclosures.
            </p>
          </Section>

          <Section
            eyebrow="Interactive thesis"
            title="How xAI is positioning its frontier stack"
            description="Toggle through the components of the thesis and expand to see supporting signals."
          >
            <Stepper steps={stepperItems} animate />
          </Section>
        </>
      ) : null}

      {isInvestor ? (
        <>
          <XAIInvestmentDashboard fundModel={fundModel} />

          <Section
            eyebrow="Portfolio design"
            title="Match xAI to your mandate"
            description="Answer three prompts to align xAI exposure with your allocation strategy."
          >
            <PortfolioFit
              animate
              companyName="xAI"
              followOnNote="Tailor follow-on pacing with Colossus expansion milestones and X distribution incentives."
            />
          </Section>
        </>
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
          <CallToAction
            reserveUrl={data.links.reserve_interest}
            diligenceUrl={data.links.book_diligence}
            companyName="xAI"
          />
        </Section>
      ) : null}

      <SourceFootnotes sources={data.sources} />
    </div>
    </TooltipProvider>
  );
}

function StatGroup({ label, value, asOf }: { label: string; value: string; asOf?: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <StatPill label={label} value={value} />
      {asOf ? (
        <span className="text-xs text-slate-500">as of {asOf}</span>
      ) : null}
    </div>
  );
}
