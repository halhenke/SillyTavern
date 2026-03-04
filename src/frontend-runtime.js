import fs from 'node:fs';
import path from 'node:path';

import { serverDirectory } from './server-directory.js';
import { getConfigValue } from './util.js';

const DEFAULT_FRONTEND_DIST = 'frontend/dist';

/**
 * @returns {{ reactLoginEnabled: boolean, reactShellEnabled: boolean }}
 */
export function getFrontendFlags() {
    return {
        reactLoginEnabled: getConfigValue('frontend.reactLoginEnabled', false, 'boolean'),
        reactShellEnabled: getConfigValue('frontend.reactShellEnabled', false, 'boolean'),
    };
}

/**
 * Resolves the configured frontend dist directory.
 * @returns {string}
 */
export function getFrontendDistDirectory() {
    const configured = String(getConfigValue('frontend.distDirectory', DEFAULT_FRONTEND_DIST) ?? DEFAULT_FRONTEND_DIST).trim();

    if (path.isAbsolute(configured)) {
        return configured;
    }

    return path.resolve(serverDirectory, configured);
}

/**
 * Checks if a frontend build exists and is ready to serve.
 * @returns {boolean}
 */
export function hasFrontendBuild() {
    const frontendDist = getFrontendDistDirectory();
    return fs.existsSync(path.join(frontendDist, 'index.html'));
}

/**
 * @returns {{ distDirectory: string, indexPath: string, isReady: boolean }}
 */
export function getFrontendBuildInfo() {
    const distDirectory = getFrontendDistDirectory();
    const indexPath = path.join(distDirectory, 'index.html');

    return {
        distDirectory,
        indexPath,
        isReady: fs.existsSync(indexPath),
    };
}
