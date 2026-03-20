import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { ConnectionApplyResult, ConnectionProfileSummary, ShellPreferences, ShellSnapshot } from '../core/contracts';
import type { LegacyBridge } from '../legacy/bridge';
import { ShellPage } from '../features/shell/ShellPage';
import { createLegacyBridge } from '../legacy/bridge';

vi.mock('../legacy/bridge', () => ({
  createLegacyBridge: vi.fn(),
}));

const DEFAULT_PREFERENCES: ShellPreferences = {
  autoContinueAllowChatCompletions: false,
  autoContinueEnabled: false,
  autoContinueTargetLength: 400,
  autoScrollChatToBottom: false,
  collapseNewlines: false,
  compactInputArea: false,
  consoleLogPrompts: false,
  continueOnSend: false,
  messageTokenCountEnabled: false,
  quickContinue: false,
  quickImpersonate: false,
  requestTokenProbabilities: false,
  restoreUserInput: false,
  trimSentences: false,
  trimSpaces: false,
};

type RuntimeState = {
  mainApi: string;
  onlineStatus: string;
  selectedProfileId: string;
};

type ShellHarness = {
  bridge: LegacyBridge;
  runtime: RuntimeState;
};

const BASE_PROFILES: ConnectionProfileSummary[] = [
  {
    api: 'openrouter',
    id: 'profile-openrouter',
    isSelected: true,
    kind: 'chat',
    model: 'openai/gpt-4.1-mini',
    name: 'OpenRouter Default',
    preset: 'Balanced',
  },
  {
    api: 'koboldcpp',
    id: 'profile-kobold',
    isSelected: false,
    kind: 'text',
    model: 'llama',
    name: 'Kobold Local',
    preset: 'Fast',
  },
];

function createDeferred<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    reject: reject!,
    resolve: resolve!,
  };
}

function buildSnapshot(runtime: RuntimeState): ShellSnapshot {
  const selectedProfile = BASE_PROFILES.find((profile) => profile.id === runtime.selectedProfileId);

  return {
    canSaveSettings: true,
    connectionManagerEnabled: true,
    connectionProfileCount: BASE_PROFILES.length,
    connectionProfileName: selectedProfile?.name,
    mainApi: runtime.mainApi,
    onlineStatus: runtime.onlineStatus,
    preferences: DEFAULT_PREFERENCES,
  };
}

function createHarness(): ShellHarness {
  const runtime: RuntimeState = {
    mainApi: 'openrouter',
    onlineStatus: 'Connected',
    selectedProfileId: 'profile-openrouter',
  };

  const bridge = {
    character: {
      createProfile: vi.fn(async () => {}),
      getSelectedProfile: vi.fn(async () => null),
      saveSelectedProfile: vi.fn(async () => {}),
    },
    chat: {
      addSystemMessage: vi.fn(async () => {}),
      deleteCurrentSwipe: vi.fn(async () => {}),
      deleteLastMessage: vi.fn(async () => {}),
      deleteMessage: vi.fn(async () => {}),
      duplicateMessage: vi.fn(async () => {}),
      getCurrentChatId: vi.fn(() => undefined),
      getMessages: vi.fn(() => []),
      getMetadata: vi.fn(() => ({ scenario: '' })),
      moveMessage: vi.fn(async () => {}),
      saveMetadata: vi.fn(async () => {}),
      swipeLastMessage: vi.fn(async () => {}),
      updateMessage: vi.fn(async () => {}),
    },
    composer: {
      sendAndGenerate: vi.fn(async () => {}),
      sendUserMessage: vi.fn(async () => {}),
      triggerGeneration: vi.fn(async () => {}),
    },
    connections: {
      activateSecret: vi.fn(async () => {}),
      applyProfile: vi.fn(async (_id: string): Promise<ConnectionApplyResult> => ({
        mainApi: runtime.mainApi,
        onlineStatus: runtime.onlineStatus,
        requestedProfileId: 'profile-openrouter',
        requestedProfileName: 'OpenRouter Default',
        selectedProfileId: runtime.selectedProfileId,
        selectedProfileName: BASE_PROFILES.find((profile) => profile.id === runtime.selectedProfileId)?.name,
        verified: true,
      })),
      authorizeSecret: vi.fn(async () => {}),
      deleteProfile: vi.fn(async () => {}),
      deleteSecret: vi.fn(async () => {}),
      getSecretStatus: vi.fn((api: string) => ({
        api,
        providerLabel: api || 'Connection',
        requiresSecret: api === 'openrouter',
        saved: api === 'openrouter',
        supportsAuthorize: api === 'openrouter',
        supportsManualEntry: api === 'openrouter',
      })),
      listApiOptions: vi.fn(() => [
        { id: 'koboldcpp', kind: 'text', label: 'koboldcpp' as const },
        { id: 'openrouter', kind: 'chat', label: 'openrouter' as const },
      ]),
      listModels: vi.fn(() => []),
      listProfiles: vi.fn(() =>
        BASE_PROFILES.map((profile) => ({
          ...profile,
          isSelected: profile.id === runtime.selectedProfileId,
        })),
      ),
      listSecrets: vi.fn(() => []),
      saveProfile: vi.fn(async (profile) => ({
        ...profile,
        id: profile.id ?? 'profile-created',
        isSelected: false,
        kind: profile.api === 'openrouter' ? 'chat' : 'text',
      })),
      saveSecret: vi.fn(async () => {}),
    },
    eventBus: {
      emit: vi.fn(async () => {}),
      off: vi.fn(),
      on: vi.fn(() => () => {}),
      once: vi.fn(() => () => {}),
    },
    extensions: {
      getContext: vi.fn(() => ({})),
      getEventTypes: vi.fn(() => ({})),
      listInstalledExtensions: vi.fn(async () => []),
      setExtensionEnabled: vi.fn(async () => {}),
    },
    generation: {
      generateQuietPrompt: vi.fn(async () => ''),
      stopGeneration: vi.fn(),
    },
    group: {
      createProfile: vi.fn(async () => {}),
      getSelectedProfile: vi.fn(async () => null),
      saveSelectedProfile: vi.fn(async () => {}),
    },
    prompts: {
      listPrompts: vi.fn(() => []),
      movePrompt: vi.fn(async () => {}),
      savePrompt: vi.fn(async () => {}),
    },
    session: {
      clearCurrentChat: vi.fn(async () => {}),
      deleteChatFile: vi.fn(async () => {}),
      getCatalog: vi.fn(() => ({ characters: [], groups: [] })),
      getSessionHistory: vi.fn(async () => []),
      openChatFile: vi.fn(async () => {}),
      openGroup: vi.fn(async () => {}),
      reloadCurrentChat: vi.fn(async () => {}),
      renameChatFile: vi.fn(async () => {}),
      renameCurrentChat: vi.fn(async () => {}),
      selectCharacter: vi.fn(async () => {}),
    },
    settings: {
      getShellSnapshot: vi.fn(() => buildSnapshot(runtime)),
      saveDebounced: vi.fn(),
      saveNow: vi.fn(async () => {}),
      updateShellPreferences: vi.fn(async () => {}),
    },
    worldInfo: {
      createBook: vi.fn(async () => {}),
      deleteBook: vi.fn(async () => {}),
      listBooks: vi.fn(() => ({ names: [], selectedNames: [] })),
      loadBook: vi.fn(async () => null),
      saveBook: vi.fn(async () => {}),
      setSelectedBooks: vi.fn(async () => {}),
    },
  } as unknown as LegacyBridge;

  return { bridge, runtime };
}

async function renderShell(bridge: LegacyBridge) {
  const createLegacyBridgeMock = vi.mocked(createLegacyBridge);
  createLegacyBridgeMock.mockReturnValue(bridge);

  render(<ShellPage />);

  const iframe = screen.getByTitle('SillyTavern Legacy Bridge Runtime');
  Object.defineProperty(iframe, 'contentWindow', {
    configurable: true,
    value: window,
  });

  fireEvent.load(iframe);

  await waitFor(() => {
    expect(createLegacyBridgeMock).toHaveBeenCalled();
  });

  return iframe;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('ShellPage connection apply feedback', () => {
  it('shows an applying state while a connection profile switch is still in flight', async () => {
    const { bridge } = createHarness();
    const deferred = createDeferred<ConnectionApplyResult>();

    vi.mocked(bridge.connections.applyProfile).mockImplementation(() => deferred.promise);

    await renderShell(bridge);

    fireEvent.click(screen.getByRole('button', { name: /Kobold Local/i }));

    expect(screen.getByText('Applying Kobold Local')).toBeInTheDocument();
    expect(screen.getByText('switching')).toBeInTheDocument();
    expect(screen.getByText('Waiting for the legacy runtime to finish switching profiles.')).toBeInTheDocument();

    await act(async () => {
      deferred.resolve({
        mainApi: 'openrouter',
        onlineStatus: 'Connected',
        requestedProfileId: 'profile-kobold',
        requestedProfileName: 'Kobold Local',
        selectedProfileId: 'profile-openrouter',
        selectedProfileName: 'OpenRouter Default',
        verified: false,
      });

      await deferred.promise;
    });

    await waitFor(() => {
      expect(screen.getByText('Apply requested')).toBeInTheDocument();
    });
  });

  it('shows pending feedback first and then confirms once the runtime snapshot catches up', async () => {
    const { bridge, runtime } = createHarness();
    const iframe = await renderShell(bridge);

    vi.mocked(bridge.connections.applyProfile).mockImplementation(async () => ({
      mainApi: 'openrouter',
      onlineStatus: 'Connected',
      requestedProfileId: 'profile-kobold',
      requestedProfileName: 'Kobold Local',
      selectedProfileId: 'profile-openrouter',
      selectedProfileName: 'OpenRouter Default',
      verified: false,
    }));

    fireEvent.click(screen.getByRole('button', { name: /Kobold Local/i }));

    await waitFor(() => {
      expect(screen.getByText('Apply requested')).toBeInTheDocument();
    });
    expect(
      screen.getByText('Requested Kobold Local. Waiting for the runtime snapshot to confirm the active profile.'),
    ).toBeInTheDocument();

    runtime.selectedProfileId = 'profile-kobold';
    runtime.mainApi = 'koboldcpp';

    fireEvent.load(iframe);

    await waitFor(() => {
      expect(screen.getByText('Applied Kobold Local')).toBeInTheDocument();
    });
    expect(screen.getByText('live')).toBeInTheDocument();
    expect(screen.getByText('Runtime now reports Kobold Local on koboldcpp (Connected).')).toBeInTheDocument();
  });
});
