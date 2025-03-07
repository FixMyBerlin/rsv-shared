import { $ } from 'bun'
import colors from 'colors'
import data from '../package.json' with { type: 'json' }

console.log(colors.inverse.green('[rsv-shared] running npm link'))
const folder = '../rsv-shared'
await $`npm link`.cwd(folder)

console.log(colors.inverse.green('[rsv-shared] linking package'))
const packageName = data.name
await $`npm link ${packageName}`

console.log(colors.inverse.green('[rsv-shared] linking DONE'))
