(() => {
  'use strict';
  const M = window.TarantulaMIDI, $ = id => document.getElementById(id);
  let mapping = M.empty(), route = M.router(mapping), access = null, input = null, learning = null, generation = 0, mappingGeneration = 0, observed = [];
  const say = text => { $('midi-status').textContent = text; };
  const label = b => (b.kind === 'note' ? 'Note ' : 'CC ') + b.number + ', channel ' + (b.channel + 1) + (b.kind === 'cc' && b.threshold ? ', threshold ' + b.threshold : '');
  function report() {
    $('midi-report').value = JSON.stringify({ schema: 'tarantula-controller-test/v1', mapping, observedMessages: observed, outputRoute: $('output-route').value, physicalResult: $('physical-result').value, notes: $('midi-notes').value.slice(0, 1000), hardwareVerifiedByApp: false }, null, 2);
  }
  function render() {
    $('midi-bindings').replaceChildren(...mapping.bindings.map(b => {
      const li = document.createElement('li'); li.textContent = (b.action === 'tap' ? 'Timed tap' : 'Untimed next note') + ' ← ' + label(b); return li;
    }));
    if (!mapping.bindings.length) { const li = document.createElement('li'); li.textContent = 'No controls learned yet.'; $('midi-bindings').append(li); }
    $('midi-connect').disabled = !!access;
    $('midi-disconnect').disabled = !access;
    $('midi-input').disabled = !access;
    $('midi-learn').disabled = !input;
    $('midi-cancel').disabled = !learning;
    report();
  }
  function detach() {
    if (input) {
      input.removeEventListener('midimessage', receive);
      try { Promise.resolve(input.close()).catch(() => {}); } catch (_) {}
    }
    input = null; learning = null; route.reset();
  }
  function disconnect(text) {
    generation++; detach();
    if (access) access.removeEventListener('statechange', portsChanged);
    access = null; $('midi-input').replaceChildren(new Option('No MIDI input selected', ''));
    render(); if (text) say(text);
  }
  function ports(initial) {
    const selected = input?.id || '', available = [...access.inputs.values()].filter(p => p.state !== 'disconnected');
    const select = $('midi-input'); select.replaceChildren(new Option('Choose a MIDI input', '')); select.value = '';
    available.forEach(p => select.append(new Option(p.name || 'Unnamed MIDI input', p.id)));
    if (available.some(p => p.id === selected)) select.value = selected;
    else if (input) { detach(); say('Selected controller disconnected. Choose an input again; no replacement is connected automatically.'); }
    if (!available.length) say('MIDI permission granted, but no connected inputs are visible. Connect your controller, then check this list.');
    render();
    if (initial && available.length === 1) { select.value = available[0].id; chooseInput(); }
  }
  function portsChanged() { if (access) ports(false); }
  async function chooseInput() {
    const id = $('midi-input').value; detach(); render();
    if (!access || !id) { say('Choose a MIDI input.'); return; }
    const chosen = access.inputs.get(id), token = ++generation;
    if (!chosen || chosen.state === 'disconnected') { say('This MIDI input is unavailable.'); return; }
    try {
      await chosen.open();
      if (token !== generation || !access || chosen.state === 'disconnected') { try { await chosen.close(); } catch (_) {} return; }
      input = chosen; input.addEventListener('midimessage', receive); observed = []; render();
      say('Input connected. Select an action, choose Learn, then press and release one pad or button.');
    } catch (_) { if (token === generation) { input = null; render(); say('The input could not open. Choose it again or use touch and keyboard.'); } }
  }
  function receive(event) {
    if (document.hidden) return;
    const m = M.message(event.data); if (!m) return;
    observed.push(m); observed = observed.slice(-8);
    $('midi-last').textContent = label(m) + ' · value ' + m.value;
    $('midi-events').replaceChildren(...observed.map(item => {
      const li = document.createElement('li'); li.textContent = (item.kind === 'note' ? 'Note' : 'CC') + ' ' + item.number + ' · channel ' + (item.channel + 1) + ' · value ' + item.value; return li;
    }));
    report();
    if (learning) {
      try {
        const next = M.learn(mapping, m, learning.action, learning.threshold);
        if (!next) return;
        mapping = next; route = M.router(mapping); route.route(m); learning = null; render();
        say('Control learned. Release it, then press again to test. Use the screen Play button first for timed audio.');
      } catch (error) { say(error.message + ' Learning is still waiting for a different control.'); }
      return;
    }
    for (const action of route.route(m)) {
      const button = $(action);
      if (button.disabled) { say('Timed tap is waiting. Start tones with the screen Play button, or learn Untimed next note.'); continue; }
      button.click(); say((action === 'tap' ? 'Timed tap sent.' : 'Untimed next note sent.') + ' See the exercise feedback below.');
    }
  }
  $('midi-connect').addEventListener('click', async () => {
    if (access) return;
    if (!window.isSecureContext || typeof navigator.requestMIDIAccess !== 'function') { say('Web MIDI is unavailable here. Use an HTTPS page and a supporting desktop browser, or continue with touch, keyboard and untimed practice.'); return; }
    const token = ++generation; $('midi-connect').disabled = true; say('Waiting for MIDI permission. Microphone access is not requested.');
    try {
      const granted = await navigator.requestMIDIAccess({ sysex: false });
      if (token !== generation || document.hidden) return;
      access = granted; access.addEventListener('statechange', portsChanged); say('MIDI access ready. Choose an input.'); ports(true);
    } catch (_) { if (token === generation) say('MIDI access was denied or could not start. Touch and keyboard still work.'); }
    finally { if (!access) $('midi-connect').disabled = false; }
  });
  $('midi-disconnect').addEventListener('click', () => disconnect('MIDI disconnected. Mappings remain in this tab; no input is listening.'));
  $('midi-input').addEventListener('change', chooseInput);
  $('midi-learn').addEventListener('click', () => {
    const threshold = Number($('midi-threshold').value);
    if (!input || !Number.isInteger(threshold) || threshold < 1 || threshold > 127) { say('Choose a connected input and a threshold from 1 to 127.'); return; }
    mappingGeneration++; learning = { action: $('midi-action').value, threshold }; render(); say('Learning: press and release one pad or button. This press will not score.');
  });
  $('midi-cancel').addEventListener('click', () => { learning = null; render(); say('Learning cancelled. Existing mappings retained.'); });
  $('midi-clear').addEventListener('click', () => { mappingGeneration++; mapping = M.empty(); route = M.router(mapping); learning = null; render(); say('Mappings cleared. Controller remains connected until you disconnect.'); });
  function download(value, filename) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  $('midi-export').addEventListener('click', () => { download(mapping, 'tarantula-midi-mapping.json'); say('Mapping download requested. This contains bindings only, without device IDs or recordings.'); });
  $('midi-test-export').addEventListener('click', () => { report(); download(JSON.parse($('midi-report').value), 'tarantula-controller-test.json'); say('Test record download requested. Review your notes before sharing; nothing was uploaded.'); });
  $('midi-import').addEventListener('change', async () => {
    const file = $('midi-import').files[0]; if (!file) return; const token = ++mappingGeneration;
    try {
      if (file.size > 16000) throw new Error('Mapping exceeds 16 KB.');
      const next = M.validate(JSON.parse(await file.text())); if (token !== mappingGeneration) return; mapping = next; route = M.router(mapping); learning = null; render();
      say('Mapping imported. Test it on your actual controller; importing does not verify hardware.');
    } catch (error) { if (token === mappingGeneration) say('Import rejected: ' + error.message + ' Previous mappings retained.'); }
    $('midi-import').value = '';
  });
  ['output-route', 'physical-result', 'midi-notes'].forEach(id => $(id).addEventListener('input', report));
  document.addEventListener('visibilitychange', () => { if (document.hidden) { generation++; learning = null; route.reset(); render(); say('MIDI actions paused while this page is hidden.'); } });
  window.addEventListener('pagehide', () => disconnect());
  render();
})();
