import { characters } from './character-core.js';

let getCurrentChatIdImpl = null;
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
 *   getCurrentChatId: (...args: any[]) => string|undefined,
 *   getUserAvatar: (...args: any[]) => string,
 *   setUserName: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindChatCore(impl) {
    getCurrentChatIdImpl = impl?.getCurrentChatId ?? null;
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

export function getCurrentChatId(...args) {
    if (!getCurrentChatIdImpl) {
        throwUnbound('getCurrentChatId');
    }

    return getCurrentChatIdImpl(...args);
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

export {
    characters,
};
