import { $ } from 'bun'
import { consoleLogSubjectNote } from './utils/consoleLog'

export const exitWhenRepushNeeded = async () => {
  $.env({ LANG: 'en_US.UTF-8' })

  // Step: Check for unpushed changes
  const { stderr: pushStatus } = await $`git push --dry-run --no-verify`.quiet()
  const pushStatusString = pushStatus.toString('utf-8')

  if (!pushStatusString.includes('Everything up-to-date')) {
    consoleLogSubjectNote(`
      We will no push again with --no-verify because the pre-push check
      added a new commit which we now need to push as well.
    `)
    await $`git push --no-verify`.quiet()
  }
}
