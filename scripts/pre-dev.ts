import { commitSubmoduleInWebsite } from './commitSubmoduleInWebsite'
import { pullSubmodule } from './pullSubmodule'
import { validateConfig } from './validateConfig'

async function main() {
  await pullSubmodule()
  await commitSubmoduleInWebsite()
  validateConfig()
}

main()
