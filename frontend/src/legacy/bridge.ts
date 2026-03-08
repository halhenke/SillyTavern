import {
  ChatService,
  ExtensionHostService,
  GenerationService,
  ModernizationBridge,
  ShellPreferences,
  ShellSnapshot,
  SettingsService,
} from '../core/contracts';
import { createCoreEventBus } from '../core/eventBus';

type LegacyPowerUserSettings = {
  auto_scroll_chat_to_bottom?: boolean;
  collapse_newlines?: boolean;
  message_token_count_enabled?: boolean;
  trim_sentences?: boolean;
  trim_spaces?: boolean;
};

type LegacyContext = {
  characterId?: number;
  eventSource?: {
    on(eventName: string, listener: (...args: unknown[]) => void): void;
    once(eventName: string, listener: (...args: unknown[]) => void): void;
    removeListener(eventName: string, listener: (...args: unknown[]) => void): void;
    emit?(eventName: string, ...payload: unknown[]): Promise<void> | void;
  };
  eventTypes?: Record<string, string>;
  groupId?: string;
  mainApi?: string;
  maxContext?: number;
  name1?: string;
  name2?: string;
  onlineStatus?: string;
  powerUserSettings?: LegacyPowerUserSettings;
  saveSettingsDebounced?: () => void;
  saveSettings?: () => Promise<void>;
  getCurrentChatId?: () => string;
  stopGeneration?: () => void;
};

type LegacySillyTavern = {
  getContext?: () => LegacyContext;
};

export type LegacyBridge = ModernizationBridge;

function readPreferences(powerUserSettings?: LegacyPowerUserSettings): ShellPreferences {
  return {
    autoScrollChatToBottom: Boolean(powerUserSettings?.auto_scroll_chat_to_bottom),
    collapseNewlines: Boolean(powerUserSettings?.collapse_newlines),
    messageTokenCountEnabled: Boolean(powerUserSettings?.message_token_count_enabled),
    trimSentences: Boolean(powerUserSettings?.trim_sentences),
    trimSpaces: Boolean(powerUserSettings?.trim_spaces),
  };
}

function writePreferences(powerUserSettings: LegacyPowerUserSettings, next: Partial<ShellPreferences>) {
  if (next.autoScrollChatToBottom !== undefined) {
    powerUserSettings.auto_scroll_chat_to_bottom = next.autoScrollChatToBottom;
  }
  if (next.collapseNewlines !== undefined) {
    powerUserSettings.collapse_newlines = next.collapseNewlines;
  }
  if (next.messageTokenCountEnabled !== undefined) {
    powerUserSettings.message_token_count_enabled = next.messageTokenCountEnabled;
  }
  if (next.trimSentences !== undefined) {
    powerUserSettings.trim_sentences = next.trimSentences;
  }
  if (next.trimSpaces !== undefined) {
    powerUserSettings.trim_spaces = next.trimSpaces;
  }
}

function getShellSnapshot(context: LegacyContext): ShellSnapshot {
  return {
    canSaveSettings: Boolean(context.saveSettingsDebounced || context.saveSettings),
    characterId: context.characterId,
    characterName: context.name2,
    currentChatId: context.getCurrentChatId?.(),
    groupId: context.groupId,
    mainApi: context.mainApi,
    onlineStatus: context.onlineStatus,
    preferences: readPreferences(context.powerUserSettings),
    userName: context.name1,
  };
}

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
    getShellSnapshot: () => getShellSnapshot(context),
    updateShellPreferences: async (next) => {
      if (!context.powerUserSettings) {
        throw new Error('Legacy power user settings unavailable');
      }

      writePreferences(context.powerUserSettings, next);
      if (context.saveSettingsDebounced) {
        context.saveSettingsDebounced();
        return;
      }
      await context.saveSettings?.();
    },
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
