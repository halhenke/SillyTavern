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
  avatarFile?: string;
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

export interface SessionChatSummary {
  fileName: string;
  fileSize?: string;
  isActive: boolean;
  lastMessageAt?: string;
  messageCount: number;
  previewMessage: string;
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

export interface CharacterCreateDraft {
  characterVersion: string;
  creator: string;
  creatorNotes: string;
  description: string;
  firstMessage: string;
  mesExamples: string;
  name: string;
  personality: string;
  postHistoryInstructions: string;
  scenario: string;
  systemPrompt: string;
  tags: string[];
  talkativeness: number;
}

export interface GroupProfile {
  activationStrategy: number;
  allowSelfResponses: boolean;
  autoModeDelay: number;
  chatId?: string;
  favorite: boolean;
  hideMutedSprites: boolean;
  id: string;
  memberAvatarFiles: string[];
  name: string;
  generationMode: number;
}

export interface GroupCreateDraft {
  activationStrategy: number;
  allowSelfResponses: boolean;
  autoModeDelay: number;
  favorite: boolean;
  hideMutedSprites: boolean;
  memberAvatarFiles: string[];
  name: string;
  generationMode: number;
}

export interface WorldInfoCatalog {
  names: string[];
  selectedNames: string[];
}

export interface WorldInfoDocument {
  data: unknown;
  name: string;
}

export interface PromptTemplate {
  content: string;
  enabled: boolean;
  forbidOverrides: boolean;
  identifier: string;
  injectionDepth: number;
  injectionOrder: number;
  injectionPosition: number;
  injectionTriggers: string[];
  name: string;
  role: string;
  systemPrompt: boolean;
}

export interface InstalledExtensionSummary {
  dependencies: string[];
  displayName: string;
  enabled: boolean;
  homePage?: string;
  jsFile?: string;
  name: string;
  requires: string[];
  type: string;
  version: string;
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
  swipeCount?: number;
  swipeIndex?: number;
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
  deleteCurrentSwipe(): Promise<void>;
  deleteMessage(id: number): Promise<void>;
  deleteLastMessage(): Promise<void>;
  duplicateMessage(id: number): Promise<void>;
  getCurrentChatId(): string | undefined;
  getMessages(): ChatMessageSummary[];
  getMetadata(): ChatMetadata;
  moveMessage(id: number, direction: 'down' | 'up'): Promise<void>;
  swipeLastMessage(direction: 'left' | 'right'): Promise<void>;
  updateMessage(id: number, text: string): Promise<void>;
  saveMetadata(next: ChatMetadata): Promise<void>;
}

export interface SessionService {
  clearCurrentChat(): Promise<void>;
  getCatalog(): SessionCatalog;
  getSessionHistory(query?: string): Promise<SessionChatSummary[]>;
  deleteChatFile(fileName: string): Promise<void>;
  openChatFile(fileName: string): Promise<void>;
  openGroup(groupId: string, chatId?: string): Promise<void>;
  reloadCurrentChat(): Promise<void>;
  renameChatFile(oldFileName: string, newName: string): Promise<void>;
  renameCurrentChat(nextName: string): Promise<void>;
  selectCharacter(id: number): Promise<void>;
}

export interface GenerationService {
  generateQuietPrompt(options: QuietPromptOptions): Promise<string>;
  stopGeneration(): void;
}

export interface CharacterService {
  createProfile(profile: CharacterCreateDraft): Promise<void>;
  getSelectedProfile(): Promise<CharacterProfile | null>;
  saveSelectedProfile(profile: CharacterProfile): Promise<void>;
}

export interface GroupService {
  createProfile(profile: GroupCreateDraft): Promise<void>;
  getSelectedProfile(): Promise<GroupProfile | null>;
  saveSelectedProfile(profile: GroupProfile): Promise<void>;
}

export interface WorldInfoService {
  createBook(name: string): Promise<void>;
  deleteBook(name: string): Promise<void>;
  listBooks(): WorldInfoCatalog;
  loadBook(name: string): Promise<WorldInfoDocument | null>;
  saveBook(name: string, data: unknown): Promise<void>;
  setSelectedBooks(names: string[]): Promise<void>;
}

export interface PromptService {
  listPrompts(): PromptTemplate[];
  movePrompt(identifier: string, direction: 'down' | 'up'): Promise<void>;
  savePrompt(prompt: PromptTemplate): Promise<void>;
}

export interface ComposerService {
  sendAndGenerate(text: string): Promise<void>;
  sendUserMessage(text: string): Promise<void>;
  triggerGeneration(mode: ComposerGenerationMode): Promise<void>;
}

export interface ExtensionHostService {
  getContext(): unknown;
  getEventTypes(): Record<string, string>;
  listInstalledExtensions(): Promise<InstalledExtensionSummary[]>;
  setExtensionEnabled(name: string, enabled: boolean): Promise<void>;
}

export interface ModernizationBridge {
  eventBus: CoreEventBus;
  settings: SettingsService;
  chat: ChatService;
  session: SessionService;
  generation: GenerationService;
  character: CharacterService;
  group: GroupService;
  worldInfo: WorldInfoService;
  prompts: PromptService;
  composer: ComposerService;
  extensions: ExtensionHostService;
}
