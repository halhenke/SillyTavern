export function resetDeleteModeUi(cssSendFormDisplay) {
    $('#dialogue_del_mes').css('display', 'none');
    $('#send_form').css('display', cssSendFormDisplay);
    $('.del_checkbox').each(function () {
        $(this).css('display', 'none');
        $(this).parent().children('.for_checkbox').css('display', 'block');
        $(this).parent().removeClass('selected');
        $(this).prop('checked', false);
    });
}

export function showDeleteModeUi() {
    $('#dialogue_del_mes').css('display', 'block');
    $('#send_form').css('display', 'none');
    $('.del_checkbox').each(function () {
        $(this).css('display', 'grid');
        $(this).parent().children('.for_checkbox').css('display', 'none');
    });
}

export function selectDeleteModeRange(messageId, chatLength) {
    $('.mes').children('.del_checkbox').each(function () {
        $(this).prop('checked', false);
        $(this).parent().removeClass('selected');
    });

    let currentMessageId = Number(messageId);
    $(`.mes[mesid="${currentMessageId}"]`).addClass('selected');

    while (currentMessageId < chatLength) {
        $(`.mes[mesid="${currentMessageId}"]`).addClass('selected');
        $(`.mes[mesid="${currentMessageId}"]`).children('.del_checkbox').prop('checked', true);
        currentMessageId++;
    }
}

export function removeDeleteModeMessages(deleteModeMessageId) {
    $(`.mes[mesid="${deleteModeMessageId}"]`).nextAll('div').remove();
    $(`.mes[mesid="${deleteModeMessageId}"]`).remove();
    $('#chat .mes').removeClass('last_mes');
    $('#chat .mes').last().addClass('last_mes');
    const chatElement = $('#chat');
    chatElement.scrollTop(chatElement[0].scrollHeight);
}
