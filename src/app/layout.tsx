import "./globals.css";
import Script from "next/script";
import { AnalyticsConsent } from "@/app/_components/AnalyticsConsent";
import { AppToaster } from "@/app/_components/AppToaster";
import { PageToggleButton } from "@/app/_components/PageToggleButton";
import { PageFlipTransition } from "@/app/_components/PageFlipTransition";

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
          id="lang-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var raw = localStorage.getItem('ci_settings_v1');
                if (raw) {
                  var parsed = JSON.parse(raw);
                  document.documentElement.lang = parsed && parsed.lang === 'en' ? 'en' : 'zh-CN';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <PageToggleButton />
        <PageFlipTransition>{children}</PageFlipTransition>
        <AppToaster />
        <AnalyticsConsent />
      </body>
    </html>
  );
}
