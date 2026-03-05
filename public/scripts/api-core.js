export let CLIENT_VERSION = 'SillyTavern:UNKNOWN:Cohee#1207';
export let CONNECT_API_MAP = {};
export let main_api;
export let nai_settings = {};

export function syncClientVersion(value) {
    CLIENT_VERSION = value;
}

export function syncConnectApiMap(value) {
    CONNECT_API_MAP = value;
}

export function syncMainApi(value) {
    main_api = value;
}

export function syncNaiSettings(value) {
    nai_settings = value;
}
