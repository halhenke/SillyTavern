import {
  ChatService,
  ExtensionHostService,
  GenerationService,
  ModernizationBridge,
  SettingsService,
} from '../core/contracts';
import { createCoreEventBus } from '../core/eventBus';

type LegacyContext = {
  eventSource?: {
    on(eventName: string, listener: (...args: unknown[]) => void): void;
    once(eventName: string, listener: (...args: unknown[]) => void): void;
    removeListener(eventName: string, listener: (...args: unknown[]) => void): void;
    emit?(eventName: string, ...payload: unknown[]): Promise<void> | void;
  };
  eventTypes?: Record<string, string>;
  saveSettingsDebounced?: () => void;
  saveSettings?: () => Promise<void>;
  getCurrentChatId?: () => string;
  stopGeneration?: () => void;
};

type LegacySillyTavern = {
  getContext?: () => LegacyContext;
};

export type LegacyBridge = ModernizationBridge;

function getSillyTavern(windowObject: Window): LegacySillyTavern | undefined {
  const source = windowObject as Window & { SillyTavern?: LegacySillyTavern };
  return source.SillyTavern;
}

export function createLegacyBridge(windowObject: Window): LegacyBridge | null {
  const sillyTavern = getSillyTavern(windowObject);
  const context = sillyTavern?.getContext?.();

  if (!context?.eventSource) {
    return null;
  }

  const settings: SettingsService = {
    saveDebounced: () => context.saveSettingsDebounced?.(),
    saveNow: async () => {
      await context.saveSettings?.();
    },
  };

  const chat: ChatService = {
    getCurrentChatId: () => context.getCurrentChatId?.(),
  };

  const generation: GenerationService = {
    stopGeneration: () => context.stopGeneration?.(),
  };

  const extensions: ExtensionHostService = {
    getContext: () => context,
    getEventTypes: () => context.eventTypes ?? {},
  };

  return {
    eventBus: createCoreEventBus(context.eventSource),
    settings,
    chat,
    generation,
    extensions,
  };
}
