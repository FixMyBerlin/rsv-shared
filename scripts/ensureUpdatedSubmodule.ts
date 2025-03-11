import { $ } from 'bun'
import colors from 'colors'

async function main() {
  console.log(colors.inverse.yellow('[rsv-shared] Ensuring submodule is updated...'))

  const submodulePath = './shared'

  // Step 1: Fail on uncommitted changes
  const { stdout: status } = await $`git status --porcelain`.cwd(submodulePath).quiet()
  const statusString = status.toString('utf-8')

  if (statusString.length > 0) {
    console.log(
      colors.inverse.red(
        '[rsv-shared] There are uncommitted changes in the submodule! Commit or stash them before updating.',
      ),
      { statusString },
    )
    console.log(colors.gray('[rsv-shared] How: `cd shared`, `git status`, Commit as usual'))
    process.exit(1)
  }

  // Step 2: Warn about unpushed changes
  const { stderr: pushStatus } = await $`git push --dry-run`.cwd(submodulePath).quiet()
  const pushStatusString = pushStatus.toString('utf-8')

  if (!pushStatusString.includes('Everything up-to-date')) {
    console.log(
      colors.inverse.yellow('[rsv-shared] There are unpushed commits in the submodule.'),
      'We will rebase them if needed.',
    )
  }

  // Step 3: Update the submodule (rebase)
  const { stdout: pullStatus } = await $`git pull`.cwd(submodulePath).quiet()
  const pullStatusString = pullStatus.toString('utf-8')

  if (
    !pullStatusString.includes('Erfolgreich Rebase ausgeführt') &&
    !pullStatusString.includes('Aktueller Branch main ist auf dem neuesten Stand')
  ) {
    console.log(
      colors.inverse.red('[rsv-shared] Pulling remote changes failed. Please update manually.'),
      { pullStatusString },
    )
    process.exit(1)
  }

  console.log(colors.inverse.green('[rsv-shared] Submodule update complete!'))
}

main()
