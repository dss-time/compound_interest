import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

export function toISODate(date: Date | string | dayjs.Dayjs) {
  return dayjs(date).format("YYYY-MM-DD");
}

export function addMonths(date: Date | string | dayjs.Dayjs, months: number) {
  return dayjs(date).add(months, "month").toDate();
}

export function daysDiff(a: Date | string | dayjs.Dayjs, b: Date | string | dayjs.Dayjs) {
  return dayjs(b).diff(dayjs(a), "day", true);
}

export function formatNow(lang: "zh" | "en") {
  const now = dayjs().locale(lang === "zh" ? "zh-cn" : "en");
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  const offset = now.format("Z");
  if (lang === "zh") {
    return `${now.format("YYYY-MM-DD dddd HH:mm:ss")} GMT${offset} (${zone})`;
  }
  return `${now.format("YYYY-MM-DD dddd HH:mm:ss")} GMT${offset} (${zone})`;
}
