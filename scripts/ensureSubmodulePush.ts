import { $ } from 'bun'
import {
  consoleLogSubjectError,
  consoleLogSubjectIntro,
  consoleLogSubjectOutroSuccess,
} from './utils/consoleLog'

export const ensureSubmodulePush = async () => {
  consoleLogSubjectIntro('Ensuring submodule is pushed and commited…')

  const packageFolder = './shared'

  // Step 1: Check for uncommitted changes in submodule (staged or unstaged)
  const { stdout: status } = await $`git status --porcelain`.cwd(packageFolder).quiet()
  const statusString = status.toString('utf-8')

  if (statusString.length > 0) {
    consoleLogSubjectError('There are uncommitted changes! Commit or stash them before pushing.', {
      statusString,
    })
    process.exit(1)
  }

  // Step 2: Check for unpushed commits in submodule
  const { stderr: pushStatus } = await $`git push --dry-run`.cwd(packageFolder).quiet()
  const pushStatusString = pushStatus.toString('utf-8')

  if (!pushStatusString.includes('Everything up-to-date')) {
    consoleLogSubjectError('Submodule has unpushed commits! Push them before pushing the webite.', {
      pushStatusString,
    })
    process.exit(1)
  }

  consoleLogSubjectOutroSuccess('submodule is pushed and commited!')
}
