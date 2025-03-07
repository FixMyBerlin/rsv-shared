import { $ } from 'bun'
import colors from 'colors'

console.log(
  colors.inverse.yellow(
    '[rsv-website] Ensure that the websites uses the latest version of the package...',
  ),
)

const websiteFolder = process.cwd()

// Step 0: Check for uncommitted changes because this script want to commit the newest package next, so we want a clean git stage.
const { stdout: status } = await $`git status --porcelain`.cwd(websiteFolder).quiet()

if (status.toString('utf-8').length > 0) {
  console.log(
    colors.inverse.red(
      '[rsv-website] There are uncommitted changes in the website repo! Commit or stash them first…',
    ),
    status,
  )
  process.exit(1)
}

// Step 1: Install latest version of the shared package. This should only update the package-lock.
// Those github packages are not versioned via package.json but only via the commit that was used when installing it last.
console.log(colors.gray('[rsv-website] Installing latest version of rsv-shared...'))
await $`npm i https://github.com/FixMyBerlin/rsv-shared.git`.cwd(websiteFolder).quiet()

// Step 2: Check that only package-lock.json changes
// We want to commit this next…
const { stdout: statusAfterInstall } = await $`git status --porcelain`.cwd(websiteFolder).quiet()
const statusAfterInstallString = statusAfterInstall.toString('utf-8')

// Step 3: Commit updated package if needed
const nothingChanged = statusAfterInstallString.length === 0
if (nothingChanged) {
  // Latest package => Do nothing
  console.log(colors.inverse.green('[rsv-website] Package already up to date.'))
} else {
  // Package needs to be updated

  // Step 4: Check for unexpected changes
  const checkPackageLockWasChanged = statusAfterInstallString.includes('package-lock.json')
  const checkOnlyOneFileChanged = statusAfterInstallString.split('\n').length > 2
  if (!checkPackageLockWasChanged || checkOnlyOneFileChanged) {
    console.log(
      colors.inverse.red(
        '[rsv-website] Unexpected changes detected! Only package-lock.json should have changed.',
      ),
      statusAfterInstallString,
    )
    process.exit(1)
  }

  // Step 5: Commit the package-lock.json with commit message "Update rsv-shared to latest version"
  console.log(colors.gray('[rsv-website] Committing package-lock.json...'))
  await $`git add package-lock.json`.cwd(websiteFolder).quiet()
  const commitMessage =
    'Update rsv-shared to latest version\n\nDone by \`rsv-shared/scripts/update-package.ts\`'
  await $`git commit -m "${commitMessage}"`.cwd(websiteFolder).quiet()

  console.log(
    colors.inverse.green('[rsv-website] Successfully updated shared package in website repo'),
    websiteFolder,
  )

  // Step 6: Restart commit process
  console.log(colors.inverse.red('[rsv-website] You habe to `git push` again'))
  console.log(
    colors.gray(
      '[rsv-website] The script just pushed the latest package during the pre-push hook. That would not get pushed because it was added after `git push` was called. We therefore fail the process so you can restart it.',
    ),
  )
  process.exit(1)
}
