import { isChatSaving, menu_type } from './app-state-core.js';
import { characters, getRequestHeaders } from './character-core.js';
import { chat_metadata, getCurrentChatId, name2, setCharacterId as setChatCharacterId, setCharacterName as setChatCharacterName, this_chid, syncChatMetadata, syncName2, syncThisChid } from './chat-core.js';
import { chat, clearChat, getChat, getCurrentChatDetails, reloadCurrentChat, saveChatConditional, systemUserName } from './chat-operations-core.js';
import { Generate } from './generation-core.js';
import { t } from './i18n.js';
import { hideLoader, showLoader } from './loader.js';
import { editedMessageId } from './message-core.js';
import { POPUP_TYPE, callGenericPopup } from './popup.js';
import { humanizedDateTime } from './RossAscends-mods.js';
import { SAFETY_CHAT } from './system-messages.js';
import { is_send_press } from './ui-core.js';
import { delay, equalsIgnoreCaseAndAccents, waitUntilCondition } from './utils.js';
import { debounce_timeout } from './constants.js';

let cancelTtsPlayImpl = null;
let createNewGroupChatImpl = null;
let createOrEditCharacterImpl = null;
let deleteCharacterChatByNameImpl = null;
let deleteGroupChatImpl = null;
let delChatImpl = null;
let doNavbarIconClickImpl = null;
let getEntitiesListImpl = null;
let getContinueOnSendImpl = null;
let getSelectedGroupImpl = null;
let getSystemMessageByTypeImpl = null;
let hasPendingFileAttachmentImpl = null;
let isExecutingCommandsFromChatInputImpl = null;
let openPermanentAssistantChatImpl = null;
let renameGroupChatImpl = null;
let selectCharacterByIdImpl = null;
let selectRightMenuWithAnimationImpl = null;
let selectRmInfoImpl = null;
let selectSelectedCharacterImpl = null;
let sendSystemMessageImpl = null;
let setActiveCharacterImpl = null;
let setActiveGroupImpl = null;
let setCharacterIdImpl = null;
let setCharacterNameImpl = null;
let setScenarioOverrideImpl = null;
let unshallowCharacterImpl = null;

export let active_character = '';
export let active_group = '';
export let externalAbortController = null;
export let neutralCharacterName = '';
export let system_message_types = {};

function throwUnbound(name) {
    throw new Error(`[session-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy session/orchestration implementations to standalone wrappers.
 * @param {{
 *   cancelTtsPlay: (...args: any[]) => any,
 *   createNewGroupChat: (...args: any[]) => Promise<any>,
 *   createOrEditCharacter: (...args: any[]) => Promise<any>,
 *   deleteCharacterChatByName: (...args: any[]) => Promise<any>,
 *   deleteGroupChat: (...args: any[]) => Promise<any>,
 *   delChat: (...args: any[]) => Promise<any>,
 *   doNavbarIconClick: (...args: any[]) => Promise<any>,
 *   getContinueOnSend: () => boolean,
 *   getEntitiesList: (...args: any[]) => any,
 *   getSelectedGroup: () => string|null|undefined,
 *   getSystemMessageByType: (...args: any[]) => any,
 *   hasPendingFileAttachment: () => boolean,
 *   isExecutingCommandsFromChatInput: () => boolean,
 *   openPermanentAssistantChat: (...args: any[]) => Promise<any>,
 *   renameGroupChat: (...args: any[]) => Promise<any>,
 *   selectCharacterById: (...args: any[]) => Promise<any>,
 *   selectRightMenuWithAnimation: (...args: any[]) => Promise<any>,
 *   select_rm_info: (...args: any[]) => any,
 *   select_selected_character: (...args: any[]) => Promise<any>,
 *   sendSystemMessage: (...args: any[]) => any,
 *   setActiveCharacter: (...args: any[]) => any,
 *   setActiveGroup: (...args: any[]) => any,
 *   setCharacterId: (...args: any[]) => any,
 *   setCharacterName: (...args: any[]) => any,
 *   setScenarioOverride: (...args: any[]) => Promise<any>,
 *   unshallowCharacter: (...args: any[]) => Promise<any>,
 * }} impl Implementations to bind
 */
export function bindSessionCore(impl) {
    cancelTtsPlayImpl = impl?.cancelTtsPlay ?? null;
    createNewGroupChatImpl = impl?.createNewGroupChat ?? null;
    createOrEditCharacterImpl = impl?.createOrEditCharacter ?? null;
    deleteCharacterChatByNameImpl = impl?.deleteCharacterChatByName ?? null;
    deleteGroupChatImpl = impl?.deleteGroupChat ?? null;
    delChatImpl = impl?.delChat ?? null;
    doNavbarIconClickImpl = impl?.doNavbarIconClick ?? null;
    getContinueOnSendImpl = impl?.getContinueOnSend ?? null;
    getEntitiesListImpl = impl?.getEntitiesList ?? null;
    getSelectedGroupImpl = impl?.getSelectedGroup ?? null;
    getSystemMessageByTypeImpl = impl?.getSystemMessageByType ?? null;
    hasPendingFileAttachmentImpl = impl?.hasPendingFileAttachment ?? null;
    isExecutingCommandsFromChatInputImpl = impl?.isExecutingCommandsFromChatInput ?? null;
    openPermanentAssistantChatImpl = impl?.openPermanentAssistantChat ?? null;
    renameGroupChatImpl = impl?.renameGroupChat ?? null;
    selectCharacterByIdImpl = impl?.selectCharacterById ?? null;
    selectRightMenuWithAnimationImpl = impl?.selectRightMenuWithAnimation ?? null;
    selectRmInfoImpl = impl?.select_rm_info ?? null;
    selectSelectedCharacterImpl = impl?.select_selected_character ?? null;
    sendSystemMessageImpl = impl?.sendSystemMessage ?? null;
    setActiveCharacterImpl = impl?.setActiveCharacter ?? null;
    setActiveGroupImpl = impl?.setActiveGroup ?? null;
    setCharacterIdImpl = impl?.setCharacterId ?? null;
    setCharacterNameImpl = impl?.setCharacterName ?? null;
    setScenarioOverrideImpl = impl?.setScenarioOverride ?? null;
    unshallowCharacterImpl = impl?.unshallowCharacter ?? null;
}

export function syncActiveCharacter(value) {
    active_character = value;
}

export function syncActiveGroup(value) {
    active_group = value;
}

export function syncNeutralCharacterName(value) {
    neutralCharacterName = value;
}

export function syncSystemMessageTypes(value) {
    system_message_types = value;
}

export function cancelTtsPlay(...args) {
    if (!cancelTtsPlayImpl) {
        throwUnbound('cancelTtsPlay');
    }

    return cancelTtsPlayImpl(...args);
}

export function deleteCharacterChatByName(...args) {
    if (!deleteCharacterChatByNameImpl) {
        throwUnbound('deleteCharacterChatByName');
    }

    return deleteCharacterChatByNameImpl(...args);
}

export function doNavbarIconClick(...args) {
    if (!doNavbarIconClickImpl) {
        throwUnbound('doNavbarIconClick');
    }

    return doNavbarIconClickImpl(...args);
}

export async function doNewChat({ deleteCurrentChat = false } = {}) {
    if (!getSelectedGroupImpl) {
        throwUnbound('getSelectedGroup');
    }
    if (!createNewGroupChatImpl) {
        throwUnbound('createNewGroupChat');
    }
    if (!deleteGroupChatImpl) {
        throwUnbound('deleteGroupChat');
    }
    if (!createOrEditCharacterImpl) {
        throwUnbound('createOrEditCharacter');
    }
    if (!delChatImpl) {
        throwUnbound('delChat');
    }

    const selectedGroup = getSelectedGroupImpl();
    if ((!selectedGroup && this_chid === undefined) || menu_type === 'create') {
        return;
    }

    await waitUntilCondition(() => !isChatSaving, debounce_timeout.extended, 10);
    await clearChat();
    chat.length = 0;

    const chatFileForDelete = getCurrentChatDetails()?.sessionName;

    if (deleteCurrentChat) {
        await saveChatConditional();
    }

    if (selectedGroup) {
        await createNewGroupChatImpl(selectedGroup);
        if (deleteCurrentChat) {
            await deleteGroupChatImpl(selectedGroup, chatFileForDelete);
        }
        return;
    }

    syncChatMetadata({});
    characters[this_chid].chat = `${name2} - ${humanizedDateTime()}`;
    $('#selected_chat_pole').val(characters[this_chid].chat);
    await getChat();
    await createOrEditCharacterImpl(new CustomEvent('newChat'));
    if (deleteCurrentChat && chatFileForDelete) {
        await delChatImpl(`${chatFileForDelete}.jsonl`);
    }
}

export function getEntitiesList(...args) {
    if (!getEntitiesListImpl) {
        throwUnbound('getEntitiesList');
    }

    return getEntitiesListImpl(...args);
}

export function getSystemMessageByType(...args) {
    if (!getSystemMessageByTypeImpl) {
        throwUnbound('getSystemMessageByType');
    }

    return getSystemMessageByTypeImpl(...args);
}

export async function newAssistantChat({ temporary = false } = {}) {
    if (!openPermanentAssistantChatImpl) {
        throwUnbound('openPermanentAssistantChat');
    }

    await clearChat();
    if (!temporary) {
        return openPermanentAssistantChatImpl();
    }

    chat.splice(0, chat.length);
    syncChatMetadata({});
    setChatCharacterName(neutralCharacterName);
    syncName2(name2);
    sendSystemMessage(system_message_types.ASSISTANT_NOTE);
}

export async function renameGroupOrCharacterChat({ characterId, groupId, oldFileName, newFileName, loader }) {
    if (!renameGroupChatImpl) {
        throwUnbound('renameGroupChat');
    }
    if (!createOrEditCharacterImpl) {
        throwUnbound('createOrEditCharacter');
    }

    const currentChatId = getCurrentChatId();
    const body = {
        is_group: !!groupId,
        avatar_url: characters[characterId]?.avatar,
        original_file: `${oldFileName}.jsonl`,
        renamed_file: `${newFileName.trim()}.jsonl`,
    };

    if (body.original_file === body.renamed_file) {
        console.debug('Chat rename cancelled, old and new names are the same');
        return;
    }

    if (equalsIgnoreCaseAndAccents(body.original_file, body.renamed_file)) {
        toastr.warning(t`Name not accepted, as it is the same as before (ignoring case and accents).`, t`Rename Chat`);
        return;
    }

    try {
        loader && showLoader();

        const response = await fetch('/api/chats/rename', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: getRequestHeaders(),
        });

        if (!response.ok) {
            throw new Error('Unsuccessful request.');
        }

        const data = await response.json();

        if (data.error) {
            throw new Error('Server returned an error.');
        }

        if (data.sanitizedFileName) {
            newFileName = data.sanitizedFileName;
        }

        if (groupId) {
            await renameGroupChatImpl(groupId, oldFileName, newFileName);
        } else if (characterId !== undefined && String(characterId) === String(this_chid) && characters[characterId]?.chat === oldFileName) {
            characters[characterId].chat = newFileName;
            $('#selected_chat_pole').val(characters[characterId].chat);
            await createOrEditCharacterImpl();
        }

        if (currentChatId) {
            await reloadCurrentChat();
        }
    } catch {
        loader && hideLoader();
        await delay(500);
        await callGenericPopup('An error has occurred. Chat was not renamed.', POPUP_TYPE.TEXT);
    } finally {
        loader && hideLoader();
    }
}

export function resetChatState() {
    const nextName = (this_chid === undefined && neutralCharacterName) ? neutralCharacterName : systemUserName;
    setChatCharacterName(nextName);
    syncName2(name2);
    setChatCharacterId(undefined);
    syncThisChid(this_chid);
    chat.splice(0, chat.length, ...SAFETY_CHAT);
    syncChatMetadata({});
    characters.length = 0;
    return {
        chat_metadata,
        name2,
        this_chid,
    };
}

export function selectCharacterById(...args) {
    if (!selectCharacterByIdImpl) {
        throwUnbound('selectCharacterById');
    }

    return selectCharacterByIdImpl(...args);
}

export function selectRightMenuWithAnimation(...args) {
    if (!selectRightMenuWithAnimationImpl) {
        throwUnbound('selectRightMenuWithAnimation');
    }

    return selectRightMenuWithAnimationImpl(...args);
}

export function select_rm_info(...args) {
    if (!selectRmInfoImpl) {
        throwUnbound('select_rm_info');
    }

    return selectRmInfoImpl(...args);
}

export function select_selected_character(...args) {
    if (!selectSelectedCharacterImpl) {
        throwUnbound('select_selected_character');
    }

    return selectSelectedCharacterImpl(...args);
}

export function sendSystemMessage(...args) {
    if (!sendSystemMessageImpl) {
        throwUnbound('sendSystemMessage');
    }

    return sendSystemMessageImpl(...args);
}

export async function sendTextareaMessage(...args) {
    if (!getContinueOnSendImpl) {
        throwUnbound('getContinueOnSend');
    }
    if (!getSelectedGroupImpl) {
        throwUnbound('getSelectedGroup');
    }
    if (!hasPendingFileAttachmentImpl) {
        throwUnbound('hasPendingFileAttachment');
    }
    if (!isExecutingCommandsFromChatInputImpl) {
        throwUnbound('isExecutingCommandsFromChatInput');
    }

    if (is_send_press) return;
    if (isExecutingCommandsFromChatInputImpl()) return;
    if (editedMessageId) return;

    let generateType;
    const textareaText = String($('#send_textarea').val());
    const selectedGroup = getSelectedGroupImpl();
    if (getContinueOnSendImpl() &&
        !hasPendingFileAttachmentImpl() &&
        !textareaText &&
        !selectedGroup &&
        chat.length &&
        !chat[chat.length - 1].is_user &&
        !chat[chat.length - 1].is_system
    ) {
        generateType = 'continue';
    }

    if (textareaText && !selectedGroup && this_chid === undefined && name2 !== neutralCharacterName) {
        await newAssistantChat({ temporary: false });
    }

    return Generate(generateType);
}

export function setActiveCharacter(...args) {
    if (!setActiveCharacterImpl) {
        throwUnbound('setActiveCharacter');
    }

    return setActiveCharacterImpl(...args);
}

export function setActiveGroup(...args) {
    if (!setActiveGroupImpl) {
        throwUnbound('setActiveGroup');
    }

    return setActiveGroupImpl(...args);
}

export function setCharacterId(...args) {
    if (!setCharacterIdImpl) {
        throwUnbound('setCharacterId');
    }

    return setCharacterIdImpl(...args);
}

export function setCharacterName(...args) {
    if (!setCharacterNameImpl) {
        throwUnbound('setCharacterName');
    }

    return setCharacterNameImpl(...args);
}

export function setExternalAbortController(controller) {
    externalAbortController = controller;
    return externalAbortController;
}

export function setScenarioOverride(...args) {
    if (!setScenarioOverrideImpl) {
        throwUnbound('setScenarioOverride');
    }

    return setScenarioOverrideImpl(...args);
}

export function unshallowCharacter(...args) {
    if (!unshallowCharacterImpl) {
        throwUnbound('unshallowCharacter');
    }

    return unshallowCharacterImpl(...args);
}

export async function updateRemoteChatName(characterId, newName) {
    const character = characters[characterId];
    if (!character) {
        console.warn(`Character not found for ID: ${characterId}`);
        return;
    }

    character.chat = newName;
    const mergeResponse = await fetch('/api/characters/merge-attributes', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({
            avatar: character.avatar,
            chat: newName,
        }),
    });

    if (!mergeResponse.ok) {
        console.error('Failed to save extension field', mergeResponse.statusText);
    }
}
