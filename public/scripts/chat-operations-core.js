import { SVGInject, moment } from '../lib.js';
import { getMessageTimeStamp } from './RossAscends-mods.js';
import { isChatSaving } from './app-state-core.js';
import { characters } from './character-core.js';
import { default_avatar, getCurrentChatId, chat_metadata, name1, name2, syncChatMetadata, this_chid, user_avatar } from './chat-core.js';
import { debounce_timeout } from './constants.js';
import { event_types, eventSource } from './events.js';
import { getRegexedString, regex_placement } from './extensions/regex/engine.js';
import { editGroup, group_generation_id, groups, importGroupChat, selected_group } from './group-chats.js';
import { getRequestHeaders, getThumbnailUrl } from './network-core.js';
import { POPUP_TYPE, callGenericPopup } from './popup.js';
import { power_user } from './power-user.js';
import { parseReasoningInSwipes } from './reasoning.js';
import { statMesProcess } from './stats.js';
import { getTokenCountAsync, saveTokenCache } from './tokenizers.js';
import { debounce, delay, download, humanFileSize, isDataURL, isElementInViewport, saveBase64AsFile, sortMoments, timestampToMoment, waitUntilCondition, uuidv4 } from './utils.js';
import { humanizedDateTime } from './RossAscends-mods.js';
import { renderTemplateAsync } from './templates.js';

let activateSendButtonsImpl = null;
let appendMediaToMessageImpl = null;
let cancelDebouncedMetadataSaveImpl = null;
let cancelDeleteModeImpl = null;
let closeMessageEditorImpl = null;
let createOrEditCharacterImpl = null;
let deactivateSendButtonsImpl = null;
let deleteSwipeImpl = null;
let extractMessageBiasImpl = null;
let formatCharacterAvatarImpl = null;
let getChatTruncationImpl = null;
let getChatCreateDateImpl = null;
let getCharacterAvatarImpl = null;
let getCharacterCardFieldsImpl = null;
let getCharactersImpl = null;
let getGeneratingApiImpl = null;
let getGeneratingModelImpl = null;
let getGenerationStartedImpl = null;
let getNeutralCharacterNameImpl = null;
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
let saveCharacterDebouncedImpl = null;
let saveItemizedPromptsImpl = null;
let setChatMetadataImpl = null;
let setIsChatSavingImpl = null;
let selectSelectedCharacterImpl = null;
let showSwipeButtonsImpl = null;
let shouldShowTimestampModelIconImpl = null;
let swipeLeftImpl = null;
let swipeRightImpl = null;
let unshallowCharacterImpl = null;
let updateRemoteChatNameImpl = null;
let updateBookmarkDisplayImpl = null;
let getItemizedPromptsImpl = null;
let messageFormattingImpl = null;
let populateFileAttachmentImpl = null;
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
let chatSaveTimeout = null;

function throwUnbound(name) {
    throw new Error(`[chat-operations-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy chat operation implementations to standalone wrappers.
 * @param {{
 *   activateSendButtons: (...args: any[]) => any,
 *   appendMediaToMessage: (...args: any[]) => any,
 *   cancelDebouncedMetadataSave: (...args: any[]) => any,
 *   cancelDeleteMode: (...args: any[]) => any,
 *   closeMessageEditor: (...args: any[]) => any,
 *   createOrEditCharacter: (...args: any[]) => Promise<any>,
  *   deactivateSendButtons: (...args: any[]) => any,
  *   deleteSwipe: (...args: any[]) => Promise<any>,
 *   extractMessageBias: (...args: any[]) => any,
 *   formatCharacterAvatar: (...args: any[]) => any,
 *   getChatTruncation: () => number,
 *   getChatCreateDate: () => string,
 *   getCharacterAvatar: (...args: any[]) => any,
  *   getCharacterCardFields: (...args: any[]) => any,
  *   getCharacters: (...args: any[]) => Promise<any>,
 *   getGeneratingApi: () => string,
 *   getGeneratingModel: (...args: any[]) => string,
 *   getGenerationStarted: () => Date,
 *   getItemizedPrompts: () => any[],
 *   getNeutralCharacterName: () => string,
 *   getSelectedGroup: () => string|null|undefined,
  *   getGroupChat: (...args: any[]) => Promise<any>,
  *   getMaxContextSize: (...args: any[]) => number,
   *   hideSwipeButtons: (...args: any[]) => any,
  *   isDeleteMode: () => boolean,
 *   messageFormatting: (...args: any[]) => string,
 *   populateFileAttachment: (...args: any[]) => Promise<any>,
 *   preserveNeutralChat: (...args: any[]) => any,
 *   processDroppedFiles: (...args: any[]) => Promise<any>,
  *   renameChat: (...args: any[]) => Promise<any>,
  *   resetChatState: (...args: any[]) => any,
  *   resetExtensionPrompts: () => any,
 *   resetItemizedPrompts: () => any,
 *   restoreNeutralChat: (...args: any[]) => any,
 *   scrollChatToBottom: () => any,
  *   loadItemizedPrompts: (...args: any[]) => Promise<any>,
  *   saveCharacterDebounced: (...args: any[]) => any,
  *   saveItemizedPrompts: (...args: any[]) => Promise<any>,
  *   setChatMetadata: (value: any) => any,
  *   setIsChatSaving: (value: boolean) => any,
  *   select_selected_character: (...args: any[]) => Promise<any>,
  *   showSwipeButtons: (...args: any[]) => any,
 *   shouldShowTimestampModelIcon: () => boolean,
  *   swipe_left: (...args: any[]) => Promise<any>,
  *   swipe_right: (...args: any[]) => Promise<any>,
  *   unshallowCharacter: (...args: any[]) => Promise<any>,
 *   updateRemoteChatName: (...args: any[]) => Promise<any>,
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
    cancelDebouncedMetadataSaveImpl = impl?.cancelDebouncedMetadataSave ?? null;
    cancelDeleteModeImpl = impl?.cancelDeleteMode ?? null;
    closeMessageEditorImpl = impl?.closeMessageEditor ?? null;
    createOrEditCharacterImpl = impl?.createOrEditCharacter ?? null;
    deactivateSendButtonsImpl = impl?.deactivateSendButtons ?? null;
    deleteSwipeImpl = impl?.deleteSwipe ?? null;
    extractMessageBiasImpl = impl?.extractMessageBias ?? null;
    formatCharacterAvatarImpl = impl?.formatCharacterAvatar ?? null;
    getChatTruncationImpl = impl?.getChatTruncation ?? null;
    getChatCreateDateImpl = impl?.getChatCreateDate ?? null;
    getCharacterAvatarImpl = impl?.getCharacterAvatar ?? null;
    getCharacterCardFieldsImpl = impl?.getCharacterCardFields ?? null;
    getCharactersImpl = impl?.getCharacters ?? null;
    getGeneratingApiImpl = impl?.getGeneratingApi ?? null;
    getGeneratingModelImpl = impl?.getGeneratingModel ?? null;
    getGenerationStartedImpl = impl?.getGenerationStarted ?? null;
    getItemizedPromptsImpl = impl?.getItemizedPrompts ?? null;
    getNeutralCharacterNameImpl = impl?.getNeutralCharacterName ?? null;
    getSelectedGroupImpl = impl?.getSelectedGroup ?? null;
    getGroupChatImpl = impl?.getGroupChat ?? null;
    getMaxContextSizeImpl = impl?.getMaxContextSize ?? null;
    hideSwipeButtonsImpl = impl?.hideSwipeButtons ?? null;
    isDeleteModeImpl = impl?.isDeleteMode ?? null;
    messageFormattingImpl = impl?.messageFormatting ?? null;
    populateFileAttachmentImpl = impl?.populateFileAttachment ?? null;
    preserveNeutralChatImpl = impl?.preserveNeutralChat ?? null;
    processDroppedFilesImpl = impl?.processDroppedFiles ?? null;
    renameChatImpl = impl?.renameChat ?? null;
    resetChatStateImpl = impl?.resetChatState ?? null;
    resetExtensionPromptsImpl = impl?.resetExtensionPrompts ?? null;
    resetItemizedPromptsImpl = impl?.resetItemizedPrompts ?? null;
    loadItemizedPromptsImpl = impl?.loadItemizedPrompts ?? null;
    restoreNeutralChatImpl = impl?.restoreNeutralChat ?? null;
    saveCharacterDebouncedImpl = impl?.saveCharacterDebounced ?? null;
    saveItemizedPromptsImpl = impl?.saveItemizedPrompts ?? null;
    scrollChatToBottomImpl = impl?.scrollChatToBottom ?? null;
    setChatMetadataImpl = impl?.setChatMetadata ?? null;
    setIsChatSavingImpl = impl?.setIsChatSaving ?? null;
    selectSelectedCharacterImpl = impl?.select_selected_character ?? null;
    showSwipeButtonsImpl = impl?.showSwipeButtons ?? null;
    shouldShowTimestampModelIconImpl = impl?.shouldShowTimestampModelIcon ?? null;
    swipeLeftImpl = impl?.swipe_left ?? null;
    swipeRightImpl = impl?.swipe_right ?? null;
    unshallowCharacterImpl = impl?.unshallowCharacter ?? null;
    updateRemoteChatNameImpl = impl?.updateRemoteChatName ?? null;
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

export function initChatManagementBindings() {
    $(document).on('click', '.renameChatButton', async function (e) {
        e.stopPropagation();
        const oldFileNameFull = $(this).closest('.select_chat_block_wrapper').find('.select_chat_block_filename').text();
        const oldFileName = oldFileNameFull.replace('.jsonl', '');

        const popupText = await renderTemplateAsync('chatRename');
        const newName = await callGenericPopup(popupText, POPUP_TYPE.INPUT, oldFileName);

        if (!newName || typeof newName !== 'string' || newName == oldFileName) {
            console.log('no new name found, aborting');
            return;
        }

        await renameChat(oldFileName, newName);

        await delay(250);
        $('#option_select_chat').trigger('click');
        $('#options').hide();
    });

    $(document).on('click', '.exportChatButton, .exportRawChatButton', async function (e) {
        e.stopPropagation();
        const format = $(this).data('format') || 'txt';
        await saveChatConditional();
        const filenamefull = $(this).closest('.select_chat_block_wrapper').find('.select_chat_block_filename').text();
        console.log(`exporting ${filenamefull} in ${format} format`);

        const filename = filenamefull.replace('.jsonl', '');
        const body = {
            is_group: !!selected_group,
            avatar_url: characters[this_chid]?.avatar,
            file: `${filename}.jsonl`,
            exportfilename: `${filename}.${format}`,
            format: format,
        };
        console.log(body);
        try {
            const response = await fetch('/api/chats/export', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: getRequestHeaders(),
            });
            const data = await response.json();
            if (!response.ok) {
                console.log(data.message);
                await delay(250);
                toastr.error(`Error: ${data.message}`);
                return;
            }

            const mimeType = format == 'txt' ? 'text/plain' : 'application/octet-stream';
            console.log(data);
            await delay(250);
            toastr.success(data.message);
            download(data.result, body.exportfilename, mimeType);
        } catch (error) {
            console.log(`An error has occurred: ${error.message}`);
            await delay(250);
            toastr.error(`Error: ${error.message}`);
        }
    });
}

export function initChatImportBindings() {
    $('#chat_import_button').on('click', function () {
        $('#chat_import_file').trigger('click');
    });

    $('#chat_import_file').on('change', async function (e) {
        const targetElement = /** @type {HTMLInputElement} */ (e.target);
        if (!(targetElement instanceof HTMLInputElement)) {
            return;
        }
        const file = targetElement.files[0];

        if (!file) {
            return;
        }

        const ext = file.name.match(/\.(\w+)$/);
        if (!ext || (ext[1].toLowerCase() != 'json' && ext[1].toLowerCase() != 'jsonl')) {
            return;
        }

        if (selected_group && file.name.endsWith('.json')) {
            toastr.warning('Only SillyTavern\'s own format is supported for group chat imports. Sorry!');
            return;
        }

        const format = ext[1].toLowerCase();
        $('#chat_import_file_type').val(format);

        const formData = new FormData(/** @type {HTMLFormElement} */($('#form_import_chat').get(0)));
        formData.append('user_name', name1);
        $('#select_chat_div').html('');

        if (selected_group) {
            await importGroupChat(formData, e.originalEvent.target);
        } else {
            await importCharacterChat(formData, e.originalEvent.target);
        }
    });
}

export function addOneMessage(...args) {
    return addOneMessageInternal(...args);
}

export function appendMediaToMessage(...args) {
    if (!appendMediaToMessageImpl) throwUnbound('appendMediaToMessage');
    return appendMediaToMessageImpl(...args);
}

export function cancelDebouncedChatSave() {
    if (chatSaveTimeout) {
        console.debug('Debounced chat save cancelled');
        clearTimeout(chatSaveTimeout);
        chatSaveTimeout = null;
    }
}

export async function clearChat() {
    if (!cancelDebouncedMetadataSaveImpl) throwUnbound('cancelDebouncedMetadataSave');
    if (!closeMessageEditorImpl) throwUnbound('closeMessageEditor');
    if (!resetExtensionPromptsImpl) throwUnbound('resetExtensionPrompts');
    if (!isDeleteModeImpl) throwUnbound('isDeleteMode');
    if (!cancelDeleteModeImpl) throwUnbound('cancelDeleteMode');
    if (!resetItemizedPromptsImpl) throwUnbound('resetItemizedPrompts');

    cancelDebouncedChatSave();
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

export async function delChat(chatfile) {
    if (!setChatMetadataImpl) throwUnbound('setChatMetadata');

    const response = await fetch('/api/chats/delete', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({
            chatfile,
            avatar_url: characters[this_chid].avatar,
        }),
    });

    if (response.ok === true) {
        const name = chatfile.replace('.jsonl', '');
        if (name === characters[this_chid].chat) {
            setChatMetadataImpl({});
            await replaceCurrentChat();
        }
        await eventSource.emit(event_types.CHAT_DELETED, name);
    }
}

export async function deleteLastMessage() {
    chat.length = chat.length - 1;
    document.querySelector('#chat .mes:last-child')?.remove();
    await eventSource.emit(event_types.MESSAGE_DELETED, chat.length);
}

export async function deleteCharacterChatByName(characterId, fileName) {
    if (!unshallowCharacterImpl) throwUnbound('unshallowCharacter');
    if (!updateRemoteChatNameImpl) throwUnbound('updateRemoteChatName');

    await unshallowCharacterImpl(characterId);

    const character = characters[characterId];
    if (!character) {
        console.warn(`Character with ID ${characterId} not found.`);
        return;
    }

    const response = await fetch('/api/chats/delete', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({
            chatfile: `${fileName}.jsonl`,
            avatar_url: character.avatar,
        }),
    });

    if (!response.ok) {
        console.error('Failed to delete chat for character.');
        return;
    }

    if (fileName === character.chat) {
        const chatsResponse = await fetch('/api/characters/chats', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({ avatar_url: character.avatar }),
        });
        const chats = Object.values(await chatsResponse.json());
        chats.sort((a, b) => sortMoments(timestampToMoment(a.last_mes), timestampToMoment(b.last_mes)));
        const newChatName = chats.length && typeof chats[0] === 'object' ? chats[0].file_name.replace('.jsonl', '') : `${character.name} - ${humanizedDateTime()}`;
        await updateRemoteChatNameImpl(characterId, newChatName);
    }

    await eventSource.emit(event_types.CHAT_DELETED, fileName);
}

export async function displayPastChats() {
    $('#select_chat_div').empty();
    $('#select_chat_search').val('').off('input');

    const chatDetails = getCurrentChatDetails();
    const currentChat = chatDetails.sessionName;
    const avatarImg = chatDetails.avatarImgURL;

    await displayChats('', currentChat, avatarImg, selected_group);

    const debouncedDisplay = debounce((searchQuery) => {
        displayChats(searchQuery, currentChat, avatarImg, selected_group);
    });

    $('#select_chat_search').on('input', function () {
        const searchQuery = $(this).val();
        debouncedDisplay(searchQuery);
    });

    setTimeout(function () {
        const textSearchElement = $('#select_chat_search');
        textSearchElement.trigger('click').trigger('focus').trigger('select');
    }, 200);
}

/**
 * Imports a chat session for the active character and refreshes the chat list.
 * @param {FormData} formData Form data to send to the server.
 * @param {EventTarget} eventTarget Event target whose value should be cleared after import.
 */
export async function importCharacterChat(formData, eventTarget) {
    const fetchResult = await fetch('/api/chats/import', {
        method: 'POST',
        body: formData,
        headers: getRequestHeaders({ omitContentType: true }),
        cache: 'no-cache',
    });

    if (fetchResult.ok) {
        const data = await fetchResult.json();
        if (data.res) {
            await displayPastChats();
        }
    }

    if (eventTarget instanceof HTMLInputElement) {
        eventTarget.value = '';
    }
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

export function getCurrentChatDetails() {
    if (!characters[this_chid] && !selected_group) {
        return { sessionName: '', group: null, characterName: '', avatarImgURL: '' };
    }

    const group = selected_group ? groups.find(x => x.id === selected_group) : null;
    const currentChat = selected_group ? group?.chat_id : characters[this_chid]?.chat;
    const displayName = selected_group ? group?.name : characters[this_chid]?.name;
    const avatarImg = selected_group ? group?.avatar_url : getThumbnailUrl('avatar', characters[this_chid]?.avatar);
    return { sessionName: currentChat, group, characterName: displayName, avatarImgURL: avatarImg };
}

export async function getPastCharacterChats(characterId = null) {
    characterId = characterId ?? parseInt(this_chid);
    if (!characters[characterId]) {
        return [];
    }

    const response = await fetch('/api/characters/chats', {
        method: 'POST',
        body: JSON.stringify({ avatar_url: characters[characterId].avatar }),
        headers: getRequestHeaders(),
    });

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    if (typeof data === 'object' && data.error === true) {
        return [];
    }

    const chats = Object.values(data);
    return chats.sort((a, b) => a.file_name.localeCompare(b.file_name)).reverse();
}

async function displayChats(searchQuery, currentChat, avatarImg, groupId) {
    try {
        const trimExtension = (fileName) => String(fileName).replace('.jsonl', '');

        const response = await fetch('/api/chats/search', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                query: searchQuery,
                avatar_url: groupId ? null : characters[this_chid].avatar,
                group_id: groupId || null,
            }),
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const filteredData = await response.json();
        $('#select_chat_div').empty();

        filteredData.sort((a, b) => sortMoments(timestampToMoment(a.last_mes), timestampToMoment(b.last_mes)));

        for (const chat of filteredData) {
            const isSelected = trimExtension(currentChat) === trimExtension(chat.file_name);
            const template = $('#past_chat_template .select_chat_block_wrapper').clone();
            template.find('.select_chat_block').attr('file_name', chat.file_name);
            template.find('.avatar img').attr('src', avatarImg);
            template.find('.select_chat_block_filename').text(chat.file_name);
            template.find('.chat_file_size').text(`(${chat.file_size},`);
            template.find('.chat_messages_num').text(`${chat.message_count} 💬)`);
            template.find('.select_chat_block_mes').text(chat.preview_message);
            template.find('.PastChat_cross').attr('file_name', chat.file_name);
            template.find('.chat_messages_date').text(timestampToMoment(chat.last_mes).format('lll'));

            if (isSelected) {
                template.find('.select_chat_block').attr('highlight', String(true));
            }

            $('#select_chat_div').append(template);
        }
    } catch (error) {
        console.error('Error loading chats:', error);
        toastr.error('Could not load chat data. Try reloading the page.');
    }
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
    return saveChatInternal(...args);
}

export function saveChatConditional(...args) {
    return saveChatConditionalInternal(...args);
}

export function saveItemizedPrompts(...args) {
    if (!saveItemizedPromptsImpl) throwUnbound('saveItemizedPrompts');
    return saveItemizedPromptsImpl(...args);
}

export function sendMessageAsUser(...args) {
    return sendMessageAsUserInternal(...args);
}

async function sendMessageAsUserInternal(messageText, messageBias, insertAt = null, compact = false, name = name1, avatar = user_avatar) {
    if (!populateFileAttachmentImpl) throwUnbound('populateFileAttachment');

    messageText = getRegexedString(messageText, regex_placement.USER_INPUT);

    const message = {
        name,
        is_user: true,
        is_system: false,
        send_date: getMessageTimeStamp(),
        mes: substituteParams(messageText),
        extra: {
            isSmallSys: compact,
        },
    };

    if (power_user.message_token_count_enabled) {
        message.extra.token_count = await getTokenCountAsync(message.mes, 0);
    }

    if (avatar in power_user.personas) {
        message.force_avatar = getThumbnailUrl('persona', avatar);
    }

    if (messageBias) {
        message.extra.bias = messageBias;
        message.mes = removeMacros(message.mes);
    }

    await populateFileAttachmentImpl(message);
    statMesProcess(message, 'user', characters, this_chid, '');

    if (typeof insertAt === 'number' && insertAt >= 0 && insertAt <= chat.length) {
        chat.splice(insertAt, 0, message);
        await saveChatConditional();
        await eventSource.emit(event_types.MESSAGE_SENT, insertAt);
        await reloadCurrentChat();
        await eventSource.emit(event_types.USER_MESSAGE_RENDERED, insertAt);
    } else {
        chat.push(message);
        const chatId = chat.length - 1;
        await eventSource.emit(event_types.MESSAGE_SENT, chatId);
        addOneMessage(message);
        await eventSource.emit(event_types.USER_MESSAGE_RENDERED, chatId);
        await saveChatConditional();
    }

    return message;
}

function saveImageToMessage(img, mes) {
    if (mes && img.image) {
        if (!mes.extra || typeof mes.extra !== 'object') {
            mes.extra = {};
        }
        mes.extra.image = img.image;
        mes.extra.title = img.title;
        mes.extra.inline_image = img.inline;
    }
}

async function processImageAttachment(message, { imageUrl }) {
    if (!imageUrl) {
        return;
    }

    let url = imageUrl;
    if (isDataURL(url)) {
        const fileName = `inline_image_${Date.now().toString()}`;
        const [, mime, base64] = /^data:(.*?);base64,(.*)$/.exec(imageUrl);
        url = await saveBase64AsFile(base64, message.name, fileName, mime.split('/')[1]);
    }

    saveImageToMessage({ image: url, inline: true }, message);
}

export async function saveReply({ type, getMessage, fromStreaming = false, title = '', swipes = [], reasoning = '', imageUrl = '' } = {}) {
    if (arguments.length > 1 && typeof arguments[0] !== 'object') {
        console.trace('saveReply called with positional arguments. Please use an object instead.');
        [type, getMessage, fromStreaming, title, swipes, reasoning, imageUrl] = arguments;
    }

    if (!getGeneratingApiImpl) throwUnbound('getGeneratingApi');
    if (!getGeneratingModelImpl) throwUnbound('getGeneratingModel');
    if (!getGenerationStartedImpl) throwUnbound('getGenerationStarted');

    if (type !== 'append' && type !== 'continue' && type !== 'appendFinal' && chat.length && (chat[chat.length - 1].swipe_id === undefined || chat[chat.length - 1].is_user)) {
        type = 'normal';
    }

    if (chat.length && (!chat[chat.length - 1].extra || typeof chat[chat.length - 1].extra !== 'object')) {
        chat[chat.length - 1].extra = {};
    }

    if (chat.length && !chat[chat.length - 1].extra.reasoning) {
        chat[chat.length - 1].extra.reasoning = '';
    }

    if (!reasoning) {
        reasoning = '';
    }

    let oldMessage = '';
    const generationFinished = new Date();
    const generationStarted = getGenerationStartedImpl();
    const generatingApi = getGeneratingApiImpl();

    if (type === 'swipe') {
        oldMessage = chat[chat.length - 1].mes;
        chat[chat.length - 1].swipes.length++;
        if (chat[chat.length - 1].swipe_id === chat[chat.length - 1].swipes.length - 1) {
            chat[chat.length - 1].title = title;
            chat[chat.length - 1].mes = getMessage;
            chat[chat.length - 1].gen_started = generationStarted;
            chat[chat.length - 1].gen_finished = generationFinished;
            chat[chat.length - 1].send_date = getMessageTimeStamp();
            chat[chat.length - 1].extra.api = generatingApi;
            chat[chat.length - 1].extra.model = getGeneratingModelImpl();
            chat[chat.length - 1].extra.reasoning = reasoning;
            chat[chat.length - 1].extra.reasoning_duration = null;
            await processImageAttachment(chat[chat.length - 1], { imageUrl });
            if (power_user.message_token_count_enabled) {
                const tokenCountText = `${reasoning || ''}${chat[chat.length - 1].mes}`;
                chat[chat.length - 1].extra.token_count = await getTokenCountAsync(tokenCountText, 0);
            }
            const chatId = chat.length - 1;
            await eventSource.emit(event_types.MESSAGE_RECEIVED, chatId, type);
            addOneMessage(chat[chatId], { type: 'swipe' });
            await eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, chatId, type);
        } else {
            chat[chat.length - 1].mes = getMessage;
        }
    } else if (type === 'append' || type === 'continue') {
        console.debug('Trying to append.');
        oldMessage = chat[chat.length - 1].mes;
        chat[chat.length - 1].title = title;
        chat[chat.length - 1].mes += getMessage;
        chat[chat.length - 1].gen_started = generationStarted;
        chat[chat.length - 1].gen_finished = generationFinished;
        chat[chat.length - 1].send_date = getMessageTimeStamp();
        chat[chat.length - 1].extra.api = generatingApi;
        chat[chat.length - 1].extra.model = getGeneratingModelImpl();
        chat[chat.length - 1].extra.reasoning = reasoning;
        chat[chat.length - 1].extra.reasoning_duration = null;
        await processImageAttachment(chat[chat.length - 1], { imageUrl });
        if (power_user.message_token_count_enabled) {
            const tokenCountText = `${reasoning || ''}${chat[chat.length - 1].mes}`;
            chat[chat.length - 1].extra.token_count = await getTokenCountAsync(tokenCountText, 0);
        }
        const chatId = chat.length - 1;
        await eventSource.emit(event_types.MESSAGE_RECEIVED, chatId, type);
        addOneMessage(chat[chatId], { type: 'swipe' });
        await eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, chatId, type);
    } else if (type === 'appendFinal') {
        oldMessage = chat[chat.length - 1].mes;
        console.debug('Trying to appendFinal.');
        chat[chat.length - 1].title = title;
        chat[chat.length - 1].mes = getMessage;
        chat[chat.length - 1].gen_started = generationStarted;
        chat[chat.length - 1].gen_finished = generationFinished;
        chat[chat.length - 1].send_date = getMessageTimeStamp();
        chat[chat.length - 1].extra.api = generatingApi;
        chat[chat.length - 1].extra.model = getGeneratingModelImpl();
        chat[chat.length - 1].extra.reasoning += reasoning;
        await processImageAttachment(chat[chat.length - 1], { imageUrl });
        if (power_user.message_token_count_enabled) {
            const tokenCountText = `${reasoning || ''}${chat[chat.length - 1].mes}`;
            chat[chat.length - 1].extra.token_count = await getTokenCountAsync(tokenCountText, 0);
        }
        const chatId = chat.length - 1;
        await eventSource.emit(event_types.MESSAGE_RECEIVED, chatId, type);
        addOneMessage(chat[chatId], { type: 'swipe' });
        await eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, chatId, type);
    } else {
        console.debug('entering chat update routine for non-swipe post');
        chat[chat.length] = {};
        chat[chat.length - 1].extra = {};
        chat[chat.length - 1].name = name2;
        chat[chat.length - 1].is_user = false;
        chat[chat.length - 1].send_date = getMessageTimeStamp();
        chat[chat.length - 1].extra.api = generatingApi;
        chat[chat.length - 1].extra.model = getGeneratingModelImpl();
        chat[chat.length - 1].extra.reasoning = reasoning;
        chat[chat.length - 1].extra.reasoning_duration = null;
        if (power_user.trim_spaces) {
            getMessage = getMessage.trim();
        }
        chat[chat.length - 1].mes = getMessage;
        chat[chat.length - 1].title = title;
        chat[chat.length - 1].gen_started = generationStarted;
        chat[chat.length - 1].gen_finished = generationFinished;

        if (power_user.message_token_count_enabled) {
            const tokenCountText = `${reasoning || ''}${chat[chat.length - 1].mes}`;
            chat[chat.length - 1].extra.token_count = await getTokenCountAsync(tokenCountText, 0);
        }

        if (selected_group) {
            console.debug('entering chat update for groups');
            let avatarImg = 'img/ai4.png';
            if (characters[this_chid].avatar !== 'none') {
                avatarImg = getThumbnailUrl('avatar', characters[this_chid].avatar);
            }
            chat[chat.length - 1].force_avatar = avatarImg;
            chat[chat.length - 1].original_avatar = characters[this_chid].avatar;
            chat[chat.length - 1].extra.gen_id = group_generation_id;
        }

        await processImageAttachment(chat[chat.length - 1], { imageUrl });
        const chatId = chat.length - 1;

        !fromStreaming && await eventSource.emit(event_types.MESSAGE_RECEIVED, chatId, type);
        addOneMessage(chat[chatId]);
        !fromStreaming && await eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, chatId, type);
    }

    const item = chat[chat.length - 1];
    if (item.swipe_info === undefined) {
        item.swipe_info = [];
    }
    if (item.swipe_id !== undefined) {
        const swipeId = item.swipe_id;
        item.swipes[swipeId] = item.mes;
        item.swipe_info[swipeId] = {
            send_date: item.send_date,
            gen_started: item.gen_started,
            gen_finished: item.gen_finished,
            extra: structuredClone(item.extra),
        };
    } else {
        item.swipe_id = 0;
        item.swipes = [];
        item.swipes[0] = item.mes;
        item.swipe_info[0] = {
            send_date: item.send_date,
            gen_started: item.gen_started,
            gen_finished: item.gen_finished,
            extra: structuredClone(item.extra),
        };
    }

    if (Array.isArray(swipes) && swipes.length > 0) {
        const swipeInfoExtra = structuredClone(item.extra ?? {});
        delete swipeInfoExtra.token_count;
        delete swipeInfoExtra.reasoning;
        delete swipeInfoExtra.reasoning_duration;
        const swipeInfo = {
            send_date: item.send_date,
            gen_started: item.gen_started,
            gen_finished: item.gen_finished,
            extra: swipeInfoExtra,
        };
        const swipeInfoArray = Array(swipes.length).fill().map(() => structuredClone(swipeInfo));
        parseReasoningInSwipes(swipes, swipeInfoArray, item.extra?.reasoning_duration);
        item.swipes.push(...swipes);
        item.swipe_info.push(...swipeInfoArray);
    }

    statMesProcess(chat[chat.length - 1], type, characters, this_chid, oldMessage);
    return { type, getMessage };
}

async function saveChatInternal({ chatName, withMetadata, mesId, force = false } = {}) {
    if (arguments.length > 0 && typeof arguments[0] !== 'object') {
        console.trace('saveChat called with positional arguments. Please use an object instead.');
        [chatName, withMetadata, mesId, force] = arguments;
    }

    if (!getChatCreateDateImpl) throwUnbound('getChatCreateDate');
    if (!getNeutralCharacterNameImpl) throwUnbound('getNeutralCharacterName');

    const metadata = { ...chat_metadata, ...(withMetadata || {}) };
    const fileName = chatName ?? characters[this_chid]?.chat;
    const neutralCharacterName = getNeutralCharacterNameImpl();

    if (!fileName && name2 === neutralCharacterName) {
        return;
    }

    if (!fileName) {
        console.warn('saveChat called without chat_name and no chat file found');
        return;
    }

    characters[this_chid].date_last_chat = Date.now();
    chat.forEach(function (item) {
        if (item.is_group) {
            toastr.error(t`Trying to save group chat with regular saveChat function. Aborting to prevent corruption.`);
            throw new Error('Group chat saved from saveChat');
        }
    });

    const trimmedChat = (mesId !== undefined && mesId >= 0 && mesId < chat.length)
        ? chat.slice(0, Number(mesId) + 1)
        : chat.slice();

    const chatToSave = [
        {
            user_name: name1,
            character_name: name2,
            create_date: getChatCreateDateImpl(),
            chat_metadata: metadata,
        },
        ...trimmedChat,
    ];

    try {
        const result = await fetch('/api/chats/save', {
            method: 'POST',
            cache: 'no-cache',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                ch_name: characters[this_chid].name,
                file_name: fileName,
                chat: chatToSave,
                avatar_url: characters[this_chid].avatar,
                force,
            }),
        });

        if (result.ok) {
            return;
        }

        const errorData = await result.json();
        const isIntegrityError = errorData?.error === 'integrity' && !force;
        if (!isIntegrityError) {
            throw new Error(result.statusText);
        }

        const popupResult = await Popup.show.input(
            t`ERROR: Chat integrity check failed while saving the file.`,
            t`<p>After you click OK, the page will be reloaded to prevent data corruption.</p>
              <p>To confirm an overwrite (and potentially <b>LOSE YOUR DATA</b>), enter <code>OVERWRITE</code> (in all caps) in the box below before clicking OK.</p>`,
            '',
            { okButton: 'OK', cancelButton: false },
        );

        const forceSaveConfirmed = popupResult === 'OVERWRITE';

        if (!forceSaveConfirmed) {
            console.warn('Chat integrity check failed, and user did not confirm the overwrite. Reloading the page.');
            window.location.reload();
            return;
        }

        await saveChatInternal({ chatName, withMetadata, mesId, force: true });
    } catch (error) {
        console.error(error);
        toastr.error(t`Check the server connection and reload the page to prevent data loss.`, t`Chat could not be saved`);
    }
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
    if (!createOrEditCharacterImpl) throwUnbound('createOrEditCharacter');

    await waitUntilCondition(() => !isChatSaving, debounce_timeout.extended, 10);
    await clearChat();
    characters[this_chid].chat = file_name;
    chat.length = 0;
    syncChatMetadata({});

    const result = await getChat();
    $('#selected_chat_pole').val(file_name);
    await createOrEditCharacterImpl(new CustomEvent('newChat'));

    return result;
}

export async function replaceCurrentChat() {
    if (!saveCharacterDebouncedImpl) throwUnbound('saveCharacterDebounced');

    await clearChat();
    chat.length = 0;

    const chatsResponse = await fetch('/api/characters/chats', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({ avatar_url: characters[this_chid].avatar }),
    });

    if (chatsResponse.ok) {
        const chats = Object.values(await chatsResponse.json());
        chats.sort((a, b) => sortMoments(timestampToMoment(a.last_mes), timestampToMoment(b.last_mes)));

        if (chats.length && typeof chats[0] === 'object') {
            characters[this_chid].chat = chats[0].file_name.replace('.jsonl', '');
            $('#selected_chat_pole').val(characters[this_chid].chat);
            saveCharacterDebouncedImpl();
            await getChat();
        } else {
            characters[this_chid].chat = `${name2} - ${humanizedDateTime()}`;
            $('#selected_chat_pole').val(characters[this_chid].chat);
            saveCharacterDebouncedImpl();
            await getChat();
        }
    }
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

async function saveChatConditionalInternal() {
    if (!setIsChatSavingImpl) throwUnbound('setIsChatSaving');

    try {
        await waitUntilCondition(() => !isChatSaving, debounce_timeout.relaxed, 100);
    } catch {
        console.warn('Timeout waiting for chat to save');
        return;
    }

    try {
        cancelDebouncedChatSave();
        setIsChatSavingImpl(true);

        if (selected_group) {
            await saveGroupChat(selected_group, true);
        } else {
            await saveChatInternal();
        }

        saveTokenCache();
        saveItemizedPrompts(getCurrentChatId());
    } catch (error) {
        console.error('Error saving chat', error);
    } finally {
        setIsChatSavingImpl(false);
    }
}

export async function showMoreMessages(messagesToLoad = null) {
    if (!getChatTruncationImpl) throwUnbound('getChatTruncation');
    if (!applyStylePinsImpl) throwUnbound('applyStylePins');

    const firstDisplayedMesId = $('#chat').children('.mes').first().attr('mesid');
    let messageId = Number(firstDisplayedMesId);
    let count = messagesToLoad || getChatTruncationImpl() || Number.MAX_SAFE_INTEGER;

    if (Number.isNaN(messageId)) {
        messageId = chat.length;
    }

    console.debug('Inserting messages before', messageId, 'count', count, 'chat length', chat.length);
    const prevHeight = $('#chat').prop('scrollHeight');
    const isButtonInView = isElementInViewport($('#show_more_messages')[0]);

    while (messageId > 0 && count > 0) {
        const newMessageId = messageId - 1;
        addOneMessage(chat[newMessageId], { insertBefore: messageId >= chat.length ? null : messageId, scroll: false, forceId: newMessageId });
        count--;
        messageId--;
    }

    if (messageId === 0) {
        $('#show_more_messages').remove();
    }

    if (isButtonInView) {
        const newHeight = $('#chat').prop('scrollHeight');
        $('#chat').scrollTop(newHeight - prevHeight);
    }

    applyStylePinsImpl();
    await eventSource.emit(event_types.MORE_MESSAGES_LOADED);
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

export function saveChatDebounced() {
    const chid = this_chid;
    const selectedGroup = selected_group;

    cancelDebouncedChatSave();

    chatSaveTimeout = setTimeout(async () => {
        if (selectedGroup !== selected_group) {
            console.warn('Chat save timeout triggered, but group changed. Aborting.');
            return;
        }

        if (chid !== this_chid) {
            console.warn('Chat save timeout triggered, but chid changed. Aborting.');
            return;
        }

        console.debug('Chat save timeout triggered');
        await saveChatConditional();
        console.debug('Chat saved');
    }, debounce_timeout.relaxed);
}

export async function saveMetadata() {
    if (selected_group) {
        await editGroup(selected_group, true, false);
        return;
    }

    await saveChatConditional();
}
