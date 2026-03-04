export type EventPayload = unknown[];
export type EventListener = (...payload: EventPayload) => void | Promise<void>;

export interface CoreEventBus {
  on(eventName: string, listener: EventListener): () => void;
  once(eventName: string, listener: EventListener): () => void;
  off(eventName: string, listener: EventListener): void;
  emit(eventName: string, ...payload: EventPayload): Promise<void>;
}

export interface SettingsService {
  saveDebounced(): void;
  saveNow(): Promise<void>;
}

export interface ChatService {
  getCurrentChatId(): string | undefined;
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
  generation: GenerationService;
  extensions: ExtensionHostService;
}
