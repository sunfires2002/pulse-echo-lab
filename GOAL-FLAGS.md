# LABO GOAL flags, phase 1

Branch `codex/labo-goal-flags`, based on independent LABO main `6fe8979`. No main merge or publication. Formal pilot, PRISM CUT and Sports Score Camera are not modified.

## Confirmed prism-goals/1 contract

The authority examined is `prism-cut/logger.html`, commit `ab4240e`, functions `peData` (around lines1077–1101), `base` (line368) and `scorerData` (line1021). There is no separate schema file in that checkout.

- `sec`, `kickoff_sec`, `end_sec` are positions within the uploaded video, not time elapsed since kickoff.
- With a YouTube source, the exporter uses the original player position (b0=0).
- With a file source, the exporter already subtracts its output-video base once: actual cut start if a cut exists, otherwise tin or zero. All three fields use the same base and round to tenths.
- LABO uses the received `sec` unchanged. It never subtracts kickoff, cut start or ten seconds. Kickoff/end remain metadata, not duration or clipping bounds; actual YouTube duration is the chart domain.
- `half` is `1st`/`2nd`; `video` is `edit`/`quick`. `team` is index0/1 in `teams`. The exporter already applies team-order flipping and cumulative score order. OG does not reverse team or score in LABO.
- Optional scorer is `{number,name}`, either one of those string fields, or `{og:true}`. Number strings retain leading zeros. Numeric jersey numbers are not coerced; malformed optional scorer is omitted with a warning. No assists are added.

A read-only contract probe executed the actual exporter functions with controlled browser inputs: YouTube goal90.1/kickoff12.5 remained90.1/12.5, while file cut-base10.7 produced goal79.4/kickoff1.8. Number07 remained a string. PRISM source was not edited.

## Data and integration

`lab-goals-core.js` validates and freezes normalized records. One record replaces the entire imported goal list for match_id+half, per the exporter contract. youtube_id must also match the selected video to display. `video` and `source` are retained as metadata, not guessed timing transforms. Highlights have no inferred half and show no flags.

`PULSE_LAB_GOALS.store` is an in-page store. `PULSE_LAB_GOALS.current()` supplies the same normalized goal objects to flags and the existing MATCH LOG shell. The old four unrelated mock rows are replaced by these rows; there is no new MATCH LOG screen, editing UI or score aggregation.

- Invalid root JSON does not replace the previous import. Invalid individual goals are excluded with warnings. Duplicate goal numbers are excluded.
- Goals beyond the current video duration are hidden in both displays without mutating the normalized record. Unknown/stale metadata prevents flag display or seek.
- Precise GOAL seeks go through the existing LAB seek adapter with the imported fractional second; ordinary graph/knob seeks retain their existing whole-second behavior. Player play/pause state is not explicitly changed by a GOAL click.
- All flag positions use the real Chart.js x scale and the same canvas-to-panel conversion as PULSE. Yellow flags at the lower plot edge differ from the white playback line/knob.
- Close goals keep their own exact x positions. A count badge indicates overlapping flags. Hover/focus opens a list where each nearby goal can be selected; each flag is independently keyboard focusable. Details avoid all visible LAB panels. If no free space exists in a crowded custom layout, native titles and MATCH LOG rows remain available instead of covering controls. Escape closes details.
- The original reaction graph/one-minute aggregation is unchanged, including its existing 30 reaction bins. GOAL flags can appear beyond minute30 because they use the full real-video scale independently.

## Trying it locally

Open `match.html?id=lab-sample-b&mode=lab`, then LAB menu → GOALフラグ（実験） → 検証サンプルを読む, or choose a prism-goals/1 JSON file. The supplied fixture is explicitly for `lab-sample-b` and is never auto-loaded on the real-named sample match. It is synthetic LAB data using the existing public sample video. File imports are limited to1MB/1000goals.

The JSON stays only in this page's memory. Reloading clears GOAL imports; load the file again. This deliberately adds no persistence, migration, production requests, telemetry or server upload. Existing layout storage and namespaced migration are unchanged. No production credentials are present. The Pages allowlist includes the new runtime files and sample fixture, ready for a later approved deployment.

## Verification

- Pure normalization/store tests: original seconds, all requested scorer shapes, leading07, OG, absent/invalid scorer, invalid numbers/teams/scores, wrong schema/identity, whole-list replacement and zero-goal input.
- Real Chart.js with controlled Player API:1205/1800/3677.6seconds at1280×720,1920×1080,2500×928. Start/middle/end-near, multiple/nearby goals, fractional seeks, matching half/video, out-of-range/invalid/unknown duration, failed import preserving prior data. Marker coordinate errors under0.1px.
- GOAL details do not intersect the existing panels at these sizes. Normal graph click and knob drag still seek once on release. Moving/resizing PULSE preserves flag alignment. Dock→reload→restore→split works; layout bytes are retained and GOAL imports are deliberately absent after reload.
- Real YouTube at1280×720: Mx5IiSYW7T8 (~1389s), dSIO3AdVRIs (~1641s), l3QQQu7QLoM (~3678s). Flags seek at1.5s, middle+.4s and duration−1.5s; API seek arguments equal imported decimals, playback resumes and marker positions match. The61-minute video/fixture selection is test-browser-only; app match data is unchanged.
- Existing PULSE regression passes at1280×720 and2500×928: dedicated tooltip while playing/paused, second click/drag, dock/reload/split. Silk TV/desktop TV/phone/phone landscape/tablet baseline geometry and axes match main.
- Pages-bundle end-to-end regression completed at1280/2500: sample-file UI, local post/delete, layout export/import, preview, tactics and TV home round trips. One2500 sample-readiness wait timed out in the combined run; the isolated2500 rerun completed without product changes.
- Storage migration/rollback tests pass. Every browser suite records zero Supabase requests, and all such requests are blocked. No production writes or reads are exercised.

Run: `node tests/goals-core.cjs`, `node tests/goal-flags.cjs`, `node tests/goals-youtube.cjs`, `node tests/lab-storage.cjs`. Browser tests need Playwright/system Chrome and `GOAL_TEST_URL` (default localhost8034) / `GOAL_EVIDENCE_DIR`. Existing regression uses `PULSE_TEST_URL`, `PULSE_EVIDENCE_DIR`, `PULSE_TEST_KIND=lab`.

Evidence is in the task's `labo-goal-evidence` directory: results.json, real/youtube-results.json, prism-contract.json, pulse-regression/results.json and screenshots. Browser fixtures do not modify app data.

## Limits

Physical devices/remote/Safari are not tested. API seek targets preserve tenths, but YouTube seek/playback is not frame-accurate; actual time measurements include short playback before pausing. Real user export files have not been supplied; compatibility is confirmed against the current local exporter and synthetic files. Imported metadata cannot prove that the user selected the correct upload/cut; no compensating offsets are guessed. No GOAL import persistence or automatic half association for highlights is added in this phase. Main and deployed LABO remain unchanged pending review.
