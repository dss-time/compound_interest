import Decimal from "decimal.js";

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

export const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addMonths(date, months) {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== day) d.setDate(0);
  return d;
}

export function daysDiff(a, b) {
  return (b.getTime() - a.getTime()) / 86400000;
}

export function parsePctList(s) {
  return (s || '')
    .split(/[，,\s]+/g)
    .map((x) => Number(String(x).trim()))
    .filter((x) => isFinite(x) && x > 0 && x < 100)
    .sort((a, b) => a - b);
}

export function parseSeq(s) {
  const raw = (s || '')
    .split(/[，,]+/g)
    .map((x) => x.trim())
    .filter(Boolean);
  const events = [];
  for (const item of raw) {
    const m = item.match(/^(\d+(?:\.\d+)?)\s*@\s*(\d+)\s*$/);
    if (!m) continue;
    const dd = Number(m[1]);
    const month = Number(m[2]);
    if (!isFinite(dd) || !isFinite(month)) continue;
    if (dd <= 0 || dd >= 100) continue;
    events.push({ dd, month });
  }
  events.sort((a, b) => a.month - b.month);
  return events;
}

export function hashSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

export function mulberry32(a) {
  return () => {
    let t0 = (a += 0x6d2b79f5);
    t0 = Math.imul(t0 ^ (t0 >>> 15), t0 | 1);
    t0 ^= t0 + Math.imul(t0 ^ (t0 >>> 7), t0 | 61);
    return ((t0 ^ (t0 >>> 14)) >>> 0) / 4294967296;
  };
}

export function quantile(sorted, q) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] === undefined) return sorted[base];
  return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
}

export function formatNow(lang) {
  return new Date().toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    hour12: false,
  });
}

export function fmtCNY(lang, n) {
  const value = Decimal.isDecimal(n) ? n.toNumber() : n;
  if (!isFinite(value)) return '-';
  return new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 2,
  }).format(value);
}

export function fmtPct(x) {
  const value = Decimal.isDecimal(x) ? x.toNumber() : x;
  if (!isFinite(value)) return '-';
  return (value * 100).toFixed(2) + '%';
}

export function isMobileUI() {
  const mq = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  return mq || coarse;
}

export function safeJsonParse(str) {
  try {
    return { ok: true, data: JSON.parse(str) };
  } catch (e) {
    return { ok: false, error: e };
  }
}

export function encodeState(obj) {
  const json = JSON.stringify(obj);
  return btoa(encodeURIComponent(json));
}

export function decodeState(str) {
  try {
    const json = decodeURIComponent(atob(str));
    return { ok: true, data: JSON.parse(json) };
  } catch (e) {
    return { ok: false, error: e };
  }
}

export function isInputLike(el) {
  if (!el) return false;
  const tag = String(el.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  return !!el.isContentEditable;
}
