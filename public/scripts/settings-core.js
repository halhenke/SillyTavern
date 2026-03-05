/**
 * Bound settings implementation hooks provided by the legacy runtime bootstrap.
 * These wrappers let adapter consumers avoid importing from script.js directly.
 */
let saveSettingsImpl = null;
let saveSettingsDebouncedImpl = null;
let saveMetadataImpl = null;
let saveCharacterDebouncedImpl = null;

function throwUnbound(name) {
    throw new Error(`[settings-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy settings implementations to standalone wrappers.
 * @param {{
 *   saveSettings: (...args: any[]) => Promise<any>,
 *   saveSettingsDebounced: (...args: any[]) => any,
 *   saveMetadata: (...args: any[]) => Promise<any>,
 *   saveCharacterDebounced: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindSettingsCore(impl) {
    saveSettingsImpl = impl?.saveSettings ?? null;
    saveSettingsDebouncedImpl = impl?.saveSettingsDebounced ?? null;
    saveMetadataImpl = impl?.saveMetadata ?? null;
    saveCharacterDebouncedImpl = impl?.saveCharacterDebounced ?? null;
}

export function saveSettings(...args) {
    if (!saveSettingsImpl) {
        throwUnbound('saveSettings');
    }

    return saveSettingsImpl(...args);
}

export function saveSettingsDebounced(...args) {
    if (!saveSettingsDebouncedImpl) {
        throwUnbound('saveSettingsDebounced');
    }

    return saveSettingsDebouncedImpl(...args);
}

export function saveMetadata(...args) {
    if (!saveMetadataImpl) {
        throwUnbound('saveMetadata');
    }

    return saveMetadataImpl(...args);
}

export function saveCharacterDebounced(...args) {
    if (!saveCharacterDebouncedImpl) {
        throwUnbound('saveCharacterDebounced');
    }

    return saveCharacterDebouncedImpl(...args);
}
