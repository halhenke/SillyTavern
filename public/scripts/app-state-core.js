export let DEFAULT_PRINT_TIMEOUT = 0;
export let entitiesFilter = null;
export let isChatSaving = false;
export let menu_type = '';

/**
 * Binds legacy app-state implementations to standalone wrappers.
 * App-state core now owns its own implementation surface.
 */
export function bindAppStateCore() {}

export function syncDefaultPrintTimeout(value) {
    DEFAULT_PRINT_TIMEOUT = value;
}

export function syncEntitiesFilter(value) {
    entitiesFilter = value;
}

export function syncIsChatSaving(value) {
    isChatSaving = Boolean(value);
}

export function syncMenuType(value) {
    menu_type = value;
}

export function setMenuType(value) {
    syncMenuType(value);
    document.getElementById('right-nav-panel').dataset.menuType = menu_type;
    return menu_type;
}
