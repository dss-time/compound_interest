"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";

import { Button } from "@/components/ui/button";
import { useDocumentLang } from "@/app/_hooks/useDocumentLang";

const CONSENT_KEY = "ci_analytics_consent_v1";

type Consent = "accepted" | "rejected" | null;

export function AnalyticsConsent() {
  const lang = useDocumentLang();
  const [consent, setConsent] = useState<Consent>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CONSENT_KEY);
      setConsent(raw === "accepted" || raw === "rejected" ? raw : null);
    } catch {
      setConsent(null);
    } finally {
      setResolved(true);
    }
  }, []);

  const text = useMemo(() => {
    if (lang === "en") {
      return {
        title: "Privacy settings",
        body: "This site can use anonymous analytics to understand which screens help or confuse customers. It stays off until you allow it.",
        accept: "Allow analytics",
        reject: "Keep it off",
      };
    }

    return {
      title: "隐私设置",
      body: "当前站点可启用匿名访问统计，用于判断哪些页面更容易让客户看懂或卡住。在你允许前，它会保持关闭。",
      accept: "允许统计",
      reject: "保持关闭",
    };
  }, [lang]);

  const decide = (next: Exclude<Consent, null>) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, next);
    } catch {
      // Ignore storage failures and still respect the in-memory choice for this session.
    }
    setConsent(next);
  };

  if (!resolved) return null;

  return (
    <>
      {consent === "accepted" ? (
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="865b0af3-5935-44af-a7ec-13df52e4d393"
          strategy="afterInteractive"
        />
      ) : null}

      {consent === null ? (
        <div className="fixed inset-x-4 bottom-20 z-40 md:inset-x-auto md:right-6 md:top-20 md:bottom-auto md:w-[380px]">
          <div className="dr-card rounded-2xl p-4 shadow-2xl">
            <div className="text-sm font-semibold text-foreground">{text.title}</div>
            <div className="mt-2 text-xs leading-relaxed text-muted-foreground">{text.body}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => decide("accepted")}>
                {text.accept}
              </Button>
              <Button size="sm" variant="outline" onClick={() => decide("rejected")}>
                {text.reject}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
