import {
  CharacterCreateDraft,
  CharacterProfile,
  CharacterService,
  GroupCreateDraft,
  GroupProfile,
  GroupService,
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
  SessionChatSummary,
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
  activation_strategy?: number;
  allow_self_responses?: boolean;
  auto_mode_delay?: number;
  avatar_url?: string;
  chat_metadata?: Record<string, unknown>;
  chats?: string[];
  chat_id?: string;
  disabled_members?: string[];
  fav?: boolean;
  generation_mode?: number;
  hideMutedSprites?: boolean;
  id?: string;
  members?: string[];
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
  deleteCharacterChatByName?: (characterId: string, fileName: string) => Promise<void>;
  deleteSwipe?: () => Promise<unknown>;
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
  openCharacterChat?: (fileName: string) => Promise<void>;
  onlineStatus?: string;
  powerUserSettings?: LegacyPowerUserSettings;
  reloadCurrentChat?: () => Promise<void>;
  renameChat?: (oldFileName: string, newName: string) => Promise<void>;
  saveChat?: () => Promise<void>;
  sendMessageAsUser?: (messageText: string, messageBias?: string) => Promise<unknown>;
  sendSystemMessage?: (type: string, text: string, extra?: Record<string, unknown>) => unknown;
  saveMetadata?: () => Promise<void>;
  saveSettingsDebounced?: () => void;
  saveSettings?: () => Promise<void>;
  swipe?: {
    left?: () => unknown;
    right?: () => unknown;
  };
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
  createCharacter?: (profile: CharacterCreateDraft) => Promise<void>;
  defaultAvatar?: string;
  humanizedDateTime?: () => string;
  openGroupById?: (groupId: string) => Promise<boolean | void>;
  substituteParams?: (text: string) => string;
  selectCharacterById?: (id: number, options?: { switchMenu?: boolean }) => Promise<void>;
  stopGeneration?: () => void;
  unshallowCharacter?: (id: number) => Promise<void>;
  updateChatMetadata?: (metadata: Record<string, unknown>, reset?: boolean) => void;
  updateMessageBlock?: (messageId: number, message: unknown, options?: { rerenderMessage?: boolean }) => unknown;
  deleteGroupChatByName?: (groupId: string, chatName: string) => Promise<void>;
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
    avatarFile: character.avatar,
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

function getSelectedGroup(context: LegacyContext) {
  const groupId = context.groupId;
  if (!groupId) {
    return null;
  }

  const group = context.groups?.find((item) => item.id === groupId);
  if (!group?.id) {
    return null;
  }

  return group;
}

function getSelectedGroupProfile(context: LegacyContext): GroupProfile | null {
  const group = getSelectedGroup(context);
  if (!group?.id) {
    return null;
  }

  return {
    activationStrategy: Number(group.activation_strategy ?? 0),
    allowSelfResponses: Boolean(group.allow_self_responses),
    autoModeDelay: Number(group.auto_mode_delay ?? 5),
    chatId: group.chat_id,
    favorite: Boolean(group.fav),
    generationMode: Number(group.generation_mode ?? 0),
    hideMutedSprites: Boolean(group.hideMutedSprites),
    id: group.id,
    memberAvatarFiles: Array.isArray(group.members) ? [...group.members] : [],
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

function getCurrentSessionCharacter(context: LegacyContext) {
  if (context.groupId !== undefined && context.groupId !== null) {
    return null;
  }

  return getSelectedCharacter(context);
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

type LegacyChatSearchResult = {
  file_name: string;
  file_size?: string;
  last_mes?: string;
  message_count?: number;
  preview_message?: string;
};

async function getSessionHistory(context: LegacyContext, query = ''): Promise<SessionChatSummary[]> {
  const selectedCharacter = getCurrentSessionCharacter(context);
  const selectedGroupId = context.groupId;

  if (!selectedCharacter && !selectedGroupId) {
    return [];
  }

  const response = await fetch('/api/chats/search', {
    method: 'POST',
    headers: context.getRequestHeaders?.(),
    body: JSON.stringify({
      query,
      avatar_url: selectedGroupId ? null : selectedCharacter?.character.avatar ?? null,
      group_id: selectedGroupId ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error('Could not load session history');
  }

  const data = (await response.json()) as LegacyChatSearchResult[];
  const currentChatId = context.getCurrentChatId?.();

  return data.map((chat) => {
    const fileName = String(chat.file_name ?? '').replace(/\.jsonl$/, '');
    return {
      fileName,
      fileSize: chat.file_size,
      isActive: currentChatId === fileName,
      lastMessageAt: chat.last_mes,
      messageCount: Number(chat.message_count ?? 0),
      previewMessage: String(chat.preview_message ?? ''),
    };
  });
}

function getChatMessages(context: LegacyContext): ChatMessageSummary[] {
  return (context.chat ?? []).map((message, index) => ({
    id: index,
    isSystem: Boolean(message.is_system),
    isUser: Boolean(message.is_user),
    name: message.name ?? (message.is_user ? context.name1 ?? 'User' : context.name2 ?? 'Assistant'),
    swipeCount: Array.isArray((message as { swipes?: unknown[] }).swipes) ? (message as { swipes: unknown[] }).swipes.length : undefined,
    swipeIndex: typeof (message as { swipe_id?: unknown }).swipe_id === 'number' ? (message as { swipe_id: number }).swipe_id : undefined,
    text: message.mes ?? '',
    timestamp: message.send_date,
    tokenCount: message.extra?.token_count,
  }));
}

function getChatMessage(context: LegacyContext, id: number) {
  const message = context.chat?.[id];
  if (!message) {
    throw new Error('Message not found');
  }

  return message;
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
    deleteCurrentSwipe: async () => {
      if (!context.deleteSwipe) {
        throw new Error('Swipe deletion unavailable');
      }

      await context.deleteSwipe();
    },
    deleteMessage: async (id) => {
      getChatMessage(context, id);
      context.chat?.splice(id, 1);
      if (context.chatMetadata) {
        context.chatMetadata.tainted = true;
      }

      await context.eventSource?.emit?.(context.eventTypes?.MESSAGE_DELETED ?? 'message_deleted', context.chat?.length ?? 0);
      await context.saveChat?.();
      await context.reloadCurrentChat?.();
    },
    deleteLastMessage: async () => {
      await context.deleteLastMessage?.();
    },
    duplicateMessage: async (id) => {
      const message = structuredClone(getChatMessage(context, id)) as NonNullable<LegacyContext['chat']>[number];
      message.send_date = String(Date.now());

      context.chat?.splice(id + 1, 0, message);
      if (context.chatMetadata) {
        context.chatMetadata.tainted = true;
      }

      await context.saveChat?.();
      await context.reloadCurrentChat?.();
    },
    getCurrentChatId: () => context.getCurrentChatId?.(),
    getMessages: () => getChatMessages(context),
    getMetadata: () => getChatMetadata(context),
    moveMessage: async (id, direction) => {
      const targetId = direction === 'up' ? id - 1 : id + 1;
      const currentMessage = getChatMessage(context, id);
      const targetMessage = getChatMessage(context, targetId);
      const chatState = context.chat;
      if (!chatState) {
        throw new Error('Chat state unavailable');
      }

      chatState[targetId] = currentMessage;
      chatState[id] = targetMessage;

      if (context.chatMetadata) {
        context.chatMetadata.tainted = true;
      }

      await context.saveChat?.();
      await context.reloadCurrentChat?.();
    },
    swipeLastMessage: async (direction) => {
      const action = direction === 'left' ? context.swipe?.left : context.swipe?.right;
      if (!action) {
        throw new Error('Swipe controls unavailable');
      }

      await Promise.resolve(action());
    },
    updateMessage: async (id, text) => {
      const message = getChatMessage(context, id);

      const nextText = id === 0 ? (context.substituteParams?.(text) ?? text) : text;
      message.mes = nextText;

      await context.eventSource?.emit?.(context.eventTypes?.MESSAGE_EDITED ?? 'message_edited', id);
      context.updateMessageBlock?.(id, message, { rerenderMessage: true });
      await context.eventSource?.emit?.(context.eventTypes?.MESSAGE_UPDATED ?? 'message_updated', id);
      await context.saveChat?.();
    },
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
    deleteChatFile: async (fileName) => {
      const trimmedFileName = fileName.trim();
      if (!trimmedFileName) {
        throw new Error('Chat file name is required');
      }

      if (context.groupId) {
        if (!context.deleteGroupChatByName) {
          throw new Error('Group chat deletion unavailable');
        }

        await context.deleteGroupChatByName(context.groupId, trimmedFileName);
        return;
      }

      const selectedCharacter = getCurrentSessionCharacter(context);
      if (!selectedCharacter || !context.deleteCharacterChatByName) {
        throw new Error('Character chat deletion unavailable');
      }

      await context.deleteCharacterChatByName(String(selectedCharacter.characterId), trimmedFileName);
    },
    getCatalog: () => getSessionCatalog(context),
    getSessionHistory: async (query) => getSessionHistory(context, query),
    openChatFile: async (fileName) => {
      const trimmedFileName = fileName.trim();
      if (!trimmedFileName) {
        throw new Error('Chat file name is required');
      }

      if (context.groupId) {
        await context.openGroupChat?.(context.groupId, trimmedFileName);
        return;
      }

      await context.openCharacterChat?.(trimmedFileName);
    },
    openGroup: async (groupId, chatId) => {
      await context.openGroupChat?.(groupId, chatId);
    },
    reloadCurrentChat: async () => {
      await context.reloadCurrentChat?.();
    },
    renameChatFile: async (oldFileName, newName) => {
      const trimmedOldName = oldFileName.trim();
      const trimmedNewName = newName.trim();
      if (!trimmedOldName || !trimmedNewName) {
        throw new Error('Both chat names are required');
      }

      await context.renameChat?.(trimmedOldName, trimmedNewName);
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
    createProfile: async (profile) => {
      const trimmedName = profile.name.trim();
      if (!trimmedName) {
        throw new Error('Character name is required');
      }

      if (!context.createCharacter) {
        throw new Error('Character creation unavailable');
      }

      await context.createCharacter({
        ...profile,
        name: trimmedName,
      });
      await context.getCharacters?.();
    },
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

  const group: GroupService = {
    createProfile: async (profile) => {
      const memberAvatarFiles = profile.memberAvatarFiles.filter(Boolean);
      if (!memberAvatarFiles.length) {
        throw new Error('At least one group member is required');
      }

      const memberNames = (context.characters ?? [])
        .filter((character) => character.avatar && memberAvatarFiles.includes(character.avatar))
        .map((character) => character.name?.trim())
        .filter((name): name is string => Boolean(name));
      const groupName = profile.name.trim() || `Group: ${memberNames.join(', ')}`;
      const chatName = context.humanizedDateTime?.() ?? new Date().toISOString();
      const response = await fetch('/api/groups/create', {
        method: 'POST',
        headers: context.getRequestHeaders?.(),
        body: JSON.stringify({
          activation_strategy: profile.activationStrategy,
          allow_self_responses: profile.allowSelfResponses,
          auto_mode_delay: profile.autoModeDelay,
          avatar_url: context.defaultAvatar ?? '',
          chat_id: chatName,
          chat_metadata: {},
          chats: [chatName],
          disabled_members: [],
          fav: profile.favorite,
          generation_mode: profile.generationMode,
          hideMutedSprites: profile.hideMutedSprites,
          members: memberAvatarFiles,
          name: groupName,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Group creation failed');
      }

      const createdGroup = (await response.json()) as { id?: string };
      await context.getCharacters?.();

      if (createdGroup.id) {
        await context.openGroupById?.(createdGroup.id);
      }
    },
    getSelectedProfile: async () => getSelectedGroupProfile(context),
    saveSelectedProfile: async (profile) => {
      const currentGroup = getSelectedGroup(context);
      if (!currentGroup?.id) {
        throw new Error('No selected group to save');
      }

      const nextGroup: LegacyGroup = {
        ...structuredClone(currentGroup),
        activation_strategy: profile.activationStrategy,
        allow_self_responses: profile.allowSelfResponses,
        auto_mode_delay: profile.autoModeDelay,
        fav: profile.favorite,
        generation_mode: profile.generationMode,
        hideMutedSprites: profile.hideMutedSprites,
        members: [...profile.memberAvatarFiles],
        name: profile.name.trim() || currentGroup.name || `Group ${currentGroup.id}`,
      };

      if (currentGroup.id === context.groupId) {
        nextGroup.chat_metadata = structuredClone(context.chatMetadata ?? {});
      }

      const response = await fetch('/api/groups/edit', {
        method: 'POST',
        headers: context.getRequestHeaders?.(),
        body: JSON.stringify(nextGroup),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Group save failed');
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
    group,
    composer,
    extensions,
  };
}
