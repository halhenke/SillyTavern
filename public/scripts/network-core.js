let csrfToken = '';

/**
 * Sets the CSRF token used for authenticated requests.
 * @param {string} value CSRF token
 */
export function setCsrfToken(value) {
    csrfToken = String(value ?? '');
}

/**
 * Builds standard request headers for API calls.
 * @param {{omitContentType?: boolean}} [options] Header options
 * @returns {{'X-CSRF-Token': string, 'Content-Type'?: string}} Request headers
 */
export function getRequestHeaders({ omitContentType = false } = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
    };

    if (omitContentType) {
        delete headers['Content-Type'];
    }

    return headers;
}

/**
 * Pings the STserver to check if it is reachable.
 * @returns {Promise<boolean>} True if the server is reachable, false otherwise.
 */
export async function pingServer() {
    try {
        const result = await fetch('api/ping', {
            method: 'POST',
            headers: getRequestHeaders(),
        });

        if (!result.ok) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error pinging server', error);
        return false;
    }
}

/**
 * Gets the URL for a thumbnail of a specific type and file.
 * @param {import('../../src/endpoints/thumbnails.js').ThumbnailType} type The type of thumbnail to get
 * @param {string} file The file name/path
 * @param {boolean} [t=false] Whether to add a cache-busting timestamp
 * @returns {string} The thumbnail URL
 */
export function getThumbnailUrl(type, file, t = false) {
    return `/thumbnail?type=${type}&file=${encodeURIComponent(file)}${t ? `&t=${Date.now()}` : ''}`;
}
