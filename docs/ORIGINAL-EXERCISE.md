# Original music/code exercise

Implemented October 4, 2026 as a bounded local prototype at `lesson.html`. Direction: Dominique Devereaux / Loptr Lab; code and exercise development assistance: OpenAI Codex. The supplied four-note motif and synthesized tones are independently authored for this project, not a transcription or recording of Ren's work. No artist endorsement is implied.

## Contract

`music-code-exercise/v1` stores a title, tempo and 1–32 ordered notes. Each note has beat, MIDI pitch number, duration in beats and an action (`step` or `pulse`). Tempo is 40–180 BPM; beats 0–32; pitch 48–84; duration 0.25–4 beats. The lesson uses MIDI pitch numbering without opening a MIDI device. Input fields edit the first note and global tempo; validated JSON imports can carry a longer exercise within the bounds.

JSON import copies only expected fields. It strips supplied executable code and rights assertions, replaces provenance with a user-review requirement, and never executes chart data. File size is bounded to 30 KB. Failed import retains the previous chart. Export is local and copyable; no audio is included. Review rights and consent separately before sharing imported or edited material. Narrative Provenance is the existing local metadata/audit tool, not an automatic clearance service.

Web Audio schedules synthesized notes against `AudioContext.currentTime`; the screen timer is not the rhythm clock. Pause stops scheduled nodes and keeps elapsed time. Resume schedules the remaining note portions. Stop/edit/reset clears practice. Backgrounding pauses. No autoplay occurs on import. Timed taps match within 220 ms and cannot repeat-score a note; they apply a visible simulated action counter. Untimed Next note provides the same note/action route without a timing requirement. No punishment animation, streak requirement or instrument grading is used.

The core exercise has no service requests, accounts, analytics, network media, automatic feedback or publishing. Linked external tools are optional. Physical MIDI/OSC, Cyber-G, microphone input, audio latency calibration, real instrument assessment and Clone Hero conversion remain unimplemented. This is an original practice exercise; verified video sources and timestamp-supported Ren questions remain separate work.

## Reproduce

Serve the repository root over HTTP and open `lesson.html`. Listen once, double tempo, compare pitch versus spacing, change the first-note action to Pulse, apply, and try Next note. Export/copy the chart, reset, import and compare note data. Run `node --test tests/*.test.js` and syntax checks for `lesson-model.js` and `lesson.js`.

## Device checks still open

Record exact commit and iPad/OS/browser, date, steps and observations. Check playback after user gesture, pause/resume, denied/unavailable audio, hidden-tab pause, repeated replay, malformed/oversized imports, Files export/reimport, narrow layout, larger text, VoiceOver, keyboard focus and one-handed touch. Verify the untimed route works when audio is unavailable. Test output timing separately on speakers/wired/Bluetooth; no latency guarantee is established by model tests.

Cyber-G audio and keyboard MIDI need separate physical receiving-app tests before any adapter implementation. Browser MIDI availability must be observed separately. No hardware support claim is delivered by this lesson.

## Local preview observations

October 4, 2026, cloud Chromium HTTP preview: tempo and action edits updated JSON/table; untimed first note applied Pulse instead of Step; timed playback entered running state and paused with position retained. Audio audibility/latency, file download/reimport, VoiceOver and physical iPad/Cyber-G behavior remain unverified.
