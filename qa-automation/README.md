# QA Automation — TypeMaster

Robot Framework + Selenium + Python test suite for the TypeMaster app.
See the [root README](../README.md) for what TypeMaster is. This document covers the automation suite only.

## Status

🚧 In progress, being built alongside the app. Tests are tagged `wip` when they depend on
app features/selectors that don't exist yet — these are excluded from CI until ready.

## Quick Start

```bash
cd qa-automation
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# make sure frontend + backend are running locally first (see root README),
# then in a separate terminal:
robot --outputdir results tests/
```

Open `results/report.html` to view results.

## Structure

```
qa-automation/
├── requirements.txt
├── .env.example
├── resources/
│   ├── page_objects/       # locators + page interactions, no test logic
│   ├── keywords/           # shared/common Robot keywords
│   └── variables/          # env-driven config
├── libraries/               # custom Python keyword libraries
├── tests/
│   ├── ui/                  # Selenium-driven browser tests
│   └── api/                 # RequestsLibrary-driven API tests
└── results/                 # gitignored test output
```

## Current Test Coverage

| Suite | What it covers | Status |
|---|---|---|
| `tests/ui/ui_smoke.robot` | App loads, navbar renders, typing input + duration options present | ✅ working |
| `tests/api/api_smoke.robot` | Backend reachable, `/api/typing/texts`, `/api/typing/texts/random`, `/api/typing/categories`, and full `/api/typing/submit` validation + happy path | ✅ working |
| `tests/ui/typing_flow.robot` | Full typing test flow end-to-end: type → timer expires → WPM/accuracy/feedback display | ⏳ blocked on `data-testid`s (feature itself is live, see Notes below) |
| `tests/ui/leaderboard.robot` | Leaderboard renders submitted scores | ⏳ blocked — leaderboard page not built yet |

**Note:** score submission is no longer a separate blocked suite — `POST /api/typing/submit`
is live and already covered end-to-end in `api_smoke.robot` (validation errors, 404 on bad
`text_id`, and a happy-path submission that asserts `metrics.wpm`/`metrics.accuracy`/`result_id`
come back correctly). What's still missing is a *UI-driven* version of that flow (typing
in the browser, waiting for the on-screen result), which is what `typing_flow.robot` covers
once locators exist.

## Adding a New Test

1. If it needs new locators, add them to the relevant file in `resources/page_objects/`
   — never inline a raw CSS/XPath selector directly in a `.robot` test file.
2. If it needs a new reusable Python keyword, add it under `libraries/` with a clear docstring.
3. Tag appropriately: `smoke`, `regression`, `edge-case`, `wip`.
4. Run it locally before committing: `robot --outputdir results tests/path/to/your_suite.robot`.

## Notes for the App Side

The backend scoring pipeline (`/api/typing/submit`) is done and already exercised by
`api_smoke.robot`. What's blocking the *UI* suites now is stable locators — the frontend
currently identifies elements with things like `aria-label="Typing test input"` and plain
Tailwind classes, which are either inconsistent or break on every styling refactor.

For stable UI locators, the frontend should expose `data-testid` attributes on key
interactive elements:

- Typing input field → `data-testid="typing-input"` (currently only has `aria-label`)
- Timer display → `data-testid="timer"`
- WPM/accuracy result display → `data-testid="wpm-result"`, `data-testid="accuracy-result"`
- AI feedback text block → `data-testid="feedback-text"`
- Retry/reset button → `data-testid="retry-test"`
- Duration option buttons → `data-testid="duration-{seconds}"` (e.g. `duration-60`)
- Leaderboard rows → `data-testid="leaderboard-row"` (once the leaderboard page exists)

Until these land, corresponding UI tests are tagged `wip`.