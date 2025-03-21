import { $ } from 'bun'
import {
  consoleLogSubjectError,
  consoleLogSubjectIntro,
  consoleLogSubjectOutroSuccess,
} from './utils/consoleLog'

type Props = {
  /** @desc We commit the submodule here. During `pre-dev` that is all we need to do (`false`). But during `per-push` we need to exit in order ro restart the push (`true`). See log notice for more. */
  exitWhenSubmoduleNotPushed: boolean
}

export const commitSubmoduleInWebsite = async ({ exitWhenSubmoduleNotPushed }: Props) => {
  $.env({ LANG: 'en_US.UTF-8' })
  consoleLogSubjectIntro('Commit submodule on website repo…')

  // Step 1: Check that nothing is staged
  const { stdout: status } = await $`git diff --cached`.quiet()
  const statusString = status.toString('utf-8')

  if (statusString.length > 0) {
    consoleLogSubjectError(
      'There are staged changes in the website repo! Commit them before a commit is made that updates the submodule on the website repo.',
      {
        statusString,
      },
    )
    process.exit(1)
  }

  // Step GUARD: Check if there are changes in the "shared" directory
  const { stdout: sharedStatus } = await $`git diff HEAD -- "shared"`.quiet()
  const sharedStatusString = sharedStatus.toString('utf-8')

  if (sharedStatusString.length === 0) {
    consoleLogSubjectOutroSuccess('No changes in "shared" directory. Skipping commit.')
    return
  }

  // Step 2: git add
  const { stdout: result } = await $`git add shared`.quiet()
  const resultString = result.toString('utf-8')

  if (resultString.length > 0) {
    consoleLogSubjectError('UNCLEAR ERROR with git add shared.', {
      resultString,
    })
    process.exit(1)
  }

  // Step 3: Commit
  const commitMessage = [
    'Update `rsv-shared` to latest version',
    'Done by `rsv-shared/shared/scripts/commitSubmoduleInWebsite.ts`',
    'https://github.com/FixMyBerlin/rsv-shared/',
  ].join('\n\n')
  const { stderr: pushStatus } = await $`git commit -m "${commitMessage}"`.quiet()
  const pushStatusString = pushStatus.toString('utf-8')

  if (statusString.length > 0) {
    consoleLogSubjectError('UNCLEAR ERROR with git commit', { pushStatusString })
    process.exit(1)
  }

  consoleLogSubjectOutroSuccess('Submodule committed', '(But not pushed, yet.)')

  // Step 4: EXIT so we can restart… – but only in some szenarios (`exitWhenSubmoduleNotPushed`)
  if (exitWhenSubmoduleNotPushed === true) {
    consoleLogSubjectError(`
Push stopped. You need to re-trigger the push to include all changes.
The pre-push script created a new commit to ensure the latest submodule is included.
This new commit is not part of the current push.
Therefore, we stopped the current push to restart it and include everything.`)
    process.exit(1)
  }
}
