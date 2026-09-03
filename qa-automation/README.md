# QA Automation — TypeMaster

Robot Framework + Selenium + Python test suite for the TypeMaster app.
Lives inside the monorepo alongside `frontend/` and `backend/`, but is fully decoupled —
it treats the app as an external system under test (drives it via browser/HTTP only,
no direct imports of app code).

See the [root README](../README.md) for what TypeMaster is. This document covers
the automation suite only.

## Status

🚧 In progress, being built alongside the app. Tests are tagged `wip` when they depend on
app features/selectors that don't exist yet — these are excluded from CI until ready.

## Quick Start

```bash
cd qa-automation
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env

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
| `tests/ui/smoke.robot` | App loads, core page elements render | ✅ working |
| `tests/api/health_check.robot` | Backend reachable, basic response shape | ✅ working |
| `tests/ui/typing_flow.robot` | Full typing test flow, WPM/accuracy display | ⏳ blocked on `data-testid`s + WPM feature |
| `tests/api/score_submission.robot` | Score persists correctly via API | ⏳ blocked on scoring endpoint |

## Adding a New Test

1. If it needs new locators, add them to the relevant file in `resources/page_objects/`
   — never inline a raw CSS/XPath selector directly in a `.robot` test file.
2. If it needs a new reusable Python keyword, add it under `libraries/` with a clear docstring.
3. Tag appropriately: `smoke`, `regression`, `edge-case`, `wip`.
4. Run it locally before committing: `robot --outputdir results tests/path/to/your_suite.robot`.

## Notes for the App Side

For stable UI locators (instead of brittle CSS class selectors that break on every
Tailwind refactor), the frontend should expose `data-testid` attributes on key
interactive elements:

- Typing input field → `data-testid="typing-input"`
- Timer display → `data-testid="timer"`
- WPM/accuracy result display → `data-testid="wpm-result"`, `data-testid="accuracy-result"`
- Submit/finish button → `data-testid="submit-test"`
- Leaderboard rows → `data-testid="leaderboard-row"`

Until these land, corresponding UI tests are tagged `wip`.
