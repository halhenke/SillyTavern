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
    const renameChat = vi.fn();
    const selectCharacterById = vi.fn();
    const openGroupChat = vi.fn();
    const reloadCurrentChat = vi.fn();

    const windowObject = {
      SillyTavern: {
        getContext: () => ({
          characterId: 1,
          characters: [
            { avatar: 'hero.png', chat: 'hero-chat', name: 'Hero' },
            { avatar: 'mage.png', chat: 'mage-chat', name: 'Mage' },
          ],
          clearChat,
          eventSource: {
            emit: vi.fn(),
            off: vi.fn(),
            on: vi.fn(),
            once: vi.fn(),
            removeListener: vi.fn(),
          },
          getThumbnailUrl: vi.fn((type: string, file: string) => `/thumb/${type}/${file}`),
          groupId: 'g-2',
          groups: [
            { chat_id: 'g-1-chat', id: 'g-1', members: ['a', 'b'], name: 'Alpha Team' },
            { chat_id: 'g-2-chat', id: 'g-2', members: ['x'], name: 'Beta Team' },
          ],
          openGroupChat,
          reloadCurrentChat,
          renameChat,
          getCurrentChatId: () => 'mage-chat',
          selectCharacterById,
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

    expect(selectCharacterById).toHaveBeenCalledWith(4, { switchMenu: false });
    expect(openGroupChat).toHaveBeenCalledWith('g-1', 'g-1-chat');
    expect(reloadCurrentChat).toHaveBeenCalledTimes(1);
    expect(clearChat).toHaveBeenCalledTimes(1);
    expect(renameChat).toHaveBeenCalledWith('mage-chat', 'renamed-chat');
  });
});
