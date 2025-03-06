# FMC RSV Shared Components

Internal collection of astro and react components that are shared between RSV website repos.

## Usage

Each component needs to be exported in `index.ts`.
They can then be imported in the website repo like `import { MyComponent, MyReactComponent } from '@fmc/rsv-shared-components'`

## General setup

### Required folder structure

The shared repo and website folder need to be in one (local) folder to group them.

`/Development/rsv-landingages/rsv-shared`
`/Development/rsv-landingages/rsv-rs8`
`/Development/rsv-landingages/rsv-frm7`

**VS Code:**

Open `/Development/rsv-landingages` in VS Code to access all repos at the same time.

### Symlink shared package (automated)

See [`link-packages.ts`](./scripts/link-packages.ts).

Each website repo has a `predev` script that will (renew the) link to `rsv-shared`.

```
  "predev": "npm run link-rsv-shared",
  "link-rsv-shared": "bun ../rsv-shared/scripts/link-packages.ts",
```

Those links do not change the websites' `package.json`; they only overwrite the locale package in `node_modules` with a symlink to the local folder.

### Ensure shared package is pushed (automated)

See [`ensure-push.ts`](./scripts/ensure-push.ts).

Each website repo runs a script via husky `pre-push` which ensures that all changes of the local package are pushed to origin.
If not, the website repo push fails.

We do this to make sure the website builds with the same data that we run locally.

### Ensure website repo uses latest shared package (automated)

See [`update-package.ts`](./scripts/update-package.ts).

Since we don't publish rsv-shared to NPM, we cannot rely on version ranges to install the latest package.
Instead each website repo runs a second script via husky `pre-push` which installs the latest version of the package and commits the change.
