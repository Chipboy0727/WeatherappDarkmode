/**
 * @file utils/weather.js
 * @description Pure helper functions for data formatting and calculations.
 */

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getDayName = (ts) => DAYS[new Date(ts * 1000).getDay()];

export const getDate = (ts) => {
  const d = new Date(ts * 1000);
  return `${d.getDate()} ${d.toLocaleString("en", { month: "short" }).toLowerCase()}`;
};

export const fmtTime = (t) =>
  t.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export const fmtDate = (t) =>
  `${t.getDate()} ${t.toLocaleString("en", { month: "long" })}, ${t.getFullYear()} ${fmtTime(t)}`;

export const fmtAmPm = (d) => {
  if (!d) return "--";
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
};

export const calcDewPoint = (tempC, humidity) =>
  Math.round(tempC - (100 - humidity) / 5);

export const msToKmh = (mps) => Math.round(mps * 3.6 * 10) / 10;

export const toF = (c) => Math.round((c * 9) / 5 + 32);

export const convertTemp = (c, unit) => {
  if (c === "--" || c == null) return "--";
  return unit === "F" ? toF(c) : c;
};

export const dailyFromList = (list, limit = 7) => {
  const byDay = new Map();
  list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const key = date.toISOString().slice(0, 10);
    const hour = date.getHours();
    if (!byDay.has(key)) {
      byDay.set(key, item);
    } else {
      const existing = byDay.get(key);
      const existingHour = new Date(existing.dt * 1000).getHours();
      if (Math.abs(hour - 12) < Math.abs(existingHour - 12)) {
        byDay.set(key, item);
      }
    }
  });
  return Array.from(byDay.values()).slice(0, limit);
};
