#!/usr/bin/env bun
/**
 * Bootstrap a new RSV landing-page repo from the current one.
 *
 * Copies the current website repo (assumed to be `rsv-rs21` or any other
 * `rsv-*` template) into a sibling folder `rsv-<slug>`, rewrites all
 * project-specific values. In the new folder you run `git init`, add `rsv-shared`
 * as the `shared/` submodule, create the GitHub repo, `npm install`, then commit and push.
 *
 * Manual follow-ups are listed in `shared/docs/NEW-PROJECT.md` and printed at
 * the end of the run.
 *
 * Usage:
 *   bun ./shared/scripts/new-project.ts \
 *     --slug rs8 \
 *     --cms-name RS8 \
 *     --display-name "Radschnellweg 8" \
 *     --url https://rs8.example.de \
 *     [--trassenscout-slug rs8] \
 *     [--clear-content]
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import {
  consoleLogSubjectError,
  consoleLogSubjectIntro,
  consoleLogSubjectNote,
  consoleLogSubjectOutroSuccess,
  consoleLogSubjectWarning,
} from './utils/consoleLog'

/** Top-level names to skip when copying the template (same intent as the old rsync excludes). */
const COPY_EXCLUDE_NAMES = new Set([
  '.git',
  '.gitmodules',
  'node_modules',
  '.astro',
  'dist',
  '.netlify',
  'shared',
  '.DS_Store',
])

function copyTemplateTree(src: string, dest: string) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (COPY_EXCLUDE_NAMES.has(entry.name)) continue
    const from = join(src, entry.name)
    const to = join(dest, entry.name)
    if (entry.isDirectory()) {
      copyTemplateTree(from, to)
    } else if (entry.isFile()) {
      copyFileSync(from, to)
    } else if (entry.isSymbolicLink()) {
      symlinkSync(readlinkSync(from), to)
    }
  }
}

const USAGE = `
Usage:
  bun ./shared/scripts/new-project.ts \\
    --slug <slug> \\
    --cms-name <CMS_NAME> \\
    --display-name "<Display Name>" \\
    --url <https://...> \\
    [--trassenscout-slug <slug>] \\
    [--clear-content]

Flags:
  --slug                 Short id used for folder, repo, Keystatic app slug, e.g. 'rs8'
  --cms-name             BASE_CONFIG.CMS_NAME, e.g. 'RS8'
  --display-name         Pretty name for README + META.title, e.g. 'Radschnellweg 8'
  --url                  BASE_CONFIG.PRODUCTION_URL, e.g. 'https://rs8.example.de'
  --trassenscout-slug    Optional, defaults to --slug
  --clear-content        Wipe src/content/* collection items (singletons preserved)
`.trim()

function fail(message: string): never {
  consoleLogSubjectError(message)
  process.exit(1)
}

function parseFlags() {
  const { values } = parseArgs({
    options: {
      slug: { type: 'string' },
      'cms-name': { type: 'string' },
      'display-name': { type: 'string' },
      url: { type: 'string' },
      'trassenscout-slug': { type: 'string' },
      'clear-content': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    allowPositionals: false,
    strict: true,
  })

  if (values.help) {
    console.log(USAGE)
    process.exit(0)
  }

  const required = {
    '--slug': values.slug,
    '--cms-name': values['cms-name'],
    '--display-name': values['display-name'],
    '--url': values.url,
  }
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (missing.length > 0) {
    console.error(USAGE)
    fail(`Missing required flag(s): ${missing.join(', ')}`)
  }

  const slug = values.slug!
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
    fail(`--slug must be lowercase alphanumeric with optional dashes; got '${slug}'`)
  }

  const url = values.url!
  if (!/^https?:\/\/[^\s]+$/.test(url)) {
    fail(`--url must be an http(s) URL; got '${url}'`)
  }

  return {
    slug,
    cmsName: values['cms-name']!,
    displayName: values['display-name']!,
    url,
    trassenscoutSlug: values['trassenscout-slug'] || slug,
    clearContent: values['clear-content'] === true,
  }
}

/** Single-quote-escape for embedding user input into a TS string literal. */
function tsString(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

async function preflight(opts: { cwd: string; targetDir: string }) {
  consoleLogSubjectIntro('Pre-flight checks…')

  // The submodule convention from shared/README.md: all repos live in `rsv-landingages/`.
  const parentName = basename(dirname(opts.cwd))
  if (parentName !== 'rsv-landingages') {
    fail(
      `Refusing to run: expected the current directory's parent to be 'rsv-landingages' ` +
        `(per shared/README.md), but parent is '${parentName}'.`,
    )
  }

  // Sanity-check that we're actually inside a website repo.
  for (const required of ['package.json', 'config/config.ts', 'astro.config.mjs', 'shared']) {
    if (!existsSync(join(opts.cwd, required))) {
      fail(`Current directory does not look like an RSV website repo: missing '${required}'.`)
    }
  }

  if (existsSync(opts.targetDir)) {
    fail(`Target directory already exists: ${opts.targetDir}`)
  }

  consoleLogSubjectOutroSuccess('Pre-flight OK.')
}

async function copyTemplate(cwd: string, targetDir: string) {
  consoleLogSubjectIntro(`Copying template ${basename(cwd)} -> ${basename(targetDir)}…`)

  // Pure Node copy (no `rsync` on PATH required). `shared/` is omitted — add it via `git submodule add` yourself.
  copyTemplateTree(resolve(cwd), resolve(targetDir))

  consoleLogSubjectOutroSuccess('Template copied.')
}

function rewriteProjectFiles(
  targetDir: string,
  opts: {
    slug: string
    cmsName: string
    displayName: string
    url: string
    trassenscoutSlug: string
  },
) {
  consoleLogSubjectIntro('Rewriting project-specific files…')

  // package.json — give it a distinct name per project so it's identifiable in `npm ls` etc.
  const pkgPath = join(targetDir, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { name?: string } & Record<
    string,
    unknown
  >
  pkg.name = `rsv-${opts.slug}`
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  // config/config.ts — regenerate from scratch so the template is always identical
  // regardless of which source repo was used as the template.
  const configPath = join(targetDir, 'config', 'config.ts')
  const configContent = `export const META = {
  title: ${tsString(opts.displayName)},
  description: ${tsString(`TODO: SEO description for ${opts.displayName}.`)},
}

/** @desc Enable/disable matomo tracking */
export const USE_MATOMO: boolean = false

export const BASE_CONFIG = {
  CMS_NAME: ${tsString(opts.cmsName)},
  CMS_LOGO_PATH: '/icons/icon-48x48.png',
  GITHUB_REPO_NAME: ${tsString(`rsv-${opts.slug}`)},
  PRODUCTION_URL: ${tsString(opts.url)},
  META,
  USE_MATOMO,
  TRASSENSCOUT_PROJECT_API_URL: [${tsString(`https://trassenscout.de/api/projects/${opts.trassenscoutSlug}`)}],
}
`
  writeFileSync(configPath, configContent)

  // README.md
  const readmePath = join(targetDir, 'README.md')
  const readmeContent = `# About ${opts.displayName}

- [Website](${opts.url})
- [CMS Keystatic at Netlify](https://cms-rsv-${opts.slug}.netlify.app/keystatic)

# Project structure

## \`/config\`

Site specific data for styling and content (that is not managed by the CMS).

**Validation:** Those files are [validated using zod](shared/scripts/validateConfig.ts) to make sure all other RSV sites have the same config structure so the shared components can rely on them.

## \`/shared\`

See https://github.com/FixMyBerlin/rsv-shared

## \`/src/content\`

Content managed by Keystatic / the CMS. Different for each project of this kind.

## \`/src/pages\`

Astro Pages that take content from Keystatic and render it. Those pages should be the same for all sites of this kind.

# Notes

- RSS feeds are drafted but not implemented, yet. We should add them once we add a blog to the page.

# Bootstrap follow-ups

See [\`shared/docs/NEW-PROJECT.md\`](shared/docs/NEW-PROJECT.md) for the manual checklist (Keystatic GitHub App, Netlify, DNS, brand styles, favicons).
`
  writeFileSync(readmePath, readmeContent)

  // .env — keep structure but clear any dev secrets carried over from the template,
  // and point the Keystatic app slug at the new project.
  const envPath = join(targetDir, '.env')
  if (existsSync(envPath)) {
    let env = readFileSync(envPath, 'utf-8')
    env = env.replace(/^KEYSTATIC_GITHUB_CLIENT_ID=.*$/m, 'KEYSTATIC_GITHUB_CLIENT_ID=')
    env = env.replace(/^KEYSTATIC_GITHUB_CLIENT_SECRET=.*$/m, 'KEYSTATIC_GITHUB_CLIENT_SECRET=')
    env = env.replace(/^KEYSTATIC_SECRET=.*$/m, 'KEYSTATIC_SECRET=')
    env = env.replace(
      /^PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=.*$/m,
      `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=rsv-lp-${opts.slug}-keystatic # https://github.com/apps/rsv-lp-${opts.slug}-keystatic`,
    )
    writeFileSync(envPath, env)
  }

  // .env.example.* files — point the Keystatic app slug at the new project.
  for (const file of ['.env.example.local', '.env.example.netlify']) {
    const p = join(targetDir, file)
    if (!existsSync(p)) continue
    const txt = readFileSync(p, 'utf-8').replace(
      /rsv-lp-[a-z0-9-]+-keystatic/g,
      `rsv-lp-${opts.slug}-keystatic`,
    )
    writeFileSync(p, txt)
  }

  consoleLogSubjectOutroSuccess('Project files rewritten.')
}

function clearContentCollections(targetDir: string) {
  consoleLogSubjectIntro('Clearing content collections (singletons preserved)…')

  const contentRoot = join(targetDir, 'src', 'content')
  if (!existsSync(contentRoot)) {
    consoleLogSubjectWarning(`No src/content/ found at ${contentRoot}, skipping.`)
    return
  }

  for (const entry of readdirSync(contentRoot)) {
    const full = join(contentRoot, entry)
    if (!statSync(full).isDirectory()) continue
    const children = readdirSync(full)
    const hasIndex = children.some((c) => c.startsWith('index.'))
    if (hasIndex) {
      consoleLogSubjectNote(`  - ${entry}: singleton, left untouched`)
      continue
    }
    let removed = 0
    for (const c of children) {
      if (c === '.gitkeep') continue
      rmSync(join(full, c), { recursive: true, force: true })
      removed += 1
    }
    if (!existsSync(join(full, '.gitkeep'))) writeFileSync(join(full, '.gitkeep'), '')
    consoleLogSubjectNote(`  - ${entry}: cleared (${removed} removed)`)
  }

  consoleLogSubjectOutroSuccess('Content collections cleared.')
}

function printChecklist(targetDir: string, templateCwd: string, opts: { slug: string }) {
  console.log('\n' + '='.repeat(72))
  console.log(`Next steps — manual follow-ups for rsv-${opts.slug}`)
  console.log('='.repeat(72) + '\n')

  const checklistInNew = join(targetDir, 'shared', 'docs', 'NEW-PROJECT.md')
  const checklistInTemplate = join(templateCwd, 'shared', 'docs', 'NEW-PROJECT.md')
  const checklistPath = existsSync(checklistInNew) ? checklistInNew : checklistInTemplate

  if (existsSync(checklistPath)) {
    console.log(readFileSync(checklistPath, 'utf-8'))
  } else {
    consoleLogSubjectWarning(
      `Checklist not found at ${checklistPath}. ` +
        'Ensure this repo has the `shared` submodule checked out, or open `shared/docs/NEW-PROJECT.md` on GitHub.',
    )
  }

  console.log('\n' + '='.repeat(72))
  console.log(`Done. New project lives at: ${targetDir}`)
  console.log('='.repeat(72))
}

async function main() {
  const opts = parseFlags()
  const cwd = process.cwd()
  const targetDir = resolve(cwd, '..', `rsv-${opts.slug}`)

  await preflight({ cwd, targetDir })

  consoleLogSubjectNote(
    [
      `Bootstrapping new RSV project rsv-${opts.slug}`,
      `  Source:         ${cwd}`,
      `  Target:         ${targetDir}`,
      `  CMS_NAME:       ${opts.cmsName}`,
      `  Display name:   ${opts.displayName}`,
      `  Production URL: ${opts.url}`,
      `  Trassenscout:   ${opts.trassenscoutSlug}`,
      `  Clear content:  ${opts.clearContent}`,
    ].join('\n'),
  )

  await copyTemplate(cwd, targetDir)
  rewriteProjectFiles(targetDir, opts)
  if (opts.clearContent) clearContentCollections(targetDir)
  consoleLogSubjectNote(
    [
      'Next (manual), in the new repo directory:',
      '  git init',
      '  git branch -M main   # if your default branch is not already `main`',
      '  git submodule add https://github.com/FixMyBerlin/rsv-shared.git shared',
      '  Create the GitHub repo (e.g. FixMyBerlin/rsv-' + opts.slug + '), add remote `origin`,',
      '  npm install',
      '  git add -A && git commit -m "Initial commit from template" && git push -u origin main',
    ].join('\n'),
  )
  printChecklist(targetDir, cwd, opts)
}

main().catch((err) => {
  consoleLogSubjectError('new-project.ts failed.', { error: String(err) })
  process.exit(1)
})
