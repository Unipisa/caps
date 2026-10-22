const assert = require('node:assert/strict');
const { test } = require('node:test');
const { JSDOM } = require('jsdom');
const { buildSync } = require('esbuild');
const Module = require('node:module');
const path = require('node:path');

// Initialize React 17's scheduler before installing the DOM so it uses Node
// timers instead of a persistent MessageChannel that keeps the test alive.
require('scheduler');

const dom = new JSDOM('<div id="app"></div>', { url: 'http://localhost/', pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
global.DOMParser = dom.window.DOMParser;
global.navigator = dom.window.navigator;
global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
const React = require('react');
const ReactDOM = require('react-dom');
const { act, Simulate } = require('react-dom/test-utils');
const filename = path.join(__dirname, 'thesis-defense-add.bundle.cjs');
const bundle = buildSync({
    entryPoints: [path.join(__dirname, '../src/components/ThesisDefenseAdd.jsx')],
    bundle: true, platform: 'node', format: 'cjs', packages: 'external', write: false,
});
const compiled = new Module(filename, module);
compiled.filename = filename;
compiled.paths = module.paths;
compiled._compile(bundle.outputFiles[0].text, filename);
const ThesisDefenseAdd = compiled.exports.default;

test('enabled fields and instructions appear on load and follow the selected session', async () => {
    const sessions = [
        { id: 1, type: 'master', name: 'A', start_date: '2099-01-01', ask_bachelor_university: true, ask_second_examiners: false, instructions: '<p><strong>Istruzioni A</strong><br><a href="https://example.org">Link</a><a href="javascript:alert(1)">Unsafe</a><script>alert(1)</script></p>' },
        { id: 2, type: 'master', name: 'B', start_date: '2099-01-01', ask_bachelor_university: false, ask_second_examiners: true, instructions: 'Istruzioni B' },
    ];
    global.fetch = async url => ({ ok: true, json: async () => ({ data: url.includes('degree_sessions') ? sessions : [] }) });
    const container = document.getElementById('app');
    try {
        await act(async () => {
            ReactDOM.render(React.createElement(ThesisDefenseAdd, { root: '/', apiRoot: '/api/v1/', user: { id: 1 } }), container);
        });
        const select = document.getElementById('degree_session_id');
        assert.equal(select.value, '1');
        assert.ok(document.getElementById('bachelor_university').required);
        assert.ok(document.getElementById('bachelor_degree').required);
        assert.ok(document.getElementById('enrollment_year').required);
        assert.equal(container.querySelector('.alert strong').textContent, 'Istruzioni A');
        assert.equal(container.querySelector('.alert a').href, 'https://example.org/');
        assert.equal(container.querySelectorAll('.alert a')[1].getAttribute('href'), null);
        assert.equal(container.querySelector('.alert script'), null);
        assert.equal(document.getElementById('proposed_second_examiners'), null);
        assert.ok(container.textContent.includes('Istruzioni A'));

        act(() => Simulate.change(select, { target: { value: '2' } }));
        assert.equal(document.getElementById('bachelor_university'), null);
        assert.ok(document.getElementById('proposed_second_examiners'));
        assert.ok(container.textContent.includes('Istruzioni B'));
        assert.ok(!container.textContent.includes('Istruzioni A'));

        const requests = [];
        window.confirm = () => true;
        global.FormData = dom.window.FormData;
        global.fetch = async (url, options) => {
            requests.push({ url, options });
            return url.endsWith('/thesis_defenses')
                ? { ok: true, json: async () => ({ data: { id: 42 } }) }
                : { ok: false };
        };
        act(() => {
            Simulate.change(document.getElementById('enrollment_year'), { target: { value: '2020' } });
            Simulate.change(document.getElementById('attachments'), { target: { files: [new dom.window.File(['test'], 'thesis.txt')] } });
        });
        await act(async () => Simulate.submit(container.querySelector('form')));
        assert.equal(JSON.parse(requests[0].options.body).enrollment_year, '2020');
        assert.equal(requests[1].url, '/api/v1/thesis_defense_attachments/42');
        assert.equal(requests[1].options.headers['Content-Type'], undefined);
        assert.equal(requests[1].options.body.getAll('file[]')[0].name, 'thesis.txt');
        assert.ok(container.textContent.includes('Domanda inviata. Caricamento allegati non riuscito'));
        assert.ok(container.querySelector('a[href="/thesis-defenses/view/42"]'));
        assert.equal(container.querySelector('form'), null);

    } finally {
        act(() => { ReactDOM.unmountComponentAtNode(container); });
        delete global.fetch;
        dom.window.close();
    }
});
