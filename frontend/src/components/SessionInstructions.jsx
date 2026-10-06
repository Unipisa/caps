import React from 'react';

// Render only the formatting supported by the session editor. Attributes and
// executable markup from stored/API content are never inserted into the DOM.
export default function SessionInstructions({ text }) {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const allowed = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'UL', 'OL', 'LI', 'A']);
    function render(node, key) {
        if (node.nodeType === 3) return node.textContent;
        if (node.nodeType !== 1 || ['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT'].includes(node.tagName)) return null;
        const children = Array.from(node.childNodes).map(render);
        if (!allowed.has(node.tagName)) return <React.Fragment key={key}>{children}</React.Fragment>;
        const props = { key };
        if (node.tagName === 'A') {
            const href = node.getAttribute('href') || '';
            try {
                if (['http:', 'https:', 'mailto:'].includes(new URL(href, window.location.href).protocol)) props.href = href;
            } catch (_) { /* Invalid links are rendered as text. */ }
        }
        return React.createElement(node.tagName.toLowerCase(), props, node.tagName === 'BR' ? undefined : children);
    }
    return <div className="alert alert-info mt-4" style={{ whiteSpace: 'pre-wrap' }}>{Array.from(doc.body.childNodes).map(render)}</div>;
}
