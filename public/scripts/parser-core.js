let baseChatReplaceImpl = null;
let extractJsonFromDataImpl = null;
let extractMessageFromDataImpl = null;
let getBiasStringsImpl = null;
let removeMacrosImpl = null;
let substituteParamsImpl = null;
let substituteParamsExtendedImpl = null;

export let converter = null;

function throwUnbound(name) {
    throw new Error(`[parser-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds parser-related legacy implementations to standalone wrappers.
 * @param {{
 *   baseChatReplace: (...args: any[]) => any,
 *   extractJsonFromData: (...args: any[]) => any,
 *   extractMessageFromData: (...args: any[]) => any,
 *   getBiasStrings: (...args: any[]) => any,
 *   removeMacros: (...args: any[]) => any,
 *   substituteParams: (...args: any[]) => any,
 *   substituteParamsExtended: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindParserCore(impl) {
    baseChatReplaceImpl = impl?.baseChatReplace ?? null;
    extractJsonFromDataImpl = impl?.extractJsonFromData ?? null;
    extractMessageFromDataImpl = impl?.extractMessageFromData ?? null;
    getBiasStringsImpl = impl?.getBiasStrings ?? null;
    removeMacrosImpl = impl?.removeMacros ?? null;
    substituteParamsImpl = impl?.substituteParams ?? null;
    substituteParamsExtendedImpl = impl?.substituteParamsExtended ?? null;
}

/**
 * Synchronizes the markdown converter instance.
 * @param {import('showdown').Converter|null} value Converter instance
 */
export function syncConverter(value) {
    converter = value;
}

export function baseChatReplace(...args) {
    if (!baseChatReplaceImpl) {
        throwUnbound('baseChatReplace');
    }

    return baseChatReplaceImpl(...args);
}

export function extractJsonFromData(...args) {
    if (!extractJsonFromDataImpl) {
        throwUnbound('extractJsonFromData');
    }

    return extractJsonFromDataImpl(...args);
}

export function extractMessageFromData(...args) {
    if (!extractMessageFromDataImpl) {
        throwUnbound('extractMessageFromData');
    }

    return extractMessageFromDataImpl(...args);
}

export function getBiasStrings(...args) {
    if (!getBiasStringsImpl) {
        throwUnbound('getBiasStrings');
    }

    return getBiasStringsImpl(...args);
}

export function removeMacros(...args) {
    if (!removeMacrosImpl) {
        throwUnbound('removeMacros');
    }

    return removeMacrosImpl(...args);
}

export function substituteParams(...args) {
    if (!substituteParamsImpl) {
        throwUnbound('substituteParams');
    }

    return substituteParamsImpl(...args);
}

export function substituteParamsExtended(...args) {
    if (!substituteParamsExtendedImpl) {
        throwUnbound('substituteParamsExtended');
    }

    return substituteParamsExtendedImpl(...args);
}
