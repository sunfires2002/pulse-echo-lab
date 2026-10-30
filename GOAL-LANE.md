# LABO GOAL lane layout (candidate)

## 22px size follow-up (2026-10-30 candidate)

Base: published LABO main `95f69d9`; branch `codex/labo-goal-ball-size`. This section supersedes the18px ball sizing and24px grouping threshold in the historical notes below. No main integration or publication.

- Ball type22px; actual button28×24px; lane24px. The previous2px margin above the lane and2px gap below it are absorbed by its4px growth. Lane center and detail top are unchanged; panel160/180/180px, canvas48px, plot19px and detail minimum24px are preserved. Focus outline is inset so it does not overlap the axis or details.
- Only the LAB Chart.js options gain layout padding left16/right28px, top/bottom0. The right allowance includes the14px half-target and count badge. Chart.js also reserves its own label space; the padding does not change min0/maxDuration or enable offset. Balls, guide, playhead, hover, click and knob all keep using the very same live Chart.js seconds scale. No goal-only clamping or timestamp adjustment is added. TV/review options do not gain this padding.
- A cluster's count badge is placed1px beyond its rightmost button, so it covers no ball. Grouping includes40px clearance for the28px target and badge; touching chains form one selection group. The detail list uses that same group and refreshes when resizing changes membership. Every ball stays at its exact second position, with individual goal selection in the detail area.
- Autoclose260ms, touch/keyboard retention, scorer/07/OG, normalized shared MATCH LOG data, prism-goals/1, import lifetime and storage are unchanged.

`tests/goal-size.cjs` compares the untouched main build against the candidate at1280×720,1920×1080,2500×928: sample,0/0.2s and1640.8/1641s endpoints, nearby2 and a3-goal chain, long scorer names and minimum420px panel width. It asserts22px/28×24px, badge clearance from all targets and canvas edges, complete axis, unchanged panel/canvas/plot/detail heights, and common ball/guide/playhead positions. Before/after screenshots and JSON are in the external task artifact `goal-size-review/compare`.

Existing hover, touch/keyboard, inline lane/legacy-storage/dock-reload-split, actual YouTube goal seeking (1389/1641/3678s), regular PULSE and unchanged-device baseline suites also pass. Dedicated size/hover/lane suites report zero Supabase HTTP/WebSocket attempts and zero page errors. Real-video/PULSE suites report zero Supabase HTTP requests. Chrome/emulation evidence only; Safari, physical devices and cross-OS emoji rendering are unverified. No Fire TV GOAL UI is implemented. Cache keys: goal CSS/JS1.2.1, PC LAB script1.2.3, desktop loader1.2.5.

Base: independent LABO main `db6a18f`. Branch: `codex/labo-goal-lane`. This supersedes the floating GOAL detail layout described in GOAL-FLAGS.md. No main merge or publication.

## GOAL ball interaction update (2026-10-30 candidate)

Base: published LABO main `4fe2009`. Branch: `codex/labo-goal-ball`. This section supersedes the flag appearance and persistent-detail behavior below; the measured panel/chart dimensions are unchanged. No main merge or deployment in this task.

- Balls use the requested `⚽` character, 18px type in a24×20px button within the existing20px lane. Native OS emoji rendering is retained. The nearby badge and exact per-goal seconds positions remain; the24px nearby threshold matches the larger target width.
- A thin yellow dashed, pointer-transparent guide runs from the plot top to the lane center. It uses the existing `timeline.point(sec)`/Chart.js seconds position, with the canvas CSS scale and live panel/lane rectangles for vertical placement. It follows move/resize/dock. The white playhead and its knob are unchanged.
- Pointer hover changes details immediately. Leaving both the balls and detail area closes after260ms. Entering details cancels closure, so their separate near-goal buttons remain usable. Focusing the same ball no longer rebuilds its details unnecessarily.
- Keyboard focus inside the lane/details retains the selection; Escape or leaving focus closes it. Touch selection stays available for tapping an individual nearby goal, and tapping elsewhere on the page closes it. Browser-level touch emulation was enabled after PC startup to test a touch-capable PC without changing existing mobile routing.
- Focusing/hovering an individual detail row positions the guide at that goal. No native title or floating GOAL popup is introduced. No selected/imported goal state is persisted. Context changes and stale-button validation remain unchanged.

`tests/goal-hover.cjs` covers all3 sizes: hover switch, leave, transition into details, mouse click then leave, keyboard retention/Tab/Enter/Escape, guide x/top/end coordinates, resize/move and stale-button rejection. It also tests Chrome touch events for ball selection, nearby row tap and outside dismissal. `tests/goal-lane.cjs` retains none/one/multiple/nearby/long-name/minimum-size/dock/reload/split/legacy-key checks. `tests/goals-youtube.cjs` passes on actual1389/1641/3678-second videos with decimal API seek targets. Existing PULSE, schema and storage suites pass. Dedicated hover/lane HTTP and WebSocket Supabase capture lists and page-error lists are empty.

Evidence is stored outside the repository in `goal-ball-review/`: hover, lane, real and pulse results/screenshots. Checks are Chrome browser/emulation evidence, not physical devices or cross-OS emoji proof. YouTube seeking is API-based, not frame-accurate. Production PULSE ECHO, PRISM CUT, Sports Score Camera and Supabase are unchanged. Cache keys: goals JS/CSS1.2.0, desktop loader1.2.4.

## Measurement and height decision

All values below are CSS pixels, measured in real Chrome. The previous canvas including its time axis was 48px high, with a 19px reaction plot. The remaining empty space was below that canvas inside `.heatmap`.

| Window | Previous panel | Empty space below canvas | New panel | Goal lane | Detail viewport |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1280×720 | 130 | 18.8 | 160 | 20 | 24.8 |
| 1920×1080 | 180 | 68.8 | 180 | 20 | 44.8 |
| 2500×928 | 180 | 68.8 | 180 | 20 | 44.8 |

The compact panel cannot fit a 20px lane plus usable 24px detail viewport into 18.8px. Header39.2 + border/padding18 + gap6 + original canvas48 + margin2 + lane20 + gap2 + detail24 =159.2px, rounded to a minimum160px. Larger default panels stay180px. GOAL count and hover do not change panel height. The canvas/plot are never reduced to make room.

Minimum interactive panel size is now420×160 rather than420×120 on compact displays; larger displays already used a160px minimum. At minimum size, details alone scroll. A28px right margin keeps the detail scrollbar/buttons away from the existing resize handle.

Old saved dimensions are not migrated, erased or silently rewritten. A stored130px panel is visually clamped to160px and kept onscreen; the raw LABO record and original legacy key remain intact. A subsequent explicit move/resize saves the user's visible dimensions through the existing layout machinery. Existing larger layouts retain their size.

## Layout and behavior

The DOM is now:

- `#tvMapDock` (existing panel, header/play controls unchanged)
  - `.heatmap`
    - `.heatmap-chart-wrap` / canvas: original reaction plot + time axis,48px
    - `#labGoalArea`
      - `#labGoalFlags`: relative20px lane
      - `#labGoalDetail`: in-panel flex area, minimum24px, vertical scrolling only

There is no GOAL region appended to body, fixed viewport popup, free-video-space search, or delayed mouse-leave dismissal. Details stay available while moving from a flag into their buttons, until another flag, record/mode change, or Escape. With no selection, the small hint is shown. Nearby goals retain separate exact x positions, count badge, keyboard focus and per-goal seek buttons in the detail area.

Horizontal positions still come from `PULSE_LAB_TIMELINE.point(sec)`, which uses the existing Chart.js seconds scale. Its panel-relative coordinate is converted into the lane's local origin using the live rectangles and panel border; there is no independent time ratio or offset. Moving/resizing/docking preserves this same conversion.

Native `title` attributes are removed from flags, avoiding a second delayed tooltip; full accessible `aria-label` text remains. The normal reaction tooltip on the canvas is unchanged. GOAL hover hides the reaction tooltip. Flags no longer occupy the plot or the white line/knob's drag area.

## Data and scope unchanged

`lab-goals-core.js`, the sample JSON, scorer shapes/leading07, shared MATCH LOG data, fractional GOAL seeks, half/video matching, out-of-range filtering and in-memory-only import are unchanged. No persistence or network interface is added. No Fire TV support or other feature is added. All new CSS is LAB-mode scoped. Cache versions: goals CSS/JS1.1.0, panel script1.2.2, loader1.2.3.

## Verification

`tests/goal-lane.cjs` tests all three window sizes with none/one/multiple/nearby2 goals and a120-character scorer name. It checks the unchanged48px canvas/19px plot, complete time axis, lane below canvas, details below lane and inside panel, no native flag titles, exact x alignment (<0.1px), no panel scroll/horizontal overflow, and pointer travel into detail buttons after700ms.

At420×160, long details scroll internally; other GOALs remain selectable, the resize handle remains unobstructed, and ordinary reaction hover still works. Moving, docking, reload/restore and separation pass. An isolated old130px saved-layout case verifies visual clamping without raw-storage changes.

The existing goal-flags suite passes at1280×720,1920×1080,2500×928 for durations1205/1800/3677.6s, precise seeks, malformed/out-of-range data, video/half switch, move/resize and dock/reload/split. Its overlap checks now exclude the owning PULSE panel because containment there is intentional.

Real YouTube goal tests pass with23/27/61-minute videos at1280×720. API seek arguments retain the imported decimals. Existing PULSE regression passes at1280 and2500 for play/pause tooltip, click/drag, docking/restoration; Silk-TV, desktop-TV, phone, phone-landscape and tablet baseline geometry/axis checks pass. Supabase HTTP/WebSocket request lists and page-error lists are empty in the dedicated lane suite.

Evidence: task artifact `goal-lane-evidence`, before/after JSON measurements/screenshots, lane-results.json, regression/results.json, real/youtube-results.json and pulse/results.json. `GOAL_TEST_URL`/`GOAL_EVIDENCE_DIR` configure goal tests; existing regression uses PULSE_TEST_URL/PULSE_EVIDENCE_DIR.

Chrome layout emulation and actual YouTube were tested, not physical devices/Safari. YouTube is not frame-accurate; the observed seek target and position evidence is API-based. At unusually tiny whole-browser heights, the existing viewport-clamping policy still takes precedence; the specified720/1080/928px windows are covered. Formal pilot, PRISM CUT, Sports Score Camera and LABO main/deployment are not modified.
