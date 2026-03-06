import { getMessageTimeStamp } from './RossAscends-mods.js';
import { isChatSaving } from './app-state-core.js';
import { characters } from './character-core.js';
import { getCurrentChatId, chat_metadata, syncChatMetadata, this_chid } from './chat-core.js';
import { debounce_timeout } from './constants.js';
import { event_types, eventSource } from './events.js';
import { getRegexedString, regex_placement } from './extensions/regex/engine.js';
import { waitUntilCondition, uuidv4 } from './utils.js';
import { humanizedDateTime } from './RossAscends-mods.js';

let activateSendButtonsImpl = null;
let addOneMessageImpl = null;
let appendMediaToMessageImpl = null;
let clearChatImpl = null;
let createOrEditCharacterImpl = null;
let deactivateSendButtonsImpl = null;
let deleteSwipeImpl = null;
let deleteLastMessageImpl = null;
let displayPastChatsImpl = null;
let extractMessageBiasImpl = null;
let formatCharacterAvatarImpl = null;
let getCharacterAvatarImpl = null;
let getCharacterCardFieldsImpl = null;
let getCharactersImpl = null;
let getCurrentChatDetailsImpl = null;
let getMaxContextSizeImpl = null;
let hideSwipeButtonsImpl = null;
let processDroppedFilesImpl = null;
let printMessagesImpl = null;
let reloadCurrentChatImpl = null;
let renameChatImpl = null;
let loadItemizedPromptsImpl = null;
let saveChatImpl = null;
let saveChatConditionalImpl = null;
let saveItemizedPromptsImpl = null;
let saveReplyImpl = null;
let sendMessageAsUserImpl = null;
let selectSelectedCharacterImpl = null;
let showSwipeButtonsImpl = null;
let showMoreMessagesImpl = null;
let swipeLeftImpl = null;
let swipeRightImpl = null;
let unshallowCharacterImpl = null;

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
 *   addOneMessage: (...args: any[]) => any,
 *   appendMediaToMessage: (...args: any[]) => any,
 *   clearChat: (...args: any[]) => Promise<any>,
 *   createOrEditCharacter: (...args: any[]) => Promise<any>,
 *   deactivateSendButtons: (...args: any[]) => any,
 *   deleteSwipe: (...args: any[]) => Promise<any>,
 *   deleteLastMessage: (...args: any[]) => Promise<any>,
 *   displayPastChats: (...args: any[]) => Promise<any>,
 *   extractMessageBias: (...args: any[]) => any,
 *   formatCharacterAvatar: (...args: any[]) => any,
 *   getCharacterAvatar: (...args: any[]) => any,
 *   getCharacterCardFields: (...args: any[]) => any,
 *   getCharacters: (...args: any[]) => Promise<any>,
 *   getCurrentChatDetails: (...args: any[]) => any,
 *   getMaxContextSize: (...args: any[]) => number,
 *   hideSwipeButtons: (...args: any[]) => any,
 *   processDroppedFiles: (...args: any[]) => Promise<any>,
 *   printMessages: (...args: any[]) => Promise<any>,
 *   reloadCurrentChat: (...args: any[]) => Promise<any>,
  *   renameChat: (...args: any[]) => Promise<any>,
 *   loadItemizedPrompts: (...args: any[]) => Promise<any>,
 *   saveChat: (...args: any[]) => Promise<any>,
 *   saveChatConditional: (...args: any[]) => Promise<any>,
 *   saveItemizedPrompts: (...args: any[]) => Promise<any>,
 *   saveReply: (...args: any[]) => Promise<any>,
 *   sendMessageAsUser: (...args: any[]) => Promise<any>,
 *   select_selected_character: (...args: any[]) => Promise<any>,
 *   showSwipeButtons: (...args: any[]) => any,
 *   showMoreMessages: (...args: any[]) => Promise<any>,
 *   swipe_left: (...args: any[]) => Promise<any>,
 *   swipe_right: (...args: any[]) => Promise<any>,
 *   unshallowCharacter: (...args: any[]) => Promise<any>,
 * }} impl Implementations to bind
 */
export function bindChatOperationsCore(impl) {
    activateSendButtonsImpl = impl?.activateSendButtons ?? null;
    addOneMessageImpl = impl?.addOneMessage ?? null;
    appendMediaToMessageImpl = impl?.appendMediaToMessage ?? null;
    clearChatImpl = impl?.clearChat ?? null;
    createOrEditCharacterImpl = impl?.createOrEditCharacter ?? null;
    deactivateSendButtonsImpl = impl?.deactivateSendButtons ?? null;
    deleteSwipeImpl = impl?.deleteSwipe ?? null;
    deleteLastMessageImpl = impl?.deleteLastMessage ?? null;
    displayPastChatsImpl = impl?.displayPastChats ?? null;
    extractMessageBiasImpl = impl?.extractMessageBias ?? null;
    formatCharacterAvatarImpl = impl?.formatCharacterAvatar ?? null;
    getCharacterAvatarImpl = impl?.getCharacterAvatar ?? null;
    getCharacterCardFieldsImpl = impl?.getCharacterCardFields ?? null;
    getCharactersImpl = impl?.getCharacters ?? null;
    getCurrentChatDetailsImpl = impl?.getCurrentChatDetails ?? null;
    getMaxContextSizeImpl = impl?.getMaxContextSize ?? null;
    hideSwipeButtonsImpl = impl?.hideSwipeButtons ?? null;
    processDroppedFilesImpl = impl?.processDroppedFiles ?? null;
    printMessagesImpl = impl?.printMessages ?? null;
    reloadCurrentChatImpl = impl?.reloadCurrentChat ?? null;
    renameChatImpl = impl?.renameChat ?? null;
    loadItemizedPromptsImpl = impl?.loadItemizedPrompts ?? null;
    saveChatImpl = impl?.saveChat ?? null;
    saveChatConditionalImpl = impl?.saveChatConditional ?? null;
    saveItemizedPromptsImpl = impl?.saveItemizedPrompts ?? null;
    saveReplyImpl = impl?.saveReply ?? null;
    sendMessageAsUserImpl = impl?.sendMessageAsUser ?? null;
    selectSelectedCharacterImpl = impl?.select_selected_character ?? null;
    showSwipeButtonsImpl = impl?.showSwipeButtons ?? null;
    showMoreMessagesImpl = impl?.showMoreMessages ?? null;
    swipeLeftImpl = impl?.swipe_left ?? null;
    swipeRightImpl = impl?.swipe_right ?? null;
    unshallowCharacterImpl = impl?.unshallowCharacter ?? null;
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
    if (!addOneMessageImpl) throwUnbound('addOneMessage');
    return addOneMessageImpl(...args);
}

export function appendMediaToMessage(...args) {
    if (!appendMediaToMessageImpl) throwUnbound('appendMediaToMessage');
    return appendMediaToMessageImpl(...args);
}

export function clearChat(...args) {
    if (!clearChatImpl) throwUnbound('clearChat');
    return clearChatImpl(...args);
}

export function deactivateSendButtons(...args) {
    if (!deactivateSendButtonsImpl) throwUnbound('deactivateSendButtons');
    return deactivateSendButtonsImpl(...args);
}

export function deleteSwipe(...args) {
    if (!deleteSwipeImpl) throwUnbound('deleteSwipe');
    return deleteSwipeImpl(...args);
}

export function deleteLastMessage(...args) {
    if (!deleteLastMessageImpl) throwUnbound('deleteLastMessage');
    return deleteLastMessageImpl(...args);
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
    if (!printMessagesImpl) throwUnbound('printMessages');
    return printMessagesImpl(...args);
}

export function processDroppedFiles(...args) {
    if (!processDroppedFilesImpl) throwUnbound('processDroppedFiles');
    return processDroppedFilesImpl(...args);
}

export function reloadCurrentChat(...args) {
    if (!reloadCurrentChatImpl) throwUnbound('reloadCurrentChat');
    return reloadCurrentChatImpl(...args);
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

function getFirstMessage(characterName) {
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
