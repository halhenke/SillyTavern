import { event_types, eventSource } from './events.js';
import { online_status, syncOnlineStatus } from './generation-core.js';
import { AbortReason } from './util/AbortReason.js';

export let abortStatusCheck = new AbortController();

/**
 * Binds legacy backend status functions to standalone wrappers.
 * Backend status core now owns its own implementation surface.
 */
export function bindBackendStatusCore() {}

/**
 * Synchronizes the current abort controller instance.
 * @param {AbortController} controller Abort controller
 */
export function setAbortStatusCheck(controller) {
    abortStatusCheck = controller;
}

export function cancelStatusCheck(reason = 'Manually cancelled status check') {
    abortStatusCheck?.abort(new AbortReason(reason));
    abortStatusCheck = new AbortController();
    setOnlineStatus('no_connection');
    return abortStatusCheck;
}

export function displayOnlineStatus() {
    const indicatorNodes = document.querySelectorAll('.online_status_indicator');
    const textNodes = document.querySelectorAll('.online_status_text');
    const noConnectionText = document.getElementById('API-status-top')?.getAttribute('no_connection_text') ?? '';

    for (const node of indicatorNodes) {
        node.classList.toggle('success', online_status !== 'no_connection');
    }

    for (const node of textNodes) {
        node.textContent = online_status === 'no_connection' ? noConnectionText : online_status;
    }
}

export function setOnlineStatus(value) {
    const previousStatus = online_status;
    syncOnlineStatus(value);
    displayOnlineStatus();
    if (previousStatus !== online_status) {
        eventSource.emitAndWait(event_types.ONLINE_STATUS_CHANGED, online_status);
    }
    return online_status;
}

export function startStatusLoading() {
    for (const node of document.querySelectorAll('.api_loading')) {
        node instanceof HTMLElement && (node.style.display = '');
    }
    for (const node of document.querySelectorAll('.api_button')) {
        node.classList.add('disabled');
    }
}

export function stopStatusLoading() {
    for (const node of document.querySelectorAll('.api_loading')) {
        node instanceof HTMLElement && (node.style.display = 'none');
    }
    for (const node of document.querySelectorAll('.api_button')) {
        node.classList.remove('disabled');
    }
}

export function resultCheckStatus() {
    displayOnlineStatus();
    stopStatusLoading();
}
