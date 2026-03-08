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
            auto_scroll_chat_to_bottom: true,
            collapse_newlines: false,
            message_token_count_enabled: true,
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
        collapseNewlines: false,
        messageTokenCountEnabled: true,
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
      auto_scroll_chat_to_bottom: false,
      collapse_newlines: false,
      message_token_count_enabled: false,
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
      collapseNewlines: true,
      trimSpaces: true,
    });

    expect(powerUserSettings.collapse_newlines).toBe(true);
    expect(powerUserSettings.trim_spaces).toBe(true);
    expect(saveSettingsDebounced).toHaveBeenCalledTimes(1);
    expect(saveSettings).not.toHaveBeenCalled();
  });
});
