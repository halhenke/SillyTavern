let setMenuTypeImpl = null;

export let DEFAULT_PRINT_TIMEOUT = 0;
export let entitiesFilter = null;
export let isChatSaving = false;
export let menu_type = '';

/**
 * Binds legacy app-state implementations to standalone wrappers.
 * @param {{
 *   setMenuType: (value: string) => void,
 * }} impl Implementations to bind
 */
export function bindAppStateCore(impl) {
    setMenuTypeImpl = impl?.setMenuType ?? null;
}

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
    if (setMenuTypeImpl) {
        return setMenuTypeImpl(value);
    }

    syncMenuType(value);
}
