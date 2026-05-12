# New RSV project — manual follow-ups

After running [`shared/scripts/new-project.ts`](../scripts/new-project.ts), the new
folder has copied code and a configured `BASE_CONFIG`, but **no** `.git` and **no**
`shared/` submodule yet — you add those with `git init` and `git submodule add` (see
below). The script does **not** create the GitHub repository — create `FixMyBerlin/rsv-<slug>`
on GitHub yourself, add `origin`, commit, and push. A few more things still need
to be done by hand — work through this list before you ship the new site.

## 0. Git repository and `shared/` submodule

Do this **inside the new project folder** (e.g. `rsv-landingages/rsv-<slug>/`):

- [ ] `git init`
- [ ] `git branch -M main`
- [ ] `git submodule add https://github.com/FixMyBerlin/rsv-shared.git shared`
- [ ] Create the GitHub repo, add `origin`, `npm install`, then `git add -A`, commit, and push

Then continue with the Keystatic app and the rest of this checklist.

> Replace `<slug>` with the value you passed to `--slug` (e.g. `rs8`) and
> `<display-name>` with the human-readable name (e.g. `Radschnellweg 8`).

## 1. Keystatic GitHub App

The script cannot create the GitHub App for you — there is no public API for it.

- [ ] Follow [Keystatic GitHub mode setup](https://keystatic.com/docs/github-mode#setting-up-git-hub-mode)
      and create a new GitHub App on the `FixMyBerlin` org named
      **`rsv-lp-<slug>-keystatic`**. The app slug must match
      `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` in `.env` / `.env.example.*`.
- [ ] Grant the App access to the new `FixMyBerlin/rsv-<slug>` repo only.
- [ ] Copy the App's `Client ID`, `Client secret` and a freshly-generated
      `KEYSTATIC_SECRET` into:
  - The new repo's local `.env` (so `npm run dev` works locally).
  - **Bitwarden** (so the credentials don't get lost).
  - The Netlify site's environment variables (step 4).

## 2. Brand colors and map styling

The colors are still those of the template project.

- [ ] Update brand colors in [`config/styles.ts`](../../config/styles.ts) —
      `COLORS`, `COLORSCLASSES`, and `LINKCLASSES`.
- [ ] Update map styling in [`config/map.ts`](../../config/map.ts) —
      especially `MAPTILER_STYLE`.
- [ ] Re-run `npm run predev` to make sure `validateConfig.ts` is still happy
      after your edits.

## 3. Favicons, OG image, and CMS logo

- [ ] Replace favicons under [`public/icons/`](../../public/icons/) (keep the
      file names so `BASE_CONFIG.CMS_LOGO_PATH` keeps working — change it if
      you rename anything).
- [ ] Replace the OG / social-sharing image under
      [`public/social-sharing/`](../../public/social-sharing/).

## 4. Netlify site

- [ ] Create a new Netlify site for the repo (Add new site → Import from Git →
      `FixMyBerlin/rsv-<slug>`).
- [ ] Set the site name to **`cms-rsv-<slug>`** so the CMS lives at
      `https://cms-rsv-<slug>.netlify.app/keystatic` (this URL is hard-coded in
      the new repo's `README.md`).
- [ ] Add all variables from [`.env.example.netlify`](../../.env.example.netlify)
      to the site's environment (Site settings → Environment variables). Use
      the Keystatic credentials from step 1.
- [ ] Trigger a first deploy and confirm `/keystatic` loads.

## 5. Production URL & DNS

- [ ] Point the production domain at the Netlify site.
- [ ] Confirm the value of `BASE_CONFIG.PRODUCTION_URL` in
      [`config/config.ts`](../../config/config.ts) matches the live URL (the
      script set it from `--url`).
- [ ] Run `npm run predev` — `shared/scripts/validateConfig.ts` will fail
      loudly if any required `BASE_CONFIG` field is still missing or malformed.

## 6. Trassenscout integration (optional)

- [ ] Once a Trassenscout project exists for this corridor, set
      `BASE_CONFIG.TRASSENSCOUT_PROJECT_API_URL` in
      [`config/config.ts`](../../config/config.ts) to the real URL. The script
      pre-fills `https://trassenscout.de/api/projects/<trassenscout-slug>`.

## 7. Content

If you ran the script with `--clear-content`, every collection folder under
`src/content/` is empty (singletons like `homepageHero/index.yaml` are kept so
the schema stays valid).

- [ ] Create the actual content via the Keystatic CMS, or copy MDX/YAML files
      from the template project and adapt them.
- [ ] Replace the hero image at `src/content/homepageHero/image.jpg`.

## 8. Optional: Matomo tracking

- [ ] Enable `USE_MATOMO` in [`config/config.ts`](../../config/config.ts) and
      add the correct `siteId` in [`astro.config.mjs`](../../astro.config.mjs)
      once Matomo is set up for this site.

---

Once all the boxes above are ticked, do a fresh clone of the repo, run
`npm install && npm run predev && npm run dev`, and verify the homepage loads
without console errors.
