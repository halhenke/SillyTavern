import { useCallback, useEffect, useMemo, useState } from 'react';

import { ShellPreferences, ShellSnapshot } from '../../core/contracts';
import { LegacyBridge, createLegacyBridge } from '../../legacy/bridge';

const DEFAULT_PREFERENCES: ShellPreferences = {
  autoScrollChatToBottom: false,
  collapseNewlines: false,
  messageTokenCountEnabled: false,
  trimSentences: false,
  trimSpaces: false,
};

const DEFAULT_SNAPSHOT: ShellSnapshot = {
  canSaveSettings: false,
  preferences: DEFAULT_PREFERENCES,
};

const PREFERENCE_CONTROLS: Array<{
  key: keyof ShellPreferences;
  label: string;
  description: string;
}> = [
  {
    key: 'autoScrollChatToBottom',
    label: 'Auto-scroll chat',
    description: 'Keep the viewport pinned to the latest message.',
  },
  {
    key: 'collapseNewlines',
    label: 'Collapse blank lines',
    description: 'Tighten generated text before it is shown in chat.',
  },
  {
    key: 'trimSpaces',
    label: 'Trim spaces',
    description: 'Remove stray leading and trailing whitespace in replies.',
  },
  {
    key: 'trimSentences',
    label: 'Trim sentences',
    description: 'Trim incomplete sentence fragments from generated output.',
  },
  {
    key: 'messageTokenCountEnabled',
    label: 'Token counts',
    description: 'Show per-message token counts in the legacy runtime.',
  },
];

export function ShellPage() {
  const [legacyBridge, setLegacyBridge] = useState<LegacyBridge | null>(null);
  const [snapshot, setSnapshot] = useState<ShellSnapshot>(DEFAULT_SNAPSHOT);
  const [loadError, setLoadError] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const legacySource = useMemo(() => `/legacy${window.location.search}`, []);

  const refreshSnapshot = useCallback((bridge: LegacyBridge | null) => {
    if (!bridge) {
      setSnapshot(DEFAULT_SNAPSHOT);
      return;
    }

    setSnapshot(bridge.settings.getShellSnapshot());
  }, []);

  useEffect(() => {
    refreshSnapshot(legacyBridge);

    if (!legacyBridge) {
      return;
    }

    const intervalId = window.setInterval(() => {
      refreshSnapshot(legacyBridge);
    }, 1500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [legacyBridge, refreshSnapshot]);

  const status = useMemo(() => {
    if (loadError) {
      return `Legacy runtime failed to connect: ${loadError}`;
    }

    if (legacyBridge) {
      return 'Connected to legacy runtime';
    }

    return 'Waiting for legacy runtime';
  }, [legacyBridge, loadError]);

  const statusTone = useMemo(() => {
    const onlineStatus = snapshot.onlineStatus?.toLowerCase();
    if (loadError) {
      return 'st-shell-status st-shell-status--danger';
    }
    if (onlineStatus === 'connected' || onlineStatus === 'online') {
      return 'st-shell-status st-shell-status--healthy';
    }
    return 'st-shell-status';
  }, [loadError, snapshot.onlineStatus]);

  async function handlePreferenceChange(key: keyof ShellPreferences, value: boolean) {
    if (!legacyBridge) {
      return;
    }

    setActionError('');
    setIsSaving(true);
    const nextPreferences = { ...snapshot.preferences, [key]: value };
    setSnapshot((current) => ({
      ...current,
      preferences: nextPreferences,
    }));

    try {
      await legacyBridge.settings.updateShellPreferences({ [key]: value });
      refreshSnapshot(legacyBridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update settings');
      refreshSnapshot(legacyBridge);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveNow() {
    if (!legacyBridge) {
      return;
    }

    setActionError('');
    setIsSaving(true);

    try {
      await legacyBridge.settings.saveNow();
      refreshSnapshot(legacyBridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save settings');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="st-screen st-shell">
      <header className="st-shell-header">
        <div>
          <p className="st-shell-eyebrow">React Shell</p>
          <h1>SillyTavern runtime panel</h1>
          <p className="st-note">
            The legacy application still runs in the embedded runtime. This panel is the first migrated React
            control surface on top of it.
          </p>
        </div>
        <div className={statusTone}>{status}</div>
      </header>

      <section className="st-shell-layout">
        <aside className="st-shell-sidebar">
          <section className="st-shell-card">
            <div className="st-shell-card__header">
              <h2>Runtime</h2>
              <span className="st-shell-badge">{snapshot.onlineStatus ?? 'unknown'}</span>
            </div>
            <dl className="st-shell-facts">
              <div>
                <dt>API</dt>
                <dd>{snapshot.mainApi ?? 'unavailable'}</dd>
              </div>
              <div>
                <dt>User</dt>
                <dd>{snapshot.userName ?? 'unavailable'}</dd>
              </div>
              <div>
                <dt>Character</dt>
                <dd>{snapshot.characterName ?? 'none selected'}</dd>
              </div>
              <div>
                <dt>Character ID</dt>
                <dd>{snapshot.characterId ?? 'n/a'}</dd>
              </div>
              <div>
                <dt>Group ID</dt>
                <dd>{snapshot.groupId ?? 'n/a'}</dd>
              </div>
              <div>
                <dt>Chat</dt>
                <dd>{snapshot.currentChatId ?? 'no active chat'}</dd>
              </div>
            </dl>
          </section>

          <section className="st-shell-card">
            <div className="st-shell-card__header">
              <h2>Quick preferences</h2>
              <span className="st-shell-badge st-shell-badge--muted">{isSaving ? 'saving' : 'synced'}</span>
            </div>
            <div className="st-shell-toggles">
              {PREFERENCE_CONTROLS.map((control) => (
                <label className="st-shell-toggle" key={control.key}>
                  <span>
                    <strong>{control.label}</strong>
                    <small>{control.description}</small>
                  </span>
                  <input
                    checked={snapshot.preferences[control.key]}
                    disabled={!legacyBridge || isSaving}
                    type="checkbox"
                    onChange={(event) => void handlePreferenceChange(control.key, event.target.checked)}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="st-shell-card">
            <div className="st-shell-card__header">
              <h2>Controls</h2>
            </div>
            <nav className="st-actions">
              <button
                className="st-button--ghost"
                disabled={!legacyBridge}
                type="button"
                onClick={() => legacyBridge?.generation.stopGeneration()}
              >
                Stop generation
              </button>
              <button
                className="st-button--ghost"
                disabled={!legacyBridge || !snapshot.canSaveSettings || isSaving}
                type="button"
                onClick={() => void handleSaveNow()}
              >
                Save settings now
              </button>
              <a href="/legacy" target="_blank" rel="noreferrer">
                Open legacy app
              </a>
              <a href="/legacy-login" target="_blank" rel="noreferrer">
                Open legacy login
              </a>
            </nav>
            {actionError ? <p className="st-error">{actionError}</p> : null}
          </section>
        </aside>

        <section className="st-shell-runtime">
          <iframe
            className="st-shell-frame"
            src={legacySource}
            title="SillyTavern Legacy Runtime"
            onLoad={(event) => {
              const iframeWindow = event.currentTarget.contentWindow;
              if (!iframeWindow) {
                setLoadError('Missing iframe window');
                setLegacyBridge(null);
                return;
              }

              const bridge = createLegacyBridge(iframeWindow);
              if (!bridge) {
                setLoadError('SillyTavern context unavailable');
                setLegacyBridge(null);
                return;
              }

              setLoadError('');
              setActionError('');
              setLegacyBridge(bridge);
              refreshSnapshot(bridge);
            }}
          />
        </section>
      </section>
    </main>
  );
}
