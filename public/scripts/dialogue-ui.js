export function initDialogueUiBindings({
    getAnimationDuration,
    getAnimationEasing,
    handleDeleteChat,
    getSelectedGroup,
    getChatFileForDelete,
    setChatFileForDelete,
    showDeleteChatConfirm,
    toggleAdvancedCharacterPopup,
    closeAdvancedCharacterPopup,
    getDialogueCloseStop,
    setDialogueCloseStop,
    getPopupType,
    setPopupType,
    getDialogueResolve,
    setDialogueResolve,
    cancelDeleteMode,
    confirmDeleteMode,
    cssSendFormDisplay,
}) {
    $(document).on('click', '.PastChat_cross', async function (e, { fromSlashCommand = false } = {}) {
        e.stopPropagation();
        const chatFile = $(this).attr('file_name');
        setChatFileForDelete(chatFile);
        console.debug('detected cross click for' + chatFile);

        if (fromSlashCommand) {
            await handleDeleteChat(chatFile, getSelectedGroup(), true);
            return;
        }

        const result = await showDeleteChatConfirm();
        if (result) {
            await handleDeleteChat(chatFile, getSelectedGroup(), false);
        }
    });

    $('#advanced_div').on('click', function () {
        toggleAdvancedCharacterPopup();
    });

    $('#character_cross').on('click', function () {
        closeAdvancedCharacterPopup();
    });

    $('#character_popup_ok').on('click', function () {
        closeAdvancedCharacterPopup({ animate: false });
    });

    $('#dialogue_popup_ok').on('click', async function (_e, customData) {
        const fromSlashCommand = customData?.fromSlashCommand || false;
        setDialogueCloseStop(false);
        $('#shadow_popup').transition({
            opacity: 0,
            duration: getAnimationDuration(),
            easing: getAnimationEasing(),
        });
        setTimeout(function () {
            if (getDialogueCloseStop()) {
                return;
            }
            $('#shadow_popup').css('display', 'none');
            $('#dialogue_popup').removeClass('large_dialogue_popup');
            $('#dialogue_popup').removeClass('wide_dialogue_popup');
        }, getAnimationDuration());

        if (getPopupType() == 'del_chat') {
            await handleDeleteChat(getChatFileForDelete(), getSelectedGroup(), fromSlashCommand);
        }

        const dialogueResolve = getDialogueResolve();
        if (dialogueResolve) {
            if (getPopupType() == 'input') {
                dialogueResolve($('#dialogue_popup_input').val());
                $('#dialogue_popup_input').val('');
            } else {
                dialogueResolve(true);
            }

            setDialogueResolve(null);
        }
    });

    $('#dialogue_popup_cancel').on('click', function () {
        setDialogueCloseStop(false);
        $('#shadow_popup').transition({
            opacity: 0,
            duration: getAnimationDuration(),
            easing: getAnimationEasing(),
        });
        setTimeout(function () {
            if (getDialogueCloseStop()) {
                return;
            }
            $('#shadow_popup').css('display', 'none');
            $('#dialogue_popup').removeClass('large_dialogue_popup');
        }, getAnimationDuration());

        setPopupType('');

        const dialogueResolve = getDialogueResolve();
        if (dialogueResolve) {
            dialogueResolve(false);
            setDialogueResolve(null);
        }
    });

    $('#dialogue_del_mes_cancel').on('click', function () {
        cancelDeleteMode(cssSendFormDisplay);
    });

    $('#dialogue_del_mes_ok').on('click', async function () {
        await confirmDeleteMode(cssSendFormDisplay);
    });

    $('#select_chat_cross').on('click', function () {
        $('#shadow_select_chat_popup').transition({
            opacity: 0,
            duration: getAnimationDuration(),
            easing: getAnimationEasing(),
        });
        setTimeout(function () {
            $('#shadow_select_chat_popup').css('display', 'none');
        }, getAnimationDuration());
    });
}
