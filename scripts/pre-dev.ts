import { commitSubmoduleInWebsite } from './commitSubmoduleInWebsite'
import { enshureUpdatedSubmodules } from './ensureUpdatedSubmodule'
import { validateConfig } from './validateConfig'

async function main() {
  await enshureUpdatedSubmodules()
  await commitSubmoduleInWebsite()
  validateConfig()
}

main()
