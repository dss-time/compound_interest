import "./globals.css";
import { Space_Grotesk, Source_Serif_4 } from "next/font/google";

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
      <body className={`${sans.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
