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
const filename = path.join(__dirname, 'thesis-defense-view.bundle.cjs');
const bundle = buildSync({
    entryPoints: [path.join(__dirname, '../src/components/ThesisDefenseView.jsx')],
    bundle: true, platform: 'node', format: 'cjs', packages: 'external', write: false,
});
const compiled = new Module(filename, module);
compiled.filename = filename;
compiled.paths = module.paths;
compiled._compile(bundle.outputFiles[0].text, filename);
const ThesisDefenseView = compiled.exports.default;

test('submitted applications accept attachments and refresh their list', async () => {
    const container = document.getElementById('app');
    global.FormData = dom.window.FormData;
    let uploaded = false;
    global.fetch = async (url, options) => {
        if (options.method === 'POST') {
            assert.equal(url, '/api/v1/thesis_defense_attachments/42');
            assert.equal(options.body.getAll('file[]')[0].name, 'thesis.txt');
            assert.equal(options.headers['X-CSRF-Token'], 'csrf');
            uploaded = true;
            return { ok: true };
        }
        return { ok: true, json: async () => ({ data: {
            id: 42, state: 'submitted', enrollment_year: 2020, bachelor_degree: 'Matematica',
            proposed_second_examiners: 'First\nSecond',
            thesis_defense_attachments: uploaded ? [{ id: 7, filename: 'thesis.txt' }] : [],
        } }) };
    };
    try {
        await act(async () => {
            ReactDOM.render(React.createElement(ThesisDefenseView, {
                root: '/', apiRoot: '/api/v1/', defenseId: 42, csrfToken: 'csrf', isAdmin: false,
            }), container);
        });
        assert.ok(container.textContent.includes('2020'));
        assert.ok(container.textContent.includes('Matematica'));
        const examiners = Array.from(container.querySelectorAll('dd')).find(el => el.textContent === 'First\nSecond');
        assert.equal(examiners.style.whiteSpace, 'pre-wrap');
        act(() => Simulate.change(document.getElementById('new-attachments'), {
            target: { files: [new dom.window.File(['test'], 'thesis.txt')] }
        }));
        await act(async () => Simulate.submit(container.querySelector('form')));
        assert.ok(uploaded);
        assert.ok(container.querySelector('a[href="/api/v1/thesis_defense_attachments/7/download"]'));
        assert.ok(container.textContent.includes('Allegati aggiunti.'));
        assert.ok(container.querySelector('form button').disabled);
    } finally {
        act(() => ReactDOM.unmountComponentAtNode(container));
        delete global.fetch;
        dom.window.close();
    }
});
