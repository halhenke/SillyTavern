import { t } from './i18n.js';
import { main_api } from './api-core.js';
import { user_avatar, name1 } from './chat-core.js';
import { extension_settings } from './extensions.js';
import { horde_settings } from './horde.js';
import { kai_settings } from './kai-settings.js';
import { textgenerationwebui_settings as textgen_settings } from './textgen-settings.js';
import { openai_settings as oai_settings, proxies, selected_proxy } from './openai.js';
import { power_user } from './power-user.js';
import { active_character, active_group } from './session-core.js';
import { tags, tag_map } from './tags.js';
import { nai_settings } from './nai-settings.js';
import { background_settings } from './backgrounds.js';
import { getWorldInfoSettings } from './world-info.js';

/**
 * Bound settings implementation hooks provided by the legacy runtime bootstrap.
 * These wrappers let adapter consumers avoid importing from script.js directly.
 */
let saveSettingsDebouncedImpl = null;
let saveMetadataImpl = null;
let saveCharacterDebouncedImpl = null;
let getOpenAiSettingsImpl = null;
let getCurrentVersionImpl = null;
let getCurrentUserAvatarImpl = null;
let getRequestHeadersImpl = null;
let getCurrentAmountGenImpl = null;
let getCurrentMaxContextImpl = null;
let getFirstRunImpl = null;
let getSettingsReadyImpl = null;
let getSwipesImpl = null;
let isTempResponseLengthCustomizedImpl = null;
let restoreTempResponseLengthImpl = null;
let setSettingsImpl = null;
let setName1Impl = null;
let setAmountGenImpl = null;
let setMaxContextImpl = null;
let setSwipesImpl = null;
let setMainApiImpl = null;
let setActiveCharacterImpl = null;
let setActiveGroupImpl = null;
let setSelectedButtonImpl = null;
let setFirstRunImpl = null;
let setSettingsReadyImpl = null;
let hideSwipeButtonsImpl = null;
let showSwipeButtonsImpl = null;
let reloadLoopImpl = null;
let doOnboardingImpl = null;
let accountStorageImpl = null;
let setUserControlsImpl = null;
let eventSourceImpl = null;
let eventTypesImpl = null;
let loadKoboldSettingsImpl = null;
let loadNovelSettingsImpl = null;
let loadTextGenSettingsImpl = null;
let loadOpenAISettingsImpl = null;
let loadHordeSettingsImpl = null;
let loadPowerUserSettingsImpl = null;
let applyPowerUserSettingsImpl = null;
let loadTagsSettingsImpl = null;
let loadBackgroundSettingsImpl = null;
let loadProxyPresetsImpl = null;
let initUserAvatarImpl = null;
let setPersonaDescriptionImpl = null;
let setWorldInfoSettingsImpl = null;
let loadExtensionSettingsImpl = null;
let hideLoaderImpl = null;
let setOnlineStatusImpl = null;
let getStatusHordeImpl = null;
let getHordeModelsImpl = null;
let validateDisabledSamplersImpl = null;
let setupChatCompletionPromptManagerImpl = null;
let forceCharacterEditorTokenizeImpl = null;

function throwUnbound(name) {
    throw new Error(`[settings-core] ${name} was called before bindings were initialized`);
}

function requireBound(value, name) {
    if (!value) {
        throwUnbound(name);
    }

    return value;
}

/**
 * Binds legacy settings implementations to standalone wrappers.
 * @param {{
 *   saveSettingsDebounced: (...args: any[]) => any,
 *   saveMetadata: (...args: any[]) => Promise<any>,
 *   saveCharacterDebounced: (...args: any[]) => any,
 *   getOpenAiSettings: () => any,
 *   getCurrentVersion: () => string,
 *   getCurrentUserAvatar: () => string,
 *   getRequestHeaders: (...args: any[]) => any,
 *   getCurrentAmountGen: () => number,
 *   getCurrentMaxContext: () => number,
 *   getFirstRun: () => boolean,
 *   getSettingsReady: () => boolean,
 *   getSwipes: () => boolean,
 *   isTempResponseLengthCustomized: () => boolean,
 *   restoreTempResponseLength: (...args: any[]) => any,
 *   setSettings: (value: any) => any,
 *   setName1: (value: string) => any,
 *   setAmountGen: (value: number) => any,
 *   setMaxContext: (value: number) => any,
 *   setSwipes: (value: boolean) => any,
 *   setMainApi: (value: string) => any,
 *   setActiveCharacter: (value: string) => any,
 *   setActiveGroup: (value: string) => any,
 *   setSelectedButton: (value: string) => any,
 *   setFirstRun: (value: boolean) => any,
 *   setSettingsReady: (value: boolean) => any,
 *   hideSwipeButtons: (...args: any[]) => any,
 *   showSwipeButtons: (...args: any[]) => any,
 *   reloadLoop: () => any,
 *   doOnboarding: (avatarId: string) => Promise<any>,
 *   accountStorage: { init: (value: any) => any },
 *   setUserControls: (isEnabled: boolean) => Promise<any>,
 *   eventSource: { emit: (...args: any[]) => Promise<any> },
 *   eventTypes: Record<string, any>,
 *   loadKoboldSettings: (...args: any[]) => any,
 *   loadNovelSettings: (...args: any[]) => any,
 *   loadTextGenSettings: (...args: any[]) => any,
 *   loadOpenAISettings: (...args: any[]) => any,
 *   loadHordeSettings: (...args: any[]) => any,
 *   loadPowerUserSettings: (...args: any[]) => Promise<any>,
 *   applyPowerUserSettings: (...args: any[]) => any,
 *   loadTagsSettings: (...args: any[]) => any,
 *   loadBackgroundSettings: (...args: any[]) => any,
 *   loadProxyPresets: (...args: any[]) => any,
 *   initUserAvatar: (...args: any[]) => any,
 *   setPersonaDescription: (...args: any[]) => any,
 *   setWorldInfoSettings: (...args: any[]) => any,
 *   loadExtensionSettings: (...args: any[]) => Promise<any>,
 *   hideLoader: (...args: any[]) => any,
 *   setOnlineStatus: (...args: any[]) => any,
 *   getStatusHorde: (...args: any[]) => any,
 *   getHordeModels: (...args: any[]) => any,
 *   validateDisabledSamplers: (...args: any[]) => Promise<any>,
 *   setupChatCompletionPromptManager: (...args: any[]) => any,
 *   forceCharacterEditorTokenize: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindSettingsCore(impl) {
    saveSettingsDebouncedImpl = impl?.saveSettingsDebounced ?? null;
    saveMetadataImpl = impl?.saveMetadata ?? null;
    saveCharacterDebouncedImpl = impl?.saveCharacterDebounced ?? null;
    getOpenAiSettingsImpl = impl?.getOpenAiSettings ?? null;
    getCurrentVersionImpl = impl?.getCurrentVersion ?? null;
    getCurrentUserAvatarImpl = impl?.getCurrentUserAvatar ?? null;
    getRequestHeadersImpl = impl?.getRequestHeaders ?? null;
    getCurrentAmountGenImpl = impl?.getCurrentAmountGen ?? null;
    getCurrentMaxContextImpl = impl?.getCurrentMaxContext ?? null;
    getFirstRunImpl = impl?.getFirstRun ?? null;
    getSettingsReadyImpl = impl?.getSettingsReady ?? null;
    getSwipesImpl = impl?.getSwipes ?? null;
    isTempResponseLengthCustomizedImpl = impl?.isTempResponseLengthCustomized ?? null;
    restoreTempResponseLengthImpl = impl?.restoreTempResponseLength ?? null;
    setSettingsImpl = impl?.setSettings ?? null;
    setName1Impl = impl?.setName1 ?? null;
    setAmountGenImpl = impl?.setAmountGen ?? null;
    setMaxContextImpl = impl?.setMaxContext ?? null;
    setSwipesImpl = impl?.setSwipes ?? null;
    setMainApiImpl = impl?.setMainApi ?? null;
    setActiveCharacterImpl = impl?.setActiveCharacter ?? null;
    setActiveGroupImpl = impl?.setActiveGroup ?? null;
    setSelectedButtonImpl = impl?.setSelectedButton ?? null;
    setFirstRunImpl = impl?.setFirstRun ?? null;
    setSettingsReadyImpl = impl?.setSettingsReady ?? null;
    hideSwipeButtonsImpl = impl?.hideSwipeButtons ?? null;
    showSwipeButtonsImpl = impl?.showSwipeButtons ?? null;
    reloadLoopImpl = impl?.reloadLoop ?? null;
    doOnboardingImpl = impl?.doOnboarding ?? null;
    accountStorageImpl = impl?.accountStorage ?? null;
    setUserControlsImpl = impl?.setUserControls ?? null;
    eventSourceImpl = impl?.eventSource ?? null;
    eventTypesImpl = impl?.eventTypes ?? null;
    loadKoboldSettingsImpl = impl?.loadKoboldSettings ?? null;
    loadNovelSettingsImpl = impl?.loadNovelSettings ?? null;
    loadTextGenSettingsImpl = impl?.loadTextGenSettings ?? null;
    loadOpenAISettingsImpl = impl?.loadOpenAISettings ?? null;
    loadHordeSettingsImpl = impl?.loadHordeSettings ?? null;
    loadPowerUserSettingsImpl = impl?.loadPowerUserSettings ?? null;
    applyPowerUserSettingsImpl = impl?.applyPowerUserSettings ?? null;
    loadTagsSettingsImpl = impl?.loadTagsSettings ?? null;
    loadBackgroundSettingsImpl = impl?.loadBackgroundSettings ?? null;
    loadProxyPresetsImpl = impl?.loadProxyPresets ?? null;
    initUserAvatarImpl = impl?.initUserAvatar ?? null;
    setPersonaDescriptionImpl = impl?.setPersonaDescription ?? null;
    setWorldInfoSettingsImpl = impl?.setWorldInfoSettings ?? null;
    loadExtensionSettingsImpl = impl?.loadExtensionSettings ?? null;
    hideLoaderImpl = impl?.hideLoader ?? null;
    setOnlineStatusImpl = impl?.setOnlineStatus ?? null;
    getStatusHordeImpl = impl?.getStatusHorde ?? null;
    getHordeModelsImpl = impl?.getHordeModels ?? null;
    validateDisabledSamplersImpl = impl?.validateDisabledSamplers ?? null;
    setupChatCompletionPromptManagerImpl = impl?.setupChatCompletionPromptManager ?? null;
    forceCharacterEditorTokenizeImpl = impl?.forceCharacterEditorTokenize ?? null;
}

export async function saveSettings(loopCounter = 0) {
    if (!getSettingsReadyImpl) {
        throwUnbound('getSettingsReady');
    }
    if (!saveSettingsDebouncedImpl) {
        throwUnbound('saveSettingsDebounced');
    }
    if (!isTempResponseLengthCustomizedImpl) {
        throwUnbound('isTempResponseLengthCustomized');
    }
    if (!restoreTempResponseLengthImpl) {
        throwUnbound('restoreTempResponseLength');
    }
    if (!getFirstRunImpl) {
        throwUnbound('getFirstRun');
    }
    if (!accountStorageImpl) {
        throwUnbound('accountStorage');
    }
    if (!getCurrentVersionImpl) {
        throwUnbound('getCurrentVersion');
    }
    if (!getCurrentAmountGenImpl) {
        throwUnbound('getCurrentAmountGen');
    }
    if (!getCurrentMaxContextImpl) {
        throwUnbound('getCurrentMaxContext');
    }
    if (!getSwipesImpl) {
        throwUnbound('getSwipes');
    }
    if (!getRequestHeadersImpl) {
        throwUnbound('getRequestHeaders');
    }
    if (!setSettingsImpl) {
        throwUnbound('setSettings');
    }
    if (!eventSourceImpl) {
        throwUnbound('eventSource');
    }
    if (!eventTypesImpl) {
        throwUnbound('eventTypes');
    }

    if (!getSettingsReadyImpl()) {
        console.warn('Settings not ready, scheduling another save');
        saveSettingsDebouncedImpl();
        return;
    }

    const MAX_RETRIES = 3;
    if (isTempResponseLengthCustomizedImpl()) {
        if (loopCounter < MAX_RETRIES) {
            console.warn('Response length is currently being overridden, scheduling another save');
            saveSettingsDebouncedImpl(++loopCounter);
            return;
        }
        console.error('Response length is currently being overridden, but the save loop has reached the maximum number of retries');
        restoreTempResponseLengthImpl(null);
    }

    const payload = {
        firstRun: getFirstRunImpl(),
        accountStorage: accountStorageImpl.getState(),
        currentVersion: getCurrentVersionImpl(),
        username: name1,
        active_character: active_character,
        active_group: active_group,
        user_avatar: user_avatar,
        amount_gen: getCurrentAmountGenImpl(),
        max_context: getCurrentMaxContextImpl(),
        main_api: main_api,
        world_info_settings: getWorldInfoSettings(),
        textgenerationwebui_settings: textgen_settings,
        swipes: getSwipesImpl(),
        horde_settings: horde_settings,
        power_user: power_user,
        extension_settings: extension_settings,
        tags: tags,
        tag_map: tag_map,
        nai_settings: nai_settings,
        kai_settings: kai_settings,
        oai_settings: oai_settings,
        background: background_settings,
        proxies: proxies,
        selected_proxy: selected_proxy,
    };

    try {
        const result = await fetch('/api/settings/save', {
            method: 'POST',
            headers: getRequestHeadersImpl(),
            body: JSON.stringify(payload),
            cache: 'no-cache',
        });

        if (!result.ok) {
            throw new Error(`Failed to save settings: ${result.statusText}`);
        }

        setSettingsImpl(payload);
        await eventSourceImpl.emit(eventTypesImpl.SETTINGS_UPDATED);
    } catch (error) {
        console.error('Error saving settings:', error);
        toastr.error(t`Check the server connection and reload the page to prevent data loss.`, t`Settings could not be saved`);
    }
}

export function saveSettingsDebounced(...args) {
    if (!saveSettingsDebouncedImpl) {
        throwUnbound('saveSettingsDebounced');
    }

    return saveSettingsDebouncedImpl(...args);
}

export function saveMetadata(...args) {
    if (!saveMetadataImpl) {
        throwUnbound('saveMetadata');
    }

    return saveMetadataImpl(...args);
}

export function saveCharacterDebounced(...args) {
    if (!saveCharacterDebouncedImpl) {
        throwUnbound('saveCharacterDebounced');
    }

    return saveCharacterDebouncedImpl(...args);
}

export function changeMainAPI() {
    const selectedVal = $('#main_api').val();
    const apiElements = {
        'koboldhorde': {
            apiStreaming: $('#NULL_SELECTOR'),
            apiSettings: $('#kobold_api-settings'),
            apiConnector: $('#kobold_horde'),
            apiPresets: $('#kobold_api-presets'),
            apiRanges: $('#range_block'),
            maxContextElem: $('#max_context_block'),
            amountGenElem: $('#amount_gen_block'),
        },
        'kobold': {
            apiStreaming: $('#streaming_kobold_block'),
            apiSettings: $('#kobold_api-settings'),
            apiConnector: $('#kobold_api'),
            apiPresets: $('#kobold_api-presets'),
            apiRanges: $('#range_block'),
            maxContextElem: $('#max_context_block'),
            amountGenElem: $('#amount_gen_block'),
        },
        'textgenerationwebui': {
            apiStreaming: $('#streaming_textgenerationwebui_block'),
            apiSettings: $('#textgenerationwebui_api-settings'),
            apiConnector: $('#textgenerationwebui_api'),
            apiPresets: $('#textgenerationwebui_api-presets'),
            apiRanges: $('#range_block_textgenerationwebui'),
            maxContextElem: $('#max_context_block'),
            amountGenElem: $('#amount_gen_block'),
        },
        'novel': {
            apiStreaming: $('#streaming_novel_block'),
            apiSettings: $('#novel_api-settings'),
            apiConnector: $('#novel_api'),
            apiPresets: $('#novel_api-presets'),
            apiRanges: $('#range_block_novel'),
            maxContextElem: $('#max_context_block'),
            amountGenElem: $('#amount_gen_block'),
        },
        'openai': {
            apiStreaming: $('#NULL_SELECTOR'),
            apiSettings: $('#openai_settings'),
            apiConnector: $('#openai_api'),
            apiPresets: $('#openai_api-presets'),
            apiRanges: $('#range_block_openai'),
            maxContextElem: $('#max_context_block'),
            amountGenElem: $('#amount_gen_block'),
        },
    };

    for (const apiName in apiElements) {
        const apiObj = apiElements[apiName];
        if (selectedVal === apiName) {
            continue;
        }
        apiObj.apiSettings.css('display', 'none');
        apiObj.apiConnector.css('display', 'none');
        apiObj.apiRanges.css('display', 'none');
        apiObj.apiPresets.css('display', 'none');
        apiObj.apiStreaming.css('display', 'none');
    }

    const activeItem = apiElements[selectedVal];

    activeItem.apiStreaming.css('display', 'block');
    activeItem.apiSettings.css('display', 'block');
    activeItem.apiConnector.css('display', 'block');
    activeItem.apiRanges.css('display', 'block');
    activeItem.apiPresets.css('display', 'block');

    if (selectedVal === 'openai') {
        activeItem.apiPresets.css('display', 'flex');
    }

    if (selectedVal === 'textgenerationwebui' || selectedVal === 'novel') {
        console.debug('enabling amount_gen for ooba/novel');
        activeItem.amountGenElem.find('input').prop('disabled', false);
        activeItem.amountGenElem.css('opacity', 1.0);
    }

    if (selectedVal === 'novel') {
        $('#ai_module_block_novel').css('display', 'block');
    } else {
        $('#ai_module_block_novel').css('display', 'none');
    }

    $('#prompt_cost_block').toggle(selectedVal === 'textgenerationwebui');

    console.debug('value?', selectedVal);
    if (selectedVal == 'openai') {
        console.debug('hiding settings?');
        $('#common-gen-settings-block').css('display', 'none');
    } else {
        $('#common-gen-settings-block').css('display', 'block');
    }

    requireBound(setMainApiImpl, 'setMainApi')(selectedVal);
    requireBound(setOnlineStatusImpl, 'setOnlineStatus')('no_connection');

    if (selectedVal == 'koboldhorde') {
        requireBound(getStatusHordeImpl, 'getStatusHorde')();
        requireBound(getHordeModelsImpl, 'getHordeModels')(true);
    }
    requireBound(validateDisabledSamplersImpl, 'validateDisabledSamplers')();
    requireBound(setupChatCompletionPromptManagerImpl, 'setupChatCompletionPromptManager')(requireBound(getOpenAiSettingsImpl, 'getOpenAiSettings')());
    requireBound(forceCharacterEditorTokenizeImpl, 'forceCharacterEditorTokenize')();
}

export function initMainApiBindings({ cancelStatusCheck }) {
    $('#main_api').on('change', async function () {
        cancelStatusCheck('Canceled because main api changed');
        const apiId = String($('#main_api').val() ?? '');
        changeMainAPI();
        saveSettingsDebounced();
        await requireBound(eventSourceImpl, 'eventSource').emit(requireBound(eventTypesImpl, 'eventTypes').MAIN_API_CHANGED, { apiId });
    });
}

export function initSettingsSliderBindings() {
    let sliderLocked = true;
    let sliderTimer;

    $('input[type=\'range\']').on('touchstart', function () {
        // Unlock the slider after 300ms
        sliderTimer = setTimeout(function () {
            sliderLocked = false;
            $(this).css('background-color', 'var(--SmartThemeQuoteColor)');
        }.bind(this), 300);
    });

    $('input[type=\'range\']').on('touchend', function () {
        clearTimeout(sliderTimer);
        $(this).css('background-color', '');
        sliderLocked = true;
    });

    $('input[type=\'range\']').on('touchmove', function (event) {
        if (sliderLocked) {
            event.preventDefault();
        }
    });

    const sliders = [
        {
            sliderId: '#amount_gen',
            counterId: '#amount_gen_counter',
            format: (val) => `${val}`,
            setValue: (val) => requireBound(setAmountGenImpl, 'setAmountGen')(Number(val)),
        },
        {
            sliderId: '#max_context',
            counterId: '#max_context_counter',
            format: (val) => `${val}`,
            setValue: (val) => requireBound(setMaxContextImpl, 'setMaxContext')(Number(val)),
        },
    ];

    sliders.forEach(slider => {
        $(document).on('input', slider.sliderId, function () {
            const value = $(this).val();
            const formattedValue = slider.format(value);
            slider.setValue(value);
            $(slider.counterId).val(formattedValue);
            saveSettingsDebounced();
        });
    });
}

export async function getSettings() {
    const response = await fetch('/api/settings/get', {
        method: 'POST',
        headers: requireBound(getRequestHeadersImpl, 'getRequestHeaders')(),
        body: JSON.stringify({}),
        cache: 'no-cache',
    });

    if (!response.ok) {
        requireBound(reloadLoopImpl, 'reloadLoop')();
        toastr.error(t`Settings could not be loaded after multiple attempts. Please try again later.`);
        throw new Error('Error getting settings');
    }

    const data = await response.json();
    if (data.result != 'file not find' && data.settings) {
        const settings = JSON.parse(data.settings);
        requireBound(setSettingsImpl, 'setSettings')(settings);

        if (settings.username !== undefined && settings.username !== '') {
            requireBound(setName1Impl, 'setName1')(settings.username);
            $('#your_name').text(settings.username);
        }

        requireBound(accountStorageImpl, 'accountStorage').init(settings?.accountStorage);
        await requireBound(setUserControlsImpl, 'setUserControls')(data.enable_accounts);

        await requireBound(eventSourceImpl, 'eventSource').emit(requireBound(eventTypesImpl, 'eventTypes').SETTINGS_LOADED_BEFORE, settings);

        requireBound(setAmountGenImpl, 'setAmountGen')(settings.amount_gen);
        if (settings.max_context !== undefined) {
            requireBound(setMaxContextImpl, 'setMaxContext')(parseInt(settings.max_context));
        }

        requireBound(setSwipesImpl, 'setSwipes')(settings.swipes !== undefined ? !!settings.swipes : true);
        $('#swipes-checkbox').prop('checked', settings.swipes !== undefined ? !!settings.swipes : true);
        requireBound(hideSwipeButtonsImpl, 'hideSwipeButtons')();
        requireBound(showSwipeButtonsImpl, 'showSwipeButtons')();

        requireBound(loadKoboldSettingsImpl, 'loadKoboldSettings')(data, settings.kai_settings ?? settings, settings);
        requireBound(loadNovelSettingsImpl, 'loadNovelSettings')(data, settings.nai_settings ?? settings);
        requireBound(loadTextGenSettingsImpl, 'loadTextGenSettings')(data, settings);
        requireBound(loadOpenAISettingsImpl, 'loadOpenAISettings')(data, settings.oai_settings ?? settings);
        requireBound(loadHordeSettingsImpl, 'loadHordeSettings')(settings);

        await requireBound(loadPowerUserSettingsImpl, 'loadPowerUserSettings')(settings, data);
        requireBound(applyPowerUserSettingsImpl, 'applyPowerUserSettings')();
        requireBound(loadTagsSettingsImpl, 'loadTagsSettings')(settings);
        requireBound(loadBackgroundSettingsImpl, 'loadBackgroundSettings')(settings);
        requireBound(loadProxyPresetsImpl, 'loadProxyPresets')(settings);

        await requireBound(eventSourceImpl, 'eventSource').emit(requireBound(eventTypesImpl, 'eventTypes').SETTINGS_LOADED_AFTER, settings);

        $('#max_context').val(requireBound(getCurrentMaxContextImpl, 'getCurrentMaxContext')());
        $('#max_context_counter').val(requireBound(getCurrentMaxContextImpl, 'getCurrentMaxContext')());

        $('#amount_gen').val(requireBound(getCurrentAmountGenImpl, 'getCurrentAmountGen')());
        $('#amount_gen_counter').val(requireBound(getCurrentAmountGenImpl, 'getCurrentAmountGen')());

        if (settings.main_api == undefined) {
            settings.main_api = 'kobold';
        }

        if (settings.main_api == 'poe') {
            settings.main_api = 'openai';
        }

        requireBound(setMainApiImpl, 'setMainApi')(settings.main_api);
        $('#main_api').val(settings.main_api);
        $(`#main_api option[value=${settings.main_api}]`).attr('selected', 'true');
        changeMainAPI();

        requireBound(initUserAvatarImpl, 'initUserAvatar')(settings.user_avatar);
        requireBound(setPersonaDescriptionImpl, 'setPersonaDescription')();

        requireBound(setActiveCharacterImpl, 'setActiveCharacter')(settings.active_character);
        requireBound(setActiveGroupImpl, 'setActiveGroup')(settings.active_group);

        requireBound(setWorldInfoSettingsImpl, 'setWorldInfoSettings')(settings.world_info_settings ?? settings, data);
        requireBound(setSelectedButtonImpl, 'setSelectedButton')(settings.selected_button);

        if (data.enable_extensions) {
            const enableAutoUpdate = Boolean(data.enable_extensions_auto_update);
            const isVersionChanged = settings.currentVersion !== requireBound(getCurrentVersionImpl, 'getCurrentVersion')();
            await requireBound(loadExtensionSettingsImpl, 'loadExtensionSettings')(settings, isVersionChanged, enableAutoUpdate);
            await requireBound(eventSourceImpl, 'eventSource').emit(requireBound(eventTypesImpl, 'eventTypes').EXTENSION_SETTINGS_LOADED);
        }

        requireBound(setFirstRunImpl, 'setFirstRun')(!!settings.firstRun);

        if (settings.firstRun) {
            requireBound(hideLoaderImpl, 'hideLoader')();
            await requireBound(doOnboardingImpl, 'doOnboarding')(requireBound(getCurrentUserAvatarImpl, 'getCurrentUserAvatar')());
            requireBound(setFirstRunImpl, 'setFirstRun')(false);
        }
    }
    await requireBound(validateDisabledSamplersImpl, 'validateDisabledSamplers')();
    requireBound(setSettingsReadyImpl, 'setSettingsReady')(true);
    await requireBound(eventSourceImpl, 'eventSource').emit(requireBound(eventTypesImpl, 'eventTypes').SETTINGS_LOADED);
}
