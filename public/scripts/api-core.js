import { syncDisplayVersion } from './chat-operations-core.js';

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

export async function getClientVersion() {
    try {
        const response = await fetch('/version');
        const data = await response.json();
        syncClientVersion(data.agent);

        let displayVersion = `SillyTavern ${data.pkgVersion}`;
        const currentVersion = data.pkgVersion;

        if (data.gitRevision && data.gitBranch) {
            displayVersion += ` '${data.gitBranch}' (${data.gitRevision})`;
        }

        syncDisplayVersion(displayVersion);
        document.getElementById('version_display')?.replaceChildren(displayVersion);
        document.getElementById('version_display_welcome')?.replaceChildren(displayVersion);

        return {
            clientVersion: CLIENT_VERSION,
            currentVersion,
            displayVersion,
        };
    } catch (err) {
        console.error('Couldn\'t get client version', err);
        return null;
    }
}
