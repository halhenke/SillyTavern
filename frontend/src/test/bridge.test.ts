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
          extensionSettings: {
            connectionManager: {
              profiles: [
                {
                  api: 'openrouter',
                  id: 'profile-1',
                  model: 'openai/gpt-4.1-mini',
                  name: 'OpenRouter Default',
                  preset: 'Balanced',
                },
              ],
              selectedProfile: 'profile-1',
            },
            disabledExtensions: [],
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
      connectionManagerEnabled: true,
      connectionProfileCount: 1,
      connectionProfileName: 'OpenRouter Default',
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
    const createCharacter = vi.fn();
    const deleteLastMessage = vi.fn();
    const deleteGroupChatByName = vi.fn();
    const deleteSwipe = vi.fn();
    const eventEmit = vi.fn();
    const generateQuietPrompt = vi.fn().mockResolvedValue('quiet result');
    const generate = vi.fn();
    const getCharacters = vi.fn();
    const getRequestHeaders = vi.fn(() => ({ 'X-CSRF-Token': 'token' }));
    const messageFormatting = vi.fn((text: string) => `<p>${text}</p>`);
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
    const movePromptTemplate = vi.fn();
    const savePromptTemplate = vi.fn();
    const sendSystemMessage = vi.fn();
    const sendMessageAsUser = vi.fn();
    const swipeLeft = vi.fn();
    const swipeRight = vi.fn();
    const substituteParams = vi.fn((text: string) => `[substituted] ${text}`);
    const selectCharacterById = vi.fn();
    const openGroupChat = vi.fn();
    const openCharacterChat = vi.fn();
    const reloadCurrentChat = vi.fn();
    const saveMetadata = vi.fn();
    const saveWorldInfo = vi.fn();
    const saveConnectionProfile = vi.fn(async (profile) => ({
      ...profile,
      id: profile.id ?? 'profile-created',
      mode: profile.api === 'openrouter' ? 'cc' : 'tc',
    }));
    const saveConnectionSecret = vi.fn(async () => {});
    const authorizeConnectionSecret = vi.fn(async () => {});
    const deleteConnectionSecret = vi.fn(async () => {});
    const activateConnectionSecret = vi.fn(async () => {});
    const deleteConnectionProfile = vi.fn();
    const listConnectionModels = vi.fn((api: string) => {
      if (api === 'openrouter') {
        return [
          { id: 'openai/gpt-4.1-mini', label: 'OpenAI: GPT-4.1 Mini | 128000 ctx' },
          { id: 'anthropic/claude-sonnet-4', label: 'Anthropic: Claude Sonnet 4 | 200000 ctx' },
        ];
      }

      return [];
    });
    const listConnectionSecrets = vi.fn((api: string) => {
      if (api === 'openrouter') {
        return [
          {
            active: true,
            id: 'secret-openrouter-1',
            label: 'OpenRouter Primary',
            valuePreview: '*******358',
          },
        ];
      }

      return [];
    });
    const unshallowCharacter = vi.fn();
    const updateChatMetadata = vi.fn();
    const updateMessageBlock = vi.fn();
    const openGroupById = vi.fn();
    const executeSlashCommandsWithOptions = vi.fn();
    let worldNames = ['Core Lore', 'City Lore'];
    let selectedWorldNames = ['Core Lore'];
    const loadWorldInfo = vi.fn(async (name: string) => ({ entries: { 0: { comment: `${name} entry` } } }));
    const listInstalledExtensions = vi.fn(async () => [
      {
        dependencies: ['quick-reply'],
        displayName: 'Fancy Extension',
        enabled: true,
        homePage: 'https://example.com/fancy',
        jsFile: 'index.js',
        name: 'fancy-extension',
        requires: ['caption'],
        type: 'local',
        version: '1.2.3',
      },
      {
        dependencies: [],
        displayName: 'System Tool',
        enabled: false,
        homePage: undefined,
        jsFile: 'main.js',
        name: 'system-tool',
        requires: [],
        type: 'system',
        version: '0.9.0',
      },
    ]);
    const createNewWorldInfo = vi.fn(async (name: string) => {
      if (!worldNames.includes(name)) {
        worldNames = [...worldNames, name];
      }
      return true;
    });
    const deleteWorldInfo = vi.fn(async (name: string) => {
      worldNames = worldNames.filter((item) => item !== name);
      selectedWorldNames = selectedWorldNames.filter((item) => item !== name);
      return true;
    });
    const setSelectedWorldInfo = vi.fn(async (names: string[]) => {
      selectedWorldNames = [...names];
    });
    const setExtensionEnabled = vi.fn();
    const promptTemplates = [
      {
        content: 'Write the next reply.',
        enabled: true,
        forbidOverrides: false,
        identifier: 'main',
        injectionDepth: 4,
        injectionOrder: 100,
        injectionPosition: 0,
        injectionTriggers: [],
        name: 'Main prompt',
        role: 'system',
        systemPrompt: true,
      },
      {
        content: 'Keep the tone sharp.',
        enabled: false,
        forbidOverrides: true,
        identifier: 'jailbreak',
        injectionDepth: 4,
        injectionOrder: 101,
        injectionPosition: 1,
        injectionTriggers: ['normal', 'impersonate'],
        name: 'Jailbreak',
        role: 'system',
        systemPrompt: false,
      },
    ];
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/chats/search') {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              file_name: 'beta-archive',
              file_size: '12 KB',
              last_mes: '2025-01-04',
              message_count: 4,
              preview_message: 'Archive preview',
            },
          ],
        });
      }

      if (url === '/api/groups/create') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 'g-3' }),
        });
      }

      return Promise.resolve({
        ok: true,
        text: async () => '',
      });
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
          CONNECT_API_MAP: {
            koboldcpp: { selected: 'textgenerationwebui' },
            openrouter: { selected: 'openai' },
          },
          createCharacter,
          activateConnectionSecret,
          deleteLastMessage,
          deleteConnectionProfile,
          deleteConnectionSecret,
          deleteSwipe,
          createNewWorldInfo,
          eventSource: {
            emit: eventEmit,
            off: vi.fn(),
            on: vi.fn(),
            once: vi.fn(),
            removeListener: vi.fn(),
          },
          executeSlashCommandsWithOptions,
          extensionSettings: {
            connectionManager: {
              profiles: [
                {
                  api: 'openrouter',
                  'api-url': 'https://openrouter.ai/api/v1',
                  id: 'profile-openrouter',
                  model: 'openai/gpt-4.1-mini',
                  name: 'OpenRouter Default',
                  preset: 'Balanced',
                  'prompt-post-processing': 'none',
                  proxy: 'None',
                  'reasoning-template': 'Default',
                  'secret-id': 'openrouter',
                  'start-reply-with': 'Certainly,',
                  'stop-strings': 'User:',
                },
                {
                  api: 'koboldcpp',
                  context: 'Roleplay',
                  id: 'profile-kobold',
                  instruct: 'Alpaca',
                  'instruct-state': 'true',
                  model: 'llama',
                  mode: 'tc',
                  name: 'Kobold Local',
                  preset: 'Fast',
                  'api-url': 'http://127.0.0.1:5001',
                  'reasoning-template': 'None',
                  'secret-id': 'koboldcpp',
                  'start-reply-with': 'Mage:',
                  'stop-strings': 'User:\nSystem:',
                  tokenizer: 'llama',
                },
              ],
              selectedProfile: 'profile-openrouter',
            },
            disabledExtensions: [],
          },
          generate,
          generateQuietPrompt,
          getCharacters,
          getCharacterCardFields,
          getConnectionSecretStatus: (api: string) => ({
            api,
            providerLabel: api === 'openrouter' ? 'OpenRouter' : 'Connection',
            requiresSecret: api === 'openrouter',
            saved: api === 'openrouter',
            supportsAuthorize: api === 'openrouter',
            supportsManualEntry: api === 'openrouter',
          }),
          getRequestHeaders,
          messageFormatting,
          listInstalledExtensions,
          listConnectionModels,
          listConnectionSecrets,
          getPromptTemplates: () => promptTemplates,
          getSelectedWorldInfo: () => [...selectedWorldNames],
          getThumbnailUrl: vi.fn((type: string, file: string) => `/thumb/${type}/${file}`),
          getWorldNames: () => [...worldNames],
          defaultAvatar: 'img/ai4.png',
          groupId: 'g-2',
          groups: [
            {
              activation_strategy: 1,
              allow_self_responses: true,
              auto_mode_delay: 9,
              chat_id: 'g-1-chat',
              fav: false,
              generation_mode: 0,
              hideMutedSprites: false,
              id: 'g-1',
              members: ['hero.png', 'mage.png'],
              name: 'Alpha Team',
            },
            {
              activation_strategy: 2,
              allow_self_responses: false,
              auto_mode_delay: 7,
              chat_id: 'g-2-chat',
              chat_metadata: { scenario: 'Current metadata scenario' },
              fav: true,
              generation_mode: 1,
              hideMutedSprites: true,
              id: 'g-2',
              members: ['mage.png'],
              name: 'Beta Team',
            },
          ],
          humanizedDateTime: () => 'chat-2025',
          openGroupById,
          openGroupChat,
          openCharacterChat,
          reloadCurrentChat,
          renameChat,
          saveChat,
          saveConnectionSecret,
          saveConnectionProfile,
          saveMetadata,
          movePromptTemplate,
          savePromptTemplate,
          saveWorldInfo,
          setSelectedWorldInfo,
          setExtensionEnabled,
          sendMessageAsUser,
          sendSystemMessage,
          authorizeConnectionSecret,
          swipe: {
            left: swipeLeft,
            right: swipeRight,
          },
          substituteParams,
          getCurrentChatId: () => 'mage-chat',
          loadWorldInfo,
          selectCharacterById,
          unshallowCharacter,
          updateChatMetadata,
          updateMessageBlock,
          deleteGroupChatByName,
          deleteWorldInfo,
        }),
      },
    } as unknown as Window;

    const bridge = createLegacyBridge(windowObject);

    expect(bridge?.session.getCatalog()).toEqual({
      characters: [
        {
          avatarFile: 'hero.png',
          avatarUrl: '/thumb/avatar/hero.png',
          chatId: 'hero-chat',
          id: 0,
          isSelected: false,
          name: 'Hero',
        },
        {
          avatarFile: 'mage.png',
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

    await expect(bridge?.session.getSessionHistory('beta')).resolves.toEqual([
      {
        fileName: 'beta-archive',
        fileSize: '12 KB',
        isActive: false,
        lastMessageAt: '2025-01-04',
        messageCount: 4,
        previewMessage: 'Archive preview',
      },
    ]);

    await bridge?.session.selectCharacter(4);
    await bridge?.session.openGroup('g-1', 'g-1-chat');
    await bridge?.session.openChatFile('beta-archive');
    await bridge?.session.reloadCurrentChat();
    await bridge?.session.clearCurrentChat();
    await bridge?.session.renameChatFile('beta-archive', 'beta-renamed');
    await bridge?.session.deleteChatFile('beta-archive');
    await bridge?.session.renameCurrentChat('renamed-chat');
    expect(bridge?.chat.getMessages()).toEqual([
      {
        id: 0,
        isSystem: false,
        isUser: true,
        name: 'Hal',
        renderedHtml: '<p>User line</p>',
        text: 'User line',
        timestamp: '2025-01-02',
        tokenCount: undefined,
      },
      {
        id: 1,
        isSystem: false,
        isUser: false,
        name: 'Mage',
        renderedHtml: '<p>Assistant line</p>',
        swipeCount: 2,
        swipeIndex: 1,
        text: 'Assistant line',
        timestamp: '2025-01-03',
        tokenCount: 42,
      },
    ]);
    expect(messageFormatting).toHaveBeenCalledWith('User line', 'Hal', false, true, 0, {}, false);
    expect(messageFormatting).toHaveBeenCalledWith('Assistant line', 'Mage', false, false, 1, {}, false);
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
    await bridge?.character.createProfile({
      characterVersion: 'v1',
      creator: 'Hal',
      creatorNotes: 'Draft notes',
      description: 'Freshly created character',
      firstMessage: 'Hello there.',
      mesExamples: '<START>\nHello',
      name: 'Newcomer',
      personality: 'Warm',
      postHistoryInstructions: 'Keep the tone grounded',
      scenario: 'At the inn',
      systemPrompt: 'Respond in character',
      tags: ['new', 'test'],
      talkativeness: 0.55,
    });
    await expect(bridge?.group.getSelectedProfile()).resolves.toEqual({
      activationStrategy: 2,
      allowSelfResponses: false,
      autoModeDelay: 7,
      chatId: 'g-2-chat',
      favorite: true,
      generationMode: 1,
      hideMutedSprites: true,
      id: 'g-2',
      memberAvatarFiles: ['mage.png'],
      name: 'Beta Team',
    });
    await bridge?.group.createProfile({
      activationStrategy: 3,
      allowSelfResponses: true,
      autoModeDelay: 11,
      favorite: true,
      generationMode: 2,
      hideMutedSprites: false,
      memberAvatarFiles: ['hero.png', 'mage.png'],
      name: 'Council',
    });
    await bridge?.group.saveSelectedProfile({
      activationStrategy: 0,
      allowSelfResponses: true,
      autoModeDelay: 5,
      chatId: 'g-2-chat',
      favorite: false,
      generationMode: 0,
      hideMutedSprites: false,
      id: 'g-2',
      memberAvatarFiles: ['hero.png', 'mage.png'],
      name: 'Beta Revised',
    });
    expect(bridge?.worldInfo.listBooks()).toEqual({
      names: ['Core Lore', 'City Lore'],
      selectedNames: ['Core Lore'],
    });
    await expect(bridge?.worldInfo.loadBook('Core Lore')).resolves.toEqual({
      data: { entries: { 0: { comment: 'Core Lore entry' } } },
      name: 'Core Lore',
    });
    await bridge?.worldInfo.setSelectedBooks(['City Lore']);
    await bridge?.worldInfo.createBook('Travel Lore');
    await bridge?.worldInfo.saveBook('Travel Lore', { entries: { 0: { comment: 'travel' } } });
    await bridge?.worldInfo.deleteBook('City Lore');
    await expect(bridge?.extensions.listInstalledExtensions()).resolves.toEqual([
      {
        dependencies: ['quick-reply'],
        displayName: 'Fancy Extension',
        enabled: true,
        homePage: 'https://example.com/fancy',
        jsFile: 'index.js',
        name: 'fancy-extension',
        requires: ['caption'],
        type: 'local',
        version: '1.2.3',
      },
      {
        dependencies: [],
        displayName: 'System Tool',
        enabled: false,
        homePage: undefined,
        jsFile: 'main.js',
        name: 'system-tool',
        requires: [],
        type: 'system',
        version: '0.9.0',
      },
    ]);
    await bridge?.extensions.setExtensionEnabled('system-tool', true);
    expect(bridge?.connections.listApiOptions()).toEqual([
      { id: 'koboldcpp', kind: 'text', label: 'koboldcpp' },
      { id: 'openrouter', kind: 'chat', label: 'openrouter' },
    ]);
    expect(bridge?.connections.listModels('openrouter')).toEqual([
      { id: 'openai/gpt-4.1-mini', label: 'OpenAI: GPT-4.1 Mini | 128000 ctx' },
      { id: 'anthropic/claude-sonnet-4', label: 'Anthropic: Claude Sonnet 4 | 200000 ctx' },
    ]);
    expect(bridge?.connections.getSecretStatus('openrouter')).toEqual({
      api: 'openrouter',
      providerLabel: 'OpenRouter',
      requiresSecret: true,
      saved: true,
      supportsAuthorize: true,
      supportsManualEntry: true,
    });
    expect(bridge?.connections.listSecrets('openrouter')).toEqual([
      {
        active: true,
        id: 'secret-openrouter-1',
        label: 'OpenRouter Primary',
        valuePreview: '*******358',
      },
    ]);
    expect(bridge?.connections.listProfiles()).toEqual([
      {
        api: 'koboldcpp',
        apiUrl: 'http://127.0.0.1:5001',
        context: 'Roleplay',
        id: 'profile-kobold',
        instruct: 'Alpaca',
        instructEnabled: true,
        isSelected: false,
        kind: 'text',
        model: 'llama',
        name: 'Kobold Local',
        preset: 'Fast',
        reasoningTemplate: 'None',
        secretId: 'koboldcpp',
        startReplyWith: 'Mage:',
        stopStrings: 'User:\nSystem:',
        tokenizer: 'llama',
      },
      {
        api: 'openrouter',
        apiUrl: 'https://openrouter.ai/api/v1',
        context: undefined,
        id: 'profile-openrouter',
        instruct: undefined,
        instructEnabled: false,
        isSelected: true,
        kind: 'chat',
        model: 'openai/gpt-4.1-mini',
        name: 'OpenRouter Default',
        preset: 'Balanced',
        promptPostProcessing: 'none',
        proxy: 'None',
        reasoningTemplate: 'Default',
        secretId: 'openrouter',
        startReplyWith: 'Certainly,',
        stopStrings: 'User:',
        tokenizer: undefined,
      },
    ]);
    await bridge?.connections.applyProfile('profile-kobold');
    await expect(
      bridge?.connections.saveProfile({
        api: 'openrouter',
        apiUrl: 'https://openrouter.ai/api/v1',
        context: '',
        instruct: '',
        instructEnabled: false,
        model: 'openai/gpt-4.1',
        name: 'OpenRouter Edited',
        preset: 'Creative',
        promptPostProcessing: 'single',
        proxy: 'OpenRouter Proxy',
        reasoningTemplate: 'Careful',
        secretId: 'openrouter',
        startReplyWith: 'Sure,',
        stopStrings: 'User:',
        tokenizer: '',
      }),
    ).resolves.toEqual({
      api: 'openrouter',
      apiUrl: 'https://openrouter.ai/api/v1',
      context: '',
      id: 'profile-created',
      instruct: '',
      instructEnabled: false,
      isSelected: false,
      kind: 'chat',
      model: 'openai/gpt-4.1',
      name: 'OpenRouter Edited',
      preset: 'Creative',
      promptPostProcessing: 'single',
      proxy: 'OpenRouter Proxy',
      reasoningTemplate: 'Careful',
      secretId: 'openrouter',
      startReplyWith: 'Sure,',
      stopStrings: 'User:',
      tokenizer: '',
    });
    await bridge?.connections.saveSecret('openrouter', 'sk-or-test', 'OpenRouter React');
    await bridge?.connections.authorizeSecret('openrouter');
    await bridge?.connections.activateSecret('openrouter', 'secret-openrouter-1');
    await bridge?.connections.deleteSecret('openrouter', 'secret-openrouter-1');
    await bridge?.connections.deleteProfile('profile-kobold');
    expect(bridge?.prompts.listPrompts()).toEqual(promptTemplates);
    await bridge?.prompts.movePrompt('jailbreak', 'up');
    await bridge?.prompts.savePrompt({
      content: 'Keep the tone precise.',
      enabled: true,
      forbidOverrides: true,
      identifier: 'jailbreak',
      injectionDepth: 4,
      injectionOrder: 101,
      injectionPosition: 1,
      injectionTriggers: ['normal'],
      name: 'Revised jailbreak',
      role: 'system',
      systemPrompt: false,
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
    expect(openGroupChat).toHaveBeenCalledWith('g-2', 'beta-archive');
    expect(openCharacterChat).not.toHaveBeenCalled();
    expect(clearChat).toHaveBeenCalledTimes(1);
    expect(renameChat).toHaveBeenCalledWith('beta-archive', 'beta-renamed');
    expect(renameChat).toHaveBeenCalledWith('mage-chat', 'renamed-chat');
    expect(deleteGroupChatByName).toHaveBeenCalledWith('g-2', 'beta-archive');
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
    expect(createCharacter).toHaveBeenCalledWith({
      characterVersion: 'v1',
      creator: 'Hal',
      creatorNotes: 'Draft notes',
      description: 'Freshly created character',
      firstMessage: 'Hello there.',
      mesExamples: '<START>\nHello',
      name: 'Newcomer',
      personality: 'Warm',
      postHistoryInstructions: 'Keep the tone grounded',
      scenario: 'At the inn',
      systemPrompt: 'Respond in character',
      tags: ['new', 'test'],
      talkativeness: 0.55,
    });
    expect(setSelectedWorldInfo).toHaveBeenCalledWith(['City Lore']);
    expect(createNewWorldInfo).toHaveBeenCalledWith('Travel Lore', { interactive: false });
    expect(saveWorldInfo).toHaveBeenCalledWith('Travel Lore', { entries: { 0: { comment: 'travel' } } }, true);
    expect(deleteWorldInfo).toHaveBeenCalledWith('City Lore');
    expect(loadWorldInfo).toHaveBeenCalledWith('Core Lore');
    expect(movePromptTemplate).toHaveBeenCalledWith('jailbreak', 'up');
    expect(savePromptTemplate).toHaveBeenCalledWith({
      content: 'Keep the tone precise.',
      enabled: true,
      forbidOverrides: true,
      identifier: 'jailbreak',
      injectionDepth: 4,
      injectionOrder: 101,
      injectionPosition: 1,
      injectionTriggers: ['normal'],
      name: 'Revised jailbreak',
      role: 'system',
      systemPrompt: false,
    });
    expect(setExtensionEnabled).toHaveBeenCalledWith('system-tool', true);
    expect(executeSlashCommandsWithOptions).toHaveBeenCalledWith('/profile "Kobold Local"', {
      handleExecutionErrors: true,
      handleParserErrors: true,
      source: 'react-shell',
    });
    expect(saveConnectionProfile).toHaveBeenCalledWith({
      api: 'openrouter',
      'api-url': 'https://openrouter.ai/api/v1',
      context: '',
      id: undefined,
      instruct: '',
      'instruct-state': false,
      model: 'openai/gpt-4.1',
      name: 'OpenRouter Edited',
      preset: 'Creative',
      'prompt-post-processing': 'single',
      proxy: 'OpenRouter Proxy',
      'reasoning-template': 'Careful',
      'secret-id': 'openrouter',
      'start-reply-with': 'Sure,',
      'stop-strings': 'User:',
      tokenizer: '',
    });
    expect(deleteConnectionProfile).toHaveBeenCalledWith('profile-kobold');
    expect(listConnectionModels).toHaveBeenCalledWith('openrouter');
    expect(listConnectionSecrets).toHaveBeenCalledWith('openrouter');
    expect(saveConnectionSecret).toHaveBeenCalledWith('openrouter', 'sk-or-test', 'OpenRouter React');
    expect(authorizeConnectionSecret).toHaveBeenCalledWith('openrouter');
    expect(activateConnectionSecret).toHaveBeenCalledWith('openrouter', 'secret-openrouter-1');
    expect(deleteConnectionSecret).toHaveBeenCalledWith('openrouter', 'secret-openrouter-1');
    expect(openGroupById).toHaveBeenCalledWith('g-3');
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/chats/search');
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/groups/create');
    expect(fetchMock.mock.calls[2]?.[0]).toBe('/api/groups/edit');
    expect(fetchMock.mock.calls[3]?.[0]).toBe('/api/characters/edit');
    const createGroupRequest = (fetchMock.mock.calls[1] as unknown as [string, RequestInit] | undefined)?.[1];
    if (!createGroupRequest) {
      throw new Error('Expected group create request init');
    }
    expect(createGroupRequest.method).toBe('POST');
    expect(createGroupRequest.headers).toEqual({ 'X-CSRF-Token': 'token' });
    expect(JSON.parse(String(createGroupRequest.body))).toEqual({
      activation_strategy: 3,
      allow_self_responses: true,
      auto_mode_delay: 11,
      avatar_url: 'img/ai4.png',
      chat_id: 'chat-2025',
      chat_metadata: {},
      chats: ['chat-2025'],
      disabled_members: [],
      fav: true,
      generation_mode: 2,
      hideMutedSprites: false,
      members: ['hero.png', 'mage.png'],
      name: 'Council',
    });
    const saveGroupRequest = (fetchMock.mock.calls[2] as unknown as [string, RequestInit] | undefined)?.[1];
    if (!saveGroupRequest) {
      throw new Error('Expected group save request init');
    }
    expect(saveGroupRequest.method).toBe('POST');
    expect(saveGroupRequest.headers).toEqual({ 'X-CSRF-Token': 'token' });
    expect(JSON.parse(String(saveGroupRequest.body))).toEqual(expect.objectContaining({
      activation_strategy: 0,
      allow_self_responses: true,
      auto_mode_delay: 5,
      chat_id: 'g-2-chat',
      chat_metadata: { scenario: 'Current metadata scenario', tainted: true },
      fav: false,
      generation_mode: 0,
      hideMutedSprites: false,
      id: 'g-2',
      members: ['hero.png', 'mage.png'],
      name: 'Beta Revised',
    }));
    const requestInit = (fetchMock.mock.calls[3] as unknown as [string, RequestInit] | undefined)?.[1];
    if (!requestInit) {
      throw new Error('Expected character save request init');
    }
    expect(requestInit.method).toBe('POST');
    expect(requestInit.headers).toEqual({ 'X-CSRF-Token': 'token' });
    expect((requestInit.body as FormData).get('ch_name')).toBe('Archmage');
    expect((requestInit.body as FormData).get('description')).toBe('Updated description');
    expect((requestInit.body as FormData).get('system_prompt')).toBe('Stay precise');
    expect((requestInit.body as FormData).get('tags')).toBe('mage, mentor');
    expect(getCharacters).toHaveBeenCalledTimes(4);
  });
});
