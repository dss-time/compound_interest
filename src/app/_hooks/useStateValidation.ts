import { useMemo } from "react";

import type { AppState } from "@/lib/app-state";
import { validateState } from "@/app/_rules/schema";

export function useStateValidation(state: AppState) {
  return useMemo(() => validateState(state), [state]);
}
