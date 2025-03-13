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

  // Step 2: Update the submodule (rebase)
  const { stdout: pullStatus, stdout: pullError } = await $`git pull --rebase`
    .cwd(submodulePath)
    .quiet()
  const pullStatusString = pullStatus.toString('utf-8')

  if (
    !pullStatusString.includes('Erfolgreich Rebase ausgeführt') &&
    !pullStatusString.includes('Current branch main is up to date.') &&
    !pullStatusString.includes('Already up to date.')
  ) {
    consoleLogSubjectError('Pulling remote changes failed. Please update manually.', {
      pullStatusString,
      pullError: pullError.toString('utf-8'),
    })
    process.exit(1)
  }

  consoleLogSubjectOutroSuccess(
    'Latest submodule is pulled!',
    '(But not commited to the website repo, yet.)',
  )
}
