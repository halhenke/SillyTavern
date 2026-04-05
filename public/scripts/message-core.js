import { DOMPurify } from '../lib.js';
import { main_api } from './api-core.js';
import { characters } from './character-core.js';
import { addOneMessage, appendMediaToMessage, chat, extractMessageBias, formatSwipeCounter, reloadCurrentChat, saveChatConditional, systemUserName } from './chat-operations-core.js';
import { decodeStyleTags, encodeStyleTags } from './chats.js';
import { chat_metadata, name1, name2, this_chid } from './chat-core.js';
import { event_types, eventSource } from './events.js';
import { getRegexedString, regex_placement } from './extensions/regex/engine.js';
import { groups, is_group_generating, selected_group } from './group-chats.js';
import { t } from './i18n.js';
import {
    copyEditedMessageWorkflow,
    deleteEditedMessageWorkflow,
    moveEditedMessageDownWorkflow,
    moveEditedMessageUpWorkflow,
} from './message-actions-workflow.js';
import {
    encodeHtmlTagDelimiters,
    escapeConfiguredReasoningMarkers,
    getMessageFormattingDepth,
    getMessageFormattingRegexPlacement,
    normalizeMessageAuthorFlags,
    renderMarkdownMessage,
    sanitizeFormattedMessage,
    stripVisibleUserPromptBias,
    substituteFirstChatMessage,
} from './message-formatting-pipeline.js';
import { converter, removeMacros, substituteParams } from './parser-core.js';
import { collapseNewlines, fixMarkdown, power_user } from './power-user.js';
import {
    prependUserPromptBias,
    trimGroupMemberPrefixes,
    trimInstructSequences,
    trimLeadingDisplayName,
    trimPartialStoppingStrings,
    trimWrongSpeakerContent,
} from './message-cleanup-pipeline.js';
import { renderMessageEditPreview, renderMessageElementContent } from './message-content-renderer.js';
import { enterMessageEditMode, exitMessageEditMode } from './message-edit-renderer.js';
import { messageEditAutoWorkflow, messageEditDoneWorkflow } from './message-edit-workflow.js';
import {
    removeDeleteModeMessages,
    resetDeleteModeUi as resetDeleteModeUiRenderer,
    selectDeleteModeRange,
    showDeleteModeUi,
} from './message-delete-mode-renderer.js';
import {
    getFirstDisplayedMessageId as getFirstDisplayedMessageIdRenderer,
    hideMessageSwipeControls,
    showMessageSwipeControls,
    updateMessageEditArrowClasses,
    updateMessageListIds,
} from './message-list-renderer.js';
import {
    prepareNextSwipe,
    preparePreviousSwipe,
    syncMessageToSwipe,
    syncSwipeToMessage,
} from './message-swipe-state.js';
import { runSwipeLeftTransition, runSwipeRightTransition } from './message-swipe-renderer.js';
import { PromptReasoning } from './reasoning.js';
import { COMMENT_NAME_DEFAULT } from './slash-commands.js';
import { system_message_types } from './system-messages.js';
import { getTokenCountAsync } from './tokenizers.js';
import { animation_duration, animation_easing, is_send_press } from './ui-core.js';
import { copyText, escapeHtml, escapeRegex, trimToEndSentence } from './utils.js';

let saveChatDebouncedImpl = null;
let addCopyToCodeBlocksImpl = null;
let generateImpl = null;
let getStoppingStringsImpl = null;
let isHordeGenerationNotAllowedImpl = null;
let setSendButtonStateImpl = null;
let stopStreamingIfNeededImpl = null;
let unblockGenerationImpl = null;
let updateReasoningUIImpl = null;

export let editedMessageId = undefined;
export let editedMessageName = '';
export let deleteModeMessageId = -1;
export let isDeleteMode = false;

function throwUnbound(name) {
    throw new Error(`[message-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy message-related implementations to standalone wrappers.
 * @param {{
 *   saveChatDebounced: (...args: any[]) => any,
 *   addCopyToCodeBlocks: (...args: any[]) => any,
 *   Generate: (...args: any[]) => Promise<any>,
 *   getStoppingStrings: (...args: any[]) => string[],
 *   isHordeGenerationNotAllowed: (...args: any[]) => boolean,
 *   setSendButtonState: (...args: any[]) => any,
 *   stopStreamingIfNeeded: (...args: any[]) => any,
 *   unblockGeneration: (...args: any[]) => any,
 *   updateReasoningUI: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindMessageCore(impl) {
    saveChatDebouncedImpl = impl?.saveChatDebounced ?? null;
    addCopyToCodeBlocksImpl = impl?.addCopyToCodeBlocks ?? null;
    generateImpl = impl?.Generate ?? null;
    getStoppingStringsImpl = impl?.getStoppingStrings ?? null;
    isHordeGenerationNotAllowedImpl = impl?.isHordeGenerationNotAllowed ?? null;
    setSendButtonStateImpl = impl?.setSendButtonState ?? null;
    stopStreamingIfNeededImpl = impl?.stopStreamingIfNeeded ?? null;
    unblockGenerationImpl = impl?.unblockGeneration ?? null;
    updateReasoningUIImpl = impl?.updateReasoningUI ?? null;
}

export function saveChatDebounced(...args) {
    if (!saveChatDebouncedImpl) {
        throwUnbound('saveChatDebounced');
    }

    return saveChatDebouncedImpl(...args);
}

export function initMessageCopyBinding() {
    $(document).on('pointerup', '.mes_copy', async function () {
        if (this_chid !== undefined || selected_group || name2 === neutralCharacterName) {
            try {
                const messageId = $(this).closest('.mes').attr('mesid');
                const text = chat[messageId]['mes'];
                await copyText(text);
                toastr.info('Copied!', '', { timeOut: 2000 });
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        }
    });
}

export function initMessageEditBindings({
    getCssAutofit,
    getCanEditMessages,
    getAutoSaveMessageEditsEnabled,
    setCurrentEditedMessageId,
}) {
    $(document).on('click', '.mes_edit', async function () {
        if (isDeleteMode) {
            return;
        }

        if (getCanEditMessages()) {
            const nextEditedMessageId = await beginMessageEdit($(this), getCssAutofit());
            setCurrentEditedMessageId(nextEditedMessageId);
        }
    });

    $(document).on('input', '#curEditTextarea', function () {
        if (getAutoSaveMessageEditsEnabled()) {
            messageEditAuto($(this));
        }
    });

    $(document).on('click', '.mes_edit_cancel', async function () {
        await cancelMessageEdit($(this));
        setCurrentEditedMessageId(editedMessageId);
    });

    $(document).on('click', '.mes_edit_up', async function () {
        const nextEditedMessageId = await moveEditedMessageUp($(this));
        setCurrentEditedMessageId(nextEditedMessageId);
    });

    $(document).on('click', '.mes_edit_down', async function () {
        const nextEditedMessageId = await moveEditedMessageDown($(this));
        setCurrentEditedMessageId(nextEditedMessageId);
    });

    $(document).on('click', '.mes_edit_copy', async function () {
        await copyEditedMessage($(this));
    });

    $(document).on('click', '.mes_edit_delete', async function (_event, customData) {
        await deleteEditedMessage($(this), customData);
        setCurrentEditedMessageId(editedMessageId);
    });

    $(document).on('click', '.mes_edit_done', async function () {
        await messageEditDone($(this));
        setCurrentEditedMessageId(editedMessageId);
    });
}

export function initLastMessageSwipeBindings() {
    $(document).on('click', '.last_mes .swipe_right', swipe_right);
    $(document).on('click', '.last_mes .swipe_left', swipe_left);
}

export function initDeleteModeSelectionBindings() {
    $(document).on('click', '.mes', function () {
        if (!isDeleteMode || !$(this).children('.del_checkbox').is(':visible')) {
            return;
        }
        selectMessageDeleteTarget(Number($(this).attr('mesid')));
    });
}

export function setEditedMessageId(value) {
    editedMessageId = value;
    return editedMessageId;
}

export function setEditedMessageName(value) {
    editedMessageName = String(value ?? '');
    return editedMessageName;
}

function resetDeleteModeState() {
    deleteModeMessageId = -1;
    isDeleteMode = false;
}

export function syncMesToSwipe(messageId = null) {
    return syncMessageToSwipe(chat, messageId);
}

export function syncSwipeToMes(messageId = null, swipeId = null) {
    return syncSwipeToMessage(chat, messageId, swipeId);
}

export function showSwipeButtons() {
    return showMessageSwipeControls({
        chat,
        selectedGroup: selected_group,
        isGroupGenerating: is_group_generating,
        isSendPress: is_send_press,
        formatSwipeCounter,
    });
}

export function hideSwipeButtons() {
    return hideMessageSwipeControls();
}

/**
 * Formats the message text into an HTML string using Markdown and other formatting.
 * @param {string} mes Message text
 * @param {string} ch_name Character name
 * @param {boolean} isSystem If the message was sent by the system
 * @param {boolean} isUser If the message was sent by the user
 * @param {number} messageId Message index in chat array
 * @param {object} [sanitizerOverrides] DOMPurify sanitizer option overrides
 * @param {boolean} [isReasoning] If the message is reasoning output
 * @returns {string} HTML string
 */
export function messageFormatting(mes, ch_name, isSystem, isUser, messageId, sanitizerOverrides = {}, isReasoning = false) {
    if (!mes) {
        return '';
    }

    mes = substituteFirstChatMessage(mes, {
        chat,
        messageId,
        isSystem,
        isUser,
        isReasoning,
        characterName: ch_name,
        substituteParams,
    });

    ({ isSystem, isUser } = normalizeMessageAuthorFlags({
        characterName: ch_name,
        isSystem,
        isUser,
        commentNameDefault: COMMENT_NAME_DEFAULT,
        systemUserName,
    }));

    mes = stripVisibleUserPromptBias(mes, {
        userPromptBias: power_user.user_prompt_bias,
        showUserPromptBias: power_user.show_user_prompt_bias,
        characterName: ch_name,
        isUser,
        isSystem,
        substituteParams,
    });

    if (!isSystem) {
        const regexPlacement = getMessageFormattingRegexPlacement({
            chat,
            messageId,
            isReasoning,
            isUser,
        });
        const depth = getMessageFormattingDepth(chat, messageId);

        mes = getRegexedString(mes, regexPlacement, {
            characterOverride: ch_name,
            isMarkdown: true,
            depth,
        });
    }

    if (power_user.auto_fix_generated_markdown) {
        mes = fixMarkdown(mes, true);
    }

    if (!isSystem && power_user.encode_tags) {
        mes = encodeHtmlTagDelimiters(mes);
    }

    mes = escapeConfiguredReasoningMarkers(
        mes,
        power_user.reasoning.prefix,
        power_user.reasoning.suffix,
        escapeHtml,
    );

    if (!isSystem) {
        mes = renderMarkdownMessage(mes, {
            encodeTags: power_user.encode_tags,
            converter,
        });
    }

    if (!power_user.allow_name2_display && ch_name && !isUser && !isSystem) {
        mes = mes.replace(new RegExp(`(^|\n)${escapeRegex(ch_name)}:`, 'g'), '$1');
    }

    return sanitizeFormattedMessage(mes, {
        DOMPurify,
        sanitizerOverrides,
        encodeStyleTags,
        decodeStyleTags,
    });
}

export function cleanUpMessage({ getMessage, isImpersonate, isContinue, displayIncompleteSentences = false, stoppingStrings = null, includeUserPromptBias = true, trimNames = true, trimWrongNames = true } = {}) {
    if (arguments.length > 0 && typeof arguments[0] !== 'object') {
        console.trace('cleanUpMessage called with positional arguments. Please use an object instead.');
        [getMessage, isImpersonate, isContinue, displayIncompleteSentences, stoppingStrings, includeUserPromptBias, trimNames, trimWrongNames] = arguments;
    }

    if (!getMessage) {
        return '';
    }
    if (!getStoppingStringsImpl) {
        throwUnbound('getStoppingStrings');
    }

    getMessage = prependUserPromptBias(getMessage, {
        includeUserPromptBias,
        userPromptBias: power_user.user_prompt_bias,
        isImpersonate,
        isContinue,
        substituteParams,
    });

    if (!stoppingStrings) {
        stoppingStrings = getStoppingStringsImpl(isImpersonate, isContinue);
    }

    getMessage = trimPartialStoppingStrings(getMessage, stoppingStrings);

    getMessage = getRegexedString(getMessage, isImpersonate ? regex_placement.USER_INPUT : regex_placement.AI_OUTPUT);

    if (power_user.collapse_newlines) {
        getMessage = collapseNewlines(getMessage);
    }

    getMessage = getMessage.replace(/[^\S\r\n]+$/gm, '');

    if (trimWrongNames) {
        const wrongName = isImpersonate
            ? (!power_user.allow_name2_display ? name2 : '')
            : (!power_user.allow_name1_display ? name1 : '');
        const originalMessage = getMessage;
        getMessage = trimWrongSpeakerContent(getMessage, wrongName);
        if (wrongName && originalMessage !== getMessage && getMessage === '') {
            console.debug(`Message started with the wrong name: "${wrongName}" - response was deleted.`);
        }
    }

    if (getMessage.indexOf('<|endoftext|>') !== -1) {
        getMessage = getMessage.substring(0, getMessage.indexOf('<|endoftext|>'));
    }

    getMessage = trimInstructSequences(getMessage, {
        isInstruct: power_user.instruct.enabled && main_api !== 'openai',
        stopSequence: power_user.instruct.stop_sequence,
        inputSequence: power_user.instruct.input_sequence,
        outputSequence: power_user.instruct.output_sequence,
        lastOutputSequence: power_user.instruct.last_output_sequence,
        sequencesAsStopStrings: power_user.instruct.sequences_as_stop_strings,
        isImpersonate,
    });

    getMessage = trimGroupMemberPrefixes(getMessage, {
        selectedGroup: selected_group,
        groups,
        characters,
        activeCharacterName: name2,
        disableGroupTrimming: power_user.disable_group_trimming,
        escapeRegex,
    });

    if (!power_user.allow_name2_display) {
        const name2Escaped = escapeRegex(name2);
        getMessage = getMessage.replace(new RegExp(`(^|\n)${name2Escaped}:\\s*`, 'g'), '$1');
    }

    if (isImpersonate) {
        getMessage = getMessage.trim();
    }

    if (power_user.auto_fix_generated_markdown) {
        getMessage = fixMarkdown(getMessage, false);
    }

    if (trimNames) {
        const nameToTrim2 = isImpersonate
            ? (!power_user.allow_name1_display ? name1 : '')
            : (!power_user.allow_name2_display ? name2 : '');

        getMessage = trimLeadingDisplayName(getMessage, nameToTrim2);
    }

    if (isImpersonate) {
        getMessage = getMessage.trim();
    }

    if (!displayIncompleteSentences && power_user.trim_sentences) {
        getMessage = trimToEndSentence(getMessage);
    }

    if (power_user.trim_spaces && !PromptReasoning.getLatestPrefix()) {
        getMessage = getMessage.trim();
    }

    return getMessage;
}

/**
 * Handles the swipe to the left event.
 * @param {JQuery.Event} _event Event.
 * @param {object} params Additional parameters.
 * @param {string} [params.source] The source of the swipe event.
 * @param {boolean} [params.repeated] Is the swipe event repeated.
 */
export function swipe_left(_event, { source, repeated } = {}) {
    if (chat.length - 1 === Number(editedMessageId)) {
        closeMessageEditor();
    }

    if (!stopStreamingIfNeededImpl) {
        throwUnbound('stopStreamingIfNeeded');
    }

    stopStreamingIfNeededImpl();

    syncMesToSwipe();

    const swipeDuration = 120;
    const swipeRange = '700px';

    const swipeState = preparePreviousSwipe(chat, { source, repeated });
    if (swipeState.aborted) {
        return;
    }

    const messageRoot = $('.last_mes');
    runSwipeLeftTransition(messageRoot, {
        swipeRange,
        swipeDuration,
        animationDuration: animation_duration,
        animationEasing: animation_easing,
        onRenderSwipeMessage: async () => {
            addOneMessage(swipeState.targetMessage, { type: 'swipe' });

            if (power_user.message_token_count_enabled) {
                if (!swipeState.targetMessage.extra) {
                    swipeState.targetMessage.extra = {};
                }

                const swipeMessage = $('#chat').find(`[mesid="${swipeState.targetMessageId}"]`);
                const tokenCountText = (swipeState.targetMessage?.extra?.reasoning || '') + swipeState.targetMessage.mes;
                const tokenCount = await getTokenCountAsync(tokenCountText, 0);
                swipeState.targetMessage.extra.token_count = tokenCount;
                swipeMessage.find('.tokenCounterDisplay').text(`${tokenCount}t`);
            }
        },
        onFinishSwipe: async () => {
            appendMediaToMessage(swipeState.targetMessage, messageRoot.children('.mes_block'));
            await eventSource.emit(event_types.MESSAGE_SWIPED, swipeState.targetMessageId);
            saveChatDebounced();
        },
    });
}

/**
 * Handles the swipe to the right event.
 * @param {JQuery.Event} [_event] Event.
 * @param {object} params Additional parameters.
 * @param {string} [params.source] The source of the swipe event.
 * @param {boolean} [params.repeated] Is the swipe event repeated.
 */
export function swipe_right(_event = null, { source, repeated } = {}) {
    if (chat.length - 1 === Number(editedMessageId)) {
        closeMessageEditor();
    }

    if (!isHordeGenerationNotAllowedImpl) {
        throwUnbound('isHordeGenerationNotAllowed');
    }
    if (!unblockGenerationImpl) {
        throwUnbound('unblockGeneration');
    }
    if (!setSendButtonStateImpl) {
        throwUnbound('setSendButtonState');
    }
    if (!generateImpl) {
        throwUnbound('Generate');
    }

    if (isHordeGenerationNotAllowedImpl()) {
        return unblockGenerationImpl();
    }

    syncMesToSwipe();

    const isPristine = !chat_metadata?.tainted;
    const swipeDuration = 200;
    const swipeRange = 700;
    const swipeState = prepareNextSwipe(chat, { source, repeated, isPristine });
    if (swipeState.aborted) {
        return;
    }

    const swipeMessage = $('#chat').find(`[mesid="${swipeState.targetMessageId}"]`);
    const rightSwipeButton = swipeMessage.find('.swipe_right');
    const messageRoot = rightSwipeButton.parent().parent();

    if (swipeState.runGenerate) {
        rightSwipeButton.css('display', 'none');
    }

    messageRoot.children('.swipe_left').css('display', 'flex');
    runSwipeRightTransition(messageRoot, {
        swipeRange,
        swipeDuration,
        animationDuration: animation_duration,
        animationEasing: animation_easing,
        onRenderSwipeMessage: async () => {
            const currentSwipeMessage = $('#chat').find(`[mesid="${swipeState.targetMessageId}"]`);

            if (swipeState.runGenerate && parseInt(swipeState.targetMessage.swipe_id) === swipeState.targetMessage.swipes.length) {
                currentSwipeMessage.find('.mes_text').html('...');
                currentSwipeMessage.find('.mes_timer').html('');
                currentSwipeMessage.find('.tokenCounterDisplay').text('');
                updateReasoningUIImpl(currentSwipeMessage, { reset: true });
            } else {
                addOneMessage(swipeState.targetMessage, { type: 'swipe' });

                if (power_user.message_token_count_enabled) {
                    if (!swipeState.targetMessage.extra) {
                        swipeState.targetMessage.extra = {};
                    }

                    const tokenCountText = (swipeState.targetMessage?.extra?.reasoning || '') + swipeState.targetMessage.mes;
                    const tokenCount = await getTokenCountAsync(tokenCountText, 0);
                    swipeState.targetMessage.extra.token_count = tokenCount;
                    currentSwipeMessage.find('.tokenCounterDisplay').text(`${tokenCount}t`);
                }
            }
        },
        onFinishSwipe: async () => {
            const currentSwipeMessage = $('#chat').find(`[mesid="${swipeState.targetMessageId}"]`);
            appendMediaToMessage(swipeState.targetMessage, currentSwipeMessage);
            await eventSource.emit(event_types.MESSAGE_SWIPED, swipeState.targetMessageId);
            if (swipeState.runGenerate && !is_send_press && parseInt(swipeState.targetMessage.swipe_id) === swipeState.targetMessage.swipes.length) {
                setSendButtonStateImpl(true);
                await generateImpl('swipe');
            } else if (parseInt(swipeState.targetMessage.swipe_id) !== swipeState.targetMessage.swipes.length) {
                saveChatDebounced();
            }
        },
    });
}

export async function deleteSwipe(swipeId = null) {
    if (swipeId && (isNaN(swipeId) || swipeId < 0)) {
        toastr.warning(t`Invalid swipe ID: ${swipeId + 1}`);
        return;
    }

    const lastMessage = chat[chat.length - 1];
    if (!lastMessage || !Array.isArray(lastMessage.swipes) || !lastMessage.swipes.length) {
        toastr.warning(t`No messages to delete swipes from.`);
        return;
    }

    if (lastMessage.swipes.length <= 1) {
        toastr.warning(t`Can't delete the last swipe.`);
        return;
    }

    swipeId = swipeId ?? lastMessage.swipe_id;

    if (swipeId < 0 || swipeId >= lastMessage.swipes.length) {
        toastr.warning(t`Invalid swipe ID: ${swipeId + 1}`);
        return;
    }

    lastMessage.swipes.splice(swipeId, 1);

    if (Array.isArray(lastMessage.swipe_info) && lastMessage.swipe_info.length) {
        lastMessage.swipe_info.splice(swipeId, 1);
    }

    const newSwipeId = Math.min(swipeId, lastMessage.swipes.length - 1);
    syncSwipeToMes(null, newSwipeId);

    await saveChatConditional();
    await reloadCurrentChat();

    return newSwipeId;
}

export function updateViewMessageIds(startFromZero = false) {
    return updateMessageListIds({ startFromZero, editedMessageId });
}

export function getFirstDisplayedMessageId() {
    return getFirstDisplayedMessageIdRenderer();
}

export function updateEditArrowClasses() {
    return updateMessageEditArrowClasses(editedMessageId);
}

export function closeMessageEditor(what = 'all') {
    if (what === 'message' || what === 'all') {
        if (editedMessageId) {
            $(`#chat .mes[mesid="${editedMessageId}"] .mes_edit_cancel`).trigger('click');
        }
    }
    if (what === 'reasoning' || what === 'all') {
        document.querySelectorAll('.reasoning_edit_textarea').forEach((el) => {
            const cancelButton = el.closest('.mes')?.querySelector('.mes_reasoning_edit_cancel');
            if (cancelButton instanceof HTMLElement) {
                cancelButton.click();
            }
        });
    }
}

function clearEditedMessageState() {
    setEditedMessageId(undefined);
    setEditedMessageName('');
}

function getEditedMessageName(message) {
    if (message?.is_user) {
        return name1;
    }

    if (message?.force_avatar) {
        return message.name;
    }

    return name2;
}

function resetDeleteModeUi(cssSendFormDisplay) {
    return resetDeleteModeUiRenderer(cssSendFormDisplay);
}

export function openMessageDelete(fromSlashCommand) {
    closeMessageEditor();
    hideSwipeButtons();
    if (fromSlashCommand || (!is_send_press) || (selected_group && !is_group_generating)) {
        showDeleteModeUi();
    } else {
        console.debug(`
            ERR -- could not enter del mode
            this_chid: ${this_chid}
            is_send_press: ${is_send_press}
            selected_group: ${selected_group}
            is_group_generating: ${is_group_generating}`);
    }
    deleteModeMessageId = -1;
    isDeleteMode = true;
    return isDeleteMode;
}

export function selectMessageDeleteTarget(messageId) {
    selectDeleteModeRange(messageId, chat.length);
    deleteModeMessageId = Number(messageId);
    return deleteModeMessageId;
}

export function cancelDeleteMode(cssSendFormDisplay) {
    resetDeleteModeUi(cssSendFormDisplay);
    showSwipeButtons();
    resetDeleteModeState();
    return isDeleteMode;
}

export async function confirmDeleteMode(cssSendFormDisplay) {
    resetDeleteModeUi(cssSendFormDisplay);

    if (deleteModeMessageId >= 0) {
        removeDeleteModeMessages(deleteModeMessageId);
        chat.length = deleteModeMessageId;
        chat_metadata.tainted = true;
        await saveChatConditional();
        await eventSource.emit(event_types.MESSAGE_DELETED, chat.length);
    } else {
        console.log('deleteModeMessageId is not >= 0, not deleting');
    }

    showSwipeButtons();
    resetDeleteModeState();
    return chat.length;
}

export async function beginMessageEdit(trigger, cssAutofit) {
    const triggerElement = $(trigger);
    const mesRoot = triggerElement.closest('.mes');
    const mesBlock = triggerElement.closest('.mes_block');
    const nextEditedMessageId = String(mesRoot.attr('mesid'));
    const chatScrollPosition = $('#chat').scrollTop();

    if (editedMessageId !== undefined) {
        const currentEditedDoneButton = $(`#chat [mesid="${editedMessageId}"]`).find('.mes_edit_done');
        const currentEditedMessage = chat[editedMessageId];
        if (
            Number(editedMessageId) === chat.length - 1 &&
            currentEditedMessage?.swipe_id !== undefined &&
            currentEditedMessage?.swipes?.length !== currentEditedMessage?.swipe_id
        ) {
            hideSwipeButtons();
        }
        await messageEditDone(currentEditedDoneButton);
    }

    mesBlock.find('.mes_text').empty();
    mesBlock.find('.mes_buttons').css('display', 'none');
    mesBlock.find('.mes_edit_buttons').css('display', 'inline-flex');
    setEditedMessageId(nextEditedMessageId);

    const reasoningEdit = mesBlock.find('.mes_reasoning_edit:visible');
    if (reasoningEdit.length > 0) {
        reasoningEdit.trigger('click');
    }

    let text = chat[nextEditedMessageId]?.mes ?? '';
    setEditedMessageName(getEditedMessageName(chat[nextEditedMessageId]));
    if (power_user.trim_spaces) {
        text = text.trim();
    }

    enterMessageEditMode({ mesBlock, text, cssAutofit });

    if (Number(editedMessageId) === chat.length - 1) {
        $('#chat').scrollTop(chatScrollPosition);
    }

    updateEditArrowClasses();
    return editedMessageId;
}

export async function cancelMessageEdit(trigger) {
    const triggerElement = $(trigger);
    const currentEditedMessage = chat[editedMessageId];
    const mesBlock = triggerElement.closest('.mes_block');

    mesBlock.find('.mes_text').empty();
    exitMessageEditMode(mesBlock, triggerElement);
    mesBlock.find('.mes_text').append(messageFormatting(
        currentEditedMessage?.mes ?? '',
        editedMessageName,
        currentEditedMessage?.is_system,
        currentEditedMessage?.is_user,
        editedMessageId,
        {},
        false,
    ));
    appendMediaToMessage(currentEditedMessage, triggerElement.closest('.mes'));
    addCopyToCodeBlocksImpl(triggerElement.closest('.mes'));

    const reasoningEditDone = mesBlock.find('.mes_reasoning_edit_cancel:visible');
    if (reasoningEditDone.length > 0) {
        reasoningEditDone.trigger('click');
    }

    await eventSource.emit(event_types.MESSAGE_UPDATED, editedMessageId);
    clearEditedMessageState();
}

export function messageEditAuto(div, currentEditedMessageName = editedMessageName, currentEditedMessageId = editedMessageId) {
    return messageEditAutoWorkflow({
        div,
        chat,
        currentEditedMessageName,
        currentEditedMessageId,
        messageFormatting,
        extractMessageBias,
        saveChatDebounced,
    });
}

export async function messageEditDone(div, currentEditedMessageName = editedMessageName, currentEditedMessageId = editedMessageId) {
    return messageEditDoneWorkflow({
        div,
        chat,
        currentEditedMessageName,
        currentEditedMessageId,
        messageFormatting,
        extractMessageBias,
        appendMediaToMessage,
        updateReasoningUI: updateReasoningUIImpl,
        addCopyToCodeBlocks: addCopyToCodeBlocksImpl,
        clearEditedMessageState,
        saveChatConditional,
    });
}

export async function moveEditedMessageUp(trigger) {
    return moveEditedMessageUpWorkflow({
        trigger,
        chat,
        editedMessageId,
        isSendPress: is_send_press,
        hideSwipeButtons,
        setEditedMessageId,
        updateViewMessageIds,
        saveChatConditional,
        showSwipeButtons,
    });
}

export async function moveEditedMessageDown(trigger) {
    return moveEditedMessageDownWorkflow({
        trigger,
        chat,
        editedMessageId,
        isSendPress: is_send_press,
        hideSwipeButtons,
        setEditedMessageId,
        updateViewMessageIds,
        saveChatConditional,
        showSwipeButtons,
    });
}

export async function copyEditedMessage(trigger) {
    return copyEditedMessageWorkflow({
        trigger,
        chat,
        editedMessageId,
        hideSwipeButtons,
        addOneMessage,
        updateViewMessageIds,
        saveChatConditional,
        showSwipeButtons,
    });
}

export async function deleteEditedMessage(trigger, customData = {}) {
    return deleteEditedMessageWorkflow({
        trigger,
        customData,
        chat,
        editedMessageId,
        clearEditedMessageState,
        updateViewMessageIds,
        saveChatDebounced,
        hideSwipeButtons,
        showSwipeButtons,
        deleteSwipe,
    });
}

export function updateMessageBlock(...args) {
    if (!addCopyToCodeBlocksImpl) {
        throwUnbound('addCopyToCodeBlocks');
    }
    if (!updateReasoningUIImpl) {
        throwUnbound('updateReasoningUI');
    }

    const [messageId, message, { rerenderMessage = true } = {}] = args;
    const messageElement = $(`#chat [mesid="${messageId}"]`);
    const text = message?.extra?.display_text ?? message.mes;
    return renderMessageElementContent({
        messageElement,
        message,
        messageId,
        text,
        bias: null,
        clearText: rerenderMessage,
        formatMessage: messageFormatting,
        updateReasoningUI: updateReasoningUIImpl,
        addCopyToCodeBlocks: addCopyToCodeBlocksImpl,
        appendMediaToMessage,
    });
}
