/**
 * @file utils/weather.js
 * @description Pure utility functions for weather data formatting and calculations.
 *
 * All functions are stateless and side-effect free — safe to use anywhere.
 * No API calls are made in this file.
 *
 * @module weatherUtils
 */

/** @type {string[]} Day names indexed by getDay() (0 = Sunday) */
export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Returns the full day name for a Unix timestamp.
 *
 * @param {number} ts - Unix timestamp in seconds
 * @returns {string} Day name e.g. "Monday"
 *
 * @example
 * getDayName(1700000000); // "Wednesday"
 */
export const getDayName = (ts) => DAYS[new Date(ts * 1000).getDay()];

/**
 * Formats a Unix timestamp as "DD Mon" string.
 *
 * @param {number} ts - Unix timestamp in seconds
 * @returns {string} Formatted date e.g. "21 mar"
 *
 * @example
 * getDate(1700000000); // "14 nov"
 */
export const getDate = (ts) => {
  const d = new Date(ts * 1000);
  return `${d.getDate()} ${d.toLocaleString("en", { month: "short" }).toLowerCase()}`;
};

/**
 * Formats a Date object as "HH:MM" (24-hour).
 *
 * @param {Date} t - Date object
 * @returns {string} Time string e.g. "14:30"
 */
export const fmtTime = (t) =>
  t.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

/**
 * Formats a Date object as full date + time string.
 *
 * @param {Date} t - Date object
 * @returns {string} e.g. "21 March, 2026 14:30"
 */
export const fmtDate = (t) =>
  `${t.getDate()} ${t.toLocaleString("en", { month: "long" })}, ${t.getFullYear()} ${fmtTime(t)}`;

/**
 * Formats a Date object as 12-hour AM/PM time.
 *
 * @param {Date|null} d - Date object or null
 * @returns {string} e.g. "2:30 PM" or "--" if null
 *
 * @example
 * fmtAmPm(new Date()); // "10:45 AM"
 */
export const fmtAmPm = (d) => {
  if (!d) return "--";
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
};

/**
 * Calculates dew point temperature using the simplified Magnus formula.
 * Accurate to within ~1°C for typical weather conditions.
 *
 * @param {number} tempC - Current temperature in Celsius
 * @param {number} humidity - Relative humidity percentage (0–100)
 * @returns {number} Dew point temperature in Celsius (rounded)
 *
 * @example
 * calcDewPoint(25, 80); // 21
 */
export const calcDewPoint = (tempC, humidity) =>
  Math.round(tempC - (100 - humidity) / 5);

/**
 * Converts wind speed from metres per second to kilometres per hour.
 * Result is rounded to 1 decimal place.
 *
 * @param {number} mps - Wind speed in m/s (from OWM API)
 * @returns {number} Wind speed in km/h e.g. 14.5
 *
 * @example
 * msToKmh(4.2); // 15.1
 */
export const msToKmh = (mps) => Math.round(mps * 3.6 * 10) / 10;

/**
 * Converts a temperature value from Celsius to Fahrenheit.
 *
 * @param {number} c - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit (rounded to nearest integer)
 *
 * @example
 * toF(0);   // 32
 * toF(100); // 212
 */
export const toF = (c) => Math.round((c * 9) / 5 + 32);

/**
 * Converts a Celsius temperature to the selected unit.
 * Returns "--" unchanged (used as a loading placeholder).
 *
 * @param {number|"--"} c - Temperature in Celsius, or "--" placeholder
 * @param {"C"|"F"} unit - Target unit
 * @returns {number|"--"} Converted temperature or "--"
 *
 * @example
 * convertTemp(25, "F"); // 77
 * convertTemp("--", "F"); // "--"
 */
export const convertTemp = (c, unit) => {
  if (c === "--" || c == null) return "--";
  return unit === "F" ? toF(c) : c;
};

/**
 * Aggregates a 3-hourly forecast list into one representative entry per day.
 * Picks the entry closest to 12:00 noon for each day to best represent
 * midday conditions.
 *
 * @param {Array<object>} list - OWM forecast list (3-hour intervals)
 * @param {number} [limit=7] - Maximum number of days to return
 * @returns {Array<object>} One forecast item per day, up to `limit` days
 *
 * @example
 * const daily = dailyFromList(forecast.list, 5);
 * // Returns 5 items, one per day, each near noon
 */
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
      // Prefer the entry closest to noon (12:00)
      if (Math.abs(hour - 12) < Math.abs(existingHour - 12)) {
        byDay.set(key, item);
      }
    }
  });
  return Array.from(byDay.values()).slice(0, limit);
};
