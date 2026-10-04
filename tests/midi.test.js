const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const M = require('../lesson-midi-model.js');
const L = require('../lesson-model.js');
const note = (value, number = 60, channel = 0) => M.message([144 + channel, number, value]);
const binding = { action: 'next', kind: 'note', channel: 0, number: 60, threshold: 1 };
test('decode Note On, Note Off and CC; discard clocks, SysEx and malformed data', () => {
  assert.deepEqual(note(100, 65, 3), { kind: 'note', channel: 3, number: 65, value: 100 });
  assert.equal(M.message([128, 60, 100]).value, 0); assert.equal(note(0).value, 0);
  assert.equal(M.message([176, 7, 127]).kind, 'cc');
  for (const bytes of [[248], [240, 1, 247], [144, 200, 4], [144, 60, 128], [144, 60], [144, 1.5, 4]]) assert.equal(M.message(bytes), null);
});
test('learn a real observed identity without presumed Numark message numbers', () => {
  assert.equal(M.learn(M.empty(), note(0), 'next', 64), null);
  const result = M.learn(M.empty(), note(100, 42, 2), 'next', 64);
  assert.deepEqual(result.bindings, [{ action: 'next', kind: 'note', channel: 2, number: 42, threshold: 1 }]);
  assert.throws(() => M.learn(result, note(100, 42, 2), 'tap', 64));
  assert.throws(() => M.learn(result, note(100), 'next', 0));
});
test('held notes and high CC messages cannot repeatedly trigger game actions', () => {
  const route = M.router({ schema: M.empty().schema, bindings: [binding] });
  assert.deepEqual(route.route(note(100)), ['next']); assert.deepEqual(route.route(note(120)), []);
  assert.deepEqual(route.route(note(0)), []); assert.deepEqual(route.route(note(90)), ['next']);
  const cc = M.router({ schema: M.empty().schema, bindings: [{ ...binding, kind: 'cc', number: 7, threshold: 64 }] });
  assert.deepEqual(cc.route(M.message([176, 7, 63])), []);
  assert.deepEqual(cc.route(M.message([176, 7, 64])), ['next']); assert.deepEqual(cc.route(M.message([176, 7, 127])), []);
  cc.route(M.message([176, 7, 0])); assert.deepEqual(cc.route(M.message([176, 7, 127])), ['next']);
});
test('mapping validation bounds imports, rejects collisions, and strips device/private fields', () => {
  const good = { schema: M.empty().schema, bindings: [{ ...binding, deviceId: 'private' }], name: 'private' };
  assert.deepEqual(M.validate(good), { schema: M.empty().schema, bindings: [binding] });
  for (const patch of [{ channel: 16 }, { number: -1 }, { action: 'execute' }, { threshold: Infinity }, { kind: 'sysex' }]) assert.throws(() => M.validate({ ...good, bindings: [{ ...binding, ...patch }] }));
  assert.throws(() => M.validate({ ...good, bindings: [binding, binding] }));
  assert.throws(() => M.validate({ ...good, schema: 'unsupported' }));
});
test('mapped timed taps use the existing hit window and never score the same note twice', () => {
  const route = M.router({ schema: M.empty().schema, bindings: [{ ...binding, action: 'tap' }] });
  const chart = L.original(); const used = []; let game = { steps: 0, pulses: 0 };
  for (const m of [note(127), note(127), note(0), note(127)]) for (const action of route.route(m)) {
    assert.equal(action, 'tap'); const index = L.hit(chart, 0.05, used);
    if (index !== null) { used.push(index); game = L.effect(chart.notes[index], game); }
  }
  assert.equal(game.steps, 1);
});
class Element extends EventTarget {
  constructor(value = '') { super(); this.value = value; this.disabled = false; this.children = []; this.files = []; this.textContent = ''; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  click() { if (!this.disabled) this.dispatchEvent(new Event('click')); }
  remove() {}
}
const flush = () => new Promise(resolve => setImmediate(resolve));
function setup(request) {
  const d = new EventTarget(); const els = new Map(); d.hidden = false;
  d.getElementById = id => { if (!els.has(id)) els.set(id, new Element()); return els.get(id); };
  d.createElement = () => new Element(); d.body = new Element();
  const w = new EventTarget(); w.TarantulaMIDI = M; w.isSecureContext = true;
  const $ = d.getElementById;
  $('midi-action').value = 'next'; $('midi-threshold').value = '64'; $('output-route').value = 'not-recorded'; $('physical-result').value = 'not-tested'; $('tap').disabled = true;
  let steps = 0; $('next').addEventListener('click', () => steps++);
  const sandbox = { window: w, document: d, navigator: request ? { requestMIDIAccess: request } : {}, Option: class extends Element { constructor(text, value) { super(value); this.textContent = text; } }, Blob, URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} }, setTimeout: () => 0 };
  vm.runInNewContext(fs.readFileSync(require.resolve('../lesson-midi.js'), 'utf8'), sandbox);
  return { d, w, $, steps: () => steps };
}
function port(id) {
  const p = new EventTarget(); p.id = id; p.name = 'Test controller'; p.state = 'connected'; p.open = async () => p; p.close = async () => p;
  p.send = bytes => { const event = new Event('midimessage'); event.data = bytes; p.dispatchEvent(event); }; return p;
}
function access(ports) { const a = new EventTarget(); a.inputs = new Map(ports.map(p => [p.id, p])); return a; }
test('unsupported browser and denied MIDI permission preserve non-MIDI practice', async () => {
  const unsupported = setup(); unsupported.$('midi-connect').click(); assert.match(unsupported.$('midi-status').textContent, /unavailable/);
  unsupported.$('next').click(); assert.equal(unsupported.steps(), 1);
  const denied = setup(async () => { throw new Error('NotAllowedError'); }); denied.$('midi-connect').click(); await flush();
  assert.match(denied.$('midi-status').textContent, /denied/); assert.equal(denied.$('midi-connect').disabled, false); denied.$('next').click(); assert.equal(denied.steps(), 1);
});
test('input selection learns without scoring, routes one action per press, and disconnect stops input', async () => {
  const p = port('private-id'), a = access([p]); let options;
  const ui = setup(async o => { options = o; return a; }); ui.$('midi-connect').click(); await flush();
  assert.equal(options.sysex, false); assert.equal(ui.$('midi-learn').disabled, false);
  ui.$('midi-learn').click(); p.send([144, 60, 127]); assert.equal(ui.steps(), 0);
  p.send([144, 60, 127]); assert.equal(ui.steps(), 0);
  p.send([128, 60, 0]); p.send([144, 60, 127]); assert.equal(ui.steps(), 1);
  assert.ok(!ui.$('midi-report').value.includes('private-id')); assert.ok(!ui.$('midi-report').value.includes('Test controller'));
  assert.equal(JSON.parse(ui.$('midi-report').value).hardwareVerifiedByApp, false);
  ui.$('midi-disconnect').click(); p.send([128, 60, 0]); p.send([144, 60, 127]); assert.equal(ui.steps(), 1);
});
test('unplug does not silently switch to a different controller', async () => {
  const p = port('one'), other = port('two'), a = access([p]); const ui = setup(async () => a);
  ui.$('midi-connect').click(); await flush(); p.state = 'disconnected'; a.inputs.set(other.id, other); a.dispatchEvent(new Event('statechange'));
  assert.equal(ui.$('midi-learn').disabled, true); assert.match(ui.$('midi-status').textContent, /disconnected/);
  assert.equal(ui.$('midi-input').value, '');
});
test('hidden pages ignore events and pagehide detaches listeners', async () => {
  const p = port('one'), ui = setup(async () => access([p])); ui.$('midi-connect').click(); await flush();
  ui.$('midi-learn').click(); p.send([144, 60, 127]); p.send([128, 60, 0]);
  ui.d.hidden = true; ui.d.dispatchEvent(new Event('visibilitychange')); p.send([144, 60, 127]); assert.equal(ui.steps(), 0);
  ui.d.hidden = false; p.send([144, 60, 127]); assert.equal(ui.steps(), 1);
  ui.w.dispatchEvent(new Event('pagehide')); p.send([128, 60, 0]); p.send([144, 60, 127]); assert.equal(ui.steps(), 1);
});
test('malformed import keeps prior mappings; external fields never reach exports', async () => {
  const ui = setup(); ui.$('midi-import').files = [{ size: 12, text: async () => '{}' }]; ui.$('midi-import').dispatchEvent(new Event('change')); await flush(); assert.match(ui.$('midi-status').textContent, /rejected/);
  ui.$('midi-import').files = [{ size: 500, text: async () => JSON.stringify({ schema: M.empty().schema, bindings: [binding], privatePath: '/private' }) }];
  ui.$('midi-import').dispatchEvent(new Event('change')); await flush(); const report = JSON.parse(ui.$('midi-report').value);
  assert.deepEqual(report.mapping.bindings, [binding]); assert.ok(!ui.$('midi-report').value.includes('/private'));
});
test('pending permission cannot reconnect after disconnect or a hidden page', async () => {
  let resolve; const pending = new Promise(r => { resolve = r; }); const ui = setup(() => pending);
  ui.$('midi-connect').click(); ui.d.hidden = true; ui.d.dispatchEvent(new Event('visibilitychange')); resolve(access([port('one')])); await flush();
  assert.equal(ui.$('midi-disconnect').disabled, true); assert.equal(ui.$('midi-learn').disabled, true);
});
test('clearing mappings cancels an older asynchronous import', async () => {
  const ui = setup(); let resolve;
  ui.$('midi-import').files = [{ size: 200, text: () => new Promise(r => { resolve = r; }) }];
  ui.$('midi-import').dispatchEvent(new Event('change')); ui.$('midi-clear').click();
  resolve(JSON.stringify({ schema: M.empty().schema, bindings: [binding] })); await flush();
  assert.deepEqual(JSON.parse(ui.$('midi-report').value).mapping.bindings, []);
});
