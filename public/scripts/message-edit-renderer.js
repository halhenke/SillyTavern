export function enterMessageEditMode({ mesBlock, text, cssAutofit }) {
    mesBlock.find('.mes_text').empty();
    mesBlock.find('.mes_buttons').css('display', 'none');
    mesBlock.find('.mes_edit_buttons').css('display', 'inline-flex');
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

    return editTextarea;
}

export function exitMessageEditMode(mesBlock, triggerElement = null) {
    if (triggerElement) {
        triggerElement.closest('.mes_edit_buttons').css('display', 'none');
    } else {
        mesBlock.find('.mes_edit_buttons').css('display', 'none');
    }

    mesBlock.find('.mes_buttons').css('display', '');
}
