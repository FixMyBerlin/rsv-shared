import { commitSubmoduleInWebsite } from './commitSubmoduleInWebsite'
import { pullSubmodule } from './pullSubmodule'
import { pushSubmodule } from './pushSubmodule'

async function main() {
  await pullSubmodule()
  await pushSubmodule()
  await commitSubmoduleInWebsite()
}

main()
