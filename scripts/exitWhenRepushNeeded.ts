import { $ } from 'bun'
import { consoleLogSubjectWarning } from './utils/consoleLog'

export const exitWhenRepushNeeded = async () => {
  $.env({ LANG: 'en_US.UTF-8' })

  // Step: Check for unpushed changes
  const { stderr: pushStatus } = await $`git push --dry-run --no-verify`.quiet()
  const pushStatusString = pushStatus.toString('utf-8')

  if (!pushStatusString.includes('Everything up-to-date')) {
    consoleLogSubjectWarning(
      'Pushed stopped. You need to re-trigger the push in order to push all changes.',
      'The pre-push script created a new commit.',
      'This new commit is not part of what is pushed right now.',
      'We need to stop the current push and restart it in order to push everything.',
    )
    process.exit(1)
  }
}
