import { commitSubmoduleInWebsite } from './commitSubmoduleInWebsite'
import { ensureSubmodulePush } from './ensureSubmodulePush'

async function main() {
  await ensureSubmodulePush()
  await commitSubmoduleInWebsite()
}

main()
