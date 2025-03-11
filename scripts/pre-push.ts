import { commitSubmoduleInWebsite } from './commitSubmoduleInWebsite'
import { exitWhenRepushNeeded } from './exitWhenRepushNeeded'
import { pullSubmodule } from './pullSubmodule'
import { pushSubmodule } from './pushSubmodule'

async function main() {
  await pullSubmodule()
  await pushSubmodule()
  await commitSubmoduleInWebsite()
  await exitWhenRepushNeeded()
}

main()
