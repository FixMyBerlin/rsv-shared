import { $ } from 'bun'
import colors from 'colors'

console.log(colors.inverse.green('[rsv-shared] ensure rsv-shared has no pending changes'))
const folder = '../rsv-shared'
const { stderr } = await $`git push --dry-run`.cwd(folder).quiet()
const response = stderr.toString('utf-8')

if (!response.includes('Everything up-to-date')) {
  console.log(
    colors.inverse.red(
      '[rsv-shared] rsv-shared has unpushed commits! Push it before pushing the website.',
    ),
  )
  process.exit(1)
}

console.log(colors.inverse.green('[rsv-shared] everything is pushed, all good'))
