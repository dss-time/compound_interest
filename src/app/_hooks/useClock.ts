import { useEffect, useState } from "react";

import { formatNow } from "@/lib/utils";

export function useClock(lang: "zh" | "en") {
  const [nowText, setNowText] = useState("");

  useEffect(() => {
    const tick = () => setNowText(formatNow(lang));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lang]);

  return nowText;
}
