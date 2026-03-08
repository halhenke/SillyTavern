import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CharacterProfile, ChatMessageSummary, SessionCatalog, ShellPreferences, ShellSnapshot } from '../../core/contracts';
import { LegacyBridge, createLegacyBridge } from '../../legacy/bridge';

const DEFAULT_PREFERENCES: ShellPreferences = {
  autoScrollChatToBottom: false,
  autoContinueAllowChatCompletions: false,
  autoContinueEnabled: false,
  autoContinueTargetLength: 400,
  collapseNewlines: false,
  compactInputArea: false,
  consoleLogPrompts: false,
  continueOnSend: false,
  quickContinue: false,
  quickImpersonate: false,
  requestTokenProbabilities: false,
  restoreUserInput: false,
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

const DEFAULT_MESSAGES: ChatMessageSummary[] = [];

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

const GENERATION_CONTROLS: Array<{
  key: keyof ShellPreferences;
  label: string;
  description: string;
}> = [
  {
    key: 'autoContinueEnabled',
    label: 'Auto-continue',
    description: 'Allow the runtime to continue long replies automatically.',
  },
  {
    key: 'autoContinueAllowChatCompletions',
    label: 'Chat completion auto-continue',
    description: 'Permit auto-continue on chat-completion providers.',
  },
  {
    key: 'continueOnSend',
    label: 'Continue on send',
    description: 'Treat send actions as continuation when appropriate.',
  },
  {
    key: 'quickContinue',
    label: 'Quick continue',
    description: 'Keep continuation controls close to the main send workflow.',
  },
  {
    key: 'quickImpersonate',
    label: 'Quick impersonate',
    description: 'Expose fast impersonation entry points in the composer flow.',
  },
  {
    key: 'consoleLogPrompts',
    label: 'Console log prompts',
    description: 'Emit final prompts to the browser console for debugging.',
  },
  {
    key: 'requestTokenProbabilities',
    label: 'Token probabilities',
    description: 'Request token probability data when the provider supports it.',
  },
];

const WORKFLOW_CONTROLS: Array<{
  key: keyof ShellPreferences;
  label: string;
  description: string;
}> = [
  {
    key: 'compactInputArea',
    label: 'Compact input area',
    description: 'Prefer a tighter composer layout in the legacy runtime.',
  },
  {
    key: 'restoreUserInput',
    label: 'Restore draft input',
    description: 'Bring unfinished user input back when the session reloads.',
  },
];

export function ShellPage() {
  const [legacyBridge, setLegacyBridge] = useState<LegacyBridge | null>(null);
  const [snapshot, setSnapshot] = useState<ShellSnapshot>(DEFAULT_SNAPSHOT);
  const [catalog, setCatalog] = useState<SessionCatalog>(DEFAULT_CATALOG);
  const [characterProfile, setCharacterProfile] = useState<CharacterProfile | null>(null);
  const [characterDraft, setCharacterDraft] = useState<CharacterProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessageSummary[]>(DEFAULT_MESSAGES);
  const [chatScenarioDraft, setChatScenarioDraft] = useState('');
  const [composerText, setComposerText] = useState('');
  const [systemNoteDraft, setSystemNoteDraft] = useState('');
  const [sessionQuery, setSessionQuery] = useState('');
  const [chatNameDraft, setChatNameDraft] = useState('');
  const [quietPrompt, setQuietPrompt] = useState('');
  const [quietPromptResult, setQuietPromptResult] = useState('');
  const [quietPromptLength, setQuietPromptLength] = useState(350);
  const [quietToLoud, setQuietToLoud] = useState(false);
  const [trimQuietPrompt, setTrimQuietPrompt] = useState(true);
  const [loadError, setLoadError] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [busyAction, setBusyAction] = useState('');
  const legacySource = useMemo(() => `/legacy${window.location.search}`, []);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const refreshRuntime = useCallback((bridge: LegacyBridge | null) => {
    if (!bridge) {
      setSnapshot(DEFAULT_SNAPSHOT);
      setCatalog(DEFAULT_CATALOG);
      setMessages(DEFAULT_MESSAGES);
      return;
    }

    setSnapshot(bridge.settings.getShellSnapshot());
    setCatalog(bridge.session.getCatalog());
    setMessages(bridge.chat.getMessages());
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

  useEffect(() => {
    setChatNameDraft(snapshot.currentChatId ?? '');
  }, [snapshot.currentChatId]);

  useEffect(() => {
    if (!legacyBridge) {
      setChatScenarioDraft('');
      return;
    }

    setChatScenarioDraft(legacyBridge.chat.getMetadata().scenario);
  }, [legacyBridge, snapshot.currentChatId]);

  useEffect(() => {
    let mounted = true;

    async function loadCharacterProfile() {
      if (!legacyBridge || snapshot.characterId === undefined) {
        if (mounted) {
          setCharacterProfile(null);
          setCharacterDraft(null);
        }
        return;
      }

      const profile = await legacyBridge.character.getSelectedProfile();
      if (!mounted) {
        return;
      }

      setCharacterProfile(profile);
      setCharacterDraft(profile);
    }

    void loadCharacterProfile();

    return () => {
      mounted = false;
    };
  }, [legacyBridge, snapshot.characterId]);

  useEffect(() => {
    if (!snapshot.preferences.autoScrollChatToBottom) {
      return;
    }

    const element = transcriptRef.current;
    if (!element) {
      return;
    }

    element.scrollTop = element.scrollHeight;
  }, [messages, snapshot.preferences.autoScrollChatToBottom]);

  async function handlePreferenceChange(
    key: keyof ShellPreferences,
    value: ShellPreferences[keyof ShellPreferences],
  ) {
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

  function renderToggleGroup(
    title: string,
    controls: Array<{ key: keyof ShellPreferences; label: string; description: string }>,
  ) {
    return (
      <section className="st-shell-settings-group">
        <div className="st-shell-settings-group__header">
          <h3>{title}</h3>
        </div>
        <div className="st-shell-toggles">
          {controls.map((control) => (
            <label className="st-shell-toggle" key={control.key}>
              <span>
                <strong>{control.label}</strong>
                <small>{control.description}</small>
              </span>
              <input
                checked={Boolean(snapshot.preferences[control.key])}
                disabled={!legacyBridge || isSaving}
                type="checkbox"
                onChange={(event) => void handlePreferenceChange(control.key, event.target.checked)}
              />
            </label>
          ))}
        </div>
      </section>
    );
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

  async function handleQuietPromptRun() {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    const prompt = quietPrompt.trim();
    if (!prompt) {
      setActionError('Quiet prompt text is required');
      return;
    }

    setActionError('');
    setBusyAction('quiet-prompt');

    try {
      const result = await bridge.generation.generateQuietPrompt({
        prompt,
        quietToLoud,
        responseLength: quietPromptLength,
        trimToSentence: trimQuietPrompt,
      });
      setQuietPromptResult(result);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not run quiet prompt');
    } finally {
      setBusyAction('');
    }
  }

  const characterIsDirty = useMemo(() => {
    if (!characterProfile || !characterDraft) {
      return false;
    }

    return JSON.stringify(characterProfile) !== JSON.stringify(characterDraft);
  }, [characterDraft, characterProfile]);

  const metadataIsDirty = useMemo(() => {
    if (!legacyBridge) {
      return false;
    }

    return chatScenarioDraft !== legacyBridge.chat.getMetadata().scenario;
  }, [chatScenarioDraft, legacyBridge, snapshot.currentChatId]);

  const transcriptMessages = useMemo(() => messages.slice(-80), [messages]);

  async function handleCharacterSave() {
    const bridge = legacyBridge;
    if (!bridge || !characterDraft) {
      return;
    }

    setActionError('');
    setBusyAction('character-save');

    try {
      await bridge.character.saveSelectedProfile(characterDraft);
      const refreshedProfile = await bridge.character.getSelectedProfile();
      setCharacterProfile(refreshedProfile);
      setCharacterDraft(refreshedProfile);
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save character');
    } finally {
      setBusyAction('');
    }
  }

  function updateCharacterDraft(next: Partial<CharacterProfile>) {
    setCharacterDraft((current) => (current ? { ...current, ...next } : current));
  }

  async function handleMetadataSave() {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    setActionError('');
    setBusyAction('metadata-save');

    try {
      await bridge.chat.saveMetadata({ scenario: chatScenarioDraft });
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save chat metadata');
    } finally {
      setBusyAction('');
    }
  }

  async function handleComposerAction(
    action: 'continue' | 'impersonate' | 'normal' | 'regenerate' | 'send' | 'send-generate',
  ) {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    setActionError('');
    setBusyAction(`composer-${action}`);

    try {
      if (action === 'send') {
        await bridge.composer.sendUserMessage(composerText);
        setComposerText('');
      } else if (action === 'send-generate') {
        await bridge.composer.sendAndGenerate(composerText);
        setComposerText('');
      } else {
        await bridge.composer.triggerGeneration(action);
      }

      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not run composer action');
    } finally {
      setBusyAction('');
    }
  }

  async function handleDeleteLastMessage() {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    setActionError('');
    setBusyAction('message-delete');

    try {
      await bridge.chat.deleteLastMessage();
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not delete last message');
    } finally {
      setBusyAction('');
    }
  }

  async function handleSystemNote() {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    setActionError('');
    setBusyAction('system-note');

    try {
      await bridge.chat.addSystemMessage(systemNoteDraft);
      setSystemNoteDraft('');
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not add system note');
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
            {renderToggleGroup('Message cleanup', PREFERENCE_CONTROLS)}
            {renderToggleGroup('Generation defaults', GENERATION_CONTROLS)}
            {renderToggleGroup('Workflow', WORKFLOW_CONTROLS)}
            <section className="st-shell-settings-group">
              <div className="st-shell-settings-group__header">
                <h3>Auto-continue target</h3>
                <span className="st-note">{snapshot.preferences.autoContinueTargetLength} tokens</span>
              </div>
              <label className="st-field">
                <span>Reply length target</span>
                <input
                  disabled={!legacyBridge || isSaving}
                  max={2000}
                  min={50}
                  step={10}
                  type="range"
                  value={snapshot.preferences.autoContinueTargetLength}
                  onChange={(event) =>
                    void handlePreferenceChange('autoContinueTargetLength', Number(event.target.value))
                  }
                />
              </label>
            </section>
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
            <label className="st-field st-shell-search">
              <span>Current chat name</span>
              <input
                disabled={!legacyBridge || !snapshot.currentChatId || Boolean(busyAction)}
                placeholder="No active chat"
                type="text"
                value={chatNameDraft}
                onChange={(event) => setChatNameDraft(event.target.value)}
              />
            </label>
            <nav className="st-actions">
              <button
                className="st-button st-button--ghost"
                disabled={!legacyBridge || !snapshot.currentChatId || Boolean(busyAction)}
                type="button"
                onClick={() => {
                  const bridge = legacyBridge;
                  if (!bridge) {
                    return;
                  }

                  void runSessionAction('rename-chat', () => bridge.session.renameCurrentChat(chatNameDraft));
                }}
              >
                Rename chat
              </button>
              <button
                className="st-button st-button--ghost"
                disabled={!legacyBridge || !snapshot.currentChatId || Boolean(busyAction)}
                type="button"
                onClick={() => {
                  const bridge = legacyBridge;
                  if (!bridge) {
                    return;
                  }

                  void runSessionAction('clear-chat', () => bridge.session.clearCurrentChat());
                }}
              >
                Clear current chat
              </button>
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

          <section className="st-shell-card">
            <div className="st-shell-card__header">
              <h2>Generation tools</h2>
              <span className="st-shell-badge st-shell-badge--muted">{busyAction === 'quiet-prompt' ? 'running' : 'ready'}</span>
            </div>
            <label className="st-field">
              <span>Quiet prompt</span>
              <textarea
                className="st-shell-textarea"
                disabled={!legacyBridge || Boolean(busyAction)}
                placeholder="Ask the current runtime for a hidden or utility generation."
                value={quietPrompt}
                onChange={(event) => setQuietPrompt(event.target.value)}
              />
            </label>
            <div className="st-shell-inline-fields">
              <label className="st-field">
                <span>Target length</span>
                <input
                  disabled={!legacyBridge || Boolean(busyAction)}
                  max={1200}
                  min={50}
                  step={10}
                  type="range"
                  value={quietPromptLength}
                  onChange={(event) => setQuietPromptLength(Number(event.target.value))}
                />
              </label>
              <div className="st-shell-inline-meta">
                <strong>{quietPromptLength}</strong>
                <small>tokens</small>
              </div>
            </div>
            <div className="st-shell-toggles">
              <label className="st-shell-toggle">
                <span>
                  <strong>Quiet to loud</strong>
                  <small>Allow the result to flow through the louder generation path when needed.</small>
                </span>
                <input
                  checked={quietToLoud}
                  disabled={!legacyBridge || Boolean(busyAction)}
                  type="checkbox"
                  onChange={(event) => setQuietToLoud(event.target.checked)}
                />
              </label>
              <label className="st-shell-toggle">
                <span>
                  <strong>Trim to sentence</strong>
                  <small>Cut the result back to a clean sentence ending.</small>
                </span>
                <input
                  checked={trimQuietPrompt}
                  disabled={!legacyBridge || Boolean(busyAction)}
                  type="checkbox"
                  onChange={(event) => setTrimQuietPrompt(event.target.checked)}
                />
              </label>
            </div>
            <nav className="st-actions">
              <button
                className="st-button"
                disabled={!legacyBridge || Boolean(busyAction)}
                type="button"
                onClick={() => void handleQuietPromptRun()}
              >
                Run quiet prompt
              </button>
            </nav>
            <label className="st-field">
              <span>Result</span>
              <textarea
                className="st-shell-textarea st-shell-textarea--result"
                readOnly
                value={quietPromptResult}
              />
            </label>
          </section>

          <section className="st-shell-card">
            <div className="st-shell-card__header">
              <h2>Character editor</h2>
              <span className="st-shell-badge st-shell-badge--muted">
                {characterDraft ? (characterIsDirty ? 'modified' : 'synced') : 'no character'}
              </span>
            </div>
            {characterDraft ? (
              <>
                <div className="st-shell-character-header">
                  {characterDraft.avatarUrl ? (
                    <img alt={characterDraft.name} className="st-shell-character-avatar" src={characterDraft.avatarUrl} />
                  ) : (
                    <span className="st-shell-character-avatar st-shell-avatar--fallback">{characterDraft.name.charAt(0)}</span>
                  )}
                  <div className="st-shell-character-meta">
                    <strong>{characterDraft.name}</strong>
                    <small>{characterDraft.chatId ?? 'No active chat'}</small>
                  </div>
                </div>

                <div className="st-shell-editor-grid">
                  <label className="st-field">
                    <span>Name</span>
                    <input
                      disabled={Boolean(busyAction)}
                      type="text"
                      value={characterDraft.name}
                      onChange={(event) => updateCharacterDraft({ name: event.target.value })}
                    />
                  </label>
                  <label className="st-field">
                    <span>Character version</span>
                    <input
                      disabled={Boolean(busyAction)}
                      type="text"
                      value={characterDraft.characterVersion}
                      onChange={(event) => updateCharacterDraft({ characterVersion: event.target.value })}
                    />
                  </label>
                  <label className="st-field">
                    <span>Creator</span>
                    <input
                      disabled={Boolean(busyAction)}
                      type="text"
                      value={characterDraft.creator}
                      onChange={(event) => updateCharacterDraft({ creator: event.target.value })}
                    />
                  </label>
                  <label className="st-field">
                    <span>Talkativeness</span>
                    <input
                      disabled={Boolean(busyAction)}
                      max={1}
                      min={0}
                      step={0.05}
                      type="range"
                      value={characterDraft.talkativeness}
                      onChange={(event) => updateCharacterDraft({ talkativeness: Number(event.target.value) })}
                    />
                  </label>
                </div>

                <label className="st-field">
                  <span>Description</span>
                  <textarea
                    className="st-shell-textarea"
                    disabled={Boolean(busyAction)}
                    value={characterDraft.description}
                    onChange={(event) => updateCharacterDraft({ description: event.target.value })}
                  />
                </label>
                <label className="st-field">
                  <span>Personality</span>
                  <textarea
                    className="st-shell-textarea"
                    disabled={Boolean(busyAction)}
                    value={characterDraft.personality}
                    onChange={(event) => updateCharacterDraft({ personality: event.target.value })}
                  />
                </label>
                <label className="st-field">
                  <span>Scenario</span>
                  <textarea
                    className="st-shell-textarea"
                    disabled={Boolean(busyAction)}
                    value={characterDraft.scenario}
                    onChange={(event) => updateCharacterDraft({ scenario: event.target.value })}
                  />
                </label>
                <label className="st-field">
                  <span>First message</span>
                  <textarea
                    className="st-shell-textarea"
                    disabled={Boolean(busyAction)}
                    value={characterDraft.firstMessage}
                    onChange={(event) => updateCharacterDraft({ firstMessage: event.target.value })}
                  />
                </label>
                <label className="st-field">
                  <span>Example messages</span>
                  <textarea
                    className="st-shell-textarea st-shell-textarea--result"
                    disabled={Boolean(busyAction)}
                    value={characterDraft.mesExamples}
                    onChange={(event) => updateCharacterDraft({ mesExamples: event.target.value })}
                  />
                </label>
                <label className="st-field">
                  <span>System prompt</span>
                  <textarea
                    className="st-shell-textarea"
                    disabled={Boolean(busyAction)}
                    value={characterDraft.systemPrompt}
                    onChange={(event) => updateCharacterDraft({ systemPrompt: event.target.value })}
                  />
                </label>
                <label className="st-field">
                  <span>Post-history instructions</span>
                  <textarea
                    className="st-shell-textarea"
                    disabled={Boolean(busyAction)}
                    value={characterDraft.postHistoryInstructions}
                    onChange={(event) => updateCharacterDraft({ postHistoryInstructions: event.target.value })}
                  />
                </label>
                <label className="st-field">
                  <span>Creator notes</span>
                  <textarea
                    className="st-shell-textarea"
                    disabled={Boolean(busyAction)}
                    value={characterDraft.creatorNotes}
                    onChange={(event) => updateCharacterDraft({ creatorNotes: event.target.value })}
                  />
                </label>
                <label className="st-field">
                  <span>Tags</span>
                  <input
                    disabled={Boolean(busyAction)}
                    type="text"
                    value={characterDraft.tags.join(', ')}
                    onChange={(event) =>
                      updateCharacterDraft({
                        tags: event.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </label>
                <nav className="st-actions">
                  <button
                    className="st-button"
                    disabled={!characterIsDirty || Boolean(busyAction)}
                    type="button"
                    onClick={() => void handleCharacterSave()}
                  >
                    Save character
                  </button>
                  <button
                    className="st-button st-button--ghost"
                    disabled={!characterProfile || Boolean(busyAction)}
                    type="button"
                    onClick={() => setCharacterDraft(characterProfile)}
                  >
                    Reset draft
                  </button>
                </nav>
              </>
            ) : (
              <p className="st-note">Select a character to inspect or edit its core card fields.</p>
            )}
          </section>
        </aside>

        <section className="st-shell-runtime">
          <section className="st-shell-chat-surface">
            <div className="st-shell-card__header">
              <div>
                <h2>React chat workspace</h2>
                <p className="st-note">This replaces the primary runtime area. The legacy app remains available below for fallback and parity checks.</p>
              </div>
              <span className="st-shell-badge st-shell-badge--muted">
                {busyAction.startsWith('composer-') ? 'generating' : `${messages.length} messages`}
              </span>
            </div>

            <div className="st-shell-chat-toolbar">
              <span className="st-shell-history-role st-shell-history-role--user">{snapshot.userName ?? 'user'}</span>
              <span className="st-shell-history-role">{snapshot.characterName ?? 'assistant'}</span>
              <span className="st-shell-history-role st-shell-history-role--system">{snapshot.mainApi ?? 'api'}</span>
              <small>{snapshot.currentChatId ?? 'no active chat'}</small>
            </div>

            {actionError ? <p className="st-error">{actionError}</p> : null}

            <div className="st-shell-chat-layout">
              <div className="st-shell-chat-main">
                <div className="st-shell-transcript" ref={transcriptRef}>
                  {transcriptMessages.length ? (
                    transcriptMessages.map((message) => (
                      <article
                        className={`st-shell-message${
                          message.isUser ? ' st-shell-message--user' : message.isSystem ? ' st-shell-message--system' : ''
                        }`}
                        key={message.id}
                      >
                        <div className="st-shell-message__header">
                          <span
                            className={`st-shell-history-role${
                              message.isUser ? ' st-shell-history-role--user' : message.isSystem ? ' st-shell-history-role--system' : ''
                            }`}
                          >
                            {message.isUser ? 'user' : message.isSystem ? 'system' : 'assistant'}
                          </span>
                          <strong>{message.name}</strong>
                          <small>
                            #{message.id}
                            {message.tokenCount !== undefined ? ` · ${message.tokenCount}t` : ''}
                            {message.timestamp ? ` · ${message.timestamp}` : ''}
                          </small>
                        </div>
                        <p>{message.text || '(empty message)'}</p>
                      </article>
                    ))
                  ) : (
                    <p className="st-note">No messages in the active chat.</p>
                  )}
                </div>

                <section className="st-shell-composer-surface">
                  <div className="st-shell-card__header">
                    <h3>Composer</h3>
                    <span className="st-shell-badge st-shell-badge--muted">
                      {busyAction.startsWith('composer-') ? 'running' : 'ready'}
                    </span>
                  </div>
                  <label className="st-field">
                    <span>User message</span>
                    <textarea
                      className="st-shell-textarea"
                      disabled={!legacyBridge || Boolean(busyAction)}
                      placeholder="Write a user turn here and drive generation from React."
                      value={composerText}
                      onChange={(event) => setComposerText(event.target.value)}
                    />
                  </label>
                  <nav className="st-actions">
                    <button
                      className="st-button"
                      disabled={!legacyBridge || !composerText.trim() || Boolean(busyAction)}
                      type="button"
                      onClick={() => void handleComposerAction('send-generate')}
                    >
                      Send and generate
                    </button>
                    <button
                      className="st-button st-button--ghost"
                      disabled={!legacyBridge || !composerText.trim() || Boolean(busyAction)}
                      type="button"
                      onClick={() => void handleComposerAction('send')}
                    >
                      Send only
                    </button>
                    <button
                      className="st-button st-button--ghost"
                      disabled={!legacyBridge || Boolean(busyAction)}
                      type="button"
                      onClick={() => void handleComposerAction('continue')}
                    >
                      Continue
                    </button>
                    <button
                      className="st-button st-button--ghost"
                      disabled={!legacyBridge || Boolean(busyAction)}
                      type="button"
                      onClick={() => void handleComposerAction('impersonate')}
                    >
                      Impersonate
                    </button>
                    <button
                      className="st-button st-button--ghost"
                      disabled={!legacyBridge || Boolean(busyAction)}
                      type="button"
                      onClick={() => void handleComposerAction('regenerate')}
                    >
                      Regenerate
                    </button>
                  </nav>
                </section>
              </div>

              <aside className="st-shell-chat-rail">
                <section className="st-shell-card st-shell-card--compact">
                  <div className="st-shell-card__header">
                    <h3>History actions</h3>
                    <span className="st-shell-badge st-shell-badge--muted">safe tools</span>
                  </div>
                  <label className="st-field">
                    <span>System note</span>
                    <textarea
                      className="st-shell-textarea"
                      disabled={!legacyBridge || Boolean(busyAction)}
                      placeholder="Add a generic system note into the current chat."
                      value={systemNoteDraft}
                      onChange={(event) => setSystemNoteDraft(event.target.value)}
                    />
                  </label>
                  <nav className="st-actions">
                    <button
                      className="st-button"
                      disabled={!legacyBridge || !systemNoteDraft.trim() || Boolean(busyAction)}
                      type="button"
                      onClick={() => void handleSystemNote()}
                    >
                      Add system note
                    </button>
                    <button
                      className="st-button st-button--ghost"
                      disabled={!legacyBridge || messages.length === 0 || Boolean(busyAction)}
                      type="button"
                      onClick={() => void handleDeleteLastMessage()}
                    >
                      Delete last message
                    </button>
                  </nav>
                </section>

                <section className="st-shell-card st-shell-card--compact">
                  <div className="st-shell-card__header">
                    <h3>Chat metadata</h3>
                    <span className="st-shell-badge st-shell-badge--muted">
                      {snapshot.currentChatId ? (metadataIsDirty ? 'modified' : 'synced') : 'no chat'}
                    </span>
                  </div>
                  <label className="st-field">
                    <span>Scenario override</span>
                    <textarea
                      className="st-shell-textarea"
                      disabled={!snapshot.currentChatId || Boolean(busyAction)}
                      placeholder="Override the active chat scenario for the current session."
                      value={chatScenarioDraft}
                      onChange={(event) => setChatScenarioDraft(event.target.value)}
                    />
                  </label>
                  <nav className="st-actions">
                    <button
                      className="st-button"
                      disabled={!snapshot.currentChatId || !metadataIsDirty || Boolean(busyAction)}
                      type="button"
                      onClick={() => void handleMetadataSave()}
                    >
                      Save metadata
                    </button>
                    <button
                      className="st-button st-button--ghost"
                      disabled={!snapshot.currentChatId || Boolean(busyAction)}
                      type="button"
                      onClick={() => setChatScenarioDraft(legacyBridge?.chat.getMetadata().scenario ?? '')}
                    >
                      Reset metadata
                    </button>
                  </nav>
                </section>
              </aside>
            </div>
          </section>

          <details className="st-shell-legacy-panel">
            <summary>Legacy runtime fallback</summary>
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
          </details>
        </section>
      </section>
    </main>
  );
}
