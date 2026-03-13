import "./globals.css";
import Script from "next/script";
import { AnalyticsConsent } from "@/app/_components/AnalyticsConsent";
import { AppToaster } from "@/app/_components/AppToaster";
import { DocumentMetaSync } from "@/app/_components/DocumentMetaSync";
import { LiquidEffects } from "@/app/_components/LiquidEffects";
import { PageToggleButton } from "@/app/_components/PageToggleButton";
import { PageFlipTransition } from "@/app/_components/PageFlipTransition";
import { DOCUMENT_META_KEY } from "@/lib/document-meta";
import { STORAGE_KEY } from "@/lib/app-state";

export const metadata = {
  title: "Compound Interest Planner",
  description: "Plan compound growth with monthly or trading-day simulations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/dayflow.css" />
        <Script
          id="document-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var raw = localStorage.getItem('${DOCUMENT_META_KEY}') || localStorage.getItem('${STORAGE_KEY}');
                var lang = 'zh-CN';
                var theme = 'dark';
                if (raw) {
                  var parsed = JSON.parse(raw);
                  if (parsed && parsed.lang === 'en') lang = 'en';
                  if (parsed && parsed.theme === 'light') theme = 'light';
                }
                document.documentElement.lang = lang;
                document.documentElement.dataset.theme = theme;
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <DocumentMetaSync />
        <LiquidEffects />
        <PageToggleButton />
        <PageFlipTransition>{children}</PageFlipTransition>
        <AppToaster />
        <AnalyticsConsent />
      </body>
    </html>
  );
}
