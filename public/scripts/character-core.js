import { DOMPurify } from '../lib.js';
import { entitiesFilter, menu_type } from './app-state-core.js';
import { event_types, eventSource } from './events.js';
import { extension_settings } from './extensions.js';
import { default_avatar, name1, name2 } from './chat-core.js';
import { FILTER_STATES, FILTER_TYPES, isFilterState } from './filters.js';
import { is_group_generating, selected_group, groups, getGroupAvatar, getGroupBlock, getGroupCharacterCards, getGroups } from './group-chats.js';
import { t } from './i18n.js';
import { INTERACTABLE_CONTROL_CLASS } from './keyboard.js';
import { getThumbnailUrl, getRequestHeaders } from './network-core.js';
import { baseChatReplace } from './parser-core.js';
import { updatePersonaConnectionsAvatarList } from './personas.js';
import { POPUP_RESULT, POPUP_TYPE, Popup, callGenericPopup } from './popup.js';
import { power_user, sortEntitiesList } from './power-user.js';
import { favsToHotswap, humanizedDateTime, isMobile } from './RossAscends-mods.js';
import { system_message_types } from './system-messages.js';
import { renderTemplateAsync } from './templates.js';
import { applyTagsOnCharacterSelect, applyTagsOnGroupSelect, compareTagsForSort, filterByTagState, getTagBlock, isBogusFolder, isBogusFolderOpen, printTagFilters, printTagList, tag_filter_type, tag_map, tags } from './tags.js';
import { animation_duration, animation_easing, is_send_press } from './ui-core.js';
import { debounce, delay, ensureImageFormatSupported, flashHighlight, getCharaFilename, localizePagination, PAGINATION_TEMPLATE, paginationDropdownChangeHandler, renderPaginationDropdown } from './utils.js';
import { accountStorage } from './util/AccountStorage.js';
import { getPermanentAssistantAvatar } from './welcome-screen.js';
import { setWorldInfoButtonClass, world_info, world_names } from './world-info.js';
import { saveCharacterDebounced, saveSettingsDebounced } from './settings-core.js';
import { chat_metadata, this_chid } from './chat-core.js';

let clearChatImpl = null;
let createTagMapFromListImpl = null;
let getActiveCharacterImpl = null;
let getChatImpl = null;
let getCurrentChatIdImpl = null;
let getFirstMessageImpl = null;
let getPastCharacterChatsImpl = null;
let preserveNeutralChatImpl = null;
let printMessagesImpl = null;
let resetChatStateImpl = null;
let reloadCurrentChatImpl = null;
let renameGroupMemberImpl = null;
let restoreNeutralChatImpl = null;
let saveChatConditionalImpl = null;
let saveSettingsDebouncedImpl = null;
let getSelectedButtonImpl = null;
let selectCharacterByIdImpl = null;
let setActiveCharacterImpl = null;
let setCharacterIdImpl = null;
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

let saveCharactersPage = 0;
const CHARACTER_LIST_PAGE_DEFAULT = 50;
let isAdvancedCharOpen = false;
let isExportPopupOpen = false;

function throwUnbound(name) {
    throw new Error(`[character-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy character implementations to standalone wrappers.
 * @param {{
 *   clearChat: (...args: any[]) => Promise<any>,
 *   createTagMapFromList: (...args: any[]) => any,
 *   getActiveCharacter: () => string|null|undefined,
 *   getChat: () => any[],
 *   getCurrentChatId: () => string|undefined,
 *   getFirstMessage: (...args: any[]) => any,
 *   getPastCharacterChats: (...args: any[]) => Promise<any>,
 *   preserveNeutralChat: (...args: any[]) => any,
 *   printMessages: (...args: any[]) => Promise<any>,
 *   reloadCurrentChat: (...args: any[]) => Promise<any>,
 *   renameGroupMember: (...args: any[]) => Promise<any>,
 *   resetChatState: (...args: any[]) => any,
 *   restoreNeutralChat: (...args: any[]) => any,
 *   saveChatConditional: (...args: any[]) => Promise<any>,
 *   saveSettingsDebounced: (...args: any[]) => any,
 *   getSelectedButton: () => string,
 *   selectCharacterById: (...args: any[]) => Promise<any>,
 *   setActiveCharacter: (...args: any[]) => any,
 *   setCharacterId: (...args: any[]) => any,
 *   select_rm_info: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindCharacterCore(impl) {
    clearChatImpl = impl?.clearChat ?? null;
    createTagMapFromListImpl = impl?.createTagMapFromList ?? null;
    getActiveCharacterImpl = impl?.getActiveCharacter ?? null;
    getChatImpl = impl?.getChat ?? null;
    getCurrentChatIdImpl = impl?.getCurrentChatId ?? null;
    getFirstMessageImpl = impl?.getFirstMessage ?? null;
    getPastCharacterChatsImpl = impl?.getPastCharacterChats ?? null;
    preserveNeutralChatImpl = impl?.preserveNeutralChat ?? null;
    printMessagesImpl = impl?.printMessages ?? null;
    resetChatStateImpl = impl?.resetChatState ?? null;
    reloadCurrentChatImpl = impl?.reloadCurrentChat ?? null;
    renameGroupMemberImpl = impl?.renameGroupMember ?? null;
    restoreNeutralChatImpl = impl?.restoreNeutralChat ?? null;
    saveChatConditionalImpl = impl?.saveChatConditional ?? null;
    saveSettingsDebouncedImpl = impl?.saveSettingsDebounced ?? null;
    getSelectedButtonImpl = impl?.getSelectedButton ?? null;
    selectCharacterByIdImpl = impl?.selectCharacterById ?? null;
    setActiveCharacterImpl = impl?.setActiveCharacter ?? null;
    setCharacterIdImpl = impl?.setCharacterId ?? null;
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

export function buildAvatarList(block, entities, { templateId = 'inline_avatar_template', empty = true, interactable = false, highlightFavs = true } = {}) {
    if (empty) {
        block.empty();
    }

    for (const entity of entities) {
        const id = entity.id;
        const avatarTemplate = $(`#${templateId} .avatar`).clone();

        let this_avatar = default_avatar;
        if (entity.item.avatar !== undefined && entity.item.avatar != 'none') {
            this_avatar = getThumbnailUrl('avatar', entity.item.avatar);
        }

        avatarTemplate.attr('data-type', entity.type);
        avatarTemplate.attr('data-chid', id);
        avatarTemplate.find('img').attr('src', this_avatar).attr('alt', entity.item.name);
        avatarTemplate.attr('title', `[Character] ${entity.item.name}\nFile: ${entity.item.avatar}`);
        if (highlightFavs) {
            avatarTemplate.toggleClass('is_fav', entity.item.fav || entity.item.fav == 'true');
            avatarTemplate.find('.ch_fav').val(entity.item.fav);
        }

        if (entity.type === 'group') {
            const grpTemplate = getGroupAvatar(entity.item);

            avatarTemplate.addClass(grpTemplate.attr('class'));
            avatarTemplate.empty();
            avatarTemplate.append(grpTemplate.children());
            avatarTemplate.attr({ 'data-grid': id, 'data-chid': null });
            avatarTemplate.attr('title', `[Group] ${entity.item.name}`);
        } else if (entity.type === 'persona') {
            avatarTemplate.attr({ 'data-pid': id, 'data-chid': null });
            avatarTemplate.find('img').attr('src', getThumbnailUrl('persona', entity.item.avatar));
            avatarTemplate.attr('title', `[Persona] ${entity.item.name}\nFile: ${entity.item.avatar}`);
        }

        if (interactable) {
            avatarTemplate.addClass(INTERACTABLE_CONTROL_CLASS);
            avatarTemplate.toggleClass('character_select', entity.type === 'character');
            avatarTemplate.toggleClass('group_select', entity.type === 'group');
        }

        block.append(avatarTemplate);
    }
}

export function characterToEntity(character, id) {
    return { item: character, id, type: 'character' };
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

export async function duplicateCharacter() {
    if (this_chid === undefined || !characters[this_chid]) {
        toastr.warning(t`You must first select a character to duplicate!`);
        return '';
    }

    const confirmMessage = $(await renderTemplateAsync('duplicateConfirm'));
    const confirm = await callGenericPopup(confirmMessage, POPUP_TYPE.CONFIRM);

    if (!confirm) {
        console.log('User cancelled duplication');
        return '';
    }

    const body = { avatar_url: characters[this_chid].avatar };
    const response = await fetch('/api/characters/duplicate', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify(body),
    });

    if (response.ok) {
        toastr.success(t`Character Duplicated`);
        const data = await response.json();
        await eventSource.emit(event_types.CHARACTER_DUPLICATED, { oldAvatar: body.avatar_url, newAvatar: data.path });
        await getCharacters();
    }

    return '';
}

export function getCharacterSource(chId = this_chid) {
    const character = characters[chId];

    if (!character) {
        return '';
    }

    const chubId = characters[chId]?.data?.extensions?.chub?.full_path;
    if (chubId) {
        return `https://chub.ai/characters/${chubId}`;
    }

    const pygmalionId = characters[chId]?.data?.extensions?.pygmalion_id;
    if (pygmalionId) {
        return `https://pygmalion.chat/${pygmalionId}`;
    }

    const githubRepo = characters[chId]?.data?.extensions?.github_repo;
    if (githubRepo) {
        return `https://github.com/${githubRepo}`;
    }

    const sourceUrl = characters[chId]?.data?.extensions?.source_url;
    if (sourceUrl) {
        return sourceUrl;
    }

    const risuId = characters[chId]?.data?.extensions?.risuai?.source;
    if (Array.isArray(risuId) && risuId.length && typeof risuId[0] === 'string' && risuId[0].startsWith('risurealm:')) {
        const realmId = risuId[0].split(':')[1];
        return `https://realm.risuai.net/character/${realmId}`;
    }

    const perchanceSlug = characters[chId]?.data?.extensions?.perchance_data?.slug;
    if (perchanceSlug) {
        return `https://perchance.org/ai-character-chat?data=${perchanceSlug}`;
    }

    return '';
}

export async function getCharacters() {
    if (!setCharacterIdImpl) {
        throwUnbound('setCharacterId');
    }
    if (!selectCharacterByIdImpl) {
        throwUnbound('selectCharacterById');
    }

    const response = await fetch('/api/characters/all', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({}),
    });

    if (response.ok) {
        const previousAvatar = this_chid !== undefined ? characters[this_chid]?.avatar : null;
        characters.splice(0, characters.length);
        const getData = await response.json();
        for (let i = 0; i < getData.length; i++) {
            characters[i] = getData[i];
            characters[i].name = DOMPurify.sanitize(characters[i].name);

            if (!characters[i].chat) {
                characters[i].chat = `${characters[i].name} - ${humanizedDateTime()}`;
            }

            characters[i].chat = String(characters[i].chat);
        }

        if (previousAvatar) {
            const newCharacterId = characters.findIndex(x => x.avatar === previousAvatar);
            if (newCharacterId >= 0) {
                setCharacterIdImpl(newCharacterId);
                await selectCharacterByIdImpl(newCharacterId, { switchMenu: false });
            } else {
                await Popup.show.text(t`ERROR: The active character is no longer available.`, t`The page will be refreshed to prevent data loss. Press "OK" to continue.`);
                return location.reload();
            }
        }

        await getGroups();
        await printCharacters(true);
    } else {
        console.error('Failed to fetch characters:', response.statusText);
        const errorData = await response.json();
        if (errorData?.overflow) {
            await Popup.show.text(t`Character data length limit reached`, t`To resolve this, set "performance.lazyLoadCharacters" to "true" in config.yaml and restart the server.`);
        }
    }
}

/**
 * Returns the character card fields for the current character.
 * @param {object} [options]
 * @param {number} [options.chid] Optional character index
 * @returns {{
 *   system: string,
 *   mesExamples: string,
 *   description: string,
 *   personality: string,
 *   persona: string,
 *   scenario: string,
 *   jailbreak: string,
 *   version: string,
 *   charDepthPrompt: string,
 *   creatorNotes: string,
 * }}
 */
export function getCharacterCardFields({ chid = null } = {}) {
    const currentChid = chid ?? this_chid;

    const result = {
        system: '',
        mesExamples: '',
        description: '',
        personality: '',
        persona: '',
        scenario: '',
        jailbreak: '',
        version: '',
        charDepthPrompt: '',
        creatorNotes: '',
    };
    result.persona = baseChatReplace(power_user.persona_description?.trim(), name1, name2);

    const character = characters[currentChid];
    if (!character) {
        return result;
    }

    const scenarioText = chat_metadata.scenario || character.scenario || '';
    result.description = baseChatReplace(character.description?.trim(), name1, name2);
    result.personality = baseChatReplace(character.personality?.trim(), name1, name2);
    result.scenario = baseChatReplace(scenarioText.trim(), name1, name2);
    result.mesExamples = baseChatReplace(character.mes_example?.trim(), name1, name2);
    result.system = power_user.prefer_character_prompt ? baseChatReplace(character.data?.system_prompt?.trim(), name1, name2) : '';
    result.jailbreak = power_user.prefer_character_jailbreak ? baseChatReplace(character.data?.post_history_instructions?.trim(), name1, name2) : '';
    result.version = character.data?.character_version ?? '';
    result.charDepthPrompt = baseChatReplace(character.data?.extensions?.depth_prompt?.prompt?.trim(), name1, name2);
    result.creatorNotes = baseChatReplace(character.data?.creator_notes?.trim(), name1, name2);

    if (selected_group) {
        const groupCards = getGroupCharacterCards(selected_group, Number(currentChid));
        if (groupCards) {
            result.description = groupCards.description;
            result.personality = groupCards.personality;
            result.scenario = groupCards.scenario;
            result.mesExamples = groupCards.mesExamples;
        }
    }

    return result;
}

/**
 * Imports tags for the given characters.
 * @param {string[]} avatarFileNames Character avatar filenames whose tags are to import
 */
export async function importCharactersTags(avatarFileNames) {
    await getCharacters();
    for (let i = 0; i < avatarFileNames.length; i++) {
        if (power_user.tag_import_setting !== tag_import_setting.NONE) {
            const importedCharacter = characters.find(character => character.avatar === avatarFileNames[i]);
            await importTags(importedCharacter);
        }
    }
}

/**
 * Selects the given imported character in the right menu.
 * @param {string} charId Character avatar key to select
 */
export function selectImportedChar(charId) {
    if (!selectRmInfoImpl) {
        throwUnbound('select_rm_info');
    }

    let oldSelectedChar = null;
    if (this_chid !== undefined) {
        oldSelectedChar = characters[this_chid].avatar;
    }

    selectRmInfoImpl('char_import_no_toast', charId, oldSelectedChar);
}

/**
 * Imports a character from a file.
 * @param {File} file File to import
 * @param {object} [options] Options
 * @param {string} [options.preserveFileName] Whether to preserve original file name
 * @param {boolean} [options.importTags=false] Whether to import tags for the new character
 * @returns {Promise<string|undefined>}
 */
export async function importCharacter(file, { preserveFileName = '', importTags = false } = {}) {
    if (is_group_generating || is_send_press) {
        toastr.error(t`Cannot import characters while generating. Stop the request and try again.`, t`Import aborted`);
        throw new Error('Cannot import character while generating');
    }

    const ext = file.name.match(/\.(\w+)$/);
    if (!ext || !(['json', 'png', 'yaml', 'yml', 'charx', 'byaf'].includes(ext[1].toLowerCase()))) {
        return;
    }

    const format = ext[1].toLowerCase();
    $('#character_import_file_type').val(format);
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('file_type', format);
    if (preserveFileName) {
        formData.append('preserved_name', preserveFileName);
    }

    try {
        const result = await fetch('/api/characters/import', {
            method: 'POST',
            body: formData,
            headers: getRequestHeaders({ omitContentType: true }),
            cache: 'no-cache',
        });

        if (!result.ok) {
            throw new Error(`Failed to import character: ${result.statusText}`);
        }

        const data = await result.json();
        if (data.error) {
            throw new Error(`Server returned an error: ${data.error}`);
        }

        if (data.file_name !== undefined) {
            $('#character_search_bar').val('').trigger('input');

            toastr.success(t`Character Created: ${String(data.file_name).replace('.png', '')}`);
            const avatarFileName = `${data.file_name}.png`;
            if (importTags) {
                await importCharactersTags([avatarFileName]);
                selectImportedChar(data.file_name);
            }
            return avatarFileName;
        }
    } catch (error) {
        console.error('Error importing character', error);
        toastr.error(t`The file is likely invalid or corrupted.`, t`Could not import character`);
    }
}

/**
 * Imports supported character files dropped into the app window.
 * @param {File[]} files Array of files to process
 * @param {Map<File, string>} [data] Extra data to pass to the import function
 * @returns {Promise<void>}
 */
export async function processDroppedFiles(files, data = new Map()) {
    const allowedMimeTypes = [
        'application/json',
        'image/png',
        'application/yaml',
        'application/x-yaml',
        'text/yaml',
        'text/x-yaml',
    ];

    const allowedExtensions = [
        'charx',
        'byaf',
    ];

    const avatarFileNames = [];
    for (const file of files) {
        const extension = file.name.split('.').pop().toLowerCase();
        if (allowedMimeTypes.some(x => file.type.startsWith(x)) || allowedExtensions.includes(extension)) {
            const preservedName = data instanceof Map && data.get(file);
            const avatarFileName = await importCharacter(file, { preserveFileName: preservedName });
            if (avatarFileName !== undefined) {
                avatarFileNames.push(avatarFileName);
            }
        } else {
            toastr.warning(t`Unsupported file type: ` + file.name);
        }
    }

    if (avatarFileNames.length > 0) {
        await importCharactersTags(avatarFileNames);
        selectImportedChar(avatarFileNames[avatarFileNames.length - 1]);
    }
}

export function doCharListDisplaySwitch() {
    power_user.charListGrid = !power_user.charListGrid;
    document.body.classList.toggle('charListGrid', power_user.charListGrid);
    saveSettingsDebounced();
}

export function initCharacterSearch() {
    const debouncedCharacterSearch = debounce((searchQuery) => {
        entitiesFilter.setFilterData(FILTER_TYPES.SEARCH, searchQuery);
    });

    const searchForm = $('#form_character_search_form');
    const searchInput = $('#character_search_bar');
    const searchButton = $('#rm_button_search');

    const storageKey = 'characterSearchFormVisible';

    searchInput.on('input', function () {
        const searchQuery = String($(this).val());
        debouncedCharacterSearch(searchQuery);
    });

    searchButton.on('click', function () {
        const newVisibility = !searchForm.is(':visible');
        searchForm.toggle(newVisibility);
        searchButton.toggleClass('active', newVisibility);
        accountStorage.setItem(storageKey, String(newVisibility));
        if (newVisibility) {
            searchInput.trigger('focus');
        }
    });

    eventSource.on(event_types.APP_READY, () => {
        const isVisible = accountStorage.getItem(storageKey) === 'true';
        searchForm.toggle(isVisible);
        searchButton.toggleClass('active', isVisible);
    });
}

export function initCharacterEditorBindings() {
    $('#character_name_pole').on('input', function () {
        if (menu_type == 'create') {
            create_save.name = String($('#character_name_pole').val());
        }
    });

    const elementsToUpdate = {
        '#description_textarea': function () { create_save.description = String($('#description_textarea').val()); },
        '#creator_notes_textarea': function () { create_save.creator_notes = String($('#creator_notes_textarea').val()); },
        '#character_version_textarea': function () { create_save.character_version = String($('#character_version_textarea').val()); },
        '#system_prompt_textarea': function () { create_save.system_prompt = String($('#system_prompt_textarea').val()); },
        '#post_history_instructions_textarea': function () { create_save.post_history_instructions = String($('#post_history_instructions_textarea').val()); },
        '#creator_textarea': function () { create_save.creator = String($('#creator_textarea').val()); },
        '#tags_textarea': function () { create_save.tags = String($('#tags_textarea').val()); },
        '#personality_textarea': function () { create_save.personality = String($('#personality_textarea').val()); },
        '#scenario_pole': function () { create_save.scenario = String($('#scenario_pole').val()); },
        '#mes_example_textarea': function () { create_save.mes_example = String($('#mes_example_textarea').val()); },
        '#firstmessage_textarea': function () { create_save.first_message = String($('#firstmessage_textarea').val()); },
        '#talkativeness_slider': function () { create_save.talkativeness = Number($('#talkativeness_slider').val()); },
        '#depth_prompt_prompt': function () { create_save.depth_prompt_prompt = String($('#depth_prompt_prompt').val()); },
        '#depth_prompt_depth': function () { create_save.depth_prompt_depth = Number($('#depth_prompt_depth').val()); },
        '#depth_prompt_role': function () { create_save.depth_prompt_role = String($('#depth_prompt_role').val()); },
    };

    Object.keys(elementsToUpdate).forEach(function (id) {
        $(id).on('input', function () {
            if (menu_type == 'create') {
                elementsToUpdate[id]();
            } else {
                saveCharacterDebounced();
            }
        });
    });

    $('#favorite_button').on('click', function () {
        updateFavButtonState(!fav_ch_checked);
        if (menu_type != 'create') {
            saveCharacterDebounced();
        }
    });
}

export function initCharacterImportExportBindings({ exportPopper } = {}) {
    $('#character_import_button').on('click', function () {
        $('#character_import_file').trigger('click');
    });

    $('#character_import_file').on('change', async function (e) {
        $('#rm_info_avatar').html('');

        if (!(e.target instanceof HTMLInputElement)) {
            return;
        }

        if (!e.target.files.length) {
            return;
        }

        const avatarFileNames = [];
        for (const file of e.target.files) {
            const avatarFileName = await importCharacter(file);
            if (avatarFileName !== undefined) {
                avatarFileNames.push(avatarFileName);
            }
        }

        if (avatarFileNames.length > 0) {
            await importCharactersTags(avatarFileNames);
            selectImportedChar(avatarFileNames[avatarFileNames.length - 1]);
        }

        e.target.value = '';
    });

    $('#export_button').on('click', function () {
        isExportPopupOpen = !isExportPopupOpen;
        $('#export_format_popup').toggle(isExportPopupOpen);
        exportPopper?.update();
    });

    $(document).on('click', '.export_format', async function () {
        const format = $(this).data('format');

        if (!format) {
            return;
        }

        $('#export_format_popup').hide();
        isExportPopupOpen = false;
        exportPopper?.update();

        await createOrEditCharacter();
        const body = { format, avatar_url: characters[this_chid].avatar };

        const response = await fetch('/api/characters/export', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const filename = characters[this_chid].avatar.replace('.png', `.${format}`);
            const blob = await response.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.setAttribute('download', filename);
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(a.href);
            document.body.removeChild(a);
        }
    });

    $('html').on('touchstart mousedown', async function (e) {
        const clickTarget = $(e.target);

        if (isExportPopupOpen
            && clickTarget.closest('#export_button').length == 0
            && clickTarget.closest('#export_format_popup').length == 0) {
            $('#export_format_popup').hide();
            isExportPopupOpen = false;
            exportPopper?.update();
        }
    });
}

export function initCharacterDeleteBinding() {
    $('#delete_button').on('click', async function () {
        if (this_chid === undefined || !characters[this_chid]) {
            toastr.warning('No character selected.');
            return;
        }

        let deleteChats = false;

        const confirm = await Popup.show.confirm(t`Delete the character?`, await renderTemplateAsync('deleteConfirm'), {
            onClose: () => { deleteChats = !!$('#del_char_checkbox').prop('checked'); },
        });
        if (!confirm) {
            return;
        }

        await deleteCharacter(characters[this_chid].avatar, { deleteChats });
    });
}

export function initCharacterPanelBindings() {
    $(document).on('click', '.open_alternate_greetings', openAlternateGreetings);

    $('#charListGridToggle').on('click', async () => {
        doCharListDisplaySwitch();
    });

    $('#hideCharPanelAvatarButton').on('click', () => {
        $('#avatar-and-name-block').slideToggle();
    });
}

export function toggleAdvancedCharacterPopup() {
    if (!isAdvancedCharOpen) {
        isAdvancedCharOpen = true;
        $('#character_popup').css({ display: 'flex', opacity: 0.0 }).addClass('open');
        $('#character_popup').transition({
            opacity: 1.0,
            duration: animation_duration,
            easing: animation_easing,
        });
    } else {
        closeAdvancedCharacterPopup({ animate: false });
    }
}

export function closeAdvancedCharacterPopup({ animate = true } = {}) {
    isAdvancedCharOpen = false;

    if (!animate) {
        $('#character_popup').css('display', 'none').removeClass('open');
        return;
    }

    $('#character_popup').transition({
        opacity: 0,
        duration: animation_duration,
        easing: animation_easing,
    });
    setTimeout(() => {
        $('#character_popup').css('display', 'none').removeClass('open');
    }, animation_duration);
}

export function groupToEntity(...args) {
    return groupToEntityInternal(...args);
}

export function printCharacters(...args) {
    return printCharactersInternal(...args);
}

export function updateFavButtonState(state) {
    fav_ch_checked = Boolean(state);
    $('#fav_checkbox').prop('checked', fav_ch_checked);
    $('#favorite_button').toggleClass('fav_on', fav_ch_checked);
    $('#favorite_button').toggleClass('fav_off', !fav_ch_checked);
}

export function tagToEntity(tag) {
    return { item: structuredClone(tag), id: tag.id, type: 'tag', entities: [] };
}

export function getEntitiesList({ doFilter = false, doSort = true } = {}) {
    let entities = [
        ...characters.map((item, index) => characterToEntity(item, index)),
        ...groups.map(item => groupToEntityInternal(item)),
        ...(power_user.bogus_folders ? tags.filter(isBogusFolder).sort(compareTagsForSort).map(item => tagToEntity(item)) : []),
    ];

    if (doFilter) {
        entities = filterByTagState(entities);
    }

    for (const entity of entities) {
        if (entity.type === 'tag') {
            let subEntities = filterByTagState(entities, { subForEntity: entity, filterHidden: false });
            const subCount = subEntities.length;
            subEntities = filterByTagState(entities, { subForEntity: entity });
            if (doFilter) {
                subEntities = entitiesFilter.applyFilters(subEntities, { clearScoreCache: false, tempOverrides: { [FILTER_TYPES.FOLDER]: FILTER_STATES.UNDEFINED }, clearFuzzySearchCaches: false });
            }
            if (doSort) {
                sortEntitiesList(subEntities, false);
            }
            entity.entities = subEntities;
            entity.hidden = subCount - subEntities.length;
        }
    }

    if (doFilter) {
        const beforeFinalEntities = filterByTagState(entities, { globalDisplayFilters: true });
        entities = entitiesFilter.applyFilters(beforeFinalEntities, { clearFuzzySearchCaches: false });

        if (isFilterState(entitiesFilter.getFilterData(FILTER_TYPES.FOLDER), FILTER_STATES.SELECTED) && entities.filter(x => x.type == 'tag').length == 0) {
            entities = entitiesFilter.applyFilters(beforeFinalEntities, { tempOverrides: { [FILTER_TYPES.FOLDER]: FILTER_STATES.UNDEFINED }, clearFuzzySearchCaches: false });
        }
    }

    const nonTagEntitiesCount = entities.filter(entity => entity.type !== 'tag').length;
    for (const entity of entities) {
        if (entity.type === 'tag' && entity.entities?.length == nonTagEntitiesCount) {
            entity.isUseless = true;
        }
    }

    if (doSort) {
        sortEntitiesList(entities, false);
    }
    entitiesFilter.clearFuzzySearchCaches();
    return entities;
}

export async function renameCharacter(name = null, { silent = false, renameChats = null } = {}) {
    if (!name && silent) {
        toastr.warning(t`No character name provided.`, t`Rename Character`);
        return false;
    }
    if (this_chid === undefined) {
        toastr.warning(t`No character selected.`, t`Rename Character`);
        return false;
    }
    if (!getPastCharacterChatsImpl) {
        throwUnbound('getPastCharacterChats');
    }
    if (!selectCharacterByIdImpl) {
        throwUnbound('selectCharacterById');
    }
    if (!reloadCurrentChatImpl) {
        throwUnbound('reloadCurrentChat');
    }
    if (!renameGroupMemberImpl) {
        throwUnbound('renameGroupMember');
    }
    if (!setCharacterIdImpl) {
        throwUnbound('setCharacterId');
    }

    const oldAvatar = characters[this_chid].avatar;
    const newValue = name || await callGenericPopup('<h3>' + t`New name:` + '</h3>', POPUP_TYPE.INPUT, characters[this_chid].name);

    if (!newValue) {
        toastr.warning(t`No character name provided.`, t`Rename Character`);
        return false;
    }
    if (newValue === characters[this_chid].name) {
        toastr.info(t`Same character name provided, so name did not change.`, t`Rename Character`);
        return false;
    }

    const body = JSON.stringify({ avatar_url: oldAvatar, new_name: newValue });
    const response = await fetch('/api/characters/rename', {
        method: 'POST',
        headers: getRequestHeaders(),
        body,
    });

    try {
        if (!response.ok) {
            throw new Error('Could not rename the character');
        }

        const data = await response.json();
        const newAvatar = data.avatar;
        const oldName = getCharaFilename(null, { manualAvatarKey: oldAvatar });
        const newName = getCharaFilename(null, { manualAvatarKey: newAvatar });

        renameTagKey(oldAvatar, newAvatar);

        const charLore = world_info.charLore?.find(x => x.name == oldName);
        if (charLore) {
            charLore.name = newName;
            saveSettingsDebounced();
        }

        const charNote = extension_settings.note.chara?.find(x => x.name == oldName);
        if (charNote) {
            charNote.name = newName;
            saveSettingsDebounced();
        }

        if (getActiveCharacterImpl?.() === oldAvatar) {
            setActiveCharacterImpl?.(newAvatar);
            saveSettingsDebounced();
        }

        await eventSource.emit(event_types.CHARACTER_RENAMED, oldAvatar, newAvatar);

        setCharacterIdImpl(undefined);
        await getCharacters();

        const newChId = characters.findIndex(c => c.avatar == data.avatar);
        if (newChId === -1) {
            throw new Error('Newly renamed character was lost?');
        }

        await selectCharacterByIdImpl(newChId);
        await delay(1);

        if (this_chid === undefined) {
            throw new Error('New character not selected');
        }

        await renameGroupMemberImpl(oldAvatar, newAvatar, newValue);

        const renamePastChatsConfirm = renameChats !== null
            ? renameChats
            : silent
                ? false
                : await Popup.show.confirm(
                    t`Character renamed!`,
                    `<p>${t`Past chats will still contain the old character name. Would you like to update the character name in previous chats as well?`}</p>
                    <i><b>${t`Sprites folder (if any) should be renamed manually.`}</b></i>`,
                ) == POPUP_RESULT.AFFIRMATIVE;

        if (renamePastChatsConfirm) {
            await renamePastChats(oldAvatar, newAvatar, newValue);
            await reloadCurrentChatImpl();
            toastr.success(t`Character renamed and past chats updated!`, t`Rename Character`);
        } else {
            toastr.success(t`Character renamed!`, t`Rename Character`);
        }
    } catch (error) {
        if (!silent) {
            await Popup.show.text(t`Rename Character`, t`Something went wrong. The page will be reloaded.`);
        } else {
            toastr.error(t`Something went wrong. The page will be reloaded.`, t`Rename Character`);
        }

        console.log('Renaming character error:', error);
        location.reload();
        return false;
    }

    return true;
}

async function renamePastChats(oldAvatar, newAvatar, newName) {
    const pastChats = await getPastCharacterChatsImpl();

    for (const { file_name } of pastChats) {
        try {
            const fileNameWithoutExtension = file_name.replace('.jsonl', '');
            const getChatResponse = await fetch('/api/chats/get', {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify({
                    ch_name: newName,
                    file_name: fileNameWithoutExtension,
                    avatar_url: newAvatar,
                }),
                cache: 'no-cache',
            });

            if (getChatResponse.ok) {
                const currentChat = await getChatResponse.json();

                for (const message of currentChat) {
                    if (message.is_user || message.is_system || message.extra?.type == system_message_types.NARRATOR) {
                        continue;
                    }

                    if (message.name !== undefined) {
                        message.name = newName;
                    }
                }

                await eventSource.emit(event_types.CHARACTER_RENAMED_IN_PAST_CHAT, currentChat, oldAvatar, newAvatar);

                const saveChatResponse = await fetch('/api/chats/save', {
                    method: 'POST',
                    headers: getRequestHeaders(),
                    body: JSON.stringify({
                        ch_name: newName,
                        file_name: fileNameWithoutExtension,
                        chat: currentChat,
                        avatar_url: newAvatar,
                    }),
                    cache: 'no-cache',
                });

                if (!saveChatResponse.ok) {
                    throw new Error('Could not save chat');
                }
            }
        } catch (error) {
            toastr.error(t`Past chat could not be updated: ${file_name}`);
            console.error(error);
        }
    }
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
    await getCharacters();
    await printMessagesImpl();
    saveSettingsDebouncedImpl();
    await eventSource.emit(event_types.CHAT_CHANGED, getCurrentChatIdImpl());
}

function groupToEntityInternal(group) {
    return { item: group, id: group.id, type: 'group' };
}

function getBackBlock() {
    return $('#bogus_folder_back_template .bogus_folder_select').clone();
}

async function getEmptyBlock() {
    const icons = ['fa-dragon', 'fa-otter', 'fa-kiwi-bird', 'fa-crow', 'fa-frog'];
    const texts = [t`Here be dragons`, t`Otterly empty`, t`Kiwibunga`, t`Pump-a-Rum`, t`Croak it`];
    const roll = new Date().getMinutes() % icons.length;
    const emptyBlock = await renderTemplateAsync('emptyBlock', { text: texts[roll], icon: icons[roll] });
    return $(emptyBlock);
}

async function getHiddenBlock(hidden) {
    const hiddenBlock = await renderTemplateAsync('hiddenBlock', {
        text: (hidden > 1 ? t`${hidden} characters hidden.` : t`${hidden} character hidden.`),
    });
    return $(hiddenBlock);
}

function getCharacterBlock(item, id) {
    const avatarUrl = item.avatar != 'none' ? getThumbnailUrl('avatar', item.avatar) : default_avatar;
    const template = $('#character_template .character_select').clone();
    template.attr({ 'data-chid': id, id: `CharID${id}` });
    template.find('img').attr('src', avatarUrl).attr('alt', item.name);
    template.find('.avatar').attr('title', `[Character] ${item.name}\nFile: ${item.avatar}`);
    template.find('.ch_name').text(item.name).attr('title', `[Character] ${item.name}`);
    if (power_user.show_card_avatar_urls) {
        template.find('.ch_avatar_url').text(item.avatar);
    }
    template.find('.ch_fav_icon').css('display', 'none');
    template.toggleClass('is_fav', item.fav || item.fav == 'true');
    template.find('.ch_fav').val(item.fav);

    if (item.avatar !== getPermanentAssistantAvatar()) {
        template.find('.ch_assistant').remove();
    }

    const description = item.data?.creator_notes || '';
    if (description) {
        template.find('.ch_description').text(description);
    } else {
        template.find('.ch_description').hide();
    }

    const auxFieldName = power_user.aux_field || 'character_version';
    const auxFieldValue = (item.data && item.data[auxFieldName]) || '';
    if (auxFieldValue) {
        template.find('.character_version').text(auxFieldValue);
    } else {
        template.find('.character_version').hide();
    }

    printTagList(template.find('.tags'), { forEntityOrKey: id, tagOptions: { isCharacterList: true } });
    return template;
}

async function printCharactersInternal(fullRefresh = false) {
    const storageKey = 'Characters_PerPage';
    const listId = '#rm_print_characters_block';
    let currentScrollTop = $(listId).scrollTop();

    if (fullRefresh) {
        saveCharactersPage = 0;
        currentScrollTop = 0;
        await delay(1);
    }

    verifyCharactersSearchSortRule();
    printTagFilters(tag_filter_type.character);
    printTagFilters(tag_filter_type.group_member);
    applyTagsOnCharacterSelect();
    applyTagsOnGroupSelect();

    const entities = getEntitiesList({ doFilter: true });
    const pageSize = Number(accountStorage.getItem(storageKey)) || CHARACTER_LIST_PAGE_DEFAULT;
    const sizeChangerOptions = [10, 25, 50, 100, 250, 500, 1000];

    $('#rm_print_characters_pagination').pagination({
        dataSource: entities,
        pageSize,
        pageRange: 1,
        pageNumber: saveCharactersPage || 1,
        position: 'top',
        showPageNumbers: false,
        showSizeChanger: true,
        prevText: '<',
        nextText: '>',
        formatNavigator: PAGINATION_TEMPLATE,
        formatSizeChanger: renderPaginationDropdown(pageSize, sizeChangerOptions),
        showNavigator: true,
        callback: async function (data) {
            $(listId).empty();
            if (power_user.bogus_folders && isBogusFolderOpen()) {
                $(listId).append(getBackBlock());
            }
            if (!data.length) {
                $(listId).append(await getEmptyBlock());
            }

            let displayCount = 0;
            for (const entity of data) {
                switch (entity.type) {
                    case 'character':
                        $(listId).append(getCharacterBlock(entity.item, entity.id));
                        displayCount++;
                        break;
                    case 'group':
                        $(listId).append(getGroupBlock(entity.item));
                        displayCount++;
                        break;
                    case 'tag':
                        $(listId).append(getTagBlock(entity.item, entity.entities, entity.hidden, entity.isUseless));
                        break;
                }
            }

            const hidden = (characters.length + groups.length) - displayCount;
            if (hidden > 0 && entitiesFilter.hasAnyFilter()) {
                $(listId).append(await getHiddenBlock(hidden));
            }

            localizePagination($('#rm_print_characters_pagination'));
            eventSource.emit(event_types.CHARACTER_PAGE_LOADED);
        },
        afterSizeSelectorChange: function (e, size) {
            accountStorage.setItem(storageKey, e.target.value);
            paginationDropdownChangeHandler(e, size);
        },
        afterPaging: function (e) {
            saveCharactersPage = e;
        },
        afterRender: function () {
            $(listId).scrollTop(currentScrollTop);
        },
    });

    favsToHotswap();
    updatePersonaConnectionsAvatarList();
}

function verifyCharactersSearchSortRule() {
    const searchTerm = entitiesFilter.getFilterData(FILTER_TYPES.SEARCH);
    const searchOption = $('#character_sort_order option[data-field="search"]');
    const selector = $('#character_sort_order');
    const isHidden = searchOption.attr('hidden') !== undefined;

    if (searchTerm && isHidden) {
        searchOption.removeAttr('hidden');
        searchOption.prop('selected', true);
        flashHighlight(selector);
    }
    if (!searchTerm && !isHidden) {
        searchOption.attr('hidden', '');
        $(`#character_sort_order option[data-order="${power_user.sort_order}"][data-field="${power_user.sort_field}"]`).prop('selected', true);
    }
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

/**
 * Loads all the data of a shallow character.
 * @param {string|undefined} characterId Array index
 * @returns {Promise<void>} Promise that resolves when the character is unshallowed
 */
export async function unshallowCharacter(characterId) {
    if (characterId === undefined) {
        console.debug('Undefined character cannot be unshallowed');
        return;
    }

    /** @type {import('./char-data.js').v1CharData} */
    const character = characters[characterId];
    if (!character) {
        console.debug('Character not found:', characterId);
        return;
    }

    if (!character.shallow) {
        return;
    }

    const avatar = character.avatar;
    if (!avatar) {
        console.debug('Character has no avatar field:', characterId);
        return;
    }

    await getOneCharacter(avatar);
}

export async function createOrEditCharacter(e) {
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
            await getCharacters();

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

/**
 * Processes the avatar image from the input element, allowing the user to crop it if necessary.
 * @param {HTMLInputElement} input The input element containing the avatar file.
 * @returns {Promise<void>}
 */
export async function read_avatar_load(input) {
    if (!getSelectedButtonImpl) {
        throwUnbound('getSelectedButton');
    }

    if (input.files && input.files[0]) {
        if (getSelectedButtonImpl() == 'create') {
            create_save.avatar = input.files;
        }

        crop_data = undefined;
        const file = input.files[0];
        const fileData = await getBase64Async(file);

        if (!power_user.never_resize_avatars) {
            const dlg = new Popup('Set the crop position of the avatar image', POPUP_TYPE.CROP, '', { cropImage: fileData });
            const croppedImage = await dlg.show();

            if (!croppedImage) {
                return;
            }

            crop_data = dlg.cropData;
            $('#avatar_load_preview').attr('src', String(croppedImage));
        } else {
            $('#avatar_load_preview').attr('src', fileData);
        }

        if (menu_type == 'create') {
            return;
        }

        await createOrEditCharacter();
        await delay(1000);

        const formData = new FormData(/** @type {HTMLFormElement} */ ($('#form_create').get(0)));
        await fetch(getThumbnailUrl('avatar', formData.get('avatar_url').toString()), {
            method: 'GET',
            cache: 'reload',
        });

        const messages = $('.mes').toArray();
        for (const el of messages) {
            const $el = $(el);
            const nameMatch = $el.attr('ch_name') == formData.get('ch_name');
            if ($el.attr('is_system') == 'true' && !nameMatch) continue;
            if ($el.attr('is_user') == 'true') continue;

            if (nameMatch) {
                const previewSrc = $('#avatar_load_preview').attr('src');
                const avatar = $el.find('.avatar img');
                avatar.attr('src', default_avatar);
                await delay(1);
                avatar.attr('src', previewSrc);
            }
        }

        console.log('Avatar refreshed');
    }
}

function updateAlternateGreetingsHintVisibility(root) {
    const numberOfGreetings = root.find('.alternate_greetings_list .alternate_greeting').length;
    $(root).find('.alternate_grettings_hint').toggle(numberOfGreetings == 0);
}

export async function openCharacterWorldPopup() {
    const chid = $('#set_character_world').data('chid');
    if (menu_type != 'create' && chid === undefined) {
        toastr.error('Does not have an Id for this character in world select menu.');
        return;
    }

    const fileName = getCharaFilename(chid);
    const charName = (menu_type == 'create' ? create_save.name : characters[chid]?.data?.name) || 'Nameless';
    const worldId = (menu_type == 'create' ? create_save.world : characters[chid]?.data?.extensions?.world) || '';
    const template = $('#character_world_template .character_world').clone();
    template.find('.character_name').text(charName);

    async function handlePrimaryWorldSelect() {
        const selectedValue = $(this).val();
        const worldIndex = selectedValue !== '' ? Number(selectedValue) : NaN;
        const name = !isNaN(worldIndex) ? world_names[worldIndex] : '';
        const previousValue = $('#character_world').val();
        $('#character_world').val(name);

        console.debug('Character world selected:', name);

        if (menu_type == 'create') {
            create_save.world = name;
        } else {
            if (previousValue && !name) {
                try {
                    const data = JSON.parse(String($('#character_json_data').val()));

                    if (data?.data?.character_book) {
                        data.data.character_book = undefined;
                    }

                    $('#character_json_data').val(JSON.stringify(data));
                    toastr.info(t`Embedded lorebook will be removed from this character.`);
                } catch {
                    console.error('Failed to parse character JSON data.');
                }
            }

            await createOrEditCharacter();
        }

        setWorldInfoButtonClass(undefined, !!name);
    }

    function handleExtrasWorldSelect() {
        const selectedValues = $(this).val();
        const selectedWorlds = Array.isArray(selectedValues) ? selectedValues : [];
        let charLore = world_info.charLore ?? [];
        const tempExtraBooks = selectedWorlds.map((index) => world_names[index]).filter(Boolean);
        const existingCharIndex = charLore.findIndex((e) => e.name === fileName);

        if (menu_type == 'create') {
            create_save.extra_books = tempExtraBooks;
            return;
        }

        if (existingCharIndex === -1) {
            if (tempExtraBooks.length > 0) {
                charLore.push({ name: fileName, extraBooks: tempExtraBooks });
            }
        } else if (tempExtraBooks.length === 0) {
            charLore.splice(existingCharIndex, 1);
        } else {
            charLore[existingCharIndex].extraBooks = tempExtraBooks;
        }

        Object.assign(world_info, { charLore });
        saveSettingsDebounced();
    }

    const primarySelect = template.find('.character_world_info_selector');
    world_names.forEach((item, i) => {
        primarySelect.append(new Option(item, String(i), item === worldId, item === worldId));
    });

    const extrasSelect = template.find('.character_extra_world_info_selector');
    const existingCharLore = world_info.charLore?.find((e) => e.name === fileName);
    world_names.forEach((item, i) => {
        const array = (menu_type == 'create' ? create_save.extra_books : existingCharLore?.extraBooks);
        const isSelected = !!array?.includes(item);
        extrasSelect.append(new Option(item, String(i), isSelected, isSelected));
    });

    const popup = new Popup(template, POPUP_TYPE.TEXT, '', {
        onOpen: function (popup) {
            const popupDialog = $(popup.dlg);

            primarySelect.on('change', handlePrimaryWorldSelect);
            extrasSelect.on('change', handleExtrasWorldSelect);

            if (!isMobile()) {
                extrasSelect.select2({
                    width: '100%',
                    placeholder: t`No auxiliary Lorebooks set. Click here to select.`,
                    allowClear: true,
                    closeOnSelect: false,
                    dropdownParent: popupDialog,
                });
            }
        },
    });

    await popup.show();
}

function addAlternateGreeting(template, greeting, index, getArray, popup) {
    const greetingBlock = $('#alternate_greeting_form_template .alternate_greeting').clone();
    greetingBlock.find('.alternate_greeting_text')
        .attr('id', `alternate_greeting_${index}`)
        .on('input', async function () {
            const value = $(this).val();
            const array = getArray();
            array[index] = value;
        }).val(greeting);
    greetingBlock.find('.editor_maximize').attr('data-for', `alternate_greeting_${index}`);
    greetingBlock.find('.greeting_index').text(index + 1);
    greetingBlock.find('.delete_alternate_greeting').on('click', async function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (confirm(t`Are you sure you want to delete this alternate greeting?`)) {
            const array = getArray();
            array.splice(index, 1);

            await popup.complete(POPUP_RESULT.AFFIRMATIVE);
            openAlternateGreetings();
        }
    });
    template.find('.alternate_greetings_list').append(greetingBlock);
}

export function openAlternateGreetings() {
    const chid = $('.open_alternate_greetings').data('chid');

    if (menu_type != 'create' && chid === undefined) {
        toastr.error('Does not have an Id for this character in editor menu.');
        return;
    } else if (characters[chid] && !Array.isArray(characters[chid].data.alternate_greetings)) {
        characters[chid].data.alternate_greetings = [];
    }

    const template = $('#alternate_greetings_template .alternate_grettings').clone();
    const getArray = () => menu_type == 'create' ? create_save.alternate_greetings : characters[chid].data.alternate_greetings;
    const popup = new Popup(template, POPUP_TYPE.TEXT, '', {
        wide: true,
        large: true,
        allowVerticalScrolling: true,
        onClose: async () => {
            if (menu_type !== 'create') {
                await createOrEditCharacter();
            }
        },
    });

    for (let index = 0; index < getArray().length; index++) {
        addAlternateGreeting(template, getArray()[index], index, getArray, popup);
    }

    template.find('.add_alternate_greeting').on('click', function () {
        const array = getArray();
        const index = array.length;
        array.push('');
        addAlternateGreeting(template, '', index, getArray, popup);
        updateAlternateGreetingsHintVisibility(template);
    });

    popup.show();
    updateAlternateGreetingsHintVisibility(template);
}

export { getRequestHeaders };
