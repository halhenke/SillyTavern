import { chat, reloadCurrentChat, saveChatConditional } from './runtime/chat-operations-adapter.js';
import { generateRaw } from './runtime/generation-adapter.js';
import { saveSettings } from './runtime/settings-adapter.js';
import { power_user, registerDebugFunction } from './power-user.js';
import { getTokenCountAsync } from './tokenizers.js';
import { copyText } from './utils.js';
import { accountStorage } from './util/AccountStorage.js';

let forceOnboardingImpl = null;
let getContextImpl = null;
let getSettingsImpl = null;

function throwUnbound(name) {
    throw new Error(`[debug-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy debug/menu implementations to standalone wrappers.
 * @param {{
 *   forceOnboarding: (...args: any[]) => Promise<any>,
 *   getContext: (...args: any[]) => any,
 *   getSettings: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindDebugCore(impl) {
    forceOnboardingImpl = impl?.forceOnboarding ?? null;
    getContextImpl = impl?.getContext ?? null;
    getSettingsImpl = impl?.getSettings ?? null;
}

export function addDebugFunctions() {
    if (!forceOnboardingImpl) {
        throwUnbound('forceOnboarding');
    }
    if (!getContextImpl) {
        throwUnbound('getContext');
    }
    if (!getSettingsImpl) {
        throwUnbound('getSettings');
    }

    const doBackfill = async () => {
        for (const message of chat) {
            if (message.is_system) {
                continue;
            }

            if (!message.extra) {
                message.extra = {};
            }

            const tokenCountText = (message?.extra?.reasoning || '') + message.mes;
            message.extra.token_count = await getTokenCountAsync(tokenCountText, 0);
        }

        await saveChatConditional();
        await reloadCurrentChat();
    };

    registerDebugFunction('forceOnboarding', 'Force onboarding', 'Forces the onboarding process to restart.', async () => {
        await forceOnboardingImpl();
    });

    registerDebugFunction('backfillTokenCounts', 'Backfill token counters',
        `Recalculates token counts of all messages in the current chat to refresh the counters.
        Useful when you switch between models that have different tokenizers.
        This is a visual change only. Your chat will be reloaded.`, doBackfill);

    registerDebugFunction('generationTest', 'Send a generation request', 'Generates text using the currently selected API.', async () => {
        const text = prompt('Input text:', 'Hello');
        toastr.info('Working on it...');
        const message = await generateRaw({ prompt: text });
        alert(message);
    });
    registerDebugFunction('toggleEventTracing', 'Toggle event tracing', 'Useful to see what triggered a certain event.', () => {
        localStorage.setItem('eventTracing', localStorage.getItem('eventTracing') === 'true' ? 'false' : 'true');
        toastr.info('Event tracing is now ' + (localStorage.getItem('eventTracing') === 'true' ? 'enabled' : 'disabled'));
    });

    registerDebugFunction('toggleRegenerateWarning', 'Toggle Ctrl+Enter regeneration confirmation', 'Toggle the warning when regenerating a message with a Ctrl+Enter hotkey.', () => {
        accountStorage.setItem('RegenerateWithCtrlEnter', accountStorage.getItem('RegenerateWithCtrlEnter') === 'true' ? 'false' : 'true');
        toastr.info('Regenerate warning is now ' + (accountStorage.getItem('RegenerateWithCtrlEnter') === 'true' ? 'disabled' : 'enabled'));
    });

    registerDebugFunction('copySetup', 'Copy ST setup to clipboard [WIP]', 'Useful data when reporting bugs', async () => {
        const getContextContents = getContextImpl();
        const getSettingsContents = getSettingsImpl();
        const logMessage = `
\`\`\`
API: ${getSettingsContents.main_api}
API Type: ${getSettingsContents[getSettingsContents.main_api + '_settings'].type}
API server: ${getSettingsContents.api_server}
Model: ${getContextContents.onlineStatus}
Context Template: ${power_user.context.preset}
Instruct Template: ${power_user.instruct.preset}
API Settings: ${JSON.stringify(getSettingsContents[getSettingsContents.main_api + '_settings'], null, 2)}
\`\`\`
    `;

        try {
            await copyText(logMessage);
            toastr.info('Your ST API setup data has been copied to the clipboard.');
        } catch (error) {
            toastr.error('Failed to copy ST Setup to clipboard:', error);
        }
    });
}
