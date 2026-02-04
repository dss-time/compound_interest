import { useEffect } from "react";

import { toISODate } from "@/lib/utils";

export function useAutoStartDate(simMode: string, startDate: string, setState: any) {
  useEffect(() => {
    if (simMode === "tradingDays" && !startDate) {
      setState((s: any) => ({ ...s, startDate: toISODate(new Date()) }));
    }
  }, [simMode, startDate, setState]);
}
