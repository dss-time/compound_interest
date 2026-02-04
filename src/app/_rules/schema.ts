import { z } from "zod";

import type { AppState } from "@/lib/app-state";

const positiveNumber = (min: number, max?: number) => {
  const base = z.number({ invalid_type_error: "mustBeNumber" }).finite();
  const withMin = base.min(min, { message: "tooSmall" });
  return max === undefined ? withMin : withMin.max(max, { message: "tooLarge" });
};

const ddSeqItem = /^\s*\d+(?:\.\d+)?\s*@\s*\d+\s*$/;

export const appStateSchema = z
  .object({
    simMode: z.enum(["monthly", "tradingDays"]),
    rateMode: z.enum(["daily", "annual"]),
    ddEnabled: z.boolean(),
    ddMode: z.enum(["single", "multi", "random"]),
    randMethod: z.enum(["prob", "count"]),
    principal: positiveNumber(0),
    monthlyRate: z.number().finite().min(-100).max(1000),
    dailyRate: z.number().finite().min(-100).max(100),
    annualRate: z.number().finite().min(-100).max(1000),
    duration: positiveNumber(1, 1200),
    ddMonth: positiveNumber(1, 1200),
    randProb: positiveNumber(0, 100),
    randCount: positiveNumber(0, 1200),
    simRuns: positiveNumber(10, 200000),
    fxRate: positiveNumber(0.0001, 1000),
    ddList: z.string(),
    ddPool: z.string(),
    ddSeq: z.string(),
  })
  .superRefine((data, ctx) => {
    const toList = (v: string) =>
      v
        .split(/[，,\s]+/g)
        .map((x) => Number(x.trim()))
        .filter((n) => Number.isFinite(n) && n > 0 && n < 100);

    if (data.ddEnabled && data.ddMode === "single" && toList(data.ddList).length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ddList"], message: "invalidDdList" });
    }
    if (data.ddEnabled && data.ddMode === "random" && toList(data.ddPool).length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ddPool"], message: "invalidDdPool" });
    }

    const seqTokens = data.ddSeq
      .split(/[，,]+/g)
      .map((x) => x.trim())
      .filter(Boolean);
    if (data.ddEnabled && data.ddMode === "multi" && seqTokens.some((token) => !ddSeqItem.test(token))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ddSeq"], message: "invalidDdSeq" });
    }
  });

export type ValidationErrors = Partial<Record<keyof AppState, string>>;

export function validateState(state: AppState): ValidationErrors {
  const parsed = appStateSchema.safeParse(state);
  if (parsed.success) return {};

  const errors: ValidationErrors = {};
  parsed.error.issues.forEach((issue) => {
    const key = issue.path[0] as keyof AppState;
    if (key && !errors[key]) {
      errors[key] = issue.message;
    }
  });
  return errors;
}
