(() => {
  'use strict';
  const M = window.MusicCodeLesson, $ = id => document.getElementById(id);
  let chart = M.original(), context = null, nodes = [], playing = false, offset = 0, started = 0, used = [], cursor = 0, generation = 0;
  let game = { steps: 0, pulses: 0 };
  const tell = t => { $('status').textContent = t; };
  function time() { return playing ? Math.max(0, context.currentTime - started) : offset; }
  function controls() { $('pause').disabled = !playing; $('tap').disabled = !playing; $('play').disabled = playing; }
  function silence() { nodes.forEach(n => { try { n.stop(); } catch (_) {} }); nodes = []; }
  function stop() { generation++; silence(); playing = false; offset = 0; used = []; cursor = 0; game = { steps: 0, pulses: 0 }; showGame(); controls(); $('position').textContent = 'Ready at the beginning.'; }
  function showGame() { $('game-state').textContent = 'Steps: ' + game.steps + ' · Pulses: ' + game.pulses; }
  async function audio() {
    if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
    await context.resume(); if (context.state !== 'running') throw new Error('Audio unavailable');
    return context;
  }
  function tone(note, when, length) {
    const osc = context.createOscillator(), gain = context.createGain();
    osc.frequency.value = M.frequency(note.pitch); gain.gain.setValueAtTime(0, when); gain.gain.linearRampToValueAtTime(.1, when + .01); gain.gain.linearRampToValueAtTime(0, when + length);
    osc.connect(gain); gain.connect(context.destination); osc.start(when); osc.stop(when + length + .02); nodes.push(osc);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); nodes = nodes.filter(n => n !== osc); };
  }
  function render() {
    $('tempo').value = chart.tempo; $('pitch').value = chart.notes[0].pitch; $('duration').value = chart.notes[0].duration; $('action').value = chart.notes[0].action;
    $('chart').value = JSON.stringify(chart, null, 2); $('notes').replaceChildren();
    chart.notes.forEach((n, i) => { const row = document.createElement('tr'); [i + 1, n.beat, n.pitch, n.duration, n.action].forEach(v => { const cell = document.createElement('td'); cell.textContent = v; row.append(cell); }); $('notes').append(row); });
  }
  $('play').addEventListener('click', async () => {
    const token = ++generation;
    try {
      await audio(); if (token !== generation) return;
      silence(); if (offset >= M.duration(chart)) offset = 0;
      started = context.currentTime + .1 - offset; playing = true;
      for (const n of M.timeline(chart)) { const end = n.seconds + n.length; if (end > offset) tone(n, started + Math.max(n.seconds, offset), end - Math.max(n.seconds, offset)); }
      controls(); tell('Playing. Listen or tap; no instrument is connected.');
    } catch (_) { if (token === generation) tell('Audio could not start. Use the readable note data or untimed actions.'); }
  });
  $('pause').addEventListener('click', () => { generation++; offset = time(); silence(); playing = false; controls(); tell('Paused. Resume keeps your place in this tab.'); });
  $('stop').addEventListener('click', () => { stop(); tell('Stopped and practice reset.'); });
  $('tap').addEventListener('click', () => {
    if (!playing) return;
    const index = M.hit(chart, time(), used);
    if (index === null) { tell('Between notes. Listen and try the next pulse.'); return; }
    used.push(index); game = M.effect(chart.notes[index], game); showGame(); tell('Note ' + (index + 1) + ' matched. Action: ' + chart.notes[index].action + '.');
  });
  $('next').addEventListener('click', async () => {
    if (playing) { offset = time(); silence(); playing = false; controls(); }
    const n = chart.notes[cursor], index = cursor; cursor = (cursor + 1) % chart.notes.length;
    game = M.effect(n, game); showGame(); tell('Untimed note ' + (index + 1) + ': pitch ' + n.pitch + ', action ' + n.action + '.');
    const token = ++generation;
    try { await audio(); if (token === generation) { silence(); tone(n, context.currentTime + .02, n.duration * 60 / chart.tempo); } } catch (_) { /* Text/action route remains available. */ }
  });
  $('edit').addEventListener('submit', e => { e.preventDefault(); try { const next = M.validate({ ...chart, tempo: Number($('tempo').value), notes: chart.notes.map((n, i) => i ? n : { ...n, pitch: Number($('pitch').value), duration: Number($('duration').value), action: $('action').value }) }); stop(); chart = next; render(); tell('Changes applied. Compare the new motif.'); } catch (err) { tell(err.message); } });
  $('reset').addEventListener('click', () => { stop(); chart = M.original(); render(); tell('Original motif restored.'); });
  $('export').addEventListener('click', () => { const url = URL.createObjectURL(new Blob([JSON.stringify(chart, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'music-code-exercise.json'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000); tell('Download requested. Check the file in Files. No upload occurred.'); });
  $('import').addEventListener('change', async () => {
    const file = $('import').files[0]; if (!file) return;
    const token = ++generation;
    try { if (file.size > 30000) throw new Error('Chart exceeds 30 KB'); const next = M.validate(JSON.parse(await file.text())); if (token !== generation) return; stop(); chart = next; render(); tell('Chart imported. Rights still require your review.'); } catch (err) { if (token === generation) tell('Import rejected: ' + err.message + '. Previous chart retained.'); }
    $('import').value = '';
  });
  setInterval(() => { if (!playing) return; const t = time(); $('position').textContent = 'Practice position: ' + t.toFixed(1) + ' seconds'; if (t >= M.duration(chart) + .25) { silence(); playing = false; offset = 0; used = []; controls(); tell('Exercise complete. Replay or try an edit.'); } }, 100);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { generation++; if (playing) offset = time(); playing = false; silence(); controls(); tell('Paused when the page was hidden. Resume when ready.'); } });
  window.addEventListener('pagehide', stop);
  render(); controls();
})();
