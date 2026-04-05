import { chat } from './chat-operations-core.js';
import { event_types, eventSource } from './events.js';
import { t } from './i18n.js';
import { syncConverter } from './parser-core.js';
import { Popup } from './popup.js';
import { markdownExclusionExt } from './showdown-exclusion.js';
import { markdownUnderscoreExt } from './showdown-underscore.js';
import { renderTemplateAsync } from './templates.js';
import { copyText, toggleDrawer } from './utils.js';

import { hljs, showdown } from '../lib.js';

let callPopupImpl = null;
let debounceImpl = null;
let delayImpl = null;
let favsToHotswapImpl = null;
let resetScrollHeightImpl = null;
let resetMovableStylesImpl = null;
let scrollChatToBottomImpl = null;
let showBookmarksButtonsImpl = null;
let pauseScriptExecutionImpl = null;
let stopGenerationImpl = null;
let stopScriptExecutionImpl = null;
let optionsMenuButton = null;
let optionsMenuElement = null;
let optionsMenuPopper = null;
let isOptionsMenuVisible = false;

export let ANIMATION_DURATION_DEFAULT = 0;
export let animation_duration = 0;
export let animation_easing = 'ease-in-out';
export let is_send_press = false;
export let MAX_INJECTION_DEPTH = 0;

function throwUnbound(name) {
    throw new Error(`[ui-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy UI implementations to standalone wrappers.
 * @param {{
 *   callPopup: (...args: any[]) => any,
 *   debounce: (...args: any[]) => any,
 *   delay: (...args: any[]) => Promise<any>,
 *   favsToHotswap: (...args: any[]) => any,
 *   pauseScriptExecution: (...args: any[]) => any,
 *   resetMovableStyles: (...args: any[]) => any,
 *   resetScrollHeight: (...args: any[]) => Promise<any>,
 *   scrollChatToBottom: (...args: any[]) => any,
 *   showBookmarksButtons: (...args: any[]) => any,
 *   stopGeneration: (...args: any[]) => any,
 *   stopScriptExecution: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindUiCore(impl) {
    callPopupImpl = impl?.callPopup ?? null;
    debounceImpl = impl?.debounce ?? null;
    delayImpl = impl?.delay ?? null;
    favsToHotswapImpl = impl?.favsToHotswap ?? null;
    pauseScriptExecutionImpl = impl?.pauseScriptExecution ?? null;
    resetMovableStylesImpl = impl?.resetMovableStyles ?? null;
    resetScrollHeightImpl = impl?.resetScrollHeight ?? null;
    scrollChatToBottomImpl = impl?.scrollChatToBottom ?? null;
    showBookmarksButtonsImpl = impl?.showBookmarksButtons ?? null;
    stopGenerationImpl = impl?.stopGeneration ?? null;
    stopScriptExecutionImpl = impl?.stopScriptExecution ?? null;
}

export function syncAnimationDurationDefault(value) {
    ANIMATION_DURATION_DEFAULT = value;
}

export function syncAnimationDuration(value) {
    animation_duration = value;
}

export function syncAnimationEasing(value) {
    animation_easing = value;
}

export function syncIsSendPress(value) {
    is_send_press = value;
}

export function syncMaxInjectionDepth(value) {
    MAX_INJECTION_DEPTH = value;
}

export function addCopyToCodeBlocks(...args) {
    const [messageElement] = args;
    const codeBlocks = $(messageElement).find('pre code');
    for (let i = 0; i < codeBlocks.length; i++) {
        hljs.highlightElement(codeBlocks.get(i));
        const copyButton = document.createElement('i');
        copyButton.classList.add('fa-solid', 'fa-copy', 'code-copy', 'interactable');
        copyButton.title = 'Copy code';
        codeBlocks.get(i).appendChild(copyButton);
        copyButton.addEventListener('click', function (e) {
            e.stopPropagation();
        });
        copyButton.addEventListener('pointerup', async function () {
            const text = codeBlocks.get(i).innerText;
            await copyText(text);
            toastr.info(t`Copied!`, '', { timeOut: 2000 });
        });
    }
}

export function callPopup(...args) {
    if (!callPopupImpl) {
        throwUnbound('callPopup');
    }

    return callPopupImpl(...args);
}

function delayBound(...args) {
    if (!delayImpl) {
        throwUnbound('delay');
    }

    return delayImpl(...args);
}

function debounceBound(...args) {
    if (!debounceImpl) {
        throwUnbound('debounce');
    }

    return debounceImpl(...args);
}

function favsToHotswapBound(...args) {
    if (!favsToHotswapImpl) {
        throwUnbound('favsToHotswap');
    }

    return favsToHotswapImpl(...args);
}

function resetScrollHeightBound(...args) {
    if (!resetScrollHeightImpl) {
        throwUnbound('resetScrollHeight');
    }

    return resetScrollHeightImpl(...args);
}

function resetMovableStylesBound(...args) {
    if (!resetMovableStylesImpl) {
        throwUnbound('resetMovableStyles');
    }

    return resetMovableStylesImpl(...args);
}

function showBookmarksButtonsBound(...args) {
    if (!showBookmarksButtonsImpl) {
        throwUnbound('showBookmarksButtons');
    }

    return showBookmarksButtonsImpl(...args);
}

function pauseScriptExecutionBound(...args) {
    if (!pauseScriptExecutionImpl) {
        throwUnbound('pauseScriptExecution');
    }

    return pauseScriptExecutionImpl(...args);
}

function stopGenerationBound(...args) {
    if (!stopGenerationImpl) {
        throwUnbound('stopGeneration');
    }

    return stopGenerationImpl(...args);
}

function stopScriptExecutionBound(...args) {
    if (!stopScriptExecutionImpl) {
        throwUnbound('stopScriptExecution');
    }

    return stopScriptExecutionImpl(...args);
}

export function reloadMarkdownProcessor(...args) {
    const converter = new showdown.Converter({
        emoji: true,
        literalMidWordUnderscores: true,
        parseImgDimensions: true,
        tables: true,
        underline: true,
        simpleLineBreaks: true,
        strikethrough: true,
        disableForced4SpacesIndentedSublists: true,
        extensions: [markdownUnderscoreExt()],
    });

    // Inject the dinkus extension after creating the converter
    // Maybe move this into power_user init?
    converter.addExtension(markdownExclusionExt(), 'exclusion');
    syncConverter(converter);

    return converter;
}

export function scrollChatToBottom(...args) {
    if (!scrollChatToBottomImpl) {
        throwUnbound('scrollChatToBottom');
    }

    return scrollChatToBottomImpl(...args);
}

export function getSlideToggleOptions() {
    return {
        miliseconds: animation_duration * 1.5,
        transitionFunction: animation_duration > 0 ? 'ease-in-out' : 'step-start',
    };
}

export function setAnimationDuration(ms = null) {
    animation_duration = ms ?? ANIMATION_DURATION_DEFAULT;
    document.documentElement.style.setProperty('--animation-duration', `${animation_duration}ms`);
    return animation_duration;
}

export function doDrawerOpenClick() {
    const targetDrawerID = $(this).attr('data-target');
    const drawer = $(`#${targetDrawerID}`);
    const drawerToggle = drawer.find('.drawer-toggle');
    const drawerWasOpenAlready = drawerToggle.parent().find('.drawer-content').hasClass('openDrawer');
    if (drawerWasOpenAlready || drawer.hasClass('resizing')) {
        return;
    }
    doNavbarIconClick.call(drawerToggle);
}

export async function doNavbarIconClick() {
    const icon = $(this).find('.drawer-icon');
    const drawer = $(this).parent().find('.drawer-content');
    const drawerWasOpenAlready = $(this).parent().find('.drawer-content').hasClass('openDrawer');
    const targetDrawerID = $(this).parent().find('.drawer-content').attr('id');

    if (!drawerWasOpenAlready) {
        const $openDrawers = $('.openDrawer:not(.pinnedOpen)');
        const $openIcons = $('.openIcon:not(.drawerPinnedOpen)');
        for (const iconEl of $openIcons) {
            $(iconEl).toggleClass('closedIcon openIcon');
        }
        for (const el of $openDrawers) {
            $(el).toggleClass('closedDrawer openDrawer');
        }
        if ($openDrawers.length && animation_duration) {
            await delayBound(animation_duration);
        }
        icon.toggleClass('openIcon closedIcon');
        drawer.toggleClass('openDrawer closedDrawer');

        if (targetDrawerID === 'right-nav-panel') {
            favsToHotswapBound();
            $('#rm_print_characters_block').trigger('scroll');
        }

        if (!CSS.supports('field-sizing', 'content')) {
            const textareas = $(this).closest('.drawer').find('.drawer-content textarea.autoSetHeight');
            for (const textarea of textareas) {
                await resetScrollHeightBound($(textarea));
            }
        }
    } else if (drawerWasOpenAlready) {
        icon.toggleClass('closedIcon openIcon');
        drawer.toggleClass('closedDrawer openDrawer');
    }
}

export async function fixViewport() {
    document.body.style.position = 'absolute';
    await delayBound(1);
    document.body.style.position = '';
}

export function initStandaloneMode() {
    const isPwaMode = window.matchMedia('(display-mode: standalone)').matches;
    if (isPwaMode) {
        $('body').addClass('PWA');
    }
}

function showOptionsMenu() {
    if (!optionsMenuElement) {
        return;
    }

    showBookmarksButtonsBound();
    optionsMenuElement.fadeIn(animation_duration);
    optionsMenuPopper?.update();
    isOptionsMenuVisible = true;
}

export function hideOptionsMenu() {
    if (!optionsMenuElement) {
        return;
    }

    optionsMenuElement.fadeOut(animation_duration);
    optionsMenuPopper?.update();
    isOptionsMenuVisible = false;
}

export function initOptionsMenu({ buttonSelector = '#options_button', menuSelector = '#options', popper } = {}) {
    optionsMenuButton = $(buttonSelector);
    optionsMenuElement = $(menuSelector);
    optionsMenuPopper = popper ?? null;

    function isMouseOverButtonOrMenu() {
        return optionsMenuElement.is(':hover, :focus-within') || optionsMenuButton.is(':hover, :focus');
    }

    optionsMenuButton.on('click', function () {
        if (isOptionsMenuVisible) {
            hideOptionsMenu();
        } else {
            showOptionsMenu();
        }
    });

    $(document).on('click', function () {
        if (!isOptionsMenuVisible) {
            return;
        }
        if (!isMouseOverButtonOrMenu()) {
            hideOptionsMenu();
        }
    });
}

export function initOptionsActionBindings({
    openPermanentAssistantCard,
    displayPastChats,
    getThisChid,
    getIsSendPress,
    getSelectedGroup,
    getIsGroupGenerating,
    doNewChat,
    newAssistantChat,
    getCharacterName,
    getNeutralCharacterName,
    closeMessageEditor,
    regenerateGroup,
    setSendButtonState,
    Generate,
    openMessageDelete,
    getEditedMessageId,
    awaitChatNotSaving,
    clearChat,
    getChat,
    resetSelectedGroup,
    setCharacterId,
    setCharacterName,
    setActiveCharacter,
    setActiveGroup,
    setEditedMessageId,
    setChatMetadata,
    setSelectedButton,
    selectRmCharacters,
    getCurrentChatId,
}) {
    $('#options [id]').on('click', async function (_event, customData) {
        const fromSlashCommand = customData?.fromSlashCommand || false;
        const id = $(this).attr('id');
        const additionalPrompt = customData?.additionalPrompt?.trim() || undefined;
        const thisChid = getThisChid();
        const isSendPress = getIsSendPress();
        const selectedGroup = getSelectedGroup();
        const isGroupGenerating = getIsGroupGenerating();

        const buildOrFillAdditionalArgs = (args = {}) => ({
            ...args,
            ...(additionalPrompt !== undefined && { quiet_prompt: additionalPrompt, quietToLoud: true }),
        });

        if (id == 'option_select_chat') {
            if (thisChid === undefined && !isSendPress && !selectedGroup) {
                await openPermanentAssistantCard();
            }
            if ((selectedGroup && !isGroupGenerating) || (thisChid !== undefined && !isSendPress) || fromSlashCommand) {
                await displayPastChats();
                if (!fromSlashCommand) {
                    $('#shadow_select_chat_popup').css('display', 'block');
                    $('#shadow_select_chat_popup').css('opacity', 0.0);
                    $('#shadow_select_chat_popup').transition({
                        opacity: 1.0,
                        duration: animation_duration,
                        easing: animation_easing,
                    });
                }
            }
        } else if (id == 'option_start_new_chat') {
            if ((selectedGroup || thisChid !== undefined) && !isSendPress) {
                let deleteCurrentChat = false;
                const result = await Popup.show.confirm(t`Start new chat?`, await renderTemplateAsync('newChatConfirm'), {
                    onClose: () => { deleteCurrentChat = !!$('#del_chat_checkbox').prop('checked'); },
                });
                if (!result) {
                    return;
                }

                await doNewChat({ deleteCurrentChat });
            }
            if (!selectedGroup && thisChid === undefined && !isSendPress) {
                const alreadyInTempChat = thisChid === undefined && getCharacterName() === getNeutralCharacterName();
                await newAssistantChat({ temporary: alreadyInTempChat });
            }
        } else if (id == 'option_regenerate') {
            closeMessageEditor();
            if (isSendPress == false) {
                if (selectedGroup) {
                    regenerateGroup();
                } else {
                    setSendButtonState(true);
                    Generate('regenerate', buildOrFillAdditionalArgs());
                }
            }
        } else if (id == 'option_impersonate') {
            if (isSendPress == false || fromSlashCommand) {
                setSendButtonState(true);
                Generate('impersonate', buildOrFillAdditionalArgs());
            }
        } else if (id == 'option_continue') {
            if (getEditedMessageId()) {
                return;
            }

            if (isSendPress == false || fromSlashCommand) {
                setSendButtonState(true);
                Generate('continue', buildOrFillAdditionalArgs());
            }
        } else if (id == 'option_delete_mes') {
            setTimeout(() => openMessageDelete(fromSlashCommand), animation_duration);
        } else if (id == 'option_close_chat') {
            if (isSendPress == false) {
                await awaitChatNotSaving();
                const chat = getChat();
                await clearChat();
                chat.length = 0;
                resetSelectedGroup();
                setCharacterId(undefined);
                setCharacterName('');
                setActiveCharacter(null);
                setActiveGroup(null);
                setEditedMessageId(undefined);
                setChatMetadata({});
                setSelectedButton('characters');
                $('#rm_button_selected_ch').children('h2').text('');
                selectRmCharacters();
                await eventSource.emit(event_types.CHAT_CHANGED, getCurrentChatId());
            } else {
                toastr.info(t`Please stop the message generation first.`);
            }
        } else if (id === 'option_settings') {
            const topBar = document.getElementById('top-bar');
            const topSettingsHolder = document.getElementById('top-settings-holder');
            const divchat = document.getElementById('chat');

            if (topBar.style.display === 'none') {
                topBar.style.display = '';
                topSettingsHolder.style.display = '';
                divchat.style.borderRadius = '';
                divchat.style.backgroundColor = '';
            } else {
                divchat.style.borderRadius = '10px';
                divchat.style.backgroundColor = '';
                topBar.style.display = 'none';
                topSettingsHolder.style.display = 'none';
            }
        }

        hideOptionsMenu();
    });
}

export function initSendTextareaFocusRetention() {
    let previouslyFocused = false;

    $('#send_textarea').on('focusin focus click', () => {
        previouslyFocused = true;
    });

    $('#send_but, #option_regenerate, #option_continue, #mes_continue, #mes_impersonate').on('click', () => {
        if (previouslyFocused) {
            $('#send_textarea').trigger('focus');
        }
    });

    $(document).on('click', event => {
        if ($(':focus').attr('id') !== 'send_textarea') {
            const validIDs = ['options_button', 'send_but', 'mes_impersonate', 'mes_continue', 'send_textarea', 'option_regenerate', 'option_continue'];
            if (!validIDs.includes($(event.target).attr('id'))) {
                previouslyFocused = false;
            }
        } else {
            previouslyFocused = true;
        }
    });
}

export function initEditTextareaAutoFit({ chatElement, debounceMs }) {
    if (CSS.supports('field-sizing', 'content')) {
        return;
    }

    /**
     * Sets the scroll height of the edit textarea to fit the content.
     * @param {HTMLTextAreaElement} textarea Textarea element to auto-fit
     */
    function autoFitEditTextArea(textarea) {
        const scrollTop = chatElement.scrollTop();
        textarea.style.height = '0px';
        const newHeight = textarea.scrollHeight + 4;
        textarea.style.height = `${newHeight}px`;
        chatElement.scrollTop(scrollTop);
    }

    const autoFitEditTextAreaDebounced = debounceBound(autoFitEditTextArea, debounceMs);
    document.addEventListener('input', event => {
        if (!(event.target instanceof HTMLTextAreaElement) || !event.target.classList.contains('edit_textarea')) {
            return;
        }

        const scrollbarShown = event.target.clientWidth < event.target.offsetWidth && event.target.offsetHeight >= window.innerHeight * 0.75;
        const immediately = (event.target.scrollHeight > event.target.offsetHeight && !scrollbarShown) || event.target.value === '';
        if (immediately) {
            autoFitEditTextArea(event.target);
        } else {
            autoFitEditTextAreaDebounced(event.target);
        }
    });
}

export function initInlineDrawerBindings() {
    $(document).on('click', '.inline-drawer-toggle', async function (e) {
        if ($(e.target).hasClass('text_pole')) {
            return;
        }
        const drawer = $(this).closest('.inline-drawer');
        const icon = drawer.find('>.inline-drawer-header .inline-drawer-icon');
        const drawerContent = drawer.find('>.inline-drawer-content');
        icon.toggleClass('down up');
        icon.toggleClass('fa-circle-chevron-down fa-circle-chevron-up');
        drawer.trigger('inline-drawer-toggle');
        drawerContent.stop().slideToggle({
            complete: () => {
                $(this).css('height', '');
            },
        });

        if (!CSS.supports('field-sizing', 'content')) {
            const textareas = drawerContent.find('textarea.autoSetHeight');
            for (const textarea of textareas) {
                await resetScrollHeightBound($(textarea));
            }
        }
    });

    $(document).on('click', '.inline-drawer-maximize', function () {
        const icon = $(this).find('.inline-drawer-icon, .floating_panel_maximize');
        icon.toggleClass('fa-window-maximize fa-window-restore');
        const drawerContent = $(this).closest('.drawer-content');
        drawerContent.toggleClass('maximized');
        const drawerId = drawerContent.attr('id');
        resetMovableStylesBound(drawerId);
    });
}

export function initExecutionControlBindings() {
    $(document).on('click', '.mes_stop', function () {
        stopGenerationBound();
    });

    $(document).on('click', '#form_sheld .stscript_continue', function () {
        pauseScriptExecutionBound();
    });

    $(document).on('click', '#form_sheld .stscript_pause', function () {
        pauseScriptExecutionBound();
    });

    $(document).on('click', '#form_sheld .stscript_stop', function () {
        stopScriptExecutionBound();
    });
}

export function initMessageActionRevealBindings({ getExpandMessageActionsEnabled }) {
    $(document).on('click', '.extraMesButtonsHint', function (e) {
        const $hint = $(e.target);
        const $buttons = $hint.siblings('.extraMesButtons');

        $hint.transition({
            opacity: 0,
            duration: animation_duration,
            easing: animation_easing,
            complete: function () {
                $hint.hide();
                $buttons
                    .addClass('visible')
                    .css({
                        opacity: 0,
                        display: 'flex',
                    })
                    .transition({
                        opacity: 1,
                        duration: animation_duration,
                        easing: animation_easing,
                    });
            },
        });
    });

    $(document).on('click', function (e) {
        if (getExpandMessageActionsEnabled()) {
            return;
        }

        if (!$(e.target).closest('.extraMesButtons, .extraMesButtonsHint').length) {
            const $visibleButtons = $('.extraMesButtons.visible');
            if (!$visibleButtons.length) {
                return;
            }

            const $hiddenHints = $('.extraMesButtonsHint:hidden');
            $visibleButtons.transition({
                opacity: 0,
                duration: animation_duration,
                easing: animation_easing,
                complete: function () {
                    $(this)
                        .hide()
                        .removeClass('visible');

                    $hiddenHints
                        .show()
                        .transition({
                            opacity: 0.3,
                            duration: animation_duration,
                            easing: animation_easing,
                            complete: function () {
                                $(this).css('opacity', '');
                            },
                        });
                },
            });
        }
    });
}

export function initDrawerClickAwayBindings() {
    $('html').on('touchstart mousedown', async function (e) {
        const clickTarget = $(e.target);

        const forbiddenTargets = [
            '#character_cross',
            '#avatar-and-name-block',
            '#shadow_popup',
            '.popup',
            '#world_popup',
            '.ui-widget',
            '.text_pole',
            '#toast-container',
            '.select2-results',
        ];

        for (const id of forbiddenTargets) {
            if (clickTarget.closest(id).length > 0) {
                return;
            }
        }

        const targetParentHasOpenDrawer = clickTarget.parents('.openDrawer').length;
        if (!clickTarget.hasClass('drawer-icon') && !clickTarget.hasClass('openDrawer')) {
            const $openDrawers = $('.openDrawer').not('.pinnedOpen');
            if ($openDrawers.length && targetParentHasOpenDrawer === 0) {
                $('.openIcon').not('.drawerPinnedOpen').toggleClass('closedIcon openIcon');
                $openDrawers.toggleClass('closedDrawer openDrawer');
            }
        }
    });
}

export function initRangeInputBindings() {
    let isManualInput = false;
    let valueBeforeManualInput;

    $(document).on('input', '.range-block-counter input, .neo-range-input', function () {
        valueBeforeManualInput = $(this).val();
        console.log(valueBeforeManualInput);
    });

    $(document).on('change', '.range-block-counter input, .neo-range-input', function (e) {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        e.target.focus();
        e.target.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    });

    $(document).on('keydown', '.range-block-counter input, .neo-range-input', function (e) {
        const masterSelector = '#' + $(this).data('for');
        const masterElement = $(masterSelector);
        if (e.key === 'Enter') {
            const manualInput = Number($(this).val());
            if (isManualInput) {
                if (manualInput >= Number($(this).attr('min')) && manualInput <= Number($(this).attr('max'))) {
                    valueBeforeManualInput = manualInput;
                    $(masterElement).val($(this).val()).trigger('input', { forced: true });
                } else {
                    toastr.warning(`Invalid value. Must be between ${$(this).attr('min')} and ${$(this).attr('max')}`);
                    $(this).val(valueBeforeManualInput);
                }
            }
        }
    });

    $(document).on('keyup', '.range-block-counter input, .neo-range-input', function () {
        valueBeforeManualInput = $(this).val();
        isManualInput = true;
    });

    $(document).on('mouseup blur', '.range-block-counter input, .neo-range-input', function () {
        const masterSelector = '#' + $(this).data('for');
        const masterElement = $(masterSelector);
        const manualInput = Number($(this).val());
        if (isManualInput) {
            if (manualInput >= Number($(this).attr('min')) && manualInput <= Number($(this).attr('max'))) {
                valueBeforeManualInput = manualInput;
                $(masterElement).val($(this).val()).trigger('input', { forced: true });
            } else {
                toastr.warning(`Invalid value. Must be between ${$(this).attr('min')} and ${$(this).attr('max')}`);
                $(this).val(valueBeforeManualInput);
            }
        }
        isManualInput = false;
    });
}

export function initWorldInfoDrawerBindings({ delay }) {
    document.addEventListener('click', function (e) {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }

        if (e.target.matches('#OpenAllWIEntries')) {
            document.querySelectorAll('#world_popup_entries_list .inline-drawer').forEach((/** @type {HTMLElement} */ drawer) => {
                delay(0).then(() => toggleDrawer(drawer, true));
            });
        } else if (e.target.matches('#CloseAllWIEntries')) {
            document.querySelectorAll('#world_popup_entries_list .inline-drawer').forEach((/** @type {HTMLElement} */ drawer) => {
                toggleDrawer(drawer, false);
            });
        }
    });
}

export function initEscapeKeyBindings({
    getAutoSaveMessageEditsEnabled,
    closeMessageEditor,
    getEditedMessageId,
}) {
    $(document).on('keyup', function (e) {
        if (e.key !== 'Escape') {
            return;
        }

        const editedMessageId = getEditedMessageId();
        const isEditVisible = $('#curEditTextarea').is(':visible') || $('.reasoning_edit_textarea').length > 0;
        if (isEditVisible && getAutoSaveMessageEditsEnabled() === false) {
            closeMessageEditor('all');
            $('#send_textarea').trigger('focus');
            return;
        }
        if (isEditVisible && getAutoSaveMessageEditsEnabled() === true) {
            $(`#chat .mes[mesid="${editedMessageId}"] .mes_edit_done`).trigger('click');
            closeMessageEditor('reasoning');
            $('#send_textarea').trigger('focus');
            return;
        }
        if (!editedMessageId && $('#mes_stop').is(':visible')) {
            $('#mes_stop').trigger('click');
            if (chat.length && Array.isArray(chat[chat.length - 1].swipes) && chat[chat.length - 1].swipe_id == chat[chat.length - 1].swipes.length) {
                $('.last_mes .swipe_left').trigger('click');
            }
        }
    });
}

export function initUnloadBindings({
    cancelTtsPlay,
    getStreamingProcessor,
    getIsChatSaving,
}) {
    $(window).on('beforeunload', () => {
        cancelTtsPlay();
        const streamingProcessor = getStreamingProcessor();
        if (streamingProcessor) {
            console.log('Page reloaded. Aborting streaming...');
            streamingProcessor.onStopStreaming();
        }
    });

    window.addEventListener('beforeunload', (e) => {
        if (getIsChatSaving()) {
            e.preventDefault();
            e.returnValue = true;
        }
    });
}

export function initAutoSelectBindings({ getAutoSelectEnabled }) {
    $(document).on('focus', 'input.auto-select, textarea.auto-select', function () {
        if (!getAutoSelectEnabled()) {
            return;
        }

        const control = $(this)[0];
        if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
            control.select();
            console.debug('Auto-selecting content of input control', control);
        }
    });
}

export function initStatsButtonBindings({ userStatsHandler }) {
    $('.user_stats_button').on('click', function () {
        userStatsHandler();
    });
}

export function initExternalImportBindings({ importExternalContent }) {
    $(document).on('click', '.external_import_button, #external_import_button', async () => {
        await importExternalContent();
    });
}

export function initCharacterDragDropBindings({
    createDragAndDropHandler,
    importFromURL,
    processDroppedFiles,
    setCharDragDropHandler,
}) {
    const handler = createDragAndDropHandler(async (files, event) => {
        if (!files.length) {
            await importFromURL(event.originalEvent.dataTransfer.items, files);
        }
        await processDroppedFiles(files);
    });

    setCharDragDropHandler(handler);
    return handler;
}

export function initChatHistoryBindings({
    showMoreMessages,
    getCharacters,
    emitOpenCharacterLibrary,
}) {
    $(document).on('mouseup touchend', '#show_more_messages', async function () {
        await showMoreMessages();
    });

    $(document).on('click', '.open_characters_library', async function () {
        await getCharacters();
        await emitOpenCharacterLibrary();
    });
}

export function showStopButton() {
    document.getElementById('mes_stop')?.style.setProperty('display', 'flex');
}

export function hideStopButton() {
    const stopButton = document.getElementById('mes_stop');
    if (stopButton && getComputedStyle(stopButton).display !== 'none') {
        stopButton?.style.setProperty('display', 'none');
        eventSource.emit(event_types.GENERATION_ENDED, chat.length);
    }
}

export function activateSendButtons(setSendButtonState) {
    setSendButtonState(false);
    hideStopButton();
    delete document.body.dataset.generating;
}

export function deactivateSendButtons() {
    showStopButton();
    document.body.dataset.generating = 'true';
}

export function setSendButtonState(value) {
    syncIsSendPress(value);
    return is_send_press;
}
