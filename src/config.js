/**
 * @file config.js
 * @description Centralised API configuration.
 * API key is loaded from the Vite environment variable VITE_OWM_KEY
 * Add a `.env` file at the project root with:
 *   VITE_OWM_KEY=your_key_here
 */

export const API_KEY = import.meta.env.VITE_OWM_KEY;

/** OpenWeatherMap REST base URLs */
export const BASE_URL = "https://api.openweathermap.org/data/2.5";
export const ONE_CALL = "https://api.openweathermap.org/data/3.0/onecall";
export const UV_LEGACY = `${BASE_URL}/uvi`;
