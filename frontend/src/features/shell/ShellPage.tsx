import { useCallback, useEffect, useMemo, useState } from 'react';

import { SessionCatalog, ShellPreferences, ShellSnapshot } from '../../core/contracts';
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

const DEFAULT_CATALOG: SessionCatalog = {
  characters: [],
  groups: [],
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
  const [catalog, setCatalog] = useState<SessionCatalog>(DEFAULT_CATALOG);
  const [sessionQuery, setSessionQuery] = useState('');
  const [loadError, setLoadError] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [busyAction, setBusyAction] = useState('');
  const legacySource = useMemo(() => `/legacy${window.location.search}`, []);

  const refreshRuntime = useCallback((bridge: LegacyBridge | null) => {
    if (!bridge) {
      setSnapshot(DEFAULT_SNAPSHOT);
      setCatalog(DEFAULT_CATALOG);
      return;
    }

    setSnapshot(bridge.settings.getShellSnapshot());
    setCatalog(bridge.session.getCatalog());
  }, []);

  useEffect(() => {
    refreshRuntime(legacyBridge);

    if (!legacyBridge) {
      return;
    }

    const intervalId = window.setInterval(() => {
      refreshRuntime(legacyBridge);
    }, 1500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [legacyBridge, refreshRuntime]);

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

  const filteredCatalog = useMemo(() => {
    const query = sessionQuery.trim().toLowerCase();
    if (!query) {
      return catalog;
    }

    return {
      characters: catalog.characters.filter((character) => {
        const haystack = `${character.name} ${character.chatId ?? ''}`.toLowerCase();
        return haystack.includes(query);
      }),
      groups: catalog.groups.filter((group) => {
        const haystack = `${group.name} ${group.id} ${group.chatId ?? ''}`.toLowerCase();
        return haystack.includes(query);
      }),
    };
  }, [catalog, sessionQuery]);

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
      refreshRuntime(legacyBridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update settings');
      refreshRuntime(legacyBridge);
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
      refreshRuntime(legacyBridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save settings');
    } finally {
      setIsSaving(false);
    }
  }

  async function runSessionAction(label: string, action: () => Promise<void>) {
    if (!legacyBridge) {
      return;
    }

    setActionError('');
    setBusyAction(label);

    try {
      await action();
      refreshRuntime(legacyBridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update session');
    } finally {
      setBusyAction('');
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
              <h2>Session switcher</h2>
              <span className="st-shell-badge st-shell-badge--muted">
                {filteredCatalog.characters.length} chars / {filteredCatalog.groups.length} groups
              </span>
            </div>
            <label className="st-field st-shell-search">
              <span>Filter characters and groups</span>
              <input
                placeholder="Search by name, id, or chat"
                type="text"
                value={sessionQuery}
                onChange={(event) => setSessionQuery(event.target.value)}
              />
            </label>

            <div className="st-shell-session-grid">
              <div className="st-shell-session-column">
                <div className="st-shell-session-heading">
                  <h3>Characters</h3>
                  <button
                    className="st-button st-button--ghost"
                    disabled={!legacyBridge || Boolean(busyAction)}
                    type="button"
                    onClick={() => {
                      const bridge = legacyBridge;
                      if (!bridge) {
                        return;
                      }

                      void runSessionAction('reload-chat', () => bridge.session.reloadCurrentChat());
                    }}
                  >
                    Reload chat
                  </button>
                </div>
                <div className="st-shell-session-list">
                  {filteredCatalog.characters.length ? (
                    filteredCatalog.characters.map((character) => (
                      <button
                        className={`st-shell-session-item${character.isSelected ? ' st-shell-session-item--active' : ''}`}
                        disabled={!legacyBridge || Boolean(busyAction)}
                        key={character.id}
                        type="button"
                        onClick={() => {
                          const bridge = legacyBridge;
                          if (!bridge) {
                            return;
                          }

                          void runSessionAction(`character-${character.id}`, () =>
                            bridge.session.selectCharacter(character.id),
                          );
                        }}
                      >
                        {character.avatarUrl ? (
                          <img alt={character.name} className="st-shell-avatar" src={character.avatarUrl} />
                        ) : (
                          <span className="st-shell-avatar st-shell-avatar--fallback">{character.name.charAt(0)}</span>
                        )}
                        <span>
                          <strong>{character.name}</strong>
                          <small>{character.chatId ?? 'No chat yet'}</small>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="st-note">No matching characters.</p>
                  )}
                </div>
              </div>

              <div className="st-shell-session-column">
                <div className="st-shell-session-heading">
                  <h3>Groups</h3>
                  <span className="st-note">Switch into an existing group chat.</span>
                </div>
                <div className="st-shell-session-list">
                  {filteredCatalog.groups.length ? (
                    filteredCatalog.groups.map((group) => (
                      <button
                        className={`st-shell-session-item${group.isSelected ? ' st-shell-session-item--active' : ''}`}
                        disabled={!legacyBridge || Boolean(busyAction)}
                        key={group.id}
                        type="button"
                        onClick={() => {
                          const bridge = legacyBridge;
                          if (!bridge) {
                            return;
                          }

                          void runSessionAction(`group-${group.id}`, () =>
                            bridge.session.openGroup(group.id, group.chatId),
                          );
                        }}
                      >
                        <span className="st-shell-avatar st-shell-avatar--fallback">{group.name.charAt(0)}</span>
                        <span>
                          <strong>{group.name}</strong>
                          <small>
                            {group.memberCount} members · {group.chatId ?? group.id}
                          </small>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="st-note">No matching groups.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="st-shell-card">
            <div className="st-shell-card__header">
              <h2>Controls</h2>
            </div>
            <nav className="st-actions">
              <button
                className="st-button st-button--ghost"
                disabled={!legacyBridge || Boolean(busyAction)}
                type="button"
                onClick={() => legacyBridge?.generation.stopGeneration()}
              >
                Stop generation
              </button>
              <button
                className="st-button st-button--ghost"
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
                refreshRuntime(bridge);
              }}
            />
          </section>
      </section>
    </main>
  );
}
