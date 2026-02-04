import "./globals.css";
import Script from "next/script";
import { Space_Grotesk, Source_Serif_4 } from "next/font/google";
import { PageToggleButton } from "@/app/_components/PageToggleButton";
import { PageFlipTransition } from "@/app/_components/PageFlipTransition";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: "Compound Interest Lab",
  description: "Compound interest simulator with drawdown modeling.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable}`}>
        <PageToggleButton />
        <PageFlipTransition>{children}</PageFlipTransition>
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="865b0af3-5935-44af-a7ec-13df52e4d393"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
