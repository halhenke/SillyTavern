import { chat } from './chat-operations-core.js';
import { event_types, eventSource } from './events.js';
import { syncConverter } from './parser-core.js';
import { markdownExclusionExt } from './showdown-exclusion.js';
import { markdownUnderscoreExt } from './showdown-underscore.js';

import { showdown } from '../lib.js';

let addCopyToCodeBlocksImpl = null;
let callPopupImpl = null;
let delayImpl = null;
let favsToHotswapImpl = null;
let resetScrollHeightImpl = null;
let scrollChatToBottomImpl = null;

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
 *   delay: (...args: any[]) => Promise<any>,
 *   favsToHotswap: (...args: any[]) => any,
 *   resetScrollHeight: (...args: any[]) => Promise<any>,
 *   scrollChatToBottom: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindUiCore(impl) {
    addCopyToCodeBlocksImpl = impl?.addCopyToCodeBlocks ?? null;
    callPopupImpl = impl?.callPopup ?? null;
    delayImpl = impl?.delay ?? null;
    favsToHotswapImpl = impl?.favsToHotswap ?? null;
    resetScrollHeightImpl = impl?.resetScrollHeight ?? null;
    scrollChatToBottomImpl = impl?.scrollChatToBottom ?? null;
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
