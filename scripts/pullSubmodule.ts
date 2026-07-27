import { $ } from 'bun'
import {
  consoleLogSubjectError,
  consoleLogSubjectIntro,
  consoleLogSubjectNote,
  consoleLogSubjectOutroSuccess,
} from './utils/consoleLog'

export const pullSubmodule = async () => {
  $.env({ LANG: 'en_US.UTF-8' })
  consoleLogSubjectIntro('Ensuring latest submodule is pulled…')

  const submodulePath = './shared'

  // Step 1: Fail on uncommitted changes
  const { stdout: status } = await $`git status --porcelain`.cwd(submodulePath).quiet()
  const statusString = status.toString('utf-8')

  if (statusString.length > 0) {
    consoleLogSubjectError(
      'There are uncommitted changes in the submodule! Commit or stash them before updating.',
      {
        statusString,
      },
    )
    consoleLogSubjectNote('How: `cd shared`, `git status`, Commit as usual…')
    process.exit(1)
  }

  // Step 1b: Submodules are usually pinned to a commit (detached HEAD); pull needs a branch
  const { stdout: currentBranch } = await $`git rev-parse --abbrev-ref HEAD`
    .cwd(submodulePath)
    .quiet()
  if (currentBranch.toString('utf-8').trim() === 'HEAD') {
    await $`git checkout main`.cwd(submodulePath).quiet()
  }

  // Step 2: Update the submodule (rebase). Bun throws on non-zero exit — that is the
  // real failure signal. Do not parse stdout: successful pulls also print Fast-forward /
  // rebase summaries that are not "Already up to date."
  try {
    await $`git pull --rebase`.cwd(submodulePath).quiet()
  } catch (error) {
    consoleLogSubjectError('Pulling remote changes failed. Please update manually.', {
      error: error instanceof Error ? error.message : String(error),
    })
    process.exit(1)
  }

  consoleLogSubjectOutroSuccess(
    'Latest submodule is pulled!',
    '(But not committed to the website repo, yet.)',
  )
}
