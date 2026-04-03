function getTargetMessage(chat, messageId, contextName) {
    if (!chat.length) {
        return null;
    }

    const targetMessageId = messageId ?? chat.length - 1;
    if (targetMessageId >= chat.length || targetMessageId < 0) {
        console.warn(`[${contextName}] Invalid message ID: ${messageId}`);
        return null;
    }

    const targetMessage = chat[targetMessageId];
    if (!targetMessage) {
        return null;
    }

    return { targetMessageId, targetMessage };
}

function normalizeSwipeState(targetMessage) {
    if (typeof targetMessage.swipe_id !== 'number') {
        targetMessage.swipe_id = 0;
    }

    if (!Array.isArray(targetMessage.swipes)) {
        targetMessage.swipes = [];
    }

    if (!Array.isArray(targetMessage.swipe_info)) {
        targetMessage.swipe_info = [];
    }
}

function stripTransientSwipeExtra(targetMessage, { includeMedia = false } = {}) {
    if (!targetMessage.extra) {
        return;
    }

    delete targetMessage.extra.memory;
    delete targetMessage.extra.display_text;

    if (includeMedia) {
        delete targetMessage.extra.image;
        delete targetMessage.extra.image_swipes;
        delete targetMessage.extra.video;
        delete targetMessage.extra.inline_image;
    }
}

function ensureInitialSwipeState(targetMessage) {
    if (targetMessage.swipe_id === undefined) {
        targetMessage.swipe_id = 0;
        targetMessage.swipes = [];
        targetMessage.swipe_info = [];
        targetMessage.swipes[0] = targetMessage.mes;
        targetMessage.swipe_info[0] = {
            send_date: targetMessage.send_date,
            gen_started: targetMessage.gen_started,
            gen_finished: targetMessage.gen_finished,
            extra: structuredClone(targetMessage.extra),
        };
    }

    normalizeSwipeState(targetMessage);
}

export function syncMessageToSwipe(chat, messageId = null) {
    const target = getTargetMessage(chat, messageId, 'syncMesToSwipe');
    if (!target) {
        return false;
    }

    const { targetMessage } = target;
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

export function syncSwipeToMessage(chat, messageId = null, swipeId = null) {
    const target = getTargetMessage(chat, messageId, 'syncSwipeToMes');
    if (!target) {
        return false;
    }

    const { targetMessage } = target;
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

export function preparePreviousSwipe(chat, { messageId = null, source, repeated } = {}) {
    const target = getTargetMessage(chat, messageId, 'preparePreviousSwipe');
    if (!target) {
        return { aborted: true };
    }

    const { targetMessageId, targetMessage } = target;
    if (source === 'keyboard' && repeated && targetMessage.swipe_id === 0) {
        return { aborted: true, targetMessageId, targetMessage };
    }

    targetMessage.swipe_id--;
    if (targetMessage.swipe_id < 0) {
        targetMessage.swipe_id = targetMessage.swipes.length - 1;
    }

    if (targetMessage.swipe_id < 0) {
        targetMessage.swipe_id = 0;
        return { aborted: true, targetMessageId, targetMessage };
    }

    if (!Array.isArray(targetMessage.swipe_info)) {
        targetMessage.swipe_info = [];
    }

    targetMessage.mes = targetMessage.swipes[targetMessage.swipe_id];
    targetMessage.send_date = targetMessage.swipe_info[targetMessage.swipe_id]?.send_date || targetMessage.send_date;
    targetMessage.extra = structuredClone(targetMessage.swipe_info[targetMessage.swipe_id]?.extra || targetMessage.extra);
    stripTransientSwipeExtra(targetMessage);

    return { aborted: false, targetMessageId, targetMessage };
}

export function prepareNextSwipe(chat, { messageId = null, source, repeated, isPristine = false } = {}) {
    const target = getTargetMessage(chat, messageId, 'prepareNextSwipe');
    if (!target) {
        return { aborted: true };
    }

    const { targetMessageId, targetMessage } = target;
    ensureInitialSwipeState(targetMessage);

    if (chat.length === 1 && targetMessage.swipe_id === targetMessage.swipes.length - 1 && isPristine) {
        targetMessage.swipe_id = 0;
    } else {
        if (source === 'keyboard' && repeated && targetMessage.swipe_id === targetMessage.swipes.length - 1) {
            return { aborted: true, targetMessageId, targetMessage };
        }
        targetMessage.swipe_id++;
    }

    stripTransientSwipeExtra(targetMessage, { includeMedia: true });

    let runGenerate = false;
    let runSwipeRight = false;

    if (parseInt(targetMessage.swipe_id) === targetMessage.swipes.length && (chat.length !== 1 || !isPristine)) {
        delete targetMessage.gen_started;
        delete targetMessage.gen_finished;
        runGenerate = true;
    } else if (parseInt(targetMessage.swipe_id) < targetMessage.swipes.length) {
        targetMessage.mes = targetMessage.swipes[targetMessage.swipe_id];
        targetMessage.send_date = targetMessage.swipe_info[targetMessage.swipe_id]?.send_date || targetMessage.send_date;
        targetMessage.extra = structuredClone(targetMessage.swipe_info[targetMessage.swipe_id]?.extra || targetMessage.extra || []);
        runSwipeRight = true;
    }

    if (targetMessage.swipe_id > targetMessage.swipes.length) {
        targetMessage.swipe_id = targetMessage.swipes.length;
    }

    return {
        aborted: !runGenerate && !runSwipeRight,
        targetMessageId,
        targetMessage,
        runGenerate,
        runSwipeRight,
    };
}
