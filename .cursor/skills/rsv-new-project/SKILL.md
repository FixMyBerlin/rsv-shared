---
name: rsv-new-project
description: >-
  Bootstrap a new FixMyBerlin RSV landing-page repo (rsv-<slug>) from an existing
  RSV site via shared/scripts/new-project.ts, then complete the manual follow-ups:
  git init and rsv-shared submodule, GitHub repo, Keystatic GitHub App, brand
  colors and map style, favicons and OG image, Netlify site, production DNS,
  Trassenscout API, content, Matomo. Use when spinning up a new RSV landing page,
  copying an existing site as a template (as rsv-veloroute was), or when the user
  mentions new-project.ts or the RSV bootstrap checklist.
disable-model-invocation: true
---

# New RSV landing-page project

Copy an existing `rsv-*` website into a sibling `rsv-<slug>`, rewrite the
project-specific values, then finish git, CMS, and hosting by hand.
`rsv-veloroute` was spun up this way.

Not for greenfield FMC/TanStack repos — that is **`new-project-setup`**.

After the script runs, the new folder has copied code and a configured
`BASE_CONFIG`, but **no** `.git`, **no** `shared/` submodule, **no** GitHub
repo, and **no** installed dependencies. Everything under
[Manual follow-ups](#manual-follow-ups) is still on you.

## Before running

- Run from **inside an existing RSV website repo** (e.g. `rsv-rs21`), not from
  the parent folder and not from `rsv-shared`.
- Preflight refuses to run unless: the parent folder is named `rsv-landingpages`
  (the required local layout), the current repo has `package.json`,
  `config/config.ts`, `astro.config.mjs`, and `shared/`, and the target
  `../rsv-<slug>` does not exist yet.
- Collect from the user: slug, CMS name, display name, production URL, and
  whether to clear content.

## 1. Run the bootstrap script

```bash
bun ./shared/scripts/new-project.ts \
  --slug <slug> \
  --cms-name <CMS_NAME> \
  --display-name "<Display Name>" \
  --url https://example.de \
  [--trassenscout-slug <slug>] \
  [--clear-content]
```

| Flag                  | Example                  | Effect                                                        |
| --------------------- | ------------------------ | ------------------------------------------------------------- |
| `--slug`              | `rs8`                    | Folder `../rsv-<slug>`, repo name, Keystatic app slug          |
| `--cms-name`          | `RS8`                    | `BASE_CONFIG.CMS_NAME`                                         |
| `--display-name`      | `Radschnellweg 8`        | `README.md` heading and `META.title`                           |
| `--url`               | `https://rs8.example.de` | `BASE_CONFIG.PRODUCTION_URL`                                   |
| `--trassenscout-slug` | defaults to `--slug`     | `TRASSENSCOUT_PROJECT_API_URL`                                 |
| `--clear-content`     | flag                     | Empties collection folders under `src/content/`, keeps singletons |

Slug must be lowercase alphanumeric with dashes; URL must be `http(s)`.
Run with `--help` for the same list.

What the script changes in the new folder:

- Copies the whole tree except `.git`, `.gitmodules`, `node_modules`, `.astro`,
  `dist`, `.netlify`, `shared`, `.DS_Store`.
- `package.json` → `name: rsv-<slug>`.
- `config/config.ts` → regenerated from scratch: `META.title`, a **TODO**
  `META.description`, `USE_MATOMO: false`, and `BASE_CONFIG`.
- `README.md` → regenerated with the display name, production URL, and CMS URL.
- `.env` → Keystatic secrets blanked, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` set to
  `rsv-lp-<slug>-keystatic`.
- `.env.example.local` / `.env.example.netlify` → same app slug rewrite.

It runs neither `git` nor `npm`.

## Manual follow-ups

Work through this list **inside the new project folder** (e.g.
`rsv-landingpages/rsv-<slug>/`) before shipping. Replace `<slug>` with the value
passed to `--slug` (e.g. `rs8`) and `<display-name>` with the human-readable
name (e.g. `Radschnellweg 8`).

Track progress with this checklist:

```
- [ ] 0. Git repo + shared/ submodule
- [ ] 1. Keystatic GitHub App
- [ ] 2. Brand colors and map styling
- [ ] 3. Favicons, OG image, CMS logo
- [ ] 4. Netlify site
- [ ] 5. Production URL & DNS
- [ ] 6. Trassenscout integration (optional)
- [ ] 7. Content
- [ ] 8. Matomo tracking (optional)
- [ ] 9. Final verification
```

### 0. Git repository and `shared/` submodule

The script creates no repository. Do this first, then continue with the
Keystatic app.

- [ ] `git init`
- [ ] `git branch -M main` (skip if the default branch is already `main`)
- [ ] `git submodule add https://github.com/FixMyBerlin/rsv-shared.git shared`
- [ ] Create `FixMyBerlin/rsv-<slug>` on GitHub, add it as `origin`, run
      `npm install`, then `git add -A`, commit, and push

### 1. Keystatic GitHub App

The script cannot create the GitHub App — there is no public API for it.

- [ ] Follow [Keystatic GitHub mode setup](https://keystatic.com/docs/github-mode#setting-up-git-hub-mode)
      and create a new GitHub App in the `FixMyBerlin` org named
      **`rsv-lp-<slug>-keystatic`**. The app slug must match
      `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` in `.env` / `.env.example.*`.
- [ ] Grant the App access to the new `FixMyBerlin/rsv-<slug>` repo only.
- [ ] Copy the App's `Client ID`, `Client secret`, and a freshly generated
      `KEYSTATIC_SECRET` into all three places:
  - the new repo's local `.env`, so `npm run dev` works locally
  - **Bitwarden**, so the credentials don't get lost
  - the Netlify site's environment variables (step 4)

### 2. Brand colors and map styling

The colors are still those of the template project.

- [ ] Update brand colors in `config/styles.ts` — `COLORS`, `COLORSCLASSES`,
      and `LINKCLASSES`
- [ ] Update map styling in `config/map.ts` — especially `MAPTILER_STYLE`
- [ ] Re-run `npm run predev` to make sure `validateConfig.ts` is still happy
      after your edits

### 3. Favicons, OG image, and CMS logo

- [ ] Replace the favicons under `public/icons/`. Keep the file names so
      `BASE_CONFIG.CMS_LOGO_PATH` keeps working — update it if you rename
      anything.
- [ ] Replace the OG / social-sharing image under `public/social-sharing/`

### 4. Netlify site

- [ ] Create a Netlify site for the repo (Add new site → Import from Git →
      `FixMyBerlin/rsv-<slug>`)
- [ ] Set the site name to **`cms-rsv-<slug>`** so the CMS lives at
      `https://cms-rsv-<slug>.netlify.app/keystatic` — this URL is hard-coded in
      the new repo's `README.md`
- [ ] Add all variables from `.env.example.netlify` under Site settings →
      Environment variables, using the Keystatic credentials from step 1
- [ ] Trigger a first deploy and confirm `/keystatic` loads

### 5. Production URL & DNS

- [ ] Point the production domain at the Netlify site
- [ ] Confirm `BASE_CONFIG.PRODUCTION_URL` in `config/config.ts` matches the
      live URL (the script set it from `--url`)
- [ ] Replace the TODO `META.description` in `config/config.ts` with a real SEO
      description
- [ ] Run `npm run predev` — `shared/scripts/validateConfig.ts` fails loudly if
      any required `BASE_CONFIG` field is still missing or malformed

### 6. Trassenscout integration (optional)

- [ ] Once a Trassenscout project exists for this corridor, set
      `BASE_CONFIG.TRASSENSCOUT_PROJECT_API_URL` in `config/config.ts` to the
      real URL. The script pre-fills
      `https://trassenscout.de/api/projects/<trassenscout-slug>`.

### 7. Content

If you ran the script with `--clear-content`, every collection folder under
`src/content/` is empty; singletons like `homepageHero/index.yaml` are kept so
the schema stays valid.

- [ ] Create the actual content via the Keystatic CMS, or copy MDX/YAML files
      from the template project and adapt them
- [ ] Replace the hero image at `src/content/homepageHero/image.jpg`

### 8. Optional: Matomo tracking

- [ ] Enable `USE_MATOMO` in `config/config.ts` and add the correct `siteId` in
      `astro.config.mjs` once Matomo is set up for this site

### 9. Final verification

Once all boxes above are ticked, do a fresh clone of the repo, run
`npm install && npm run predev && npm run dev`, and verify the homepage loads
without console errors.

## Script reference

Implementation: [`scripts/new-project.ts`](../../../scripts/new-project.ts) in
this repo, reachable as `shared/scripts/new-project.ts` from each site.
