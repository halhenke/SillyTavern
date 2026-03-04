import { useMemo, useState } from 'react';

import { LegacyBridge, createLegacyBridge } from '../../legacy/bridge';

export function ShellPage() {
  const [legacyBridge, setLegacyBridge] = useState<LegacyBridge | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const legacySource = useMemo(() => `/legacy${window.location.search}`, []);

  const status = useMemo(() => {
    if (loadError) {
      return `Legacy runtime failed to connect: ${loadError}`;
    }

    if (legacyBridge) {
      return 'Connected to legacy runtime';
    }

    return 'Waiting for legacy runtime';
  }, [legacyBridge, loadError]);

  return (
    <main className="st-screen st-shell">
      <header className="st-shell-header">
        <h1>SillyTavern React Shell (Phase 1)</h1>
        <p>{status}</p>
        <nav className="st-actions">
          <a href="/legacy" target="_blank" rel="noreferrer">
            Open legacy app
          </a>
          <a href="/legacy-login" target="_blank" rel="noreferrer">
            Open legacy login
          </a>
        </nav>
      </header>

      <iframe
        className="st-shell-frame"
        src={legacySource}
        title="SillyTavern Legacy Runtime"
        onLoad={(event) => {
          const iframeWindow = event.currentTarget.contentWindow;
          if (!iframeWindow) {
            setLoadError('Missing iframe window');
            return;
          }

          const bridge = createLegacyBridge(iframeWindow);
          if (!bridge) {
            setLoadError('SillyTavern context unavailable');
            return;
          }

          setLoadError('');
          setLegacyBridge(bridge);
        }}
      />
    </main>
  );
}
