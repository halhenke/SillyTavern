export type EventPayload = unknown[];
export type EventListener = (...payload: EventPayload) => void | Promise<void>;

export interface ShellPreferences {
  autoScrollChatToBottom: boolean;
  autoContinueAllowChatCompletions: boolean;
  autoContinueEnabled: boolean;
  autoContinueTargetLength: number;
  collapseNewlines: boolean;
  compactInputArea: boolean;
  consoleLogPrompts: boolean;
  continueOnSend: boolean;
  quickContinue: boolean;
  quickImpersonate: boolean;
  requestTokenProbabilities: boolean;
  restoreUserInput: boolean;
  messageTokenCountEnabled: boolean;
  trimSentences: boolean;
  trimSpaces: boolean;
}

export interface ShellSnapshot {
  canSaveSettings: boolean;
  characterId?: number;
  characterName?: string;
  currentChatId?: string;
  groupId?: string;
  mainApi?: string;
  onlineStatus?: string;
  preferences: ShellPreferences;
  userName?: string;
}

export interface ShellCharacterSummary {
  avatarUrl?: string;
  chatId?: string;
  id: number;
  isSelected: boolean;
  name: string;
}

export interface ShellGroupSummary {
  chatId?: string;
  id: string;
  isSelected: boolean;
  memberCount: number;
  name: string;
}

export interface SessionCatalog {
  characters: ShellCharacterSummary[];
  groups: ShellGroupSummary[];
}

export interface CoreEventBus {
  on(eventName: string, listener: EventListener): () => void;
  once(eventName: string, listener: EventListener): () => void;
  off(eventName: string, listener: EventListener): void;
  emit(eventName: string, ...payload: EventPayload): Promise<void>;
}

export interface SettingsService {
  getShellSnapshot(): ShellSnapshot;
  updateShellPreferences(next: Partial<ShellPreferences>): Promise<void>;
  saveDebounced(): void;
  saveNow(): Promise<void>;
}

export interface ChatService {
  getCurrentChatId(): string | undefined;
}

export interface SessionService {
  clearCurrentChat(): Promise<void>;
  getCatalog(): SessionCatalog;
  openGroup(groupId: string, chatId?: string): Promise<void>;
  reloadCurrentChat(): Promise<void>;
  renameCurrentChat(nextName: string): Promise<void>;
  selectCharacter(id: number): Promise<void>;
}

export interface GenerationService {
  stopGeneration(): void;
}

export interface ExtensionHostService {
  getContext(): unknown;
  getEventTypes(): Record<string, string>;
}

export interface ModernizationBridge {
  eventBus: CoreEventBus;
  settings: SettingsService;
  chat: ChatService;
  session: SessionService;
  generation: GenerationService;
  extensions: ExtensionHostService;
}
