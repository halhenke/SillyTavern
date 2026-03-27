import { chat } from './chat-operations-core.js';
import { event_types, eventSource } from './events.js';
import { syncConverter } from './parser-core.js';
import { markdownExclusionExt } from './showdown-exclusion.js';
import { markdownUnderscoreExt } from './showdown-underscore.js';

import { showdown } from '../lib.js';

let addCopyToCodeBlocksImpl = null;
let callPopupImpl = null;
let debounceImpl = null;
let delayImpl = null;
let favsToHotswapImpl = null;
let resetScrollHeightImpl = null;
let resetMovableStylesImpl = null;
let scrollChatToBottomImpl = null;
let showBookmarksButtonsImpl = null;

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
 *   addCopyToCodeBlocks: (...args: any[]) => any,
 *   callPopup: (...args: any[]) => any,
 *   debounce: (...args: any[]) => any,
 *   delay: (...args: any[]) => Promise<any>,
 *   favsToHotswap: (...args: any[]) => any,
 *   resetMovableStyles: (...args: any[]) => any,
 *   resetScrollHeight: (...args: any[]) => Promise<any>,
 *   scrollChatToBottom: (...args: any[]) => any,
 *   showBookmarksButtons: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindUiCore(impl) {
    addCopyToCodeBlocksImpl = impl?.addCopyToCodeBlocks ?? null;
    callPopupImpl = impl?.callPopup ?? null;
    debounceImpl = impl?.debounce ?? null;
    delayImpl = impl?.delay ?? null;
    favsToHotswapImpl = impl?.favsToHotswap ?? null;
    resetMovableStylesImpl = impl?.resetMovableStyles ?? null;
    resetScrollHeightImpl = impl?.resetScrollHeight ?? null;
    scrollChatToBottomImpl = impl?.scrollChatToBottom ?? null;
    showBookmarksButtonsImpl = impl?.showBookmarksButtons ?? null;
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
    if (!addCopyToCodeBlocksImpl) {
        throwUnbound('addCopyToCodeBlocks');
    }

    return addCopyToCodeBlocksImpl(...args);
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

export function initOptionsMenu({ buttonSelector = '#options_button', menuSelector = '#options', popper } = {}) {
    const button = $(buttonSelector);
    const menu = $(menuSelector);
    let isOptionsMenuVisible = false;

    function showMenu() {
        showBookmarksButtonsBound();
        menu.fadeIn(animation_duration);
        popper?.update();
        isOptionsMenuVisible = true;
    }

    function hideMenu() {
        menu.fadeOut(animation_duration);
        popper?.update();
        isOptionsMenuVisible = false;
    }

    function isMouseOverButtonOrMenu() {
        return menu.is(':hover, :focus-within') || button.is(':hover, :focus');
    }

    button.on('click', function () {
        if (isOptionsMenuVisible) {
            hideMenu();
        } else {
            showMenu();
        }
    });

    $(document).on('click', function () {
        if (!isOptionsMenuVisible) {
            return;
        }
        if (!isMouseOverButtonOrMenu()) {
            hideMenu();
        }
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
