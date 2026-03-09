import { describe, expect, it, vi } from 'vitest';

import { createLegacyBridge } from '../legacy/bridge';

describe('createLegacyBridge', () => {
  it('maps a shell snapshot from the legacy context', () => {
    const windowObject = {
      SillyTavern: {
        getContext: () => ({
          characterId: 7,
          eventSource: {
            emit: vi.fn(),
            off: vi.fn(),
            on: vi.fn(),
            once: vi.fn(),
            removeListener: vi.fn(),
          },
          getCurrentChatId: () => 'chat-42',
          groupId: 'group-9',
          mainApi: 'openai',
          name1: 'Hal',
          name2: 'Airi',
          onlineStatus: 'Connected',
          powerUserSettings: {
            auto_continue: {
              allow_chat_completions: true,
              enabled: true,
              target_length: 550,
            },
            auto_scroll_chat_to_bottom: true,
            collapse_newlines: false,
            compact_input_area: true,
            console_log_prompts: true,
            continue_on_send: true,
            message_token_count_enabled: true,
            quick_continue: true,
            quick_impersonate: false,
            request_token_probabilities: true,
            restore_user_input: true,
            trim_sentences: false,
            trim_spaces: true,
          },
          saveSettings: vi.fn(),
          saveSettingsDebounced: vi.fn(),
          stopGeneration: vi.fn(),
        }),
      },
    } as unknown as Window;

    const bridge = createLegacyBridge(windowObject);

    expect(bridge).not.toBeNull();
    expect(bridge?.settings.getShellSnapshot()).toEqual({
      canSaveSettings: true,
      characterId: 7,
      characterName: 'Airi',
      currentChatId: 'chat-42',
      groupId: 'group-9',
      mainApi: 'openai',
      onlineStatus: 'Connected',
      preferences: {
        autoScrollChatToBottom: true,
        autoContinueAllowChatCompletions: true,
        autoContinueEnabled: true,
        autoContinueTargetLength: 550,
        collapseNewlines: false,
        compactInputArea: true,
        consoleLogPrompts: true,
        continueOnSend: true,
        messageTokenCountEnabled: true,
        quickContinue: true,
        quickImpersonate: false,
        requestTokenProbabilities: true,
        restoreUserInput: true,
        trimSentences: false,
        trimSpaces: true,
      },
      userName: 'Hal',
    });
  });

  it('updates shell preferences and prefers debounced save', async () => {
    const saveSettingsDebounced = vi.fn();
    const saveSettings = vi.fn();
    const powerUserSettings = {
      auto_continue: {
        allow_chat_completions: false,
        enabled: false,
        target_length: 400,
      },
      auto_scroll_chat_to_bottom: false,
      collapse_newlines: false,
      compact_input_area: false,
      console_log_prompts: false,
      continue_on_send: false,
      message_token_count_enabled: false,
      quick_continue: false,
      quick_impersonate: false,
      request_token_probabilities: false,
      restore_user_input: false,
      trim_sentences: false,
      trim_spaces: false,
    };

    const windowObject = {
      SillyTavern: {
        getContext: () => ({
          eventSource: {
            emit: vi.fn(),
            off: vi.fn(),
            on: vi.fn(),
            once: vi.fn(),
            removeListener: vi.fn(),
          },
          powerUserSettings,
          saveSettings,
          saveSettingsDebounced,
        }),
      },
    } as unknown as Window;

    const bridge = createLegacyBridge(windowObject);

    await bridge?.settings.updateShellPreferences({
      autoContinueEnabled: true,
      autoContinueTargetLength: 620,
      collapseNewlines: true,
      continueOnSend: true,
      requestTokenProbabilities: true,
      trimSpaces: true,
    });

    expect(powerUserSettings.auto_continue.enabled).toBe(true);
    expect(powerUserSettings.auto_continue.target_length).toBe(620);
    expect(powerUserSettings.collapse_newlines).toBe(true);
    expect(powerUserSettings.continue_on_send).toBe(true);
    expect(powerUserSettings.request_token_probabilities).toBe(true);
    expect(powerUserSettings.trim_spaces).toBe(true);
    expect(saveSettingsDebounced).toHaveBeenCalledTimes(1);
    expect(saveSettings).not.toHaveBeenCalled();
  });

  it('maps session catalog and delegates character and group actions', async () => {
    const clearChat = vi.fn();
    const deleteLastMessage = vi.fn();
    const deleteSwipe = vi.fn();
    const eventEmit = vi.fn();
    const generateQuietPrompt = vi.fn().mockResolvedValue('quiet result');
    const generate = vi.fn();
    const getCharacters = vi.fn();
    const getRequestHeaders = vi.fn(() => ({ 'X-CSRF-Token': 'token' }));
    const getCharacterCardFields = vi.fn(() => ({
      creatorNotes: 'Card notes',
      description: 'Card description',
      jailbreak: 'Stay in character',
      mesExamples: 'Example block',
      personality: 'Calm',
      scenario: 'At the cafe',
      system: 'Reply as the character',
      version: 'v2',
    }));
    const renameChat = vi.fn();
    const saveChat = vi.fn();
    const sendSystemMessage = vi.fn();
    const sendMessageAsUser = vi.fn();
    const swipeLeft = vi.fn();
    const swipeRight = vi.fn();
    const substituteParams = vi.fn((text: string) => `[substituted] ${text}`);
    const selectCharacterById = vi.fn();
    const openGroupChat = vi.fn();
    const reloadCurrentChat = vi.fn();
    const saveMetadata = vi.fn();
    const unshallowCharacter = vi.fn();
    const updateChatMetadata = vi.fn();
    const updateMessageBlock = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    });
    vi.stubGlobal('fetch', fetchMock);

    const windowObject = {
      SillyTavern: {
        getContext: () => ({
          characterId: 1,
          characters: [
            { avatar: 'hero.png', chat: 'hero-chat', name: 'Hero' },
            {
              avatar: 'mage.png',
              chat: 'mage-chat',
              create_date: '2025-01-01',
              data: {
                alternate_greetings: ['Hello there'],
                character_version: 'v2',
                creator: 'Hal',
                creator_notes: 'Original notes',
                extensions: {
                  depth_prompt: {
                    depth: 3,
                    prompt: 'Stay moody',
                    role: 'system',
                  },
                  fav: true,
                  talkativeness: 0.65,
                  world: 'city',
                },
                post_history_instructions: 'Keep the tone sharp',
                system_prompt: 'You are Mage',
                tags: ['mage', 'city'],
              },
              description: 'Original description',
              first_mes: 'Welcome back.',
              json_data: '{\"spec\":\"chara_card_v2\"}',
              mes_example: 'Example line',
              name: 'Mage',
              personality: 'Reserved',
              scenario: 'Night city',
              talkativeness: 0.65,
              tags: ['mage', 'city'],
            },
          ],
          chatMetadata: {
            scenario: 'Current metadata scenario',
          },
          chat: [
            {
              is_user: true,
              mes: 'User line',
              name: 'Hal',
              send_date: '2025-01-02',
            },
            {
              extra: { token_count: 42 },
              is_system: false,
              is_user: false,
              mes: 'Assistant line',
              name: 'Mage',
              send_date: '2025-01-03',
              swipe_id: 1,
              swipes: ['Assistant line v1', 'Assistant line'],
            },
          ],
          clearChat,
          deleteLastMessage,
          deleteSwipe,
          eventSource: {
            emit: eventEmit,
            off: vi.fn(),
            on: vi.fn(),
            once: vi.fn(),
            removeListener: vi.fn(),
          },
          generate,
          generateQuietPrompt,
          getCharacters,
          getCharacterCardFields,
          getRequestHeaders,
          getThumbnailUrl: vi.fn((type: string, file: string) => `/thumb/${type}/${file}`),
          groupId: 'g-2',
          groups: [
            { chat_id: 'g-1-chat', id: 'g-1', members: ['a', 'b'], name: 'Alpha Team' },
            { chat_id: 'g-2-chat', id: 'g-2', members: ['x'], name: 'Beta Team' },
          ],
          openGroupChat,
          reloadCurrentChat,
          renameChat,
          saveChat,
          saveMetadata,
          sendMessageAsUser,
          sendSystemMessage,
          swipe: {
            left: swipeLeft,
            right: swipeRight,
          },
          substituteParams,
          getCurrentChatId: () => 'mage-chat',
          selectCharacterById,
          unshallowCharacter,
          updateChatMetadata,
          updateMessageBlock,
        }),
      },
    } as unknown as Window;

    const bridge = createLegacyBridge(windowObject);

    expect(bridge?.session.getCatalog()).toEqual({
      characters: [
        {
          avatarUrl: '/thumb/avatar/hero.png',
          chatId: 'hero-chat',
          id: 0,
          isSelected: false,
          name: 'Hero',
        },
        {
          avatarUrl: '/thumb/avatar/mage.png',
          chatId: 'mage-chat',
          id: 1,
          isSelected: false,
          name: 'Mage',
        },
      ],
      groups: [
        {
          chatId: 'g-1-chat',
          id: 'g-1',
          isSelected: false,
          memberCount: 2,
          name: 'Alpha Team',
        },
        {
          chatId: 'g-2-chat',
          id: 'g-2',
          isSelected: true,
          memberCount: 1,
          name: 'Beta Team',
        },
      ],
    });

    await bridge?.session.selectCharacter(4);
    await bridge?.session.openGroup('g-1', 'g-1-chat');
    await bridge?.session.reloadCurrentChat();
    await bridge?.session.clearCurrentChat();
    await bridge?.session.renameCurrentChat('renamed-chat');
    expect(bridge?.chat.getMessages()).toEqual([
      {
        id: 0,
        isSystem: false,
        isUser: true,
        name: 'Hal',
        text: 'User line',
        timestamp: '2025-01-02',
        tokenCount: undefined,
      },
      {
        id: 1,
        isSystem: false,
        isUser: false,
        name: 'Mage',
        swipeCount: 2,
        swipeIndex: 1,
        text: 'Assistant line',
        timestamp: '2025-01-03',
        tokenCount: 42,
      },
    ]);
    expect(bridge?.chat.getMetadata()).toEqual({ scenario: 'Current metadata scenario' });
    await bridge?.chat.saveMetadata({ scenario: 'Updated metadata scenario' });
    await bridge?.chat.addSystemMessage('System memo');
    await bridge?.chat.deleteLastMessage();
    await bridge?.chat.moveMessage(1, 'up');
    await bridge?.chat.duplicateMessage(1);
    await bridge?.chat.deleteMessage(0);
    await bridge?.chat.swipeLastMessage('left');
    await bridge?.chat.swipeLastMessage('right');
    await bridge?.chat.deleteCurrentSwipe();
    await bridge?.chat.updateMessage(1, 'Edited assistant line');
    await bridge?.composer.sendUserMessage('Hello from React');
    await bridge?.composer.sendAndGenerate('Send and go');
    await bridge?.composer.triggerGeneration('continue');
    await expect(
      bridge?.generation.generateQuietPrompt({
        prompt: 'Summarize the scene',
        quietToLoud: true,
        responseLength: 240,
        trimToSentence: true,
      }),
    ).resolves.toBe('quiet result');
    await expect(bridge?.character.getSelectedProfile()).resolves.toEqual({
      avatarFile: 'mage.png',
      avatarUrl: '/thumb/avatar/mage.png',
      characterVersion: 'v2',
      chatId: 'mage-chat',
      creator: 'Hal',
      creatorNotes: 'Card notes',
      description: 'Card description',
      firstMessage: 'Welcome back.',
      id: 1,
      mesExamples: 'Example block',
      name: 'Mage',
      personality: 'Calm',
      postHistoryInstructions: 'Stay in character',
      scenario: 'At the cafe',
      systemPrompt: 'Reply as the character',
      tags: ['mage', 'city'],
      talkativeness: 0.65,
    });
    await bridge?.character.saveSelectedProfile({
      avatarFile: 'mage.png',
      avatarUrl: '/thumb/avatar/mage.png',
      characterVersion: 'v3',
      chatId: 'mage-chat',
      creator: 'Hal',
      creatorNotes: 'Updated notes',
      description: 'Updated description',
      firstMessage: 'Hello again.',
      id: 1,
      mesExamples: 'New examples',
      name: 'Archmage',
      personality: 'Direct',
      postHistoryInstructions: 'Keep it sharp',
      scenario: 'On the tower roof',
      systemPrompt: 'Stay precise',
      tags: ['mage', 'mentor'],
      talkativeness: 0.8,
    });

    expect(selectCharacterById).toHaveBeenCalledWith(4, { switchMenu: false });
    expect(openGroupChat).toHaveBeenCalledWith('g-1', 'g-1-chat');
    expect(clearChat).toHaveBeenCalledTimes(1);
    expect(renameChat).toHaveBeenCalledWith('mage-chat', 'renamed-chat');
    expect(updateChatMetadata).toHaveBeenCalledWith({ scenario: 'Updated metadata scenario' }, true);
    expect(saveMetadata).toHaveBeenCalledTimes(1);
    expect(sendSystemMessage).toHaveBeenCalledWith('generic', 'System memo');
    expect(deleteLastMessage).toHaveBeenCalledTimes(1);
    expect(deleteSwipe).toHaveBeenCalledTimes(1);
    expect(saveChat).toHaveBeenCalledTimes(4);
    expect(reloadCurrentChat).toHaveBeenCalledTimes(4);
    expect(swipeLeft).toHaveBeenCalledTimes(1);
    expect(swipeRight).toHaveBeenCalledTimes(1);
    expect(updateMessageBlock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ mes: 'Edited assistant line' }),
      { rerenderMessage: true },
    );
    expect(eventEmit).toHaveBeenCalledWith('message_deleted', 2);
    expect(eventEmit).toHaveBeenCalledWith('message_edited', 1);
    expect(eventEmit).toHaveBeenCalledWith('message_updated', 1);
    expect(sendMessageAsUser).toHaveBeenNthCalledWith(1, 'Hello from React', '');
    expect(sendMessageAsUser).toHaveBeenNthCalledWith(2, 'Send and go', '');
    expect(generate).toHaveBeenNthCalledWith(1, 'normal');
    expect(generate).toHaveBeenNthCalledWith(2, 'continue');
    expect(unshallowCharacter).toHaveBeenCalledWith(1);
    expect(generateQuietPrompt).toHaveBeenCalledWith({
      quietPrompt: 'Summarize the scene',
      quietToLoud: true,
      removeReasoning: true,
      responseLength: 240,
      trimToSentence: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/characters/edit');
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(requestInit.method).toBe('POST');
    expect(requestInit.headers).toEqual({ 'X-CSRF-Token': 'token' });
    expect((requestInit.body as FormData).get('ch_name')).toBe('Archmage');
    expect((requestInit.body as FormData).get('description')).toBe('Updated description');
    expect((requestInit.body as FormData).get('system_prompt')).toBe('Stay precise');
    expect((requestInit.body as FormData).get('tags')).toBe('mage, mentor');
    expect(getCharacters).toHaveBeenCalledTimes(1);
  });
});
