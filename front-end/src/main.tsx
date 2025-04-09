import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ReactGA from "react-ga4";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://af4c730147c3b21166b34acf8c1a0e0c@o4509090085994496.ingest.us.sentry.io/4509090097856512",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
});
ReactGA.initialize("G-Y5KWT1RGN0");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>An error occurred!</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
