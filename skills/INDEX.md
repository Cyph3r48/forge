# Vendored Skills Index

| Name | Source repo | License | Purpose | Factory seat |
|---|---|---|---|---|
| before-and-after | github.com/michaelshimeles/skills | PolyForm Shield License 1.0.0 | Capture before/after screenshots of pages or elements for visual comparison in PRs. | Reviewer |
| build-dark-factory | github.com/coleam00/skills | upstream repo license | Build a dark factory around a PRD: a repo that takes issues in and ships validated code with nobody at the keyboard. | Foreman |
| code-structure | github.com/michaelshimeles/skills | upstream repo license | Split features into orchestrating actions and a reusable service layer so operational logic isn't duplicated. | Builder |
| evidence-driven-testing | github.com/michaelshimeles/skills | upstream repo license | Record visual/measured proof while testing, then post the evidence and results summary to the PR and tracker issue. | Tester |
| greploop | github.com/michaelshimeles/skills | MIT | Iterate a PR/MR/CL until Greptile review reports 5/5 confidence with zero unresolved comments. | Reviewer |
| greploop-apps | github.com/michaelshimeles/skills | MIT | Same loop as greploop but triggers reviews via @greptile-apps for PRs too large for the plain mention. | Reviewer |
| new-feature | github.com/michaelshimeles/skills | upstream repo license | Start every task in an isolated Git worktree branched from origin/main so agents work in parallel without conflicts. | Builder |
| piv-fix-review-findings | github.com/coleam00/skills | upstream repo license | Triage review findings, fix chosen ones one at a time with tests, defer/log the rest, validate, commit and push. | Builder |
| piv-review-pr | github.com/coleam00/skills | upstream repo license | Full PR review: fetch, run validation, review the diff with fresh eyes, categorize findings by severity, post results. | Reviewer |
| piv-slice-epic | github.com/coleam00/skills | upstream repo license | Slice an epic into PIV-sized tickets with a dependency graph and create them in the tracker. | Foreman |
| piv-validate | github.com/coleam00/skills | upstream repo license | Run the project's full validation suite (tests, type checks, lint) and report overall health. | Tester |
| prime-codebase | github.com/coleam00/skills | upstream repo license | Prime the agent with deep codebase understanding (structure, docs, key files) before starting work. | Builder, Tester |
| rules-check-drift | github.com/coleam00/skills | upstream repo license | Check whether the rules file (CLAUDE.md/AGENTS.md) still matches the codebase after recent changes. | Reviewer |
| source-code-context | github.com/pawel-cell/micky-podcast-agentic-engineering (older skill set by Micky/Michael Shimeles) | upstream repo license | Give the agent local source-code references so it stops guessing API/framework behavior from incomplete docs. | Builder |
| system-evolution-review | github.com/coleam00/skills | upstream repo license | Meta-review of how well the implementation followed its plan; classify divergences and recommend AI-layer improvements. | All |
| system-execution-report | github.com/coleam00/skills | upstream repo license | Generate a structured report on a just-completed implementation: what was done, divergences, challenges. | All |
| unslop | github.com/michaelshimeles/skills | MIT | Strip AI tells (em dashes, filler, hedging, puffery) from text written for humans. | All |
| worktree-create | github.com/coleam00/skills | upstream repo license | Create parallel git worktrees, each on its own branch with config copied in, deps installed, and a health check. | Foreman |
| worktree-merge | github.com/coleam00/skills | upstream repo license | Integrate feature branches from parallel worktrees through one safe integration branch, validating after each merge. | Foreman |

## Deliberately not vendored (available upstream)

- plan-create-prd
- plan-architecture
- plan-create-stories
- piv-implement
- piv-plan-implementation
- piv-commit
- piv-create-pr
- piv-run-full-loop
- piv-investigate-issue
- piv-implement-issue
- agent-browser
- ast-grep
- drive-screen
- hooks-create
- ablate-ai-layer
- opportunity-scan
- second-brain-audit
- skills-create
- setup-ai-tutor
