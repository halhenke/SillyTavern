export async function runFirstLoadInit({
    setToken,
    setCsrfToken,
    t,
    showLoader,
    hideLoader,
    registerPromptManagerMigration,
    initStandaloneMode,
    initLibraryShims,
    addShowdownPatch,
    showdown,
    addDOMPurifyHooks,
    reloadMarkdownProcessor,
    applyBrowserFixes,
    getClientVersion,
    initSecrets,
    readSecretState,
    initLocales,
    initChatUtilities,
    initDefaultSlashCommands,
    initTextGenModels,
    initOpenAI,
    initTextGenSettings,
    initKoboldSettings,
    initNovelAISettings,
    initSystemPrompts,
    initExtensions,
    initExtensionSlashCommands,
    toolManager,
    initPresetManager,
    initSystemMessages,
    getSettings,
    initKeyboard,
    initDynamicStyles,
    initTags,
    initBookmarks,
    initMacros,
    getUserAvatars,
    getUserAvatar,
    getCharacters,
    getBackgrounds,
    initTokenizers,
    initBackgrounds,
    initAuthorsNote,
    initPersonas,
    initWorldInfo,
    initHorde,
    initRossMods,
    initStats,
    initCfg,
    initLogprobs,
    initInputMarkdown,
    initServerHistory,
    initSettingsSearch,
    initBulkEdit,
    initReasoning,
    initWelcomeScreen,
    initScrapers,
    initCustomSelectedSamplers,
    initDataMaid,
    initItemizedPrompts,
    addDebugFunctions,
    doDailyExtensionUpdatesCheck,
    fixViewport,
    eventSource,
    eventTypes,
}) {
    try {
        const tokenResponse = await fetch('/csrf-token');
        const tokenData = await tokenResponse.json();
        setToken(tokenData.token);
        setCsrfToken(tokenData.token);
    } catch {
        toastr.error(t`Couldn't get CSRF token. Please refresh the page.`, t`Error`, { timeOut: 0, extendedTimeOut: 0, preventDuplicates: true });
        throw new Error('Initialization failed');
    }

    showLoader();
    registerPromptManagerMigration();
    initStandaloneMode();
    initLibraryShims();
    addShowdownPatch(showdown);
    addDOMPurifyHooks();
    reloadMarkdownProcessor();
    applyBrowserFixes();
    await getClientVersion();
    await initSecrets();
    await readSecretState();
    await initLocales();
    initChatUtilities();
    initDefaultSlashCommands();
    initTextGenModels();
    initOpenAI();
    initTextGenSettings();
    initKoboldSettings();
    initNovelAISettings();
    initSystemPrompts();
    initExtensions();
    initExtensionSlashCommands();
    toolManager.initToolSlashCommands();
    await initPresetManager();
    await initSystemMessages();
    await getSettings();
    initKeyboard();
    initDynamicStyles();
    initTags();
    initBookmarks();
    initMacros();
    await getUserAvatars(true, getUserAvatar());
    await getCharacters();
    await getBackgrounds();
    await initTokenizers();
    initBackgrounds();
    initAuthorsNote();
    await initPersonas();
    initWorldInfo();
    initHorde();
    initRossMods();
    initStats();
    initCfg();
    initLogprobs();
    initInputMarkdown();
    initServerHistory();
    initSettingsSearch();
    initBulkEdit();
    initReasoning();
    initWelcomeScreen();
    await initScrapers();
    initCustomSelectedSamplers();
    initDataMaid();
    initItemizedPrompts();
    addDebugFunctions();
    doDailyExtensionUpdatesCheck();
    await hideLoader();
    await fixViewport();
    await eventSource.emit(eventTypes.APP_READY);
}
