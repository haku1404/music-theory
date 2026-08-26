const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>');
global.window = dom.window;
global.document = dom.window.document;

const { Renderer, RendererBackends, Stave, StaveNote, Formatter } = require('vexflow');

const div = document.getElementById('root');
const renderer = new Renderer(div, RendererBackends.SVG);
renderer.resize(500, 200);
const context = renderer.getContext();
const stave = new Stave(10, 40, 400);
stave.addClef('treble').setContext(context).draw();

const note = new StaveNote({ clef: 'treble', keys: ['g/4'], duration: 'q' });
Formatter.FormatAndDraw(context, stave, [note]);

console.log(div.innerHTML.substring(0, 1000));
