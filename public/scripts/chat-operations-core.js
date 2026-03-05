let activateSendButtonsImpl = null;
let addOneMessageImpl = null;
let appendMediaToMessageImpl = null;
let clearChatImpl = null;
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
let openCharacterChatImpl = null;
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
let setSendButtonStateImpl = null;
let showSwipeButtonsImpl = null;
let showMoreMessagesImpl = null;
let swipeLeftImpl = null;
let swipeRightImpl = null;
let updateChatMetadataImpl = null;

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
 *   openCharacterChat: (...args: any[]) => Promise<any>,
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
 *   setSendButtonState: (...args: any[]) => any,
 *   showSwipeButtons: (...args: any[]) => any,
 *   showMoreMessages: (...args: any[]) => Promise<any>,
 *   swipe_left: (...args: any[]) => Promise<any>,
 *   swipe_right: (...args: any[]) => Promise<any>,
 *   updateChatMetadata: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindChatOperationsCore(impl) {
    activateSendButtonsImpl = impl?.activateSendButtons ?? null;
    addOneMessageImpl = impl?.addOneMessage ?? null;
    appendMediaToMessageImpl = impl?.appendMediaToMessage ?? null;
    clearChatImpl = impl?.clearChat ?? null;
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
    openCharacterChatImpl = impl?.openCharacterChat ?? null;
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
    setSendButtonStateImpl = impl?.setSendButtonState ?? null;
    showSwipeButtonsImpl = impl?.showSwipeButtons ?? null;
    showMoreMessagesImpl = impl?.showMoreMessages ?? null;
    swipeLeftImpl = impl?.swipe_left ?? null;
    swipeRightImpl = impl?.swipe_right ?? null;
    updateChatMetadataImpl = impl?.updateChatMetadata ?? null;
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

export function openCharacterChat(...args) {
    if (!openCharacterChatImpl) throwUnbound('openCharacterChat');
    return openCharacterChatImpl(...args);
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

export function setSendButtonState(...args) {
    if (!setSendButtonStateImpl) throwUnbound('setSendButtonState');
    return setSendButtonStateImpl(...args);
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

export function updateChatMetadata(...args) {
    if (!updateChatMetadataImpl) throwUnbound('updateChatMetadata');
    return updateChatMetadataImpl(...args);
}
