# LABO GOAL lane layout (candidate)

Base: independent LABO main `db6a18f`. Branch: `codex/labo-goal-lane`. This supersedes the floating GOAL detail layout described in GOAL-FLAGS.md. No main merge or publication.

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
