import { characters } from './character-core.js';
import { chat_metadata, name2, setCharacterId as setChatCharacterId, setCharacterName as setChatCharacterName, this_chid, syncChatMetadata, syncName2, syncThisChid } from './chat-core.js';
import { chat, systemUserName } from './chat-operations-core.js';
import { SAFETY_CHAT } from './system-messages.js';

let cancelTtsPlayImpl = null;
let deleteCharacterChatByNameImpl = null;
let doNavbarIconClickImpl = null;
let doNewChatImpl = null;
let getEntitiesListImpl = null;
let getSystemMessageByTypeImpl = null;
let newAssistantChatImpl = null;
let renameGroupOrCharacterChatImpl = null;
let selectCharacterByIdImpl = null;
let selectRightMenuWithAnimationImpl = null;
let selectRmInfoImpl = null;
let selectSelectedCharacterImpl = null;
let sendSystemMessageImpl = null;
let sendTextareaMessageImpl = null;
let setActiveCharacterImpl = null;
let setActiveGroupImpl = null;
let setCharacterIdImpl = null;
let setCharacterNameImpl = null;
let setScenarioOverrideImpl = null;
let unshallowCharacterImpl = null;
let updateRemoteChatNameImpl = null;

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
 *   deleteCharacterChatByName: (...args: any[]) => Promise<any>,
 *   doNavbarIconClick: (...args: any[]) => Promise<any>,
 *   doNewChat: (...args: any[]) => Promise<any>,
 *   getEntitiesList: (...args: any[]) => any,
 *   getSystemMessageByType: (...args: any[]) => any,
 *   newAssistantChat: (...args: any[]) => Promise<any>,
 *   renameGroupOrCharacterChat: (...args: any[]) => Promise<any>,
 *   selectCharacterById: (...args: any[]) => Promise<any>,
 *   selectRightMenuWithAnimation: (...args: any[]) => Promise<any>,
 *   select_rm_info: (...args: any[]) => any,
 *   select_selected_character: (...args: any[]) => Promise<any>,
 *   sendSystemMessage: (...args: any[]) => any,
 *   sendTextareaMessage: (...args: any[]) => Promise<any>,
 *   setActiveCharacter: (...args: any[]) => any,
 *   setActiveGroup: (...args: any[]) => any,
 *   setCharacterId: (...args: any[]) => any,
 *   setCharacterName: (...args: any[]) => any,
 *   setScenarioOverride: (...args: any[]) => Promise<any>,
 *   unshallowCharacter: (...args: any[]) => Promise<any>,
 *   updateRemoteChatName: (...args: any[]) => Promise<any>,
 * }} impl Implementations to bind
 */
export function bindSessionCore(impl) {
    cancelTtsPlayImpl = impl?.cancelTtsPlay ?? null;
    deleteCharacterChatByNameImpl = impl?.deleteCharacterChatByName ?? null;
    doNavbarIconClickImpl = impl?.doNavbarIconClick ?? null;
    doNewChatImpl = impl?.doNewChat ?? null;
    getEntitiesListImpl = impl?.getEntitiesList ?? null;
    getSystemMessageByTypeImpl = impl?.getSystemMessageByType ?? null;
    newAssistantChatImpl = impl?.newAssistantChat ?? null;
    renameGroupOrCharacterChatImpl = impl?.renameGroupOrCharacterChat ?? null;
    selectCharacterByIdImpl = impl?.selectCharacterById ?? null;
    selectRightMenuWithAnimationImpl = impl?.selectRightMenuWithAnimation ?? null;
    selectRmInfoImpl = impl?.select_rm_info ?? null;
    selectSelectedCharacterImpl = impl?.select_selected_character ?? null;
    sendSystemMessageImpl = impl?.sendSystemMessage ?? null;
    sendTextareaMessageImpl = impl?.sendTextareaMessage ?? null;
    setActiveCharacterImpl = impl?.setActiveCharacter ?? null;
    setActiveGroupImpl = impl?.setActiveGroup ?? null;
    setCharacterIdImpl = impl?.setCharacterId ?? null;
    setCharacterNameImpl = impl?.setCharacterName ?? null;
    setScenarioOverrideImpl = impl?.setScenarioOverride ?? null;
    unshallowCharacterImpl = impl?.unshallowCharacter ?? null;
    updateRemoteChatNameImpl = impl?.updateRemoteChatName ?? null;
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

export function doNewChat(...args) {
    if (!doNewChatImpl) {
        throwUnbound('doNewChat');
    }

    return doNewChatImpl(...args);
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

export function newAssistantChat(...args) {
    if (!newAssistantChatImpl) {
        throwUnbound('newAssistantChat');
    }

    return newAssistantChatImpl(...args);
}

export function renameGroupOrCharacterChat(...args) {
    if (!renameGroupOrCharacterChatImpl) {
        throwUnbound('renameGroupOrCharacterChat');
    }

    return renameGroupOrCharacterChatImpl(...args);
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

export function sendTextareaMessage(...args) {
    if (!sendTextareaMessageImpl) {
        throwUnbound('sendTextareaMessage');
    }

    return sendTextareaMessageImpl(...args);
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

export function updateRemoteChatName(...args) {
    if (!updateRemoteChatNameImpl) {
        throwUnbound('updateRemoteChatName');
    }

    return updateRemoteChatNameImpl(...args);
}
