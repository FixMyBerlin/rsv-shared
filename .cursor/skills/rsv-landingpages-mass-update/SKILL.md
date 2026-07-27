---
name: rsv-landingpages-mass-update
description: >-
  Mass-update RSV landing page repos (rsv-shared + rsv-frm7, rsv-rs21, rsv-rs8,
  rsv-veloroute): pull, refresh shared submodule, taze minor dep bumps
  (updatePackages:minor), install, bun run check, smoke bun run dev. Use when
  the user asks to pull/update all RSV landing pages, bring up the
  rsv-landingpages folder, or mass-sync submodules across sites.
disable-model-invocation: true
---

# RSV landing pages mass update

Canonical local layout (sibling checkouts, not a monorepo git root):

```
rsv-landingpages/
  rsv-shared/          # FixMyBerlin/rsv-shared
  rsv-frm7/            # FixMyBerlin/frm-7-landingpage
  rsv-rs21/            # FixMyBerlin/rsv-rs21
  rsv-rs8/             # FixMyBerlin/radschnellweg8-lb-wn.de
  rsv-veloroute/       # FixMyBerlin/veloroute
```

Each site’s `shared/` is a git submodule of `FixMyBerlin/rsv-shared.git`. `bun run dev` runs `predev` → `pullSubmodule` → may **auto-commit** the submodule pointer in the site repo (`commitSubmoduleInWebsite`).

## Branches (`develop` → `main` cleanup)

**Target:** every repo is **main-only** (GitHub default = `main`; day-to-day work on `main`).

| Repo | Today | Notes |
|------|-------|--------|
| `rsv-shared` | `main` | |
| `rsv-rs21` | `main` | |
| `rsv-rs8` | `main` | Local stale `develop` / feature branches already removed |
| `rsv-veloroute` | `main` | |
| `rsv-frm7` | **`develop`** (GitHub default) | **Last `develop`.** Also has diverged `main` (old release line). Until cleaned up, mass-update pulls **`develop`**, not `main`. |

When `rsv-frm7` is migrated off `develop` (default branch → `main`, Netlify/deploy hooks updated, remote `develop` deleted), drop the exception below and treat all sites as `main`.

## Orchestration (required)

Run as a **Cursor Compose orchestration**, not one serial agent:

1. Orchestrator plans and launches workers.
2. Workers: **Composer 2.5** (`composer-2.5`, **not** `composer-2.5-fast`).
3. Launch **in parallel** after shared is done (or shared + sites in parallel if shared is already clean on `origin/main`).
4. Prefer `run_in_background: true` for the three site agents.

| Agent | Cwd | Job |
|-------|-----|-----|
| Shared | `…/rsv-landingpages/rsv-shared` | fetch + `git pull --rebase origin main` |
| Site ×N | each landing page (incl. veloroute if present) | pull → submodule → **taze minor** → install → check → dev smoke |

## Per-repo workflow

### A. `rsv-shared`

1. `git status -sb` — stop if dirty; do not discard.
2. `git fetch origin && git pull --rebase origin main`.
3. Confirm `main` matches `origin/main`.

### B. Each landing page (`rsv-frm7` / `rsv-rs21` / `rsv-rs8` / `rsv-veloroute`)

Copy this checklist and track it:

```
- [ ] status (parent + shared/)
- [ ] pull parent (preserve dirty content)
- [ ] update shared submodule to origin/main
- [ ] bun run updatePackages:minor (taze minor + npm install)
- [ ] bun run check
- [ ] bun run dev smoke + stop server
- [ ] report final status / stashes / unpushed commits / package churn
```

**Pull parent**

- Branch: **`main`**, except **`rsv-frm7` → `develop`** until that repo’s `develop` is retired (see [Branches](#branches-develop--main-cleanup)).
- Never hard-reset / force-push / discard user WIP.
- Dirty `src/content/routegeometries/*.json` (and cache): stash only if pull requires it, then pop; always preserve.

**Update `shared` submodule**

- `pullSubmodule` / `predev` **exits** if `shared/` has uncommitted changes.
- If dirty: inspect diff; **stash inside `shared/`** (do not discard); then `git checkout main && git pull --rebase` in `shared/`.
- Detached HEAD is normal before checkout of `main`.
- Target tip should match `rsv-shared` / `origin/main` (e.g. after mass update, same SHA everywhere).

**Dependency updates (default — no Dependabot)**

These repos do **not** use Dependabot/Renovate. Bumps are manual via `package.json` scripts:

- **Default every mass-update:** `bun run updatePackages:minor`  
  (`npx taze minor --includeLocked [--maturity-period 5] --write && npm install`)
- Aligns with `bunfig.toml` `minimumReleaseAge` (5 days) where present.
- **Majors only if the user asks:** `bun run updatePackages:major` (separate pass; higher risk).
- `rsv-shared` has no app `package.json` / deps — skip taze there.
- Leave `package.json` + `package-lock.json` changes uncommitted unless the user asks to commit; summarize what moved in the rollup.
- No Dependabot PR triage — optional `gh pr list` per repo only to surface unrelated open PRs.

**Package manager (hybrid — not Bun-only yet)**

| Concern | Tool | Source of truth |
|---------|------|-----------------|
| Install / lockfile | **npm** | Tracked `package-lock.json` (+ tracked `bunfig.toml` for Bun experiments) |
| Run scripts | **`bun run …`** | `predev` and shared scripts are Bun; many `package.json` scripts still nest `npm run` internally |

- After taze, the script already runs `npm install`. If `node_modules` was missing before taze, that is enough; otherwise a fresh `npm ci` is fine when the tree must match the lockfile exactly and there is no local package churn yet.
- Do **not** commit or rely on untracked `bun.lock` from accidental `bun install` — delete it if created during bring-up.
- Plain `bun install` often fails Astro (`Cannot find module 'vite'`) unless hoisted (`bunfig.toml` `[install] linker = "hoisted"` or `bun install --linker=hoisted`). Prefer npm until the repos fully migrate off `package-lock.json`.

**Check**

- `bun run check` (type-check + format + lint).
- `check` may rewrite files under `shared/` → that dirties the submodule and blocks `predev`. Revert unintended shared edits (`git checkout -- .` in `shared/`) or stash before dev.

**Dev smoke**

1. Start `bun run dev` (expect `predev` submodule pull + possible local submodule-pointer commit).
2. Wait for Astro ready (typically `http://127.0.0.1:4321/`).
3. Confirm HTTP 200 on `/` if useful.
4. Stop the server.

Dev may rewrite routegeometry / `content_cache` JSON — treat as side effects; do not commit unless the user wants that.

## Hard rules

- No `--no-verify`, no git config changes, no force-push, no hard reset of user work.
- Do not push site submodule-pointer commits unless asked.
- Leave clear notes for any stashes created (especially under `shared/`).

## Rollup report

When all agents finish, summarize one table:

| Repo | Branch | Pull | Shared SHA | Minor deps | Check | Dev | Notes |
|------|--------|------|------------|------------|-------|-----|-------|

Call out explicitly:

- Unpushed `predev` submodule commits (ahead of origin)
- `package.json` / `package-lock.json` churn from taze (notable bumps)
- Stashes left in `shared/`
- Untracked `bun.lock` (noise — npm lockfile is canonical)
- Preserved dirty routegeometries / cache
- Any open GitHub PRs noticed via `gh pr list`

Ask before: commit/push deps or submodule commits, reset submodule commits, drop stashes, or discard geometry diffs.

## Worker prompt skeleton

Use for each site Task agent (adapt branch + known dirty paths):

```
Repo: <abs-path>
Branch: main (or develop only for rsv-frm7 until migrated)
1. Preserve dirty files (list any known WIP).
2. git fetch + pull current branch safely.
3. Update shared/ to origin/main (stash shared WIP if needed).
4. bun run updatePackages:minor (taze minor + npm install). Do not run majors unless asked.
5. bun run check; fix only install/submodule/dep blockers.
6. bun run dev smoke then kill server.
7. Return: pull result, shared SHA, notable dep bumps, check, dev, dirty/stash/ahead state.
```
