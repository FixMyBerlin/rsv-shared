import { $ } from 'bun'
import colors from 'colors'
import data from '../package.json' with { type: 'json' }

console.log(colors.inverse.yellow('[rsv-shared] running npm link'))
const packageFolder = '../rsv-shared'
await $`npm link`.cwd(packageFolder).quiet()

console.log(colors.gray('[rsv-shared] linking package'))
const packageName = data.name
await $`npm link ${packageName}`.quiet()

console.log(colors.inverse.green('[rsv-shared] linking DONE'))
