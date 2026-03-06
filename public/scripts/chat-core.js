import { characters } from './character-core.js';
import { groups, selected_group } from './group-chats.js';

let getUserAvatarImpl = null;
let setUserNameImpl = null;

export let chat_metadata = {};
export let comment_avatar = '';
export let default_avatar = '';
export let default_user_avatar = '';
export let name1 = '';
export let name2 = '';
export let this_chid = undefined;
export let user_avatar = '';

function throwUnbound(name) {
    throw new Error(`[chat-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy chat implementations to standalone wrappers.
 * @param {{
 *   getUserAvatar: (...args: any[]) => string,
 *   setUserName: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindChatCore(impl) {
    getUserAvatarImpl = impl?.getUserAvatar ?? null;
    setUserNameImpl = impl?.setUserName ?? null;
}

export function syncChatMetadata(value) {
    chat_metadata = value;
}

export function syncCommentAvatar(value) {
    comment_avatar = value;
}

export function syncDefaultAvatar(value) {
    default_avatar = value;
}

export function syncDefaultUserAvatar(value) {
    default_user_avatar = value;
}

export function syncName1(value) {
    name1 = value;
}

export function syncName2(value) {
    name2 = value;
}

export function syncThisChid(value) {
    this_chid = value;
}

export function syncUserAvatar(value) {
    user_avatar = value;
}

export function getCurrentChatId() {
    if (selected_group) {
        return groups.find(x => x.id == selected_group)?.chat_id;
    }
    else if (this_chid !== undefined) {
        return characters[this_chid]?.chat;
    }
}

export function setUserName(...args) {
    if (!setUserNameImpl) {
        throwUnbound('setUserName');
    }

    return setUserNameImpl(...args);
}

export function getUserAvatar(...args) {
    if (!getUserAvatarImpl) {
        throwUnbound('getUserAvatar');
    }

    return getUserAvatarImpl(...args);
}

/**
 * Sets a character array index.
 * @param {number|string|object|undefined} value
 * @returns {string|undefined}
 */
export function setCharacterId(value) {
    switch (typeof value) {
        case 'bigint':
        case 'number':
            this_chid = String(value);
            break;
        case 'string':
            this_chid = !isNaN(parseInt(value)) ? value : undefined;
            break;
        case 'object':
            this_chid = value !== null && characters.indexOf(value) !== -1 ? String(characters.indexOf(value)) : undefined;
            break;
        case 'undefined':
            this_chid = undefined;
            break;
        default:
            console.error('Invalid character ID type:', value);
            break;
    }

    return this_chid;
}

/**
 * Sets the active character name.
 * @param {string} value
 * @returns {string}
 */
export function setCharacterName(value) {
    name2 = value;
    return name2;
}

export {
    characters,
};
