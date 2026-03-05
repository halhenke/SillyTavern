let setOnlineStatusImpl = null;
let startStatusLoadingImpl = null;
let resultCheckStatusImpl = null;

export let abortStatusCheck = new AbortController();

function throwUnbound(name) {
    throw new Error(`[backend-status-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy backend status functions to standalone wrappers.
 * @param {{
 *   setOnlineStatus: (value: string) => void,
 *   startStatusLoading: () => void,
 *   resultCheckStatus: () => void,
 * }} impl Implementations to bind
 */
export function bindBackendStatusCore(impl) {
    setOnlineStatusImpl = impl?.setOnlineStatus ?? null;
    startStatusLoadingImpl = impl?.startStatusLoading ?? null;
    resultCheckStatusImpl = impl?.resultCheckStatus ?? null;
}

/**
 * Synchronizes the current abort controller instance.
 * @param {AbortController} controller Abort controller
 */
export function setAbortStatusCheck(controller) {
    abortStatusCheck = controller;
}

export function setOnlineStatus(...args) {
    if (!setOnlineStatusImpl) {
        throwUnbound('setOnlineStatus');
    }

    return setOnlineStatusImpl(...args);
}

export function startStatusLoading(...args) {
    if (!startStatusLoadingImpl) {
        throwUnbound('startStatusLoading');
    }

    return startStatusLoadingImpl(...args);
}

export function resultCheckStatus(...args) {
    if (!resultCheckStatusImpl) {
        throwUnbound('resultCheckStatus');
    }

    return resultCheckStatusImpl(...args);
}
