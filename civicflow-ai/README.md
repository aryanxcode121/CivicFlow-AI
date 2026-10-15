# CivicFlow AI

**One complaint. One accountable case.**
Prototype for the AI Synergy Hackathon 2026 (Round 1, Case 07).

CivicFlow is a focused intelligence layer for civic grievance hand-offs. It links likely duplicate complaints, suggests which department should own the case and shows the reason. An officer approves every action.

> AI suggests. An officer decides.

## What the prototype shows

| Page | What it demonstrates |
|------|----------------------|
| **Overview** (`#/`) | Officer queue with filters, department health, audit trail. Click a case to open the review panel. |
| **Report an issue** (`#/report`) | 3-step capture flow (Describe, Add context, Confirm). English and Hindi text accepted. Shows the AI suggestion and a possible duplicate before sending. |
| **Pitch mode** (`#/pitch`) | 4-slide story: the friction, identity + ownership, the product flow, proof and scope. Arrow keys work. |

### Human gate (from the proposal)
- Duplicates are only *linked*, never merged automatically.
- Low-confidence cases go to a manual queue and cannot be approved from the AI suggestion.
- Approve, Change owner and Not duplicate are the only actions, and each one is written to the audit trail.

## Run it

No build step, no dependencies.

```bash
git clone https://github.com/<your-username>/civicflow-ai.git
cd civicflow-ai
# open index.html in a browser, or serve it:
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Project structure

```
civicflow-ai/
├── index.html      # markup for all three pages
├── css/styles.css  # design system and layout (responsive)
├── js/app.js       # routing, queue, review panel, report wizard, pitch slides
├── README.md
├── LICENSE
└── .gitignore
```

## Deploy on GitHub Pages

1. Push this repo to GitHub.
2. Repo **Settings → Pages**.
3. Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Your site will be at `https://<your-username>.github.io/civicflow-ai/`.

## Important notes

- **All data is synthetic.** Counts, case IDs and percentages are demo values, not real municipal statistics.
- Confidence and similarity values are **illustrative**, not measured results.
- The "AI" in this prototype is a transparent keyword and word-overlap matcher running in the browser. The proposed production design (FastAPI, PostgreSQL + pgvector, multilingual embeddings) is described in the pitch deck and is not implemented here.
- Targets in the proposal (for example 85% true duplicates in the top 3) are acceptance criteria, not achieved performance.

## Proposed V1 scope

**In:** multilingual text duplicate search, department suggestions with reasons, officer review and audit log, status timeline and appeal.
**Out:** auto-close or auto-reject, priority scoring, live municipal integration, unvalidated image or voice understanding.

## Customize the demo data

Open `js/app.js`. The `KW` object holds department keywords and `cases` holds the seed complaints.

## License

MIT. See [LICENSE](LICENSE).
