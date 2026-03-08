import {
  ChatService,
  ExtensionHostService,
  GenerationService,
  ModernizationBridge,
  SessionCatalog,
  SessionService,
  ShellCharacterSummary,
  ShellGroupSummary,
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

type LegacyCharacter = {
  avatar?: string;
  chat?: string;
  name?: string;
};

type LegacyGroup = {
  chat_id?: string;
  id?: string;
  members?: unknown[];
  name?: string;
};

type LegacyContext = {
  characterId?: number;
  characters?: LegacyCharacter[];
  clearChat?: () => Promise<void>;
  eventSource?: {
    on(eventName: string, listener: (...args: unknown[]) => void): void;
    once(eventName: string, listener: (...args: unknown[]) => void): void;
    removeListener(eventName: string, listener: (...args: unknown[]) => void): void;
    emit?(eventName: string, ...payload: unknown[]): Promise<void> | void;
  };
  eventTypes?: Record<string, string>;
  groupId?: string;
  getThumbnailUrl?: (type: string, file: string) => string;
  groups?: LegacyGroup[];
  mainApi?: string;
  maxContext?: number;
  name1?: string;
  name2?: string;
  openGroupChat?: (groupId: string, chatId?: string) => Promise<void>;
  onlineStatus?: string;
  powerUserSettings?: LegacyPowerUserSettings;
  reloadCurrentChat?: () => Promise<void>;
  renameChat?: (oldFileName: string, newName: string) => Promise<void>;
  saveSettingsDebounced?: () => void;
  saveSettings?: () => Promise<void>;
  getCurrentChatId?: () => string;
  selectCharacterById?: (id: number, options?: { switchMenu?: boolean }) => Promise<void>;
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

function getCharacterAvatarUrl(context: LegacyContext, avatar?: string) {
  if (!avatar || avatar === 'none') {
    return undefined;
  }

  return context.getThumbnailUrl?.('avatar', avatar) ?? avatar;
}

function getCharacterSummary(context: LegacyContext, character: LegacyCharacter, index: number): ShellCharacterSummary {
  return {
    avatarUrl: getCharacterAvatarUrl(context, character.avatar),
    chatId: character.chat,
    id: index,
    isSelected: context.groupId === undefined && context.characterId === index,
    name: character.name?.trim() || `Character ${index + 1}`,
  };
}

function getGroupSummary(context: LegacyContext, group: LegacyGroup): ShellGroupSummary | null {
  if (!group.id) {
    return null;
  }

  return {
    chatId: group.chat_id,
    id: group.id,
    isSelected: context.groupId === group.id,
    memberCount: Array.isArray(group.members) ? group.members.length : 0,
    name: group.name?.trim() || `Group ${group.id}`,
  };
}

function getSessionCatalog(context: LegacyContext): SessionCatalog {
  return {
    characters: (context.characters ?? []).map((character, index) => getCharacterSummary(context, character, index)),
    groups: (context.groups ?? [])
      .map((group) => getGroupSummary(context, group))
      .filter((group): group is ShellGroupSummary => Boolean(group)),
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

  const session: SessionService = {
    clearCurrentChat: async () => {
      await context.clearChat?.();
    },
    getCatalog: () => getSessionCatalog(context),
    openGroup: async (groupId, chatId) => {
      await context.openGroupChat?.(groupId, chatId);
    },
    reloadCurrentChat: async () => {
      await context.reloadCurrentChat?.();
    },
    renameCurrentChat: async (nextName) => {
      const currentChatId = context.getCurrentChatId?.();
      if (!currentChatId) {
        throw new Error('No active chat to rename');
      }

      const trimmedName = nextName.trim();
      if (!trimmedName) {
        throw new Error('Chat name is required');
      }

      await context.renameChat?.(currentChatId, trimmedName);
    },
    selectCharacter: async (id) => {
      await context.selectCharacterById?.(id, { switchMenu: false });
    },
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
    session,
    generation,
    extensions,
  };
}
