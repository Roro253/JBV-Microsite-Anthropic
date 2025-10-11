"use client";

import * as React from "react";
import { DefaultSeo, OrganizationJsonLd, ProductJsonLd } from "next-seo";
import type { DefaultSeoProps } from "next-seo";

import type { AnthropicData } from "@/lib/data";

interface SeoProviderProps {
  data: AnthropicData;
}

const siteUrl = "https://jbvcapital.ai";

const AppDefaultSeo = DefaultSeo as React.ComponentType<DefaultSeoProps & { useAppDir?: boolean }>;

export function SeoProvider({ data }: SeoProviderProps) {
  const description = data.company.mission;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <AppDefaultSeo
        useAppDir
        title="Anthropic — JBV Capital Microsite"
        description={description}
        canonical={`${siteUrl}/anthropic`}
        openGraph={{
          type: "website",
          url: `${siteUrl}/anthropic`,
          title: "Anthropic — JBV Capital Microsite",
          description,
          images: [
            {
              url: `${siteUrl}/og/anthropic.png`,
              width: 1200,
              height: 630,
              alt: "Anthropic investor microsite"
            }
          ]
        }}
        twitter={{
          handle: "@jbvcapital",
          cardType: "summary_large_image"
        }}
      />
      <OrganizationJsonLd
        useAppDir
        type="InvestmentCompany"
        id="https://jbvcapital.ai/#organization"
        legalName="JBV Capital"
        name="JBV Capital"
        url={siteUrl}
        sameAs={["https://www.linkedin.com/company/jbv-capital"]}
        logo={`${siteUrl}/og/anthropic.png`}
        description={description}
      />
      <ProductJsonLd
        useAppDir
        productName="Anthropic Claude Platform"
        description={data.company.tagline}
        brand="Anthropic"
        url={`${siteUrl}/anthropic`}
        images={[`${siteUrl}/og/anthropic.png`]}
        manufacturerName="Anthropic"
      />
    </>
  );
}
