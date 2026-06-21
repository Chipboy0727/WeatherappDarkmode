/**
 * @file components/LoadingOverlay.jsx
 * @description Spinner overlay shown while weather data is being fetched.
 */

const LoadingOverlay = ({ city }) => (
  <div
    className="loading-overlay"
    aria-live="polite"
    aria-label={`Loading weather for ${city}`}
  >
    <div className="loading-spinner" />
    <div className="loading-text">
      Fetching weather
      <br />
      <span style={{ color: "#00c6ff", fontWeight: 700 }}>{city}</span>
    </div>
  </div>
);

export default LoadingOverlay;
