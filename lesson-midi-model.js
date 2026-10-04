/* Input-only MIDI adapter model. No preset device IDs or manufacturer mappings. */
(function (root) {
  'use strict';
  const ACTIONS = ['tap', 'next'];
  function message(data) {
    if (!data || data.length !== 3 || !Array.from(data).every(v => Number.isInteger(v) && v >= 0 && v <= 255) || data[1] > 127 || data[2] > 127) return null;
    const status = data[0] & 240, channel = data[0] & 15;
    if (![128, 144, 176].includes(status)) return null;
    return { kind: status === 176 ? 'cc' : 'note', channel, number: data[1], value: status === 128 ? 0 : data[2] };
  }
  const key = m => m.kind + ':' + m.channel + ':' + m.number;
  function validate(input) {
    if (!input || input.schema !== 'tarantula-midi-mapping/v1' || !Array.isArray(input.bindings) || input.bindings.length > 2) throw new Error('Unsupported mapping. Use at most two bindings.');
    const bindings = input.bindings.map(b => {
      if (!b || !ACTIONS.includes(b.action) || !['note', 'cc'].includes(b.kind) || !Number.isInteger(b.channel) || b.channel < 0 || b.channel > 15 || !Number.isInteger(b.number) || b.number < 0 || b.number > 127 || !Number.isInteger(b.threshold) || b.threshold < 1 || b.threshold > 127) throw new Error('Invalid action, message or threshold.');
      return { action: b.action, kind: b.kind, channel: b.channel, number: b.number, threshold: b.kind === 'note' ? 1 : b.threshold };
    });
    if (new Set(bindings.map(key)).size !== bindings.length || new Set(bindings.map(b => b.action)).size !== bindings.length) throw new Error('Use a different control for each action.');
    return { schema: 'tarantula-midi-mapping/v1', bindings };
  }
  function empty() { return validate({ schema: 'tarantula-midi-mapping/v1', bindings: [] }); }
  function learn(mapping, m, action, threshold) {
    if (!m || !ACTIONS.includes(action) || !Number.isInteger(threshold) || threshold < 1 || threshold > 127) throw new Error('Choose an action and a threshold between 1 and 127.');
    if (m.value < (m.kind === 'note' ? 1 : threshold)) return null;
    return validate({ schema: mapping.schema, bindings: [...mapping.bindings.filter(b => b.action !== action), { ...m, action, threshold }] });
  }
  function router(mapping) {
    const bindings = validate(mapping).bindings; let held = new Map();
    return {
      reset() { held = new Map(); },
      route(m) {
        if (!m) return [];
        const actions = [];
        for (const b of bindings) {
          if (key(b) !== key(m)) continue;
          const down = m.value >= b.threshold, prior = held.get(key(b)) || false;
          held.set(key(b), down);
          if (down && !prior) actions.push(b.action);
        }
        return actions;
      }
    };
  }
  const api = { ACTIONS, message, validate, empty, learn, router };
  root.TarantulaMIDI = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
