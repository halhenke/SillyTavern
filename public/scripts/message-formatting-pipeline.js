import { regex_placement } from './extensions/regex/engine.js';

export function substituteFirstChatMessage(message, {
    chat,
    messageId,
    isSystem,
    isUser,
    isReasoning,
    characterName,
    substituteParams,
}) {
    if (Number(messageId) !== 0 || isSystem || isUser || isReasoning) {
        return message;
    }

    const beforeReplace = message;
    const chatMessage = chat[messageId];
    const substituted = substituteParams(message, undefined, characterName);
    if (chatMessage && chatMessage.mes === beforeReplace && chatMessage.extra?.display_text !== beforeReplace) {
        chatMessage.mes = substituted;
    }

    return substituted;
}

export function normalizeMessageAuthorFlags({
    characterName,
    isSystem,
    isUser,
    commentNameDefault,
    systemUserName,
}) {
    let normalizedIsSystem = isSystem;

    if (characterName === commentNameDefault && normalizedIsSystem && !isUser) {
        normalizedIsSystem = false;
    }

    if (normalizedIsSystem && characterName !== systemUserName) {
        normalizedIsSystem = false;
    }

    return { isSystem: normalizedIsSystem, isUser };
}

export function stripVisibleUserPromptBias(message, {
    userPromptBias,
    showUserPromptBias,
    characterName,
    isUser,
    isSystem,
    substituteParams,
}) {
    const replacedPromptBias = userPromptBias && substituteParams(userPromptBias);
    if (!showUserPromptBias && characterName && !isUser && !isSystem && replacedPromptBias && message.startsWith(replacedPromptBias)) {
        return message.slice(replacedPromptBias.length);
    }

    return message;
}

export function getMessageFormattingRegexPlacement({
    chat,
    messageId,
    isReasoning,
    isUser,
}) {
    try {
        if (isReasoning) {
            return regex_placement.REASONING;
        }
        if (isUser) {
            return regex_placement.USER_INPUT;
        }
        if (chat[messageId]?.extra?.type === 'narrator') {
            return regex_placement.SLASH_COMMAND;
        }
        return regex_placement.AI_OUTPUT;
    } catch {
        return regex_placement.AI_OUTPUT;
    }
}

export function getMessageFormattingDepth(chat, messageId) {
    const usableMessages = chat
        .map((message, index) => ({ message, index }))
        .filter(x => !x.message.is_system);
    const indexOf = usableMessages.findIndex(x => x.index === Number(messageId));
    return messageId >= 0 && indexOf !== -1 ? (usableMessages.length - indexOf - 1) : undefined;
}

export function encodeHtmlTagDelimiters(message) {
    return message.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function escapeConfiguredReasoningMarkers(message, reasoningPrefix, reasoningSuffix, escapeHtml) {
    let output = message;

    [reasoningPrefix, reasoningSuffix].forEach((reasoningString) => {
        if (!reasoningString || !reasoningString.trim().length) {
            return;
        }
        if (output.includes(reasoningString)) {
            output = output.replace(reasoningString, escapeHtml(reasoningString));
        }
    });

    return output;
}

export function renderMarkdownMessage(message, {
    encodeTags,
    converter,
}) {
    let output = message;

    if (!encodeTags) {
        output = output.replace(/<([^>]+)>/g, function (_, contents) {
            return '<' + contents.replace(/"/g, '\ufffe') + '>';
        });
    }

    output = output.replace(
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

    if (!encodeTags) {
        output = output.replace(/\ufffe/g, '"');
    }

    output = output.replaceAll('\\begin{align*}', '$$');
    output = output.replaceAll('\\end{align*}', '$$');
    output = converter.makeHtml(output);

    output = output.replace(/<code(.*)>[\s\S]*?<\/code>/g, function (match) {
        return match.replace(/\n/gm, '\u0000');
    });
    output = output.replace(/\u0000/g, '\n');
    output = output.trim();

    output = output.replace(/<code(.*)>[\s\S]*?<\/code>/g, function (match) {
        return match.replace(/&amp;/g, '&');
    });

    return output;
}

export function sanitizeFormattedMessage(message, {
    DOMPurify,
    sanitizerOverrides = {},
    encodeStyleTags,
    decodeStyleTags,
}) {
    const config = {
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: false,
        MESSAGE_SANITIZE: true,
        ADD_TAGS: ['custom-style'],
        ...sanitizerOverrides,
    };

    let output = encodeStyleTags(message);
    output = DOMPurify.sanitize(output, config);
    output = decodeStyleTags(output, { prefix: '.mes_text ' });
    return output;
}
