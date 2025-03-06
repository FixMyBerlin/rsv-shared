import { $ } from 'bun'
import colors from 'colors'

console.log(colors.inverse.yellow('[rsv-shared] Ensuring rsv-shared has no pending changes...'))

const packageFolder = '../rsv-shared'

// Step 1: Check for uncommitted changes (staged or unstaged)
const { stdout: status } = await $`git status --porcelain`.cwd(packageFolder).quiet()
const statusString = status.toString('utf-8')

if (statusString.length > 0) {
  console.log(
    colors.inverse.red(
      '[rsv-shared] There are uncommitted changes! Commit or stash them before pushing.',
    ),
    statusString,
  )
  process.exit(1)
}

// Step 2: Check for unpushed commits
const { stderr: pushStatus } = await $`git push --dry-run`.cwd(packageFolder).quiet()
const pushStatusString = pushStatus.toString('utf-8')

if (!pushStatusString.includes('Everything up-to-date')) {
  console.log(
    colors.inverse.red(
      '[rsv-shared] rsv-shared has unpushed commits! Push them before pushing the website.',
    ),
    pushStatusString,
  )
  process.exit(1)
}

console.log(colors.inverse.green('[rsv-shared] Everything is clean and pushed. All good!'))
