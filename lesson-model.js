/* Original exercise data; no artist recording, lyric, MIDI device or service calls. */
(function (root) {
  'use strict';
  function validate(input) {
    if (!input || input.schema !== 'music-code-exercise/v1' || typeof input.title !== 'string' || input.title.length > 120 || !input.title.trim()) throw new Error('Unsupported chart or title');
    if (!Number.isFinite(input.tempo) || input.tempo < 40 || input.tempo > 180) throw new Error('Tempo must be 40–180 BPM');
    if (!Array.isArray(input.notes) || input.notes.length < 1 || input.notes.length > 32) throw new Error('Use 1–32 notes');
    let previous = -1;
    const notes = input.notes.map(n => {
      if (!n || !Number.isFinite(n.beat) || n.beat < 0 || n.beat > 32 || n.beat <= previous || !Number.isInteger(n.pitch) || n.pitch < 48 || n.pitch > 84 || !Number.isFinite(n.duration) || n.duration < .25 || n.duration > 4 || !['step', 'pulse'].includes(n.action)) throw new Error('Invalid note, order or action');
      previous = n.beat; return { beat: n.beat, pitch: n.pitch, duration: n.duration, action: n.action };
    });
    return { schema: input.schema, title: input.title, tempo: input.tempo, notes,
      provenance: { source: 'local exercise data', rights: 'user review required for imported or edited material', artistAffiliation: 'independent' } };
  }
  function original() {
    return validate({ schema: 'music-code-exercise/v1', title: 'Four-note workshop motif', tempo: 80,
      notes: [60, 62, 64, 60].map((pitch, i) => ({ beat: i, pitch, duration: .5, action: 'step' })) });
  }
  function timeline(chart) { return validate(chart).notes.map(n => ({ ...n, seconds: n.beat * 60 / chart.tempo, length: n.duration * 60 / chart.tempo })); }
  function duration(chart) { return Math.max(...timeline(chart).map(n => n.seconds + n.length)); }
  function frequency(pitch) { return 440 * 2 ** ((pitch - 69) / 12); }
  function hit(chart, seconds, used = []) {
    const candidates = timeline(chart).map((n, index) => ({ index, error: Math.abs(n.seconds - seconds) })).filter(n => !used.includes(n.index) && n.error <= .22);
    return candidates.sort((a, b) => a.error - b.error)[0]?.index ?? null;
  }
  function effect(note, state) { return note.action === 'step' ? { ...state, steps: state.steps + 1 } : { ...state, pulses: state.pulses + 1 }; }
  const api = { validate, original, timeline, duration, frequency, hit, effect };
  root.MusicCodeLesson = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
