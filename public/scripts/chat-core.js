import { characters } from './character-core.js';
import { groups, selected_group } from './group-chats.js';
import { t } from './i18n.js';

let getUserAvatarImpl = null;
let getDefaultUserNameImpl = null;
let getPersonaNotificationsEnabledImpl = null;
let isPersonaPanelOpenImpl = null;
let saveSettingsDebouncedImpl = null;

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
 *   getDefaultUserName: () => string,
 *   getPersonaNotificationsEnabled: () => boolean,
 *   getUserAvatar: (...args: any[]) => string,
 *   isPersonaPanelOpen: () => boolean,
 *   saveSettingsDebounced: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindChatCore(impl) {
    getDefaultUserNameImpl = impl?.getDefaultUserName ?? null;
    getPersonaNotificationsEnabledImpl = impl?.getPersonaNotificationsEnabled ?? null;
    getUserAvatarImpl = impl?.getUserAvatar ?? null;
    isPersonaPanelOpenImpl = impl?.isPersonaPanelOpen ?? null;
    saveSettingsDebouncedImpl = impl?.saveSettingsDebounced ?? null;
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
    return setUserNameInternal(...args);
}

function setUserNameInternal(value, { toastPersonaNameChange = true } = {}) {
    if (!getDefaultUserNameImpl) {
        throwUnbound('getDefaultUserName');
    }
    if (!getPersonaNotificationsEnabledImpl) {
        throwUnbound('getPersonaNotificationsEnabled');
    }
    if (!isPersonaPanelOpenImpl) {
        throwUnbound('isPersonaPanelOpen');
    }
    if (!saveSettingsDebouncedImpl) {
        throwUnbound('saveSettingsDebounced');
    }

    name1 = value;
    if (name1 === undefined || name1 === '') {
        name1 = getDefaultUserNameImpl();
    }

    console.log(`User name changed to ${name1}`);
    $('#your_name').text(name1);

    if (toastPersonaNameChange && getPersonaNotificationsEnabledImpl() && !isPersonaPanelOpenImpl()) {
        toastr.success(t`Your messages will now be sent as ${name1}`, t`Persona Changed`);
    }

    saveSettingsDebouncedImpl();
    return name1;
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
