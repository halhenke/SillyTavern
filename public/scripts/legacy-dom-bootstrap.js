import { DragAndDropHandler } from './dragdrop.js';

export async function initLegacyDomBootstrap({
    cancelStatusCheck,
    initApiLoadingBindings,
    initSendTextareaFocusRetention,
    initSwipeSettingsBindings,
    showSwipeButtons,
    hideSwipeButtons,
    initLastMessageSwipeBindings,
    initCharacterSearch,
    initMessageShortcutBindings,
    initSessionNavigationBindings,
    selectGroupChats,
    initBogusFolderBindings,
    chatElement,
    debounceMs,
    initEditTextareaAutoFit,
    initChatScrollBindings,
    getWaifuModeEnabled,
    getScrollLock,
    setScrollLock,
    initDeleteModeSelectionBindings,
    initDialogueUiBindings,
    dialogueUiDeps,
    initCharacterCreateBindings,
    initCharacterDeleteBinding,
    initCharacterEditorBindings,
    initChatManagementBindings,
    initOptionsMenu,
    optionsPopper,
    initOptionsActionBindings,
    optionsActionDeps,
    initMainApiBindings,
    initSettingsSliderBindings,
    initMessageCopyBinding,
    initMessageEditBindings,
    getCanEditMessages,
    getAutoSaveMessageEditsEnabled,
    setCurrentEditedMessageId,
    initMessageActionRevealBindings,
    getExpandMessageActionsEnabled,
    initCharacterImportExportBindings,
    exportPopper,
    initChatImportBindings,
    initCharacterGroupNavBindings,
    setSelectedButton,
    selectRmCharacters,
    duplicateCharacter,
    initExecutionControlBindings,
    initDrawerBindings,
    doDrawerOpenClick,
    doNavbarIconClick,
    initDrawerClickAwayBindings,
    initInlineDrawerBindings,
    initMessageAvatarZoomBindings,
    avatarZoomDeps,
    initWorldInfoDrawerBindings,
    delay,
    initCharacterPanelBindings,
    initAutoSelectBindings,
    getAutoSelectEnabled,
    initEscapeKeyBindings,
    closeMessageEditor,
    getEditedMessageId,
    initCharacterManagementDropdownBindings,
    getCharacterSource,
    importTags,
    initManageScreenBindings,
    initUnloadBindings,
    cancelTtsPlay,
    getStreamingProcessor,
    getIsChatSaving,
    initRangeInputBindings,
    initStatsButtonBindings,
    userStatsHandler,
    initExternalImportBindings,
    importExternalContent,
    initCharacterDragDropBindings,
    importFromURL,
    processDroppedFiles,
    setCharDragDropHandler,
    initChatHistoryBindings,
    showMoreMessages,
    getCharacters,
    emitOpenCharacterLibrary,
    firstLoadInit,
}) {
    setTimeout(function () {
        $('#groupControlsToggle').trigger('click');
        $('#groupCurrentMemberListToggle .inline-drawer-icon').trigger('click');
    }, 200);

    initApiLoadingBindings({ cancelStatusCheck });
    initSendTextareaFocusRetention();
    initSwipeSettingsBindings({
        showSwipeButtons,
        hideSwipeButtons,
    });
    initLastMessageSwipeBindings();

    initCharacterSearch();
    initMessageShortcutBindings();
    initSessionNavigationBindings({ selectGroupChats });
    initBogusFolderBindings();

    const cssAutofit = CSS.supports('field-sizing', 'content');
    initEditTextareaAutoFit({ chatElement, debounceMs });
    initChatScrollBindings({
        chatElement: document.getElementById('chat'),
        getWaifuModeEnabled,
        getScrollLock,
        setScrollLock,
    });
    initDeleteModeSelectionBindings();

    initDialogueUiBindings(dialogueUiDeps);

    initCharacterCreateBindings();
    initCharacterDeleteBinding();
    initCharacterEditorBindings();
    initChatManagementBindings();

    initOptionsMenu({ popper: optionsPopper });
    initOptionsActionBindings(optionsActionDeps);

    initMainApiBindings({ cancelStatusCheck });
    initSettingsSliderBindings();

    initMessageCopyBinding();
    initMessageEditBindings({
        getCssAutofit: () => cssAutofit,
        getCanEditMessages,
        getAutoSaveMessageEditsEnabled,
        setCurrentEditedMessageId,
    });
    initMessageActionRevealBindings({
        getExpandMessageActionsEnabled,
    });

    initCharacterImportExportBindings({ exportPopper });
    initChatImportBindings();
    initCharacterGroupNavBindings({
        setSelectedButton,
        selectGroupChats,
        selectRmCharacters,
        duplicateCharacter,
    });

    initExecutionControlBindings();
    initDrawerBindings({
        doDrawerOpenClick,
        doNavbarIconClick,
    });
    initDrawerClickAwayBindings();

    initInlineDrawerBindings();
    initMessageAvatarZoomBindings(avatarZoomDeps);
    initWorldInfoDrawerBindings({ delay });

    initCharacterPanelBindings();

    initAutoSelectBindings({
        getAutoSelectEnabled,
    });

    initEscapeKeyBindings({
        getAutoSaveMessageEditsEnabled,
        closeMessageEditor,
        getEditedMessageId,
    });

    initCharacterManagementDropdownBindings({ getCharacterSource, importTags });
    initManageScreenBindings({
        closeSelectChatPopup: () => $('#select_chat_cross').trigger('click'),
    });

    initUnloadBindings({
        cancelTtsPlay,
        getStreamingProcessor,
        getIsChatSaving,
    });

    initRangeInputBindings();
    initStatsButtonBindings({ userStatsHandler });
    initExternalImportBindings({ importExternalContent });
    initCharacterDragDropBindings({
        createDragAndDropHandler: (onDrop) => new DragAndDropHandler('body', onDrop, { noAnimation: true }),
        importFromURL,
        processDroppedFiles,
        setCharDragDropHandler,
    });
    initChatHistoryBindings({
        showMoreMessages,
        getCharacters,
        emitOpenCharacterLibrary,
    });

    await firstLoadInit();
}
