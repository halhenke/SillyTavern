import {
  CharacterProfile,
  CharacterService,
  ChatMetadata,
  ChatMessageSummary,
  ChatService,
  ComposerGenerationMode,
  ComposerService,
  ExtensionHostService,
  GenerationService,
  ModernizationBridge,
  QuietPromptOptions,
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
  auto_continue?: {
    allow_chat_completions?: boolean;
    enabled?: boolean;
    target_length?: number;
  };
  auto_scroll_chat_to_bottom?: boolean;
  collapse_newlines?: boolean;
  compact_input_area?: boolean;
  console_log_prompts?: boolean;
  continue_on_send?: boolean;
  message_token_count_enabled?: boolean;
  quick_continue?: boolean;
  quick_impersonate?: boolean;
  request_token_probabilities?: boolean;
  restore_user_input?: boolean;
  trim_sentences?: boolean;
  trim_spaces?: boolean;
};

type LegacyCharacter = {
  avatar?: string;
  chat?: string;
  create_date?: string;
  creator?: string;
  creatorcomment?: string;
  data?: {
    alternate_greetings?: string[];
    character_version?: string;
    creator?: string;
    creator_notes?: string;
    extensions?: {
      depth_prompt?: {
        depth?: number;
        prompt?: string;
        role?: string;
      };
      fav?: boolean;
      talkativeness?: number;
      world?: string;
    };
    mes_example?: string;
    name?: string;
    personality?: string;
    post_history_instructions?: string;
    scenario?: string;
    system_prompt?: string;
    tags?: string[];
  };
  description?: string;
  first_mes?: string;
  json_data?: string;
  mes_example?: string;
  name?: string;
  personality?: string;
  scenario?: string;
  talkativeness?: number;
  tags?: string[];
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
  chat?: Array<{
    extra?: {
      token_count?: number;
    };
    is_system?: boolean;
    is_user?: boolean;
    mes?: string;
    name?: string;
    send_date?: string;
  }>;
  clearChat?: () => Promise<void>;
  chatMetadata?: Record<string, unknown>;
  deleteLastMessage?: () => Promise<void>;
  eventSource?: {
    on(eventName: string, listener: (...args: unknown[]) => void): void;
    once(eventName: string, listener: (...args: unknown[]) => void): void;
    removeListener(eventName: string, listener: (...args: unknown[]) => void): void;
    emit?(eventName: string, ...payload: unknown[]): Promise<void> | void;
  };
  eventTypes?: Record<string, string>;
  generateQuietPrompt?: (options?: {
    quietPrompt?: string;
    quietToLoud?: boolean;
    responseLength?: number | null;
    removeReasoning?: boolean;
    trimToSentence?: boolean;
  }) => Promise<string>;
  generate?: (type: ComposerGenerationMode, options?: Record<string, unknown>, dryRun?: boolean) => Promise<unknown>;
  groupId?: string;
  getThumbnailUrl?: (type: string, file: string) => string;
  getRequestHeaders?: () => HeadersInit;
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
  sendMessageAsUser?: (messageText: string, messageBias?: string) => Promise<unknown>;
  sendSystemMessage?: (type: string, text: string, extra?: Record<string, unknown>) => unknown;
  saveMetadata?: () => Promise<void>;
  saveSettingsDebounced?: () => void;
  saveSettings?: () => Promise<void>;
  getCurrentChatId?: () => string;
  getCharacters?: () => Promise<void>;
  getCharacterCardFields?: (options?: { chid?: number | null }) => {
    charDepthPrompt?: string;
    creatorNotes?: string;
    description?: string;
    jailbreak?: string;
    mesExamples?: string;
    personality?: string;
    scenario?: string;
    system?: string;
    version?: string;
  };
  selectCharacterById?: (id: number, options?: { switchMenu?: boolean }) => Promise<void>;
  stopGeneration?: () => void;
  unshallowCharacter?: (id: number) => Promise<void>;
  updateChatMetadata?: (metadata: Record<string, unknown>, reset?: boolean) => void;
};

type LegacySillyTavern = {
  getContext?: () => LegacyContext;
};

export type LegacyBridge = ModernizationBridge;

function readPreferences(powerUserSettings?: LegacyPowerUserSettings): ShellPreferences {
  return {
    autoScrollChatToBottom: Boolean(powerUserSettings?.auto_scroll_chat_to_bottom),
    autoContinueAllowChatCompletions: Boolean(powerUserSettings?.auto_continue?.allow_chat_completions),
    autoContinueEnabled: Boolean(powerUserSettings?.auto_continue?.enabled),
    autoContinueTargetLength: Number(powerUserSettings?.auto_continue?.target_length ?? 400),
    collapseNewlines: Boolean(powerUserSettings?.collapse_newlines),
    compactInputArea: Boolean(powerUserSettings?.compact_input_area),
    consoleLogPrompts: Boolean(powerUserSettings?.console_log_prompts),
    continueOnSend: Boolean(powerUserSettings?.continue_on_send),
    messageTokenCountEnabled: Boolean(powerUserSettings?.message_token_count_enabled),
    quickContinue: Boolean(powerUserSettings?.quick_continue),
    quickImpersonate: Boolean(powerUserSettings?.quick_impersonate),
    requestTokenProbabilities: Boolean(powerUserSettings?.request_token_probabilities),
    restoreUserInput: Boolean(powerUserSettings?.restore_user_input),
    trimSentences: Boolean(powerUserSettings?.trim_sentences),
    trimSpaces: Boolean(powerUserSettings?.trim_spaces),
  };
}

function writePreferences(powerUserSettings: LegacyPowerUserSettings, next: Partial<ShellPreferences>) {
  if (next.autoScrollChatToBottom !== undefined) {
    powerUserSettings.auto_scroll_chat_to_bottom = next.autoScrollChatToBottom;
  }
  if (next.autoContinueAllowChatCompletions !== undefined) {
    powerUserSettings.auto_continue ??= {};
    powerUserSettings.auto_continue.allow_chat_completions = next.autoContinueAllowChatCompletions;
  }
  if (next.autoContinueEnabled !== undefined) {
    powerUserSettings.auto_continue ??= {};
    powerUserSettings.auto_continue.enabled = next.autoContinueEnabled;
  }
  if (next.autoContinueTargetLength !== undefined) {
    powerUserSettings.auto_continue ??= {};
    powerUserSettings.auto_continue.target_length = next.autoContinueTargetLength;
  }
  if (next.collapseNewlines !== undefined) {
    powerUserSettings.collapse_newlines = next.collapseNewlines;
  }
  if (next.compactInputArea !== undefined) {
    powerUserSettings.compact_input_area = next.compactInputArea;
  }
  if (next.consoleLogPrompts !== undefined) {
    powerUserSettings.console_log_prompts = next.consoleLogPrompts;
  }
  if (next.continueOnSend !== undefined) {
    powerUserSettings.continue_on_send = next.continueOnSend;
  }
  if (next.messageTokenCountEnabled !== undefined) {
    powerUserSettings.message_token_count_enabled = next.messageTokenCountEnabled;
  }
  if (next.quickContinue !== undefined) {
    powerUserSettings.quick_continue = next.quickContinue;
  }
  if (next.quickImpersonate !== undefined) {
    powerUserSettings.quick_impersonate = next.quickImpersonate;
  }
  if (next.requestTokenProbabilities !== undefined) {
    powerUserSettings.request_token_probabilities = next.requestTokenProbabilities;
  }
  if (next.restoreUserInput !== undefined) {
    powerUserSettings.restore_user_input = next.restoreUserInput;
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

function getSelectedCharacter(context: LegacyContext) {
  const characterId = context.characterId;
  if (characterId === undefined || characterId === null) {
    return null;
  }

  const character = context.characters?.[characterId];
  if (!character) {
    return null;
  }

  return { character, characterId };
}

function getSelectedCharacterProfile(context: LegacyContext): CharacterProfile | null {
  const selected = getSelectedCharacter(context);
  if (!selected) {
    return null;
  }

  const { character, characterId } = selected;
  const cardFields = context.getCharacterCardFields?.({ chid: characterId });

  return {
    avatarFile: character.avatar,
    avatarUrl: getCharacterAvatarUrl(context, character.avatar),
    characterVersion: cardFields?.version ?? character.data?.character_version ?? '',
    chatId: character.chat,
    creator: character.data?.creator ?? character.creator ?? '',
    creatorNotes: cardFields?.creatorNotes ?? character.data?.creator_notes ?? character.creatorcomment ?? '',
    description: cardFields?.description ?? character.description ?? '',
    firstMessage: character.first_mes ?? '',
    id: characterId,
    mesExamples: cardFields?.mesExamples ?? character.mes_example ?? character.data?.mes_example ?? '',
    name: character.name?.trim() || `Character ${characterId + 1}`,
    personality: cardFields?.personality ?? character.personality ?? '',
    postHistoryInstructions: cardFields?.jailbreak ?? character.data?.post_history_instructions ?? '',
    scenario: cardFields?.scenario ?? character.scenario ?? '',
    systemPrompt: cardFields?.system ?? character.data?.system_prompt ?? '',
    tags: character.data?.tags ?? character.tags ?? [],
    talkativeness: Number(character.data?.extensions?.talkativeness ?? character.talkativeness ?? 0.5),
  };
}

function getChatMetadata(context: LegacyContext): ChatMetadata {
  return {
    scenario: typeof context.chatMetadata?.scenario === 'string' ? context.chatMetadata.scenario : '',
  };
}

function getChatMessages(context: LegacyContext): ChatMessageSummary[] {
  return (context.chat ?? []).map((message, index) => ({
    id: index,
    isSystem: Boolean(message.is_system),
    isUser: Boolean(message.is_user),
    name: message.name ?? (message.is_user ? context.name1 ?? 'User' : context.name2 ?? 'Assistant'),
    text: message.mes ?? '',
    timestamp: message.send_date,
    tokenCount: message.extra?.token_count,
  }));
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
    addSystemMessage: async (text) => {
      const trimmedText = text.trim();
      if (!trimmedText) {
        throw new Error('System note text is required');
      }

      context.sendSystemMessage?.('generic', trimmedText);
    },
    deleteLastMessage: async () => {
      await context.deleteLastMessage?.();
    },
    getCurrentChatId: () => context.getCurrentChatId?.(),
    getMessages: () => getChatMessages(context),
    getMetadata: () => getChatMetadata(context),
    saveMetadata: async (next) => {
      const mergedMetadata = {
        ...(context.chatMetadata ?? {}),
        scenario: next.scenario,
      };
      context.updateChatMetadata?.(mergedMetadata, true);
      await context.saveMetadata?.();
    },
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
    generateQuietPrompt: async (options: QuietPromptOptions) => {
      const response = await context.generateQuietPrompt?.({
        quietPrompt: options.prompt,
        quietToLoud: options.quietToLoud,
        responseLength: options.responseLength,
        removeReasoning: true,
        trimToSentence: options.trimToSentence,
      });

      return response ?? '';
    },
    stopGeneration: () => context.stopGeneration?.(),
  };

  const character: CharacterService = {
    getSelectedProfile: async () => {
      const selected = getSelectedCharacter(context);
      if (!selected) {
        return null;
      }

      await context.unshallowCharacter?.(selected.characterId);
      return getSelectedCharacterProfile(context);
    },
    saveSelectedProfile: async (profile) => {
      const selected = getSelectedCharacter(context);
      const avatarFile = selected?.character?.avatar;
      if (!avatarFile) {
        throw new Error('No selected character to save');
      }

      const current = selected.character;
      const formData = new FormData();
      formData.set('avatar_url', avatarFile);
      formData.set('chat', current.chat ?? '');
      formData.set('create_date', current.create_date ?? '');
      formData.set('json_data', current.json_data ?? '');
      formData.set('ch_name', profile.name.trim());
      formData.set('description', profile.description);
      formData.set('personality', profile.personality);
      formData.set('scenario', profile.scenario);
      formData.set('first_mes', profile.firstMessage);
      formData.set('mes_example', profile.mesExamples);
      formData.set('creator_notes', profile.creatorNotes);
      formData.set('system_prompt', profile.systemPrompt);
      formData.set('post_history_instructions', profile.postHistoryInstructions);
      formData.set('character_version', profile.characterVersion);
      formData.set('creator', profile.creator);
      formData.set('tags', profile.tags.join(', '));
      formData.set('talkativeness', String(profile.talkativeness));
      formData.set('fav', String(Boolean(current.data?.extensions?.fav)));
      formData.set('world', current.data?.extensions?.world ?? '');
      formData.set('depth_prompt_prompt', current.data?.extensions?.depth_prompt?.prompt ?? '');
      formData.set('depth_prompt_depth', String(current.data?.extensions?.depth_prompt?.depth ?? 4));
      formData.set('depth_prompt_role', current.data?.extensions?.depth_prompt?.role ?? 'system');

      const alternateGreetings = current.data?.alternate_greetings ?? [];
      for (const greeting of alternateGreetings) {
        formData.append('alternate_greetings', greeting);
      }

      const response = await fetch('/api/characters/edit', {
        method: 'POST',
        headers: context.getRequestHeaders?.(),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Character save failed');
      }

      await context.getCharacters?.();
    },
  };

  const extensions: ExtensionHostService = {
    getContext: () => context,
    getEventTypes: () => context.eventTypes ?? {},
  };

  const composer: ComposerService = {
    sendAndGenerate: async (text) => {
      const trimmedText = text.trim();
      if (!trimmedText) {
        throw new Error('Message text is required');
      }

      await context.sendMessageAsUser?.(trimmedText, '');
      await context.generate?.('normal');
    },
    sendUserMessage: async (text) => {
      const trimmedText = text.trim();
      if (!trimmedText) {
        throw new Error('Message text is required');
      }

      await context.sendMessageAsUser?.(trimmedText, '');
    },
    triggerGeneration: async (mode) => {
      await context.generate?.(mode);
    },
  };

  return {
    eventBus: createCoreEventBus(context.eventSource),
    settings,
    chat,
    session,
    generation,
    character,
    composer,
    extensions,
  };
}
