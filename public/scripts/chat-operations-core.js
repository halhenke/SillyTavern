import { SVGInject, moment } from '../lib.js';
import { getMessageTimeStamp } from './RossAscends-mods.js';
import { isChatSaving } from './app-state-core.js';
import { characters } from './character-core.js';
import { default_avatar, getCurrentChatId, chat_metadata, syncChatMetadata, this_chid, user_avatar } from './chat-core.js';
import { debounce_timeout } from './constants.js';
import { event_types, eventSource } from './events.js';
import { getRegexedString, regex_placement } from './extensions/regex/engine.js';
import { getThumbnailUrl } from './network-core.js';
import { humanFileSize, timestampToMoment, waitUntilCondition, uuidv4 } from './utils.js';
import { humanizedDateTime } from './RossAscends-mods.js';

let activateSendButtonsImpl = null;
let appendMediaToMessageImpl = null;
let cancelDebouncedChatSaveImpl = null;
let cancelDebouncedMetadataSaveImpl = null;
let cancelDeleteModeImpl = null;
let closeMessageEditorImpl = null;
let createOrEditCharacterImpl = null;
let deactivateSendButtonsImpl = null;
let deleteSwipeImpl = null;
let displayPastChatsImpl = null;
let extractMessageBiasImpl = null;
let formatCharacterAvatarImpl = null;
let getChatTruncationImpl = null;
let getCharacterAvatarImpl = null;
let getCharacterCardFieldsImpl = null;
let getCharactersImpl = null;
let getCurrentChatDetailsImpl = null;
let getSelectedGroupImpl = null;
let getMaxContextSizeImpl = null;
let hideSwipeButtonsImpl = null;
let isDeleteModeImpl = null;
let getGroupChatImpl = null;
let processDroppedFilesImpl = null;
let preserveNeutralChatImpl = null;
let renameChatImpl = null;
let resetChatStateImpl = null;
let loadItemizedPromptsImpl = null;
let restoreNeutralChatImpl = null;
let resetExtensionPromptsImpl = null;
let resetItemizedPromptsImpl = null;
let saveChatImpl = null;
let saveChatConditionalImpl = null;
let saveItemizedPromptsImpl = null;
let saveReplyImpl = null;
let sendMessageAsUserImpl = null;
let selectSelectedCharacterImpl = null;
let showSwipeButtonsImpl = null;
let showMoreMessagesImpl = null;
let shouldShowTimestampModelIconImpl = null;
let swipeLeftImpl = null;
let swipeRightImpl = null;
let unshallowCharacterImpl = null;
let updateBookmarkDisplayImpl = null;
let getItemizedPromptsImpl = null;
let messageFormattingImpl = null;
let addCopyToCodeBlocksImpl = null;
let scrollChatToBottomImpl = null;
let applyStylePinsImpl = null;
let applyCharacterTagsToMessageDivsImpl = null;
let updateReasoningUIImpl = null;

export let chat = [];
export let create_save = {};
export let displayVersion = 'SillyTavern';
export let systemUserName = 'SillyTavern System';
export let system_avatar = '';

function throwUnbound(name) {
    throw new Error(`[chat-operations-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy chat operation implementations to standalone wrappers.
 * @param {{
 *   activateSendButtons: (...args: any[]) => any,
 *   appendMediaToMessage: (...args: any[]) => any,
 *   cancelDebouncedChatSave: (...args: any[]) => any,
 *   cancelDebouncedMetadataSave: (...args: any[]) => any,
 *   cancelDeleteMode: (...args: any[]) => any,
 *   closeMessageEditor: (...args: any[]) => any,
 *   createOrEditCharacter: (...args: any[]) => Promise<any>,
  *   deactivateSendButtons: (...args: any[]) => any,
  *   deleteSwipe: (...args: any[]) => Promise<any>,
  *   displayPastChats: (...args: any[]) => Promise<any>,
  *   extractMessageBias: (...args: any[]) => any,
  *   formatCharacterAvatar: (...args: any[]) => any,
 *   getChatTruncation: () => number,
 *   getCharacterAvatar: (...args: any[]) => any,
  *   getCharacterCardFields: (...args: any[]) => any,
  *   getCharacters: (...args: any[]) => Promise<any>,
  *   getCurrentChatDetails: (...args: any[]) => any,
 *   getItemizedPrompts: () => any[],
 *   getSelectedGroup: () => string|null|undefined,
  *   getGroupChat: (...args: any[]) => Promise<any>,
  *   getMaxContextSize: (...args: any[]) => number,
   *   hideSwipeButtons: (...args: any[]) => any,
  *   isDeleteMode: () => boolean,
 *   messageFormatting: (...args: any[]) => string,
 *   preserveNeutralChat: (...args: any[]) => any,
 *   processDroppedFiles: (...args: any[]) => Promise<any>,
  *   renameChat: (...args: any[]) => Promise<any>,
  *   resetChatState: (...args: any[]) => any,
  *   resetExtensionPrompts: () => any,
  *   resetItemizedPrompts: () => any,
  *   restoreNeutralChat: (...args: any[]) => any,
 *   scrollChatToBottom: () => any,
  *   loadItemizedPrompts: (...args: any[]) => Promise<any>,
  *   saveChat: (...args: any[]) => Promise<any>,
  *   saveChatConditional: (...args: any[]) => Promise<any>,
  *   saveItemizedPrompts: (...args: any[]) => Promise<any>,
  *   saveReply: (...args: any[]) => Promise<any>,
  *   sendMessageAsUser: (...args: any[]) => Promise<any>,
  *   select_selected_character: (...args: any[]) => Promise<any>,
  *   showSwipeButtons: (...args: any[]) => any,
  *   showMoreMessages: (...args: any[]) => Promise<any>,
 *   shouldShowTimestampModelIcon: () => boolean,
  *   swipe_left: (...args: any[]) => Promise<any>,
  *   swipe_right: (...args: any[]) => Promise<any>,
  *   unshallowCharacter: (...args: any[]) => Promise<any>,
 *   updateBookmarkDisplay: (...args: any[]) => any,
 *   addCopyToCodeBlocks: (...args: any[]) => any,
 *   applyStylePins: (...args: any[]) => any,
 *   applyCharacterTagsToMessageDivs: (...args: any[]) => any,
 *   updateReasoningUI: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindChatOperationsCore(impl) {
    activateSendButtonsImpl = impl?.activateSendButtons ?? null;
    appendMediaToMessageImpl = impl?.appendMediaToMessage ?? null;
    cancelDebouncedChatSaveImpl = impl?.cancelDebouncedChatSave ?? null;
    cancelDebouncedMetadataSaveImpl = impl?.cancelDebouncedMetadataSave ?? null;
    cancelDeleteModeImpl = impl?.cancelDeleteMode ?? null;
    closeMessageEditorImpl = impl?.closeMessageEditor ?? null;
    createOrEditCharacterImpl = impl?.createOrEditCharacter ?? null;
    deactivateSendButtonsImpl = impl?.deactivateSendButtons ?? null;
    deleteSwipeImpl = impl?.deleteSwipe ?? null;
    displayPastChatsImpl = impl?.displayPastChats ?? null;
    extractMessageBiasImpl = impl?.extractMessageBias ?? null;
    formatCharacterAvatarImpl = impl?.formatCharacterAvatar ?? null;
    getChatTruncationImpl = impl?.getChatTruncation ?? null;
    getCharacterAvatarImpl = impl?.getCharacterAvatar ?? null;
    getCharacterCardFieldsImpl = impl?.getCharacterCardFields ?? null;
    getCharactersImpl = impl?.getCharacters ?? null;
    getCurrentChatDetailsImpl = impl?.getCurrentChatDetails ?? null;
    getItemizedPromptsImpl = impl?.getItemizedPrompts ?? null;
    getSelectedGroupImpl = impl?.getSelectedGroup ?? null;
    getGroupChatImpl = impl?.getGroupChat ?? null;
    getMaxContextSizeImpl = impl?.getMaxContextSize ?? null;
    hideSwipeButtonsImpl = impl?.hideSwipeButtons ?? null;
    isDeleteModeImpl = impl?.isDeleteMode ?? null;
    messageFormattingImpl = impl?.messageFormatting ?? null;
    preserveNeutralChatImpl = impl?.preserveNeutralChat ?? null;
    processDroppedFilesImpl = impl?.processDroppedFiles ?? null;
    renameChatImpl = impl?.renameChat ?? null;
    resetChatStateImpl = impl?.resetChatState ?? null;
    resetExtensionPromptsImpl = impl?.resetExtensionPrompts ?? null;
    resetItemizedPromptsImpl = impl?.resetItemizedPrompts ?? null;
    loadItemizedPromptsImpl = impl?.loadItemizedPrompts ?? null;
    restoreNeutralChatImpl = impl?.restoreNeutralChat ?? null;
    saveChatImpl = impl?.saveChat ?? null;
    saveChatConditionalImpl = impl?.saveChatConditional ?? null;
    saveItemizedPromptsImpl = impl?.saveItemizedPrompts ?? null;
    saveReplyImpl = impl?.saveReply ?? null;
    scrollChatToBottomImpl = impl?.scrollChatToBottom ?? null;
    sendMessageAsUserImpl = impl?.sendMessageAsUser ?? null;
    selectSelectedCharacterImpl = impl?.select_selected_character ?? null;
    showSwipeButtonsImpl = impl?.showSwipeButtons ?? null;
    showMoreMessagesImpl = impl?.showMoreMessages ?? null;
    shouldShowTimestampModelIconImpl = impl?.shouldShowTimestampModelIcon ?? null;
    swipeLeftImpl = impl?.swipe_left ?? null;
    swipeRightImpl = impl?.swipe_right ?? null;
    unshallowCharacterImpl = impl?.unshallowCharacter ?? null;
    updateBookmarkDisplayImpl = impl?.updateBookmarkDisplay ?? null;
    addCopyToCodeBlocksImpl = impl?.addCopyToCodeBlocks ?? null;
    applyStylePinsImpl = impl?.applyStylePins ?? null;
    applyCharacterTagsToMessageDivsImpl = impl?.applyCharacterTagsToMessageDivs ?? null;
    updateReasoningUIImpl = impl?.updateReasoningUI ?? null;
}

export function syncChat(value) {
    chat = value;
}

export function syncCreateSave(value) {
    create_save = value;
}

export function syncDisplayVersion(value) {
    displayVersion = value;
}

export function syncSystemUserName(value) {
    systemUserName = value;
}

export function syncSystemAvatar(value) {
    system_avatar = value;
}

export function activateSendButtons(...args) {
    if (!activateSendButtonsImpl) throwUnbound('activateSendButtons');
    return activateSendButtonsImpl(...args);
}

export function addOneMessage(...args) {
    return addOneMessageInternal(...args);
}

export function appendMediaToMessage(...args) {
    if (!appendMediaToMessageImpl) throwUnbound('appendMediaToMessage');
    return appendMediaToMessageImpl(...args);
}

export async function clearChat() {
    if (!cancelDebouncedChatSaveImpl) throwUnbound('cancelDebouncedChatSave');
    if (!cancelDebouncedMetadataSaveImpl) throwUnbound('cancelDebouncedMetadataSave');
    if (!closeMessageEditorImpl) throwUnbound('closeMessageEditor');
    if (!resetExtensionPromptsImpl) throwUnbound('resetExtensionPrompts');
    if (!isDeleteModeImpl) throwUnbound('isDeleteMode');
    if (!cancelDeleteModeImpl) throwUnbound('cancelDeleteMode');
    if (!resetItemizedPromptsImpl) throwUnbound('resetItemizedPrompts');

    cancelDebouncedChatSaveImpl();
    cancelDebouncedMetadataSaveImpl();
    closeMessageEditorImpl();
    resetExtensionPromptsImpl();

    if (isDeleteModeImpl()) {
        cancelDeleteModeImpl();
    }

    document.getElementById('chat')?.replaceChildren();
    const zoomedAvatars = document.querySelectorAll('.zoomed_avatar[forChar]');
    if (zoomedAvatars.length) {
        console.debug('saw avatars to remove');
        zoomedAvatars.forEach(node => node.remove());
    } else {
        console.debug('saw no avatars');
    }

    await saveItemizedPrompts(getCurrentChatId());
    resetItemizedPromptsImpl();
}

export function deactivateSendButtons(...args) {
    if (!deactivateSendButtonsImpl) throwUnbound('deactivateSendButtons');
    return deactivateSendButtonsImpl(...args);
}

export function deleteSwipe(...args) {
    if (!deleteSwipeImpl) throwUnbound('deleteSwipe');
    return deleteSwipeImpl(...args);
}

export async function deleteLastMessage() {
    chat.length = chat.length - 1;
    document.querySelector('#chat .mes:last-child')?.remove();
    await eventSource.emit(event_types.MESSAGE_DELETED, chat.length);
}

export function displayPastChats(...args) {
    if (!displayPastChatsImpl) throwUnbound('displayPastChats');
    return displayPastChatsImpl(...args);
}

export function extractMessageBias(...args) {
    if (!extractMessageBiasImpl) throwUnbound('extractMessageBias');
    return extractMessageBiasImpl(...args);
}

export function formatCharacterAvatar(...args) {
    if (!formatCharacterAvatarImpl) throwUnbound('formatCharacterAvatar');
    return formatCharacterAvatarImpl(...args);
}

export function getCharacterAvatar(...args) {
    if (!getCharacterAvatarImpl) throwUnbound('getCharacterAvatar');
    return getCharacterAvatarImpl(...args);
}

export function getCharacterCardFields(...args) {
    if (!getCharacterCardFieldsImpl) throwUnbound('getCharacterCardFields');
    return getCharacterCardFieldsImpl(...args);
}

export function getCharacters(...args) {
    if (!getCharactersImpl) throwUnbound('getCharacters');
    return getCharactersImpl(...args);
}

export function getCurrentChatDetails(...args) {
    if (!getCurrentChatDetailsImpl) throwUnbound('getCurrentChatDetails');
    return getCurrentChatDetailsImpl(...args);
}

export function getMaxContextSize(...args) {
    if (!getMaxContextSizeImpl) throwUnbound('getMaxContextSize');
    return getMaxContextSizeImpl(...args);
}

export function hideSwipeButtons(...args) {
    if (!hideSwipeButtonsImpl) throwUnbound('hideSwipeButtons');
    return hideSwipeButtonsImpl(...args);
}

export function loadItemizedPrompts(...args) {
    if (!loadItemizedPromptsImpl) throwUnbound('loadItemizedPrompts');
    return loadItemizedPromptsImpl(...args);
}

export function printMessages(...args) {
    return printMessagesInternal(...args);
}

export function processDroppedFiles(...args) {
    if (!processDroppedFilesImpl) throwUnbound('processDroppedFiles');
    return processDroppedFilesImpl(...args);
}

export function renameChat(...args) {
    if (!renameChatImpl) throwUnbound('renameChat');
    return renameChatImpl(...args);
}

export function saveChat(...args) {
    if (!saveChatImpl) throwUnbound('saveChat');
    return saveChatImpl(...args);
}

export function saveChatConditional(...args) {
    if (!saveChatConditionalImpl) throwUnbound('saveChatConditional');
    return saveChatConditionalImpl(...args);
}

export function saveItemizedPrompts(...args) {
    if (!saveItemizedPromptsImpl) throwUnbound('saveItemizedPrompts');
    return saveItemizedPromptsImpl(...args);
}

export function saveReply(...args) {
    if (!saveReplyImpl) throwUnbound('saveReply');
    return saveReplyImpl(...args);
}

export function sendMessageAsUser(...args) {
    if (!sendMessageAsUserImpl) throwUnbound('sendMessageAsUser');
    return sendMessageAsUserImpl(...args);
}

function insertSVGIcon(mes, extra) {
    let modelName;
    if (extra.api === 'openai' && extra.model?.toLowerCase().includes('claude')) {
        modelName = 'claude';
    } else if (extra.api === 'openai' && extra.model?.toLowerCase().includes('openai')) {
        modelName = 'openai';
    } else if (extra.api === 'openai' && (extra.model === null || extra.model?.toLowerCase().includes('/'))) {
        modelName = 'openrouter';
    } else {
        modelName = extra.api;
    }

    const insertOrReplaceSVG = (image, className, targetSelector, insertBefore) => {
        image.onload = async function () {
            const target = mes.find(targetSelector);
            const existingSVG = insertBefore ? target.prev(`.${className}`) : target.next(`.${className}`);
            if (existingSVG.length) {
                existingSVG.replaceWith(image);
            } else if (insertBefore) {
                target.before(image);
            } else {
                target.after(image);
            }
            await SVGInject(image);
        };
    };

    const createModelImage = (className, targetSelector, insertBefore) => {
        const image = new Image();
        image.classList.add('icon-svg', className);
        image.src = `/img/${modelName}.svg`;
        image.title = `${extra?.api ? `${extra.api} - ` : ''}${extra?.model ?? ''}`;
        insertOrReplaceSVG(image, className, targetSelector, insertBefore);
    };

    createModelImage('timestamp-icon', '.timestamp');
    createModelImage('thinking-icon', '.mes_reasoning_header_title', true);
}

function getMessageFromTemplate({
    mesId,
    swipeId,
    characterName,
    isUser,
    avatarImg,
    bias,
    isSystem,
    title,
    timerValue,
    timerTitle,
    bookmarkLink,
    forceAvatar,
    timestamp,
    tokenCount,
    extra,
    type,
}) {
    if (!updateReasoningUIImpl) throwUnbound('updateReasoningUI');
    if (!shouldShowTimestampModelIconImpl) throwUnbound('shouldShowTimestampModelIcon');
    if (!updateBookmarkDisplayImpl) throwUnbound('updateBookmarkDisplay');

    const mes = $('#message_template .mes').clone();
    mes.attr({
        mesid: mesId,
        swipeid: swipeId,
        ch_name: characterName,
        is_user: isUser,
        is_system: !!isSystem,
        bookmark_link: bookmarkLink,
        force_avatar: !!forceAvatar,
        timestamp: timestamp,
        ...(type ? { type } : {}),
    });
    mes.find('.avatar img').attr('src', avatarImg);
    mes.find('.ch_name .name_text').text(characterName);
    mes.find('.mes_bias').html(bias);
    mes.find('.timestamp').text(timestamp).attr('title', `${extra?.api ? `${extra.api} - ` : ''}${extra?.model ?? ''}`);
    mes.find('.mesIDDisplay').text(`#${mesId}`);
    if (tokenCount) {
        mes.find('.tokenCounterDisplay').text(`${tokenCount}t`);
    }
    if (title) {
        mes.attr('title', title);
    }
    if (timerValue) {
        mes.find('.mes_timer').attr('title', timerTitle).text(timerValue);
    }
    if (bookmarkLink) {
        updateBookmarkDisplayImpl(mes);
    }

    updateReasoningUIImpl(mes);

    if (shouldShowTimestampModelIconImpl() && extra?.api) {
        insertSVGIcon(mes, extra);
    }

    return mes;
}

export function formatGenerationTimer(gen_started, gen_finished, tokenCount, reasoningDuration = null, timeToFirstToken = null) {
    if (!gen_started || !gen_finished) {
        return {};
    }

    const dateFormat = 'HH:mm:ss D MMM YYYY';
    const start = moment(gen_started);
    const finish = moment(gen_finished);
    const seconds = finish.diff(start, 'seconds', true);
    const timerValue = `${seconds.toFixed(1)}s`;
    const timerTitle = [
        `Generation queued: ${start.format(dateFormat)}`,
        `Reply received: ${finish.format(dateFormat)}`,
        `Time to generate: ${seconds} seconds`,
        timeToFirstToken ? `Time to first token: ${timeToFirstToken / 1000} seconds` : '',
        reasoningDuration > 0 ? `Time to think: ${reasoningDuration / 1000} seconds` : '',
        tokenCount > 0 ? `Token rate: ${Number(tokenCount / seconds).toFixed(3)} t/s` : '',
    ].filter(x => x).join('\n').trim();

    if (isNaN(seconds) || seconds < 0) {
        return { timerValue: '', timerTitle };
    }

    return { timerValue, timerTitle };
}

export function formatSwipeCounter(current, total) {
    if (isNaN(current) || isNaN(total)) {
        return '';
    }

    return `${current}\u200b/\u200b${total}`;
}

function addOneMessageInternal(mes, { type = 'normal', insertAfter = null, scroll = true, insertBefore = null, forceId = null, showSwipes = true } = {}) {
    if (!messageFormattingImpl) throwUnbound('messageFormatting');
    if (!getItemizedPromptsImpl) throwUnbound('getItemizedPrompts');
    if (!addCopyToCodeBlocksImpl) throwUnbound('addCopyToCodeBlocks');
    if (!scrollChatToBottomImpl) throwUnbound('scrollChatToBottom');
    if (!applyCharacterTagsToMessageDivsImpl) throwUnbound('applyCharacterTagsToMessageDivs');

    let messageText = mes.mes;
    const momentDate = timestampToMoment(mes.send_date);
    const timestamp = momentDate.isValid() ? momentDate.format('LL LT') : '';

    if (mes?.extra?.display_text) {
        messageText = mes.extra.display_text;
    }

    if (type === 'swipe' && mes.swipe_id === undefined) {
        mes.swipe_id = 0;
        mes.swipes = [mes.mes];
    }

    let avatarImg = getThumbnailUrl('persona', user_avatar);
    const isSystem = mes.is_system;
    const title = mes.title;

    if (!mes.is_user) {
        if (mes.force_avatar) {
            avatarImg = mes.force_avatar;
        } else if (this_chid === undefined) {
            avatarImg = system_avatar;
        } else if (characters[this_chid].avatar !== 'none') {
            avatarImg = getThumbnailUrl('avatar', characters[this_chid].avatar);
        } else {
            avatarImg = default_avatar;
        }
    } else if (mes.is_user && mes.force_avatar) {
        avatarImg = mes.force_avatar;
    }

    const sanitizerOverrides = mes.uses_system_ui ? { MESSAGE_ALLOW_SYSTEM_UI: true } : {};
    messageText = messageFormattingImpl(
        messageText,
        mes.name,
        isSystem,
        mes.is_user,
        chat.indexOf(mes),
        sanitizerOverrides,
        false,
    );
    const bias = messageFormattingImpl(mes.extra?.bias ?? '', '', false, false, -1, {}, false);

    const params = {
        mesId: forceId ?? chat.length - 1,
        swipeId: mes.swipe_id ?? 0,
        characterName: mes.name,
        isUser: mes.is_user,
        avatarImg,
        bias,
        isSystem,
        title,
        bookmarkLink: mes?.extra?.bookmark_link ?? '',
        forceAvatar: mes.force_avatar,
        timestamp,
        extra: mes.extra,
        tokenCount: mes.extra?.token_count ?? 0,
        type: mes.extra?.type ?? '',
        ...formatGenerationTimer(mes.gen_started, mes.gen_finished, mes.extra?.token_count, mes.extra?.reasoning_duration, mes.extra?.time_to_first_token),
    };

    const renderedMessage = getMessageFromTemplate(params);
    const chatElement = $('#chat');

    if (type !== 'swipe') {
        if (!insertAfter && !insertBefore) {
            chatElement.append(renderedMessage);
        } else if (insertAfter) {
            $(renderedMessage).insertAfter(chatElement.find(`.mes[mesid="${insertAfter}"]`));
        } else {
            $(renderedMessage).insertBefore(chatElement.find(`.mes[mesid="${insertBefore}"]`));
        }
    }

    const newMessageId = typeof forceId === 'number' ? forceId : chat.length - 1;
    const newMessage = $(`#chat [mesid="${newMessageId}"]`);
    const isSmallSys = mes?.extra?.isSmallSys;

    if (isSmallSys === true) {
        newMessage.addClass('smallSysMes');
    }
    if (Array.isArray(mes?.extra?.tool_invocations)) {
        newMessage.addClass('toolCall');
    }

    const mesIdToFind = type === 'swipe' ? params.mesId - 1 : params.mesId;
    const itemizedPrompts = getItemizedPromptsImpl();
    if (params.isUser === false && Array.isArray(itemizedPrompts) && itemizedPrompts.length > 0) {
        const itemizedPrompt = itemizedPrompts.find(x => Number(x.mesId) === Number(mesIdToFind));
        if (itemizedPrompt) {
            newMessage.find('.mes_prompt').show();
        }
    }

    newMessage.find('.avatar img').on('error', function () {
        $(this).hide();
        $(this).parent().html('<div class="missing-avatar fa-solid fa-user-slash"></div>');
    });

    if (type === 'swipe') {
        const swipeMessage = chatElement.find(`[mesid="${chat.length - 1}"]`);
        swipeMessage.attr('swipeid', params.swipeId);
        swipeMessage.find('.mes_text').html(messageText).attr('title', title);
        swipeMessage.find('.timestamp').text(timestamp).attr('title', `${params.extra.api} - ${params.extra.model}`);
        updateReasoningUIImpl(swipeMessage);
        appendMediaToMessage(mes, swipeMessage);
        if (shouldShowTimestampModelIconImpl() && params.extra?.api) {
            insertSVGIcon(swipeMessage, params.extra);
        }

        if (mes.swipe_id == mes.swipes.length - 1) {
            swipeMessage.find('.mes_timer').text(params.timerValue).attr('title', params.timerTitle);
            swipeMessage.find('.tokenCounterDisplay').text(`${params.tokenCount}t`);
        } else {
            swipeMessage.find('.mes_timer').empty();
            swipeMessage.find('.tokenCounterDisplay').empty();
        }
    } else {
        const messageId = forceId ?? chat.length - 1;
        chatElement.find(`[mesid="${messageId}"] .mes_text`).append(messageText);
        appendMediaToMessage(mes, newMessage);
        if (showSwipes) {
            hideSwipeButtons();
        }
    }

    addCopyToCodeBlocksImpl(newMessage);

    if (!params.isUser && newMessageId !== 0 && newMessageId !== chat.length - 1) {
        const swipesNum = chat[newMessageId].swipes?.length;
        const swipeId = chat[newMessageId].swipe_id + 1;
        newMessage.find('.swipes-counter').text(formatSwipeCounter(swipeId, swipesNum));
    }

    if (showSwipes) {
        $('#chat .mes').last().addClass('last_mes');
        $('#chat .mes').eq(-2).removeClass('last_mes');
        hideSwipeButtons();
        showSwipeButtons();
    }

    if (!insertAfter && !insertBefore && scroll) {
        scrollChatToBottomImpl();
    }

    applyCharacterTagsToMessageDivsImpl({ mesIds: newMessageId });
}

async function printMessagesInternal() {
    if (!getChatTruncationImpl) throwUnbound('getChatTruncation');
    if (!scrollChatToBottomImpl) throwUnbound('scrollChatToBottom');
    if (!applyStylePinsImpl) throwUnbound('applyStylePins');

    let startIndex = 0;
    const count = getChatTruncationImpl() || Number.MAX_SAFE_INTEGER;

    if (chat.length > count) {
        startIndex = chat.length - count;
        $('#chat').append('<div id="show_more_messages">Show more messages</div>');
    }

    for (let i = startIndex; i < chat.length; i++) {
        addOneMessageInternal(chat[i], { scroll: false, forceId: i, showSwipes: false });
    }

    const images = document.querySelectorAll('#chat .mes img');
    let imagesLoaded = 0;

    for (const image of images) {
        if (image instanceof HTMLImageElement) {
            if (image.complete) {
                incrementAndCheck();
            } else {
                image.addEventListener('load', incrementAndCheck);
            }
        }
    }

    $('#chat .mes').removeClass('last_mes');
    $('#chat .mes').last().addClass('last_mes');
    hideSwipeButtons();
    showSwipeButtons();
    scrollChatToBottomImpl();
    applyStylePinsImpl();

    function incrementAndCheck() {
        imagesLoaded++;
        if (imagesLoaded === images.length) {
            scrollChatToBottomImpl();
        }
    }
}

export function getFirstMessage(characterName) {
    const firstMes = characters[this_chid].first_mes || '';
    const alternateGreetings = characters[this_chid]?.data?.alternate_greetings;

    const message = {
        name: characterName,
        is_user: false,
        is_system: false,
        send_date: getMessageTimeStamp(),
        mes: getRegexedString(firstMes, regex_placement.AI_OUTPUT),
        extra: {},
    };

    if (Array.isArray(alternateGreetings) && alternateGreetings.length > 0) {
        const swipes = [message.mes, ...(alternateGreetings.map(greeting => getRegexedString(greeting, regex_placement.AI_OUTPUT)))];

        if (!message.mes) {
            swipes.shift();
            message.mes = swipes[0];
        }

        message.swipe_id = 0;
        message.swipes = swipes;
        message.swipe_info = [];
    }

    return message;
}

export async function getChatResult() {
    if (!selectSelectedCharacterImpl) throwUnbound('select_selected_character');

    const characterName = characters[this_chid].name;
    let freshChat = false;

    if (chat.length === 0) {
        const message = getFirstMessage(characterName);
        if (message.mes) {
            chat.push(message);
            freshChat = true;
        }

        // Make sure the chat appears on the server
        await saveChatConditional();
    }

    await loadItemizedPrompts(getCurrentChatId());
    await printMessages();
    await selectSelectedCharacterImpl(this_chid);

    await eventSource.emit(event_types.CHAT_CHANGED, getCurrentChatId());
    if (freshChat) await eventSource.emit(event_types.CHAT_CREATED);

    if (chat.length === 1) {
        const chat_id = chat.length - 1;
        await eventSource.emit(event_types.MESSAGE_RECEIVED, chat_id, 'first_message');
        await eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, chat_id, 'first_message');
    }

    return { characterName, freshChat };
}

export async function getChat() {
    if (!unshallowCharacterImpl) throwUnbound('unshallowCharacter');

    try {
        await unshallowCharacterImpl(this_chid);

        const response = await $.ajax({
            type: 'POST',
            url: '/api/chats/get',
            data: JSON.stringify({
                ch_name: characters[this_chid].name,
                file_name: characters[this_chid].chat,
                avatar_url: characters[this_chid].avatar,
            }),
            dataType: 'json',
            contentType: 'application/json',
        });

        let chatCreateDate = '';
        if (response[0] !== undefined) {
            chat.splice(0, chat.length, ...response);
            chatCreateDate = chat[0].create_date;
            syncChatMetadata(chat[0].chat_metadata ?? {});
            chat.shift();
        } else {
            chatCreateDate = humanizedDateTime();
        }

        if (!chat_metadata.integrity) {
            chat_metadata.integrity = uuidv4();
        }

        const result = await getChatResult();
        eventSource.emit('chatLoaded', { detail: { id: this_chid, character: characters[this_chid] } });

        setTimeout(() => {
            if ($(document.activeElement).is('input:visible, textarea:visible')) {
                return;
            }

            $('#send_textarea').trigger('click').trigger('focus');
        }, 200);

        return {
            ...result,
            chatCreateDate,
            chatMetadata: chat_metadata,
        };
    } catch (error) {
        const result = await getChatResult();
        console.log(error);
        return {
            ...result,
            chatCreateDate: humanizedDateTime(),
            chatMetadata: chat_metadata,
        };
    }
}

export async function openCharacterChat(file_name) {
    if (!clearChatImpl) throwUnbound('clearChat');
    if (!createOrEditCharacterImpl) throwUnbound('createOrEditCharacter');

    await waitUntilCondition(() => !isChatSaving, debounce_timeout.extended, 10);
    await clearChatImpl();
    characters[this_chid].chat = file_name;
    chat.length = 0;
    syncChatMetadata({});

    const result = await getChat();
    $('#selected_chat_pole').val(file_name);
    await createOrEditCharacterImpl(new CustomEvent('newChat'));

    return result;
}

export async function reloadCurrentChat() {
    if (!preserveNeutralChatImpl) throwUnbound('preserveNeutralChat');
    if (!getSelectedGroupImpl) throwUnbound('getSelectedGroup');
    if (!getGroupChatImpl) throwUnbound('getGroupChat');
    if (!resetChatStateImpl) throwUnbound('resetChatState');
    if (!restoreNeutralChatImpl) throwUnbound('restoreNeutralChat');

    preserveNeutralChatImpl();
    await clearChat();
    chat.length = 0;

    const selectedGroup = getSelectedGroupImpl();
    let result = null;
    if (selectedGroup) {
        await getGroupChatImpl(selectedGroup, true);
    }
    else if (this_chid !== undefined) {
        result = await getChat();
    }
    else {
        result = resetChatStateImpl();
        restoreNeutralChatImpl();
        await getCharacters();
        await printMessages();
        await eventSource.emit(event_types.CHAT_CHANGED, getCurrentChatId());
    }

    hideSwipeButtons();
    showSwipeButtons();
    return result;
}

export function showMoreMessages(...args) {
    if (!showMoreMessagesImpl) throwUnbound('showMoreMessages');
    return showMoreMessagesImpl(...args);
}

export function showSwipeButtons(...args) {
    if (!showSwipeButtonsImpl) throwUnbound('showSwipeButtons');
    return showSwipeButtonsImpl(...args);
}

export function swipe_left(...args) {
    if (!swipeLeftImpl) throwUnbound('swipe_left');
    return swipeLeftImpl(...args);
}

export function swipe_right(...args) {
    if (!swipeRightImpl) throwUnbound('swipe_right');
    return swipeRightImpl(...args);
}

export function updateChatMetadata(newValues, reset) {
    const nextMetadata = reset ? { ...newValues } : { ...chat_metadata, ...newValues };
    syncChatMetadata(nextMetadata);
    return nextMetadata;
}
