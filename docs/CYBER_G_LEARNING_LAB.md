# Music, Code, and Games — Cyber-G learning lab proposal

Status: scoped proposal, not a implemented or device-verified integration. Separate from PIXIE; shares accessibility, consent, privacy, rights provenance, human review, and evidence-limit commitments.

## Audience and shared outcome

Musicians learn code by editing a short musical exercise. Coders learn pulse, notes, and musical structure by playing it. Game developers map musical input to game events.

One shared learning loop: watch an authorized process explanation, answer source-supported questions, play a cleared exercise, inspect its note/timing data, change one parameter, and export the result.

Ren Gill's process videos are credited reference sources. They do not imply endorsement or permission to distribute his music. "Not stated in this source" and "My responses are limited to this source" are valid lesson outcomes. No simulated artist voice or private-intention claims.

## First prototype scope

Extend this repository's existing browser prototype:
- One companion lesson with three timestamp-supported questions after a specific source video is verified.
- One independently authored synthetic-tone exercise initially; verified public-domain compositions may be added with edition and territory evidence.
- Tap/keyboard play plus an untimed text/listening alternative.
- A readable note list and bounded edit controls for tempo, note, duration, and game action. Avoid arbitrary JavaScript execution in the learner UI.
- A chart editor with validated import/export, lesson metadata, and rights provenance alongside note events.
- A simulated input monitor and a documented adapter boundary for future MIDI input.
- Local export/reset; no account or telemetry required for the core loop.
- Audio-clock-based scheduling, calibration, reduced motion, and calm feedback. Do not distort the screen as a penalty for misses.

A single exercise could introduce quarter notes, eighth notes, and a repeated motif, then let the learner change tempo or map a note to an action such as moving a character. That is our original exercise, not a claim about Ren's creative process.

Current code inspection found sample hardcoded beatmaps, synthesized hit sounds, keyboard/pointer controls, pause/resume, and bare chart JSON export. This is not proof of runtime correctness, audio synchronization, educational effectiveness, or accessibility.

## Tool roles

| Tool | Role | Boundary |
| --- | --- | --- |
| Existing browser game | Lesson host, rhythm practice, chart editing, input-to-game experiments | Existing code is a prototype; test before claiming readiness |
| Synthesia | Optional keyboard practice with imported permitted MIDI and supported score formats | Separate application; check version, cost, input, and accessibility |
| Clone Hero | Optional controller rhythm practice | Export compatibility requires an explicit converter and verification |
| Audacity | Desktop recording, editing, effects, WAV/OGG export, optional audio.com sharing | Official builds target Windows, macOS, Linux; do not require it for iPad learners |
| MuseScore Studio | Compose and edit notation; export MIDI, MusicXML, PDF, or rendered audio | Review score/arrangement rights and playback-sound terms separately |
| MuseHub / MuseFX | Optional effects and sound-tool discovery for exercises about reverb, delay, or dynamics | Some products need accounts or payment; no paid plugin required for the pilot |
| MuseSounds | Optional MuseScore Studio playback sounds | Not interchangeable with generic Audacity effects; rendered-use and redistribution terms need checking |
| Audio.com | Optional published listening examples, credits, licenses, download settings, and collection/embedding workflows | Unlisted is link-accessible, not private; no automatic publishing |
| SuperMe | Advisory synthesis and later consent-based reviewer discovery | AI advice is not a musician's approval or device validation |
| Runway | Optional labeled concept imagery or promotional media | Not evidence of device behavior or an exact teaching diagram; video generation currently unavailable in the connected workspace |

No external account keys belong in browser source. Authenticated publishing requires a separate user-authorized action and secure handling. Do not bundle sound-library samples or plugin binaries with lesson exports.

## Cyber-G: supported claims and unresolved interface

Enya's product information documents USB-C OTG recording on the Cyber-G. Enya's Chinese product listing describes the detachable keyboard as usable independently for MIDI over Bluetooth or Type-C. These describe different paths; audio output is not proof of note/control event access.

No public developer SDK, full-body control protocol, LED-control API, or tested integration is established by this proposal. Hardware model/module and firmware matter.

Start with play-along instructions and simulated notes. Do not claim automatic scoring of the assembled instrument.

Validate with a real unit:
1. Record exact Cyber-G model, installed module, firmware, Enya app, operating system, and connection.
2. Check USB audio and keyboard MIDI separately in a receiving app.
3. Confirm the events actually exposed: notes, velocity, controller messages, or only audio.
4. Check input access in the chosen browser. Web MIDI has limited browser availability and requires a secure context and permission. If unsupported, retain touch/play-along; investigate a native bridge separately.
5. Measure timing on speakers, wired output, and Bluetooth.
6. Check iPad Files import/export, VoiceOver, Switch Control, text size, reduced motion, and one-handed input.
7. Document disconnect/reconnect and denied-permission behavior.

Real-time chord recognition, automatic technique assessment, proprietary app control, firmware modification, and hardware certification are outside the first prototype.

## Recording and sharing workflow

1. Create or record an authorized exercise.
2. On desktop, edit it in Audacity; optionally compare a dry version with a permitted effect. iPad learners retain a browser/local-file route.
3. Keep editable source files locally. Export an audio copy for playback and a separate MIDI/score or chart file for note data.
4. Review composition, arrangement, recording, and contributor permissions. A downloadable track or user-selected license is not proof of clearance of all underlying works.
5. Choose local file sharing, or explicitly approve an Audio.com publication with title, credits, license, listed/unlisted status, and download settings.
6. Test the exported pack and accessible lesson route. Audio.com playback can be a listening reference; do not use a network stream as a precision rhythm clock without buffering and timing verification.

Current Audio.com catalogue metadata includes both original-work descriptions and derivative/remix descriptions with different license settings. None has been selected or cleared as a reusable lesson asset here.

## Definition of a complete first developer project

- Reproducible run instructions and a working end-to-end exercise.
- Documented lesson/chart schema, import validation, provenance, and input adapter examples.
- Clear distinctions between simulation, supported platform behavior, and hardware-tested behavior.
- Tests covering malformed imports, timing logic, MIDI note-off handling where implemented, and recovery from disconnected devices.
- Recorded browser/iPad accessibility and interaction checks.
- One musician and one coder can complete the shared loop without publishing or disclosing personal information.
- Rights and consent records accompany every distributed asset.

## References

- [Ethical lesson policy](https://github.com/ibloud/tarantula-clone-hero/blob/main/docs/ETHICAL_MUSIC_LESSONS.md)
- [Existing prototype boundaries](PROVENANCE-AND-PROTOTYPE-BOUNDARY.md)
- [Enya Cyber-G product specifications](https://www.enya-music.com/products/cyber-g)
- [Enya Cyber-G Chinese product listing](https://www.enyamusical.com/cyberg-listing)
- [Web MIDI API and browser constraints](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)
- [Synthesia](https://synthesiagame.com/)
- [Audacity: save and export](https://support.audacityteam.org/basics/saving-and-exporting-projects)
- [Audacity official platforms](https://www.audacityteam.org/download/)
- [Audacity realtime effects](https://support.audacityteam.org/audio-editing/using-realtime-effects)
- [MuseScore file export](https://musescore.org/en/print/book/export/html/329674)
- [MuseHub products](https://support.musehub.com/en/articles/15070593-getting-products)
- [MuseSounds purpose](https://support.musehub.com/en/articles/15070615-what-are-musesounds)

No application code, hardware integration, publication, or media generation is delivered by this document.
