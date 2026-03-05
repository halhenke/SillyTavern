import { getRequestHeaders } from './network-core.js';

let buildAvatarListImpl = null;
let characterToEntityImpl = null;
let deleteCharacterImpl = null;
let duplicateCharacterImpl = null;
let getCharactersImpl = null;
let groupToEntityImpl = null;
let printCharactersImpl = null;
let renameCharacterImpl = null;

export let characterGroupOverlay = null;
export let characters = [];
export let printCharactersDebounced = null;

function throwUnbound(name) {
    throw new Error(`[character-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy character implementations to standalone wrappers.
 * @param {{
 *   buildAvatarList: (...args: any[]) => any,
 *   characterToEntity: (...args: any[]) => any,
 *   deleteCharacter: (...args: any[]) => Promise<any>,
 *   duplicateCharacter: (...args: any[]) => Promise<any>,
 *   getCharacters: (...args: any[]) => Promise<any>,
 *   groupToEntity: (...args: any[]) => any,
 *   printCharacters: (...args: any[]) => Promise<any>,
 *   renameCharacter: (...args: any[]) => Promise<any>,
 * }} impl Implementations to bind
 */
export function bindCharacterCore(impl) {
    buildAvatarListImpl = impl?.buildAvatarList ?? null;
    characterToEntityImpl = impl?.characterToEntity ?? null;
    deleteCharacterImpl = impl?.deleteCharacter ?? null;
    duplicateCharacterImpl = impl?.duplicateCharacter ?? null;
    getCharactersImpl = impl?.getCharacters ?? null;
    groupToEntityImpl = impl?.groupToEntity ?? null;
    printCharactersImpl = impl?.printCharacters ?? null;
    renameCharacterImpl = impl?.renameCharacter ?? null;
}

export function syncCharacterGroupOverlay(value) {
    characterGroupOverlay = value;
}

export function syncCharacters(value) {
    characters = value;
}

export function syncPrintCharactersDebounced(value) {
    printCharactersDebounced = value;
}

export function buildAvatarList(...args) {
    if (!buildAvatarListImpl) {
        throwUnbound('buildAvatarList');
    }

    return buildAvatarListImpl(...args);
}

export function characterToEntity(...args) {
    if (!characterToEntityImpl) {
        throwUnbound('characterToEntity');
    }

    return characterToEntityImpl(...args);
}

export function deleteCharacter(...args) {
    if (!deleteCharacterImpl) {
        throwUnbound('deleteCharacter');
    }

    return deleteCharacterImpl(...args);
}

export function duplicateCharacter(...args) {
    if (!duplicateCharacterImpl) {
        throwUnbound('duplicateCharacter');
    }

    return duplicateCharacterImpl(...args);
}

export function getCharacters(...args) {
    if (!getCharactersImpl) {
        throwUnbound('getCharacters');
    }

    return getCharactersImpl(...args);
}

export function groupToEntity(...args) {
    if (!groupToEntityImpl) {
        throwUnbound('groupToEntity');
    }

    return groupToEntityImpl(...args);
}

export function printCharacters(...args) {
    if (!printCharactersImpl) {
        throwUnbound('printCharacters');
    }

    return printCharactersImpl(...args);
}

export function renameCharacter(...args) {
    if (!renameCharacterImpl) {
        throwUnbound('renameCharacter');
    }

    return renameCharacterImpl(...args);
}

export { getRequestHeaders };
