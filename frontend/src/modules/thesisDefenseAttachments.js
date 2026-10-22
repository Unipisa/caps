export async function uploadThesisDefenseAttachments(apiRoot, defenseId, files, headers) {
    const body = new FormData();
    files.forEach(file => body.append('file[]', file));
    const uploadHeaders = { ...headers };
    delete uploadHeaders['Content-Type'];
    const response = await fetch(`${apiRoot}thesis_defense_attachments/${defenseId}`, {
        method: 'POST', headers: uploadHeaders, credentials: 'include', body
    });
    if (!response.ok) {
        throw new Error('Caricamento allegati non riuscito. Riprovare dalla pagina della domanda.');
    }
}
