const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../lesson-model.js');
test('tempo changes scheduling without changing pitch; duration bounds end time', () => {
  const chart = M.original(); assert.equal(M.timeline(chart)[1].seconds, .75);
  const faster = M.validate({ ...chart, tempo: 160 }); assert.equal(M.timeline(faster)[1].seconds, .375);
  assert.deepEqual(faster.notes.map(n => n.pitch), chart.notes.map(n => n.pitch));
  assert.equal(M.duration(chart), 2.625); assert.equal(M.frequency(69), 440);
});
test('timed matches cannot score twice and untimed game actions are deterministic', () => {
  const chart = M.original(); assert.equal(M.hit(chart, .76), 1); assert.equal(M.hit(chart, .76, [1]), null);
  assert.equal(M.hit(chart, .35), null);
  let state = M.effect(chart.notes[0], { steps: 0, pulses: 0 });
  state = M.effect({ action: 'pulse' }, state); assert.deepEqual(state, { steps: 1, pulses: 1 });
});
test('imports round-trip note data but never grant supplied rights or run supplied code', () => {
  const chart = M.original(); const imported = M.validate({ ...chart, provenance: { rights: 'permission-granted' }, code: 'run me' });
  assert.deepEqual(imported.notes, chart.notes); assert.equal(imported.code, undefined);
  assert.match(imported.provenance.rights, /review required/);
  for (const patch of [{ tempo: 0 }, { tempo: Infinity }, { notes: [] }, { notes: Array(33).fill(chart.notes[0]) }, { notes: [{ ...chart.notes[0], action: 'eval' }] }, { notes: [{ ...chart.notes[0], pitch: 200 }] }, { notes: [{ ...chart.notes[0], duration: -.5 }] }, { notes: [chart.notes[1], chart.notes[0]] }]) assert.throws(() => M.validate({ ...chart, ...patch }));
});
