"use client";

import { usePathname } from "next/navigation";

export function PageFlipTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mode = pathname === "/options" ? "to-options" : "to-home";

  return (
    <div className="page-flip-perspective">
      <div key={`${pathname}-dim`} className={`page-flip-dim ${mode}`} />
      <div key={pathname} className={`page-flip-card ${mode}`}>
        <div className="page-flip-shell">{children}</div>
      </div>
    </div>
  );
}
