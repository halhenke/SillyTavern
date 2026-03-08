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

export interface QuietPromptOptions {
  prompt: string;
  quietToLoud?: boolean;
  responseLength?: number;
  trimToSentence?: boolean;
}

export interface CharacterProfile {
  avatarFile?: string;
  avatarUrl?: string;
  characterVersion: string;
  chatId?: string;
  creator: string;
  creatorNotes: string;
  description: string;
  firstMessage: string;
  id: number;
  mesExamples: string;
  name: string;
  personality: string;
  postHistoryInstructions: string;
  scenario: string;
  systemPrompt: string;
  tags: string[];
  talkativeness: number;
}

export interface ChatMetadata {
  scenario: string;
}

export type ComposerGenerationMode = 'continue' | 'impersonate' | 'normal' | 'regenerate';

export interface ChatMessageSummary {
  id: number;
  isSystem: boolean;
  isUser: boolean;
  name: string;
  text: string;
  timestamp?: string;
  tokenCount?: number;
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
  addSystemMessage(text: string): Promise<void>;
  deleteLastMessage(): Promise<void>;
  getCurrentChatId(): string | undefined;
  getMessages(): ChatMessageSummary[];
  getMetadata(): ChatMetadata;
  updateMessage(id: number, text: string): Promise<void>;
  saveMetadata(next: ChatMetadata): Promise<void>;
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
  generateQuietPrompt(options: QuietPromptOptions): Promise<string>;
  stopGeneration(): void;
}

export interface CharacterService {
  getSelectedProfile(): Promise<CharacterProfile | null>;
  saveSelectedProfile(profile: CharacterProfile): Promise<void>;
}

export interface ComposerService {
  sendAndGenerate(text: string): Promise<void>;
  sendUserMessage(text: string): Promise<void>;
  triggerGeneration(mode: ComposerGenerationMode): Promise<void>;
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
  character: CharacterService;
  composer: ComposerService;
  extensions: ExtensionHostService;
}
