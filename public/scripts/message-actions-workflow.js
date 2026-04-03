import { chat_metadata } from './chat-core.js';
import { event_types, eventSource } from './events.js';
import { t } from './i18n.js';
import { moveMessageListRow } from './message-list-renderer.js';
import { POPUP_TYPE, callGenericPopup } from './popup.js';
import { power_user } from './power-user.js';

export async function moveEditedMessageUpWorkflow({
    trigger,
    chat,
    editedMessageId,
    isSendPress,
    hideSwipeButtons,
    setEditedMessageId,
    updateViewMessageIds,
    saveChatConditional,
    showSwipeButtons,
}) {
    if (isSendPress || editedMessageId <= 0) {
        return editedMessageId;
    }

    hideSwipeButtons();
    const targetId = Number(editedMessageId) - 1;
    const { root, target, moved } = moveMessageListRow({ trigger, targetId, direction: 'up' });

    if (!moved) {
        return editedMessageId;
    }

    target.attr('mesid', editedMessageId);
    root.attr('mesid', targetId);

    const temp = chat[targetId];
    chat[targetId] = chat[editedMessageId];
    chat[editedMessageId] = temp;

    setEditedMessageId(targetId);
    updateViewMessageIds();
    await saveChatConditional();
    showSwipeButtons();
    return targetId;
}

export async function moveEditedMessageDownWorkflow({
    trigger,
    chat,
    editedMessageId,
    isSendPress,
    hideSwipeButtons,
    setEditedMessageId,
    updateViewMessageIds,
    saveChatConditional,
    showSwipeButtons,
}) {
    if (isSendPress || editedMessageId >= chat.length - 1) {
        return editedMessageId;
    }

    hideSwipeButtons();
    const targetId = Number(editedMessageId) + 1;
    const { root, target, moved } = moveMessageListRow({ trigger, targetId, direction: 'down' });

    if (!moved) {
        return editedMessageId;
    }

    target.attr('mesid', editedMessageId);
    root.attr('mesid', targetId);

    const temp = chat[targetId];
    chat[targetId] = chat[editedMessageId];
    chat[editedMessageId] = temp;

    setEditedMessageId(targetId);
    updateViewMessageIds();
    await saveChatConditional();
    showSwipeButtons();
    return targetId;
}

export async function copyEditedMessageWorkflow({
    trigger,
    chat,
    editedMessageId,
    hideSwipeButtons,
    addOneMessage,
    updateViewMessageIds,
    saveChatConditional,
    showSwipeButtons,
}) {
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

export async function deleteEditedMessageWorkflow({
    trigger,
    customData = {},
    chat,
    editedMessageId,
    clearEditedMessageState,
    updateViewMessageIds,
    saveChatDebounced,
    hideSwipeButtons,
    showSwipeButtons,
    deleteSwipe,
}) {
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
