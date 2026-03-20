import { DOMPurify } from '../lib.js';
import { event_types, eventSource } from './events.js';
import { is_group_generating, selected_group } from './group-chats.js';
import { t } from './i18n.js';
import { favsToHotswap } from './RossAscends-mods.js';
import { tag_map } from './tags.js';
import { is_send_press } from './ui-core.js';
import { getCharaFilename, ensureImageFormatSupported } from './utils.js';
import { accountStorage } from './util/AccountStorage.js';
import { world_info } from './world-info.js';
import { getRequestHeaders } from './network-core.js';
import { saveSettingsDebounced } from './settings-core.js';
import { chat_metadata, this_chid } from './chat-core.js';

let buildAvatarListImpl = null;
let characterToEntityImpl = null;
let clearChatImpl = null;
let createTagMapFromListImpl = null;
let duplicateCharacterImpl = null;
let getChatImpl = null;
let getCurrentChatIdImpl = null;
let getFirstMessageImpl = null;
let getCharactersImpl = null;
let getPastCharacterChatsImpl = null;
let groupToEntityImpl = null;
let preserveNeutralChatImpl = null;
let printMessagesImpl = null;
let printCharactersImpl = null;
let renameCharacterImpl = null;
let resetChatStateImpl = null;
let restoreNeutralChatImpl = null;
let saveChatConditionalImpl = null;
let saveSettingsDebouncedImpl = null;
let selectRmInfoImpl = null;

export let characterGroupOverlay = null;
export let characters = [];
export let create_save = {};
export let crop_data = undefined;
export let depth_prompt_depth_default = 4;
export let depth_prompt_role_default = 'system';
export let fav_ch_checked = false;
export let printCharactersDebounced = null;
export let talkativeness_default = 0.5;

function throwUnbound(name) {
    throw new Error(`[character-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy character implementations to standalone wrappers.
 * @param {{
 *   buildAvatarList: (...args: any[]) => any,
 *   characterToEntity: (...args: any[]) => any,
 *   clearChat: (...args: any[]) => Promise<any>,
 *   createTagMapFromList: (...args: any[]) => any,
 *   duplicateCharacter: (...args: any[]) => Promise<any>,
 *   getChat: () => any[],
 *   getCurrentChatId: () => string|undefined,
 *   getFirstMessage: (...args: any[]) => any,
 *   getCharacters: (...args: any[]) => Promise<any>,
 *   getPastCharacterChats: (...args: any[]) => Promise<any>,
 *   groupToEntity: (...args: any[]) => any,
 *   preserveNeutralChat: (...args: any[]) => any,
 *   printMessages: (...args: any[]) => Promise<any>,
 *   printCharacters: (...args: any[]) => Promise<any>,
 *   renameCharacter: (...args: any[]) => Promise<any>,
 *   resetChatState: (...args: any[]) => any,
 *   restoreNeutralChat: (...args: any[]) => any,
 *   saveChatConditional: (...args: any[]) => Promise<any>,
 *   saveSettingsDebounced: (...args: any[]) => any,
 *   select_rm_info: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindCharacterCore(impl) {
    buildAvatarListImpl = impl?.buildAvatarList ?? null;
    characterToEntityImpl = impl?.characterToEntity ?? null;
    clearChatImpl = impl?.clearChat ?? null;
    createTagMapFromListImpl = impl?.createTagMapFromList ?? null;
    duplicateCharacterImpl = impl?.duplicateCharacter ?? null;
    getChatImpl = impl?.getChat ?? null;
    getCurrentChatIdImpl = impl?.getCurrentChatId ?? null;
    getFirstMessageImpl = impl?.getFirstMessage ?? null;
    getCharactersImpl = impl?.getCharacters ?? null;
    getPastCharacterChatsImpl = impl?.getPastCharacterChats ?? null;
    groupToEntityImpl = impl?.groupToEntity ?? null;
    preserveNeutralChatImpl = impl?.preserveNeutralChat ?? null;
    printMessagesImpl = impl?.printMessages ?? null;
    printCharactersImpl = impl?.printCharacters ?? null;
    renameCharacterImpl = impl?.renameCharacter ?? null;
    resetChatStateImpl = impl?.resetChatState ?? null;
    restoreNeutralChatImpl = impl?.restoreNeutralChat ?? null;
    saveChatConditionalImpl = impl?.saveChatConditional ?? null;
    saveSettingsDebouncedImpl = impl?.saveSettingsDebounced ?? null;
    selectRmInfoImpl = impl?.select_rm_info ?? null;
}

export function syncCharacterGroupOverlay(value) {
    characterGroupOverlay = value;
}

export function syncCharacters(value) {
    characters = value;
}

export function syncCreateSave(value) {
    create_save = value;
}

export function syncCropData(value) {
    crop_data = value;
}

export function syncDepthPromptDepthDefault(value) {
    depth_prompt_depth_default = value;
}

export function syncDepthPromptRoleDefault(value) {
    depth_prompt_role_default = value;
}

export function syncFavChChecked(value) {
    fav_ch_checked = Boolean(value);
}

export function syncPrintCharactersDebounced(value) {
    printCharactersDebounced = value;
}

export function syncTalkativenessDefault(value) {
    talkativeness_default = value;
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
    return deleteCharacterInternal(...args);
}

async function deleteCharacterInternal(characterKey, { deleteChats = true } = {}) {
    if (!getPastCharacterChatsImpl) {
        throwUnbound('getPastCharacterChats');
    }
    if (!selectRmInfoImpl) {
        throwUnbound('select_rm_info');
    }

    if (!Array.isArray(characterKey)) {
        characterKey = [characterKey];
    }

    for (const key of characterKey) {
        const character = characters.find(x => x.avatar == key);
        if (!character) {
            toastr.warning(t`Character ${key} not found. Skipping deletion.`);
            continue;
        }

        const chid = characters.indexOf(character);
        const pastChats = await getPastCharacterChatsImpl(chid);

        const msg = { avatar_url: character.avatar, delete_chats: deleteChats };
        const response = await fetch('/api/characters/delete', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify(msg),
            cache: 'no-cache',
        });

        if (!response.ok) {
            toastr.error(`${response.status} ${response.statusText}`, t`Failed to delete character`);
            continue;
        }

        accountStorage.removeItem(`AlertWI_${character.avatar}`);
        accountStorage.removeItem(`AlertRegex_${character.avatar}`);
        accountStorage.removeItem(`mediaWarningShown:${character.avatar}`);
        delete tag_map[character.avatar];
        selectRmInfoImpl('char_delete', character.name);

        if (deleteChats) {
            for (const chat of pastChats) {
                const name = chat.file_name.replace('.jsonl', '');
                await eventSource.emit(event_types.CHAT_DELETED, name);
            }
        }

        await eventSource.emit(event_types.CHARACTER_DELETED, { id: chid, character });
    }

    await removeCharacterFromUI();
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

export function updateFavButtonState(state) {
    fav_ch_checked = Boolean(state);
    $('#fav_checkbox').prop('checked', fav_ch_checked);
    $('#favorite_button').toggleClass('fav_on', fav_ch_checked);
    $('#favorite_button').toggleClass('fav_off', !fav_ch_checked);
}

export function renameCharacter(...args) {
    if (!renameCharacterImpl) {
        throwUnbound('renameCharacter');
    }

    return renameCharacterImpl(...args);
}

async function removeCharacterFromUI() {
    if (!preserveNeutralChatImpl) {
        throwUnbound('preserveNeutralChat');
    }
    if (!clearChatImpl) {
        throwUnbound('clearChat');
    }
    if (!resetChatStateImpl) {
        throwUnbound('resetChatState');
    }
    if (!restoreNeutralChatImpl) {
        throwUnbound('restoreNeutralChat');
    }
    if (!getCharactersImpl) {
        throwUnbound('getCharacters');
    }
    if (!printMessagesImpl) {
        throwUnbound('printMessages');
    }
    if (!saveSettingsDebouncedImpl) {
        throwUnbound('saveSettingsDebounced');
    }
    if (!getCurrentChatIdImpl) {
        throwUnbound('getCurrentChatId');
    }

    preserveNeutralChatImpl();
    await clearChatImpl();
    $('#character_cross').trigger('click');
    resetChatStateImpl();
    $(document.getElementById('rm_button_selected_ch')).children('h2').text('');
    restoreNeutralChatImpl();
    await getCharactersImpl();
    await printMessagesImpl();
    saveSettingsDebouncedImpl();
    await eventSource.emit(event_types.CHAT_CHANGED, getCurrentChatIdImpl());
}

export async function getOneCharacter(avatarUrl) {
    const response = await fetch('/api/characters/get', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({
            avatar_url: avatarUrl,
        }),
    });

    if (response.ok) {
        const getData = await response.json();
        getData.name = DOMPurify.sanitize(getData.name);
        getData.chat = String(getData.chat);

        const indexOf = characters.findIndex(x => x.avatar === avatarUrl);

        if (indexOf !== -1) {
            characters[indexOf] = getData;
        } else {
            toastr.error(t`Character ${avatarUrl} not found in the list`, t`Error`, { timeOut: 5000, preventDuplicates: true });
        }
    }
}

export async function createOrEditCharacter(e) {
    if (!getCharactersImpl) {
        throwUnbound('getCharacters');
    }
    if (!selectRmInfoImpl) {
        throwUnbound('select_rm_info');
    }
    if (!createTagMapFromListImpl) {
        throwUnbound('createTagMapFromList');
    }
    if (!getFirstMessageImpl) {
        throwUnbound('getFirstMessage');
    }
    if (!getChatImpl) {
        throwUnbound('getChat');
    }
    if (!clearChatImpl) {
        throwUnbound('clearChat');
    }
    if (!printMessagesImpl) {
        throwUnbound('printMessages');
    }
    if (!saveChatConditionalImpl) {
        throwUnbound('saveChatConditional');
    }
    const currentChat = getChatImpl();

    $('#rm_info_avatar').html('');
    const formData = new FormData(/** @type {HTMLFormElement} */($('#form_create').get(0)));
    formData.set('fav', String(fav_ch_checked));
    const isNewChat = e instanceof CustomEvent && e.type === 'newChat';

    const rawFile = formData.get('avatar');
    if (rawFile instanceof File) {
        const convertedFile = await ensureImageFormatSupported(rawFile);
        formData.set('avatar', convertedFile);
    }

    const headers = getRequestHeaders({ omitContentType: true });

    if ($('#form_create').attr('actiontype') == 'createcharacter') {
        if (String($('#character_name_pole').val()).length === 0) {
            toastr.error(t`Name is required`);
            return;
        }
        if (is_group_generating || is_send_press) {
            toastr.error(t`Cannot create characters while generating. Stop the request and try again.`, t`Creation aborted`);
            return;
        }
        try {
            let url = '/api/characters/create';

            if (crop_data != undefined) {
                url += `?crop=${encodeURIComponent(JSON.stringify(crop_data))}`;
            }

            formData.delete('alternate_greetings');
            for (const value of create_save.alternate_greetings) {
                formData.append('alternate_greetings', value);
            }

            formData.append('extensions', JSON.stringify(create_save.extensions));

            const fetchResult = await fetch(url, {
                method: 'POST',
                headers,
                body: formData,
                cache: 'no-cache',
            });

            if (!fetchResult.ok) {
                throw new Error('Fetch result is not ok');
            }

            const avatarId = await fetchResult.text();

            $('#character_cross').trigger('click');
            const fields = [
                { id: '#character_name_pole', callback: value => create_save.name = value },
                { id: '#description_textarea', callback: value => create_save.description = value },
                { id: '#creator_notes_textarea', callback: value => create_save.creator_notes = value },
                { id: '#character_version_textarea', callback: value => create_save.character_version = value },
                { id: '#post_history_instructions_textarea', callback: value => create_save.post_history_instructions = value },
                { id: '#system_prompt_textarea', callback: value => create_save.system_prompt = value },
                { id: '#tags_textarea', callback: value => create_save.tags = value },
                { id: '#creator_textarea', callback: value => create_save.creator = value },
                { id: '#personality_textarea', callback: value => create_save.personality = value },
                { id: '#firstmessage_textarea', callback: value => create_save.first_message = value },
                { id: '#talkativeness_slider', callback: value => create_save.talkativeness = value, defaultValue: talkativeness_default },
                { id: '#scenario_pole', callback: value => create_save.scenario = value },
                { id: '#depth_prompt_prompt', callback: value => create_save.depth_prompt_prompt = value },
                { id: '#depth_prompt_depth', callback: value => create_save.depth_prompt_depth = value, defaultValue: depth_prompt_depth_default },
                { id: '#depth_prompt_role', callback: value => create_save.depth_prompt_role = value, defaultValue: depth_prompt_role_default },
                { id: '#mes_example_textarea', callback: value => create_save.mes_example = value },
                { id: '#character_json_data', callback: () => { } },
                { id: '#alternate_greetings_template', callback: value => create_save.alternate_greetings = value, defaultValue: [] },
                { id: '#character_world', callback: value => create_save.world = value },
                { id: '#_character_extensions_fake', callback: value => create_save.extensions = {} },
            ];

            fields.forEach(field => {
                const fieldValue = field.defaultValue !== undefined ? field.defaultValue : '';
                $(field.id).val(fieldValue);
                field.callback && field.callback(fieldValue);
            });

            if (Array.isArray(create_save.extra_books) && create_save.extra_books.length > 0) {
                const fileName = getCharaFilename(null, { manualAvatarKey: avatarId });
                const charLore = world_info.charLore ?? [];
                charLore.push({ name: fileName, extraBooks: create_save.extra_books });
                Object.assign(world_info, { charLore });
                saveSettingsDebounced();
            }
            create_save.extra_books = [];

            $('#character_popup-button-h3').text('Create character');

            create_save.avatar = null;

            $('#add_avatar_button').replaceWith(
                $('#add_avatar_button').val('').clone(true),
            );

            let oldSelectedChar = null;
            if (this_chid !== undefined) {
                oldSelectedChar = characters[this_chid].avatar;
            }

            console.log(`new avatar id: ${avatarId}`);
            createTagMapFromListImpl('#tagList', avatarId);
            await getCharactersImpl();

            selectRmInfoImpl('char_create', avatarId, oldSelectedChar);

            crop_data = undefined;
        } catch (error) {
            console.error('Error creating character', error);
            toastr.error(t`Failed to create character`);
        }
        return;
    }

    try {
        let url = '/api/characters/edit';

        if (crop_data != undefined) {
            url += `?crop=${encodeURIComponent(JSON.stringify(crop_data))}`;
        }

        formData.delete('alternate_greetings');
        const chid = $('.open_alternate_greetings').data('chid');
        if (characters[chid] && Array.isArray(characters[chid]?.data?.alternate_greetings)) {
            for (const value of characters[chid].data.alternate_greetings) {
                formData.append('alternate_greetings', value);
            }
        }

        const fetchResult = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
            cache: 'no-cache',
        });

        if (!fetchResult.ok) {
            throw new Error('Fetch result is not ok');
        }

        await getOneCharacter(formData.get('avatar_url'));
        favsToHotswap();

        $('#add_avatar_button').replaceWith(
            $('#add_avatar_button').val('').clone(true),
        );
        $('#create_button').attr('value', 'Save');
        crop_data = undefined;
        await eventSource.emit(event_types.CHARACTER_EDITED, { detail: { id: this_chid, character: characters[this_chid] } });

        const message = getFirstMessageImpl();
        const shouldRegenerateMessage =
            !isNewChat &&
            message.mes &&
            !selected_group &&
            !chat_metadata.tainted &&
            (currentChat.length === 0 || (currentChat.length === 1 && !currentChat[0].is_user && !currentChat[0].is_system));

        if (shouldRegenerateMessage) {
            currentChat.splice(0, currentChat.length, message);
            const messageId = currentChat.length - 1;
            await eventSource.emit(event_types.MESSAGE_RECEIVED, messageId, 'first_message');
            await clearChatImpl();
            await printMessagesImpl();
            await eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, messageId, 'first_message');
            await saveChatConditionalImpl();
        }
    } catch (error) {
        console.log(error);
        toastr.error(t`Something went wrong while saving the character, or the image file provided was in an invalid format. Double check that the image is not a webp.`);
    }
}

export { getRequestHeaders };
