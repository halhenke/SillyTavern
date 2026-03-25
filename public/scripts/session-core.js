import { isChatSaving, menu_type, setMenuType } from './app-state-core.js';
import { characters, create_save, depth_prompt_depth_default, depth_prompt_role_default, getRequestHeaders, talkativeness_default, updateFavButtonState } from './character-core.js';
import { chat_metadata, default_avatar, getCurrentChatId, name2, setCharacterId as setChatCharacterId, setCharacterName as setChatCharacterName, this_chid, syncChatMetadata, syncName2, syncThisChid } from './chat-core.js';
import { chat, clearChat, getChat, getCurrentChatDetails, reloadCurrentChat, saveChatConditional, systemUserName } from './chat-operations-core.js';
import { Generate } from './generation-core.js';
import { t } from './i18n.js';
import { hideLoader, showLoader } from './loader.js';
import { editedMessageId } from './message-core.js';
import { getThumbnailUrl } from './network-core.js';
import { POPUP_TYPE, callGenericPopup } from './popup.js';
import { humanizedDateTime } from './RossAscends-mods.js';
import { saveSettingsDebounced } from './settings-core.js';
import { SAFETY_CHAT } from './system-messages.js';
import { animation_duration, animation_easing, is_send_press } from './ui-core.js';
import { accountStorage } from './util/AccountStorage.js';
import { delay, equalsIgnoreCaseAndAccents, flashHighlight, waitUntilCondition } from './utils.js';
import { debounce_timeout } from './constants.js';

let cancelTtsPlayImpl = null;
let checkEmbeddedWorldImpl = null;
let createNewGroupChatImpl = null;
let deleteCharacterChatByNameImpl = null;
let deleteGroupChatImpl = null;
let delChatImpl = null;
let doNavbarIconClickImpl = null;
let formatCreatorNotesImpl = null;
let getEntitiesListImpl = null;
let getCharactersPerPageDefaultImpl = null;
let getContinueOnSendImpl = null;
let getSelectedGroupImpl = null;
let getSelectedButtonImpl = null;
let getSystemMessageByTypeImpl = null;
let hasPendingFileAttachmentImpl = null;
let isExternalMediaAllowedImpl = null;
let isExecutingCommandsFromChatInputImpl = null;
let openPermanentAssistantChatImpl = null;
let printCharactersImpl = null;
let readAvatarLoadImpl = null;
let renameGroupChatImpl = null;
let saveCharacterEditsImpl = null;
let selectCharacterByIdImpl = null;
let sendSystemMessageImpl = null;
let setWorldInfoButtonClassImpl = null;
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

let importFlashTimeout = null;

function throwUnbound(name) {
    throw new Error(`[session-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy session/orchestration implementations to standalone wrappers.
 * @param {{
 *   cancelTtsPlay: (...args: any[]) => any,
 *   checkEmbeddedWorld: (...args: any[]) => any,
 *   createNewGroupChat: (...args: any[]) => Promise<any>,
 *   deleteCharacterChatByName: (...args: any[]) => Promise<any>,
 *   deleteGroupChat: (...args: any[]) => Promise<any>,
 *   delChat: (...args: any[]) => Promise<any>,
 *   doNavbarIconClick: (...args: any[]) => Promise<any>,
 *   formatCreatorNotes: (...args: any[]) => any,
 *   getContinueOnSend: () => boolean,
 *   getEntitiesList: (...args: any[]) => any,
 *   getCharactersPerPageDefault: () => number,
 *   getSelectedGroup: () => string|null|undefined,
 *   getSelectedButton: () => string,
 *   getSystemMessageByType: (...args: any[]) => any,
 *   hasPendingFileAttachment: () => boolean,
 *   isExternalMediaAllowed: () => boolean,
 *   isExecutingCommandsFromChatInput: () => boolean,
 *   openPermanentAssistantChat: (...args: any[]) => Promise<any>,
 *   printCharacters: (...args: any[]) => any,
 *   readAvatarLoad: (...args: any[]) => Promise<any>,
 *   renameGroupChat: (...args: any[]) => Promise<any>,
 *   saveCharacterEdits: (...args: any[]) => Promise<any>,
 *   selectCharacterById: (...args: any[]) => Promise<any>,
 *   sendSystemMessage: (...args: any[]) => any,
 *   setWorldInfoButtonClass: (...args: any[]) => any,
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
    checkEmbeddedWorldImpl = impl?.checkEmbeddedWorld ?? null;
    createNewGroupChatImpl = impl?.createNewGroupChat ?? null;
    deleteCharacterChatByNameImpl = impl?.deleteCharacterChatByName ?? null;
    deleteGroupChatImpl = impl?.deleteGroupChat ?? null;
    delChatImpl = impl?.delChat ?? null;
    doNavbarIconClickImpl = impl?.doNavbarIconClick ?? null;
    formatCreatorNotesImpl = impl?.formatCreatorNotes ?? null;
    getContinueOnSendImpl = impl?.getContinueOnSend ?? null;
    getEntitiesListImpl = impl?.getEntitiesList ?? null;
    getCharactersPerPageDefaultImpl = impl?.getCharactersPerPageDefault ?? null;
    getSelectedGroupImpl = impl?.getSelectedGroup ?? null;
    getSelectedButtonImpl = impl?.getSelectedButton ?? null;
    getSystemMessageByTypeImpl = impl?.getSystemMessageByType ?? null;
    hasPendingFileAttachmentImpl = impl?.hasPendingFileAttachment ?? null;
    isExternalMediaAllowedImpl = impl?.isExternalMediaAllowed ?? null;
    isExecutingCommandsFromChatInputImpl = impl?.isExecutingCommandsFromChatInput ?? null;
    openPermanentAssistantChatImpl = impl?.openPermanentAssistantChat ?? null;
    printCharactersImpl = impl?.printCharacters ?? null;
    readAvatarLoadImpl = impl?.readAvatarLoad ?? null;
    renameGroupChatImpl = impl?.renameGroupChat ?? null;
    saveCharacterEditsImpl = impl?.saveCharacterEdits ?? null;
    selectCharacterByIdImpl = impl?.selectCharacterById ?? null;
    sendSystemMessageImpl = impl?.sendSystemMessage ?? null;
    setWorldInfoButtonClassImpl = impl?.setWorldInfoButtonClass ?? null;
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
    if (!saveCharacterEditsImpl) {
        throwUnbound('saveCharacterEdits');
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
    await saveCharacterEditsImpl({ isNewChat: true });
    if (deleteCurrentChat && chatFileForDelete) {
        await delChatImpl(`${chatFileForDelete}.jsonl`);
    }
}

export async function handleDeleteChat(chatFile, group, { fromSlashCommand = false } = {}) {
    if (group && !deleteGroupChatImpl) {
        throwUnbound('deleteGroupChat');
    }
    if (!group && !delChatImpl) {
        throwUnbound('delChat');
    }

    $('#select_chat_cross').trigger('click');
    showLoader();

    if (group) {
        await deleteGroupChatImpl(group, chatFile);
    } else {
        await delChatImpl(chatFile);
    }

    if (fromSlashCommand) {
        $('#options').hide();
        hideLoader();
        return;
    }

    setTimeout(function () {
        $('#option_select_chat').trigger('click');
        $('#options').hide();
        hideLoader();
    }, 2000);
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
    if (!saveCharacterEditsImpl) {
        throwUnbound('saveCharacterEdits');
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
            await saveCharacterEditsImpl();
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

function flashEntityListEntry({ lookupValue, lookup, selector, selectElement, missingLabel }) {
    if (!getEntitiesListImpl) {
        throwUnbound('getEntitiesList');
    }
    if (!getCharactersPerPageDefaultImpl) {
        throwUnbound('getCharactersPerPageDefault');
    }

    const entries = getEntitiesListImpl({ doFilter: true });
    const index = lookup(entries);

    if (index === -1) {
        console.log(`Could not find ${missingLabel} ${lookupValue} in the list`);
        return;
    }

    try {
        const perPage = Number(accountStorage.getItem('Characters_PerPage')) || getCharactersPerPageDefaultImpl();
        const page = Math.floor(index / perPage) + 1;
        $('#rm_print_characters_pagination').pagination('go', page);

        waitUntilCondition(() => document.querySelector(selector) !== null).then(() => {
            const element = selectElement(selector);

            if (element.length === 0) {
                console.log(`Could not find element for ${missingLabel} ${lookupValue}`);
                return;
            }

            const scrollOffset = element.offset().top - element.parent().offset().top;
            element.parent().scrollTop(scrollOffset);
            flashHighlight(element, 5000);
        });
    } catch (error) {
        console.error(error);
    }
}

export function selectCharacterById(...args) {
    if (!selectCharacterByIdImpl) {
        throwUnbound('selectCharacterById');
    }

    return selectCharacterByIdImpl(...args);
}

export function selectRightMenuWithAnimation(selectedMenuId) {
    const displayModes = {
        rm_group_chats_block: 'flex',
        rm_api_block: 'grid',
        rm_characters_block: 'flex',
    };

    $('#result_info').toggle(selectedMenuId === 'rm_ch_create_block');
    document.querySelectorAll('#right-nav-panel .right_menu').forEach((menu) => {
        $(menu).css('display', 'none');

        if (selectedMenuId && selectedMenuId.replace('#', '') === menu.id) {
            const mode = displayModes[menu.id] ?? 'block';
            $(menu).css('display', mode);
            $(menu).css('opacity', 0.0);
            $(menu).transition({
                opacity: 1.0,
                duration: animation_duration,
                easing: animation_easing,
                complete: function () { },
            });
        }
    });
}

export function select_rm_info(type, charId, previousCharId = null) {
    if (!type) {
        toastr.error(t`Invalid process (no 'type')`);
        return;
    }
    if (!getEntitiesListImpl) {
        throwUnbound('getEntitiesList');
    }
    if (!getCharactersPerPageDefaultImpl) {
        throwUnbound('getCharactersPerPageDefault');
    }

    const displayName = type !== 'group_create' ? String(charId).replace('.png', '') : null;

    if (type === 'char_delete') toastr.warning(t`Character Deleted: ${displayName}`);
    if (type === 'char_create') toastr.success(t`Character Created: ${displayName}`);
    if (type === 'group_create') toastr.success(t`Group Created`);
    if (type === 'group_delete') toastr.warning(t`Group Deleted`);
    if (type === 'char_import') toastr.success(t`Character Imported: ${displayName}`);

    selectRightMenuWithAnimation('rm_characters_block');

    clearTimeout(importFlashTimeout);
    importFlashTimeout = setTimeout(() => {
        if (type === 'char_import' || type === 'char_create' || type === 'char_import_no_toast') {
            flashEntityListEntry({
                lookupValue: charId,
                lookup: (entries) => entries.findIndex((x) => x?.item?.avatar?.startsWith(charId)),
                selector: `#rm_print_characters_block [title*="${charId}"]`,
                selectElement: (selector) => $(selector).parent(),
                missingLabel: 'character',
            });
        }

        if (type === 'group_create') {
            flashEntityListEntry({
                lookupValue: charId,
                lookup: (entries) => entries.findIndex((x) => String(x?.item?.id) === String(charId)),
                selector: `#rm_print_characters_block [grid="${charId}"]`,
                selectElement: (selector) => $(selector),
                missingLabel: 'group',
            });
        }
    }, 250);

    if (previousCharId && setCharacterIdImpl) {
        const newId = characters.findIndex((x) => x.avatar == previousCharId);
        if (newId >= 0) {
            setCharacterIdImpl(newId);
        }
    }
}

export function select_selected_character(chid, { switchMenu = true } = {}) {
    if (!formatCreatorNotesImpl) {
        throwUnbound('formatCreatorNotes');
    }
    if (!setWorldInfoButtonClassImpl) {
        throwUnbound('setWorldInfoButtonClass');
    }
    if (!checkEmbeddedWorldImpl) {
        throwUnbound('checkEmbeddedWorld');
    }
    if (!isExternalMediaAllowedImpl) {
        throwUnbound('isExternalMediaAllowed');
    }

    select_rm_create({ switchMenu });
    if (switchMenu) {
        setMenuType('character_edit');
    }

    $('#delete_button').css('display', 'flex');
    $('#export_button').css('display', 'flex');
    $('#rm_button_back').css('display', 'none');
    $('#create_button').attr('value', 'Save');
    $('#dupe_button').show();
    $('#create_button_label').css('display', 'none');
    $('#char_connections_button').show();

    const selectedGroup = getSelectedGroupImpl?.();
    $('#set_chat_scenario').toggle(!selectedGroup);

    if (!selectedGroup) {
        $('#rm_button_selected_ch').children('h2').text(characters[chid].name);
    }

    $('#add_avatar_button').val('');
    $('#character_popup-button-h3').text(characters[chid].name);
    $('#character_name_pole').val(characters[chid].name);
    $('#description_textarea').val(characters[chid].description);
    $('#character_world').val(characters[chid].data?.extensions?.world || '');
    $('#creator_notes_textarea').val(characters[chid].data?.creator_notes || characters[chid].creatorcomment);
    $('#creator_notes_spoiler').html(formatCreatorNotesImpl(characters[chid].data?.creator_notes || characters[chid].creatorcomment, characters[chid].avatar));
    $('#character_version_textarea').val(characters[chid].data?.character_version || '');
    $('#system_prompt_textarea').val(characters[chid].data?.system_prompt || '');
    $('#post_history_instructions_textarea').val(characters[chid].data?.post_history_instructions || '');
    $('#tags_textarea').val(Array.isArray(characters[chid].data?.tags) ? characters[chid].data.tags.join(', ') : '');
    $('#creator_textarea').val(characters[chid].data?.creator);
    $('#character_version_textarea').val(characters[chid].data?.character_version || '');
    $('#personality_textarea').val(characters[chid].personality);
    $('#firstmessage_textarea').val(characters[chid].first_mes);
    $('#scenario_pole').val(characters[chid].scenario);
    $('#depth_prompt_prompt').val(characters[chid].data?.extensions?.depth_prompt?.prompt ?? '');
    $('#depth_prompt_depth').val(characters[chid].data?.extensions?.depth_prompt?.depth ?? depth_prompt_depth_default);
    $('#depth_prompt_role').val(characters[chid].data?.extensions?.depth_prompt?.role ?? depth_prompt_role_default);
    $('#talkativeness_slider').val(characters[chid].talkativeness || talkativeness_default);
    $('#mes_example_textarea').val(characters[chid].mes_example);
    $('#selected_chat_pole').val(characters[chid].chat);
    $('#create_date_pole').val(characters[chid].create_date);
    $('#avatar_url_pole').val(characters[chid].avatar);
    $('#chat_import_avatar_url').val(characters[chid].avatar);
    $('#chat_import_character_name').val(characters[chid].name);
    $('#character_json_data').val(characters[chid].json_data);

    updateFavButtonState(characters[chid].fav || characters[chid].fav == 'true');

    const avatarUrl = characters[chid].avatar != 'none' ? getThumbnailUrl('avatar', characters[chid].avatar) : default_avatar;
    $('#avatar_load_preview').attr('src', avatarUrl);
    $('.open_alternate_greetings').data('chid', chid);
    $('#set_character_world').data('chid', chid);
    setWorldInfoButtonClassImpl(chid);
    checkEmbeddedWorldImpl(chid);

    $('#name_div').removeClass('displayBlock');
    $('#name_div').addClass('displayNone');
    $('#renameCharButton').css('display', '');
    $('#form_create').attr('actiontype', 'editcharacter');
    $('.form_create_bottom_buttons_block .chat_lorebook_button').show();

    const externalMediaState = isExternalMediaAllowedImpl();
    $('#character_open_media_overrides').toggle(!selectedGroup);
    $('#character_media_allowed_icon').toggle(externalMediaState);
    $('#character_media_forbidden_icon').toggle(!externalMediaState);

    saveSettingsDebounced();
}

export function select_rm_create({ switchMenu = true } = {}) {
    if (!getSelectedButtonImpl) {
        throwUnbound('getSelectedButton');
    }
    if (!formatCreatorNotesImpl) {
        throwUnbound('formatCreatorNotes');
    }
    if (!setWorldInfoButtonClassImpl) {
        throwUnbound('setWorldInfoButtonClass');
    }
    if (!checkEmbeddedWorldImpl) {
        throwUnbound('checkEmbeddedWorld');
    }

    if (switchMenu) {
        setMenuType('create');
    }

    if (getSelectedButtonImpl() == 'create' && create_save.avatar) {
        if (!readAvatarLoadImpl) {
            throwUnbound('readAvatarLoad');
        }
        const addAvatarInput = /** @type {HTMLInputElement} */ ($('#add_avatar_button').get(0));
        addAvatarInput.files = create_save.avatar;
        readAvatarLoadImpl(addAvatarInput);
    }

    if (switchMenu) {
        selectRightMenuWithAnimation('rm_ch_create_block');
    }

    $('#set_chat_scenario').hide();
    $('#delete_button_div').css('display', 'none');
    $('#delete_button').css('display', 'none');
    $('#export_button').css('display', 'none');
    $('#create_button_label').css('display', '');
    $('#create_button').attr('value', 'Create');
    $('#dupe_button').hide();
    $('#char_connections_button').hide();

    $('#rm_button_back').css('display', '');
    $('#character_import_button').css('display', '');
    $('#character_popup-button-h3').text('Create character');
    $('#character_name_pole').val(create_save.name);
    $('#description_textarea').val(create_save.description);
    $('#character_world').val(create_save.world);
    $('#creator_notes_textarea').val(create_save.creator_notes);
    $('#creator_notes_spoiler').html(formatCreatorNotesImpl(create_save.creator_notes, ''));
    $('#post_history_instructions_textarea').val(create_save.post_history_instructions);
    $('#system_prompt_textarea').val(create_save.system_prompt);
    $('#tags_textarea').val(create_save.tags);
    $('#creator_textarea').val(create_save.creator);
    $('#character_version_textarea').val(create_save.character_version);
    $('#personality_textarea').val(create_save.personality);
    $('#firstmessage_textarea').val(create_save.first_message);
    $('#talkativeness_slider').val(create_save.talkativeness);
    $('#scenario_pole').val(create_save.scenario);
    $('#depth_prompt_prompt').val(create_save.depth_prompt_prompt);
    $('#depth_prompt_depth').val(create_save.depth_prompt_depth);
    $('#depth_prompt_role').val(create_save.depth_prompt_role);
    $('#mes_example_textarea').val(create_save.mes_example);
    $('#character_json_data').val('');
    $('#avatar_div').css('display', 'flex');
    $('#avatar_load_preview').attr('src', default_avatar);
    $('#renameCharButton').css('display', 'none');
    $('#name_div').removeClass('displayNone');
    $('#name_div').addClass('displayBlock');
    $('.open_alternate_greetings').data('chid', -1);
    $('#set_character_world').data('chid', -1);
    setWorldInfoButtonClassImpl(undefined, !!create_save.world);
    updateFavButtonState(false);
    checkEmbeddedWorldImpl();

    $('#form_create').attr('actiontype', 'createcharacter');
    $('.form_create_bottom_buttons_block .chat_lorebook_button').hide();
    $('#character_open_media_overrides').hide();
}

export function select_rm_characters() {
    if (!printCharactersImpl) {
        throwUnbound('printCharacters');
    }

    const doFullRefresh = menu_type === 'characters';
    setMenuType('characters');
    selectRightMenuWithAnimation('rm_characters_block');
    printCharactersImpl(doFullRefresh);
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
