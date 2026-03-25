import { processDroppedFiles } from './character-core.js';
import { getRequestHeaders } from './network-core.js';
import { POPUP_TYPE, callGenericPopup } from './popup.js';
import { renderTemplateAsync } from './templates.js';
import { isValidUrl } from './utils.js';
import { importWorldInfo } from './world-info.js';

async function fetchImportedContentFile(url) {
    let request;

    if (isValidUrl(url)) {
        console.debug('Custom content import started for URL: ', url);
        request = await fetch('/api/content/importURL', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({ url }),
        });
    } else {
        console.debug('Custom content import started for Char UUID: ', url);
        request = await fetch('/api/content/importUUID', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({ url }),
        });
    }

    if (!request.ok) {
        toastr.info(request.statusText, 'Custom content import failed');
        console.error('Custom content import failed', request.status, request.statusText);
        return null;
    }

    const data = await request.blob();
    const customContentType = request.headers.get('X-Custom-Content-Type');
    const contentDisposition = request.headers.get('Content-Disposition') ?? '';
    const fileName = contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'imported-content';
    const file = new File([data], fileName, { type: data.type });

    return { customContentType, file };
}

export async function importExternalContent() {
    const html = await renderTemplateAsync('importCharacters');
    const input = await callGenericPopup(html, POPUP_TYPE.INPUT, '', {
        allowVerticalScrolling: true,
        wider: true,
        okButton: $('#popup_template').attr('popup-button-import'),
        rows: 4,
    });

    if (!input) {
        console.debug('Custom content import cancelled');
        return;
    }

    const inputs = String(input).split('\n').map(x => x.trim()).filter(x => x.length > 0);

    for (const url of inputs) {
        const importedContent = await fetchImportedContentFile(url);
        if (!importedContent) {
            return;
        }

        switch (importedContent.customContentType) {
            case 'character':
                await processDroppedFiles([importedContent.file]);
                break;
            case 'lorebook':
                await importWorldInfo(importedContent.file);
                break;
            default:
                toastr.warning('Unknown content type');
                console.error('Unknown content type', importedContent.customContentType);
                break;
        }
    }
}

export async function importFromURL(items, files) {
    for (const item of items) {
        if (item.type === 'text/uri-list') {
            const uriList = await new Promise((resolve) => {
                item.getAsString((value) => { resolve(value); });
            });
            const uris = String(uriList).split('\n').filter(uri => uri.trim() !== '');
            try {
                for (const uri of uris) {
                    const request = await fetch(uri);
                    const data = await request.blob();
                    const fileName = request.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || uri.split('/').pop() || 'file.png';
                    const file = new File([data], fileName, { type: data.type });
                    files.push(file);
                }
            } catch (error) {
                console.error('Failed to import from URL', error);
            }
        }
    }
}
