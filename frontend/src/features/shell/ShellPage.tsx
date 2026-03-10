import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  CharacterCreateDraft,
  CharacterProfile,
  ChatMessageSummary,
  ConnectionApiOption,
  ConnectionProfileDraft,
  ConnectionProfileSummary,
  GroupCreateDraft,
  GroupProfile,
  InstalledExtensionSummary,
  PromptTemplate,
  SessionCatalog,
  SessionChatSummary,
  ShellPreferences,
  ShellSnapshot,
  WorldInfoCatalog,
} from '../../core/contracts';
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
const DEFAULT_CONNECTION_PROFILES: ConnectionProfileSummary[] = [];
const DEFAULT_CONNECTION_API_OPTIONS: ConnectionApiOption[] = [];
const DEFAULT_CONNECTION_PROFILE_DRAFT: ConnectionProfileDraft = {
  api: '',
  apiUrl: '',
  model: '',
  name: '',
  preset: '',
};
const DEFAULT_NEW_CHARACTER_DRAFT: CharacterCreateDraft = {
  characterVersion: '',
  creator: '',
  creatorNotes: '',
  description: '',
  firstMessage: '',
  mesExamples: '',
  name: '',
  personality: '',
  postHistoryInstructions: '',
  scenario: '',
  systemPrompt: '',
  tags: [],
  talkativeness: 0.5,
};
const DEFAULT_NEW_GROUP_DRAFT: GroupCreateDraft = {
  activationStrategy: 0,
  allowSelfResponses: false,
  autoModeDelay: 5,
  favorite: false,
  generationMode: 0,
  hideMutedSprites: false,
  memberAvatarFiles: [],
  name: '',
};
const DEFAULT_WORLD_INFO_CATALOG: WorldInfoCatalog = {
  names: [],
  selectedNames: [],
};
const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [];
const DEFAULT_INSTALLED_EXTENSIONS: InstalledExtensionSummary[] = [];

type WorldInfoEntry = {
  comment: string;
  constant: boolean;
  content: string;
  disable: boolean;
  displayIndex?: number;
  key: string[];
  keysecondary: string[];
  order: number;
  position: number;
  selective: boolean;
  uid: number;
} & Record<string, unknown>;

type WorldInfoData = {
  entries: Record<string, WorldInfoEntry>;
} & Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeWorldInfoEntry(rawEntry: unknown, fallbackUid: number): WorldInfoEntry {
  const source = isRecord(rawEntry) ? rawEntry : {};
  return {
    ...source,
    comment: typeof source.comment === 'string' ? source.comment : '',
    constant: Boolean(source.constant),
    content: typeof source.content === 'string' ? source.content : '',
    disable: Boolean(source.disable),
    displayIndex: Number.isFinite(source.displayIndex) ? Number(source.displayIndex) : undefined,
    key: Array.isArray(source.key) ? source.key.map((value) => String(value)) : [],
    keysecondary: Array.isArray(source.keysecondary) ? source.keysecondary.map((value) => String(value)) : [],
    order: Number.isFinite(source.order) ? Number(source.order) : 100,
    position: Number.isFinite(source.position) ? Number(source.position) : 0,
    selective: source.selective === undefined ? true : Boolean(source.selective),
    uid: Number.isFinite(source.uid) ? Number(source.uid) : fallbackUid,
  };
}

function parseWorldInfoData(source: string): { data: WorldInfoData; entries: WorldInfoEntry[] } | null {
  if (!source.trim()) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return null;
  }

  if (!isRecord(parsed) || !isRecord(parsed.entries)) {
    return null;
  }

  const entries = Object.entries(parsed.entries)
    .map(([uid, entry]) => normalizeWorldInfoEntry(entry, Number(uid)))
    .sort((left, right) => {
      const leftIndex = left.displayIndex ?? left.uid;
      const rightIndex = right.displayIndex ?? right.uid;
      return leftIndex - rightIndex || left.uid - right.uid;
    });

  return {
    data: parsed as WorldInfoData,
    entries,
  };
}

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
  const [newCharacterDraft, setNewCharacterDraft] = useState<CharacterCreateDraft>(DEFAULT_NEW_CHARACTER_DRAFT);
  const [groupProfile, setGroupProfile] = useState<GroupProfile | null>(null);
  const [groupDraft, setGroupDraft] = useState<GroupProfile | null>(null);
  const [newGroupDraft, setNewGroupDraft] = useState<GroupCreateDraft>(DEFAULT_NEW_GROUP_DRAFT);
  const [worldInfoCatalog, setWorldInfoCatalog] = useState<WorldInfoCatalog>(DEFAULT_WORLD_INFO_CATALOG);
  const [activeWorldInfoName, setActiveWorldInfoName] = useState('');
  const [activeWorldInfoEntryId, setActiveWorldInfoEntryId] = useState('');
  const [worldInfoSource, setWorldInfoSource] = useState('');
  const [worldInfoDraft, setWorldInfoDraft] = useState('');
  const [worldInfoLoading, setWorldInfoLoading] = useState(false);
  const [newWorldInfoName, setNewWorldInfoName] = useState('');
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>(DEFAULT_PROMPT_TEMPLATES);
  const [activePromptId, setActivePromptId] = useState('');
  const [promptDraft, setPromptDraft] = useState<PromptTemplate | null>(null);
  const [installedExtensions, setInstalledExtensions] = useState<InstalledExtensionSummary[]>(DEFAULT_INSTALLED_EXTENSIONS);
  const [connectionProfiles, setConnectionProfiles] = useState<ConnectionProfileSummary[]>(DEFAULT_CONNECTION_PROFILES);
  const [connectionApiOptions, setConnectionApiOptions] = useState<ConnectionApiOption[]>(DEFAULT_CONNECTION_API_OPTIONS);
  const [connectionDraft, setConnectionDraft] = useState<ConnectionProfileDraft>(DEFAULT_CONNECTION_PROFILE_DRAFT);
  const [extensionReloadRequired, setExtensionReloadRequired] = useState(false);
  const [messages, setMessages] = useState<ChatMessageSummary[]>(DEFAULT_MESSAGES);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [messageEditDraft, setMessageEditDraft] = useState('');
  const [sessionHistory, setSessionHistory] = useState<SessionChatSummary[]>([]);
  const [sessionHistoryQuery, setSessionHistoryQuery] = useState('');
  const [sessionHistoryRenameDraft, setSessionHistoryRenameDraft] = useState('');
  const [sessionHistoryRenameTarget, setSessionHistoryRenameTarget] = useState<string | null>(null);
  const [sessionHistoryLoading, setSessionHistoryLoading] = useState(false);
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
  const [showLegacyFallback, setShowLegacyFallback] = useState(false);
  const legacySource = useMemo(() => `/legacy${window.location.search}`, []);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const refreshRuntime = useCallback((bridge: LegacyBridge | null) => {
    if (!bridge) {
      setSnapshot(DEFAULT_SNAPSHOT);
      setCatalog(DEFAULT_CATALOG);
      setConnectionProfiles(DEFAULT_CONNECTION_PROFILES);
      setConnectionApiOptions(DEFAULT_CONNECTION_API_OPTIONS);
      setMessages(DEFAULT_MESSAGES);
      return;
    }

    setSnapshot(bridge.settings.getShellSnapshot());
    setCatalog(bridge.session.getCatalog());
    setConnectionProfiles(bridge.connections.listProfiles());
    setConnectionApiOptions(bridge.connections.listApiOptions());
    setMessages(bridge.chat.getMessages());
  }, []);

  const refreshSessionHistory = useCallback(async (bridge: LegacyBridge | null, query: string) => {
    if (!bridge) {
      setSessionHistory([]);
      return;
    }

    setSessionHistoryLoading(true);
    try {
      const nextHistory = await bridge.session.getSessionHistory(query);
      setSessionHistory(nextHistory);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not load session history');
    } finally {
      setSessionHistoryLoading(false);
    }
  }, []);

  const refreshWorldInfoCatalog = useCallback((bridge: LegacyBridge | null) => {
    if (!bridge) {
      setWorldInfoCatalog(DEFAULT_WORLD_INFO_CATALOG);
      return;
    }

    setWorldInfoCatalog(bridge.worldInfo.listBooks());
  }, []);

  const refreshPromptTemplates = useCallback((bridge: LegacyBridge | null) => {
    if (!bridge) {
      setPromptTemplates(DEFAULT_PROMPT_TEMPLATES);
      return;
    }

    setPromptTemplates(bridge.prompts.listPrompts());
  }, []);

  const refreshInstalledExtensions = useCallback(async (bridge: LegacyBridge | null) => {
    if (!bridge) {
      setInstalledExtensions(DEFAULT_INSTALLED_EXTENSIONS);
      return;
    }

    const extensions = await bridge.extensions.listInstalledExtensions();
    setInstalledExtensions(extensions);
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

  useEffect(() => {
    refreshWorldInfoCatalog(legacyBridge);
  }, [legacyBridge, refreshWorldInfoCatalog]);

  useEffect(() => {
    refreshPromptTemplates(legacyBridge);
  }, [legacyBridge, refreshPromptTemplates, snapshot.characterId, snapshot.groupId]);

  useEffect(() => {
    void refreshInstalledExtensions(legacyBridge);
  }, [legacyBridge, refreshInstalledExtensions]);

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

  const groupMemberOptions = useMemo(
    () => catalog.characters.filter((character) => Boolean(character.avatarFile)),
    [catalog.characters],
  );
  const selectedConnectionProfile = useMemo(
    () => connectionProfiles.find((profile) => profile.isSelected) ?? null,
    [connectionProfiles],
  );
  const parsedWorldInfo = useMemo(() => parseWorldInfoData(worldInfoDraft), [worldInfoDraft]);
  const structuredWorldInfoEntries = useMemo(() => parsedWorldInfo?.entries ?? [], [parsedWorldInfo]);
  const activeWorldInfoEntry = useMemo(
    () => structuredWorldInfoEntries.find((entry) => String(entry.uid) === activeWorldInfoEntryId) ?? null,
    [activeWorldInfoEntryId, structuredWorldInfoEntries],
  );

  useEffect(() => {
    setChatNameDraft(snapshot.currentChatId ?? '');
  }, [snapshot.currentChatId]);

  useEffect(() => {
    if (selectedConnectionProfile) {
      setConnectionDraft({
        api: selectedConnectionProfile.api ?? '',
        apiUrl: selectedConnectionProfile.apiUrl ?? '',
        id: selectedConnectionProfile.id,
        model: selectedConnectionProfile.model ?? '',
        name: selectedConnectionProfile.name,
        preset: selectedConnectionProfile.preset ?? '',
      });
      return;
    }

    setConnectionDraft((current) => (current.id ? DEFAULT_CONNECTION_PROFILE_DRAFT : current));
  }, [selectedConnectionProfile]);

  useEffect(() => {
    if (!legacyBridge) {
      setChatScenarioDraft('');
      return;
    }

    setChatScenarioDraft(legacyBridge.chat.getMetadata().scenario);
  }, [legacyBridge, snapshot.currentChatId]);

  useEffect(() => {
    if (!legacyBridge) {
      setSessionHistory([]);
      return;
    }

    void refreshSessionHistory(legacyBridge, sessionHistoryQuery);
  }, [
    legacyBridge,
    refreshSessionHistory,
    sessionHistoryQuery,
    snapshot.characterId,
    snapshot.currentChatId,
    snapshot.groupId,
  ]);

  useEffect(() => {
    if (activeWorldInfoName && !worldInfoCatalog.names.includes(activeWorldInfoName)) {
      setActiveWorldInfoName('');
      setActiveWorldInfoEntryId('');
      setWorldInfoSource('');
      setWorldInfoDraft('');
    }
  }, [activeWorldInfoName, worldInfoCatalog.names]);

  useEffect(() => {
    if (!structuredWorldInfoEntries.length) {
      setActiveWorldInfoEntryId('');
      return;
    }

    const nextEntry = structuredWorldInfoEntries.find((entry) => String(entry.uid) === activeWorldInfoEntryId) ?? structuredWorldInfoEntries[0];
    if (!nextEntry) {
      setActiveWorldInfoEntryId('');
      return;
    }

    setActiveWorldInfoEntryId(String(nextEntry.uid));
  }, [activeWorldInfoEntryId, structuredWorldInfoEntries]);

  useEffect(() => {
    if (!promptTemplates.length) {
      setActivePromptId('');
      setPromptDraft(null);
      return;
    }

    const activePrompt = promptTemplates.find((prompt) => prompt.identifier === activePromptId) ?? promptTemplates[0] ?? null;
    if (!activePrompt) {
      setActivePromptId('');
      setPromptDraft(null);
      return;
    }

    setActivePromptId(activePrompt.identifier);
    setPromptDraft(activePrompt);
  }, [activePromptId, promptTemplates]);

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
    let mounted = true;

    async function loadGroupProfile() {
      if (!legacyBridge || !snapshot.groupId) {
        if (mounted) {
          setGroupProfile(null);
          setGroupDraft(null);
        }
        return;
      }

      const profile = await legacyBridge.group.getSelectedProfile();
      if (!mounted) {
        return;
      }

      setGroupProfile(profile);
      setGroupDraft(profile);
    }

    void loadGroupProfile();

    return () => {
      mounted = false;
    };
  }, [legacyBridge, snapshot.groupId]);

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

  useEffect(() => {
    if (!messages.length) {
      setSelectedMessageId(null);
      setMessageEditDraft('');
      return;
    }

    const selected = messages.find((message) => message.id === selectedMessageId);
    const fallback = messages[messages.length - 1];
    if (!fallback) {
      return;
    }

    const active = selected ?? fallback;
    setSelectedMessageId(active.id);
    setMessageEditDraft(active.text);
  }, [messages, selectedMessageId]);

  useEffect(() => {
    if (!showLegacyFallback) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowLegacyFallback(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLegacyFallback]);

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

  async function handleSessionHistoryOpen(fileName: string) {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    setActionError('');
    setBusyAction('history-open');

    try {
      await bridge.session.openChatFile(fileName);
      setSessionHistoryRenameTarget(null);
      refreshRuntime(bridge);
      await refreshSessionHistory(bridge, sessionHistoryQuery);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not open chat');
    } finally {
      setBusyAction('');
    }
  }

  async function handleSessionHistoryDelete(fileName: string) {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    setActionError('');
    setBusyAction('history-delete');

    try {
      await bridge.session.deleteChatFile(fileName);
      setSessionHistoryRenameTarget((current) => (current === fileName ? null : current));
      refreshRuntime(bridge);
      await refreshSessionHistory(bridge, sessionHistoryQuery);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not delete chat');
    } finally {
      setBusyAction('');
    }
  }

  async function handleSessionHistoryRenameSave() {
    const bridge = legacyBridge;
    if (!bridge || !sessionHistoryRenameTarget) {
      return;
    }

    const trimmedName = sessionHistoryRenameDraft.trim();
    if (!trimmedName) {
      setActionError('Chat name is required');
      return;
    }

    setActionError('');
    setBusyAction('history-rename');

    try {
      await bridge.session.renameChatFile(sessionHistoryRenameTarget, trimmedName);
      setSessionHistoryRenameTarget(null);
      setSessionHistoryRenameDraft('');
      refreshRuntime(bridge);
      await refreshSessionHistory(bridge, sessionHistoryQuery);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not rename chat');
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

  const groupIsDirty = useMemo(() => {
    if (!groupProfile || !groupDraft) {
      return false;
    }

    return JSON.stringify(groupProfile) !== JSON.stringify(groupDraft);
  }, [groupDraft, groupProfile]);

  const worldInfoDirty = useMemo(
    () => Boolean(activeWorldInfoName) && worldInfoDraft !== worldInfoSource,
    [activeWorldInfoName, worldInfoDraft, worldInfoSource],
  );
  const activePrompt = useMemo(
    () => promptTemplates.find((prompt) => prompt.identifier === activePromptId) ?? null,
    [activePromptId, promptTemplates],
  );
  const activePromptIndex = useMemo(
    () => promptTemplates.findIndex((prompt) => prompt.identifier === activePromptId),
    [activePromptId, promptTemplates],
  );
  const promptDirty = useMemo(() => {
    if (!activePrompt || !promptDraft) {
      return false;
    }

    return JSON.stringify(activePrompt) !== JSON.stringify(promptDraft);
  }, [activePrompt, promptDraft]);

  const metadataIsDirty = useMemo(() => {
    if (!legacyBridge) {
      return false;
    }

    return chatScenarioDraft !== legacyBridge.chat.getMetadata().scenario;
  }, [chatScenarioDraft, legacyBridge, snapshot.currentChatId]);

  const transcriptMessages = useMemo(() => messages.slice(-80), [messages]);
  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedMessageId) ?? null,
    [messages, selectedMessageId],
  );
  const messageEditDirty = useMemo(
    () => Boolean(selectedMessage) && messageEditDraft !== (selectedMessage?.text ?? ''),
    [messageEditDraft, selectedMessage],
  );
  const selectedMessageIsLast = useMemo(
    () => Boolean(selectedMessage) && selectedMessage?.id === messages[messages.length - 1]?.id,
    [messages, selectedMessage],
  );
  const selectedMessageIsFirst = useMemo(
    () => selectedMessage?.id === 0,
    [selectedMessage],
  );
  const selectedMessageCanSwipe = useMemo(
    () => Boolean(selectedMessage) && !selectedMessage?.isUser && !selectedMessage?.isSystem && selectedMessageIsLast,
    [selectedMessage, selectedMessageIsLast],
  );
  const selectedMessageCanDeleteSwipe = useMemo(
    () => selectedMessageCanSwipe && (selectedMessage?.swipeCount ?? 0) > 1,
    [selectedMessage, selectedMessageCanSwipe],
  );

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

  function updateNewCharacterDraft(next: Partial<CharacterCreateDraft>) {
    setNewCharacterDraft((current) => ({ ...current, ...next }));
  }

  function updateGroupDraft(next: Partial<GroupProfile>) {
    setGroupDraft((current) => (current ? { ...current, ...next } : current));
  }

  function updateNewGroupDraft(next: Partial<GroupCreateDraft>) {
    setNewGroupDraft((current) => ({ ...current, ...next }));
  }

  function updateConnectionDraft(next: Partial<ConnectionProfileDraft>) {
    setConnectionDraft((current) => ({ ...current, ...next }));
  }

  function updatePromptDraft(next: Partial<PromptTemplate>) {
    setPromptDraft((current) => (current ? { ...current, ...next } : current));
  }

  async function handleConnectionProfileSave() {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    if (!connectionDraft.name.trim()) {
      setActionError('Connection profile name is required');
      return;
    }

    if (!connectionDraft.api.trim()) {
      setActionError('Connection API is required');
      return;
    }

    setActionError('');
    setBusyAction('connection-save');

    try {
      const savedProfile = await bridge.connections.saveProfile(connectionDraft);
      refreshRuntime(bridge);
      setConnectionDraft({
        api: savedProfile.api ?? '',
        apiUrl: savedProfile.apiUrl ?? '',
        id: savedProfile.id,
        model: savedProfile.model ?? '',
        name: savedProfile.name,
        preset: savedProfile.preset ?? '',
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save connection profile');
    } finally {
      setBusyAction('');
    }
  }

  async function handleConnectionProfileDelete() {
    const bridge = legacyBridge;
    if (!bridge || !connectionDraft.id) {
      return;
    }

    setActionError('');
    setBusyAction('connection-delete');

    try {
      await bridge.connections.deleteProfile(connectionDraft.id);
      setConnectionDraft(DEFAULT_CONNECTION_PROFILE_DRAFT);
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not delete connection profile');
    } finally {
      setBusyAction('');
    }
  }

  async function handleCharacterCreate() {
    const bridge = legacyBridge;
    const trimmedName = newCharacterDraft.name.trim();
    if (!bridge) {
      return;
    }

    if (!trimmedName) {
      setActionError('Character name is required');
      return;
    }

    setActionError('');
    setBusyAction('character-create');

    try {
      await bridge.character.createProfile({
        ...newCharacterDraft,
        name: trimmedName,
      });
      setNewCharacterDraft(DEFAULT_NEW_CHARACTER_DRAFT);
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not create character');
    } finally {
      setBusyAction('');
    }
  }

  async function handleGroupCreate() {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    if (!newGroupDraft.memberAvatarFiles.length) {
      setActionError('At least one group member is required');
      return;
    }

    setActionError('');
    setBusyAction('group-create');

    try {
      await bridge.group.createProfile(newGroupDraft);
      setNewGroupDraft(DEFAULT_NEW_GROUP_DRAFT);
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not create group');
    } finally {
      setBusyAction('');
    }
  }

  async function handleGroupSave() {
    const bridge = legacyBridge;
    if (!bridge || !groupDraft) {
      return;
    }

    if (!groupDraft.memberAvatarFiles.length) {
      setActionError('At least one group member is required');
      return;
    }

    setActionError('');
    setBusyAction('group-save');

    try {
      await bridge.group.saveSelectedProfile(groupDraft);
      const refreshedProfile = await bridge.group.getSelectedProfile();
      setGroupProfile(refreshedProfile);
      setGroupDraft(refreshedProfile);
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save group');
    } finally {
      setBusyAction('');
    }
  }

  async function handleWorldInfoLoad(name: string) {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    setActionError('');
    setWorldInfoLoading(true);

    try {
      const document = await bridge.worldInfo.loadBook(name);
      const nextSource = document ? JSON.stringify(document.data, null, 2) : '';
      setActiveWorldInfoName(name);
      setWorldInfoSource(nextSource);
      setWorldInfoDraft(nextSource);
      refreshWorldInfoCatalog(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not load world info');
    } finally {
      setWorldInfoLoading(false);
    }
  }

  async function handleWorldInfoCreate() {
    const bridge = legacyBridge;
    const trimmedName = newWorldInfoName.trim();
    if (!bridge) {
      return;
    }

    if (!trimmedName) {
      setActionError('World info name is required');
      return;
    }

    setActionError('');
    setBusyAction('worldinfo-create');

    try {
      await bridge.worldInfo.createBook(trimmedName);
      setNewWorldInfoName('');
      refreshWorldInfoCatalog(bridge);
      await handleWorldInfoLoad(trimmedName);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not create world info');
    } finally {
      setBusyAction('');
    }
  }

  async function handleWorldInfoSave() {
    const bridge = legacyBridge;
    if (!bridge || !activeWorldInfoName) {
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(worldInfoDraft);
    } catch {
      setActionError('World info JSON is invalid');
      return;
    }

    setActionError('');
    setBusyAction('worldinfo-save');

    try {
      await bridge.worldInfo.saveBook(activeWorldInfoName, parsed);
      const nextSource = JSON.stringify(parsed, null, 2);
      setWorldInfoSource(nextSource);
      setWorldInfoDraft(nextSource);
      refreshWorldInfoCatalog(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save world info');
    } finally {
      setBusyAction('');
    }
  }

  async function handleWorldInfoDelete(name: string) {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    setActionError('');
    setBusyAction('worldinfo-delete');

    try {
      await bridge.worldInfo.deleteBook(name);
      refreshWorldInfoCatalog(bridge);
      if (activeWorldInfoName === name) {
        setActiveWorldInfoName('');
        setActiveWorldInfoEntryId('');
        setWorldInfoSource('');
        setWorldInfoDraft('');
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not delete world info');
    } finally {
      setBusyAction('');
    }
  }

  async function handleWorldInfoSelectionToggle(name: string, checked: boolean) {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    const nextSelectedNames = checked
      ? [...worldInfoCatalog.selectedNames, name]
      : worldInfoCatalog.selectedNames.filter((item) => item !== name);

    setActionError('');
    try {
      await bridge.worldInfo.setSelectedBooks(nextSelectedNames);
      refreshWorldInfoCatalog(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update world info selection');
    }
  }

  function updateStructuredWorldInfo(mutator: (data: WorldInfoData) => void) {
    const parsed = parseWorldInfoData(worldInfoDraft);
    if (!parsed) {
      setActionError('World info JSON must be valid before using the structured editor');
      return;
    }

    const nextData = structuredClone(parsed.data);
    mutator(nextData);
    setWorldInfoDraft(JSON.stringify(nextData, null, 2));
    setActionError('');
  }

  function updateWorldInfoEntry(updates: Partial<WorldInfoEntry>) {
    if (!activeWorldInfoEntry) {
      return;
    }

    updateStructuredWorldInfo((data) => {
      const entryKey = String(activeWorldInfoEntry.uid);
      const currentEntry = normalizeWorldInfoEntry(data.entries[entryKey], activeWorldInfoEntry.uid);
      data.entries[entryKey] = {
        ...currentEntry,
        ...updates,
        uid: activeWorldInfoEntry.uid,
      };
    });
  }

  function handleWorldInfoEntryCreate() {
    updateStructuredWorldInfo((data) => {
      const existingEntries = Object.values(data.entries).map((entry) => normalizeWorldInfoEntry(entry, 0));
      const nextUid = existingEntries.length ? Math.max(...existingEntries.map((entry) => entry.uid)) + 1 : 0;
      const nextDisplayIndex = existingEntries.length
        ? Math.max(...existingEntries.map((entry) => entry.displayIndex ?? entry.uid)) + 1
        : 0;
      data.entries[String(nextUid)] = {
        comment: '',
        constant: false,
        content: '',
        disable: false,
        displayIndex: nextDisplayIndex,
        key: [],
        keysecondary: [],
        order: 100,
        position: 0,
        selective: true,
        uid: nextUid,
      };
      setActiveWorldInfoEntryId(String(nextUid));
    });
  }

  function handleWorldInfoEntryDelete(uid: number) {
    updateStructuredWorldInfo((data) => {
      delete data.entries[String(uid)];
      if (String(uid) === activeWorldInfoEntryId) {
        setActiveWorldInfoEntryId('');
      }
    });
  }

  async function handlePromptSave() {
    const bridge = legacyBridge;
    if (!bridge || !promptDraft) {
      return;
    }

    setActionError('');
    setBusyAction('prompt-save');

    try {
      await bridge.prompts.savePrompt(promptDraft);
      refreshPromptTemplates(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save prompt');
    } finally {
      setBusyAction('');
    }
  }

  async function handlePromptMove(direction: 'down' | 'up') {
    const bridge = legacyBridge;
    if (!bridge || !activePrompt) {
      return;
    }

    setActionError('');
    setBusyAction(`prompt-move-${direction}`);

    try {
      await bridge.prompts.movePrompt(activePrompt.identifier, direction);
      refreshPromptTemplates(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not reorder prompt');
    } finally {
      setBusyAction('');
    }
  }

  async function handleExtensionToggle(name: string, enabled: boolean) {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    setActionError('');
    setBusyAction(`extension-toggle:${name}`);

    try {
      await bridge.extensions.setExtensionEnabled(name, enabled);
      setExtensionReloadRequired(true);
      await refreshInstalledExtensions(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update extension');
    } finally {
      setBusyAction('');
    }
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

  async function handleMessageDuplicate() {
    const bridge = legacyBridge;
    if (!bridge || selectedMessageId === null) {
      return;
    }

    setActionError('');
    setBusyAction('message-duplicate');

    try {
      await bridge.chat.duplicateMessage(selectedMessageId);
      setSelectedMessageId(selectedMessageId + 1);
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not duplicate message');
    } finally {
      setBusyAction('');
    }
  }

  async function handleMessageDelete() {
    const bridge = legacyBridge;
    if (!bridge || selectedMessageId === null) {
      return;
    }

    setActionError('');
    setBusyAction('message-delete-selected');

    try {
      await bridge.chat.deleteMessage(selectedMessageId);
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not delete message');
    } finally {
      setBusyAction('');
    }
  }

  async function handleMessageMove(direction: 'down' | 'up') {
    const bridge = legacyBridge;
    if (!bridge || selectedMessageId === null) {
      return;
    }

    setActionError('');
    setBusyAction(`message-move-${direction}`);

    try {
      await bridge.chat.moveMessage(selectedMessageId, direction);
      setSelectedMessageId(direction === 'up' ? selectedMessageId - 1 : selectedMessageId + 1);
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not move message');
    } finally {
      setBusyAction('');
    }
  }

  async function handleMessageEditSave() {
    const bridge = legacyBridge;
    if (!bridge || selectedMessageId === null) {
      return;
    }

    setActionError('');
    setBusyAction('message-edit');

    try {
      await bridge.chat.updateMessage(selectedMessageId, messageEditDraft);
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save message');
    } finally {
      setBusyAction('');
    }
  }

  async function handleSwipe(direction: 'left' | 'right') {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    setActionError('');
    setBusyAction(`message-swipe-${direction}`);

    try {
      await bridge.chat.swipeLastMessage(direction);
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not change swipe');
    } finally {
      setBusyAction('');
    }
  }

  async function handleDeleteSwipe() {
    const bridge = legacyBridge;
    if (!bridge) {
      return;
    }

    setActionError('');
    setBusyAction('message-delete-swipe');

    try {
      await bridge.chat.deleteCurrentSwipe();
      refreshRuntime(bridge);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not delete swipe');
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
      <iframe
        className="st-shell-bridge-frame"
        src={legacySource}
        title="SillyTavern Legacy Bridge Runtime"
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

      <header className="st-shell-header">
        <div>
          <p className="st-shell-eyebrow">React Shell</p>
          <h1>SillyTavern runtime panel</h1>
          <p className="st-note">
            The legacy application still runs in the embedded runtime. This panel is the first migrated React
            control surface on top of it.
          </p>
        </div>
        <div className="st-shell-header-actions">
          <div className={statusTone}>{status}</div>
          <button
            className="st-button st-button--ghost"
            type="button"
            onClick={() => setShowLegacyFallback(true)}
          >
            Open legacy tools
          </button>
        </div>
      </header>

      <section className="st-shell-layout">
        <aside className="st-shell-sidebar">
          <section className="st-shell-card st-shell-card--connection">
            <div className="st-shell-card__header">
              <h2>Connection</h2>
              <span className={`st-shell-badge${snapshot.onlineStatus ? '' : ' st-shell-badge--muted'}`}>
                {snapshot.onlineStatus ?? 'unknown'}
              </span>
            </div>
            <p className="st-note st-shell-connection-summary">
              Connection setup should be available above the fold. The React shell now surfaces the active API and
              saved connection profiles here, while the richer editor remains in legacy tools for now.
            </p>
            <dl className="st-shell-facts">
              <div>
                <dt>Active API</dt>
                <dd>{snapshot.mainApi ?? 'unavailable'}</dd>
              </div>
              <div>
                <dt>Profile</dt>
                <dd>{selectedConnectionProfile?.name ?? snapshot.connectionProfileName ?? 'No profile selected'}</dd>
              </div>
              <div>
                <dt>Profiles</dt>
                <dd>{snapshot.connectionProfileCount ?? connectionProfiles.length}</dd>
              </div>
              <div>
                <dt>Manager</dt>
                <dd>{snapshot.connectionManagerEnabled ? 'available' : 'disabled'}</dd>
              </div>
            </dl>
            <nav className="st-actions st-shell-connection-actions">
              <button
                className="st-button"
                type="button"
                onClick={() => setShowLegacyFallback(true)}
              >
                Open connection tools
              </button>
              <a href="/legacy" target="_blank" rel="noreferrer">
                Open legacy app
              </a>
            </nav>
            {connectionProfiles.length ? (
              <div className="st-shell-connection-list">
                {connectionProfiles.map((profile) => (
                  <button
                    className={`st-shell-connection-item${profile.isSelected ? ' st-shell-connection-item--active' : ''}`}
                    disabled={!legacyBridge || Boolean(busyAction)}
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      const bridge = legacyBridge;
                      if (!bridge) {
                        return;
                      }

                      void runSessionAction(`connection-${profile.id}`, () => bridge.connections.applyProfile(profile.id));
                    }}
                  >
                    <span>
                      <strong>{profile.name}</strong>
                      <small>
                        {[profile.api, profile.model, profile.preset].filter(Boolean).join(' · ') || 'Saved profile'}
                      </small>
                    </span>
                    {profile.isSelected ? <span className="st-shell-badge">active</span> : null}
                  </button>
                ))}
              </div>
            ) : (
              <p className="st-note">
                No saved connection profiles yet. Create one below or fall back to the legacy connection manager.
              </p>
            )}
            <div className="st-shell-connection-editor">
              <div className="st-shell-card__header">
                <h3>{connectionDraft.id ? 'Edit profile' : 'New profile'}</h3>
                <nav className="st-actions">
                  <button
                    className="st-button st-button--ghost"
                    disabled={Boolean(busyAction)}
                    type="button"
                    onClick={() => setConnectionDraft(DEFAULT_CONNECTION_PROFILE_DRAFT)}
                  >
                    New draft
                  </button>
                </nav>
              </div>
              <div className="st-shell-editor-grid">
                <label className="st-field">
                  <span>Name</span>
                  <input
                    disabled={Boolean(busyAction)}
                    type="text"
                    value={connectionDraft.name}
                    onChange={(event) => updateConnectionDraft({ name: event.target.value })}
                  />
                </label>
                <label className="st-field">
                  <span>API</span>
                  <select
                    disabled={Boolean(busyAction)}
                    value={connectionDraft.api}
                    onChange={(event) => updateConnectionDraft({ api: event.target.value })}
                  >
                    <option value="">Select API</option>
                    {connectionApiOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label} ({option.kind})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="st-field">
                  <span>Server URL</span>
                  <input
                    disabled={Boolean(busyAction)}
                    placeholder="https://openrouter.ai/api/v1"
                    type="text"
                    value={connectionDraft.apiUrl}
                    onChange={(event) => updateConnectionDraft({ apiUrl: event.target.value })}
                  />
                </label>
                <label className="st-field">
                  <span>Model</span>
                  <input
                    disabled={Boolean(busyAction)}
                    placeholder="openai/gpt-4.1-mini"
                    type="text"
                    value={connectionDraft.model}
                    onChange={(event) => updateConnectionDraft({ model: event.target.value })}
                  />
                </label>
                <label className="st-field st-shell-editor-grid__wide">
                  <span>Preset</span>
                  <input
                    disabled={Boolean(busyAction)}
                    placeholder="Balanced"
                    type="text"
                    value={connectionDraft.preset}
                    onChange={(event) => updateConnectionDraft({ preset: event.target.value })}
                  />
                </label>
              </div>
              <nav className="st-actions st-shell-connection-actions">
                <button
                  className="st-button"
                  disabled={!legacyBridge || Boolean(busyAction)}
                  type="button"
                  onClick={() => void handleConnectionProfileSave()}
                >
                  {connectionDraft.id ? 'Save profile' : 'Create profile'}
                </button>
                <button
                  className="st-button st-button--ghost"
                  disabled={!legacyBridge || !connectionDraft.id || Boolean(busyAction)}
                  type="button"
                  onClick={() => void handleConnectionProfileDelete()}
                >
                  Delete profile
                </button>
              </nav>
            </div>
          </section>

          <section className="st-shell-card">
            <div className="st-shell-card__header">
              <h2>Runtime snapshot</h2>
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
              <h2>New group</h2>
              <span className="st-shell-badge st-shell-badge--muted">
                {busyAction === 'group-create' ? 'creating' : `${newGroupDraft.memberAvatarFiles.length} members`}
              </span>
            </div>
            <div className="st-shell-editor-grid">
              <label className="st-field">
                <span>Name</span>
                <input
                  disabled={Boolean(busyAction)}
                  type="text"
                  value={newGroupDraft.name}
                  onChange={(event) => updateNewGroupDraft({ name: event.target.value })}
                />
              </label>
              <label className="st-field">
                <span>Auto mode delay</span>
                <input
                  disabled={Boolean(busyAction)}
                  min={1}
                  step={1}
                  type="number"
                  value={newGroupDraft.autoModeDelay}
                  onChange={(event) => updateNewGroupDraft({ autoModeDelay: Number(event.target.value) || 1 })}
                />
              </label>
              <label className="st-field">
                <span>Activation strategy</span>
                <select
                  disabled={Boolean(busyAction)}
                  value={newGroupDraft.activationStrategy}
                  onChange={(event) => updateNewGroupDraft({ activationStrategy: Number(event.target.value) })}
                >
                  <option value={0}>Natural</option>
                  <option value={1}>List</option>
                  <option value={2}>Manual</option>
                  <option value={3}>Pooled</option>
                </select>
              </label>
              <label className="st-field">
                <span>Generation mode</span>
                <select
                  disabled={Boolean(busyAction)}
                  value={newGroupDraft.generationMode}
                  onChange={(event) => updateNewGroupDraft({ generationMode: Number(event.target.value) })}
                >
                  <option value={0}>Swap</option>
                  <option value={1}>Append</option>
                  <option value={2}>Append disabled</option>
                </select>
              </label>
            </div>
            <div className="st-shell-toggles">
              <label className="st-shell-toggle">
                <span>
                  <strong>Allow self responses</strong>
                  <small>Permit the same member to answer consecutively.</small>
                </span>
                <input
                  checked={newGroupDraft.allowSelfResponses}
                  disabled={Boolean(busyAction)}
                  type="checkbox"
                  onChange={(event) => updateNewGroupDraft({ allowSelfResponses: event.target.checked })}
                />
              </label>
              <label className="st-shell-toggle">
                <span>
                  <strong>Hide muted sprites</strong>
                  <small>Collapse muted group members in the runtime presentation.</small>
                </span>
                <input
                  checked={newGroupDraft.hideMutedSprites}
                  disabled={Boolean(busyAction)}
                  type="checkbox"
                  onChange={(event) => updateNewGroupDraft({ hideMutedSprites: event.target.checked })}
                />
              </label>
              <label className="st-shell-toggle">
                <span>
                  <strong>Favorite group</strong>
                  <small>Keep the group easy to reach in favorite-oriented flows.</small>
                </span>
                <input
                  checked={newGroupDraft.favorite}
                  disabled={Boolean(busyAction)}
                  type="checkbox"
                  onChange={(event) => updateNewGroupDraft({ favorite: event.target.checked })}
                />
              </label>
            </div>
            <div className="st-shell-settings-group">
              <div className="st-shell-settings-group__header">
                <h3>Members</h3>
                <span className="st-note">{newGroupDraft.memberAvatarFiles.length} selected</span>
              </div>
              <div className="st-shell-member-picker">
                {groupMemberOptions.map((character) => {
                  const avatarFile = character.avatarFile;
                  if (!avatarFile) {
                    return null;
                  }

                  const selected = newGroupDraft.memberAvatarFiles.includes(avatarFile);
                  return (
                    <label className={`st-shell-member-option${selected ? ' st-shell-member-option--selected' : ''}`} key={`new-group-${avatarFile}`}>
                      <input
                        checked={selected}
                        disabled={Boolean(busyAction)}
                        type="checkbox"
                        onChange={(event) =>
                          updateNewGroupDraft({
                            memberAvatarFiles: event.target.checked
                              ? [...newGroupDraft.memberAvatarFiles, avatarFile]
                              : newGroupDraft.memberAvatarFiles.filter((value) => value !== avatarFile),
                          })
                        }
                      />
                      <span>{character.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <nav className="st-actions">
              <button
                className="st-button"
                disabled={!legacyBridge || !newGroupDraft.memberAvatarFiles.length || Boolean(busyAction)}
                type="button"
                onClick={() => void handleGroupCreate()}
              >
                Create group
              </button>
              <button
                className="st-button st-button--ghost"
                disabled={Boolean(busyAction)}
                type="button"
                onClick={() => setNewGroupDraft(DEFAULT_NEW_GROUP_DRAFT)}
              >
                Reset group draft
              </button>
            </nav>
          </section>

          <section className="st-shell-card">
            <div className="st-shell-card__header">
              <h2>Group editor</h2>
              <span className="st-shell-badge st-shell-badge--muted">
                {groupDraft ? (groupIsDirty ? 'modified' : 'synced') : 'no group'}
              </span>
            </div>
            {groupDraft ? (
              <>
                <div className="st-shell-editor-grid">
                  <label className="st-field">
                    <span>Name</span>
                    <input
                      disabled={Boolean(busyAction)}
                      type="text"
                      value={groupDraft.name}
                      onChange={(event) => updateGroupDraft({ name: event.target.value })}
                    />
                  </label>
                  <label className="st-field">
                    <span>Auto mode delay</span>
                    <input
                      disabled={Boolean(busyAction)}
                      min={1}
                      step={1}
                      type="number"
                      value={groupDraft.autoModeDelay}
                      onChange={(event) => updateGroupDraft({ autoModeDelay: Number(event.target.value) || 1 })}
                    />
                  </label>
                  <label className="st-field">
                    <span>Activation strategy</span>
                    <select
                      disabled={Boolean(busyAction)}
                      value={groupDraft.activationStrategy}
                      onChange={(event) => updateGroupDraft({ activationStrategy: Number(event.target.value) })}
                    >
                      <option value={0}>Natural</option>
                      <option value={1}>List</option>
                      <option value={2}>Manual</option>
                      <option value={3}>Pooled</option>
                    </select>
                  </label>
                  <label className="st-field">
                    <span>Generation mode</span>
                    <select
                      disabled={Boolean(busyAction)}
                      value={groupDraft.generationMode}
                      onChange={(event) => updateGroupDraft({ generationMode: Number(event.target.value) })}
                    >
                      <option value={0}>Swap</option>
                      <option value={1}>Append</option>
                      <option value={2}>Append disabled</option>
                    </select>
                  </label>
                </div>
                <div className="st-shell-toggles">
                  <label className="st-shell-toggle">
                    <span>
                      <strong>Allow self responses</strong>
                      <small>Permit the same member to answer consecutively.</small>
                    </span>
                    <input
                      checked={groupDraft.allowSelfResponses}
                      disabled={Boolean(busyAction)}
                      type="checkbox"
                      onChange={(event) => updateGroupDraft({ allowSelfResponses: event.target.checked })}
                    />
                  </label>
                  <label className="st-shell-toggle">
                    <span>
                      <strong>Hide muted sprites</strong>
                      <small>Collapse muted group members in the runtime presentation.</small>
                    </span>
                    <input
                      checked={groupDraft.hideMutedSprites}
                      disabled={Boolean(busyAction)}
                      type="checkbox"
                      onChange={(event) => updateGroupDraft({ hideMutedSprites: event.target.checked })}
                    />
                  </label>
                  <label className="st-shell-toggle">
                    <span>
                      <strong>Favorite group</strong>
                      <small>Keep this group pinned in favorite-oriented flows.</small>
                    </span>
                    <input
                      checked={groupDraft.favorite}
                      disabled={Boolean(busyAction)}
                      type="checkbox"
                      onChange={(event) => updateGroupDraft({ favorite: event.target.checked })}
                    />
                  </label>
                </div>
                <div className="st-shell-settings-group">
                  <div className="st-shell-settings-group__header">
                    <h3>Members</h3>
                    <span className="st-note">{groupDraft.memberAvatarFiles.length} selected</span>
                  </div>
                  <div className="st-shell-member-picker">
                    {groupMemberOptions.map((character) => {
                      const avatarFile = character.avatarFile;
                      if (!avatarFile) {
                        return null;
                      }

                      const selected = groupDraft.memberAvatarFiles.includes(avatarFile);
                      return (
                        <label className={`st-shell-member-option${selected ? ' st-shell-member-option--selected' : ''}`} key={`group-${groupDraft.id}-${avatarFile}`}>
                          <input
                            checked={selected}
                            disabled={Boolean(busyAction)}
                            type="checkbox"
                            onChange={(event) =>
                              updateGroupDraft({
                                memberAvatarFiles: event.target.checked
                                  ? [...groupDraft.memberAvatarFiles, avatarFile]
                                  : groupDraft.memberAvatarFiles.filter((value) => value !== avatarFile),
                              })
                            }
                          />
                          <span>{character.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <nav className="st-actions">
                  <button
                    className="st-button"
                    disabled={!legacyBridge || !groupIsDirty || !groupDraft.memberAvatarFiles.length || Boolean(busyAction)}
                    type="button"
                    onClick={() => void handleGroupSave()}
                  >
                    Save group
                  </button>
                  <button
                    className="st-button st-button--ghost"
                    disabled={!groupProfile || Boolean(busyAction)}
                    type="button"
                    onClick={() => setGroupDraft(groupProfile)}
                  >
                    Reset group draft
                  </button>
                </nav>
              </>
            ) : (
              <p className="st-note">Open a group to inspect or edit its core group settings.</p>
            )}
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
              <h2>World info</h2>
              <span className="st-shell-badge st-shell-badge--muted">
                {worldInfoLoading ? 'loading' : `${worldInfoCatalog.names.length} books`}
              </span>
            </div>
            <label className="st-field">
              <span>New lorebook name</span>
              <input
                disabled={Boolean(busyAction)}
                type="text"
                value={newWorldInfoName}
                onChange={(event) => setNewWorldInfoName(event.target.value)}
              />
            </label>
            <nav className="st-actions">
              <button
                className="st-button"
                disabled={!legacyBridge || !newWorldInfoName.trim() || Boolean(busyAction)}
                type="button"
                onClick={() => void handleWorldInfoCreate()}
              >
                Create lorebook
              </button>
            </nav>
            <div className="st-shell-settings-group">
              <div className="st-shell-settings-group__header">
                <h3>Available lorebooks</h3>
                <span className="st-note">{worldInfoCatalog.selectedNames.length} globally selected</span>
              </div>
              <div className="st-shell-history-list">
                {worldInfoCatalog.names.length ? (
                  worldInfoCatalog.names.map((name) => {
                    const selected = worldInfoCatalog.selectedNames.includes(name);
                    const active = activeWorldInfoName === name;
                    return (
                      <article className="st-shell-history-item" key={name}>
                        <div className="st-shell-history-item__header">
                          <span className={`st-shell-history-role${selected ? '' : ' st-shell-history-role--system'}`}>
                            {selected ? 'active' : 'idle'}
                          </span>
                          <strong>{name}</strong>
                          <small>{active ? 'loaded in editor' : 'not loaded'}</small>
                        </div>
                        <nav className="st-actions">
                          <label className="st-shell-toggle st-shell-toggle--inline">
                            <span>
                              <strong>Global</strong>
                              <small>Use this lorebook in world-info scans.</small>
                            </span>
                            <input
                              checked={selected}
                              disabled={!legacyBridge || Boolean(busyAction)}
                              type="checkbox"
                              onChange={(event) => void handleWorldInfoSelectionToggle(name, event.target.checked)}
                            />
                          </label>
                          <button
                            className="st-button st-button--ghost"
                            disabled={!legacyBridge || Boolean(busyAction)}
                            type="button"
                            onClick={() => void handleWorldInfoLoad(name)}
                          >
                            Load
                          </button>
                          <button
                            className="st-button st-button--ghost"
                            disabled={!legacyBridge || Boolean(busyAction)}
                            type="button"
                            onClick={() => void handleWorldInfoDelete(name)}
                          >
                            Delete
                          </button>
                        </nav>
                      </article>
                    );
                  })
                ) : (
                  <p className="st-note">No lorebooks found.</p>
                )}
              </div>
            </div>
            <div className="st-shell-settings-group">
              <div className="st-shell-settings-group__header">
                <h3>Structured entry editor</h3>
                <span className="st-note">
                  {parsedWorldInfo ? `${structuredWorldInfoEntries.length} entries` : 'load a valid lorebook JSON to edit entries here'}
                </span>
              </div>
              <nav className="st-actions">
                <button
                  className="st-button"
                  disabled={!activeWorldInfoName || !parsedWorldInfo || Boolean(busyAction)}
                  type="button"
                  onClick={() => handleWorldInfoEntryCreate()}
                >
                  Add entry
                </button>
              </nav>
              {parsedWorldInfo ? (
                <>
                  <div className="st-shell-history-list">
                    {structuredWorldInfoEntries.length ? (
                      structuredWorldInfoEntries.map((entry) => {
                        const active = String(entry.uid) === activeWorldInfoEntryId;
                        return (
                          <article className={`st-shell-history-item${active ? ' st-shell-history-item--active' : ''}`} key={`${activeWorldInfoName}-${entry.uid}`}>
                            <div className="st-shell-history-item__header">
                              <span className={`st-shell-history-role${entry.disable ? ' st-shell-history-role--system' : ''}`}>
                                {entry.disable ? 'disabled' : 'active'}
                              </span>
                              <strong>{entry.comment || `Entry ${entry.uid}`}</strong>
                              <small>{`uid ${entry.uid}`}</small>
                            </div>
                            <p>{entry.content.slice(0, 160) || 'No entry content.'}</p>
                            <nav className="st-actions">
                              <button
                                className="st-button st-button--ghost"
                                disabled={Boolean(busyAction)}
                                type="button"
                                onClick={() => setActiveWorldInfoEntryId(String(entry.uid))}
                              >
                                Edit
                              </button>
                              <button
                                className="st-button st-button--ghost"
                                disabled={Boolean(busyAction)}
                                type="button"
                                onClick={() => handleWorldInfoEntryDelete(entry.uid)}
                              >
                                Delete
                              </button>
                            </nav>
                          </article>
                        );
                      })
                    ) : (
                      <p className="st-note">No entries in this lorebook yet.</p>
                    )}
                  </div>
                  {activeWorldInfoEntry ? (
                    <>
                      <div className="st-shell-editor-grid">
                        <label className="st-field">
                          <span>Comment</span>
                          <input
                            disabled={Boolean(busyAction)}
                            type="text"
                            value={activeWorldInfoEntry.comment}
                            onChange={(event) => updateWorldInfoEntry({ comment: event.target.value })}
                          />
                        </label>
                        <label className="st-field">
                          <span>Primary keys</span>
                          <input
                            disabled={Boolean(busyAction)}
                            type="text"
                            value={activeWorldInfoEntry.key.join(', ')}
                            onChange={(event) =>
                              updateWorldInfoEntry({
                                key: event.target.value.split(/[\n,]/).map((value) => value.trim()).filter(Boolean),
                              })
                            }
                          />
                        </label>
                        <label className="st-field">
                          <span>Secondary keys</span>
                          <input
                            disabled={Boolean(busyAction)}
                            type="text"
                            value={activeWorldInfoEntry.keysecondary.join(', ')}
                            onChange={(event) =>
                              updateWorldInfoEntry({
                                keysecondary: event.target.value.split(/[\n,]/).map((value) => value.trim()).filter(Boolean),
                              })
                            }
                          />
                        </label>
                        <label className="st-field">
                          <span>Order</span>
                          <input
                            disabled={Boolean(busyAction)}
                            type="number"
                            value={activeWorldInfoEntry.order}
                            onChange={(event) => updateWorldInfoEntry({ order: Number(event.target.value) })}
                          />
                        </label>
                        <label className="st-field">
                          <span>Position</span>
                          <select
                            disabled={Boolean(busyAction)}
                            value={activeWorldInfoEntry.position}
                            onChange={(event) => updateWorldInfoEntry({ position: Number(event.target.value) })}
                          >
                            <option value={0}>Before character</option>
                            <option value={1}>After character</option>
                            <option value={4}>At depth</option>
                          </select>
                        </label>
                      </div>
                      <div className="st-shell-toggles">
                        <label className="st-shell-toggle">
                          <span>
                            <strong>Disabled</strong>
                            <small>Keep this entry out of activation scans.</small>
                          </span>
                          <input
                            checked={activeWorldInfoEntry.disable}
                            disabled={Boolean(busyAction)}
                            type="checkbox"
                            onChange={(event) => updateWorldInfoEntry({ disable: event.target.checked })}
                          />
                        </label>
                        <label className="st-shell-toggle">
                          <span>
                            <strong>Constant</strong>
                            <small>Always include this entry when the lorebook is active.</small>
                          </span>
                          <input
                            checked={activeWorldInfoEntry.constant}
                            disabled={Boolean(busyAction)}
                            type="checkbox"
                            onChange={(event) => updateWorldInfoEntry({ constant: event.target.checked })}
                          />
                        </label>
                        <label className="st-shell-toggle">
                          <span>
                            <strong>Selective</strong>
                            <small>Require the secondary keys logic when applicable.</small>
                          </span>
                          <input
                            checked={activeWorldInfoEntry.selective}
                            disabled={Boolean(busyAction)}
                            type="checkbox"
                            onChange={(event) => updateWorldInfoEntry({ selective: event.target.checked })}
                          />
                        </label>
                      </div>
                      <label className="st-field">
                        <span>Entry content</span>
                        <textarea
                          className="st-shell-textarea"
                          disabled={Boolean(busyAction)}
                          value={activeWorldInfoEntry.content}
                          onChange={(event) => updateWorldInfoEntry({ content: event.target.value })}
                        />
                      </label>
                    </>
                  ) : null}
                </>
              ) : (
                <p className="st-note">The structured editor is available when the loaded lorebook JSON has a standard `entries` object.</p>
              )}
            </div>
            <label className="st-field">
              <span>{activeWorldInfoName ? `Editor: ${activeWorldInfoName}` : 'Lorebook JSON editor'}</span>
              <textarea
                className="st-shell-textarea st-shell-textarea--result"
                disabled={!activeWorldInfoName || worldInfoLoading || Boolean(busyAction)}
                placeholder="Load a lorebook to inspect or edit its raw JSON."
                value={worldInfoDraft}
                onChange={(event) => setWorldInfoDraft(event.target.value)}
              />
            </label>
            <nav className="st-actions">
              <button
                className="st-button"
                disabled={!legacyBridge || !activeWorldInfoName || !worldInfoDirty || Boolean(busyAction)}
                type="button"
                onClick={() => void handleWorldInfoSave()}
              >
                Save lorebook
              </button>
              <button
                className="st-button st-button--ghost"
                disabled={!activeWorldInfoName || Boolean(busyAction)}
                type="button"
                onClick={() => setWorldInfoDraft(worldInfoSource)}
              >
                Reset JSON
              </button>
            </nav>
          </section>

          <section className="st-shell-card">
            <div className="st-shell-card__header">
              <h2>Prompt manager</h2>
              <span className="st-shell-badge st-shell-badge--muted">
                {`${promptTemplates.length} prompts`}
              </span>
            </div>
            <div className="st-shell-settings-group">
              <div className="st-shell-settings-group__header">
                <h3>Available prompts</h3>
                <span className="st-note">Editing existing prompt entries only</span>
              </div>
              <div className="st-shell-history-list">
                {promptTemplates.length ? (
                  promptTemplates.map((prompt) => {
                    return (
                      <article className="st-shell-history-item" key={prompt.identifier}>
                        <div className="st-shell-history-item__header">
                          <span className={`st-shell-history-role${prompt.enabled ? '' : ' st-shell-history-role--system'}`}>
                            {prompt.enabled ? 'enabled' : 'disabled'}
                          </span>
                          <strong>{prompt.name || prompt.identifier}</strong>
                          <small>{prompt.identifier}</small>
                        </div>
                        <p>{prompt.content.slice(0, 160) || 'No prompt content.'}</p>
                        <nav className="st-actions">
                          <button
                            className="st-button st-button--ghost"
                            disabled={Boolean(busyAction)}
                            type="button"
                            onClick={() => {
                              setActivePromptId(prompt.identifier);
                              setPromptDraft(prompt);
                            }}
                          >
                            Edit
                          </button>
                        </nav>
                      </article>
                    );
                  })
                ) : (
                  <p className="st-note">No prompts available.</p>
                )}
              </div>
            </div>
            {promptDraft ? (
              <>
                <div className="st-shell-editor-grid">
                  <label className="st-field">
                    <span>Name</span>
                    <input
                      disabled={Boolean(busyAction)}
                      type="text"
                      value={promptDraft.name}
                      onChange={(event) => updatePromptDraft({ name: event.target.value })}
                    />
                  </label>
                  <label className="st-field">
                    <span>Role</span>
                    <input
                      disabled={Boolean(busyAction)}
                      type="text"
                      value={promptDraft.role}
                      onChange={(event) => updatePromptDraft({ role: event.target.value })}
                    />
                  </label>
                  <label className="st-field">
                    <span>Triggers</span>
                    <input
                      disabled={Boolean(busyAction)}
                      type="text"
                      value={promptDraft.injectionTriggers.join(', ')}
                      onChange={(event) =>
                        updatePromptDraft({
                          injectionTriggers: event.target.value
                            .split(/[\n,]/)
                            .map((value) => value.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </label>
                  <label className="st-field">
                    <span>Injection position</span>
                    <input
                      disabled={Boolean(busyAction)}
                      type="number"
                      value={promptDraft.injectionPosition}
                      onChange={(event) => updatePromptDraft({ injectionPosition: Number(event.target.value) })}
                    />
                  </label>
                  <label className="st-field">
                    <span>Injection depth</span>
                    <input
                      disabled={Boolean(busyAction)}
                      type="number"
                      value={promptDraft.injectionDepth}
                      onChange={(event) => updatePromptDraft({ injectionDepth: Number(event.target.value) })}
                    />
                  </label>
                  <label className="st-field">
                    <span>Injection order</span>
                    <input
                      disabled={Boolean(busyAction)}
                      type="number"
                      value={promptDraft.injectionOrder}
                      onChange={(event) => updatePromptDraft({ injectionOrder: Number(event.target.value) })}
                    />
                  </label>
                </div>
                <div className="st-shell-toggles">
                  <label className="st-shell-toggle">
                    <span>
                      <strong>Enabled</strong>
                      <small>Allow this prompt to participate in prompt assembly.</small>
                    </span>
                    <input
                      checked={promptDraft.enabled}
                      disabled={Boolean(busyAction)}
                      type="checkbox"
                      onChange={(event) => updatePromptDraft({ enabled: event.target.checked })}
                    />
                  </label>
                  <label className="st-shell-toggle">
                    <span>
                      <strong>System prompt</strong>
                      <small>Mark this entry as a system-level prompt template.</small>
                    </span>
                    <input
                      checked={promptDraft.systemPrompt}
                      disabled={Boolean(busyAction)}
                      type="checkbox"
                      onChange={(event) => updatePromptDraft({ systemPrompt: event.target.checked })}
                    />
                  </label>
                  <label className="st-shell-toggle">
                    <span>
                      <strong>Forbid overrides</strong>
                      <small>Keep runtime overrides from replacing this prompt.</small>
                    </span>
                    <input
                      checked={promptDraft.forbidOverrides}
                      disabled={Boolean(busyAction)}
                      type="checkbox"
                      onChange={(event) => updatePromptDraft({ forbidOverrides: event.target.checked })}
                    />
                  </label>
                </div>
                <label className="st-field">
                  <span>{`Prompt content: ${promptDraft.identifier}`}</span>
                  <textarea
                    className="st-shell-textarea st-shell-textarea--result"
                    disabled={Boolean(busyAction)}
                    value={promptDraft.content}
                    onChange={(event) => updatePromptDraft({ content: event.target.value })}
                  />
                </label>
                <nav className="st-actions">
                  <button
                    className="st-button st-button--ghost"
                    disabled={!legacyBridge || activePromptIndex <= 0 || Boolean(busyAction)}
                    type="button"
                    onClick={() => void handlePromptMove('up')}
                  >
                    Move up
                  </button>
                  <button
                    className="st-button st-button--ghost"
                    disabled={!legacyBridge || activePromptIndex < 0 || activePromptIndex >= promptTemplates.length - 1 || Boolean(busyAction)}
                    type="button"
                    onClick={() => void handlePromptMove('down')}
                  >
                    Move down
                  </button>
                  <button
                    className="st-button"
                    disabled={!legacyBridge || !promptDirty || Boolean(busyAction)}
                    type="button"
                    onClick={() => void handlePromptSave()}
                  >
                    Save prompt
                  </button>
                  <button
                    className="st-button st-button--ghost"
                    disabled={!activePrompt || Boolean(busyAction)}
                    type="button"
                    onClick={() => setPromptDraft(activePrompt)}
                  >
                    Reset prompt
                  </button>
                </nav>
              </>
            ) : (
              <p className="st-note">Select a prompt to inspect or edit it.</p>
            )}
          </section>

          <section className="st-shell-card">
            <div className="st-shell-card__header">
              <h2>Extensions</h2>
              <span className="st-shell-badge st-shell-badge--muted">
                {`${installedExtensions.length} installed`}
              </span>
            </div>
            <div className="st-shell-settings-group">
              <div className="st-shell-settings-group__header">
                <h3>Installed extensions</h3>
                <span className="st-note">
                  {extensionReloadRequired ? 'reload required to apply extension changes' : 'enable or disable installed extensions'}
                </span>
              </div>
              <div className="st-shell-history-list">
                {installedExtensions.length ? (
                  installedExtensions.map((extension) => (
                    <article className="st-shell-history-item" key={extension.name}>
                      <div className="st-shell-history-item__header">
                        <span className={`st-shell-history-role${extension.enabled ? '' : ' st-shell-history-role--system'}`}>
                          {extension.enabled ? 'enabled' : 'disabled'}
                        </span>
                        <strong>{extension.displayName}</strong>
                        <small>{`${extension.type || 'unknown'}${extension.version ? ` • v${extension.version}` : ''}`}</small>
                      </div>
                      <p>{extension.name}</p>
                      <div className="st-actions">
                        <label className="st-shell-toggle st-shell-toggle--inline">
                          <span>
                            <strong>Enabled</strong>
                            <small>Requires a page reload to fully apply.</small>
                          </span>
                          <input
                            checked={extension.enabled}
                            disabled={!legacyBridge || Boolean(busyAction)}
                            type="checkbox"
                            onChange={(event) => void handleExtensionToggle(extension.name, event.target.checked)}
                          />
                        </label>
                        {extension.requires.length ? (
                          <span className="st-note">{`Extras: ${extension.requires.join(', ')}`}</span>
                        ) : null}
                        {extension.dependencies.length ? (
                          <span className="st-note">{`Depends on: ${extension.dependencies.join(', ')}`}</span>
                        ) : null}
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="st-note">No installed extensions found.</p>
                )}
              </div>
            </div>
          </section>

          <section className="st-shell-card">
            <div className="st-shell-card__header">
              <h2>New character</h2>
              <span className="st-shell-badge st-shell-badge--muted">
                {busyAction === 'character-create' ? 'creating' : 'blank draft'}
              </span>
            </div>
            <div className="st-shell-editor-grid">
              <label className="st-field">
                <span>Name</span>
                <input
                  disabled={Boolean(busyAction)}
                  type="text"
                  value={newCharacterDraft.name}
                  onChange={(event) => updateNewCharacterDraft({ name: event.target.value })}
                />
              </label>
              <label className="st-field">
                <span>Character version</span>
                <input
                  disabled={Boolean(busyAction)}
                  type="text"
                  value={newCharacterDraft.characterVersion}
                  onChange={(event) => updateNewCharacterDraft({ characterVersion: event.target.value })}
                />
              </label>
              <label className="st-field">
                <span>Creator</span>
                <input
                  disabled={Boolean(busyAction)}
                  type="text"
                  value={newCharacterDraft.creator}
                  onChange={(event) => updateNewCharacterDraft({ creator: event.target.value })}
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
                  value={newCharacterDraft.talkativeness}
                  onChange={(event) => updateNewCharacterDraft({ talkativeness: Number(event.target.value) })}
                />
              </label>
            </div>
            <label className="st-field">
              <span>Description</span>
              <textarea
                className="st-shell-textarea"
                disabled={Boolean(busyAction)}
                value={newCharacterDraft.description}
                onChange={(event) => updateNewCharacterDraft({ description: event.target.value })}
              />
            </label>
            <label className="st-field">
              <span>Personality</span>
              <textarea
                className="st-shell-textarea"
                disabled={Boolean(busyAction)}
                value={newCharacterDraft.personality}
                onChange={(event) => updateNewCharacterDraft({ personality: event.target.value })}
              />
            </label>
            <label className="st-field">
              <span>Scenario</span>
              <textarea
                className="st-shell-textarea"
                disabled={Boolean(busyAction)}
                value={newCharacterDraft.scenario}
                onChange={(event) => updateNewCharacterDraft({ scenario: event.target.value })}
              />
            </label>
            <label className="st-field">
              <span>First message</span>
              <textarea
                className="st-shell-textarea"
                disabled={Boolean(busyAction)}
                value={newCharacterDraft.firstMessage}
                onChange={(event) => updateNewCharacterDraft({ firstMessage: event.target.value })}
              />
            </label>
            <label className="st-field">
              <span>Example messages</span>
              <textarea
                className="st-shell-textarea st-shell-textarea--result"
                disabled={Boolean(busyAction)}
                value={newCharacterDraft.mesExamples}
                onChange={(event) => updateNewCharacterDraft({ mesExamples: event.target.value })}
              />
            </label>
            <label className="st-field">
              <span>System prompt</span>
              <textarea
                className="st-shell-textarea"
                disabled={Boolean(busyAction)}
                value={newCharacterDraft.systemPrompt}
                onChange={(event) => updateNewCharacterDraft({ systemPrompt: event.target.value })}
              />
            </label>
            <label className="st-field">
              <span>Post-history instructions</span>
              <textarea
                className="st-shell-textarea"
                disabled={Boolean(busyAction)}
                value={newCharacterDraft.postHistoryInstructions}
                onChange={(event) => updateNewCharacterDraft({ postHistoryInstructions: event.target.value })}
              />
            </label>
            <label className="st-field">
              <span>Creator notes</span>
              <textarea
                className="st-shell-textarea"
                disabled={Boolean(busyAction)}
                value={newCharacterDraft.creatorNotes}
                onChange={(event) => updateNewCharacterDraft({ creatorNotes: event.target.value })}
              />
            </label>
            <label className="st-field">
              <span>Tags</span>
              <input
                disabled={Boolean(busyAction)}
                type="text"
                value={newCharacterDraft.tags.join(', ')}
                onChange={(event) =>
                  updateNewCharacterDraft({
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
                disabled={!legacyBridge || !newCharacterDraft.name.trim() || Boolean(busyAction)}
                type="button"
                onClick={() => void handleCharacterCreate()}
              >
                Create character
              </button>
              <button
                className="st-button st-button--ghost"
                disabled={Boolean(busyAction)}
                type="button"
                onClick={() => setNewCharacterDraft(DEFAULT_NEW_CHARACTER_DRAFT)}
              >
                Reset draft
              </button>
            </nav>
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
                          message.isUser
                            ? ' st-shell-message--user'
                            : message.isSystem
                              ? ' st-shell-message--system'
                              : ''
                        }${selectedMessageId === message.id ? ' st-shell-message--selected' : ''
                        }`}
                        key={message.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedMessageId(message.id);
                          setMessageEditDraft(message.text);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedMessageId(message.id);
                            setMessageEditDraft(message.text);
                          }
                        }}
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
                            {message.swipeCount ? ` · swipe ${(message.swipeIndex ?? 0) + 1}/${message.swipeCount}` : ''}
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
                    <h3>Message editor</h3>
                    <span className="st-shell-badge st-shell-badge--muted">
                      {selectedMessage ? `#${selectedMessage.id}` : 'no selection'}
                    </span>
                  </div>
                  {selectedMessage ? (
                    <>
                      <div className="st-shell-history-item__header">
                        <span
                          className={`st-shell-history-role${
                            selectedMessage.isUser
                              ? ' st-shell-history-role--user'
                              : selectedMessage.isSystem
                                ? ' st-shell-history-role--system'
                                : ''
                          }`}
                        >
                          {selectedMessage.isUser ? 'user' : selectedMessage.isSystem ? 'system' : 'assistant'}
                        </span>
                        <strong>{selectedMessage.name}</strong>
                        <small>
                          {selectedMessage.swipeCount ? `swipe ${(selectedMessage.swipeIndex ?? 0) + 1}/${selectedMessage.swipeCount} · ` : ''}
                          {selectedMessage.tokenCount !== undefined ? `${selectedMessage.tokenCount}t · ` : ''}
                          {selectedMessage.timestamp ?? 'no timestamp'}
                        </small>
                      </div>
                      <label className="st-field">
                        <span>Message text</span>
                        <textarea
                          className="st-shell-textarea st-shell-textarea--result"
                          disabled={!legacyBridge || Boolean(busyAction)}
                          value={messageEditDraft}
                          onChange={(event) => setMessageEditDraft(event.target.value)}
                        />
                      </label>
                      <nav className="st-actions">
                        <button
                          className="st-button"
                          disabled={!legacyBridge || !messageEditDirty || Boolean(busyAction)}
                          type="button"
                          onClick={() => void handleMessageEditSave()}
                        >
                          Save message
                        </button>
                        <button
                          className="st-button st-button--ghost"
                          disabled={!selectedMessage || selectedMessageIsFirst || Boolean(busyAction)}
                          type="button"
                          onClick={() => void handleMessageMove('up')}
                        >
                          Move up
                        </button>
                        <button
                          className="st-button st-button--ghost"
                          disabled={!selectedMessage || selectedMessageIsLast || Boolean(busyAction)}
                          type="button"
                          onClick={() => void handleMessageMove('down')}
                        >
                          Move down
                        </button>
                        <button
                          className="st-button st-button--ghost"
                          disabled={!selectedMessage || Boolean(busyAction)}
                          type="button"
                          onClick={() => void handleMessageDuplicate()}
                        >
                          Duplicate
                        </button>
                        <button
                          className="st-button st-button--ghost"
                          disabled={!selectedMessage || Boolean(busyAction)}
                          type="button"
                          onClick={() => void handleMessageDelete()}
                        >
                          Delete
                        </button>
                        <button
                          className="st-button st-button--ghost"
                          disabled={!selectedMessage || Boolean(busyAction)}
                          type="button"
                          onClick={() => setMessageEditDraft(selectedMessage.text)}
                        >
                          Reset text
                        </button>
                      </nav>
                      <nav className="st-actions">
                        <button
                          className="st-button st-button--ghost"
                          disabled={!legacyBridge || !selectedMessageCanSwipe || Boolean(busyAction)}
                          type="button"
                          onClick={() => void handleSwipe('left')}
                        >
                          Previous swipe
                        </button>
                        <button
                          className="st-button st-button--ghost"
                          disabled={!legacyBridge || !selectedMessageCanSwipe || Boolean(busyAction)}
                          type="button"
                          onClick={() => void handleSwipe('right')}
                        >
                          Next swipe
                        </button>
                        <button
                          className="st-button st-button--ghost"
                          disabled={!legacyBridge || !selectedMessageCanDeleteSwipe || Boolean(busyAction)}
                          type="button"
                          onClick={() => void handleDeleteSwipe()}
                        >
                          Delete swipe
                        </button>
                      </nav>
                      <p className="st-note">Swipe controls are only available for the active final assistant turn.</p>
                    </>
                  ) : (
                    <p className="st-note">Select a message in the transcript to edit its text.</p>
                  )}
                </section>

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
                    <h3>Session history</h3>
                    <span className="st-shell-badge st-shell-badge--muted">
                      {sessionHistoryLoading ? 'loading' : `${sessionHistory.length} chats`}
                    </span>
                  </div>
                  <label className="st-field">
                    <span>Search chats</span>
                    <input
                      disabled={!legacyBridge || Boolean(busyAction)}
                      type="search"
                      placeholder="Filter the current character or group chat history."
                      value={sessionHistoryQuery}
                      onChange={(event) => setSessionHistoryQuery(event.target.value)}
                    />
                  </label>
                  <div className="st-shell-history-list st-shell-session-history-list">
                    {sessionHistory.length ? (
                      sessionHistory.map((chatItem) => {
                        const isRenaming = sessionHistoryRenameTarget === chatItem.fileName;
                        return (
                          <article className="st-shell-history-item" key={chatItem.fileName}>
                            <div className="st-shell-history-item__header">
                              <span className={`st-shell-history-role${chatItem.isActive ? '' : ' st-shell-history-role--system'}`}>
                                {chatItem.isActive ? 'active' : 'saved'}
                              </span>
                              <strong>{chatItem.fileName}</strong>
                              <small>
                                {chatItem.messageCount} messages
                                {chatItem.fileSize ? ` · ${chatItem.fileSize}` : ''}
                                {chatItem.lastMessageAt ? ` · ${chatItem.lastMessageAt}` : ''}
                              </small>
                            </div>
                            <p>{chatItem.previewMessage || 'No preview available.'}</p>
                            {isRenaming ? (
                              <>
                                <label className="st-field">
                                  <span>New chat name</span>
                                  <input
                                    disabled={Boolean(busyAction)}
                                    type="text"
                                    value={sessionHistoryRenameDraft}
                                    onChange={(event) => setSessionHistoryRenameDraft(event.target.value)}
                                  />
                                </label>
                                <nav className="st-actions">
                                  <button
                                    className="st-button"
                                    disabled={!sessionHistoryRenameDraft.trim() || Boolean(busyAction)}
                                    type="button"
                                    onClick={() => void handleSessionHistoryRenameSave()}
                                  >
                                    Save name
                                  </button>
                                  <button
                                    className="st-button st-button--ghost"
                                    disabled={Boolean(busyAction)}
                                    type="button"
                                    onClick={() => {
                                      setSessionHistoryRenameTarget(null);
                                      setSessionHistoryRenameDraft('');
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </nav>
                              </>
                            ) : (
                              <nav className="st-actions">
                                <button
                                  className="st-button"
                                  disabled={!legacyBridge || Boolean(busyAction)}
                                  type="button"
                                  onClick={() => void handleSessionHistoryOpen(chatItem.fileName)}
                                >
                                  Open
                                </button>
                                <button
                                  className="st-button st-button--ghost"
                                  disabled={!legacyBridge || Boolean(busyAction)}
                                  type="button"
                                  onClick={() => {
                                    setSessionHistoryRenameTarget(chatItem.fileName);
                                    setSessionHistoryRenameDraft(chatItem.fileName);
                                  }}
                                >
                                  Rename
                                </button>
                                <button
                                  className="st-button st-button--ghost"
                                  disabled={!legacyBridge || Boolean(busyAction)}
                                  type="button"
                                  onClick={() => void handleSessionHistoryDelete(chatItem.fileName)}
                                >
                                  Delete
                                </button>
                              </nav>
                            )}
                          </article>
                        );
                      })
                    ) : (
                      <p className="st-note">No saved chats found for the current session.</p>
                    )}
                  </div>
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

          <section className="st-shell-card st-shell-card--compact">
            <div className="st-shell-card__header">
              <h2>Legacy fallback</h2>
              <span className="st-shell-badge st-shell-badge--muted">on demand</span>
            </div>
            <p className="st-note">
              The visible legacy UI is no longer mounted inline. Use the fallback only for parity checks or niche tools that React does not own yet.
            </p>
            <nav className="st-actions">
              <button
                className="st-button st-button--ghost"
                type="button"
                onClick={() => setShowLegacyFallback(true)}
              >
                Open legacy runtime
              </button>
            </nav>
          </section>
        </section>
      </section>

      {showLegacyFallback ? (
        <div
          aria-hidden="true"
          className="st-shell-modal-backdrop"
          onClick={() => setShowLegacyFallback(false)}
        >
          <section
            aria-label="Legacy runtime fallback"
            aria-modal="true"
            className="st-shell-modal"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="st-shell-modal__header">
              <div>
                <h2>Legacy runtime fallback</h2>
                <p className="st-note">Bridge runtime stays mounted in the background. This window is only for manual fallback work.</p>
              </div>
              <button
                className="st-button st-button--ghost"
                type="button"
                onClick={() => setShowLegacyFallback(false)}
              >
                Close
              </button>
            </div>
            <iframe
              className="st-shell-frame"
              src={legacySource}
              title="SillyTavern Legacy Runtime"
            />
          </section>
        </div>
      ) : null}
    </main>
  );
}
