# FMC RSV Shared Components

A folder of components and configuration that is shared between RSV website repos via git submodules.

## Intro

> [!WARNING]
> Submodules are tricky!

### General setup

Put the `rsv-shared` repo and all website repos in a local `rsv-landingages` folder.
The scripts will rely on this structure.

- `/Development/rsv-landingages/rsv-shared` – [Repo with shared code](https://github.com/FixMyBerlin/rsv-shared) that we access via git submodules
- `/Development/rsv-landingages/rsv-rs8` - the `/shared` folder hold the code of the `rsv-shared` repo as a git submodule
- `/Development/rsv-landingages/rsv-frm7` - dito

### Submodules know how

- Submodules are only updated when pulled (from inside the website repo).
- The commit that the Submodule represents is checked in via a commit in the website repo.
- In order to update a Submodule, you need to pull it and also commit this pull in the website repo.

## Workflow

### General

- We never work on the rsv-shared repo directly.
- Instead we work on the website repo, then check in changes to the submodule from within that repo.
- Afterwards we have to sync those changes to the other repos.

### `predev`: Ensure latest submodule

Before we start the dev server, we ensure that our submodule is clean (everything is comitted) and fetch the latest submodule code.
See [`pre-dev.ts`](./scripts/pre-dev.ts), triggered by `npm run predev`

### `pre-push` (Husky): Ensure a neat submodule

Before we push the website project, we ensure that our submodule is clean (everythign is committed) and pushed.
See [`pre-push.ts`](./scripts/pre-push.ts), triggered by Husky's [`pre-push`](../.husky/pre-push)

### Update all projects

After we changed something, we should update all other projects.
(TODO) ~We have a helper scripts that will traverse the `rsv-landingages` folders.~

<!--
#### TODO: `bun run shared/scripts/all-update.ts`

- Check the state of the repo (eg. no pending changes)
- Fetch and commit the submodule

#### TODO: `bun run shared/scripts/all-push.ts`

- Run npm run check on each Repo.
- Push changes.
-->

## Initialize

`git submodule add https://github.com/FixMyBerlin/rsv-shared.git shared`
