import { commitSubmoduleInWebsite } from './commitSubmoduleInWebsite'
import { ensureSubmodulePush } from './ensureSubmodulePush'
import { enshureUpdatedSubmodules } from './ensureUpdatedSubmodule'

async function main() {
  await enshureUpdatedSubmodules()
  await ensureSubmodulePush()
  await commitSubmoduleInWebsite()
}

main()
