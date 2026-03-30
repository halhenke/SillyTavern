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
import { converter, removeMacros, substituteParams } from './parser-core.js';
import { POPUP_TYPE, callGenericPopup } from './popup.js';
import { collapseNewlines, fixMarkdown, power_user } from './power-user.js';
import { renderMessageEditPreview, renderMessageElementContent } from './message-content-renderer.js';
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
    if (!chat.length) {
        return false;
    }

    const targetMessageId = messageId ?? chat.length - 1;
    if (targetMessageId >= chat.length || targetMessageId < 0) {
        console.warn(`[syncMesToSwipe] Invalid message ID: ${messageId}`);
        return false;
    }

    const targetMessage = chat[targetMessageId];
    if (!targetMessage) {
        return false;
    }

    if (typeof targetMessage.swipe_id !== 'number') {
        return false;
    }
    if (!Array.isArray(targetMessage.swipe_info) || !Array.isArray(targetMessage.swipes)) {
        return false;
    }
    if (!targetMessage.swipes[targetMessage.swipe_id] || !targetMessage.swipe_info[targetMessage.swipe_id]) {
        return false;
    }

    const targetSwipeInfo = targetMessage.swipe_info[targetMessage.swipe_id];
    if (typeof targetSwipeInfo !== 'object') {
        return false;
    }

    targetMessage.swipes[targetMessage.swipe_id] = targetMessage.mes;

    targetSwipeInfo.send_date = targetMessage.send_date;
    targetSwipeInfo.gen_started = targetMessage.gen_started;
    targetSwipeInfo.gen_finished = targetMessage.gen_finished;
    targetSwipeInfo.extra = structuredClone(targetMessage.extra);

    return true;
}

export function syncSwipeToMes(messageId = null, swipeId = null) {
    if (!chat.length) {
        return false;
    }

    const targetMessageId = messageId ?? chat.length - 1;
    if (targetMessageId >= chat.length || targetMessageId < 0) {
        console.warn(`[syncSwipeToMes] Invalid message ID: ${messageId}`);
        return false;
    }

    const targetMessage = chat[targetMessageId];
    if (!targetMessage) {
        return false;
    }

    if (swipeId !== null) {
        if (isNaN(swipeId) || swipeId < 0) {
            console.warn(`[syncSwipeToMes] Invalid swipe ID: ${swipeId}`);
            return false;
        }
        targetMessage.swipe_id = swipeId;
    }

    if (typeof targetMessage.swipe_id !== 'number') {
        return false;
    }
    if (!Array.isArray(targetMessage.swipe_info) || !Array.isArray(targetMessage.swipes)) {
        return false;
    }
    if (!targetMessage.swipes[targetMessage.swipe_id] || !targetMessage.swipe_info[targetMessage.swipe_id]) {
        return false;
    }

    const targetSwipeInfo = targetMessage.swipe_info[targetMessage.swipe_id];
    if (typeof targetSwipeInfo !== 'object') {
        return false;
    }

    targetMessage.mes = targetMessage.swipes[targetMessage.swipe_id];
    targetMessage.send_date = targetSwipeInfo.send_date;
    targetMessage.gen_started = targetSwipeInfo.gen_started;
    targetMessage.gen_finished = targetSwipeInfo.gen_finished;
    targetMessage.extra = structuredClone(targetSwipeInfo.extra);

    return true;
}

export function showSwipeButtons() {
    if (chat.length === 0) {
        return;
    }

    if (
        chat[chat.length - 1].is_system ||
        !chat[chat.length - 1].swipes ||
        Number($('.mes:last').attr('mesid')) < 0 ||
        chat[chat.length - 1].is_user ||
        (selected_group && is_group_generating)
    ) {
        return;
    }

    if (chat.length === 1 && chat[0].swipe_id === undefined) {
        return;
    }

    if (chat[chat.length - 1].swipe_id === undefined) {
        chat[chat.length - 1].swipe_id = 0;
        chat[chat.length - 1].swipes = [];
        chat[chat.length - 1].swipes[0] = chat[chat.length - 1].mes;
        chat[chat.length - 1].swipe_info = [];
        chat[chat.length - 1].swipe_info[0] = {
            send_date: chat[chat.length - 1].send_date,
            gen_started: chat[chat.length - 1].gen_started,
            gen_finished: chat[chat.length - 1].gen_finished,
            extra: structuredClone(chat[chat.length - 1].extra),
        };
    }

    const currentMessage = $('#chat').children().filter(`[mesid="${chat.length - 1}"]`);
    const swipeId = chat[chat.length - 1].swipe_id;
    const swipeCounterText = formatSwipeCounter(swipeId + 1, chat[chat.length - 1].swipes.length);
    const swipeRight = currentMessage.find('.swipe_right');
    const swipeLeft = currentMessage.find('.swipe_left');
    const swipeCounter = currentMessage.find('.swipes-counter');

    if (swipeId !== undefined && (chat[chat.length - 1].swipes.length > 1 || swipeId > 0)) {
        swipeLeft.css('display', 'flex');
    }

    if (is_send_press === false || chat[chat.length - 1].swipes.length >= swipeId) {
        swipeRight.css('display', 'flex').css('opacity', '0.3');
        swipeCounter.css('opacity', '0.3');
    }

    if ((chat[chat.length - 1].swipes.length - swipeId) === 1) {
        swipeRight.css('opacity', '0.7');
        swipeCounter.css('opacity', '0.7');
    }

    $('.last_mes .swipes-counter').text(swipeCounterText).show();
}

export function hideSwipeButtons() {
    const chatElement = $('#chat');
    chatElement.find('.swipe_right').hide();
    chatElement.find('.last_mes .swipes-counter').hide();
    chatElement.find('.swipe_left').hide();
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

    if (Number(messageId) === 0 && !isSystem && !isUser && !isReasoning) {
        const mesBeforeReplace = mes;
        const chatMessage = chat[messageId];
        mes = substituteParams(mes, undefined, ch_name);
        if (chatMessage && chatMessage.mes === mesBeforeReplace && chatMessage.extra?.display_text !== mesBeforeReplace) {
            chatMessage.mes = mes;
        }
    }

    if (ch_name === COMMENT_NAME_DEFAULT && isSystem && !isUser) {
        isSystem = false;
    }

    if (isSystem && ch_name !== systemUserName) {
        isSystem = false;
    }

    const replacedPromptBias = power_user.user_prompt_bias && substituteParams(power_user.user_prompt_bias);
    if (!power_user.show_user_prompt_bias && ch_name && !isUser && !isSystem && replacedPromptBias && mes.startsWith(replacedPromptBias)) {
        mes = mes.slice(replacedPromptBias.length);
    }

    if (!isSystem) {
        function getRegexPlacement() {
            try {
                if (isReasoning) {
                    return regex_placement.REASONING;
                }
                if (isUser) {
                    return regex_placement.USER_INPUT;
                } else if (chat[messageId]?.extra?.type === 'narrator') {
                    return regex_placement.SLASH_COMMAND;
                } else {
                    return regex_placement.AI_OUTPUT;
                }
            } catch {
                return regex_placement.AI_OUTPUT;
            }
        }

        const regexPlacement = getRegexPlacement();
        const usableMessages = chat.map((x, index) => ({ message: x, index: index })).filter(x => !x.message.is_system);
        const indexOf = usableMessages.findIndex(x => x.index === Number(messageId));
        const depth = messageId >= 0 && indexOf !== -1 ? (usableMessages.length - indexOf - 1) : undefined;

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
        mes = mes.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    }

    [power_user.reasoning.prefix, power_user.reasoning.suffix].forEach((reasoningString) => {
        if (!reasoningString || !reasoningString.trim().length) {
            return;
        }
        if (mes.includes(reasoningString)) {
            mes = mes.replace(reasoningString, escapeHtml(reasoningString));
        }
    });

    if (!isSystem) {
        if (!power_user.encode_tags) {
            mes = mes.replace(/<([^>]+)>/g, function (_, contents) {
                return '<' + contents.replace(/"/g, '\ufffe') + '>';
            });
        }

        mes = mes.replace(
            /<style>[\s\S]*?<\/style>|```[\s\S]*?```|~~~[\s\S]*?~~~|``[\s\S]*?``|`[\s\S]*?`|(".*?")|(\u201C.*?\u201D)|(\u00AB.*?\u00BB)|(\u300C.*?\u300D)|(\u300E.*?\u300F)|(\uFF02.*?\uFF02)/gim,
            function (match, p1, p2, p3, p4, p5, p6) {
                if (p1) return `<q>"${p1.slice(1, -1)}"</q>`;
                if (p2) return `<q>“${p2.slice(1, -1)}”</q>`;
                if (p3) return `<q>«${p3.slice(1, -1)}»</q>`;
                if (p4) return `<q>「${p4.slice(1, -1)}」</q>`;
                if (p5) return `<q>『${p5.slice(1, -1)}』</q>`;
                if (p6) return `<q>＂${p6.slice(1, -1)}＂</q>`;
                return match;
            },
        );

        if (!power_user.encode_tags) {
            mes = mes.replace(/\ufffe/g, '"');
        }

        mes = mes.replaceAll('\\begin{align*}', '$$');
        mes = mes.replaceAll('\\end{align*}', '$$');
        mes = converter.makeHtml(mes);

        mes = mes.replace(/<code(.*)>[\s\S]*?<\/code>/g, function (match) {
            return match.replace(/\n/gm, '\u0000');
        });
        mes = mes.replace(/\u0000/g, '\n');
        mes = mes.trim();

        mes = mes.replace(/<code(.*)>[\s\S]*?<\/code>/g, function (match) {
            return match.replace(/&amp;/g, '&');
        });
    }

    if (!power_user.allow_name2_display && ch_name && !isUser && !isSystem) {
        mes = mes.replace(new RegExp(`(^|\n)${escapeRegex(ch_name)}:`, 'g'), '$1');
    }

    /** @type {import('dompurify').Config & { RETURN_DOM_FRAGMENT: false; RETURN_DOM: false }} */
    const config = {
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: false,
        MESSAGE_SANITIZE: true,
        ADD_TAGS: ['custom-style'],
        ...sanitizerOverrides,
    };
    mes = encodeStyleTags(mes);
    mes = DOMPurify.sanitize(mes, config);
    mes = decodeStyleTags(mes, { prefix: '.mes_text ' });

    return mes;
}

function cleanGroupMessage(getMessage) {
    if (power_user.disable_group_trimming) {
        return getMessage;
    }

    const group = groups.find((x) => x.id == selected_group);

    if (group && Array.isArray(group.members) && group.members) {
        for (const member of group.members) {
            const character = characters.find(x => x.avatar == member);

            if (!character) {
                continue;
            }

            const name = character.name;
            if (name === name2) {
                continue;
            }

            const regex = new RegExp(`(^|\n)${escapeRegex(name)}:`);
            const nameMatch = getMessage.match(regex);
            if (nameMatch) {
                getMessage = getMessage.substring(0, nameMatch.index);
            }
        }
    }

    return getMessage;
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

    if (includeUserPromptBias && power_user.user_prompt_bias && !isImpersonate && !isContinue && power_user.user_prompt_bias.length !== 0) {
        getMessage = substituteParams(power_user.user_prompt_bias) + getMessage;
    }

    if (!stoppingStrings) {
        stoppingStrings = getStoppingStringsImpl(isImpersonate, isContinue);
    }

    for (const stoppingString of stoppingStrings) {
        if (stoppingString.length) {
            for (let j = stoppingString.length; j > 0; j--) {
                if (getMessage.slice(-j) === stoppingString.slice(0, j)) {
                    getMessage = getMessage.slice(0, -j);
                    break;
                }
            }
        }
    }

    getMessage = getRegexedString(getMessage, isImpersonate ? regex_placement.USER_INPUT : regex_placement.AI_OUTPUT);

    if (power_user.collapse_newlines) {
        getMessage = collapseNewlines(getMessage);
    }

    getMessage = getMessage.replace(/[^\S\r\n]+$/gm, '');

    if (trimWrongNames) {
        let wrongName = isImpersonate
            ? (!power_user.allow_name2_display ? name2 : '')
            : (!power_user.allow_name1_display ? name1 : '');

        if (wrongName) {
            let startIndex = getMessage.indexOf(`${wrongName}:`);
            if (startIndex === 0) {
                getMessage = '';
                console.debug(`Message started with the wrong name: "${wrongName}" - response was deleted.`);
            }

            startIndex = getMessage.indexOf(`\n${wrongName}:`);
            if (startIndex >= 0) {
                getMessage = getMessage.substring(0, startIndex);
            }
        }
    }

    if (getMessage.indexOf('<|endoftext|>') !== -1) {
        getMessage = getMessage.substring(0, getMessage.indexOf('<|endoftext|>'));
    }

    const isInstruct = power_user.instruct.enabled && main_api !== 'openai';
    const isNotEmpty = (str) => str && str.trim() !== '';

    if (isInstruct && power_user.instruct.stop_sequence) {
        if (getMessage.indexOf(power_user.instruct.stop_sequence) !== -1) {
            getMessage = getMessage.substring(0, getMessage.indexOf(power_user.instruct.stop_sequence));
        }
    }

    if (isInstruct && isNotEmpty(power_user.instruct.input_sequence)) {
        if (getMessage.indexOf(power_user.instruct.input_sequence) !== -1) {
            getMessage = getMessage.substring(0, getMessage.indexOf(power_user.instruct.input_sequence));
        }
    }

    if (isInstruct && power_user.instruct.sequences_as_stop_strings) {
        const sequences = [
            { value: power_user.instruct.input_sequence, apply: isImpersonate && isNotEmpty(power_user.instruct.input_sequence) },
            { value: power_user.instruct.output_sequence, apply: !isImpersonate && isNotEmpty(power_user.instruct.output_sequence) },
            { value: power_user.instruct.last_output_sequence, apply: !isImpersonate && isNotEmpty(power_user.instruct.last_output_sequence) },
        ];
        for (const seq of sequences.filter(s => s.apply)) {
            seq.value.split('\n').filter(line => line.trim() !== '').forEach(line => { getMessage = getMessage.replaceAll(line, ''); });
        }
    }

    if (selected_group) {
        getMessage = cleanGroupMessage(getMessage);
    }

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

        if (nameToTrim2 && getMessage.startsWith(`${nameToTrim2}:`)) {
            getMessage = getMessage.replace(`${nameToTrim2}:`, '');
            getMessage = getMessage.trimStart();
        }
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

    if (source === 'keyboard' && repeated && chat[chat.length - 1].swipe_id === 0) {
        return;
    }

    const swipeDuration = 120;
    const swipeRange = '700px';
    chat[chat.length - 1].swipe_id--;

    if (chat[chat.length - 1].swipe_id < 0) {
        chat[chat.length - 1].swipe_id = chat[chat.length - 1].swipes.length - 1;
    }

    if (chat[chat.length - 1].swipe_id >= 0) {
        if (!Array.isArray(chat[chat.length - 1].swipe_info)) {
            chat[chat.length - 1].swipe_info = [];
        }

        const messageRoot = $('.last_mes');
        const messageBlock = messageRoot.children('.mes_block').children('.mes_text');
        const messageRootHeight = messageRoot[0].scrollHeight;
        messageRoot.css('height', messageRootHeight);
        const messageBlockHeight = messageBlock[0].scrollHeight;

        chat[chat.length - 1].mes = chat[chat.length - 1].swipes[chat[chat.length - 1].swipe_id];
        chat[chat.length - 1].send_date = chat[chat.length - 1].swipe_info[chat[chat.length - 1].swipe_id]?.send_date || chat[chat.length - 1].send_date;
        chat[chat.length - 1].extra = structuredClone(chat[chat.length - 1].swipe_info[chat[chat.length - 1].swipe_id]?.extra || chat[chat.length - 1].extra);

        if (chat[chat.length - 1].extra) {
            delete chat[chat.length - 1].extra.memory;
            delete chat[chat.length - 1].extra.display_text;
        }

        messageRoot.children('.mes_block').transition({
            x: swipeRange,
            duration: animation_duration > 0 ? swipeDuration : 0,
            easing: animation_easing,
            queue: false,
            complete: async function () {
                const isAnimationScroll = ($('#chat').scrollTop() >= ($('#chat').prop('scrollHeight') - $('#chat').outerHeight()) - 10);
                addOneMessage(chat[chat.length - 1], { type: 'swipe' });

                if (power_user.message_token_count_enabled) {
                    if (!chat[chat.length - 1].extra) {
                        chat[chat.length - 1].extra = {};
                    }

                    const swipeMessage = $('#chat').find(`[mesid="${chat.length - 1}"]`);
                    const tokenCountText = (chat[chat.length - 1]?.extra?.reasoning || '') + chat[chat.length - 1].mes;
                    const tokenCount = await getTokenCountAsync(tokenCountText, 0);
                    chat[chat.length - 1].extra.token_count = tokenCount;
                    swipeMessage.find('.tokenCounterDisplay').text(`${tokenCount}t`);
                }

                let newHeight = messageRootHeight - (messageBlockHeight - messageBlock[0].scrollHeight);
                if (newHeight < 103) {
                    newHeight = 103;
                }

                messageRoot.animate({ height: `${newHeight}px` }, {
                    duration: 0,
                    queue: false,
                    progress: function () {
                        if (isAnimationScroll) {
                            $('#chat').scrollTop($('#chat')[0].scrollHeight);
                        }
                    },
                    complete: function () {
                        messageRoot.css('height', 'auto');
                        if (isAnimationScroll) {
                            $('#chat').scrollTop($('#chat')[0].scrollHeight);
                        }
                    },
                });

                messageRoot.children('.mes_block').transition({
                    x: `-${swipeRange}`,
                    duration: 0,
                    easing: animation_easing,
                    queue: false,
                    complete: function () {
                        messageRoot.children('.mes_block').transition({
                            x: '0px',
                            duration: animation_duration > 0 ? swipeDuration : 0,
                            easing: animation_easing,
                            queue: false,
                            complete: async function () {
                                appendMediaToMessage(chat[chat.length - 1], messageRoot.children('.mes_block'));
                                await eventSource.emit(event_types.MESSAGE_SWIPED, chat.length - 1);
                                saveChatDebounced();
                            },
                        });
                    },
                });
            },
        });

        messageRoot.children('.avatar').transition({
            x: swipeRange,
            duration: animation_duration > 0 ? swipeDuration : 0,
            easing: animation_easing,
            queue: false,
            complete: function () {
                messageRoot.children('.avatar').transition({
                    x: `-${swipeRange}`,
                    duration: 0,
                    easing: animation_easing,
                    queue: false,
                    complete: function () {
                        messageRoot.children('.avatar').transition({
                            x: '0px',
                            duration: animation_duration > 0 ? swipeDuration : 0,
                            easing: animation_easing,
                            queue: false,
                        });
                    },
                });
            },
        });
    }

    if (chat[chat.length - 1].swipe_id < 0) {
        chat[chat.length - 1].swipe_id = 0;
    }
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
    let runGenerate = false;
    let runSwipeRight = false;

    if (chat[chat.length - 1].swipe_id === undefined) {
        chat[chat.length - 1].swipe_id = 0;
        chat[chat.length - 1].swipes = [];
        chat[chat.length - 1].swipe_info = [];
        chat[chat.length - 1].swipes[0] = chat[chat.length - 1].mes;
        chat[chat.length - 1].swipe_info[0] = {
            send_date: chat[chat.length - 1].send_date,
            gen_started: chat[chat.length - 1].gen_started,
            gen_finished: chat[chat.length - 1].gen_finished,
            extra: structuredClone(chat[chat.length - 1].extra),
        };
    }

    if (chat.length === 1 && chat[0].swipe_id !== undefined && chat[0].swipe_id === chat[0].swipes.length - 1 && isPristine) {
        chat[0].swipe_id = 0;
    } else {
        if (source === 'keyboard' && repeated && chat[chat.length - 1].swipe_id === chat[chat.length - 1].swipes.length - 1) {
            return;
        }
        chat[chat.length - 1].swipe_id++;
    }

    if (chat[chat.length - 1].extra) {
        delete chat[chat.length - 1].extra.memory;
        delete chat[chat.length - 1].extra.display_text;
        delete chat[chat.length - 1].extra.image;
        delete chat[chat.length - 1].extra.image_swipes;
        delete chat[chat.length - 1].extra.video;
        delete chat[chat.length - 1].extra.inline_image;
    }

    if (!Array.isArray(chat[chat.length - 1].swipe_info)) {
        chat[chat.length - 1].swipe_info = [];
    }

    if (parseInt(chat[chat.length - 1].swipe_id) === chat[chat.length - 1].swipes.length && (chat.length !== 1 || !isPristine)) {
        delete chat[chat.length - 1].gen_started;
        delete chat[chat.length - 1].gen_finished;
        runGenerate = true;
    } else if (parseInt(chat[chat.length - 1].swipe_id) < chat[chat.length - 1].swipes.length) {
        chat[chat.length - 1].mes = chat[chat.length - 1].swipes[chat[chat.length - 1].swipe_id];
        chat[chat.length - 1].send_date = chat[chat.length - 1]?.swipe_info[chat[chat.length - 1].swipe_id]?.send_date || chat[chat.length - 1].send_date;
        chat[chat.length - 1].extra = structuredClone(chat[chat.length - 1].swipe_info[chat[chat.length - 1].swipe_id]?.extra || chat[chat.length - 1].extra || []);
        runSwipeRight = true;
    }

    const swipeMessage = $('#chat').find(`[mesid="${chat.length - 1}"]`);
    const rightSwipeButton = swipeMessage.find('.swipe_right');
    const messageRoot = rightSwipeButton.parent().parent();

    if (chat[chat.length - 1].swipe_id > chat[chat.length - 1].swipes.length) {
        chat[chat.length - 1].swipe_id = chat[chat.length - 1].swipes.length;
    }
    if (runGenerate) {
        rightSwipeButton.css('display', 'none');
    }

    if (runGenerate || runSwipeRight) {
        const messageBlock = messageRoot.find('.mes_block .mes_text');
        const messageRootHeight = messageRoot[0].scrollHeight;
        const messageBlockHeight = messageBlock[0].scrollHeight;

        messageRoot.children('.swipe_left').css('display', 'flex');
        messageRoot.children('.mes_block').transition({
            x: `-${swipeRange}`,
            duration: animation_duration > 0 ? swipeDuration : 0,
            easing: animation_easing,
            queue: false,
            complete: async function () {
                const isAnimationScroll = ($('#chat').scrollTop() >= ($('#chat').prop('scrollHeight') - $('#chat').outerHeight()) - 10);
                const currentSwipeMessage = $('#chat').find(`[mesid="${chat.length - 1}"]`);

                if (runGenerate && parseInt(chat[chat.length - 1].swipe_id) === chat[chat.length - 1].swipes.length) {
                    currentSwipeMessage.find('.mes_text').html('...');
                    currentSwipeMessage.find('.mes_timer').html('');
                    currentSwipeMessage.find('.tokenCounterDisplay').text('');
                    updateReasoningUIImpl(currentSwipeMessage, { reset: true });
                } else {
                    addOneMessage(chat[chat.length - 1], { type: 'swipe' });

                    if (power_user.message_token_count_enabled) {
                        if (!chat[chat.length - 1].extra) {
                            chat[chat.length - 1].extra = {};
                        }

                        const tokenCountText = (chat[chat.length - 1]?.extra?.reasoning || '') + chat[chat.length - 1].mes;
                        const tokenCount = await getTokenCountAsync(tokenCountText, 0);
                        chat[chat.length - 1].extra.token_count = tokenCount;
                        currentSwipeMessage.find('.tokenCounterDisplay').text(`${tokenCount}t`);
                    }
                }

                let newHeight = messageRootHeight - (messageBlockHeight - messageBlock[0].scrollHeight);
                if (newHeight < 103) {
                    newHeight = 103;
                }

                messageRoot.animate({ height: `${newHeight}px` }, {
                    duration: 0,
                    queue: false,
                    progress: function () {
                        if (isAnimationScroll) {
                            $('#chat').scrollTop($('#chat')[0].scrollHeight);
                        }
                    },
                    complete: function () {
                        messageRoot.css('height', 'auto');
                        if (isAnimationScroll) {
                            $('#chat').scrollTop($('#chat')[0].scrollHeight);
                        }
                    },
                });

                messageRoot.children('.mes_block').transition({
                    x: swipeRange,
                    duration: 0,
                    easing: animation_easing,
                    queue: false,
                    complete: function () {
                        messageRoot.children('.mes_block').transition({
                            x: '0px',
                            duration: animation_duration > 0 ? swipeDuration : 0,
                            easing: animation_easing,
                            queue: false,
                            complete: async function () {
                                appendMediaToMessage(chat[chat.length - 1], currentSwipeMessage);
                                await eventSource.emit(event_types.MESSAGE_SWIPED, chat.length - 1);
                                if (runGenerate && !is_send_press && parseInt(chat[chat.length - 1].swipe_id) === chat[chat.length - 1].swipes.length) {
                                    setSendButtonStateImpl(true);
                                    await generateImpl('swipe');
                                } else if (parseInt(chat[chat.length - 1].swipe_id) !== chat[chat.length - 1].swipes.length) {
                                    saveChatDebounced();
                                }
                            },
                        });
                    },
                });
            },
        });

        messageRoot.children('.avatar').transition({
            x: `-${swipeRange}`,
            duration: animation_duration > 0 ? swipeDuration : 0,
            easing: animation_easing,
            queue: false,
            complete: function () {
                messageRoot.children('.avatar').transition({
                    x: swipeRange,
                    duration: 0,
                    easing: animation_easing,
                    queue: false,
                    complete: function () {
                        messageRoot.children('.avatar').transition({
                            x: '0px',
                            duration: animation_duration > 0 ? swipeDuration : 0,
                            easing: animation_easing,
                            queue: false,
                        });
                    },
                });
            },
        });
    }
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
    const minId = startFromZero ? 0 : getFirstDisplayedMessageId();

    $('#chat').find('.mes').each(function (index, element) {
        $(element).attr('mesid', minId + index);
        $(element).find('.mesIDDisplay').text(`#${minId + index}`);
    });

    $('#chat .mes').removeClass('last_mes');
    $('#chat .mes').last().addClass('last_mes');

    updateEditArrowClasses();
}

export function getFirstDisplayedMessageId() {
    const allIds = Array.from(document.querySelectorAll('#chat .mes'))
        .map(el => Number(el.getAttribute('mesid')))
        .filter(x => !isNaN(x));
    const minId = Math.min(...allIds);
    return minId;
}

export function updateEditArrowClasses() {
    $('#chat .mes .mes_edit_up').removeClass('disabled');
    $('#chat .mes .mes_edit_down').removeClass('disabled');

    if (editedMessageId !== undefined) {
        const down = $(`#chat .mes[mesid="${editedMessageId}"] .mes_edit_down`);
        const up = $(`#chat .mes[mesid="${editedMessageId}"] .mes_edit_up`);
        const lastId = Number($('#chat .mes').last().attr('mesid'));
        const firstId = Number($('#chat .mes').first().attr('mesid'));

        if (lastId === Number(editedMessageId)) {
            down.addClass('disabled');
        }

        if (firstId === Number(editedMessageId)) {
            up.addClass('disabled');
        }
    }
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
    $('#dialogue_del_mes').css('display', 'none');
    $('#send_form').css('display', cssSendFormDisplay);
    $('.del_checkbox').each(function () {
        $(this).css('display', 'none');
        $(this).parent().children('.for_checkbox').css('display', 'block');
        $(this).parent().removeClass('selected');
        $(this).prop('checked', false);
    });
}

export function openMessageDelete(fromSlashCommand) {
    closeMessageEditor();
    hideSwipeButtons();
    if (fromSlashCommand || (!is_send_press) || (selected_group && !is_group_generating)) {
        $('#dialogue_del_mes').css('display', 'block');
        $('#send_form').css('display', 'none');
        $('.del_checkbox').each(function () {
            $(this).css('display', 'grid');
            $(this).parent().children('.for_checkbox').css('display', 'none');
        });
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
    $('.mes').children('.del_checkbox').each(function () {
        $(this).prop('checked', false);
        $(this).parent().removeClass('selected');
    });

    let currentMessageId = Number(messageId);
    $(`.mes[mesid="${currentMessageId}"]`).addClass('selected');
    deleteModeMessageId = currentMessageId;

    while (currentMessageId < chat.length) {
        $(`.mes[mesid="${currentMessageId}"]`).addClass('selected');
        $(`.mes[mesid="${currentMessageId}"]`).children('.del_checkbox').prop('checked', true);
        currentMessageId++;
    }

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
        $(`.mes[mesid="${deleteModeMessageId}"]`).nextAll('div').remove();
        $(`.mes[mesid="${deleteModeMessageId}"]`).remove();
        chat.length = deleteModeMessageId;
        chat_metadata.tainted = true;
        await saveChatConditional();
        const chatElement = $('#chat');
        chatElement.scrollTop(chatElement[0].scrollHeight);
        await eventSource.emit(event_types.MESSAGE_DELETED, chat.length);
        $('#chat .mes').removeClass('last_mes');
        $('#chat .mes').last().addClass('last_mes');
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

    mesBlock.find('.mes_text').append('<textarea id=\'curEditTextarea\' class=\'edit_textarea mdHotkeys\'></textarea>');
    $('#curEditTextarea').val(text);
    const editTextarea = mesBlock.find('.edit_textarea');
    if (!cssAutofit) {
        editTextarea.height(0);
        editTextarea.height(editTextarea[0].scrollHeight);
    }
    editTextarea.trigger('focus');
    const textAreaElement = /** @type {HTMLTextAreaElement} */ (editTextarea[0]);
    textAreaElement.setSelectionRange(
        String(editTextarea.val()).length,
        String(editTextarea.val()).length,
    );

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
    triggerElement.closest('.mes_edit_buttons').css('display', 'none');
    mesBlock.find('.mes_buttons').css('display', '');
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

function updateEditedMessage(div) {
    const mesBlock = div.closest('.mes_block');
    let text = mesBlock.find('.edit_textarea').val()
        ?? mesBlock.find('.mes_text').text();
    const mesElement = div.closest('.mes');
    const mes = chat[mesElement.attr('mesid')];

    let regexPlacement;
    if (mes.is_user) {
        regexPlacement = regex_placement.USER_INPUT;
    } else if (mes.extra?.type === 'narrator') {
        regexPlacement = regex_placement.SLASH_COMMAND;
    } else {
        regexPlacement = regex_placement.AI_OUTPUT;
    }

    text = getRegexedString(
        text,
        regexPlacement,
        {
            characterOverride: mes.extra?.type === 'narrator' ? undefined : mes.name,
            isEdit: true,
        },
    );

    if (power_user.trim_spaces) {
        text = text.trim();
    }

    const bias = substituteParams(extractMessageBias(text));
    text = substituteParams(text);
    if (bias) {
        text = removeMacros(text);
    }
    mes.mes = text;
    if (mes.swipe_id !== undefined) {
        mes.swipes[mes.swipe_id] = text;
    }

    if (!mes.extra) {
        mes.extra = {};
    }

    if (mes.is_system || mes.is_user || mes.extra.type === system_message_types.NARRATOR) {
        mes.extra.bias = bias ?? null;
    } else {
        mes.extra.bias = null;
    }

    chat_metadata.tainted = true;

    return { mesBlock, text, mes, bias };
}

export function messageEditAuto(div, currentEditedMessageName = editedMessageName, currentEditedMessageId = editedMessageId) {
    const { mesBlock, text, mes, bias } = updateEditedMessage(div);

    renderMessageEditPreview({
        mesBlock,
        text,
        bias,
        characterName: currentEditedMessageName,
        isSystem: mes.is_system,
        isUser: mes.is_user,
        messageId: currentEditedMessageId,
        formatMessage: messageFormatting,
    });
    saveChatDebounced();
}

export async function messageEditDone(div, currentEditedMessageName = editedMessageName, currentEditedMessageId = editedMessageId) {
    let { mesBlock, text, mes, bias } = updateEditedMessage(div);
    if (currentEditedMessageId == 0) {
        text = substituteParams(text);
    }

    await eventSource.emit(event_types.MESSAGE_EDITED, currentEditedMessageId);
    text = chat[currentEditedMessageId]?.mes ?? text;
    mesBlock.find('.mes_edit_buttons').css('display', 'none');
    mesBlock.find('.mes_buttons').css('display', '');
    renderMessageElementContent({
        messageElement: div.closest('.mes'),
        message: mes,
        messageId: currentEditedMessageId,
        text,
        bias,
        clearText: true,
        formatMessage: (content, name, isSystem, isUser, messageId, sanitizerOverrides = {}, isReasoning = false) => (
            name === mes.name
                ? messageFormatting(content, currentEditedMessageName, isSystem, isUser, messageId, sanitizerOverrides, isReasoning)
                : messageFormatting(content, name, isSystem, isUser, messageId, sanitizerOverrides, isReasoning)
        ),
        updateReasoningUI: updateReasoningUIImpl,
        addCopyToCodeBlocks: addCopyToCodeBlocksImpl,
        appendMediaToMessage,
    });

    const reasoningEditDone = mesBlock.find('.mes_reasoning_edit_done:visible');
    if (reasoningEditDone.length > 0) {
        reasoningEditDone.trigger('click');
    }

    await eventSource.emit(event_types.MESSAGE_UPDATED, currentEditedMessageId);
    clearEditedMessageState();
    await saveChatConditional();
}

export async function moveEditedMessageUp(trigger) {
    if (is_send_press || editedMessageId <= 0) {
        return editedMessageId;
    }

    hideSwipeButtons();
    const targetId = Number(editedMessageId) - 1;
    const triggerElement = $(trigger);
    const target = $(`#chat .mes[mesid="${targetId}"]`);
    const root = triggerElement.closest('.mes');

    if (root.length === 0 || target.length === 0) {
        return editedMessageId;
    }

    root.insertBefore(target);

    target.attr('mesid', editedMessageId);
    root.attr('mesid', targetId);

    const temp = chat[targetId];
    chat[targetId] = chat[editedMessageId];
    chat[editedMessageId] = temp;

    setEditedMessageId(targetId);
    updateViewMessageIds();
    await saveChatConditional();
    showSwipeButtons();
    return editedMessageId;
}

export async function moveEditedMessageDown(trigger) {
    if (is_send_press || editedMessageId >= chat.length - 1) {
        return editedMessageId;
    }

    hideSwipeButtons();
    const targetId = Number(editedMessageId) + 1;
    const triggerElement = $(trigger);
    const target = $(`#chat .mes[mesid="${targetId}"]`);
    const root = triggerElement.closest('.mes');

    if (root.length === 0 || target.length === 0) {
        return editedMessageId;
    }

    root.insertAfter(target);

    target.attr('mesid', editedMessageId);
    root.attr('mesid', targetId);

    const temp = chat[targetId];
    chat[targetId] = chat[editedMessageId];
    chat[editedMessageId] = temp;

    setEditedMessageId(targetId);
    updateViewMessageIds();
    await saveChatConditional();
    showSwipeButtons();
    return editedMessageId;
}

export async function copyEditedMessage(trigger) {
    const confirmation = await callGenericPopup(t`Create a copy of this message?`, POPUP_TYPE.CONFIRM);
    if (!confirmation) {
        return false;
    }

    hideSwipeButtons();
    const chatElement = $('#chat');
    const oldScroll = chatElement[0].scrollTop;
    const clone = structuredClone(chat[editedMessageId]);
    clone.send_date = Date.now();
    clone.mes = $(trigger).closest('.mes').find('.edit_textarea').val();

    if (power_user.trim_spaces) {
        clone.mes = clone.mes.trim();
    }

    chat.splice(Number(editedMessageId) + 1, 0, clone);
    addOneMessage(clone, { insertAfter: editedMessageId });

    updateViewMessageIds();
    await saveChatConditional();
    chatElement[0].scrollTop = oldScroll;
    showSwipeButtons();
    return true;
}

export async function deleteEditedMessage(trigger, customData = {}) {
    const fromSlashCommand = customData?.fromSlashCommand || false;
    const canDeleteSwipe = (
        Array.isArray(chat[editedMessageId]?.swipes) &&
        chat[editedMessageId].swipes.length > 1 &&
        !chat[editedMessageId].is_user &&
        parseInt(editedMessageId) === chat.length - 1
    );

    let deleteOnlySwipe = false;
    if (power_user.confirm_message_delete && fromSlashCommand !== true) {
        const result = await callGenericPopup(t`Are you sure you want to delete this message?`, POPUP_TYPE.CONFIRM, null, {
            okButton: canDeleteSwipe ? t`Delete Swipe` : t`Delete Message`,
            cancelButton: 'Cancel',
            customButtons: canDeleteSwipe ? [t`Delete Message`] : null,
        });
        if (!result) {
            return false;
        }
        deleteOnlySwipe = canDeleteSwipe && result === 1;
    }

    const messageElement = $(trigger).closest('.mes');
    if (!messageElement.length) {
        return false;
    }

    if (deleteOnlySwipe) {
        const message = chat[editedMessageId];
        await deleteSwipe(message.swipe_id);
        return true;
    }

    chat.splice(editedMessageId, 1);
    messageElement.remove();

    const startFromZero = Number(editedMessageId) === 0;

    clearEditedMessageState();
    chat_metadata.tainted = true;

    updateViewMessageIds(startFromZero);
    saveChatDebounced();

    hideSwipeButtons();
    showSwipeButtons();

    await eventSource.emit(event_types.MESSAGE_DELETED, chat.length);
    return true;
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
